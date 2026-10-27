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
- Autoryzacja: jeden użytkownik z hasłem, sesja zapamiętana w PWA; bez zaawansowanych mechanizmów.
- Uproszczenie istniejącego kodu: rezygnujemy z rejestracji, resetu hasła mailem i zdjęcia profilu (jedno wspólne konto).
- Dane testowe z `data.sql` (losowe wydatki i przychody dla `admin`) do usunięcia.
- Poza zakresem: historia zmian wydatków, automatyczny koszt jednostkowy (zł/kWh), załączniki (paragony), eksport/import CSV, powiadomienia, cele oszczędnościowe, wiele walut.

## Wymagania niefunkcjonalne

- [ ] Aplikacja PWA (instalowalna na telefonie) - wymóg obowiązkowy.
- [ ] UI mobile-first: większość użycia będzie z telefonu, desktop jest drugorzędny.
- [ ] Szybkie dodawanie wydatku (mało kroków, wygodne na telefonie).
- [ ] Autoryzacja prosta: jeden użytkownik, logowanie hasłem, żeby osoby postronne nie widziały danych. Aplikacja tylko do użytku prywatnego, bez zaawansowanych opcji (bez ról, rejestracji, resetu hasła, 2FA itp.).
- [ ] Zalogowanie jest zapamiętywane w PWA (długa sesja), żeby nie wpisywać hasła przy każdym otwarciu aplikacji na telefonie.

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
| Wpłaty do budżetu (przychody) | Backend gotowy | `Income` ma pole „od kogo” (`memberId`) i typ wpłaty `MONTHLY`/`EXTRA`; stare kategorie przychodów usunięte. Saldo miesięczne: etap 3 |
| Jedno wspólne konto / budżet domowy | Brak | Dane są przypisane do `UserEntity`; potrzebna encja budżetu/gospodarstwa lub uproszczenie do jednego konta |
| Domownicy | Backend gotowy | Encja `HouseholdMember` i API `/members` (lista, dodawanie, zmiana nazwy, usuwanie bez powiązanych danych). Frontend: etap 4 |
| Karta prywatna / wspólna | Backend gotowy | Pole `paymentSource` (PRIVATE_CARD / SHARED_CARD) w wydatku. Frontend: etap 4 |
| Kategorie hierarchiczne, dowolna głębokość | Backend gotowy | Tabela `category` z `parent_id`, API `/categories` (drzewo, dodawanie, przenoszenie, usuwanie), migracja V23 z przykładowymi kategoriami. Frontend: etap 4 |
| Przełączanie szczegółowości kategorii | Jest (bez uruchomienia) | Widok „Drzewo” oraz płaskie widoki „Poz. 1/2/3” z zsumowaniem głębszych kategorii |
| Zużycie przy wydatku (np. kWh) | Backend gotowy | Pole `usageAmount` w wydatku i jednostka `unit` w kategorii. Frontend: etap 4 |
| Wydatki cykliczne | Jest (bez uruchomienia) | Reguły (`/recurring`): co miesiąc propozycja do potwierdzenia ze zmianą kwoty/zużycia lub pominięciem; niepotwierdzone miesiące czekają do roku wstecz |
| Miesięczny budżet z przenoszeniem dodatniego salda | Backend gotowy | `GET /budget/summary?year=&month=`: saldo z poprzedniego miesiąca (tylko dodatnie) + wpłaty (miesięczne i extra, per domownik) - wydatki ze wspólnej karty. Frontend: etap 4 |
| Podsumowanie miesiąca | Backend gotowy | Dane z `/budget/summary`; ekran w etapie 4 (dashboard liczy saldo po staremu) |
| Drill-down po poziomach kategorii | Jest (bez uruchomienia) | Ekran „Analizy”: drzewo z klikaniem w głąb i ścieżką, sumy z podkategoriami i udział % |
| Wykresy i trendy miesięczne | Jest (bez uruchomienia) | Paski wydatków za ostatnie 12 miesięcy, dla całości lub otwartej kategorii; stare wykresy Chart.js usunięte |
| Porównanie miesiąc do miesiąca, zużycia | Jest (bez uruchomienia) | Porównanie z poprzednim miesiącem i rokiem wcześniej, największe zmiany kategorii, trend zużycia (np. kWh) |
| Wyszukiwanie i filtry | Jest (bez uruchomienia) | Lista wydatków: szukanie tekstu oraz filtry po kategorii (z podkategoriami), domowniku, karcie i kwocie |
| Szablony / ostatnie wydatki | Jest (bez uruchomienia) | Szablony (`/templates`) jako przyciski szybkiego dodawania z cofnięciem, „Zapisz jako szablon” i „Kopiuj jako nowy” w formularzu wydatku |
| Tagi | Jest (bez uruchomienia) | Tagi w wydatku (po przecinku), filtr po tagu, ekran „Tagi” z sumą projektu i podziałem na kategorie |
| PWA | Jest (bez uruchomienia) | Manifest, ikony, ręczny service worker (powłoka aplikacji offline), przycisk instalacji w Ustawieniach; wymaga buildu produkcyjnego i HTTPS |
| UI mobile-first | Jest (bez uruchomienia) | Nowy interfejs od zera pod telefon (dolna nawigacja, duże pola, 16 px, bezpieczne marginesy); wymaga sprawdzenia na prawdziwym urządzeniu |
| Logowanie | Jest | Zostaje jedno wspólne konto (JWT). Rejestracja, reset hasła, e-mail, zdjęcie profilu i ustawienia usunięte w etapie 1 |

