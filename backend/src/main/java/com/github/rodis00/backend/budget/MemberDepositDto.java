package com.github.rodis00.backend.budget;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MemberDepositDto {
    private Long memberId;
    private String memberName;
    private BigDecimal monthly;
    private BigDecimal extra;
    private BigDecimal total;
}
