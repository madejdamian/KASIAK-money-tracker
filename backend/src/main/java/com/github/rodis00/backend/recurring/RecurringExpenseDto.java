package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.category.CategoryDto;
import com.github.rodis00.backend.entity.RecurringExpenseEntity;
import com.github.rodis00.backend.expense.PaymentSource;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class RecurringExpenseDto {
    private Long id;
    private String title;
    private BigDecimal price;
    private Long categoryId;
    private List<String> categoryPath;
    private String unit;
    private Long memberId;
    private String memberName;
    private PaymentSource paymentSource;
    private BigDecimal usageAmount;
    private String description;
    private Integer dayOfMonth;
    private String startMonth;
    private Boolean active;

    public static RecurringExpenseDto from(RecurringExpenseEntity rule) {
        return new RecurringExpenseDto(
                rule.getId(),
                rule.getTitle(),
                rule.getPrice(),
                rule.getCategory() == null ? null : rule.getCategory().getId(),
                CategoryDto.pathOf(rule.getCategory()),
                rule.getCategory() == null ? null : rule.getCategory().getUnit(),
                rule.getMember() == null ? null : rule.getMember().getId(),
                rule.getMember() == null ? null : rule.getMember().getName(),
                rule.getPaymentSource(),
                rule.getUsageAmount(),
                rule.getDescription(),
                rule.getDayOfMonth(),
                rule.getStartMonth(),
                rule.getActive()
        );
    }
}
