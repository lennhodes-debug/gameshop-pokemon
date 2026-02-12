Volledige code review van recente wijzigingen:

## Stappen

1. **Scope bepalen** — Welke commits reviewen?
   - `git log --oneline -20` voor recente historie
   - `git diff main..HEAD --stat` voor gewijzigde bestanden

2. **Parallelle review** — Start deze agents tegelijk:
   - `code-reviewer`: bugs, type safety, logica fouten
   - `security-auditor`: XSS, input validatie, secrets
   - `perf-profiler`: bundle impact, re-renders
   - `qa-tester`: data integriteit, edge cases

3. **Resultaten samenvoegen**
   - Prioriteer: CRITICAL > HIGH > MEDIUM > LOW
   - Deduplicate bevindingen die meerdere agents rapporteren

4. **Fixes** — Implementeer top bevindingen
   - CRITICAL: altijd fixen
   - HIGH: fixen als mogelijk
   - MEDIUM/LOW: documenteren voor later

5. **Build + commit + push**

Focus: $ARGUMENTS
