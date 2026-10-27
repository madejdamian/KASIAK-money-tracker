package com.github.rodis00.backend.expense;

import com.github.rodis00.backend.utils.customValidator.MinValue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @NotBlank(message = "Title shouldn't be blank.")
    private String title;

    @NotNull(message = "Price shouldn't be empty.")
    @MinValue
    private BigDecimal price;

    @NotNull(message = "Invalid date.")
    private LocalDateTime date;

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
