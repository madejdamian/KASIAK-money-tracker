package com.github.rodis00.backend.recurring;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Optional changes made when confirming a recurring expense, e.g. the real amount of a bill.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmRequest {

    @DecimalMin(value = "0.01", message = "Price should be at least 0.01.")
    private BigDecimal price;

    @PositiveOrZero(message = "Usage can't be negative.")
    private BigDecimal usageAmount;
}
