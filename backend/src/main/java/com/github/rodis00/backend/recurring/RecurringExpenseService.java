package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.category.CategoryService;
import com.github.rodis00.backend.entity.RecurringExpenseEntity;
import com.github.rodis00.backend.entity.RecurringOccurrenceEntity;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.Expense;
import com.github.rodis00.backend.expense.ExpenseService;
import com.github.rodis00.backend.member.MemberService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Recurring expenses (rent, loan, subscriptions). Every month each active rule is proposed
 * as a pending expense; the user confirms it (optionally with a different amount) or skips it.
 * Months that were not handled stay pending for up to a year, so nothing is lost.
 */
@Service
public class RecurringExpenseService {

    static final int MONTHS_BACK = 11;

    private final RecurringExpenseRepository recurringRepository;
    private final RecurringOccurrenceRepository occurrenceRepository;
    private final CategoryService categoryService;
    private final MemberService memberService;
    private final ExpenseService expenseService;

    public RecurringExpenseService(
            RecurringExpenseRepository recurringRepository,
            RecurringOccurrenceRepository occurrenceRepository,
            CategoryService categoryService,
            MemberService memberService,
            ExpenseService expenseService
    ) {
        this.recurringRepository = recurringRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.categoryService = categoryService;
        this.memberService = memberService;
        this.expenseService = expenseService;
    }

    public List<RecurringExpenseEntity> getAll() {
        return recurringRepository.findAllByOrderByTitleAsc();
    }

    public RecurringExpenseEntity get(Long id) {
        return recurringRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Recurring expense not found."));
    }

    public RecurringExpenseEntity save(RecurringExpense request) {
        return recurringRepository.save(fill(new RecurringExpenseEntity(), request));
    }

    public RecurringExpenseEntity update(Long id, RecurringExpense request) {
        return recurringRepository.save(fill(get(id), request));
    }

    // expenses that were already added from the rule stay untouched
    @Transactional
    public void delete(Long id) {
        RecurringExpenseEntity rule = get(id);
        occurrenceRepository.deleteByRecurringId(id);
        recurringRepository.delete(rule);
    }

    public List<PendingOccurrenceDto> getPending(YearMonth current) {
        YearMonth earliest = current.minusMonths(MONTHS_BACK);
        List<PendingOccurrenceDto> pending = new ArrayList<>();

        for (RecurringExpenseEntity rule : recurringRepository.findAllByActiveTrueOrderByTitleAsc()) {
            YearMonth start = YearMonth.parse(rule.getStartMonth());
            if (start.isBefore(earliest)) {
                start = earliest;
            }
            for (YearMonth month = start; !month.isAfter(current); month = month.plusMonths(1)) {
                if (!occurrenceRepository.existsByRecurringIdAndPeriodMonth(rule.getId(), month.toString())) {
                    pending.add(PendingOccurrenceDto.of(rule, month.toString(), dateIn(rule, month)));
                }
            }
        }

        pending.sort(Comparator.comparing(PendingOccurrenceDto::getMonth)
                .thenComparing(PendingOccurrenceDto::getTitle));
        return pending;
    }

    @Transactional
    public ExpenseEntity confirm(
            Long id,
            String month,
            ConfirmRequest changes,
            String username,
            YearMonth current
    ) {
        RecurringExpenseEntity rule = get(id);
        YearMonth period = checkPending(rule, month, current);

        Expense expense = Expense.builder()
                .title(rule.getTitle())
                .price(changes != null && changes.getPrice() != null ? changes.getPrice() : rule.getPrice())
                .date(dateIn(rule, period))
                .categoryId(rule.getCategory().getId())
                .memberId(rule.getMember().getId())
                .paymentSource(rule.getPaymentSource())
                .usageAmount(changes != null && changes.getUsageAmount() != null
                        ? changes.getUsageAmount()
                        : rule.getUsageAmount())
                .description(rule.getDescription())
                .build();

        ExpenseEntity saved = expenseService.saveExpense(expense, username);
        markHandled(rule, period, OccurrenceStatus.CONFIRMED);
        return saved;
    }

    @Transactional
    public void skip(Long id, String month, YearMonth current) {
        RecurringExpenseEntity rule = get(id);
        YearMonth period = checkPending(rule, month, current);
        markHandled(rule, period, OccurrenceStatus.SKIPPED);
    }

    private YearMonth checkPending(RecurringExpenseEntity rule, String month, YearMonth current) {
        YearMonth period;
        try {
            period = YearMonth.parse(month);
        } catch (DateTimeParseException | NullPointerException e) {
            throw new InvalidRequestException("Month should look like 2025-03.");
        }

        if (period.isAfter(current)) {
            throw new InvalidRequestException("Future months cannot be confirmed yet.");
        }
        if (period.isBefore(YearMonth.parse(rule.getStartMonth()))) {
            throw new InvalidRequestException("This month is before the start of the recurring expense.");
        }
        if (!Boolean.TRUE.equals(rule.getActive())) {
            throw new InvalidRequestException("This recurring expense is not active.");
        }
        if (occurrenceRepository.existsByRecurringIdAndPeriodMonth(rule.getId(), period.toString())) {
            throw new InvalidRequestException("This month has already been confirmed or skipped.");
        }
        return period;
    }

    private void markHandled(RecurringExpenseEntity rule, YearMonth period, OccurrenceStatus status) {
        occurrenceRepository.save(
                RecurringOccurrenceEntity.builder()
                        .recurring(rule)
                        .periodMonth(period.toString())
                        .status(status)
                        .build()
        );
    }

    // the day is shortened in months that are shorter (e.g. 31 -> 28 in February)
    static LocalDateTime dateIn(RecurringExpenseEntity rule, YearMonth month) {
        int day = Math.min(rule.getDayOfMonth(), month.lengthOfMonth());
        return LocalDateTime.of(month.atDay(day), LocalTime.NOON);
    }

    private RecurringExpenseEntity fill(RecurringExpenseEntity rule, RecurringExpense request) {
        rule.setTitle(request.getTitle().trim());
        rule.setPrice(request.getPrice());
        rule.setCategory(categoryService.getCategory(request.getCategoryId()));
        rule.setMember(memberService.getMember(request.getMemberId()));
        rule.setPaymentSource(request.getPaymentSource());
        rule.setUsageAmount(request.getUsageAmount());
        rule.setDescription(request.getDescription());
        rule.setDayOfMonth(request.getDayOfMonth());
        rule.setStartMonth(request.getStartMonth());
        rule.setActive(request.getActive() == null || request.getActive());
        return rule;
    }
}
