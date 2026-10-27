package com.github.rodis00.backend.template;

import com.github.rodis00.backend.category.CategoryService;
import com.github.rodis00.backend.entity.CategoryEntity;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.ExpenseTemplateEntity;
import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.Expense;
import com.github.rodis00.backend.expense.ExpenseService;
import com.github.rodis00.backend.expense.PaymentSource;
import com.github.rodis00.backend.member.MemberService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseTemplateServiceTest {

    private static final String USERNAME = "household";
    private static final LocalDateTime NOW = LocalDateTime.of(2025, 3, 17, 18, 30);

    @Mock
    private ExpenseTemplateRepository templateRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private MemberService memberService;

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private ExpenseTemplateService templateService;

    private ExpenseTemplateEntity template(BigDecimal price, String title) {
        CategoryEntity category = new CategoryEntity();
        category.setId(10L);
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(20L);

        ExpenseTemplateEntity template = new ExpenseTemplateEntity();
        template.setId(1L);
        template.setName("Bread");
        template.setTitle(title);
        template.setPrice(price);
        template.setCategory(category);
        template.setMember(member);
        template.setPaymentSource(PaymentSource.PRIVATE_CARD);
        return template;
    }

    @Test
    void shouldUseTemplateWithItsPrice() {
        ExpenseEntity created = new ExpenseEntity();

        when(templateRepository.findById(1L)).thenReturn(Optional.of(template(new BigDecimal("6.50"), "Fresh bread")));
        when(expenseService.saveExpense(any(Expense.class), eq(USERNAME))).thenReturn(created);

        ExpenseEntity result = templateService.use(1L, null, USERNAME, NOW);

        assertSame(created, result);

        ArgumentCaptor<Expense> expense = ArgumentCaptor.forClass(Expense.class);
        verify(expenseService).saveExpense(expense.capture(), eq(USERNAME));
        assertEquals("Fresh bread", expense.getValue().getTitle());
        assertEquals(new BigDecimal("6.50"), expense.getValue().getPrice());
        assertEquals(NOW, expense.getValue().getDate());
        assertEquals(10L, expense.getValue().getCategoryId());
        assertEquals(20L, expense.getValue().getMemberId());
        assertEquals(PaymentSource.PRIVATE_CARD, expense.getValue().getPaymentSource());
    }

    @Test
    void shouldUseNameAsTitleWhenTitleIsMissing() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template(new BigDecimal("6.50"), null)));
        when(expenseService.saveExpense(any(Expense.class), eq(USERNAME))).thenReturn(new ExpenseEntity());

        templateService.use(1L, null, USERNAME, NOW);

        ArgumentCaptor<Expense> expense = ArgumentCaptor.forClass(Expense.class);
        verify(expenseService).saveExpense(expense.capture(), eq(USERNAME));
        assertEquals("Bread", expense.getValue().getTitle());
    }

    @Test
    void shouldPreferPriceGivenWhenUsing() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template(new BigDecimal("6.50"), null)));
        when(expenseService.saveExpense(any(Expense.class), eq(USERNAME))).thenReturn(new ExpenseEntity());

        templateService.use(1L, new UseTemplateRequest(new BigDecimal("7.20"), null, null), USERNAME, NOW);

        ArgumentCaptor<Expense> expense = ArgumentCaptor.forClass(Expense.class);
        verify(expenseService).saveExpense(expense.capture(), eq(USERNAME));
        assertEquals(new BigDecimal("7.20"), expense.getValue().getPrice());
    }

    @Test
    void shouldTakeDescriptionGivenWhenUsing() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template(null, null)));
        when(expenseService.saveExpense(any(Expense.class), eq(USERNAME))).thenReturn(new ExpenseEntity());

        templateService.use(1L, new UseTemplateRequest(new BigDecimal("30.00"), null, "  obiad z rodzicami "), USERNAME, NOW);

        ArgumentCaptor<Expense> expense = ArgumentCaptor.forClass(Expense.class);
        verify(expenseService).saveExpense(expense.capture(), eq(USERNAME));
        assertEquals("obiad z rodzicami", expense.getValue().getDescription());
    }

    @Test
    void shouldRequirePriceWhenTemplateHasNone() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template(null, null)));

        assertThrows(InvalidRequestException.class, () -> templateService.use(1L, null, USERNAME, NOW));

        verifyNoInteractions(expenseService);
    }

    @Test
    void shouldAcceptPriceGivenForTemplateWithoutOne() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template(null, null)));
        when(expenseService.saveExpense(any(Expense.class), eq(USERNAME))).thenReturn(new ExpenseEntity());

        templateService.use(1L, new UseTemplateRequest(new BigDecimal("12.00"), null, null), USERNAME, NOW);

        ArgumentCaptor<Expense> expense = ArgumentCaptor.forClass(Expense.class);
        verify(expenseService).saveExpense(expense.capture(), eq(USERNAME));
        assertEquals(new BigDecimal("12.00"), expense.getValue().getPrice());
    }

    @Test
    void shouldSaveTemplateWithTrimmedNameAndBlankTitleAsNull() {
        CategoryEntity category = new CategoryEntity();
        category.setId(10L);
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(20L);

        when(categoryService.getCategory(10L)).thenReturn(category);
        when(memberService.getMember(20L)).thenReturn(member);
        when(templateRepository.save(any(ExpenseTemplateEntity.class))).thenAnswer(i -> i.getArgument(0));

        ExpenseTemplateEntity saved = templateService.save(
                ExpenseTemplate.builder()
                        .name("  Bread ")
                        .title("   ")
                        .categoryId(10L)
                        .memberId(20L)
                        .paymentSource(PaymentSource.SHARED_CARD)
                        .build()
        );

        assertEquals("Bread", saved.getName());
        assertNull(saved.getTitle());
        assertNull(saved.getPrice());
        assertSame(category, saved.getCategory());
        assertSame(member, saved.getMember());
    }

    @Test
    void shouldThrowExceptionIfTemplateNotFound() {
        when(templateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> templateService.get(99L));
    }

    @Test
    void shouldDeleteTemplate() {
        ExpenseTemplateEntity bread = template(null, null);

        when(templateRepository.findById(1L)).thenReturn(Optional.of(bread));

        templateService.delete(1L);

        verify(templateRepository).delete(bread);
    }
}
