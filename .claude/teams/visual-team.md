# Visual Team

Team voor visuele verbeteringen en animaties.

## Samenstelling (3-4 agents)

| Rol | Agent | Verantwoordelijkheid |
|-----|-------|---------------------|
| Onderzoeker | `researcher` | Huidige visuele patronen analyseren |
| Ontwerper | `architect` | Visueel verbeterplan |
| Animator | `animator` | Framer Motion, CSS keyframes implementeren |
| Bouwer | `implementer` | Layout/structuur wijzigingen |

## Workflow
```
researcher (analyse huidige visuals)
    → architect (verbeterplan)
    → animator + implementer (parallel: animaties + layout)
    → code-reviewer (review)
    → npm run build
    → commit + push
```

## Wanneer gebruiken?
- Homepage sectie redesign
- Nieuwe animaties en micro-interacties
- Design systeem uitbreidingen
- Responsive verbeteringen

## File Lock Regels
- animator: schrijft naar `src/app/globals.css` + component bestanden
- implementer: schrijft naar andere component bestanden
- **Nooit** beiden naar hetzelfde bestand
