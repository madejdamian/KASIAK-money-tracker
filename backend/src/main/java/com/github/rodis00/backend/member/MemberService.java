package com.github.rodis00.backend.member;

import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseRepository;
import com.github.rodis00.backend.income.IncomeRepository;
import com.github.rodis00.backend.recurring.RecurringExpenseRepository;
import com.github.rodis00.backend.template.ExpenseTemplateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final RecurringExpenseRepository recurringRepository;
    private final ExpenseTemplateRepository templateRepository;

    public MemberService(
            MemberRepository memberRepository,
            ExpenseRepository expenseRepository,
            IncomeRepository incomeRepository,
            RecurringExpenseRepository recurringRepository,
            ExpenseTemplateRepository templateRepository
    ) {
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.recurringRepository = recurringRepository;
        this.templateRepository = templateRepository;
    }

    public List<HouseholdMemberEntity> getAllMembers() {
        return memberRepository.findAllByOrderByNameAsc();
    }

    public HouseholdMemberEntity getMember(Long id) {
        return memberRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Member not found."));
    }

    public HouseholdMemberEntity saveMember(Member member) {
        String name = member.getName().trim();
        if (memberRepository.existsByNameIgnoreCase(name)) {
            throw new InvalidRequestException("Member with this name already exists.");
        }

        return memberRepository.save(
                HouseholdMemberEntity.builder()
                        .name(name)
                        .build()
        );
    }

    public HouseholdMemberEntity updateMember(Long id, Member member) {
        HouseholdMemberEntity actualMember = getMember(id);
        String name = member.getName().trim();

        if (!actualMember.getName().equalsIgnoreCase(name)
                && memberRepository.existsByNameIgnoreCase(name)) {
            throw new InvalidRequestException("Member with this name already exists.");
        }

        actualMember.setName(name);
        return memberRepository.save(actualMember);
    }

    public void deleteMember(Long id) {
        HouseholdMemberEntity member = getMember(id);

        if (expenseRepository.existsByMemberId(id) || incomeRepository.existsByMemberId(id)) {
            throw new InvalidRequestException("Member has expenses or deposits and cannot be deleted.");
        }
        if (recurringRepository.existsByMemberId(id) || templateRepository.existsByMemberId(id)) {
            throw new InvalidRequestException("Member is used by a recurring expense or template and cannot be deleted.");
        }

        memberRepository.delete(member);
    }
}