### Uwagi do decyzji
- `Summaries.jsx` to wyłącznie makieta („Section in progress”), czyli miejsce na przyszłe podsumowania.
- Kategorie trzeba przenieść z enumów do bazy (tabela + migracja), bo od tego zależą hierarchia, drill-down i wykresy.
- Etap 1 (porządki) wykonany: usunięto `data.sql`, rejestrację, reset hasła, wysyłkę e-maili, zdjęcia profilu, ustawienia oraz zarządzanie użytkownikami. Endpointy nie mają już `username` w ścieżce (użytkownik pochodzi z tokenu JWT).
- Konto: nadal istnieje jedyny użytkownik `admin` z migracji Flyway; zmiana jego nazwy/hasła (np. kolejna migracja) do decyzji w kolejnym etapie.

### Etap 2 (model danych) - stan
- Backend zrobiony: domownicy, drzewo kategorii, karta, zużycie, wpłaty z informacją od kogo i typem (miesięczna/extra). Nie został zbudowany ani uruchomiony (brak dostępu do Mavena w środowisku), testy jednostkowe zaktualizowane i dopisane, ale niesprawdzone.
- Frontend nie jest jeszcze dopasowany: formularze nadal używają starych kategorii-enumów, więc dodawanie wydatków i wpłat z UI nie zadziała do czasu etapu 4.
- Budżet liczony na bieżąco (nic nie jest zapisywane): saldo miesiąca = dodatnie saldo poprzedniego miesiąca + wpłaty - wydatki zapłacone kartą wspólną. Wydatki z karty prywatnej nie zmniejszają budżetu (są tylko pokazywane osobno); zwrot z konta wspólnego = zmiana rodzaju płatności na wspólną. Ujemne saldo nie przenosi się dalej.
- Dane logowania jedynego konta pochodzą ze zmiennych środowiskowych `APP_USERNAME` i `APP_PASSWORD` (wzór w `backend/.env.example`).

