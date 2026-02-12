Pre-deploy verificatie checklist:

## Checks

1. **Build** — `npm run build` (noteer aantal pagina's)
2. **Lint** — `npm run lint` (geen errors)
3. **Routes** — Links in Header.tsx en Footer.tsx bestaan
4. **SEO** — robots.ts, sitemap.ts, root metadata
5. **Afbeeldingen** — Producten met image veld: bestanden bestaan
6. **Data** — products.json: verplichte velden, unieke SKU's, isPremium correct
7. **Security** — `npm audit`, geen hardcoded secrets
8. **Git** — Alles gecommit en gepusht

## Eindoordeel
**GO** of **NO-GO** met eventuele blokkerende issues.
