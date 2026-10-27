package com.github.rodis00.backend.budget;

import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.entity.IncomeEntity;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseService;
import com.github.rodis00.backend.expense.PaymentSource;
import com.github.rodis00.backend.income.DepositType;
import com.github.rodis00.backend.income.IncomeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    private static final String USERNAME = "household";

    @Mock
    private IncomeService incomeService;

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private BudgetService budgetService;

    private HouseholdMemberEntity member(Long id, String name) {
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(id);
        member.setName(name);
        return member;
    }

    private IncomeEntity deposit(
            int year,
            int month,
            String amount,
            DepositType type,
            HouseholdMemberEntity member
    ) {
        IncomeEntity income = new IncomeEntity();
        income.setDate(LocalDateTime.of(year, month, 5, 12, 0));
        income.setAmount(new BigDecimal(amount));
        income.setDepositType(type);
        income.setMember(member);
        return income;
    }

    private ExpenseEntity expense(
            int year,
            int month,
            String price,
            PaymentSource source
    ) {
        ExpenseEntity expense = new ExpenseEntity();
        expense.setDate(LocalDateTime.of(year, month, 10, 12, 0));
        expense.setPrice(new BigDecimal(price));
        expense.setPaymentSource(source);
        return expense;
    }

    private void givenData(List<IncomeEntity> incomes, List<ExpenseEntity> expenses) {
        when(incomeService.getAllUserIncomes(USERNAME, null, null)).thenReturn(incomes);
        when(expenseService.getAllUserExpenses(USERNAME, null, null)).thenReturn(expenses);
    }

    @Test
    void shouldReturnZerosWhenThereIsNoData() {
        givenData(List.of(), List.of());

        BudgetSummaryDto summary = budgetService.getMonthlySummary(USERNAME, 2025, 3);

        assertEquals(2025, summary.getYear());
        assertEquals(3, summary.getMonth());
        assertEquals(0, summary.getCarriedOver().signum());
        assertEquals(0, summary.getTotalDeposits().signum());
        assertEquals(0, summary.getSharedSpent().signum());
        assertEquals(0, summary.getBalance().signum());
        assertTrue(summary.getDepositsByMember().isEmpty());
    }

    @Test
    void shouldCarryOverPositiveBalanceToNextMonth() {
        HouseholdMemberEntity anna = member(1L, "Anna");
        givenData(
                List.of(
                        deposit(2025, 1, "3000.00", DepositType.MONTHLY, anna),
                        deposit(2025, 2, "3000.00", DepositType.MONTHLY, anna),
                        deposit(2025, 2, "200.00", DepositType.EXTRA, anna)
                ),
                List.of(
                        expense(2025, 1, "2500.00", PaymentSource.SHARED_CARD),
                        expense(2025, 2, "1000.00", PaymentSource.SHARED_CARD),
                        expense(2025, 2, "300.00", PaymentSource.PRIVATE_CARD)
                )
        );

        BudgetSummaryDto summary = budgetService.getMonthlySummary(USERNAME, 2025, 2);

        assertEquals(0, new BigDecimal("500.00").compareTo(summary.getCarriedOver()));
        assertEquals(0, new BigDecimal("3000.00").compareTo(summary.getMonthlyDeposits()));
        assertEquals(0, new BigDecimal("200.00").compareTo(summary.getExtraDeposits()));
        assertEquals(0, new BigDecimal("3200.00").compareTo(summary.getTotalDeposits()));
        assertEquals(0, new BigDecimal("1000.00").compareTo(summary.getSharedSpent()));
        assertEquals(0, new BigDecimal("300.00").compareTo(summary.getPrivateSpent()));
        // 500 carried + 3200 deposits - 1000 shared (private card does not reduce the budget)
        assertEquals(0, new BigDecimal("2700.00").compareTo(summary.getBalance()));
    }

    @Test
    void shouldNotCarryOverNegativeBalance() {
        HouseholdMemberEntity anna = member(1L, "Anna");
        givenData(
                List.of(
                        deposit(2025, 1, "1000.00", DepositType.MONTHLY, anna),
                        deposit(2025, 2, "1000.00", DepositType.MONTHLY, anna)
                ),
                List.of(expense(2025, 1, "1500.00", PaymentSource.SHARED_CARD))
        );

        BudgetSummaryDto january = budgetService.getMonthlySummary(USERNAME, 2025, 1);
        BudgetSummaryDto february = budgetService.getMonthlySummary(USERNAME, 2025, 2);

        assertEquals(0, new BigDecimal("-500.00").compareTo(january.getBalance()));
        assertEquals(0, february.getCarriedOver().signum());
        assertEquals(0, new BigDecimal("1000.00").compareTo(february.getBalance()));
    }

    @Test
    void shouldCarryOverThroughMonthsWithoutData() {
        HouseholdMemberEntity anna = member(1L, "Anna");
        givenData(
                List.of(deposit(2025, 1, "800.00", DepositType.MONTHLY, anna)),
                List.of(expense(2025, 1, "300.00", PaymentSource.SHARED_CARD))
        );

        BudgetSummaryDto april = budgetService.getMonthlySummary(USERNAME, 2025, 4);

        assertEquals(0, new BigDecimal("500.00").compareTo(april.getCarriedOver()));
        assertEquals(0, new BigDecimal("500.00").compareTo(april.getBalance()));
    }

    @Test
    void shouldStartFromEarliestExpenseWhenItIsBeforeFirstDeposit() {
        HouseholdMemberEntity anna = member(1L, "Anna");
        givenData(
                List.of(deposit(2025, 2, "1000.00", DepositType.MONTHLY, anna)),
                List.of(expense(2025, 1, "200.00", PaymentSource.SHARED_CARD))
        );

        BudgetSummaryDto february = budgetService.getMonthlySummary(USERNAME, 2025, 2);

        // January ended below zero, so nothing is carried over
        assertEquals(0, february.getCarriedOver().signum());
        assertEquals(0, new BigDecimal("1000.00").compareTo(february.getBalance()));
    }

    @Test
    void shouldIgnoreDataFromLaterMonths() {
        HouseholdMemberEntity anna = member(1L, "Anna");
        givenData(
                List.of(
                        deposit(2025, 1, "1000.00", DepositType.MONTHLY, anna),
                        deposit(2025, 3, "5000.00", DepositType.MONTHLY, anna)
                ),
                List.of(expense(2025, 3, "100.00", PaymentSource.SHARED_CARD))
        );

        BudgetSummaryDto january = budgetService.getMonthlySummary(USERNAME, 2025, 1);

        assertEquals(0, january.getCarriedOver().signum());
        assertEquals(0, new BigDecimal("1000.00").compareTo(january.getBalance()));
        assertEquals(0, january.getSharedSpent().signum());
    }

    @Test
    void shouldGroupDepositsByMember() {
        HouseholdMemberEntity anna = member(1L, "Anna");
        HouseholdMemberEntity jan = member(2L, "Jan");
        givenData(
                List.of(
                        deposit(2025, 5, "2000.00", DepositType.MONTHLY, jan),
                        deposit(2025, 5, "1500.00", DepositType.MONTHLY, anna),
                        deposit(2025, 5, "100.00", DepositType.EXTRA, anna)
                ),
                List.of()
        );

        BudgetSummaryDto summary = budgetService.getMonthlySummary(USERNAME, 2025, 5);

        List<MemberDepositDto> byMember = summary.getDepositsByMember();
        assertEquals(2, byMember.size());
        assertEquals("Anna", byMember.get(0).getMemberName());
        assertEquals(0, new BigDecimal("1500.00").compareTo(byMember.get(0).getMonthly()));
        assertEquals(0, new BigDecimal("100.00").compareTo(byMember.get(0).getExtra()));
        assertEquals(0, new BigDecimal("1600.00").compareTo(byMember.get(0).getTotal()));
        assertEquals("Jan", byMember.get(1).getMemberName());
        assertEquals(0, new BigDecimal("2000.00").compareTo(byMember.get(1).getTotal()));
    }

    @Test
    void shouldRejectInvalidMonth() {
        assertThrows(InvalidRequestException.class,
                () -> budgetService.getMonthlySummary(USERNAME, 2025, 13));
        assertThrows(InvalidRequestException.class,
                () -> budgetService.getMonthlySummary(USERNAME, 2025, 0));

        verifyNoInteractions(incomeService, expenseService);
    }
}
