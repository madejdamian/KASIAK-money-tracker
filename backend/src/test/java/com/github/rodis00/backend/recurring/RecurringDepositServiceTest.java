package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.entity.IncomeEntity;
import com.github.rodis00.backend.entity.RecurringDepositEntity;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.income.DepositType;
import com.github.rodis00.backend.income.Income;
import com.github.rodis00.backend.income.IncomeService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecurringDepositServiceTest {

    private static final YearMonth NOW = YearMonth.of(2026, 10);

    @Mock
    private RecurringDepositRepository recurringRepository;

    @Mock
    private RecurringDepositOccurrenceRepository occurrenceRepository;

    @Mock
    private MemberService memberService;

    @Mock
    private IncomeService incomeService;

    @InjectMocks
    private RecurringDepositService service;

    private RecurringDepositEntity rule(String startMonth, int day) {
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(7L);
        member.setName("damian");
        RecurringDepositEntity rule = RecurringDepositEntity.builder()
                .title("Wpłata miesięczna")
                .amount(new BigDecimal("3000.00"))
                .member(member)
                .depositType(DepositType.MONTHLY)
                .dayOfMonth(day)
                .startMonth(startMonth)
                .active(true)
                .build();
        rule.setId(1L);
        return rule;
    }

    @Test
    void shouldProposeEveryMonthFromStartThatWasNotHandled() {
        when(recurringRepository.findAllByActiveTrueOrderByTitleAsc()).thenReturn(List.of(rule("2026-08", 1)));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(anyLong(), anyString())).thenReturn(false);
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2026-09")).thenReturn(true);

        List<PendingDepositDto> pending = service.getPending(NOW);

        assertEquals(List.of("2026-08", "2026-10"), pending.stream().map(PendingDepositDto::getMonth).toList());
    }

    @Test
    void shouldConfirmWithTheRulesAmountDatedOnItsDayAndMarkTheMonthHandled() {
        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rule("2026-01", 31)));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2026-02")).thenReturn(false);
        when(incomeService.saveIncome(any(Income.class), eq("user"))).thenReturn(new IncomeEntity());

        service.confirm(1L, "2026-02", null, "user", NOW);

        ArgumentCaptor<Income> deposit = ArgumentCaptor.forClass(Income.class);
        verify(incomeService).saveIncome(deposit.capture(), eq("user"));
        assertEquals(new BigDecimal("3000.00"), deposit.getValue().getAmount());
        assertEquals(LocalDateTime.of(2026, 2, 28, 12, 0), deposit.getValue().getDate());
        assertEquals(DepositType.MONTHLY, deposit.getValue().getDepositType());
        assertEquals(7L, deposit.getValue().getMemberId());
    }

    @Test
    void shouldAcceptADifferentAmountWhenConfirming() {
        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rule("2026-01", 1)));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2026-10")).thenReturn(false);
        when(incomeService.saveIncome(any(Income.class), eq("user"))).thenReturn(new IncomeEntity());

        service.confirm(1L, "2026-10", new ConfirmDepositRequest(new BigDecimal("3200.00")), "user", NOW);

        ArgumentCaptor<Income> deposit = ArgumentCaptor.forClass(Income.class);
        verify(incomeService).saveIncome(deposit.capture(), eq("user"));
        assertEquals(new BigDecimal("3200.00"), deposit.getValue().getAmount());
    }

    @Test
    void shouldRejectFutureAndAlreadyHandledMonths() {
        when(recurringRepository.findById(1L)).thenReturn(Optional.of(rule("2026-01", 1)));
        when(occurrenceRepository.existsByRecurringIdAndPeriodMonth(1L, "2026-09")).thenReturn(true);

        assertThrows(InvalidRequestException.class, () -> service.confirm(1L, "2026-11", null, "user", NOW));
        assertThrows(InvalidRequestException.class, () -> service.skip(1L, "2026-09", NOW));
    }
}
