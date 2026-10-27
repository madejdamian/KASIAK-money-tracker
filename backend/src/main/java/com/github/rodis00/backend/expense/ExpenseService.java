package com.github.rodis00.backend.expense;

import com.github.rodis00.backend.category.CategoryService;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.UserEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.member.MemberService;
import com.github.rodis00.backend.page.GlobalPage;
import com.github.rodis00.backend.user.UserService;
import com.github.rodis00.backend.utils.TitleFormatter;
import com.github.rodis00.backend.validators.DateValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final MemberService memberService;
    private final ExpenseSearchDao expenseSearchDao;
    private final DateValidator dateValidator;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            UserService userService,
            CategoryService categoryService,
            MemberService memberService,
            ExpenseSearchDao expenseSearchDao,
            DateValidator dateValidator
    ) {
        this.expenseRepository = expenseRepository;
        this.userService = userService;
        this.categoryService = categoryService;
        this.memberService = memberService;
        this.expenseSearchDao = expenseSearchDao;
        this.dateValidator = dateValidator;
    }

    public ExpenseEntity saveExpense(
            Expense expense,
            String username
    ) {
        dateValidator.validate(expense.getDate());
        UserEntity user = userService.getUserByUsername(username);

        return expenseRepository.save(
                ExpenseEntity.builder()
                        .title(TitleFormatter.capitalizeFirstLetter(expense.getTitle()))
                        .date(expense.getDate())
                        .price(expense.getPrice())
                        .user(user)
                        .description(expense.getDescription())
                        .slug(generateSlug())
                        .category(categoryService.getCategory(expense.getCategoryId()))
                        .member(memberService.getMember(expense.getMemberId()))
                        .paymentSource(expense.getPaymentSource())
                        .usageAmount(expense.getUsageAmount())
                        .build()
        );
    }

    private String generateSlug() {
        return UUID.randomUUID().toString();
    }

    public ExpenseEntity getExpenseBySlug(String slug) {
        return expenseRepository
                .findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found."));
    }

    public ExpenseEntity updateExpense(
            String slug,
            Expense expense
    ) {
        dateValidator.validate(expense.getDate());
        ExpenseEntity actualExpense = getExpenseBySlug(slug);

        actualExpense.setTitle(TitleFormatter.capitalizeFirstLetter(expense.getTitle()));
        actualExpense.setPrice(expense.getPrice());
        actualExpense.setDate(expense.getDate());
        actualExpense.setDescription(expense.getDescription());
        actualExpense.setCategory(categoryService.getCategory(expense.getCategoryId()));
        actualExpense.setMember(memberService.getMember(expense.getMemberId()));
        actualExpense.setPaymentSource(expense.getPaymentSource());
        actualExpense.setUsageAmount(expense.getUsageAmount());
        expenseRepository.save(actualExpense);

        return actualExpense;
    }

    public List<ExpenseEntity> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public List<ExpenseEntity> getAllUserExpenses(
            String username,
            Integer year,
            Integer month
    ) {
        userService.checkIfUserExists(username);
        return expenseSearchDao.findAllByUsernameYearAndMonth(username, year, month);
    }

    public void deleteExpenseBySlug(String slug) {
        ExpenseEntity expense = getExpenseBySlug(slug);
        expenseRepository.delete(expense);
    }

    public Page<ExpenseEntity> findAllExpensesByUsername(
            String username,
            GlobalPage page,
            Integer year,
            Integer month
    ) {
        userService.checkIfUserExists(username);

        Sort sort = Sort.by(page.getSortDirection(), page.getSortBy());
        Pageable pageable = PageRequest.of(page.getPageNumber(), page.getPageSize(), sort);

        return expenseRepository.findAllExpensesByUser_UsernameAndYear(username, year, month, pageable);
    }

    public List<Integer> getYears(
            String username,
            boolean yearLimit
    ) {
        List<Integer> years;
        if (yearLimit) {
            LocalDateTime minDate = LocalDateTime.now().minusYears(5);
            LocalDateTime maxDate = LocalDateTime.now().plusYears(6);
            years = expenseRepository.findYearsByUsernameAndDateRange(username, minDate, maxDate);
        } else {
            years = expenseRepository.findYearsByUsername(username);
        }

        // return current year if there are no expenses
        int currentYear = LocalDate.now().getYear();
        if (!years.contains(currentYear)) {
            years.add(currentYear);
            years.sort(Integer::compareTo);
        }
        return years;
    }

    public ExpenseDto getLastUserExpense(String username) {
        UserEntity user = userService.getUserByUsername(username);
        ExpenseEntity expense = expenseRepository.findLastAdded(user.getId());

        return Optional.ofNullable(expense)
                .map(ExpenseDto::from).orElse(null);
    }
}
