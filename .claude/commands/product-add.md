Voeg een nieuw product toe aan de catalogus:

1. **Valideer** — Controleer of het SKU-prefix geldig is (DS-, 3DS-, GBA-, GB-)
2. **Volgende SKU** — Bepaal het volgende vrije nummer in de reeks
3. **Product data** — Maak het volledige product-object aan in `src/data/products.json`
4. **Slug genereren** — `{sku-lower}-{naam-slug}` zonder speciale tekens
5. **isPremium** — Zet op `true` als prijs >= 50
6. **Build** — Run `npm run build` om te verifiëren
7. **Commit + push**

Product: $ARGUMENTS

Volg EXACT de Product interface uit `src/lib/products.ts`. Alle velden zijn verplicht.
