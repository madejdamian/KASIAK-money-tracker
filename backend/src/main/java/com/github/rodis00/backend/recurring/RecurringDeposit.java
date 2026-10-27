package com.github.rodis00.backend.recurring;

import com.github.rodis00.backend.income.DepositType;
import com.github.rodis00.backend.utils.customValidator.MinValue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringDeposit {

    @NotBlank(message = "Title shouldn't be blank.")
    private String title;

    @NotNull(message = "Amount shouldn't be empty.")
    @MinValue
    private BigDecimal amount;

    @NotNull(message = "Member shouldn't be empty.")
    private Long memberId;

    // MONTHLY when not given
    private DepositType depositType;

    private String description;

    @NotNull(message = "Day of month shouldn't be empty.")
    @Min(value = 1, message = "Day of month should be between 1 and 31.")
    @Max(value = 31, message = "Day of month should be between 1 and 31.")
    private Integer dayOfMonth;

    @NotBlank(message = "Start month shouldn't be blank.")
    @Pattern(regexp = "\\d{4}-(0[1-9]|1[0-2])", message = "Start month should look like 2025-03.")
    private String startMonth;

    // true when not given
    private Boolean active;
}
