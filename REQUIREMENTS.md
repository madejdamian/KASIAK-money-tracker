# Wymagania i wytyczne projektu

Dokument roboczy: tu zapisujemy potrzeby i wytyczne dotyczące aplikacji do śledzenia wydatków.
Na jego podstawie przeanalizujemy istniejący kod i ustalimy, co już jest, a co trzeba dodać.

## Cel aplikacji

_Do uzupełnienia._

## Wymagania funkcjonalne

### Budżet domowy
- [ ] Dodawanie budżetu domowego z wpłatami/wkładami od różnych domowników (każdy domownik wnosi swoją część).
- [ ] Nowy miesiąc zaczyna się od nowych wpłat: na początku miesiąca wpisujemy, ile każdy przelał na wspólne konto. Niewykorzystane saldo (dodatnie) z poprzedniego miesiąca przenosi się na kolejny; saldo ujemne się nie przenosi (nowy miesiąc startuje od zera).
- [ ] Możliwość dodania dodatkowych wpłat (extra) w trakcie miesiąca, również z informacją od kogo.

### Wydatki i kategorie
- [ ] Dodawanie wydatków wraz z przypisaniem do kategorii, domownika i karty (prywatna/wspólna).
- [ ] Opcjonalne wpisanie zużycia przy wydatku (np. prąd w kWh).
- [ ] Kategorie hierarchiczne o dowolnej głębokości, z możliwością podziału na różne poziomy szczegółowości:
  - ogólnie, np. „Streamingi VOD”,
  - szczegółowo, np. osobno każda posiadana usługa (Netflix, HBO, Disney+ itd.).
- [ ] Możliwość przełączania szczegółowości: rozdzielać wydatki bardziej lub mniej szczegółowo.
- [ ] Widok budżetu w podziale na kategorie nadrzędne, np. rozrywka, jedzenie, rachunki itp.
- [ ] Analiza wydatków na wielu poziomach (drill-down): od widoku całego budżetu, przez kategorie główne, aż do najniższych podkategorii. Przykład:
  - budżet -> rozrywka / zakupy domowe / opłaty,
  - zakupy domowe -> jedzenie / wyposażenie domu,
  - opłaty -> kredyt / czynsz / media -> prąd / woda / internet.
- [ ] Na każdym poziomie widoczna suma wydatków kategorii (z podkategoriami) i jej udział w budżecie.
- [ ] Analiza w okresach miesięcznych: porównanie miesiąc do miesiąca, zarówno kwot, jak i zużycia (np. zużycie prądu w kWh w kolejnych miesiącach).

### Dodatkowe funkcjonalności
- [ ] Wydatki cykliczne (czynsz, kredyt, abonamenty): dodają się automatycznie co miesiąc, użytkownik potwierdza je lub zmienia kwotę.
- [ ] Podsumowanie miesiąca na jednym ekranie: wpłaty, wydatki, saldo i saldo przeniesione z poprzedniego miesiąca.
- [ ] Wykresy: udział kategorii i trendy miesięczne, z drill-downem po poziomach kategorii.
- [ ] Porównanie z poprzednim miesiącem (oraz tym samym miesiącem rok wcześniej) z oznaczeniem największych różnic.
- [ ] Wyszukiwanie i filtry: po kategorii, domowniku, karcie, dacie, kwocie i tekście.
- [ ] Szablony i ostatnie wydatki: szybkie dodawanie powtarzalnych zakupów jednym kliknięciem.
- [ ] Tagi niezależne od kategorii (np. „wakacje”, „remont”), do śledzenia projektów przechodzących przez kilka kategorii.

### Ustalenia
- Jedno wspólne konto dla całego domu (bez osobnych kont/logowania domowników).
- Wydatek jest przypisany do domownika i do źródła płatności: karta prywatna lub karta wspólna.
- Budżet jest miesięczny, bez limitów na kategorie. Co miesiąc dochodzą nowe wpłaty, a dodatnie saldo przenosi się na kolejny miesiąc, a ujemne nie. Wpłaty mogą pojawiać się też w trakcie miesiąca.
- Kategorie mają dowolną głębokość zagnieżdżenia, np. rachunki -> media -> prąd.
- Kategoria może mieć dodatkowo wpisywane zużycie (np. kWh dla prądu) obok kwoty.
- Brak rozliczeń między domownikami (kto komu jest winien). Jeśli ktoś zapłaci prywatną kartą i zwróci sobie z konta wspólnego, zmienia w wydatku rodzaj płatności na wspólną.
- Poza zakresem: historia zmian wydatków, automatyczny koszt jednostkowy (zł/kWh), załączniki (paragony), eksport/import CSV, powiadomienia, cele oszczędnościowe, wiele walut.

## Wymagania niefunkcjonalne

