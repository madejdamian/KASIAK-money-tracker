package com.github.rodis00.backend.usage;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UsageReading(
        @NotNull(message = "Utility can not be null.")
        UsageUtility utility,

        @NotNull(message = "Year can not be null.")
        @Min(value = 2000, message = "Year is too small.")
        @Max(value = 2100, message = "Year is too big.")
        Integer year,

        @NotNull(message = "Month can not be null.")
        @Min(value = 1, message = "Month must be between 1 and 12.")
        @Max(value = 12, message = "Month must be between 1 and 12.")
        Integer month,

        @NotNull(message = "Amount can not be null.")
        @DecimalMin(value = "0", message = "Amount can not be negative.")
        BigDecimal amount
) {
}
