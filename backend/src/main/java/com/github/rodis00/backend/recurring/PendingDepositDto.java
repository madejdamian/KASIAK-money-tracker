package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.RecurringDepositEntity;
import com.github.rodis00.backend.income.DepositType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A recurring deposit waiting for confirmation in a given month.
 */
@Getter
@AllArgsConstructor
public class PendingDepositDto {
    private Long recurringId;
    private String title;
    private BigDecimal amount;
    private String memberName;
    private DepositType depositType;
    // yyyy-MM
    private String month;
    // the date the deposit will get when confirmed
    private LocalDateTime date;

    public static PendingDepositDto of(RecurringDepositEntity rule, String month, LocalDateTime date) {
        return new PendingDepositDto(
                rule.getId(),
                rule.getTitle(),
                rule.getAmount(),
                rule.getMember() == null ? null : rule.getMember().getName(),
                rule.getDepositType(),
                month,
                date
        );
    }
}
