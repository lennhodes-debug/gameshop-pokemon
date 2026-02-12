Voeg een nieuw product toe aan de catalogus:

## Stappen

1. **Valideer** — Controleer of het SKU-prefix geldig is
   - Actieve prefixen: DS-, 3DS-, GBA-, GB-

2. **Volgende SKU** — Lees `src/data/products.json`, vind het hoogste nummer

3. **Product data** — Maak het volledige object aan volgens `src/lib/products.ts`
   - `slug`: `{sku-lower}-{naam-slug}` (geen accenten/speciale tekens)
   - `isPremium`: `true` als `price >= 50`
   - `image`: `/images/products/{slug}.webp` of `null`
   - `type`: altijd `"simple"`
   - `description`: Nederlands, 80-150 woorden

4. **Voeg toe** aan `src/data/products.json` (lees EERST)

5. **Cover art** (optioneel) — `image-editor` subagent

6. **Build** — `npm run build`

7. **Commit + push** — "Nieuw product: {naam} ({SKU})"

Product: $ARGUMENTS
