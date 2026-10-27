package com.github.rodis00.backend.entity;

import com.github.rodis00.backend.income.DepositType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "recurring_deposit", schema = "expense_tracker")
public class RecurringDepositEntity extends BaseEntity {

    private String title;

    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private HouseholdMemberEntity member;

    @Enumerated(EnumType.STRING)
    private DepositType depositType;

    private String description;

    // day of the month on which the deposit is dated (shortened in shorter months)
    private Integer dayOfMonth;

    // first month (yyyy-MM) for which the deposit is proposed
    private String startMonth;

    private Boolean active;
}
