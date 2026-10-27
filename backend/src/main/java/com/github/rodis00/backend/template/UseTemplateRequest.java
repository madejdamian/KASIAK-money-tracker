package com.github.rodis00.backend.template;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UseTemplateRequest {

    @DecimalMin(value = "0.01", message = "Price should be at least 0.01.")
    private BigDecimal price;

    @PositiveOrZero(message = "Usage can't be negative.")
    private BigDecimal usageAmount;

    // replaces the description of the template when not blank
    private String description;
}
