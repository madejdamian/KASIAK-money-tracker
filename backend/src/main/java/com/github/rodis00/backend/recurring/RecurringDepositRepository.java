package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.RecurringDepositEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringDepositRepository extends JpaRepository<RecurringDepositEntity, Long> {
    List<RecurringDepositEntity> findAllByOrderByTitleAsc();

    List<RecurringDepositEntity> findAllByActiveTrueOrderByTitleAsc();

    boolean existsByMemberId(Long memberId);
}
