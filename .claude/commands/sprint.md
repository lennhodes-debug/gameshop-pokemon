Plan en voer een sprint uit:

## Stappen

1. **Scope bepalen** — Wat moet er in deze sprint?
   - Gebruik de `planner` subagent om taken op te splitsen
   - Prioriteer op: impact (hoog > laag), moeite (klein > groot)
   - Maximaal 5 taken per sprint

2. **Team samenstellen** — Welke agents zijn nodig?
   - Check `.claude/teams/` voor passende presets
   - Of stel een custom team samen

3. **Uitvoeren** — Per taak:
   - Delegeer aan de juiste agent via Task tool
   - `npm run build` na elke schrijvende stap
   - Commit per afgeronde taak

4. **Review** — Na alle taken:
   - `code-reviewer` subagent op alle wijzigingen
   - Fix CRITICAL/HIGH findings
   - Finale build check

5. **Afronden** — Push en rapporteer resultaat

Sprint doel: $ARGUMENTS