- [ ] Aplikacja PWA (instalowalna na telefonie) - wymóg obowiązkowy.
- [ ] UI mobile-first: większość użycia będzie z telefonu, desktop jest drugorzędny.
- [ ] Szybkie dodawanie wydatku (mało kroków, wygodne na telefonie).

## Wytyczne techniczne

_Do uzupełnienia (konwencje, biblioteki, struktura kodu)._

## Pomysły na później

- ...

## Analiza istniejącego kodu

Stan na dzień analizy (kod pochodzi z gotowego projektu).

**Stack:** backend Java 17 + Spring Boot (JPA, Flyway, JWT, Swagger), PostgreSQL, frontend React + Vite + Tailwind + Redux Toolkit + TanStack Query + Chart.js, Docker Compose.

**Co jest:** osobne encje `Expense` i `Income` (tytuł, kwota, data, opis, kategoria jako enum, użytkownik), CRUD z paginacją i filtrem rok/miesiąc, logowanie i rejestracja (JWT), reset hasła mailem, zdjęcie profilu, dashboard z wykresami (doughnut, bar, line), lista transakcji, testy jednostkowe serwisów.

**Czego brakuje (najważniejsze):** model jest jednoosobowy (każdy użytkownik ma własne wydatki i przychody), kategorie to płaski, sztywny enum, a w aplikacji nie ma pojęcia budżetu domowego, miesięcy ani PWA.

| Wymaganie | Status | Uwagi |
|-----------|--------|-------|
| Dodawanie / edycja / usuwanie wydatków | Jest | `ExpenseController`, CRUD po `slug`; trzeba rozszerzyć o kartę, domownika i zużycie |
| Wpłaty do budżetu (przychody) | Częściowo | Jest `Income`, ale per użytkownik i z kategoriami typu SALARY/SELL; brak wpłat na wspólne konto, brak pola „od kogo”, brak wpłat extra |
| Jedno wspólne konto / budżet domowy | Brak | Dane są przypisane do `UserEntity`; potrzebna encja budżetu/gospodarstwa lub uproszczenie do jednego konta |
| Domownicy | Brak | Jest tylko `UserEntity` (login, e-mail, hasło); potrzebna lista domowników bez osobnych kont |
| Karta prywatna / wspólna | Brak | Brak pola rodzaju płatności w `ExpenseEntity` |
| Kategorie hierarchiczne, dowolna głębokość | Brak | `ExpenseCategory` to enum (FOOD, HOUSE, ...); potrzebna tabela kategorii z `parent_id` i migracja Flyway |
| Przełączanie szczegółowości kategorii | Brak | Zależy od hierarchii kategorii |
| Zużycie przy wydatku (np. kWh) | Brak | Brak pola w encji i formularzu |
| Wydatki cykliczne | Brak | W `Summaries.jsx` jest tylko zakomentowana makieta „Schedules”, bez backendu |
| Miesięczny budżet z przenoszeniem dodatniego salda | Brak | Jest filtr rok/miesiąc, ale nie ma logiki salda i okresów rozliczeniowych |
| Podsumowanie miesiąca | Częściowo | Dashboard pokazuje wartości i wykresy; trzeba sprawdzić, jak liczy saldo |
| Drill-down po poziomach kategorii | Brak | Wykresy działają na płaskich kategoriach |
| Wykresy i trendy miesięczne | Częściowo | Są `DoughnutChart`, `BarChart`, `LineChart`; do dostosowania do nowego modelu |
| Porównanie miesiąc do miesiąca, zużycia | Brak | |
| Wyszukiwanie i filtry | Częściowo | Jest tylko filtr rok/miesiąc i sortowanie; brak filtrów po kategorii, karcie, domowniku, kwocie, tekście |
| Szablony / ostatnie wydatki | Częściowo | Jest endpoint `last-added` i komponent `LatestAdded`; brak szablonów |
| Tagi | Brak | |
| PWA | Brak | Brak manifestu, service workera i wtyczki PWA w Vite |
| UI mobile-first | Częściowo | Widoki mają klasy responsywne (Tailwind), ale to układ desktop-first i trzeba go przejrzeć pod telefon |
| Logowanie, reset hasła, profil | Jest | Przy jednym wspólnym koncie część (rejestracja, reset hasła, zdjęcie) może być zbędna; do decyzji |

### Uwagi do decyzji
- Dane startowe `data.sql` generują losowe wydatki i przychody dla użytkownika `admin`; do usunięcia lub zmiany.
- `Summaries.jsx` to wyłącznie makieta („Section in progress”), czyli miejsce na przyszłe podsumowania.
- Kategorie trzeba przenieść z enumów do bazy (tabela + migracja), bo od tego zależą hierarchia, drill-down i wykresy.
- Endpointy mają `username` w ścieżce; przy jednym wspólnym koncie można to uprościć.
