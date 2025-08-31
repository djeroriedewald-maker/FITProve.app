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
