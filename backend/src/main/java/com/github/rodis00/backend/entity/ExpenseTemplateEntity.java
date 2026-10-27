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
@Table(name = "expense_template", schema = "expense_tracker")
public class ExpenseTemplateEntity extends BaseEntity {

    // label shown on the quick-add button
    private String name;

    private String title;

    // optional: a template without a price asks for it when used
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
}
