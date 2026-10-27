package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.RecurringDepositEntity;
import com.github.rodis00.backend.income.DepositType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class RecurringDepositDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    private Long memberId;
    private String memberName;
    private DepositType depositType;
    private String description;
    private Integer dayOfMonth;
    private String startMonth;
    private Boolean active;

    public static RecurringDepositDto from(RecurringDepositEntity rule) {
        return new RecurringDepositDto(
                rule.getId(),
                rule.getTitle(),
                rule.getAmount(),
                rule.getMember() == null ? null : rule.getMember().getId(),
                rule.getMember() == null ? null : rule.getMember().getName(),
                rule.getDepositType(),
                rule.getDescription(),
                rule.getDayOfMonth(),
                rule.getStartMonth(),
                rule.getActive()
        );
    }
}
