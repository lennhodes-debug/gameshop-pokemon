Implementeer een feature met het plan-first patroon:

## Stappen

1. **Research** — Gebruik de `researcher` subagent om de bestaande code te begrijpen
   - Welke bestanden zijn relevant?
   - Welke patronen worden al gebruikt?
   - Zijn er afhankelijkheden of risico's?

2. **Design** — Gebruik de `architect` subagent om een implementatieplan te maken
   - Concreet plan op bestandsniveau
   - Risico's en mitigaties
   - Definition of done

3. **Bouw** — Gebruik de `implementer` subagent om het plan stap voor stap uit te voeren
   - Lees elk bestand VOORDAT je het wijzigt
   - `npm run build` na elke wijziging
   - Commit per logische stap (Nederlands)

4. **Review** — Gebruik de `code-reviewer` subagent voor quality check
   - Fix alle CRITICAL en HIGH findings
   - Verifieer dat de build nog slaagt

## Regels
- Ga pas naar de volgende stap als de vorige compleet is
- Na elke stap: commit en push naar de huidige branch
- Volg de CLAUDE.md conventies (Nederlands, Tailwind, TypeScript strict)
- Geen over-engineering — doe precies wat er gevraagd wordt

Feature: $ARGUMENTS
