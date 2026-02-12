Fix een GitHub issue:

## Stappen

1. **Lees het issue** — `gh issue view $ARGUMENTS`
   - Begrijp het probleem, verwacht vs werkelijk gedrag
   - Noteer reproductie-stappen

2. **Onderzoek** — Gebruik de `researcher` subagent om de relevante code te vinden
   - Traceer de dataflow van het probleem
   - Identificeer de root cause

3. **Implementeer de fix**
   - Lees het bestand VOORDAT je het wijzigt
   - Maak de minimale wijziging die het probleem oplost
   - Geen extra refactoring of verbeteringen

4. **Valideer** — `npm run build` om te verifieren

5. **Commit en push** naar de huidige branch
   - Nederlands commit message: "Fix #{issue-nummer}: {beschrijving}"

6. **Maak een PR** met `gh pr create`
   - Refereer het issue: "Fixes #$ARGUMENTS"

Issue nummer: $ARGUMENTS
