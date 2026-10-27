# Budżet domowy (KASIAK money tracker) – notatki do kontynuacji w nowej sesji

Ostatnia aktualizacja: 2026-10-27. Stan kodu: commit `04ac4ee` („Stage 7: PWA…”), po przeglądzie kodu i uruchomieniu testów frontendu (sekcja 6).

## 0. Skrót (przeczytaj to najpierw)
- **Co to jest:** prywatna aplikacja PWA do wspólnego budżetu domowego i wydatków, po polsku, projektowana pod telefon. Jedno wspólne konto z hasłem.
- **Skąd kod:** fork `madejdamian/KASIAK-money-tracker` projektu `rodis00/expense-tracker` (Java 17 + Spring Boot, React, PostgreSQL, Docker). Kod bazowy został mocno przerobiony: 7 etapów prac, wszystkie napisane.
- **Gdzie jesteśmy:** funkcje z `REQUIREMENTS.md` są zaimplementowane, ale **backend nigdy nie został zbudowany ani uruchomiony**, a całość nie była odpalona ani obejrzana w przeglądarce. Frontend: testy i build przechodzą, `npm run lint` nie.
- **Cel końcowy:** wdrożenie na własnym VPS z własną bazą PostgreSQL.
- **Pierwszy krok w nowej sesji:** zbudować i uruchomić całość lokalnie (`docker compose up --build`, `./mvnw test`) i naprawić błędy (sekcja 8).
- **Gdzie jest dokumentacja:** `README.md` (uruchomienie, PWA), `REQUIREMENTS.md` (wymagania, ustalenia, szczegółowy opis etapów 1–7). Ten plik to kontekst rozmowy i podsumowanie stanu.

