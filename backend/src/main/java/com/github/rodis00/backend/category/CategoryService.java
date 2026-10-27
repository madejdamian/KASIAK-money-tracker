package com.github.rodis00.backend.category;

import com.github.rodis00.backend.entity.CategoryEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseRepository;
import com.github.rodis00.backend.recurring.RecurringExpenseRepository;
import com.github.rodis00.backend.template.ExpenseTemplateRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final RecurringExpenseRepository recurringRepository;
    private final ExpenseTemplateRepository templateRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            ExpenseRepository expenseRepository,
            RecurringExpenseRepository recurringRepository,
            ExpenseTemplateRepository templateRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.expenseRepository = expenseRepository;
        this.recurringRepository = recurringRepository;
        this.templateRepository = templateRepository;
    }

    public CategoryEntity getCategory(Long id) {
        return categoryRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found."));
    }

    /**
     * Returns top-level categories, each with its subcategories nested to any depth.
     */
    public List<CategoryDto> getCategoryTree() {
        List<CategoryEntity> entities = categoryRepository.findAll();
        entities.sort(Comparator.comparing(c -> c.getName().toLowerCase()));

        Map<Long, CategoryDto> dtos = new HashMap<>();
        for (CategoryEntity entity : entities) {
            dtos.put(entity.getId(), CategoryDto.from(entity));
        }

        List<CategoryDto> roots = new ArrayList<>();
        for (CategoryEntity entity : entities) {
            CategoryDto dto = dtos.get(entity.getId());
            if (entity.getParent() == null) {
                roots.add(dto);
            } else {
                dtos.get(entity.getParent().getId()).getChildren().add(dto);
            }
        }
        return roots;
    }

    public CategoryEntity saveCategory(Category category) {
        String name = category.getName().trim();
        CategoryEntity parent = findParent(category.getParentId());
        checkNameIsFree(parent, name, null);

        return categoryRepository.save(
                CategoryEntity.builder()
                        .name(name)
                        .parent(parent)
                        .unit(normalizeUnit(category.getUnit()))
                        .build()
        );
    }

    public CategoryEntity updateCategory(Long id, Category category) {
        CategoryEntity actualCategory = getCategory(id);
        String name = category.getName().trim();
        CategoryEntity parent = findParent(category.getParentId());

        if (parent != null && isSelfOrDescendant(parent, actualCategory)) {
            throw new InvalidRequestException("Category cannot be moved under itself or its subcategory.");
        }
        checkNameIsFree(parent, name, actualCategory);

        actualCategory.setName(name);
        actualCategory.setParent(parent);
        actualCategory.setUnit(normalizeUnit(category.getUnit()));
        return categoryRepository.save(actualCategory);
    }

    public void deleteCategory(Long id) {
        CategoryEntity category = getCategory(id);

        if (categoryRepository.existsByParentId(id)) {
            throw new InvalidRequestException("Category has subcategories and cannot be deleted.");
        }
        if (expenseRepository.existsByCategoryId(id)) {
            throw new InvalidRequestException("Category has expenses and cannot be deleted.");
        }
        if (recurringRepository.existsByCategoryId(id) || templateRepository.existsByCategoryId(id)) {
            throw new InvalidRequestException("Category is used by a recurring expense or template and cannot be deleted.");
        }

        categoryRepository.delete(category);
    }

    private CategoryEntity findParent(Long parentId) {
        return parentId == null ? null : getCategory(parentId);
    }

    private void checkNameIsFree(
            CategoryEntity parent,
            String name,
            CategoryEntity current
    ) {
        // renaming to the same name (ignoring case) under the same parent is not a conflict
        if (current != null
                && current.getName().equalsIgnoreCase(name)
                && sameParent(current.getParent(), parent)) {
            return;
        }

        boolean taken = parent == null
                ? categoryRepository.existsByParentIsNullAndNameIgnoreCase(name)
                : categoryRepository.existsByParentIdAndNameIgnoreCase(parent.getId(), name);

        if (taken) {
            throw new InvalidRequestException("Category with this name already exists here.");
        }
    }

    private boolean sameParent(CategoryEntity a, CategoryEntity b) {
        if (a == null || b == null) {
            return a == b;
        }
        return a.getId().equals(b.getId());
    }

    // true if candidate is the category itself or sits anywhere below it
    private boolean isSelfOrDescendant(CategoryEntity candidate, CategoryEntity category) {
        for (CategoryEntity current = candidate; current != null; current = current.getParent()) {
            if (current.getId().equals(category.getId())) {
                return true;
            }
        }
        return false;
    }

    private String normalizeUnit(String unit) {
        return (unit == null || unit.isBlank()) ? null : unit.trim();
    }
}
