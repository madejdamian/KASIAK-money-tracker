package com.github.rodis00.backend.member;

import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseRepository;
import com.github.rodis00.backend.income.IncomeRepository;
import com.github.rodis00.backend.recurring.RecurringDepositRepository;
import com.github.rodis00.backend.recurring.RecurringExpenseRepository;
import com.github.rodis00.backend.template.ExpenseTemplateRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private RecurringExpenseRepository recurringRepository;

    @Mock
    private RecurringDepositRepository recurringDepositRepository;

    @Mock
    private ExpenseTemplateRepository templateRepository;

    @InjectMocks
    private MemberService memberService;

    private HouseholdMemberEntity member(Long id, String name) {
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(id);
        member.setName(name);
        return member;
    }

    @Test
    void shouldSaveMemberWithTrimmedName() {
        when(memberRepository.existsByNameIgnoreCase("Anna")).thenReturn(false);
        when(memberRepository.save(any(HouseholdMemberEntity.class))).thenAnswer(i -> i.getArgument(0));

        HouseholdMemberEntity saved = memberService.saveMember(new Member("  Anna "));

        assertEquals("Anna", saved.getName());
    }

    @Test
    void shouldThrowExceptionIfMemberNameTaken() {
        when(memberRepository.existsByNameIgnoreCase("Anna")).thenReturn(true);

        assertThrows(InvalidRequestException.class, () -> memberService.saveMember(new Member("Anna")));

        verify(memberRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionIfMemberNotFound() {
        when(memberRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> memberService.getMember(1L));
    }

    @Test
    void shouldUpdateMemberName() {
        HouseholdMemberEntity anna = member(1L, "Anna");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(anna));
        when(memberRepository.existsByNameIgnoreCase("Ania")).thenReturn(false);
        when(memberRepository.save(any(HouseholdMemberEntity.class))).thenAnswer(i -> i.getArgument(0));

        HouseholdMemberEntity updated = memberService.updateMember(1L, new Member("Ania"));

        assertEquals("Ania", updated.getName());
    }

    @Test
    void shouldDeleteMemberWithoutExpensesAndDeposits() {
        HouseholdMemberEntity anna = member(1L, "Anna");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(anna));
        when(expenseRepository.existsByMemberId(1L)).thenReturn(false);
        when(incomeRepository.existsByMemberId(1L)).thenReturn(false);

        memberService.deleteMember(1L);

        verify(memberRepository, times(1)).delete(anna);
    }

    @Test
    void shouldNotDeleteMemberUsedByTemplate() {
        HouseholdMemberEntity anna = member(1L, "Anna");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(anna));
        when(expenseRepository.existsByMemberId(1L)).thenReturn(false);
        when(incomeRepository.existsByMemberId(1L)).thenReturn(false);
        when(recurringRepository.existsByMemberId(1L)).thenReturn(false);
        when(templateRepository.existsByMemberId(1L)).thenReturn(true);

        assertThrows(InvalidRequestException.class, () -> memberService.deleteMember(1L));

        verify(memberRepository, never()).delete(any());
    }

    @Test
    void shouldNotDeleteMemberWithExpenses() {
        HouseholdMemberEntity anna = member(1L, "Anna");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(anna));
        when(expenseRepository.existsByMemberId(1L)).thenReturn(true);

        assertThrows(InvalidRequestException.class, () -> memberService.deleteMember(1L));

        verify(memberRepository, never()).delete(any());
    }
}
