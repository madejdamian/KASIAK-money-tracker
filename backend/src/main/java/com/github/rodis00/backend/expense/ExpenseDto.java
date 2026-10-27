package com.github.rodis00.backend.expense;

import com.github.rodis00.backend.category.CategoryDto;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.TagEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ExpenseDto {
    private String slug;
    private String title;
    private BigDecimal price;
    private LocalDateTime date;
    private Long categoryId;
    private List<String> categoryPath;
    private String unit;
    private Long memberId;
    private String memberName;
    private PaymentSource paymentSource;
    private BigDecimal usageAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String description;
    private List<String> tags;

    public static ExpenseDto from(ExpenseEntity expense) {
        return new ExpenseDto(
                expense.getSlug(),
                expense.getTitle(),
                expense.getPrice(),
                expense.getDate(),
                expense.getCategory() == null ? null : expense.getCategory().getId(),
                CategoryDto.pathOf(expense.getCategory()),
                expense.getCategory() == null ? null : expense.getCategory().getUnit(),
                expense.getMember() == null ? null : expense.getMember().getId(),
                expense.getMember() == null ? null : expense.getMember().getName(),
                expense.getPaymentSource(),
                expense.getUsageAmount(),
                expense.getCreatedAt(),
                expense.getUpdatedAt(),
                expense.getDescription(),
                expense.getTags() == null
                        ? List.of()
                        : expense.getTags().stream().map(TagEntity::getName).sorted().toList()
        );
    }
}
