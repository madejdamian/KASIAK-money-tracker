package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.expense.ExpenseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("expense-tracker/api/v1/recurring")
@Tag(name = "Recurring expense")
public class RecurringExpenseController {

    private final RecurringExpenseService recurringService;

    public RecurringExpenseController(RecurringExpenseService recurringService) {
        this.recurringService = recurringService;
    }

    @Operation(
            summary = "Retrieve a list of recurring expenses"
    )
    @GetMapping("/")
    public ResponseEntity<List<RecurringExpenseDto>> getRecurringExpenses() {
        return ResponseEntity.ok(
                recurringService.getAll().stream().map(RecurringExpenseDto::from).toList()
        );
    }

    @Operation(
            summary = "Create a recurring expense"
    )
    @PostMapping("/")
    public ResponseEntity<RecurringExpenseDto> addRecurringExpense(
            @RequestBody @Valid RecurringExpense request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(RecurringExpenseDto.from(recurringService.save(request)));
    }

    @Operation(
            summary = "Update a recurring expense"
    )
    @PutMapping("/{id}")
    public ResponseEntity<RecurringExpenseDto> updateRecurringExpense(
            @PathVariable Long id,
            @RequestBody @Valid RecurringExpense request
    ) {
        return ResponseEntity.ok(RecurringExpenseDto.from(recurringService.update(id, request)));
    }

    @Operation(
            summary = "Delete a recurring expense (expenses already added from it stay)"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringExpense(
            @PathVariable Long id
    ) {
        recurringService.delete(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @Operation(
            summary = "Retrieve recurring expenses waiting for confirmation"
    )
    @GetMapping("/pending")
    public ResponseEntity<List<PendingOccurrenceDto>> getPending() {
        return ResponseEntity.ok(recurringService.getPending(YearMonth.now()));
    }

    @Operation(
            summary = "Confirm a recurring expense for a month, adding it as an expense (optionally with a different amount)"
    )
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ExpenseDto> confirm(
            @PathVariable Long id,
            @RequestParam String month,
            @RequestBody(required = false) @Valid ConfirmRequest changes,
            Principal principal
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ExpenseDto.from(
                        recurringService.confirm(id, month, changes, principal.getName(), YearMonth.now())
                ));
    }

    @Operation(
            summary = "Skip a recurring expense for a month"
    )
    @PostMapping("/{id}/skip")
    public ResponseEntity<Void> skip(
            @PathVariable Long id,
            @RequestParam String month
    ) {
        recurringService.skip(id, month, YearMonth.now());
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}
