# Content Team

Team voor content-gerelateerde taken: teksten, afbeeldingen, SEO.

## Samenstelling (4 agents)

| Rol | Agent | Verantwoordelijkheid |
|-----|-------|---------------------|
| Schrijver | `copywriter` | Nederlandse productbeschrijvingen, marketing |
| Beeldbewerker | `image-editor` | Cover art, WebP conversie, optimalisatie |
| SEO Expert | `seo-specialist` | Metadata, zoekwoorden, structured data |
| Documentatie | `docs-writer` | CLAUDE.md updates, changelog |

## Workflow
```
copywriter + image-editor (parallel: content creatie)
    → seo-specialist (SEO optimalisatie)
    → docs-writer (documentatie update)
    → npm run build
    → commit + push
```

## Wanneer gebruiken?
- Nieuwe producten toevoegen met beschrijvingen en covers
- Beschrijvingen herschrijven of verbeteren
- SEO optimalisatie campagne
- Na grote codebase wijzigingen (docs update)

## File Lock Regels
- copywriter: schrijft naar `src/data/products.json` (description velden)
- image-editor: schrijft naar `public/images/products/` + products.json (image velden)
- seo-specialist: schrijft naar layout/page metadata bestanden
- docs-writer: schrijft naar `CLAUDE.md`
- **Conflict:** copywriter en image-editor schrijven beiden naar products.json
  - Oplossing: copywriter eerst (descriptions), image-editor daarna (image paden)
