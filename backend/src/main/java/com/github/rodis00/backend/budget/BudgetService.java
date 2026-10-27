package com.github.rodis00.backend.budget;

import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.IncomeEntity;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseService;
import com.github.rodis00.backend.expense.PaymentSource;
import com.github.rodis00.backend.income.DepositType;
import com.github.rodis00.backend.income.IncomeService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Monthly household budget. Every month starts with the positive balance of the previous
 * month plus the deposits made to the shared account; only expenses paid from the shared
 * account (shared card) reduce it. A negative balance is not carried over.
 * Nothing is stored: the summary is always computed from deposits and expenses.
 */
@Service
public class BudgetService {

    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    public BudgetService(
            IncomeService incomeService,
            ExpenseService expenseService
    ) {
        this.incomeService = incomeService;
        this.expenseService = expenseService;
    }

    public BudgetSummaryDto getMonthlySummary(
            String username,
            int year,
            int month
    ) {
        if (month < 1 || month > 12) {
            throw new InvalidRequestException("Month should be between 1 and 12.");
        }
        YearMonth requested = YearMonth.of(year, month);

        List<IncomeEntity> incomes = incomeService.getAllUserIncomes(username, null, null);
        List<ExpenseEntity> expenses = expenseService.getAllUserExpenses(username, null, null);

        BigDecimal carriedOver = carriedOverInto(requested, incomes, expenses);

        List<IncomeEntity> monthIncomes = incomes.stream()
                .filter(i -> YearMonth.from(i.getDate()).equals(requested))
                .toList();

        BigDecimal monthly = sumDeposits(monthIncomes, DepositType.MONTHLY);
        BigDecimal extra = sumDeposits(monthIncomes, DepositType.EXTRA);
        BigDecimal totalDeposits = monthly.add(extra);

        BigDecimal sharedSpent = sumExpenses(expenses, requested, PaymentSource.SHARED_CARD);
        BigDecimal privateSpent = sumExpenses(expenses, requested, PaymentSource.PRIVATE_CARD);

        return new BudgetSummaryDto(
                year,
                month,
                carriedOver,
                monthly,
                extra,
                totalDeposits,
                depositsByMember(monthIncomes),
                sharedSpent,
                privateSpent,
                carriedOver.add(totalDeposits).subtract(sharedSpent)
        );
    }

    // positive balance left after the month preceding `month`, walking from the first month with data
    private BigDecimal carriedOverInto(
            YearMonth month,
            List<IncomeEntity> incomes,
            List<ExpenseEntity> expenses
    ) {
        YearMonth first = incomes.stream()
                .map(i -> YearMonth.from(i.getDate()))
                .min(Comparator.naturalOrder())
                .orElse(null);

        YearMonth firstExpense = expenses.stream()
                .map(e -> YearMonth.from(e.getDate()))
                .min(Comparator.naturalOrder())
                .orElse(null);

        if (first == null || (firstExpense != null && firstExpense.isBefore(first))) {
            first = firstExpense;
        }

        BigDecimal carry = BigDecimal.ZERO;
        if (first == null) {
            return carry;
        }

        for (YearMonth current = first; current.isBefore(month); current = current.plusMonths(1)) {
            final YearMonth m = current;
            BigDecimal deposits = incomes.stream()
                    .filter(i -> YearMonth.from(i.getDate()).equals(m))
                    .map(IncomeEntity::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal balance = carry
                    .add(deposits)
                    .subtract(sumExpenses(expenses, m, PaymentSource.SHARED_CARD));

            carry = balance.signum() > 0 ? balance : BigDecimal.ZERO;
        }
        return carry;
    }

    private BigDecimal sumDeposits(List<IncomeEntity> incomes, DepositType type) {
        return incomes.stream()
                .filter(i -> i.getDepositType() == type)
                .map(IncomeEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumExpenses(
            List<ExpenseEntity> expenses,
            YearMonth month,
            PaymentSource source
    ) {
        return expenses.stream()
                .filter(e -> YearMonth.from(e.getDate()).equals(month))
                .filter(e -> e.getPaymentSource() == source)
                .map(ExpenseEntity::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<MemberDepositDto> depositsByMember(List<IncomeEntity> monthIncomes) {
        Map<Long, List<IncomeEntity>> byMember = new LinkedHashMap<>();
        for (IncomeEntity income : monthIncomes) {
            Long memberId = income.getMember() == null ? null : income.getMember().getId();
            byMember.computeIfAbsent(memberId, k -> new ArrayList<>()).add(income);
        }

        List<MemberDepositDto> result = new ArrayList<>();
        byMember.forEach((memberId, list) -> {
            IncomeEntity any = list.get(0);
            String name = any.getMember() == null ? null : any.getMember().getName();
            BigDecimal monthly = sumDeposits(list, DepositType.MONTHLY);
            BigDecimal extra = sumDeposits(list, DepositType.EXTRA);
            result.add(new MemberDepositDto(memberId, name, monthly, extra, monthly.add(extra)));
        });

        result.sort(Comparator.comparing(
                (MemberDepositDto d) -> d.getMemberName() == null ? "" : d.getMemberName().toLowerCase()
        ));
        return result;
    }
}
