package com.github.rodis00.backend.member;

import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberDto {
    private Long id;
    private String name;

    public static MemberDto from(HouseholdMemberEntity member) {
        return new MemberDto(
                member.getId(),
                member.getName()
        );
    }
}
