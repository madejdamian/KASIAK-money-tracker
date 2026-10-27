package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.IncomeEntity;
import com.github.rodis00.backend.entity.RecurringDepositEntity;
import com.github.rodis00.backend.entity.RecurringDepositOccurrenceEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.income.DepositType;
import com.github.rodis00.backend.income.Income;
import com.github.rodis00.backend.income.IncomeService;
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
 * Recurring deposits (the regular transfer of a household member to the shared account). Every month
 * each active rule is proposed as a pending deposit; the user confirms it (optionally with a different
 * amount) or skips it. Months that were not handled stay pending for up to a year.
 */
@Service
public class RecurringDepositService {

    static final int MONTHS_BACK = 11;

    private final RecurringDepositRepository recurringRepository;
    private final RecurringDepositOccurrenceRepository occurrenceRepository;
    private final MemberService memberService;
    private final IncomeService incomeService;

    public RecurringDepositService(
            RecurringDepositRepository recurringRepository,
            RecurringDepositOccurrenceRepository occurrenceRepository,
            MemberService memberService,
            IncomeService incomeService
    ) {
        this.recurringRepository = recurringRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.memberService = memberService;
        this.incomeService = incomeService;
    }

    public List<RecurringDepositEntity> getAll() {
        return recurringRepository.findAllByOrderByTitleAsc();
    }

    public RecurringDepositEntity get(Long id) {
        return recurringRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Recurring deposit not found."));
    }

    public RecurringDepositEntity save(RecurringDeposit request) {
        return recurringRepository.save(fill(new RecurringDepositEntity(), request));
    }

    public RecurringDepositEntity update(Long id, RecurringDeposit request) {
        return recurringRepository.save(fill(get(id), request));
    }

    // deposits that were already added from the rule stay untouched
    @Transactional
    public void delete(Long id) {
        RecurringDepositEntity rule = get(id);
        occurrenceRepository.deleteByRecurringId(id);
        recurringRepository.delete(rule);
    }

    public List<PendingDepositDto> getPending(YearMonth current) {
        YearMonth earliest = current.minusMonths(MONTHS_BACK);
        List<PendingDepositDto> pending = new ArrayList<>();

        for (RecurringDepositEntity rule : recurringRepository.findAllByActiveTrueOrderByTitleAsc()) {
            YearMonth start = YearMonth.parse(rule.getStartMonth());
            if (start.isBefore(earliest)) {
                start = earliest;
            }
            for (YearMonth month = start; !month.isAfter(current); month = month.plusMonths(1)) {
                if (!occurrenceRepository.existsByRecurringIdAndPeriodMonth(rule.getId(), month.toString())) {
                    pending.add(PendingDepositDto.of(rule, month.toString(), dateIn(rule, month)));
                }
            }
        }

        pending.sort(Comparator.comparing(PendingDepositDto::getMonth)
                .thenComparing(PendingDepositDto::getTitle));
        return pending;
    }

    @Transactional
    public IncomeEntity confirm(
            Long id,
            String month,
            ConfirmDepositRequest changes,
            String username,
            YearMonth current
    ) {
        RecurringDepositEntity rule = get(id);
        YearMonth period = checkPending(rule, month, current);

        Income deposit = Income.builder()
                .title(rule.getTitle())
                .amount(changes != null && changes.getAmount() != null ? changes.getAmount() : rule.getAmount())
                .date(dateIn(rule, period))
                .memberId(rule.getMember().getId())
                .depositType(rule.getDepositType() == null ? DepositType.MONTHLY : rule.getDepositType())
                .description(rule.getDescription())
                .build();

        IncomeEntity saved = incomeService.saveIncome(deposit, username);
        markHandled(rule, period, OccurrenceStatus.CONFIRMED);
        return saved;
    }

    @Transactional
    public void skip(Long id, String month, YearMonth current) {
        RecurringDepositEntity rule = get(id);
        YearMonth period = checkPending(rule, month, current);
        markHandled(rule, period, OccurrenceStatus.SKIPPED);
    }

    private YearMonth checkPending(RecurringDepositEntity rule, String month, YearMonth current) {
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
            throw new InvalidRequestException("This month is before the start of the recurring deposit.");
        }
        if (!Boolean.TRUE.equals(rule.getActive())) {
            throw new InvalidRequestException("This recurring deposit is not active.");
        }
        if (occurrenceRepository.existsByRecurringIdAndPeriodMonth(rule.getId(), period.toString())) {
            throw new InvalidRequestException("This month has already been confirmed or skipped.");
        }
        return period;
    }

    private void markHandled(RecurringDepositEntity rule, YearMonth period, OccurrenceStatus status) {
        occurrenceRepository.save(
                RecurringDepositOccurrenceEntity.builder()
                        .recurring(rule)
                        .periodMonth(period.toString())
                        .status(status)
                        .build()
        );
    }

    // the day is shortened in months that are shorter (e.g. 31 -> 28 in February)
    static LocalDateTime dateIn(RecurringDepositEntity rule, YearMonth month) {
        int day = Math.min(rule.getDayOfMonth(), month.lengthOfMonth());
        return LocalDateTime.of(month.atDay(day), LocalTime.NOON);
    }

    private RecurringDepositEntity fill(RecurringDepositEntity rule, RecurringDeposit request) {
        rule.setTitle(request.getTitle().trim());
        rule.setAmount(request.getAmount());
        rule.setMember(memberService.getMember(request.getMemberId()));
        rule.setDepositType(request.getDepositType() == null ? DepositType.MONTHLY : request.getDepositType());
        rule.setDescription(request.getDescription());
        rule.setDayOfMonth(request.getDayOfMonth());
        rule.setStartMonth(request.getStartMonth());
        rule.setActive(request.getActive() == null || request.getActive());
        return rule;
    }
}
