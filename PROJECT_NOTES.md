# Domowy budżet – notatki projektu (do kontynuacji w nowej sesji)

Ostatnia aktualizacja: 2026-10-27

> **Uwaga:** te notatki powstały w rozmowie planistycznej 2026-10-27, zanim przejrzano kod forka. Fork jest już dalej (ostatni commit: „Stage 7: PWA ...”, jest też `REQUIREMENTS.md` z wymaganiami funkcjonalnymi). Sekcje 5–7 mogą być nieaktualne: aktualny stan sprawdzaj w `git log`, `README.md` i `REQUIREMENTS.md`.

## 1. Cel projektu
Własna aplikacja do śledzenia domowego budżetu i wydatków (przychody, wydatki, kategorie, wykresy), wdrożona na **własnym serwerze VPS**, z **własną bazą danych** i pełnym dostępem do kodu, żeby można ją było spersonalizować.

## 2. Wymagania użytkownika (Damian)
- Nie pisać od zera: wziąć gotową podstawę (repozytorium) i ją modyfikować.
- To nie projekt edukacyjny, tylko aplikacja do realnego wdrożenia i użytkowania. Chodzi o szybkość dojścia do działającej wersji.
- Wszystko self-hosted: serwer VPS, własna baza, brak zależności od chmur zewnętrznych.
- Dostęp do kodu i możliwość edycji.
- Estetyka ma znaczenie (Actual Budget uznany za „brzydki").
- Damian uczy się Javy, więc Java/Spring Boot jest atutem, ale nie jest sztywnym wymogiem.
- Komunikacja po polsku.

## 3. Rozważone opcje
| Opcja | Stack | Uwagi |
|---|---|---|
| Actual Budget | TypeScript/React, SQLite w pliku | Budżet kopertowy, MIT. **Odrzucony**: wygląd; brak osobnej bazy SQL. |
| Firefly III | PHP/Laravel, MariaDB/Postgres | Bardzo rozbudowany, AGPL-3.0. Wygląd jak klasyczny panel admina. Nie wybrany. |
| **rodis00/expense-tracker** | **Java 17 + Spring Boot, React + Tailwind, PostgreSQL, Docker** | **Wybrany kierunek.** |
| Inne projekty Java (do porównania) | Spring Boot | matwaj91/Personal_Budget_Java (Thymeleaf, limity kategorii), OtmaneTouhami/budget-wise (React, budżety, paragony). |

## 4. Wybrany projekt bazowy: rodis00/expense-tracker
- Repo: https://github.com/rodis00/expense-tracker
- Demo: https://expense-tracker-seven-indol.vercel.app
- Struktura: `backend/` (Spring Boot), `frontend/` (React), `compose.yml`, `README.md`.
- Stack: Java 17, Spring Boot, PostgreSQL, React, Tailwind CSS, TanStack Query, Docker.
- Funkcje wg README: śledzenie przychodów i wydatków, wykresy/wizualizacje, historia transakcji z kategoriami. Opis wspomina też o ustawianiu budżetów i celach finansowych (do zweryfikowania w kodzie/demo).
- ~782 commity, 0 gwiazdek, 1 fork, jeden autor.

### Ryzyka / uwagi
- **Brak pliku LICENSE** w repozytorium (stan na 2026-10-27). Bez licencji autor zachowuje wszystkie prawa. Do użytku własnego ryzyko niskie, ale warto poprosić autora o dodanie licencji (np. MIT) przed poważnym rozwijaniem własnej wersji.
- Mały projekt jednego autora, więc brak wsparcia społeczności i utrzymanie poprawek leży po naszej stronie.
- Nie potwierdzono daty ostatniego commita ani zakresu faktycznie działających funkcji.
- Brak (wg opisu) importu z banku, więc prawdopodobnie do dopisania (np. import CSV).

## 5. Co zostało zrobione do tej pory
1. Przegląd gotowych aplikacji i repozytoriów (Actual Budget, Firefly III, projekty Spring Boot).
2. Porównanie pod kątem wymagań (wygląd, baza danych, licencja, wdrożenie).
3. Przygotowano przykładowe pliki wdrożeniowe dla opcji **odrzuconych**, więc można je pominąć:
   - `docker-compose.yml` (Actual Budget + Caddy z HTTPS),
   - `docker-compose.firefly.yml` oraz `.env.example` (Firefly III + MariaDB + cron + Caddy).
4. Zdecydowano o kierunku: **rodis00/expense-tracker**.
5. Pobrano i przeanalizowano stronę repozytorium (README, struktura, stack). **Kodu jeszcze nie przeglądano ani nie uruchamiano.**

## 6. Kolejne kroki (propozycja)
1. Obejrzeć demo i ocenić wygląd oraz zakres funkcji.
2. Zrobić fork repozytorium i sklonować lokalnie.
3. Uruchomić lokalnie przez `compose.yml` (Postgres + backend + frontend) i sprawdzić, czy działa.
4. Przejrzeć kod backendu: encje, kontrolery, bezpieczeństwo (uwierzytelnianie), migracje bazy, testy. Oszacować, ile pracy wymagają brakujące funkcje.
5. Ustalić listę własnych zmian (np. import CSV z banku, kategorie, budżety miesięczne, polski interfejs).
6. Napisać do autora w sprawie licencji.
7. Przygotować wdrożenie na VPS: reverse proxy z HTTPS (np. Caddy), zmienne środowiskowe i sekrety poza repozytorium, regularne kopie zapasowe bazy (`pg_dump` + cron), aktualizacje.

## 7. Otwarte pytania
- Jaki VPS i system (dystrybucja, zasoby)? Czy jest już domena?
- Czy aplikacja ma być dla jednej osoby czy dla domowników (wielu użytkowników)?
- Jakie funkcje są niezbędne na start (budżety per kategoria, cele, import z banku, raporty)?
- Czy interfejs ma być po polsku?
- Czy ważny jest dostęp z telefonu (responsywność/PWA)?

## 8. Zasady współpracy
- Nie tworzyć nowych plików ani nie podejmować decyzji za użytkownika, dopóki o to nie poprosi.
- Odpowiadać po polsku, zwięźle.
