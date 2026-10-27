package com.github.rodis00.backend.expense;

import com.github.rodis00.backend.category.CategoryService;
import com.github.rodis00.backend.entity.CategoryEntity;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.entity.UserEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.member.MemberService;
import com.github.rodis00.backend.page.GlobalPage;
import com.github.rodis00.backend.user.UserService;
import com.github.rodis00.backend.utils.TitleFormatter;
import com.github.rodis00.backend.validators.DateValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserService userService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private MemberService memberService;

    @Mock
    private DateValidator dateValidator;

    @Mock
    private ExpenseSearchDao expenseSearchDao;

    @InjectMocks
    private ExpenseService expenseService;

    private CategoryEntity category(Long id, String name) {
        CategoryEntity category = new CategoryEntity();
        category.setId(id);
        category.setName(name);
        return category;
    }

    private HouseholdMemberEntity member(Long id, String name) {
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(id);
        member.setName(name);
        return member;
    }

    @Test
    void shouldCapitalizeFirstLetter() {
        assertEquals("E", TitleFormatter.capitalizeFirstLetter("e"));
        assertEquals("Expense test", TitleFormatter.capitalizeFirstLetter("expense test"));
        assertEquals("Expense", TitleFormatter.capitalizeFirstLetter("expense"));
        assertEquals("123", TitleFormatter.capitalizeFirstLetter("123"));
    }

    @Test
    void shouldSaveExpense() {
        String username = "tester";

        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUsername("tester");

        LocalDateTime date = LocalDateTime.of(2024, 5, 24, 14, 54);
        Expense newExpense = new Expense();
        newExpense.setTitle("car");
        newExpense.setDate(date);
        newExpense.setPrice(new BigDecimal("6000.00"));
        newExpense.setCategoryId(10L);
        newExpense.setMemberId(20L);
        newExpense.setPaymentSource(PaymentSource.PRIVATE_CARD);
        newExpense.setUsageAmount(new BigDecimal("12.500"));
        newExpense.setDescription("car description");

        CategoryEntity category = category(10L, "Transport");
        HouseholdMemberEntity member = member(20L, "Anna");

        ExpenseEntity expectedExpense = new ExpenseEntity();
        expectedExpense.setId(1L);
        expectedExpense.setTitle("Car");
        expectedExpense.setPrice(new BigDecimal("6000.00"));
        expectedExpense.setDate(date);
        expectedExpense.setUser(user);
        expectedExpense.setCreatedAt(date);
        expectedExpense.setUpdatedAt(date);
        expectedExpense.setCategory(category);
        expectedExpense.setMember(member);
        expectedExpense.setPaymentSource(PaymentSource.PRIVATE_CARD);
        expectedExpense.setUsageAmount(new BigDecimal("12.500"));
        expectedExpense.setDescription("car description");
        expectedExpense.setSlug("expense-1");

        when(userService.getUserByUsername(username)).thenReturn(user);
        when(categoryService.getCategory(10L)).thenReturn(category);
        when(memberService.getMember(20L)).thenReturn(member);
        when(expenseRepository.save(any(ExpenseEntity.class))).thenReturn(expectedExpense);
        doNothing().when(dateValidator).validate(newExpense.getDate());

        ExpenseEntity savedExpense = expenseService.saveExpense(newExpense, username);

        assertNotNull(savedExpense);
        assertEquals(expectedExpense.getId(), savedExpense.getId());
        assertEquals(expectedExpense.getTitle(), savedExpense.getTitle());
        assertEquals(expectedExpense.getPrice(), savedExpense.getPrice());
        assertEquals(expectedExpense.getDate(), savedExpense.getDate());
        assertEquals(expectedExpense.getUser().getId(), savedExpense.getUser().getId());
        assertEquals(expectedExpense.getCreatedAt(), savedExpense.getCreatedAt());
        assertEquals(expectedExpense.getUpdatedAt(), savedExpense.getUpdatedAt());
        assertEquals(expectedExpense.getCategory(), savedExpense.getCategory());
        assertEquals(expectedExpense.getMember(), savedExpense.getMember());
        assertEquals(expectedExpense.getPaymentSource(), savedExpense.getPaymentSource());
        assertEquals(expectedExpense.getUsageAmount(), savedExpense.getUsageAmount());
        assertEquals(expectedExpense.getDescription(), savedExpense.getDescription());
        assertEquals(expectedExpense.getSlug(), savedExpense.getSlug());

        verify(userService, times(1)).getUserByUsername(username);
        verify(dateValidator, times(1)).validate(newExpense.getDate());
        verify(expenseRepository, times(1)).save(any(ExpenseEntity.class));
    }

    @Test
    void shouldReturnExpenseBySlug() {
        String slug = "expense-1";

        ExpenseEntity expense = new ExpenseEntity();
        expense.setId(1L);
        expense.setSlug(slug);

        when(expenseRepository.findBySlug(slug)).thenReturn(Optional.of(expense));

        ExpenseEntity expectedExpense = expenseService.getExpenseBySlug(slug);

        assertNotNull(expectedExpense);
        assertEquals(expense.getId(), expectedExpense.getId());
        assertEquals(expense.getTitle(), expectedExpense.getTitle());

        verify(expenseRepository, times(1)).findBySlug(slug);
    }

    @Test
    void shouldThrowExceptionIfExpenseNotFound() {
        String slug = "expense-1";

        when(expenseRepository.findBySlug(slug)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            expenseService.getExpenseBySlug(slug);
        });

        verify(expenseRepository, times(1)).findBySlug(slug);
    }

    @Test
    void shouldFullyUpdateExpense() {
        String slug = "expense-1";

        Expense newExpense = new Expense();
        newExpense.setTitle("new expense");
        newExpense.setPrice(new BigDecimal("150.00"));
        newExpense.setDate(LocalDateTime.of(2024, 5, 25, 18, 28));
        newExpense.setCategoryId(11L);
        newExpense.setMemberId(21L);
        newExpense.setPaymentSource(PaymentSource.SHARED_CARD);
        newExpense.setDescription("new expense description");

        ExpenseEntity expected = new ExpenseEntity();
        expected.setTitle("New expense");
        expected.setPrice(new BigDecimal("150.00"));
        expected.setDate(LocalDateTime.of(2024, 5, 25, 18, 28));
        expected.setDescription("new expense description");

        CategoryEntity newCategory = category(11L, "Other");
        HouseholdMemberEntity newMember = member(21L, "Jan");

        when(expenseRepository.findBySlug(slug)).thenReturn(Optional.of(expected));
        when(categoryService.getCategory(11L)).thenReturn(newCategory);
        when(memberService.getMember(21L)).thenReturn(newMember);
        when(expenseRepository.save(any(ExpenseEntity.class))).thenReturn(expected);

        ExpenseEntity result = expenseService.updateExpense(slug, newExpense);

        assertNotNull(result);
        assertEquals(expected.getTitle(), result.getTitle());
        assertEquals(expected.getPrice(), result.getPrice());
        assertEquals(expected.getDate(), result.getDate());
        assertEquals(newCategory, result.getCategory());
        assertEquals(newMember, result.getMember());
        assertEquals(PaymentSource.SHARED_CARD, result.getPaymentSource());
        assertEquals(expected.getDescription(), result.getDescription());

        verify(expenseRepository, times(1)).findBySlug(slug);
        verify(expenseRepository, times(1)).save(any(ExpenseEntity.class));
    }

    @Test
    void shouldReturnAllExpenses() {
        ExpenseEntity expense = new ExpenseEntity();
        expense.setId(1L);
        expense.setSlug("expense-1");

        ExpenseEntity expense2 = new ExpenseEntity();
        expense2.setId(2L);
        expense2.setSlug("expense-2");

        List<ExpenseEntity> expected = List.of(expense, expense2);

        when(expenseRepository.findAll()).thenReturn(expected);

        List<ExpenseEntity> result = expenseService.getAllExpenses();

        assertEquals(expected.size(), result.size());
        assertEquals(expected.get(0).getId(), result.get(0).getId());
        assertEquals(expected.get(0).getTitle(), result.get(0).getTitle());
        assertEquals(expected.get(1).getId(), result.get(1).getId());
        assertEquals(expected.get(1).getTitle(), result.get(1).getTitle());

        verify(expenseRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnAllUserExpenses() {
        String username = "tester";

        int year = 2024;
        int month = 5;

        ExpenseEntity expense = new ExpenseEntity();
        expense.setTitle("gift");
        expense.setSlug("expense-1");
        expense.setPrice(new BigDecimal("150.00"));
        expense.setDate(LocalDateTime.of(year, month, 10, 10, 10));

        doNothing().when(userService).checkIfUserExists(username);
        when(expenseSearchDao.findAllByUsernameYearAndMonth(username, year, month)).thenReturn(List.of(expense));

        List<ExpenseEntity> result = expenseService.getAllUserExpenses(username, year, month);

        assertNotNull(result);
        assertEquals(1, result.size());

        verify(userService, times(1)).checkIfUserExists(username);
        verify(expenseSearchDao, times(1)).findAllByUsernameYearAndMonth(username, year, month);
    }

    @Test
    void shouldDeleteExpenseBySlug() {
        String slug = "expense-1";

        ExpenseEntity expense = new ExpenseEntity();
        expense.setId(1L);

        when(expenseRepository.findBySlug(slug)).thenReturn(Optional.of(expense));
        doNothing().when(expenseRepository).delete(expense);

        expenseService.deleteExpenseBySlug(slug);

        verify(expenseRepository, times(1)).findBySlug(slug);
        verify(expenseRepository, times(1)).delete(expense);
    }

    @Test
    void shouldReturnAllExpensesByUserId() {
        String username = "john";
        int year = 2024;
        int month = 5;

        ExpenseEntity expense1 = new ExpenseEntity();
        expense1.setId(1L);
        expense1.setTitle("expense1");
        expense1.setCreatedAt(LocalDateTime.of(2024, 5, 25, 19, 50));
        expense1.setPrice(new BigDecimal("150.00"));

        ExpenseEntity expense2 = new ExpenseEntity();
        expense2.setId(2L);
        expense2.setTitle("expense2");
        expense2.setCreatedAt(LocalDateTime.of(2024, 5, 13, 2, 30));
        expense2.setPrice(new BigDecimal("100.00"));

        List<ExpenseEntity> expenses = List.of(expense1, expense2);

        GlobalPage page = new GlobalPage();
        page.setPageNumber(0);
        page.setPageSize(5);
        page.setSortDirection(Sort.Direction.DESC);
        page.setSortBy("createdAt");

        Sort sort = Sort.by(page.getSortDirection(), page.getSortBy());
        Pageable pageable = PageRequest.of(page.getPageNumber(), page.getPageSize(), sort);

        Page<ExpenseEntity> expectedPage = new PageImpl<>(expenses, pageable, expenses.size());

        doNothing().when(userService).checkIfUserExists(username);
        when(expenseRepository.findAllExpensesByUser_UsernameAndYear(username, year, month, pageable)).thenReturn(expectedPage);

        Page<ExpenseEntity> result = expenseService.findAllExpensesByUsername(username, page, year, month);

        assertNotNull(result);
        assertEquals(expectedPage.getTotalElements(), result.getTotalElements());
        assertEquals(expectedPage.getContent(), result.getContent());

        verify(userService, times(1)).checkIfUserExists(username);
        verify(expenseRepository, times(1))
                .findAllExpensesByUser_UsernameAndYear(username, year, month, pageable);
    }

    @Test
    void shouldReturnAllUserExpensesWithoutYearLimit() {
        String username = "janusz123";

        List<Integer> expectedYears = new ArrayList<>(
                List.of(2000, 2010, 2024)
        );

        when(expenseRepository.findYearsByUsername(username)).thenReturn(expectedYears);

        List<Integer> result = expenseService.getYears(username, false);

        assertNotNull(result);
        assertEquals(expectedYears.size(), result.size());
        assertEquals(expectedYears, result);

        verify(expenseRepository, times(1)).findYearsByUsername(username);
    }

    @Test
    void shouldReturnAllUserExpensesWithYearLimit() {
        String username = "janusz123";

        List<Integer> expectedYears = new ArrayList<>(
                List.of(2019, 2023, 2024, 2030)
        );

        when(expenseRepository.findYearsByUsernameAndDateRange(eq(username), any(), any())).thenReturn(expectedYears);

        List<Integer> result = expenseService.getYears(username, true);

        assertNotNull(result);
        assertEquals(expectedYears.size(), result.size());
        assertEquals(expectedYears, result);
    }

    @Test
    void shouldReturnCurrentYearIfThereIsNoExpenses() {
        int currentYear = LocalDate.now().getYear();
        String username = "janusz123";

        when(expenseRepository.findYearsByUsername(username)).thenReturn(List.of(currentYear));

        List<Integer> result = expenseService.getYears(username, false);

        assertNotNull(result);
        assertEquals(currentYear, result.get(0));

        verify(expenseRepository, times(1)).findYearsByUsername(username);
    }

    @Test
    void shouldReturnLastAddedUserExpense() {
        String username = "janusz123";
        UserEntity user = new UserEntity();
        user.setId(1L);

        ExpenseEntity expectedExpense = new ExpenseEntity();
        expectedExpense.setUser(user);
        expectedExpense.setTitle("Sell");
        expectedExpense.setPrice(new BigDecimal("100"));
        expectedExpense.setDate(LocalDateTime.of(2025, 3, 17, 15, 15));
        expectedExpense.setCategory(category(30L, "Clothes"));

        ExpenseDto expectedDto = ExpenseDto.from(expectedExpense);

        when(userService.getUserByUsername(username)).thenReturn(user);
        when(expenseRepository.findLastAdded(user.getId())).thenReturn(expectedExpense);

        ExpenseDto lastAdded = expenseService.getLastUserExpense(username);

        assertNotNull(lastAdded);
        assertEquals(expectedDto.getTitle(), lastAdded.getTitle());
        assertEquals(expectedDto.getPrice(), lastAdded.getPrice());
        assertEquals(expectedDto.getDate(), lastAdded.getDate());
        assertEquals(expectedDto.getCategoryId(), lastAdded.getCategoryId());
        assertEquals(List.of("Clothes"), lastAdded.getCategoryPath());

        verify(userService, times(1)).getUserByUsername(username);
        verify(expenseRepository, times(1)).findLastAdded(user.getId());
    }
}