## 1. Cel i wymagania użytkownika (Damian)
- Aplikacja do śledzenia domowego budżetu i wydatków, do **realnego wdrożenia**, a nie projekt edukacyjny.
- Nie pisać od zera: gotowa podstawa, którą się modyfikuje. Pełny dostęp do kodu, możliwość personalizacji.
- Wszystko self-hosted: własny VPS, własna baza danych, brak zależności od chmur.
- Estetyka ma znaczenie (Actual Budget uznany za „brzydki").
- Damian uczy się Javy, więc Java/Spring Boot jest atutem.
- Komunikacja po polsku.

## 2. Historia decyzji
| Opcja | Wynik |
|---|---|
| Actual Budget (TS/React, SQLite w pliku, MIT) | Odrzucony: wygląd, brak osobnej bazy SQL. |
| Firefly III (PHP/Laravel, MariaDB, AGPL-3.0) | Nie wybrany: wygląd jak klasyczny panel admina. |
| **rodis00/expense-tracker** (Spring Boot + React + PostgreSQL) | **Wybrany.** Struktura `backend/` + `frontend/` + `compose.yml`. |
| matwaj91/Personal_Budget_Java, OtmaneTouhami/budget-wise | Rozważone jako alternatywy, niewybrane. |

W rozmowie przygotowano przykładowe pliki wdrożeniowe dla Actual i Firefly (docker-compose + Caddy). **Nie zostały dodane do repozytorium i nie są potrzebne.**

Ryzyka projektu bazowego: **brak pliku LICENSE** (autor zachowuje wszystkie prawa; do użytku własnego ryzyko niskie, ale warto poprosić autora o licencję, np. MIT, zanim rozwój pójdzie dalej), jeden autor, mała społeczność.

## 3. Ustalenia produktowe (z `REQUIREMENTS.md`)
- Jedno wspólne konto dla całego domu (bez kont domowników, ról, rejestracji, resetu hasła, 2FA).
- Wydatek ma domownika i źródło płatności: karta prywatna lub wspólna. Do budżetu liczą się tylko wydatki ze **wspólnej** karty; zwrot z konta wspólnego = zmiana rodzaju płatności na wspólną. Brak rozliczeń „kto komu wisi".
- Budżet miesięczny, bez limitów na kategorie. Wpłaty domowników (miesięczne i extra w trakcie miesiąca). **Dodatnie saldo przenosi się na kolejny miesiąc, ujemne nie.**
- Kategorie o dowolnej głębokości (Opłaty › Media › Prąd), opcjonalna jednostka zużycia (kWh, m3).
- PWA obowiązkowo, UI mobile-first, szybkie dodawanie wydatku, długa sesja (hasło rzadko).
- Poza zakresem: historia zmian, koszt jednostkowy zł/kWh, załączniki/paragony, import/eksport CSV, powiadomienia, cele oszczędnościowe, wiele walut.

## 4. Stan aplikacji – co jest zrobione (kod napisany)
**Stack:** Java 17, Spring Boot 3.3.4, JPA, Flyway, JWT, Swagger (springdoc), PostgreSQL 16; frontend React 18 + Vite + Tailwind + TanStack Query + React Router; Docker Compose (db, backend, frontend/nginx).

**Ekrany frontendu** (dolna nawigacja, po polsku): Budżet (strona główna), Wydatki, Wpłaty, Analizy, Ustawienia (domownicy, drzewo kategorii, instalacja PWA, wylogowanie), Cykliczne, Szablony, Tagi, Logowanie.

**Funkcje:**
- Budżet miesiąca: saldo, przeniesienie, wpłaty per domownik, wydatki z karty wspólnej i osobno z prywatnych, karta „do potwierdzenia" dla wydatków cyklicznych.
- Wydatki i wpłaty: lista miesiąca, dodawanie/edycja/usuwanie; formularz zapamiętuje ostatnio wybrane kategorię, domownika i kartę; zużycie, tagi; wyszukiwanie i filtry (po stronie przeglądarki, na danych wybranego miesiąca).
- Analizy: drill-down po drzewie kategorii z sumami i udziałem %, porównanie z poprzednim miesiącem i rokiem wcześniej, największe zmiany, trend 12 miesięcy (także zużycia), analiza tagów.
- Wydatki cykliczne (propozycja co miesiąc do potwierdzenia lub pominięcia, zaległe do roku wstecz), szablony szybkiego dodawania z cofnięciem, tagi.
- PWA: manifest, ikony, ręczny service worker (powłoka offline; dane z API nigdy nie są cache'owane), przycisk instalacji, rejestracja tylko w buildzie produkcyjnym. Wymaga HTTPS (poza localhost).
- Sesja: token dostępu odnawiany z ciasteczka odświeżającego (domyślnie pół roku, sesja przesuwna); błąd sieci nie wylogowuje.

**API** (prefiks `/expense-tracker/api/v1`): `auth` (authenticate, refresh-token), `expenses`, `incomes` (CRUD po `slug`, strony, lata, last-added), `members`, `categories` (drzewo, przenoszenie), `budget/summary?year=&month=`, `recurring` (+ `/pending`, `/{id}/confirm`, `/{id}/skip`), `templates` (+ `/{id}/use`), `tags`. Swagger pod `http://localhost:8080`.

**Baza:** migracje Flyway V1–V24. Najnowsze: V22 (usunięcie zdjęcia profilu i resetu hasła), V23 (domownicy, drzewo kategorii z przykładowymi kategoriami, pola wydatku/wpłaty), V24 (tagi, reguły cykliczne z historią potwierdzeń, szablony).

**Konto:** `AppUserInitializer` przy każdym starcie ustawia login i hasło jedynego użytkownika ze zmiennych `APP_USERNAME` i `APP_PASSWORD` (aktualizuje istniejącego użytkownika lub tworzy nowego). Jeśli zmienne są puste, nic nie robi i zostaje konto `admin` z migracji Flyway (V6), więc zawsze je ustawiaj. Wzór konfiguracji: `backend/.env.example` (kopiuj do `backend/.env-dev`).

## 5. Historia prac w repozytorium (2026-10-27)
Wymagania i analiza kodu → Stage 1 (porządki: usunięto rejestrację, reset hasła, e-maile, zdjęcia profilu, dane testowe, wiele kont) → Stage 2 (model: domownicy, drzewo kategorii, karta, zużycie, wpłaty) → Stage 3 (miesięczny budżet z przeniesieniem) → Stage 4 (nowy mobilny UI po polsku) → Stage 5 (analizy) → Stage 6 (cykliczne, szablony, tagi) → Stage 7 (PWA, długa sesja, produkcyjny obraz frontendu).

## 6. Co faktycznie sprawdzono (środowisko sesji, 2026-10-27)
| Element | Wynik |
|---|---|
| Frontend `npm ci` | OK |
| Frontend `npm test` | **14/14 testów przechodzi** (logika analiz i filtrów) |
| Frontend `npm run build` | **OK** (Vite, ~381 kB JS) |
| Frontend `npm run lint` | **NIE przechodzi:** 147 problemów w 26 plikach (120× `react/prop-types`, 25× `no-unused-vars`, głównie nieużywany `import React`, 2 ostrzeżenia `react-refresh`). Skrypt ma `--max-warnings 0`. |
| Backend `mvn test` | **Nie sprawdzono:** w środowisku sesji Maven Central jest zablokowany. Testy napisane, ale nigdy nie uruchomione. |
| `docker compose up`, działanie aplikacji, wygląd w przeglądarce, PWA na telefonie | **Nie sprawdzono** |

Wniosek: backend (Etapy 2–7) może mieć błędy kompilacji lub testów, bo nigdy nie był budowany. Frontend kompiluje się, ale ekrany nie były uruchamiane.

## 7. Znane problemy i ryzyka
- **Backend niezweryfikowany** (kompilacja, testy, migracje Flyway V22–V24, endpointy). Najwyższy priorytet.
- `backend/Dockerfile` buduje przez `mvn clean package` **bez pomijania testów**, więc jeden nieprzechodzący test zablokuje budowę obrazu. Obraz uruchomieniowy to `openjdk:21-jdk-slim` (przy pierwszym buildzie sprawdzić, czy obraz nadal jest dostępny).
- `compose.yml` publikuje **Postgresa na porcie 5432** z hasłem `postgres/postgres` oraz backend na 8080. Na VPS to nie może zostać: usunąć publikację portu bazy, ustawić silne hasło, wystawić na zewnątrz tylko reverse proxy.
- `JWT_SECRET_KEY` musi być kluczem base64 o długości min. 256 bitów (`openssl rand -base64 32`): kod dekoduje go przez `Decoders.BASE64` i podpisuje HS256, więc wartość `change-me` z przykładu nie jest poprawna.
- Tagi nie są dostępne w regułach cyklicznych ani w szablonach (tylko w zwykłych wydatkach).
- Filtry listy wydatków działają po stronie przeglądarki na danych jednego miesiąca.
- `REQUIREMENTS.md`: wszystkie pola wyboru nadal są odznaczone `[ ]` mimo implementacji, a uwaga o koncie `admin` z migracji jest nieaktualna (konto ustawia `AppUserInitializer`).
- Wygląd i użyteczność na telefonie nie były oceniane przez człowieka (wymaga sprawdzenia na prawdziwym urządzeniu).
- Brak licencji w repozytorium bazowym (sekcja 2).

## 8. Następne kroki (propozycja, w kolejności)
1. Lokalnie: `cp backend/.env.example backend/.env-dev`, ustawić `JWT_SECRET_KEY`, `APP_USERNAME`, `APP_PASSWORD`; `docker compose up --build`. Naprawić błędy kompilacji i testów backendu (`cd backend && ./mvnw test`).
2. Uruchomić aplikację, przejść ręcznie główne ścieżki: logowanie, dodanie domowników i wpłat, wydatek z różnych kart, saldo i przeniesienie, drill-down, cykliczne, szablony, tagi. Ocenić wygląd na telefonie.
3. Naprawić `npm run lint` (dodać `prop-types` lub wyłączyć regułę, usunąć zbędne `import React`) i zaktualizować pola w `REQUIREMENTS.md`.
4. Dopasować wygląd i funkcje do potrzeb (lista zmian do ustalenia z Damianem po obejrzeniu aplikacji).
5. Przygotować wdrożenie na VPS: reverse proxy z HTTPS (np. Caddy) i wspólna domena dla frontendu i API (`VITE_API_URL`, `FRONTEND_PORT` dla CORS), baza bez publicznego portu, sekrety w zmiennych środowiskowych poza repozytorium, regularne kopie `pg_dump` z crona, plan aktualizacji.
6. Napisać do autora `rodis00/expense-tracker` w sprawie licencji.

## 9. Otwarte pytania
- Jaki VPS i system (dystrybucja, zasoby)? Czy jest domena z możliwością ustawienia rekordu A?
- Jakie zmiany względem obecnego wyglądu i funkcji są potrzebne po pierwszym uruchomieniu?
- Czy w przyszłości przydałby się import CSV z banku (obecnie poza zakresem)?

## 10. Zasady współpracy
- Odpowiadać po polsku, zwięźle.
- Nie podejmować decyzji za użytkownika i nie tworzyć nowych plików, dopóki o to nie poprosi.
- Nie twierdzić, że coś działa, dopóki nie zostało zbudowane lub uruchomione.
