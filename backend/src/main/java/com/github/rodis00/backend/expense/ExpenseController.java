package com.github.rodis00.backend.expense;

import com.github.rodis00.backend.page.GlobalPage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("expense-tracker/api/v1/expenses")
@Tag(name = "Expense")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @Operation(
            summary = "Retrieve a single expense by its unique slug field"
    )
    @GetMapping("/{slug}")
    public ResponseEntity<ExpenseDto> getExpense(
            @PathVariable String slug
    ) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ExpenseDto.from(expenseService.getExpenseBySlug(slug)));
    }

    @Operation(
            summary = "Retrieve a list of user expenses and optional year and month"
    )
    @GetMapping("/")
    public ResponseEntity<List<ExpenseDto>> getUserExpenses(
            Principal principal,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(expenseService
                        .getAllUserExpenses(principal.getName(), year, month)
                        .stream()
                        .map(ExpenseDto::from)
                        .toList());
    }

    @Operation(
            summary = "Retrieve a list of user expenses with pagination and sorting"
    )
    @GetMapping("/pages")
    public ResponseEntity<Page<ExpenseDto>> getPageOfUserExpenses(
            Principal principal,
            @RequestParam(defaultValue = "0") @Min(0) Integer pageNumber,
            @RequestParam(defaultValue = "10") @Min(1) Integer pageSize,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDirection,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        GlobalPage expensePage = new GlobalPage();
        expensePage.setPageNumber(pageNumber);
        expensePage.setPageSize(pageSize);
        expensePage.setSortDirection(sortDirection);
        expensePage.setSortBy(sortBy);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(expenseService
                        .findAllExpensesByUsername(principal.getName(), expensePage, year, month)
                        .map(ExpenseDto::from));
    }

    @Operation(
            summary = "Create a new expense"
    )
    @PostMapping("/")
    public ResponseEntity<ExpenseDto> addExpense(
            @RequestBody @Valid Expense expense,
            Principal principal
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ExpenseDto.from(expenseService.saveExpense(expense, principal.getName())));
    }

    @Operation(
            summary = "Update existing expense by its unique slug field"
    )
    @PutMapping("/{slug}")
    public ResponseEntity<ExpenseDto> updateExpense(
            @PathVariable String slug,
            @RequestBody @Valid Expense expense
    ) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ExpenseDto.from(expenseService.updateExpense(slug, expense)));
    }

    @Operation(
            summary = "Delete expense by unique slug field"
    )
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable String slug
    ) {
        expenseService.deleteExpenseBySlug(slug);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @Operation(
            summary = "Retrieve a list of expense years"
    )
    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getYears(
            Principal principal,
            @RequestParam(required = false) boolean yearLimit
    ) {
        return ResponseEntity.ok(expenseService.getYears(principal.getName(), yearLimit));
    }

    @Operation(
            summary = "Retrieve a single user's last added expense."
    )
    @GetMapping("/last-added")
    public ResponseEntity<ExpenseDto> getLastUserExpense(
            Principal principal
    ) {
        return ResponseEntity.ok(expenseService.getLastUserExpense(principal.getName()));
    }
}
