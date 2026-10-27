package com.github.rodis00.backend.template;

import com.github.rodis00.backend.category.CategoryDto;
import com.github.rodis00.backend.entity.ExpenseTemplateEntity;
import com.github.rodis00.backend.expense.PaymentSource;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class ExpenseTemplateDto {
    private Long id;
    private String name;
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

    public static ExpenseTemplateDto from(ExpenseTemplateEntity template) {
        return new ExpenseTemplateDto(
                template.getId(),
                template.getName(),
                template.getTitle(),
                template.getPrice(),
                template.getCategory() == null ? null : template.getCategory().getId(),
                CategoryDto.pathOf(template.getCategory()),
                template.getCategory() == null ? null : template.getCategory().getUnit(),
                template.getMember() == null ? null : template.getMember().getId(),
                template.getMember() == null ? null : template.getMember().getName(),
                template.getPaymentSource(),
                template.getUsageAmount(),
                template.getDescription()
        );
    }
}
