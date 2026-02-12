Pre-deploy verificatie checklist:

1. **Build** — `npm run build` moet slagen zonder errors
2. **Lint** — `npm run lint` mag geen errors hebben
3. **Routes** — Verifieer dat alle routes in Header.tsx en Footer.tsx bestaan
4. **SEO** — Check metadata, robots.txt, sitemap.xml completheid
5. **Afbeeldingen** — Check op ontbrekende product afbeeldingen
6. **Data integriteit** — Verifieer products.json structuur en verplichte velden
7. **Security** — Run npm audit, check op hardcoded secrets
8. **Git** — Check of alles gecommit en gepusht is

Rapporteer een GO/NO-GO beslissing met eventuele blokkerende issues.
