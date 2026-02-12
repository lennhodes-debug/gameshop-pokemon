Start een team workflow:

## Beschikbare Teams

| Team | Agents | Gebruik |
|------|--------|---------|
| **feature** | researcher + architect + implementer + code-reviewer | Nieuwe features bouwen |
| **analyse** | 3x researcher + seo + security + perf | Volledige site-analyse |
| **content** | copywriter + image-editor + seo + docs | Teksten en afbeeldingen |
| **visual** | researcher + architect + animator + implementer | Animaties en design |
| **quality** | qa + security + perf + reviewer + implementer | Audit en bug fixes |

## Workflow

1. **Team selecteren** op basis van de taak
   - Lees het team-bestand: `.claude/teams/{team}-team.md`
   - Volg de beschreven workflow en samenstelling

2. **Coordinator rol** aannemen
   - Delegeer taken aan de juiste agents via Task tool
   - Parallel waar mogelijk (meerdere Task calls in 1 bericht)
   - Sequentieel waar nodig (wacht op output)

3. **File locks respecteren**
   - Twee agents schrijven NOOIT naar hetzelfde bestand
   - Bij conflict: sequentieel uitvoeren

4. **Kwaliteitspoort** na elke schrijfstap
   - `npm run build` moet slagen
   - Bij falen: direct fixen

5. **Resultaat**
   - Commit + push
   - Kort samenvatten wat er bereikt is

Team: $ARGUMENTS
