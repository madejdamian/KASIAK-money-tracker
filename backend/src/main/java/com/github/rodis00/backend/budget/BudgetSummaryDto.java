package com.github.rodis00.backend.budget;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class BudgetSummaryDto {
    private int year;
    private int month;
    // positive balance left from the previous month (a negative balance is not carried over)
    private BigDecimal carriedOver;
    private BigDecimal monthlyDeposits;
    private BigDecimal extraDeposits;
    private BigDecimal totalDeposits;
    private List<MemberDepositDto> depositsByMember;
    // expenses paid from the shared account (shared card); they reduce the budget
    private BigDecimal sharedSpent;
    // expenses paid with private cards; shown for information, they do not reduce the budget
    private BigDecimal privateSpent;
    // carriedOver + totalDeposits - sharedSpent; may be negative
    private BigDecimal balance;
}
