package com.github.rodis00.backend.usage;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("expense-tracker/api/v1/usage")
@Tag(name = "Usage")
public class UsageController {

    private final UsageService usageService;

    public UsageController(UsageService usageService) {
        this.usageService = usageService;
    }

    @Operation(
            summary = "Retrieve all entered consumption readings (cold water, hot water, heating)"
    )
    @GetMapping("/")
    public ResponseEntity<List<UsageReadingDto>> getReadings() {
        return ResponseEntity.ok(
                usageService
                        .getAllReadings()
                        .stream()
                        .map(UsageReadingDto::from)
                        .toList()
        );
    }

    @Operation(
            summary = "Set the consumption of a utility in a month (replaces the previous value)"
    )
    @PutMapping("/")
    public ResponseEntity<UsageReadingDto> saveReading(
            @RequestBody @Valid UsageReading reading
    ) {
        return ResponseEntity.ok(UsageReadingDto.from(usageService.saveReading(reading)));
    }

    @Operation(
            summary = "Remove the consumption of a utility in a month"
    )
    @DeleteMapping("/{utility}/{year}/{month}")
    public ResponseEntity<Void> deleteReading(
            @PathVariable UsageUtility utility,
            @PathVariable int year,
            @PathVariable int month
    ) {
        usageService.deleteReading(utility, year, month);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}
