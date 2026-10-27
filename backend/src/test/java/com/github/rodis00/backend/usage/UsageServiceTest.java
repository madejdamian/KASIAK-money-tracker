package com.github.rodis00.backend.usage;

import com.github.rodis00.backend.entity.UsageReadingEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsageServiceTest {

    @Mock
    private UsageReadingRepository repository;

    @InjectMocks
    private UsageService usageService;

    @Test
    void shouldCreateReadingWhenMonthHasNone() {
        when(repository.findByUtilityAndYearAndMonth(UsageUtility.HOT_WATER, 2026, 10))
                .thenReturn(Optional.empty());
        when(repository.save(any(UsageReadingEntity.class))).thenAnswer(call -> call.getArgument(0));

        UsageReadingEntity saved = usageService.saveReading(
                new UsageReading(UsageUtility.HOT_WATER, 2026, 10, new BigDecimal("4.5")));

        assertEquals(UsageUtility.HOT_WATER, saved.getUtility());
        assertEquals(new BigDecimal("4.5"), saved.getAmount());
    }

    @Test
    void shouldReplaceAmountWhenMonthAlreadyHasReading() {
        UsageReadingEntity existing = UsageReadingEntity.builder()
                .utility(UsageUtility.HEATING).year(2026).month(10).amount(new BigDecimal("1.2")).build();
        when(repository.findByUtilityAndYearAndMonth(UsageUtility.HEATING, 2026, 10))
                .thenReturn(Optional.of(existing));
        when(repository.save(any(UsageReadingEntity.class))).thenAnswer(call -> call.getArgument(0));

        UsageReadingEntity saved = usageService.saveReading(
                new UsageReading(UsageUtility.HEATING, 2026, 10, new BigDecimal("2.8")));

        assertEquals(new BigDecimal("2.8"), saved.getAmount());
    }
}
