package com.github.rodis00.backend.income;

import com.github.rodis00.backend.entity.IncomeEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class IncomeDto {
    private String slug;
    private String title;
    private BigDecimal amount;
    private LocalDateTime date;
    private Long memberId;
    private String memberName;
    private DepositType depositType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String description;

    public static IncomeDto from(IncomeEntity income) {
        return new IncomeDto(
                income.getSlug(),
                income.getTitle(),
                income.getAmount(),
                income.getDate(),
                income.getMember() == null ? null : income.getMember().getId(),
                income.getMember() == null ? null : income.getMember().getName(),
                income.getDepositType(),
                income.getCreatedAt(),
                income.getUpdatedAt(),
                income.getDescription()
        );
    }
}
