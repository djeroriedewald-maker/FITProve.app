# Ticket B – Dark-mode thema fix
Doel:
- Betrouwbare dark mode met consistente kleuren (tekst/achtergrond/border/brand).
- Voorkeur wordt bewaard (localStorage); systeemvoorkeur gerespecteerd.
- Geen console errors.

Wat is gewijzigd:
- Tailwind darkMode + semantische tokens (CSS variables).
- ThemeProvider + ThemeToggle.
- BottomNav en routes met dark-friendly styling.

Test:
1) Toggle knop → wisselt thema; refresh → voorkeur blijft.
2) Systeem dark mode → initieel dark.
3) Contrasten checken; geen console errors.

Rollback:
- `git revert <commit_sha>` of herstel vorige bestanden.

## Datasets & Deploy (Workouts/Exercises)

- Local fallbacks zijn opgenomen in `src/workout-sources.ts`:
  - Workouts: `/data/workouts/v20250906`
  - Exercises: `/data/workouts/v20250905`
- Voor productie kun je alias-URL vanuit Supabase gebruiken (één alias voor beide):
  - `VITE_WORKOUTS_BASE=https://<project>.supabase.co/storage/v1/object/public/<bucket>/workouts`
  - `VITE_EXERCISES_BASE=https://<project>.supabase.co/storage/v1/object/public/<bucket>/workouts`
  De loader ondersteunt zowel `manifest.json` op alias-root als `index.json` met
  `{"latest": "..."}` of `{ "workouts_latest": "...", "exercises_latest": "..." }`.

### Upload naar Supabase met alias "latest"

1) Zet secrets in je shell (niet committen):
   - `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY`
   - Optioneel: `WORKOUTS_BUCKET` (default `workouts`)
2) Uploaden (neemt versies uit `public/data/workouts/<versie>`):
- Workouts: `npm run workouts:deploy`  → upload naar `<bucket>/workouts/<versie>` en zet aliasbestanden onder `workouts/`
- Exercises: `npm run exercises:deploy` → upload naar `<bucket>/exercises/<versie>` en zet aliasbestanden onder `exercises/`
  - Alternatief: als je één alias wil houden (zoals nu), gebruik alleen `workouts:deploy` en laat `index.json` twee keys bevatten: `workouts_latest` en `exercises_latest`.
  - Versiebron: `public/data/workouts/index.json` (ondersteunt beide schema's) of override via CLI-arg.

Command achter de schermen: `tsx scripts/deploy/upload-to-supabase.ts public/data/workouts <alias> [versie]`
