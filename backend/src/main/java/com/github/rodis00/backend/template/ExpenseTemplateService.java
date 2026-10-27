package com.github.rodis00.backend.template;

import com.github.rodis00.backend.category.CategoryService;
import com.github.rodis00.backend.entity.ExpenseEntity;
import com.github.rodis00.backend.entity.ExpenseTemplateEntity;
import com.github.rodis00.backend.exception.EntityNotFoundException;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.Expense;
import com.github.rodis00.backend.expense.ExpenseService;
import com.github.rodis00.backend.member.MemberService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Saved expense presets for adding frequent purchases with one tap.
 */
@Service
public class ExpenseTemplateService {

    private final ExpenseTemplateRepository templateRepository;
    private final CategoryService categoryService;
    private final MemberService memberService;
    private final ExpenseService expenseService;

    public ExpenseTemplateService(
            ExpenseTemplateRepository templateRepository,
            CategoryService categoryService,
            MemberService memberService,
            ExpenseService expenseService
    ) {
        this.templateRepository = templateRepository;
        this.categoryService = categoryService;
        this.memberService = memberService;
        this.expenseService = expenseService;
    }

    public List<ExpenseTemplateEntity> getAll() {
        return templateRepository.findAllByOrderByNameAsc();
    }

    public ExpenseTemplateEntity get(Long id) {
        return templateRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found."));
    }

    public ExpenseTemplateEntity save(ExpenseTemplate request) {
        return templateRepository.save(fill(new ExpenseTemplateEntity(), request));
    }

    public ExpenseTemplateEntity update(Long id, ExpenseTemplate request) {
        return templateRepository.save(fill(get(id), request));
    }

    public void delete(Long id) {
        templateRepository.delete(get(id));
    }

    /**
     * Adds an expense dated now from the template. The price comes from the template unless
     * `changes` gives one; one of them is required.
     */
    public ExpenseEntity use(
            Long id,
            UseTemplateRequest changes,
            String username,
            LocalDateTime now
    ) {
        ExpenseTemplateEntity template = get(id);

        BigDecimal price = changes != null && changes.getPrice() != null
                ? changes.getPrice()
                : template.getPrice();
        if (price == null) {
            throw new InvalidRequestException("This template has no price, give one.");
        }

        Expense expense = Expense.builder()
                .title(template.getTitle() == null || template.getTitle().isBlank()
                        ? template.getName()
                        : template.getTitle())
                .price(price)
                .date(now)
                .categoryId(template.getCategory().getId())
                .memberId(template.getMember().getId())
                .paymentSource(template.getPaymentSource())
                .usageAmount(changes != null && changes.getUsageAmount() != null
                        ? changes.getUsageAmount()
                        : template.getUsageAmount())
                .description(template.getDescription())
                .build();

        return expenseService.saveExpense(expense, username);
    }

    private ExpenseTemplateEntity fill(ExpenseTemplateEntity template, ExpenseTemplate request) {
        template.setName(request.getName().trim());
        template.setTitle(request.getTitle() == null || request.getTitle().isBlank()
                ? null
                : request.getTitle().trim());
        template.setPrice(request.getPrice());
        template.setCategory(categoryService.getCategory(request.getCategoryId()));
        template.setMember(memberService.getMember(request.getMemberId()));
        template.setPaymentSource(request.getPaymentSource());
        template.setUsageAmount(request.getUsageAmount());
        template.setDescription(request.getDescription());
        return template;
    }
}
