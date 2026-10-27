package com.github.rodis00.backend.member;

import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<HouseholdMemberEntity, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<HouseholdMemberEntity> findAllByOrderByNameAsc();
}
