# Quality Team

Team voor kwaliteitscontrole en bug fixes.

## Samenstelling (4-5 agents)

| Rol | Agent | Verantwoordelijkheid |
|-----|-------|---------------------|
| QA Tester | `qa-tester` | Bugs, edge cases, data integriteit |
| Security | `security-auditor` | XSS, input validatie, dependencies |
| Performance | `perf-profiler` | Bundle size, re-renders |
| Reviewer | `code-reviewer` | Code kwaliteit, type safety |
| Fixer | `implementer` | Gevonden issues oplossen |

## Workflow
```
qa-tester + security-auditor + perf-profiler + code-reviewer (parallel: audit)
    → resultaten samenvoegen en prioriteren
    → implementer (fixes: CRITICAL eerst, dan HIGH)
    → npm run build
    → commit + push
```

## Wanneer gebruiken?
- Pre-deploy kwaliteitscheck
- Na grote refactoring
- Periodieke audit
- Bug hunting sessie
