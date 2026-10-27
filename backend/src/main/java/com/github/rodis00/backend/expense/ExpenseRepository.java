package com.github.rodis00.backend.expense;

import com.github.rodis00.backend.entity.ExpenseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {

    @Query("select e from ExpenseEntity e " +
            "where e.user.username = :username " +
            "and (:year is null or extract(year from e.date) = :year) " +
            "and (:month is null or extract(month from e.date) = :month) "
    )
    Page<ExpenseEntity> findAllExpensesByUser_UsernameAndYear(
            String username,
            Integer year,
            Integer month,
            Pageable pageable
    );

    Optional<ExpenseEntity> findBySlug(String slug);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByMemberId(Long memberId);

    @Query(value = "select * from expense_tracker.expense " +
            "where user_id = :userId " +
            "order by created_at desc " +
            "limit 1",
            nativeQuery = true
    )
    ExpenseEntity findLastAdded(Long userId);

    @Query("select distinct year(e.date) " +
            "from ExpenseEntity as e " +
            "where e.user.username = :username " +
            "order by year(e.date)"
    )
    List<Integer> findYearsByUsername(String username);

    @Query("select distinct year(e.date) " +
            "from ExpenseEntity as e " +
            "where e.user.username = :username " +
            "and e.date between :minDate and :maxDate " +
            "order by year(e.date)"
    )
    List<Integer> findYearsByUsernameAndDateRange(
            String username,
            LocalDateTime minDate,
            LocalDateTime maxDate
    );
}
