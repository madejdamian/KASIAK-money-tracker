package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.RecurringDepositOccurrenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringDepositOccurrenceRepository extends JpaRepository<RecurringDepositOccurrenceEntity, Long> {
    boolean existsByRecurringIdAndPeriodMonth(Long recurringId, String periodMonth);

    void deleteByRecurringId(Long recurringId);
}
