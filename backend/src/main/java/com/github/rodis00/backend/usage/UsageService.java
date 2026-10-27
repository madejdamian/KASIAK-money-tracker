package com.github.rodis00.backend.usage;

import com.github.rodis00.backend.entity.UsageReadingEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsageService {

    private final UsageReadingRepository repository;

    public UsageService(UsageReadingRepository repository) {
        this.repository = repository;
    }

    public List<UsageReadingEntity> getAllReadings() {
        return repository.findAllByOrderByYearAscMonthAsc();
    }

    // one value per utility and month: saving again replaces it
    public UsageReadingEntity saveReading(UsageReading reading) {
        UsageReadingEntity entity = repository
                .findByUtilityAndYearAndMonth(reading.utility(), reading.year(), reading.month())
                .orElseGet(() -> UsageReadingEntity.builder()
                        .utility(reading.utility())
                        .year(reading.year())
                        .month(reading.month())
                        .build());

        entity.setAmount(reading.amount());
        return repository.save(entity);
    }

    public void deleteReading(UsageUtility utility, int year, int month) {
        UsageReadingEntity entity = repository
                .findByUtilityAndYearAndMonth(utility, year, month)
                .orElseThrow(() -> new EntityNotFoundException("Usage reading not found."));

        repository.delete(entity);
    }
}
