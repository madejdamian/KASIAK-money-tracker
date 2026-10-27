package com.github.rodis00.backend.template;

import com.github.rodis00.backend.entity.ExpenseTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseTemplateRepository extends JpaRepository<ExpenseTemplateEntity, Long> {
    List<ExpenseTemplateEntity> findAllByOrderByNameAsc();

    boolean existsByCategoryId(Long categoryId);

    boolean existsByMemberId(Long memberId);
}
