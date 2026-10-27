package com.github.rodis00.backend.template;

import com.github.rodis00.backend.expense.ExpenseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("expense-tracker/api/v1/templates")
@Tag(name = "Expense template")
public class ExpenseTemplateController {

    private final ExpenseTemplateService templateService;

    public ExpenseTemplateController(ExpenseTemplateService templateService) {
        this.templateService = templateService;
    }

    @Operation(
            summary = "Retrieve a list of expense templates"
    )
    @GetMapping("/")
    public ResponseEntity<List<ExpenseTemplateDto>> getTemplates() {
        return ResponseEntity.ok(
                templateService.getAll().stream().map(ExpenseTemplateDto::from).toList()
        );
    }

    @Operation(
            summary = "Create an expense template"
    )
    @PostMapping("/")
    public ResponseEntity<ExpenseTemplateDto> addTemplate(
            @RequestBody @Valid ExpenseTemplate request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ExpenseTemplateDto.from(templateService.save(request)));
    }

    @Operation(
            summary = "Update an expense template"
    )
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseTemplateDto> updateTemplate(
            @PathVariable Long id,
            @RequestBody @Valid ExpenseTemplate request
    ) {
        return ResponseEntity.ok(ExpenseTemplateDto.from(templateService.update(id, request)));
    }

    @Operation(
            summary = "Delete an expense template"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long id
    ) {
        templateService.delete(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @Operation(
            summary = "Add an expense dated now from a template"
    )
    @PostMapping("/{id}/use")
    public ResponseEntity<ExpenseDto> use(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid UseTemplateRequest changes,
            Principal principal
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ExpenseDto.from(
                        templateService.use(id, changes, principal.getName(), LocalDateTime.now())
                ));
    }
}
