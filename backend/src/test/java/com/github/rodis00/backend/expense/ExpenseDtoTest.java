package com.github.rodis00.backend.expense;

import com.github.rodis00.backend.entity.CategoryEntity;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.entity.TagEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ExpenseDtoTest {

    private ExpenseEntity expense;

    private final String slug = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime
                .of(2025, 3, 13,14,9,12);
        expense = new ExpenseEntity();
        expense.setSlug(slug);
        expense.setTitle("expense");
        expense.setPrice(new BigDecimal("100.00"));
        expense.setDate(now);
        CategoryEntity parent = new CategoryEntity();
        parent.setId(1L);
        parent.setName("Bills");
        CategoryEntity category = new CategoryEntity();
        category.setId(2L);
        category.setName("Electricity");
        category.setUnit("kWh");
        category.setParent(parent);
        expense.setCategory(category);
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(3L);
        member.setName("Anna");
        expense.setMember(member);
        expense.setPaymentSource(PaymentSource.SHARED_CARD);
        expense.setUsageAmount(new BigDecimal("150.500"));
        TagEntity tagB = new TagEntity();
        tagB.setName("remont");
        TagEntity tagA = new TagEntity();
        tagA.setName("dom");
        expense.setTags(Set.of(tagB, tagA));
        expense.setCreatedAt(now);
        expense.setUpdatedAt(now);
        expense.setDescription("expense");
    }

    @Test
    void shouldReturnExpenseDto() {
        ExpenseDto expectedDto = new ExpenseDto(
                expense.getSlug(),
                expense.getTitle(),
                expense.getPrice(),
                expense.getDate(),
                expense.getCategory().getId(),
                List.of("Bills", "Electricity"),
                expense.getCategory().getUnit(),
                expense.getMember().getId(),
                expense.getMember().getName(),
                expense.getPaymentSource(),
                expense.getUsageAmount(),
                expense.getCreatedAt(),
                expense.getUpdatedAt(),
                expense.getDescription(),
                List.of("dom", "remont")
        );

        ExpenseDto expenseDto = ExpenseDto.from(expense);

        assertNotNull(expenseDto);
        assertEquals(expectedDto.getSlug(), expenseDto.getSlug());
        assertEquals(expectedDto.getTitle(), expenseDto.getTitle());
        assertEquals(expectedDto.getPrice(), expenseDto.getPrice());
        assertEquals(expectedDto.getDate(), expenseDto.getDate());
        assertEquals(expectedDto.getCategoryId(), expenseDto.getCategoryId());
        assertEquals(expectedDto.getCategoryPath(), expenseDto.getCategoryPath());
        assertEquals(expectedDto.getUnit(), expenseDto.getUnit());
        assertEquals(expectedDto.getMemberId(), expenseDto.getMemberId());
        assertEquals(expectedDto.getMemberName(), expenseDto.getMemberName());
        assertEquals(expectedDto.getPaymentSource(), expenseDto.getPaymentSource());
        assertEquals(expectedDto.getUsageAmount(), expenseDto.getUsageAmount());
        assertEquals(expectedDto.getCreatedAt(), expenseDto.getCreatedAt());
        assertEquals(expectedDto.getUpdatedAt(), expenseDto.getUpdatedAt());
        assertEquals(expectedDto.getDescription(), expenseDto.getDescription());
        assertEquals(expectedDto.getTags(), expenseDto.getTags());
    }
}