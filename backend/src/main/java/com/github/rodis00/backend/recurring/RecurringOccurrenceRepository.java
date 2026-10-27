package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.RecurringOccurrenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringOccurrenceRepository extends JpaRepository<RecurringOccurrenceEntity, Long> {
    boolean existsByRecurringIdAndPeriodMonth(Long recurringId, String periodMonth);

    void deleteByRecurringId(Long recurringId);
}
