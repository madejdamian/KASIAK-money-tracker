package com.github.rodis00.backend.category;

import com.github.rodis00.backend.entity.CategoryEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private Long parentId;
    private String unit;
    private List<CategoryDto> children;

    public static CategoryDto from(CategoryEntity category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getParent() == null ? null : category.getParent().getId(),
                category.getUnit(),
                new ArrayList<>()
        );
    }

    /**
     * Names from the top-level category down to the given one, e.g. [Opłaty, Media, Prąd].
     */
    public static List<String> pathOf(CategoryEntity category) {
        List<String> path = new ArrayList<>();
        for (CategoryEntity current = category; current != null; current = current.getParent()) {
            path.add(current.getName());
        }
        Collections.reverse(path);
        return path;
    }
}
