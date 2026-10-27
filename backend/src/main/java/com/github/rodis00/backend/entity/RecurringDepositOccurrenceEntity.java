package com.github.rodis00.backend.entity;

import com.github.rodis00.backend.recurring.OccurrenceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "recurring_deposit_occurrence", schema = "expense_tracker")
public class RecurringDepositOccurrenceEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "recurring_id")
    private RecurringDepositEntity recurring;

    // yyyy-MM
    private String periodMonth;

    @Enumerated(EnumType.STRING)
    private OccurrenceStatus status;
}
