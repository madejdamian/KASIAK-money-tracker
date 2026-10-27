package com.github.rodis00.backend.category;

import com.github.rodis00.backend.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    boolean existsByParentId(Long parentId);

    boolean existsByParentIdAndNameIgnoreCase(Long parentId, String name);

    boolean existsByParentIsNullAndNameIgnoreCase(String name);
}
