package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.entity.RecurringExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpenseEntity, Long> {
    List<RecurringExpenseEntity> findAllByOrderByTitleAsc();

    List<RecurringExpenseEntity> findAllByActiveTrueOrderByTitleAsc();

    boolean existsByCategoryId(Long categoryId);

    boolean existsByMemberId(Long memberId);
}
