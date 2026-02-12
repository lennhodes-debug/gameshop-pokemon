# Feature Team

Standaard team voor het bouwen van nieuwe features.

## Samenstelling (4 agents)

| Rol | Agent | Verantwoordelijkheid |
|-----|-------|---------------------|
| Onderzoeker | `researcher` | Bestaande code analyseren, patronen vinden |
| Ontwerper | `architect` | Implementatieplan schrijven |
| Bouwer | `implementer` | Code schrijven volgens plan |
| Reviewer | `code-reviewer` | Kwaliteit bewaken |

## Workflow
```
researcher (onderzoek)
    → architect (plan)
    → implementer (bouw)
    → code-reviewer (review)
    → [fix CRITICAL findings]
    → npm run build
    → commit + push
```

## Wanneer gebruiken?
- Nieuwe pagina's of componenten
- Significante wijzigingen aan bestaande features
- Alles waar planning + implementatie + review nodig is

## File Lock Regels
- researcher: alleen lezen
- architect: alleen lezen
- implementer: schrijft naar de geplande bestanden
- code-reviewer: alleen lezen
