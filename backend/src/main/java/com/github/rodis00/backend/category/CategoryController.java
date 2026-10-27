package com.github.rodis00.backend.category;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("expense-tracker/api/v1/categories")
@Tag(name = "Category")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(
            summary = "Retrieve the category tree (top-level categories with nested subcategories)"
    )
    @GetMapping("/")
    public ResponseEntity<List<CategoryDto>> getCategoryTree() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

    @Operation(
            summary = "Create a new category, optionally under a parent category"
    )
    @PostMapping("/")
    public ResponseEntity<CategoryDto> addCategory(
            @RequestBody @Valid Category category
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(CategoryDto.from(categoryService.saveCategory(category)));
    }

    @Operation(
            summary = "Update (rename, move, change unit of) existing category"
    )
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @RequestBody @Valid Category category
    ) {
        return ResponseEntity.ok(CategoryDto.from(categoryService.updateCategory(id, category)));
    }

    @Operation(
            summary = "Delete category that has no subcategories and no expenses"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id
    ) {
        categoryService.deleteCategory(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}
