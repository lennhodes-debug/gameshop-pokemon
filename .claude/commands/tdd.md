Test-Driven Development workflow:

## Context
Dit project heeft geen test framework. TDD via:
- TypeScript strict mode als type-test
- `npm run build` als integratie-test
- Code review via `code-reviewer` subagent

## Stappen

1. **Specificeer** — Verwacht gedrag, edge cases, faalcondities
2. **RED** — Verifieer dat de feature nog niet bestaat
3. **GREEN** — Minimale code, `npm run build` na elke stap
4. **REFACTOR** — Verbeter zonder gedrag te wijzigen
5. **Review** — `code-reviewer` subagent, fix CRITICAL/HIGH
6. **Commit + push**

Feature: $ARGUMENTS
