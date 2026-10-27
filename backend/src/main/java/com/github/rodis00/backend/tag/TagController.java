package com.github.rodis00.backend.tag;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("expense-tracker/api/v1/tags")
@Tag(name = "Tag")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @Operation(
            summary = "Retrieve names of all tags that can be picked on an expense"
    )
    @GetMapping("/")
    public ResponseEntity<List<String>> getTags() {
        return ResponseEntity.ok(tagService.getAllTagNames());
    }

    @Operation(
            summary = "Create a tag (the name is trimmed and lower-cased)"
    )
    @PostMapping("/")
    public ResponseEntity<TagRequest> addTag(
            @RequestBody @Valid TagRequest tag
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new TagRequest(tagService.createTag(tag.name())));
    }

    @Operation(
            summary = "Delete a tag that no expense uses"
    )
    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteTag(
            @PathVariable String name
    ) {
        tagService.deleteTag(name);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}
