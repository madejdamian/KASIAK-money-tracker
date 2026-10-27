package com.github.rodis00.backend.tag;

import jakarta.validation.constraints.NotBlank;

public record TagRequest(
        @NotBlank(message = "Tag name can not be blank.")
        String name
) {
}
