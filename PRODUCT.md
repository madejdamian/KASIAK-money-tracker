# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Damian, who runs the household budget for himself and the other household members. The app is private and single-account (one shared password, no per-person logins). Daily use is on an iPhone 15 (adding expenses, checking the balance); the computer (Full HD, left menu) is used for analysis and housekeeping: categories, members, recurring items, trends.

## Product Purpose
Track a shared monthly household budget and everyday expenses. Members pay into a common account; spending from the shared card draws the budget down; a positive balance carries over to the next month, a negative one does not. Success is adding an expense in a few taps and seeing at a glance what is left.

## Positioning
Private, self-hosted, Polish-language budget app built around this household's exact rules (shared vs private card, carry-over of positive balance, category tree of any depth with optional usage units such as kWh).

## Operating Context
Self-hosted on the owner's own VPS with their own PostgreSQL. Installed as a PWA on the phone. Only two screen classes matter: iPhone 15 (portrait) and a Full HD desktop monitor. No other breakpoints need to be designed for.

## Capabilities and Constraints
Screens: Budżet, Wydatki, Wpłaty, Analizy, Ustawienia (members, category tree, install, logout), Cykliczne, Szablony, Tagi, Logowanie (password only). Interface language is Polish. Out of scope: history of changes, receipts, CSV import/export, notifications, savings goals, multiple currencies.

## Brand Commitments
Name: **Kasiak**. Logo assets provided by the user in the project root: `Gemini_Generated_Image_ml47kmml47kmml47.jpeg` (wallet plus "Kasiak" wordmark on off-white) and `Gemini_Generated_Image_zii5egzii5egzii5.jpeg` (3D app icon: black wallet on a yellow rounded square; the checkerboard around it is baked into the JPEG, not real transparency). Palette is yellow and black taken from the logo. Dark theme only; no light mode.

## Evidence on Hand
The two logo images above. No photos, testimonials or other brand material exist; none may be invented.

## Product Principles
1. The shared-account balance is the first thing seen on every start.
2. Adding an expense takes the fewest possible steps on the phone.
3. Desktop is for reading and organising: wide, multi-column, left menu.
4. One user, one look: no theming options, no generic-purpose flexibility.
