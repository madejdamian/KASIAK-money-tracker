# Budżet domowy

Prywatna aplikacja do śledzenia wydatków i wspólnego budżetu domowego. Działa jako PWA
(instalowalna na telefonie), interfejs jest po polsku i projektowany najpierw pod telefon.

## Co potrafi

- **Budżet miesięczny:** wpłaty domowników na wspólne konto (miesięczne i dodatkowe), wydatki ze
  wspólnej karty, saldo. Dodatnie saldo przechodzi na kolejny miesiąc, ujemne nie.
- **Wydatki:** kategorie o dowolnej głębokości (np. Opłaty › Media › Prąd), domownik, karta
  prywatna lub wspólna, zużycie (np. kWh), tagi, wyszukiwanie i filtry.
- **Automatyzacja:** wydatki cykliczne do potwierdzenia co miesiąc, szablony do szybkiego dodawania.
- **Analizy:** podział wg kategorii z drill-downem, porównanie z poprzednim miesiącem i rokiem
  wcześniej, trend z 12 miesięcy (także zużycia), analiza tagów (projektów).
- Jedno wspólne konto chronione hasłem; logowanie jest zapamiętywane (długa sesja).

Wymagania, ustalenia i stan prac: [`REQUIREMENTS.md`](REQUIREMENTS.md).

## Stack

- Backend: Java 17, Spring Boot, PostgreSQL, Flyway, JWT
- Frontend: React, Vite, Tailwind CSS, TanStack Query
- Docker Compose

## Uruchomienie

1. Skopiuj `backend/.env.example` do `backend/.env-dev` i ustaw co najmniej `JWT_SECRET_KEY`
   (np. `openssl rand -base64 32`) oraz `APP_PASSWORD`, czyli hasło
   jedynego konta (logowanie tylko hasłem; ustawiane przy każdym starcie backendu).
2. `docker compose up --build`
3. Aplikacja: http://localhost:8080, dokumentacja API (Swagger): http://localhost:8080/swagger-ui.html

Aplikacja to jeden kontener (`app`: backend Spring Boot serwuje też zbudowany frontend) oraz kontener
bazy (`db`). Frontend jest tam zbudowany produkcyjnie. Do pracy nad kodem: `cd frontend && npm install
&& npm run dev` (adres http://localhost:5173, service worker działa tylko w buildzie produkcyjnym).
Testy: `cd frontend && npm test` oraz `cd backend && ./mvnw test` (wymaga JDK 17).

## Instalacja na telefonie (PWA)

Przeglądarka pozwala zainstalować aplikację tylko przez **HTTPS** (wyjątkiem jest `localhost`).
Do codziennego użytku postaw ją za reverse proxy z certyfikatem (np. Caddy lub nginx) kierującym
cały ruch na port 8080 kontenera `app`. Frontend i API są już pod jedną domeną, więc nic więcej
nie trzeba ustawiać (CORS dotyczy tylko pracy z `npm run dev`).

- Android (Chrome): Ustawienia w aplikacji › „Zainstaluj aplikację” albo menu przeglądarki.
- iPhone (Safari): Udostępnij › „Do ekranu początkowego”.

Sesja: token dostępu odnawia się sam, a ciasteczko odświeżające żyje domyślnie pół roku
(`JWT_REFRESH_EXPIRATION`) i przedłuża się przy każdym odnowieniu, więc hasło wpisujesz rzadko.
