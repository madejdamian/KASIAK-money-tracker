package com.github.rodis00.backend.template;

import com.github.rodis00.backend.expense.PaymentSource;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseTemplate {

    @NotBlank(message = "Name shouldn't be blank.")
    private String name;

    // defaults to the name when blank
    private String title;

    // optional: without it the price is given each time the template is used
    @DecimalMin(value = "0.01", message = "Price should be at least 0.01.")
    private BigDecimal price;

    @NotNull(message = "Category shouldn't be empty.")
    private Long categoryId;

    @NotNull(message = "Member shouldn't be empty.")
    private Long memberId;

    @NotNull(message = "Payment source shouldn't be empty.")
    private PaymentSource paymentSource;

    @PositiveOrZero(message = "Usage can't be negative.")
    private BigDecimal usageAmount;

    private String description;
}
