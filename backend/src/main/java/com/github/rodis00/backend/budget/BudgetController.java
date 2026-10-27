package com.github.rodis00.backend.budget;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("expense-tracker/api/v1/budget")
@Tag(name = "Budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @Operation(
            summary = "Retrieve the household budget summary for a month (the current month by default)"
    )
    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryDto> getMonthlySummary(
            Principal principal,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        LocalDate today = LocalDate.now();
        return ResponseEntity.ok(
                budgetService.getMonthlySummary(
                        principal.getName(),
                        year == null ? today.getYear() : year,
                        month == null ? today.getMonthValue() : month
                )
        );
    }
}
