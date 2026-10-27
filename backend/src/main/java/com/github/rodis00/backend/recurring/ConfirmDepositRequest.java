package com.github.rodis00.backend.recurring;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Optional change made when confirming a recurring deposit, e.g. a different amount this month.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmDepositRequest {

    @DecimalMin(value = "0.01", message = "Amount should be at least 0.01.")
    private BigDecimal amount;
}
