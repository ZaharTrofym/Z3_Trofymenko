# Môj TODO List (Zadanie 3, WEBTE1)

Autor: Zakhar Trofymenko
Odkaz na stránku: https://webte1.fei.stuba.sk/~xtrofymenko/zadanie3/
Repozitár: https://github.com/ZaharTrofym/Z3_Trofymenko

## Popis
Aplikácia na správu osobných úloh. Úlohy sa vytvárajú, upravujú, označujú ako dokončené a mažú cez REST API (https://wt1zadanie.iolab.sk). Súčasťou je kalendár (mesiac, týždeň, deň) a zoznam s filtrovaním, vyhľadávaním a zoradením.

## Použité technológie
Vue 3, Vite, FullCalendar 6, Bootstrap 5, Fetch API.

## Inštalácia a spustenie
npm install
npm run dev

Build: npm run build (výstup v priečinku dist).

## Štruktúra projektu
- `src/App.vue` – hlavný komponent (stav aplikácie, volania služby)
- `src/components/` – komponenty: `LoginForm`, `AppHeader`, `AppFooter`, `TodoCalendar`, `TodoDetail`, `TodoForm`, `TodoList`, `TodoItem`
- `src/services/api.js` – komunikácia s REST API (oddelená od používateľského rozhrania)
- `src/utils/dates.js` – pomocné funkcie pre dátumy
- `src/assets/main.css` – spoločné štýly

## Použitie AI
Pri práci som použil AI nástroj Claude (Anthropic) ako pomocníka na vysvetlenie a návrh častí kódu. Kód som písal, upravoval a testoval sám a viem ho vysvetliť.
