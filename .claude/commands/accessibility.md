Toegankelijkheidsaudit (WCAG 2.1 AA):

## Audit Gebieden

1. **Semantiek** — Heading hierarchy (h1-h6), landmark regions (nav, main, footer)
2. **Toetsenbord** — Tab-volgorde, focus-visible, skip-links, escape-toets
3. **ARIA** — Labels, roles, states op interactieve elementen
4. **Contrast** — Min 4.5:1 normaal, 3:1 groot tekst
5. **Afbeeldingen** — Alt-teksten op productfoto's, decoratief `alt=""`
6. **Formulieren** — Labels, foutmeldingen, verplichte velden
7. **Animaties** — `prefers-reduced-motion` ondersteuning
8. **Schermlezer** — aria-live voor cart updates, toast meldingen, zoekresultaten

## Gameshop-specifieke Checks
- ProductCard hover effecten keyboard-accessible
- Cart badge aria-label in header
- Filter wijzigingen aria-live
- Checkout foutmeldingen duidelijk

Focus: $ARGUMENTS

Rapporteer per WCAG-criterium met ernst (A/AA/AAA) en locatie.
