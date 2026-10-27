package com.github.rodis00.backend.income;

import com.github.rodis00.backend.entity.HouseholdMemberEntity;
import com.github.rodis00.backend.entity.IncomeEntity;
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
class IncomeServiceTest {

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private UserService userService;

    @Mock
    private MemberService memberService;

    @Mock
    private DateValidator dateValidator;

    @Mock
    private IncomeSearchDao incomeSearchDao;

    @InjectMocks
    private IncomeService incomeService;

    @Test
    void shouldCapitalizeFirstLetter() {
        assertEquals("Income", TitleFormatter.capitalizeFirstLetter("income"));
        assertEquals("E", TitleFormatter.capitalizeFirstLetter("e"));
        assertEquals("Test income", TitleFormatter.capitalizeFirstLetter("test income"));
        assertEquals("123", TitleFormatter.capitalizeFirstLetter("123"));
    }

    private HouseholdMemberEntity member(Long id, String name) {
        HouseholdMemberEntity member = new HouseholdMemberEntity();
        member.setId(id);
        member.setName(name);
        return member;
    }

    @Test
    void shouldSaveIncome() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUsername("jurek123");

        LocalDateTime incomeDate = LocalDateTime.of(2024, 5, 24, 14, 54);

        Income newIncome = new Income();
        newIncome.setTitle("pension");
        newIncome.setAmount(new BigDecimal("5000.00"));
        newIncome.setDate(incomeDate);
        newIncome.setMemberId(20L);
        newIncome.setDepositType(DepositType.EXTRA);
        newIncome.setDescription("pension description");

        HouseholdMemberEntity member = member(20L, "Anna");

        IncomeEntity expectedIncome = new IncomeEntity();
        expectedIncome.setId(1L);
        expectedIncome.setTitle("Pension");
        expectedIncome.setAmount(new BigDecimal("5000.00"));
        expectedIncome.setDate(incomeDate);
        expectedIncome.setUser(user);
        expectedIncome.setCreatedAt(incomeDate);
        expectedIncome.setUpdatedAt(incomeDate);
        expectedIncome.setMember(member);
        expectedIncome.setDepositType(DepositType.EXTRA);
        expectedIncome.setDescription("pension description");
        expectedIncome.setSlug("income slug");

        when(userService.getUserByUsername(user.getUsername())).thenReturn(user);
        when(memberService.getMember(20L)).thenReturn(member);
        when(incomeRepository.save(any(IncomeEntity.class))).thenReturn(expectedIncome);
        doNothing().when(dateValidator).validate(newIncome.getDate());

        IncomeEntity savedIncome = incomeService.saveIncome(newIncome, user.getUsername());

        assertNotNull(savedIncome);
        assertEquals(expectedIncome.getId(), savedIncome.getId());
        assertEquals(expectedIncome.getTitle(), savedIncome.getTitle());
        assertEquals(expectedIncome.getAmount(), savedIncome.getAmount());
        assertEquals(expectedIncome.getDate(), savedIncome.getDate());
        assertEquals(expectedIncome.getUser().getId(), savedIncome.getUser().getId());
        assertEquals(expectedIncome.getCreatedAt(), savedIncome.getCreatedAt());
        assertEquals(expectedIncome.getUpdatedAt(), savedIncome.getUpdatedAt());
        assertEquals(expectedIncome.getMember(), savedIncome.getMember());
        assertEquals(expectedIncome.getDepositType(), savedIncome.getDepositType());
        assertEquals(expectedIncome.getDescription(), savedIncome.getDescription());
        assertEquals(expectedIncome.getSlug(), savedIncome.getSlug());