### Etap 4 (frontend) - stan
- Stary interfejs (strona główna, dashboard, wykresy, lista transakcji, ustawienia konta) został usunięty i zastąpiony nowym, mobilnym interfejsem po polsku: dolna nawigacja, ekrany Budżet, Wydatki, Wpłaty, Ustawienia oraz logowanie.
- Budżet: wybór miesiąca, saldo, przeniesienie z poprzedniego miesiąca, wpłaty (też per domownik), wydatki ze wspólnej karty i osobno z prywatnych.
- Wydatki i wpłaty: lista miesiąca, formularz dodawania/edycji/usuwania. Formularz wydatku: kwota, kategoria (dowolny poziom), zużycie (gdy kategoria ma jednostkę), domownik, karta, data. Formularz zapamiętuje ostatnio wybrane: kategorię, domownika, kartę.
- Ustawienia: zarządzanie domownikami i drzewem kategorii (dodawanie, zmiana nazwy, przenoszenie, jednostka, usuwanie), wylogowanie.
- Wykresy, drill-down po kategoriach i porównania miesięczne przejdą do etapu 5; usunięte stare wykresy nie pasowały do nowego modelu.
- Frontend nie został zbudowany ani uruchomiony (brak dostępu do npm w środowisku); sprawdzono tylko składnię i odwołania do modułów.

### Etap 5 (analizy) - stan
- Nowy ekran „Analizy” (piąta zakładka): sumy miesiąca z porównaniem do poprzedniego miesiąca i roku wcześniej, wydatki wg kategorii (drzewo lub poziomy), największe zmiany, trend z ostatnich 12 miesięcy oraz trend zużycia po otwarciu kategorii z jednostką (np. Prąd). Widok można zawęzić do karty wspólnej lub prywatnej.
- Obliczenia są w czystych funkcjach (`frontend/src/util/analysis.js`, `filters.js`) z testami `npm test` (13 testów przechodzi lokalnie na Node). Same ekrany nie były uruchamiane.
- Filtry w liście wydatków działają po stronie przeglądarki na danych wybranego miesiąca.

### Etap 6 (cykliczne, szablony, tagi) - stan
- Backend: migracja V24 (tagi, reguły cykliczne z historią potwierdzeń, szablony), API `/recurring`, `/templates`, `/tags`; kategoria lub domownik użyty w regule albo szablonie nie da się usunąć.
- Wydatek z reguły dostaje datę z dnia miesiąca ustawionego w regule (w krótszych miesiącach skrócony), a po potwierdzeniu liczy się do budżetu jak zwykły wydatek.
- Frontend: ekrany Cykliczne, Szablony, Tagi, szybkie dodawanie na liście wydatków, karta „do potwierdzenia” na ekranie Budżet, odnośniki w Ustawieniach.
- Tagi nie są jeszcze dostępne w regułach i szablonach (tylko w zwykłych wydatkach).
- Nic z tego nie zostało zbudowane ani uruchomione (brak dostępu do Mavena i npm); logika analiz po stronie przeglądarki ma testy (`npm test`), testy backendu napisane, ale niesprawdzone.

### Etap 7 (PWA i sesja) - stan
- Frontend: `manifest.webmanifest`, ikony (192, 512, maskable, apple-touch), `sw.js` (powłoka aplikacji offline, dane z API nigdy nie są cache'owane), rejestracja tylko w buildzie produkcyjnym, przycisk „Zainstaluj aplikację” i podpowiedź dla iPhone'a w Ustawieniach, czytelny komunikat przy braku połączenia.
- Sesja: po starcie bez zapisanego tokenu aplikacja próbuje odnowić logowanie z ciasteczka; odnowienie przedłuża ciasteczko (sesja przesuwna). Błąd sieci nie wylogowuje.
- Poprawka w backendzie: czas życia ciasteczka odświeżającego przepełniał `int` przy długich wartościach (powyżej ok. 24 dni), więc „pół roku” nie działałoby; teraz liczone poprawnie (test `JwtServiceTest`).
- Wdrożenie: frontend w Dockerze budowany produkcyjnie i serwowany przez nginx (port 5173), `README.md` opisuje uruchomienie i instalację na telefonie.
- Instalacja na telefonie wymaga HTTPS (poza `localhost`) i najlepiej wspólnej domeny frontendu i API.

## Podsumowanie
Wszystkie 7 etapów jest napisanych. Żaden z etapów od 2 do 7 nie został zbudowany ani uruchomiony w środowisku sesji (brak dostępu do Mavena i npm). Pierwszy krok przed użyciem: `docker compose up --build`, `mvn test`, `npm test` i `npm run lint`, a potem poprawienie ewentualnych błędów kompilacji.
