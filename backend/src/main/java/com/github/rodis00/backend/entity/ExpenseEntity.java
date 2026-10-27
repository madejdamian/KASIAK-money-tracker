package com.github.rodis00.backend.entity;

import com.github.rodis00.backend.expense.PaymentSource;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "expense", schema = "expense_tracker")
public class ExpenseEntity extends BaseEntity {

    private String title;

    private BigDecimal price;

    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private String description;

    @Column(
            unique = true,
            nullable = false
    )
    private String slug;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private HouseholdMemberEntity member;

    @Enumerated(EnumType.STRING)
    private PaymentSource paymentSource;

    // consumption connected with this expense, in the unit of the category (e.g. kWh)
    private BigDecimal usageAmount;

    @ManyToMany
    @JoinTable(
            name = "expense_tag",
            schema = "expense_tracker",
            joinColumns = @JoinColumn(name = "expense_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<TagEntity> tags = new HashSet<>();
}