        verify(userService, times(1)).getUserByUsername(user.getUsername());
        verify(dateValidator, times(1)).validate(newIncome.getDate());
        verify(incomeRepository, times(1)).save(any(IncomeEntity.class));
    }

    @Test
    void shouldGetIncomeBySlug() {
        IncomeEntity income = new IncomeEntity();
        income.setTitle("pension");
        income.setAmount(new BigDecimal("5000.00"));
        income.setDate(LocalDateTime.of(2024, 5, 24, 14, 54));
        income.setDescription("pension description");
        income.setSlug("pension slug");

        when(incomeRepository.findBySlug(income.getSlug())).thenReturn(Optional.of(income));

        IncomeEntity existingIncome = incomeService.getIncomeBySlug(income.getSlug());

        assertNotNull(existingIncome);
        assertEquals(income.getSlug(), existingIncome.getSlug());
        assertEquals(income.getTitle(), existingIncome.getTitle());

        verify(incomeRepository, times(1)).findBySlug(income.getSlug());
    }

    @Test
    void shouldThrowExceptionIfIncomeNotFound() {
        String slug = "income slug";

        when(incomeRepository.findBySlug(slug)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            incomeService.getIncomeBySlug(slug);
        });

        verify(incomeRepository, times(1)).findBySlug(slug);
    }

    @Test
    void shouldFullyUpdateIncome() {
        LocalDateTime newDate = LocalDateTime.of(2024, 5, 24, 14, 54);
        String slug = "income slug";

        Income income = new Income();
        income.setTitle("sell potato xD");
        income.setAmount(new BigDecimal("100"));
        income.setDate(newDate);
        income.setMemberId(21L);
        income.setDescription("sell description");

        IncomeEntity expectedIncome = new IncomeEntity();
        expectedIncome.setTitle("Sell potato xD");
        expectedIncome.setAmount(new BigDecimal("100"));
        expectedIncome.setDate(newDate);
        expectedIncome.setDescription("sell description");

        HouseholdMemberEntity newMember = member(21L, "Jan");

        when(memberService.getMember(21L)).thenReturn(newMember);
        when(incomeRepository.findBySlug(slug)).thenReturn(Optional.of(expectedIncome));
        when(incomeRepository.save(any(IncomeEntity.class))).thenReturn(expectedIncome);

        IncomeEntity savedIncome = incomeService.updateIncome(slug, income);

        assertNotNull(savedIncome);
        assertEquals(expectedIncome.getTitle(), savedIncome.getTitle());
        assertEquals(expectedIncome.getAmount(), savedIncome.getAmount());
        assertEquals(expectedIncome.getDate(), savedIncome.getDate());
        assertEquals(newMember, savedIncome.getMember());
        assertEquals(DepositType.MONTHLY, savedIncome.getDepositType());

        verify(incomeRepository, times(1)).findBySlug(slug);
        verify(incomeRepository, times(1)).save(any(IncomeEntity.class));
    }

    @Test
    void shouldReturnAllIncomes() {
        IncomeEntity income = new IncomeEntity();
        income.setTitle("Work");
        income.setAmount(new BigDecimal("5000.00"));

        when(incomeService.getAllIncomes()).thenReturn(List.of(income));

        List<IncomeEntity> allIncomes = incomeService.getAllIncomes();

        assertNotNull(allIncomes);
        assertEquals(1, allIncomes.size());
    }

    @Test
    void shouldReturnAllUserIncomes() {
        String username = "tester";
        int year = 2024;
        int month = 5;

        IncomeEntity income = new IncomeEntity();
        income.setTitle("Work");
        income.setAmount(new BigDecimal("5000.00"));
        income.setDate(LocalDateTime.of(2024, 5, 24, 14, 54));

        doNothing().when(userService).checkIfUserExists(username);
        when(incomeSearchDao.findAllByUsernameYearAndMonth(username, year, month)).thenReturn(List.of(income));

        List<IncomeEntity> incomes = incomeService.getAllUserIncomes(username, year, month);

        assertNotNull(incomes);
        assertEquals(1, incomes.size());

        verify(userService, times(1)).checkIfUserExists(username);
        verify(incomeSearchDao, times(1)).findAllByUsernameYearAndMonth(username, year, month);
    }

    @Test
    void shouldDeleteIncomeBySlug() {
        String slug = "income slug";

        IncomeEntity income = new IncomeEntity();

        when(incomeRepository.findBySlug(slug)).thenReturn(Optional.of(income));
        doNothing().when(incomeRepository).delete(income);

        incomeService.deleteIncomeBySlug(slug);

        verify(incomeRepository, times(1)).findBySlug(slug);
        verify(incomeRepository, times(1)).delete(income);
    }

    @Test
    void shouldReturnAllIncomesByUserId() {
        String username = "tester";
        int year = 2024;
        int month = 5;

        IncomeEntity income = new IncomeEntity();
        income.setTitle("Work");
        income.setAmount(new BigDecimal("5000.00"));
        income.setCreatedAt(LocalDateTime.of(2024, 5, 24, 14, 54));

        IncomeEntity income2 = new IncomeEntity();
        income2.setTitle("Sell");
        income2.setAmount(new BigDecimal("2000.00"));
        income2.setCreatedAt(LocalDateTime.of(2024, 5, 11, 8, 33));

        List<IncomeEntity> incomes = List.of(income, income2);

        GlobalPage page = new GlobalPage();
        page.setPageSize(10);
        page.setPageNumber(0);
        page.setSortDirection(Sort.Direction.DESC);
        page.setSortBy("createdAt");

        Sort sort = Sort.by(page.getSortDirection(), page.getSortBy());
        Pageable pageable = PageRequest.of(page.getPageNumber(), page.getPageSize(), sort);

        Page<IncomeEntity> expectedPage = new PageImpl<>(incomes, pageable, incomes.size());

        doNothing().when(userService).checkIfUserExists(username);
        when(incomeRepository.findAllIncomesByUser_UsernameAndYear(username, year, month, pageable)).thenReturn(expectedPage);

        Page<IncomeEntity> result = incomeService.findAllIncomesByUserId(username, page, year, month);

        assertNotNull(result);
        assertEquals(expectedPage.getContent(), result.getContent());
        assertEquals(expectedPage.getTotalElements(), result.getTotalElements());

        verify(userService, times(1)).checkIfUserExists(username);
        verify(incomeRepository, times(1)).findAllIncomesByUser_UsernameAndYear(username, year, month, pageable);
    }

    @Test
    void shouldReturnAllUserIncomesWithoutYearLimit() {
        String username = "janusz123";

        List<Integer> expectedYears = new ArrayList<>(
                List.of(2000, 2010, 2024)
        );

        when(incomeRepository.findYearsByUsername(username)).thenReturn(expectedYears);

        List<Integer> incomeYears = incomeService.getYears(username, false);

        assertNotNull(incomeYears);
        assertEquals(expectedYears.size(), incomeYears.size());
        assertEquals(expectedYears, incomeYears);

        verify(incomeRepository, times(1)).findYearsByUsername(username);
    }

    @Test
    void shouldReturnAllUserIncomesWithYearLimit() {
        String username = "janusz123";

        List<Integer> expectedYears = new ArrayList<>(
                List.of(2019, 2023, 2024, 2030)
        );

        when(incomeRepository.findYearsByUsernameAndDateRange(eq(username), any(), any())).thenReturn(expectedYears);

        List<Integer> incomeYears = incomeService.getYears(username, true);

        assertNotNull(incomeYears);
        assertEquals(expectedYears.size(), incomeYears.size());
        assertEquals(expectedYears, incomeYears);
    }

    @Test
    void shouldReturnCurrentYearIfThereIsNoIncomes() {
        int currentYear = LocalDate.now().getYear();
        String username = "janusz123";

        when(incomeRepository.findYearsByUsername(username)).thenReturn(List.of(currentYear));

        List<Integer> incomeYears = incomeService.getYears(username, false);

        assertNotNull(incomeYears);
        assertEquals(currentYear, incomeYears.get(0));

        verify(incomeRepository, times(1)).findYearsByUsername(username);
    }

    @Test
    void shouldReturnLastAddedUserIncome() {
        String username = "janusz123";
        UserEntity user = new UserEntity();
        user.setId(1L);

        IncomeEntity expectedIncome = new IncomeEntity();
        expectedIncome.setUser(user);
        expectedIncome.setTitle("Sell");
        expectedIncome.setAmount(new BigDecimal("100"));
        expectedIncome.setDate(LocalDateTime.of(2025, 3, 17, 15, 15));
        expectedIncome.setMember(member(22L, "Ola"));

        IncomeDto expectedDto = IncomeDto.from(expectedIncome);

        when(userService.getUserByUsername(username)).thenReturn(user);
        when(incomeRepository.findLastAdded(user.getId())).thenReturn(expectedIncome);

        IncomeDto lastAdded = incomeService.getLastUserIncome(username);

        assertNotNull(lastAdded);
        assertEquals(expectedDto.getTitle(), lastAdded.getTitle());
        assertEquals(expectedDto.getAmount(), lastAdded.getAmount());
        assertEquals(expectedDto.getDate(), lastAdded.getDate());
        assertEquals(expectedDto.getMemberId(), lastAdded.getMemberId());

        verify(userService, times(1)).getUserByUsername(username);
        verify(incomeRepository, times(1)).findLastAdded(user.getId());
    }
}
