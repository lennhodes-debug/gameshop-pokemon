Voer een gestructureerde refactoring uit:

## Stappen

1. **Analyse** — Gebruik `researcher` + `perf-profiler` subagents (parallel)
   - Identificeer wat gerefactord moet worden
   - Breng afhankelijkheden in kaart
   - Meet huidige staat (bundle size, complexiteit)

2. **Plan** — Gebruik `architect` subagent
   - Refactoring strategie bepalen
   - Stap-voor-stap plan met risico's
   - Geen gedragsveranderingen (alleen structuur)

3. **Uitvoeren** — Gebruik `implementer` subagent
   - Een stap tegelijk, `npm run build` na elke stap
   - Commit per logische wijziging
   - Bij build-falen: direct terugdraaien en andere aanpak

4. **Verifieer** — Gebruik `code-reviewer` + `qa-tester` subagents (parallel)
   - Geen regressies
   - Geen gedragsveranderingen
   - Performance niet verslechterd

5. **Push**

## Regels
- GEEN feature changes, alleen structuur
- Altijd backward compatible
- Bij twijfel: niet refactoren

Target: $ARGUMENTS
