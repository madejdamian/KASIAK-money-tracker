package com.github.rodis00.backend.usage;

import com.github.rodis00.backend.entity.UsageReadingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsageReadingRepository extends JpaRepository<UsageReadingEntity, Long> {
    Optional<UsageReadingEntity> findByUtilityAndYearAndMonth(UsageUtility utility, int year, int month);

    List<UsageReadingEntity> findAllByOrderByYearAscMonthAsc();
}
