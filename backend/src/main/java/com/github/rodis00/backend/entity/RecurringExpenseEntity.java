package com.github.rodis00.backend.entity;

import com.github.rodis00.backend.expense.PaymentSource;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "recurring_expense", schema = "expense_tracker")
public class RecurringExpenseEntity extends BaseEntity {

    private String title;

    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private HouseholdMemberEntity member;

    @Enumerated(EnumType.STRING)
    private PaymentSource paymentSource;

    private BigDecimal usageAmount;

    private String description;

    // day of the month on which the expense is dated (shortened in shorter months)
    private Integer dayOfMonth;

    // first month (yyyy-MM) for which the expense is proposed
    private String startMonth;

    private Boolean active;
}
