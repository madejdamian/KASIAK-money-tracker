package com.github.rodis00.backend.tag;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            summary = "Retrieve names of tags used by expenses"
    )
    @GetMapping("/")
    public ResponseEntity<List<String>> getTags() {
        return ResponseEntity.ok(tagService.getUsedTagNames());
    }
}
