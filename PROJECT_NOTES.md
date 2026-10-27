# Kasiak (budżet domowy) – notatki do kontynuacji w nowej sesji

Ostatnia aktualizacja: 2026-10-28. Ostatni commit w repozytorium to nadal `262eb77`: **wszystko poniżej (Docker w jednym kontenerze, nowy wygląd, Analizy, Zużycie, wpłaty cykliczne itd.) jest zrobione i działa lokalnie, ale NIE jest skomitowane.**

## 0. Skrót (przeczytaj to najpierw)
- **Co to jest:** prywatna aplikacja PWA do wspólnego budżetu domowego, po polsku, nazwa **Kasiak**. Jedno wspólne konto, logowanie **samym hasłem**. Jedynym użytkownikiem jest Damian (domownicy to tylko osoby przypisywane do wydatków i wpłat).
- **Stack:** Java 17 + Spring Boot 3.3, JPA, Flyway, JWT, PostgreSQL 16; React 18 + Vite + Tailwind + TanStack Query. Fork `rodis00/expense-tracker`, mocno przerobiony.
- **Stan:** aplikacja jest uznana za gotową do używania. Działa lokalnie w Dockerze (`docker compose up --build`, adres http://localhost:8080). Czeka na commit i wdrożenie na własnym VPS.
- **Uruchomienie lokalne:** `backend/.env-dev` (poza gitem; wzór `backend/.env.example`) z `JWT_SECRET_KEY` (base64, `openssl rand -base64 32`) i `APP_PASSWORD`. Potem `docker compose up --build -d`.
- **Dokumentacja:** `README.md` (uruchomienie, PWA), `REQUIREMENTS.md` (wymagania; checkboxy `[ ]` nieaktualne, wszystko jest zrobione), `PRODUCT.md` (kontekst produktu dla skilla od designu).

## 1. Zasady współpracy
- Odpowiadać po polsku, zwięźle. Nie twierdzić, że coś działa, dopóki nie zostało zbudowane lub uruchomione.
- Nie tworzyć dokumentów (README, TODO itp.) bez prośby.
- Backend buduje się **tylko na JDK 17** (`JAVA_HOME=$(/usr/libexec/java_home -v 17) sh ./mvnw test`). Na JDK 24 Lombok nie generuje getterów i kompilacja się sypie.
- Hooki w tym środowisku wymuszają „fakty” przed pierwszą edycją pliku (GateGuard); przy nowych plikach pierwszy zapis bywa odrzucony i trzeba go powtórzyć.

## 2. Architektura i uruchomienie
- **Dwa kontenery:** `et_app` (Spring Boot serwuje też zbudowany frontend, port 8080) i `et_db` (PostgreSQL, na hoście port **5433**, bo 5432 bywa zajęty przez inne projekty).
- Jeden `Dockerfile` w korzeniu buduje frontend (`VITE_API_URL=/expense-tracker/api/v1`), kopiuje go do `static/` backendu i uruchamia testy backendu przy budowie obrazu.
- `SpaWebConfig` serwuje pliki frontendu i oddaje `index.html` dla ścieżek routera; `SecurityConfig` wymaga logowania tylko dla `/expense-tracker/api/**`. Swagger: `/swagger-ui.html`.
- Dev frontendu: `cd frontend && npm run dev` (port 5173, API pod `localhost:8080`, CORS przez `FRONTEND_PORT`).
- **Logowanie:** `AppUserInitializer` przy starcie zapisuje hash `APP_PASSWORD` w jedynym koncie (wewnętrzny login `household`, nigdzie niewidoczny). Token dostępu żyje 1 h, ciasteczko odświeżające pół roku. Naprawiony błąd: wygasły token dawał 500 zamiast 401 (teraz 401 i frontend sam odnawia sesję).

## 3. Co jest w aplikacji
**Ekrany** (telefon: dolny pasek Główna · Wydatki · „+” · Analizy · Ustawienia; Wpłaty i Zużycie to przyciski na dole Głównej; desktop Full HD: menu po lewej):
- **Główna:** żółta płyta z saldem wspólnego konta (przeniesienie dodatniego salda), szybkie dodawanie z szablonów (szablon bez ceny otwiera okno z kwotą i opisem), rozliczenie miesiąca, wpłaty domowników.
- **Wydatki:** lista miesiąca, filtry, formularz z kafelkami kategorii (schodzenie w głąb drzewa), opisem, zużyciem (gdy kategoria ma jednostkę), domownikiem, kartą, datą i tagami do wyboru. Tytułu nie ma (tytuł = nazwa kategorii).
- **Wpłaty**, **Cykliczne** (reguły wydatków i wpłat, lista „do potwierdzenia”), **Szablony**, **Tagi** (analiza tagu + dodawanie/usuwanie tagów; tagi dodaje się też w Ustawieniach).
- **Zużycie:** ręcznie wpisywane woda zimna, woda ciepła, ogrzewanie (GJ; jednostka w `frontend/src/util/usage.js`). Prąd jest wydatkiem miesięcznym, jego zużycie bierze się z pola kWh przy wydatku.
- **Analizy:** okres (presety, konkretny miesiąc, własny zakres), porównanie (poprzedni okres / rok temu / brak), filtry (domownik, karta, tag), zakładki Przegląd · Kategorie · W czasie · Pozycje · Tagi. Wykresy na telefonie uproszczone, na desktopie rozbudowane (oś, siatka, do 24 miesięcy). Cała logika w `util/period.js` i `util/analytics.js`, z testami.
- **Ustawienia:** domownicy, kategorie (drzewo, jednostki), tagi, instalacja PWA, wylogowanie.

**API** (prefiks `/expense-tracker/api/v1`): `auth`, `expenses`, `incomes` (wpłaty), `members`, `categories`, `budget/summary`, `recurring` i `recurring-deposits` (+ `/pending`, `/{id}/confirm`, `/{id}/skip`), `templates` (+ `/{id}/use`, przyjmuje cenę, zużycie i opis), `tags` (GET wszystkie, POST, DELETE nieużywanego), `usage` (odczyty zużycia). Migracje Flyway V1–V26.

## 4. Wygląd
- Tylko ciemny motyw, żółto-czarny z logo (`brand #fcbc05`, ciepłe czernie), font **Lato** (self-host z `@fontsource/lato`). Jeden przełącznik układu: `lg` (1024 px). Zaprojektowane pod iPhone 15 (393 px) i Full HD.
- Logo: znak (kwadratowy portfel) + napis „Kasiak” jako komponent `components/ui/Logo.jsx`. Ikony PWA wygenerowane z `Gemini_Generated_Image_zii5egzii5egzii5.jpeg` (w JPEG jest wklejona kratka zamiast przezroczystości, dlatego ikony są wycięte z kafla).
- Zielony `gain` w palecie jest tylko dla spadków wydatków w analizach.

## 5. Testy i jakość
- Backend: 98 testów, wszystkie przechodzą (JDK 17). Frontend: 44 testy (`npm test`), przechodzą.
- `npm run lint` **nie przechodzi** (ok. 380 błędów, głównie `react/prop-types` i `import React` nieużywany). To dług istniejący od początku, nie blokuje builda.
- Przeglądarkowo (emulacja iPhone 15 i Full HD) sprawdzone: logowanie, Główna, Wydatki, formularz, Zużycie, Cykliczne, Analizy, Tagi. **Nie sprawdzone na prawdziwym telefonie:** instalacja PWA (wymaga HTTPS) i działanie offline.

## 6. Znane ograniczenia i uwagi
- Lokalna baza ma **dane przykładowe** (lipiec–październik 2026, wpłaty, wydatki, odczyty zużycia, szablony, tag „wakacje”). Skrypt, którym je wstawiono, leży tylko w katalogu tymczasowym sesji i nie jest w repo. Przed realnym użyciem usuń je w aplikacji albo skasuj bazę (`docker compose down -v` kasuje cały wolumen).
- `compose.yml` publikuje bazę na porcie hosta 5433 z hasłem `postgres/postgres`. **Na VPS tego nie zostawiać.**
- Brak pliku LICENSE w projekcie bazowym (`rodis00/expense-tracker`); do użytku własnego ryzyko niskie.
- Wydatek cykliczny/szablon nie ma tagów (tylko zwykły wydatek). Filtry listy wydatków działają po stronie przeglądarki na danych jednego miesiąca.
- „Wydatki stałe vs zmienne” w analizach to odłożony pomysł (wymaga oznaczania kategorii jako stałych).

## 7. Następne kroki
1. **Commit** zmian (najlepiej w kilku logicznych częściach; w korzeniu leżą też dwa pliki z logo, `PRODUCT.md` i `Dockerfile`).
2. **Wdrożenie na VPS:** reverse proxy z HTTPS (np. Caddy) kierujące na port 8080 kontenera `app`; baza bez publicznego portu; silne sekrety w zmiennych środowiskowych poza repo; regularne kopie `pg_dump` z crona; plan aktualizacji. Do ustalenia: jaki VPS i system, czy jest domena z rekordem A.
3. Sprawdzić instalację PWA na iPhonie po uzyskaniu HTTPS.
4. Opcjonalnie: posprzątać lint, zaktualizować `REQUIREMENTS.md`, napisać do autora `rodis00/expense-tracker` w sprawie licencji.
