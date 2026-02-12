# Analyse Team

Team voor volledige site-analyse. Alle agents draaien parallel.

## Samenstelling (6 agents)

| Rol | Agent | Focus |
|-----|-------|-------|
| Catalogus Analyst | `researcher` | Producten, SKU's, prijzen, genres |
| Media Analyst | `researcher` | Afbeeldingen, ontbrekende covers, grootte |
| Markt Analyst | `researcher` | Inkoop, marges, premium producten |
| SEO Specialist | `seo-specialist` | Metadata, structured data, sitemap |
| Security Auditor | `security-auditor` | XSS, dependencies, privacy |
| Performance | `perf-profiler` | Bundle size, re-renders, assets |

## Workflow
```
Alle 6 agents parallel starten
    → resultaten verzamelen
    → samenvatting maken
    → eventueel quick-wins implementeren
```

## Wanneer gebruiken?
- Periodieke health check van de site
- Voor grote refactoring beslissingen
- Na veel wijzigingen om de staat te inventariseren
