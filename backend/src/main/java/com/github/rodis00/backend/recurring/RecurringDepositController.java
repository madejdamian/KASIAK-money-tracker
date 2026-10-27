package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.income.IncomeDto;
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
@RequestMapping("expense-tracker/api/v1/recurring-deposits")
@Tag(name = "Recurring deposit")
public class RecurringDepositController {

    private final RecurringDepositService recurringService;

    public RecurringDepositController(RecurringDepositService recurringService) {
        this.recurringService = recurringService;
    }

    @Operation(
            summary = "Retrieve a list of recurring deposits"
    )
    @GetMapping("/")
    public ResponseEntity<List<RecurringDepositDto>> getRecurringDeposits() {
        return ResponseEntity.ok(
                recurringService.getAll().stream().map(RecurringDepositDto::from).toList()
        );
    }

    @Operation(
            summary = "Create a recurring deposit"
    )
    @PostMapping("/")
    public ResponseEntity<RecurringDepositDto> addRecurringDeposit(
            @RequestBody @Valid RecurringDeposit request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(RecurringDepositDto.from(recurringService.save(request)));
    }

    @Operation(
            summary = "Update a recurring deposit"
    )
    @PutMapping("/{id}")
    public ResponseEntity<RecurringDepositDto> updateRecurringDeposit(
            @PathVariable Long id,
            @RequestBody @Valid RecurringDeposit request
    ) {
        return ResponseEntity.ok(RecurringDepositDto.from(recurringService.update(id, request)));
    }

    @Operation(
            summary = "Delete a recurring deposit (deposits already added from it stay)"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringDeposit(
            @PathVariable Long id
    ) {
        recurringService.delete(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @Operation(
            summary = "Retrieve recurring deposits waiting for confirmation"
    )
    @GetMapping("/pending")
    public ResponseEntity<List<PendingDepositDto>> getPending() {
        return ResponseEntity.ok(recurringService.getPending(YearMonth.now()));
    }

    @Operation(
            summary = "Confirm a recurring deposit for a month, adding it as a deposit (optionally with a different amount)"
    )
    @PostMapping("/{id}/confirm")
    public ResponseEntity<IncomeDto> confirm(
            @PathVariable Long id,
            @RequestParam String month,
            @RequestBody(required = false) @Valid ConfirmDepositRequest changes,
            Principal principal
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(IncomeDto.from(
                        recurringService.confirm(id, month, changes, principal.getName(), YearMonth.now())
                ));
    }

    @Operation(
            summary = "Skip a recurring deposit for a month"
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
