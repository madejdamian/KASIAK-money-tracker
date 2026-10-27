package com.github.rodis00.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
@Table(name = "household_member", schema = "expense_tracker")
public class HouseholdMemberEntity extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;
}
