package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.expense.PaymentSource;
import com.github.rodis00.backend.utils.customValidator.MinValue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class RecurringExpense {

    @NotBlank(message = "Title shouldn't be blank.")
    private String title;

    @NotNull(message = "Price shouldn't be empty.")
    @MinValue
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

    @NotNull(message = "Day of month shouldn't be empty.")
    @Min(value = 1, message = "Day of month should be between 1 and 31.")
    @Max(value = 31, message = "Day of month should be between 1 and 31.")
    private Integer dayOfMonth;

    @NotBlank(message = "Start month shouldn't be blank.")
    @Pattern(regexp = "\\d{4}-(0[1-9]|1[0-2])", message = "Start month should look like 2025-03.")
    private String startMonth;

    // true when not given
    private Boolean active;
}
