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

### Ustalenia
- Jedno wspólne konto dla całego domu (bez osobnych kont/logowania domowników).
- Wydatek jest przypisany do domownika i do źródła płatności: karta prywatna lub karta wspólna.
- Budżet jest miesięczny, bez limitów na kategorie. Co miesiąc dochodzą nowe wpłaty, a dodatnie saldo przenosi się na kolejny miesiąc, a ujemne nie. Wpłaty mogą pojawiać się też w trakcie miesiąca.
- Kategorie mają dowolną głębokość zagnieżdżenia, np. rachunki -> media -> prąd.
- Kategoria może mieć dodatkowo wpisywane zużycie (np. kWh dla prądu) obok kwoty.

## Wymagania niefunkcjonalne

_Do uzupełnienia (wydajność, bezpieczeństwo, UX, technologia itp.)._

- [ ] ...

## Wytyczne techniczne

_Do uzupełnienia (konwencje, biblioteki, struktura kodu)._

## Pomysły na później

- ...

## Analiza istniejącego kodu

_Do wypełnienia po zebraniu wymagań: co już jest w aplikacji, czego brakuje._

| Wymaganie | Status | Uwagi |
|-----------|--------|-------|
|           |        |       |
