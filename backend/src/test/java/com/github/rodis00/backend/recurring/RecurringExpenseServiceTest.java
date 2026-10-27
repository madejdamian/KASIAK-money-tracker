package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.category.CategoryService;
import com.github.rodis00.backend.entity.CategoryEntity;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.entity.RecurringExpenseEntity;
import com.github.rodis00.backend.entity.RecurringOccurrenceEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.Expense;
import com.github.rodis00.backend.expense.ExpenseService;
import com.github.rodis00.backend.expense.PaymentSource;
import com.github.rodis00.backend.member.MemberService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecurringExpenseServiceTest {

    private static final String USERNAME = "household";

    @Mock
    private RecurringExpenseRepository recurringRepository;

    @Mock
    private RecurringOccurrenceRepository occurrenceRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private MemberService memberService;

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private RecurringExpenseService recurringService;

    private RecurringExpenseEntity rule(Long id, String title, String startMonth, int day) {
        CategoryEntity category = new CategoryEntity();
        category.setId(10L);
        category.setName("Rent");
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(20L);
        member.setName("Anna");

        RecurringExpenseEntity rule = new RecurringExpenseEntity();
        rule.setId(id);
        rule.setTitle(title);
        rule.setPrice(new BigDecimal("1500.00"));
        rule.setCategory(category);
        rule.setMember(member);
        rule.setPaymentSource(PaymentSource.SHARED_CARD);
        rule.setDayOfMonth(day);
        rule.setStartMonth(startMonth);
        rule.setActive(true);
        return rule;
    }

    @Test
    void shouldShortenDayInShorterMonths() {
        RecurringExpenseEntity rule = rule(1L, "Rent", "2025-01", 31);

        assertEquals(
                LocalDateTime.of(2025, 2, 28, 12, 0),
                RecurringExpenseService.dateIn(rule, YearMonth.of(2025, 2))
        );
        assertEquals(
                LocalDateTime.of(2025, 3, 31, 12, 0),
                RecurringExpenseService.dateIn(rule, YearMonth.of(2025, 3))
        );
    }

    @Test
    void shouldProposeEveryUnhandledMonthFromStartToCurrent() {
        RecurringExpenseEntity rent = rule(1L, "Rent", "2025-01", 5);

        when(recurringRepository.findAllByActiveTrueOrderByTitleAsc()).thenReturn(List.of(rent));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(anyLong(), anyString())).thenReturn(false);
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2025-02")).thenReturn(true);

        List<PendingOccurrenceDto> pending = recurringService.getPending(YearMonth.of(2025, 3));

        assertEquals(List.of("2025-01", "2025-03"), pending.stream().map(PendingOccurrenceDto::getMonth).toList());
        assertEquals(LocalDateTime.of(2025, 3, 5, 12, 0), pending.get(1).getDate());
        assertEquals("Anna", pending.get(0).getMemberName());
    }

    @Test
    void shouldLookBackAtMostOneYear() {
        RecurringExpenseEntity oldRule = rule(1L, "Loan", "2020-01", 1);

        when(recurringRepository.findAllByActiveTrueOrderByTitleAsc()).thenReturn(List.of(oldRule));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(anyLong(), anyString())).thenReturn(false);

        List<PendingOccurrenceDto> pending = recurringService.getPending(YearMonth.of(2025, 3));

        assertEquals(RecurringExpenseService.MONTHS_BACK + 1, pending.size());
        assertEquals("2024-04", pending.get(0).getMonth());
        assertEquals("2025-03", pending.get(pending.size() - 1).getMonth());
    }

    @Test
    void shouldNotProposeMonthsBeforeStart() {
        RecurringExpenseEntity rule = rule(1L, "Netflix", "2025-03", 1);

        when(recurringRepository.findAllByActiveTrueOrderByTitleAsc()).thenReturn(List.of(rule));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(anyLong(), anyString())).thenReturn(false);

        List<PendingOccurrenceDto> pending = recurringService.getPending(YearMonth.of(2025, 3));

        assertEquals(1, pending.size());
        assertEquals("2025-03", pending.get(0).getMonth());
    }

    @Test
    void shouldConfirmWithChangedPriceAndRememberIt() {
        RecurringExpenseEntity electricity = rule(1L, "Electricity", "2025-01", 15);
        electricity.setUsageAmount(new BigDecimal("100.000"));
        ExpenseEntity created = new ExpenseEntity();

        when(recurringRepository.findById(1L)).thenReturn(Optional.of(electricity));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2025-03")).thenReturn(false);
        when(expenseService.saveExpense(any(Expense.class), eq(USERNAME))).thenReturn(created);

        ExpenseEntity result = recurringService.confirm(
                1L,
                "2025-03",
                new ConfirmRequest(new BigDecimal("212.40"), new BigDecimal("180.000")),
                USERNAME,
                YearMonth.of(2025, 3)
        );

        assertSame(created, result);

        ArgumentCaptor<Expense> expense = ArgumentCaptor.forClass(Expense.class);
        verify(expenseService).saveExpense(expense.capture(), eq(USERNAME));
        assertEquals("Electricity", expense.getValue().getTitle());
        assertEquals(new BigDecimal("212.40"), expense.getValue().getPrice());
        assertEquals(new BigDecimal("180.000"), expense.getValue().getUsageAmount());
        assertEquals(LocalDateTime.of(2025, 3, 15, 12, 0), expense.getValue().getDate());
        assertEquals(10L, expense.getValue().getCategoryId());
        assertEquals(20L, expense.getValue().getMemberId());
        assertEquals(PaymentSource.SHARED_CARD, expense.getValue().getPaymentSource());

        ArgumentCaptor<RecurringOccurrenceEntity> occurrence = ArgumentCaptor.forClass(RecurringOccurrenceEntity.class);
        verify(occurrenceRepository).save(occurrence.capture());
        assertEquals("2025-03", occurrence.getValue().getPeriodMonth());
        assertEquals(OccurrenceStatus.CONFIRMED, occurrence.getValue().getStatus());
    }

    @Test
    void shouldConfirmWithPlannedPriceWhenNoChangesGiven() {
        RecurringExpenseEntity rent = rule(1L, "Rent", "2025-01", 5);

        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rent));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2025-03")).thenReturn(false);
        when(expenseService.saveExpense(any(Expense.class), eq(USERNAME))).thenReturn(new ExpenseEntity());

        recurringService.confirm(1L, "2025-03", null, USERNAME, YearMonth.of(2025, 3));

        ArgumentCaptor<Expense> expense = ArgumentCaptor.forClass(Expense.class);
        verify(expenseService).saveExpense(expense.capture(), eq(USERNAME));
        assertEquals(new BigDecimal("1500.00"), expense.getValue().getPrice());
    }

    @Test
    void shouldRejectMonthThatWasAlreadyHandled() {
        RecurringExpenseEntity rent = rule(1L, "Rent", "2025-01", 5);

        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rent));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2025-02")).thenReturn(true);

        assertThrows(InvalidRequestException.class,
                () -> recurringService.confirm(1L, "2025-02", null, USERNAME, YearMonth.of(2025, 3)));

        verifyNoInteractions(expenseService);
        verify(occurrenceRepository, never()).save(any());
    }

    @Test
    void shouldRejectFutureAndPreStartMonthsAndBadFormat() {
        RecurringExpenseEntity rent = rule(1L, "Rent", "2025-02", 5);

        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rent));

        YearMonth current = YearMonth.of(2025, 3);
        assertThrows(InvalidRequestException.class,
                () -> recurringService.confirm(1L, "2025-04", null, USERNAME, current));
        assertThrows(InvalidRequestException.class,
                () -> recurringService.confirm(1L, "2025-01", null, USERNAME, current));
        assertThrows(InvalidRequestException.class,
                () -> recurringService.confirm(1L, "march", null, USERNAME, current));

        verifyNoInteractions(expenseService);
    }

    @Test
    void shouldRejectInactiveRule() {
        RecurringExpenseEntity rent = rule(1L, "Rent", "2025-01", 5);
        rent.setActive(false);

        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rent));

        assertThrows(InvalidRequestException.class,
                () -> recurringService.skip(1L, "2025-03", YearMonth.of(2025, 3)));
    }

    @Test
    void shouldSkipMonthWithoutAddingExpense() {
        RecurringExpenseEntity rent = rule(1L, "Rent", "2025-01", 5);

        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rent));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2025-03")).thenReturn(false);

        recurringService.skip(1L, "2025-03", YearMonth.of(2025, 3));

        ArgumentCaptor<RecurringOccurrenceEntity> occurrence = ArgumentCaptor.forClass(RecurringOccurrenceEntity.class);
        verify(occurrenceRepository).save(occurrence.capture());
        assertEquals(OccurrenceStatus.SKIPPED, occurrence.getValue().getStatus());
        verifyNoInteractions(expenseService);
    }

    @Test
    void shouldThrowExceptionIfRuleNotFound() {
        when(recurringRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> recurringService.get(99L));
    }

    @Test
    void shouldDeleteRuleTogetherWithItsOccurrences() {
        RecurringExpenseEntity rent = rule(1L, "Rent", "2025-01", 5);

        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rent));

        recurringService.delete(1L);

        verify(occurrenceRepository).deleteByRecurringId(1L);
        verify(recurringRepository).delete(rent);
    }

    @Test
    void shouldCreateRuleFromRequestWithActiveByDefault() {
        CategoryEntity category = new CategoryEntity();
        category.setId(10L);
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(20L);

        when(categoryService.getCategory(10L)).thenReturn(category);
        when(memberService.getMember(20L)).thenReturn(member);
        when(recurringRepository.save(any(RecurringExpenseEntity.class))).thenAnswer(i -> i.getArgument(0));

        RecurringExpenseEntity saved = recurringService.save(
                RecurringExpense.builder()
                        .title("  Netflix ")
                        .price(new BigDecimal("49.00"))
                        .categoryId(10L)
                        .memberId(20L)
                        .paymentSource(PaymentSource.SHARED_CARD)
                        .dayOfMonth(12)
                        .startMonth("2025-03")
                        .build()
        );

        assertEquals("Netflix", saved.getTitle());
        assertTrue(saved.getActive());
        assertSame(category, saved.getCategory());
        assertSame(member, saved.getMember());
    }
}
