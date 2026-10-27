package com.github.rodis00.backend.category;

import com.github.rodis00.backend.entity.CategoryEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private CategoryService categoryService;

    private CategoryEntity category(Long id, String name, CategoryEntity parent) {
        CategoryEntity category = new CategoryEntity();
        category.setId(id);
        category.setName(name);
        category.setParent(parent);
        return category;
    }

    @Test
    void shouldBuildCategoryTreeOfAnyDepth() {
        CategoryEntity bills = category(1L, "Bills", null);
        CategoryEntity utilities = category(2L, "Utilities", bills);
        CategoryEntity electricity = category(3L, "Electricity", utilities);
        CategoryEntity fun = category(4L, "Fun", null);

        when(categoryRepository.findAll()).thenReturn(new ArrayList<>(List.of(electricity, fun, utilities, bills)));

        List<CategoryDto> tree = categoryService.getCategoryTree();

        assertEquals(2, tree.size());
        assertEquals("Bills", tree.get(0).getName());
        assertEquals("Fun", tree.get(1).getName());
        CategoryDto utilitiesDto = tree.get(0).getChildren().get(0);
        assertEquals("Utilities", utilitiesDto.getName());
        assertEquals("Electricity", utilitiesDto.getChildren().get(0).getName());
        assertTrue(tree.get(1).getChildren().isEmpty());
    }

    @Test
    void shouldSaveTopLevelCategory() {
        Category request = new Category("  Fun  ", null, null);

        when(categoryRepository.existsByParentIsNullAndNameIgnoreCase("Fun")).thenReturn(false);
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(i -> i.getArgument(0));

        CategoryEntity saved = categoryService.saveCategory(request);

        assertEquals("Fun", saved.getName());
        assertNull(saved.getParent());
        assertNull(saved.getUnit());
    }

    @Test
    void shouldSaveSubcategoryWithUnit() {
        CategoryEntity utilities = category(2L, "Utilities", null);
        Category request = new Category("Electricity", 2L, "kWh");

        when(categoryRepository.findById(2L)).thenReturn(Optional.of(utilities));
        when(categoryRepository.existsByParentIdAndNameIgnoreCase(2L, "Electricity")).thenReturn(false);
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(i -> i.getArgument(0));

        CategoryEntity saved = categoryService.saveCategory(request);

        assertEquals(utilities, saved.getParent());
        assertEquals("kWh", saved.getUnit());
    }

    @Test
    void shouldThrowExceptionIfParentNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> categoryService.saveCategory(new Category("Fun", 99L, null)));
    }

    @Test
    void shouldThrowExceptionIfSiblingWithSameNameExists() {
        when(categoryRepository.existsByParentIsNullAndNameIgnoreCase("Fun")).thenReturn(true);

        assertThrows(InvalidRequestException.class,
                () -> categoryService.saveCategory(new Category("Fun", null, null)));

        verify(categoryRepository, never()).save(any());
    }

    @Test
    void shouldNotAllowMovingCategoryUnderItsDescendant() {
        CategoryEntity bills = category(1L, "Bills", null);
        CategoryEntity utilities = category(2L, "Utilities", bills);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(bills));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(utilities));

        assertThrows(InvalidRequestException.class,
                () -> categoryService.updateCategory(1L, new Category("Bills", 2L, null)));

        verify(categoryRepository, never()).save(any());
    }

    @Test
    void shouldNotAllowMakingCategoryItsOwnParent() {
        CategoryEntity bills = category(1L, "Bills", null);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(bills));

        assertThrows(InvalidRequestException.class,
                () -> categoryService.updateCategory(1L, new Category("Bills", 1L, null)));
    }

    @Test
    void shouldRenameCategoryKeepingParent() {
        CategoryEntity bills = category(1L, "Bills", null);
        CategoryEntity utilities = category(2L, "Utilities", bills);

        when(categoryRepository.findById(2L)).thenReturn(Optional.of(utilities));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(bills));
        when(categoryRepository.existsByParentIdAndNameIgnoreCase(1L, "Media")).thenReturn(false);
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(i -> i.getArgument(0));

        CategoryEntity updated = categoryService.updateCategory(2L, new Category("Media", 1L, " kWh "));

        assertEquals("Media", updated.getName());
        assertEquals(bills, updated.getParent());
        assertEquals("kWh", updated.getUnit());
    }

    @Test
    void shouldAllowChangingOnlyLetterCaseOfName() {
        CategoryEntity fun = category(1L, "fun", null);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(fun));
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(i -> i.getArgument(0));

        CategoryEntity updated = categoryService.updateCategory(1L, new Category("Fun", null, null));

        assertEquals("Fun", updated.getName());
        verify(categoryRepository, never()).existsByParentIsNullAndNameIgnoreCase(any());
    }

    @Test
    void shouldDeleteUnusedCategory() {
        CategoryEntity fun = category(1L, "Fun", null);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(fun));
        when(categoryRepository.existsByParentId(1L)).thenReturn(false);
        when(expenseRepository.existsByCategoryId(1L)).thenReturn(false);

        categoryService.deleteCategory(1L);

        verify(categoryRepository, times(1)).delete(fun);
    }

    @Test
    void shouldNotDeleteCategoryWithSubcategories() {
        CategoryEntity bills = category(1L, "Bills", null);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(bills));
        when(categoryRepository.existsByParentId(1L)).thenReturn(true);

        assertThrows(InvalidRequestException.class, () -> categoryService.deleteCategory(1L));

        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void shouldNotDeleteCategoryWithExpenses() {
        CategoryEntity fun = category(1L, "Fun", null);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(fun));
        when(categoryRepository.existsByParentId(1L)).thenReturn(false);
        when(expenseRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThrows(InvalidRequestException.class, () -> categoryService.deleteCategory(1L));

        verify(categoryRepository, never()).delete(any());
    }
}
