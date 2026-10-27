package com.github.rodis00.backend.entity;

import com.github.rodis00.backend.recurring.OccurrenceStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "recurring_occurrence", schema = "expense_tracker")
public class RecurringOccurrenceEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "recurring_id")
    private RecurringExpenseEntity recurring;

    // yyyy-MM
    private String periodMonth;

    @Enumerated(EnumType.STRING)
    private OccurrenceStatus status;
}
