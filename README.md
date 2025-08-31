# FITProve – Ticket A: Routes & Bottom Nav

## Install & Run
1. `npm install` (StackBlitz doet dit automatisch bij package.json wijziging)
2. `npm run dev`
3. Open de app en test de tabs onderin.

## Testplan
- Navigeren: Home ↔ Coach ↔ Stats ↔ News werkt, URL verandert.
- Reload op elke route werkt (React Router v6).
- Mobile-first: geen horizontale scroll, tappable targets >=44px.
- Dark mode: voldoende contrast en focus states zichtbaar.
- Console: geen errors/warnings.

## Rollback
- Revert de PR in GitHub met de **Revert**-knop (maakt automatisch een revert-commit/PR).
- Of: zet een `revert:` commit op dezelfde branch en merge.
