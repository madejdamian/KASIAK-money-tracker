package com.github.rodis00.backend.category;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @NotBlank(message = "Name shouldn't be blank.")
    private String name;

    // null means a top-level category
    private Long parentId;

    // unit of usage, e.g. kWh; optional
    private String unit;
}
