package com.github.rodis00.backend.usage;

import com.github.rodis00.backend.entity.UsageReadingEntity;

import java.math.BigDecimal;

public record UsageReadingDto(
        UsageUtility utility,
        int year,
        int month,
        BigDecimal amount
) {
    public static UsageReadingDto from(UsageReadingEntity reading) {
        return new UsageReadingDto(
                reading.getUtility(),
                reading.getYear(),
                reading.getMonth(),
                reading.getAmount()
        );
    }
}
