package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.category.CategoryDto;
import com.github.rodis00.backend.entity.RecurringExpenseEntity;
import com.github.rodis00.backend.expense.PaymentSource;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * A recurring expense waiting for confirmation in a given month.
 */
@Getter
@AllArgsConstructor
public class PendingOccurrenceDto {
    private Long recurringId;
    private String title;
    private BigDecimal price;
    private List<String> categoryPath;
    private String unit;
    private String memberName;
    private PaymentSource paymentSource;
    private BigDecimal usageAmount;
    // yyyy-MM
    private String month;
    // the date the expense will get when confirmed
    private LocalDateTime date;

    public static PendingOccurrenceDto of(
            RecurringExpenseEntity rule,
            String month,
            LocalDateTime date
    ) {
        return new PendingOccurrenceDto(
                rule.getId(),
                rule.getTitle(),
                rule.getPrice(),
                CategoryDto.pathOf(rule.getCategory()),
                rule.getCategory() == null ? null : rule.getCategory().getUnit(),
                rule.getMember() == null ? null : rule.getMember().getName(),
                rule.getPaymentSource(),
                rule.getUsageAmount(),
                month,
                date
        );
    }
}
