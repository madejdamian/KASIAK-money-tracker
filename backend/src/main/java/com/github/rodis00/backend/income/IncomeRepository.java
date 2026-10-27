package com.github.rodis00.backend.income;

import com.github.rodis00.backend.entity.IncomeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncomeRepository extends JpaRepository<IncomeEntity, Long> {

    @Query("select e from IncomeEntity e " +
            "where e.user.username = :username " +
            "and (:year is null or extract(year from e.date) = :year) " +
            "and (:month is null or extract(month from e.date) = :month) "
    )
    Page<IncomeEntity> findAllIncomesByUser_UsernameAndYear(
            String username,
            Integer year,
            Integer month,
            Pageable pageable
    );

    Optional<IncomeEntity> findBySlug(String slug);

    boolean existsByMemberId(Long memberId);

    @Query(value = "select * from expense_tracker.income " +
            "where user_id = :userId " +
            "order by created_at desc " +
            "limit 1",
            nativeQuery = true
    )
    IncomeEntity findLastAdded(Long userId);

    @Query("select distinct year(i.date) " +
            "from IncomeEntity as i " +
            "where i.user.username = :username " +
            "order by year(i.date)"
    )
    List<Integer> findYearsByUsername(String username);

    @Query("select distinct year(i.date)" +
            "from IncomeEntity as i " +
            "where i.user.username = :username " +
            "and i.date between :minDate and :maxDate " +
            "order by year(i.date)"
    )
    List<Integer> findYearsByUsernameAndDateRange(
            String username,
            LocalDateTime minDate,
            LocalDateTime maxDate
    );
}
