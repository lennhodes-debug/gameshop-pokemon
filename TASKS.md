# TASKS.md — Gameshop Enter Verbeterlijst

> **Branch:** `claude/gameshop-local-access-hnbgR`
> **Status:** Werk 1 taak per chat. Commit + push na elke taak.
> **Regel:** Markeer je taak als `[x]` VOORDAT je commit zodat andere chats zien dat het bezet is.

---

## Hoe te gebruiken

1. Open dit bestand, kies een taak die nog `[ ]` is
2. Markeer het als `[x]` en commit TASKS.md eerst
3. Voer de verbetering uit
4. Test met `npx next build` (moet slagen)
5. Commit alle gewijzigde bestanden + push

**BELANGRIJK:** Elke taak vermeldt welke bestanden het raakt. Werk NOOIT aan 2 taken die dezelfde bestanden raken tegelijk.

---

## TAKEN

### A. Data fixes (snel, hoge prioriteit)

#### [ ] Taak 1 — Over Ons pagina: "346" → "846" en timeline updaten
**Bestanden:** `src/app/over-ons/page.tsx`
**Wat:**
- Regel 72: `"346+ producten"` → `"846+ producten"` (in timeline 2024 beschrijving)
- Regel 133: `{ value: 346, suffix: '+', label: 'Producten' }` → `846`
- Regel 479: `"meer dan 346 originele Nintendo producten"` → `"meer dan 846 originele Nintendo producten"`
- Voeg een 2025 tijdlijn-item toe na het 2024 item (voor de "Nu" entry):
  ```
  {
    year: '2025',
    title: 'Meer dan 846 producten online',
    description: 'Het assortiment groeide explosief naar 846+ producten over 12 Nintendo platforms. De nieuwe webshop ging live met professionele cover art, uitgebreide beschrijvingen en een volledig inkoopsysteem voor klanten die hun games willen verkopen.',
    icon: '🌐',
    color: 'from-teal-500 to-emerald-500',
  }
  ```

---

### B. Homepage componenten

#### [ ] Taak 2 — Hero: subtitel en CTA tekst verbeteren
**Bestanden:** `src/components/home/Hero.tsx`
**Wat:**
- Huidige subtitel is generiek. Maak het specifieker en overtuigender.
- Verander de subtitel naar iets als: "Van klassieke NES-parels tot de nieuwste Switch-titels — elk product origineel, getest en met liefde verpakt."
- Check of de CTA buttons goed leesbaar en aantrekkelijk zijn.
- Zorg dat de stats kloppen (moet 846+ zijn — dit is al gefixed, controleer alleen).

#### [ ] Taak 3 — TrustStrip: meer overtuigende teksten
**Bestanden:** `src/components/home/TrustStrip.tsx`
**Wat:**
- Lees de huidige 4 trust items. Verbeter de beschrijvingen zodat ze concreter en overtuigender zijn.
- Voeg specifiekere details toe: bijv. "Alle 846 producten persoonlijk getest" ipv generieke tekst.
- Behoud dezelfde structuur (4 items), alleen tekst verbeteren.

#### [ ] Taak 4 — ReviewsStrip: meer en betere reviews toevoegen
**Bestanden:** `src/components/home/ReviewsStrip.tsx`
**Wat:**
- Huidige reviews bekijken en controleren of er genoeg variatie is.
- Voeg 4-6 extra reviews toe met verschillende namen, platforms en ervaringen.
- Zorg voor mix van: snelle levering, product kwaliteit, verpakking, klantenservice.
- Alle reviews in het Nederlands, realistische namen.
- Voeg Marktplaats link toe als bron: "Bekijk al onze 1360+ reviews op Marktplaats" met link onderaan.

#### [ ] Taak 5 — FeaturedProducts: sectie header verbeteren
**Bestanden:** `src/components/home/FeaturedProducts.tsx`
**Wat:**
- De sectie titel en beschrijving aantrekkelijker maken.
- "Uitgelichte producten" is generiek. Maak het pakkender, bijv. "Populaire keuzes" of "Toppers van deze week".
- Voeg een subtitel toe die de selectie uitlegt.
- Check of de "Bekijk alles" link goed werkt.

#### [ ] Taak 6 — GameMarquee: meer rijen + snelheid tunen
**Bestanden:** `src/components/home/GameMarquee.tsx`
**Wat:**
- Momenteel 2 rijen van 18 producten. Als er meer producten met afbeeldingen zijn, gebruik er meer (bijv. 24 per rij).
- Check of de marquee snelheid goed aanvoelt (niet te snel, niet te langzaam).
- De section header "Onze collectie in beeld" eventueel verbeteren.

#### [ ] Taak 7 — PlatformGrid: productaantallen tonen per platform
**Bestanden:** `src/components/home/PlatformGrid.tsx`
**Wat:**
- Lees hoe de platforms worden getoond. Check of de platform namen en kleuren kloppen.
- Toon het aantal producten per platform op elke kaart (bijv. "124 producten").
- Dit moet dynamisch zijn vanuit de product data, niet hardcoded.
- Import `getAllPlatforms` uit `@/lib/products` en gebruik de count.

#### [ ] Taak 8 — AboutPreview: tekst en CTA verbeteren
**Bestanden:** `src/components/home/AboutPreview.tsx`
**Wat:**
- De "Over ons" preview tekst aantrekkelijker maken.
- Zorg dat de stats kloppen (846+ producten — al gefixed, controleer).
- De CTA naar de over-ons pagina duidelijker en uitnodigender maken.

#### [ ] Taak 9 — FaqPreview: vragen updaten
**Bestanden:** `src/components/home/FaqPreview.tsx`
**Wat:**
- Check de 5 FAQ vragen op de homepage.
- Zorg dat antwoorden up-to-date zijn (846 producten, niet 346).
- Overweeg of de 5 meest gestelde vragen de juiste zijn voor de homepage.

#### [ ] Taak 10 — NewsletterCTA: tekst en design polish
**Bestanden:** `src/components/home/NewsletterCTA.tsx`
**Wat:**
- Tekst verbeteren: "Blijf op de hoogte" is generiek.
- Voeg een concreter voordeel toe, bijv. "Ontvang exclusieve kortingscodes en word als eerste geinformeerd over zeldzame aanwinsten."
- De "submitted" bevestiging tekst verbeteren.

---

### C. Shop & Product pagina's

#### [x] Taak 11 — Shop pagina: "Nieuw binnen" sorteeroptie toevoegen
**Bestanden:** `src/app/shop/page.tsx`
**Wat:**
- Voeg een extra sorteeroptie toe: "Nieuw binnen" (sorteer op SKU nummer aflopend, hogere nummers = nieuwer).
- Voeg dit toe aan het switch statement in de sort logica.
- Case: `'newest'` → sorteer op SKU nummer (parse het nummer uit de SKU string, bijv. SW-001 → 1).

#### [x] Taak 12 — Product detail: beschrijving sectie verbeteren
**Bestanden:** `src/components/product/ProductDetail.tsx`
**Wat:**
- De product beschrijving sectie visueel aantrekkelijker maken.
- Voeg een "Beschrijving" heading toe boven de beschrijving tekst als die er nog niet is.
- Zorg dat de specificatietabel goed werkt (recent toegevoegd).
- Check of de badges (conditie, compleetheid, CIB) goed leesbaar zijn.

#### [x] Taak 13 — Shop filters: Game Boy varianten groeperen
**Bestanden:** `src/components/shop/Filters.tsx`
**Wat:**
- Check of alle platform filters correct werken.
- Er zijn mogelijk veel platforms (12 stuks). Check of het filter dropdown goed werkt op mobiel.
- Overweeg om "Game Boy" varianten (Game Boy, Game Boy Color, Game Boy Advance) te groeperen in het UI.

---

### D. Overige pagina's

#### [x] Taak 14 — Winkelwagen: upsell sectie toevoegen
**Bestanden:** `src/app/winkelwagen/page.tsx`
**Wat:**
- Onder de winkelwagen items een "Misschien ook interessant" sectie toevoegen.
- Toon 2-4 producten met afbeeldingen die gerelateerd zijn aan wat er in de wagen zit.
- Gebruik `getRelatedProducts` uit `@/lib/products` of filter op platform.
- Alleen tonen als er items in de wagen zitten.

#### [x] Taak 15 — Afrekenen: formulier validatie verbeteren
**Bestanden:** `src/app/afrekenen/page.tsx`
**Wat:**
- Check de formulier validatie: postcode format (4 cijfers + 2 letters), e-mail, verplichte velden.
- Voeg inline validatie toe (rode rand + foutmelding bij incorrect formaat).
- Nederlandse postcode regex: `/^\d{4}\s?[A-Za-z]{2}$/`
- Check of de betaalmethoden goed worden getoond.

#### [ ] Taak 16 — Inkoop pagina: uitleg verbeteren
**Bestanden:** `src/app/inkoop/page.tsx`
**Wat:**
- De uitleg bovenaan de pagina verbeteren: leg duidelijker uit hoe het inkoopproces werkt.
- Stappen toevoegen: 1. Zoek je game 2. Bekijk de inkoopprijs 3. Stuur ons een e-mail 4. Verzend het product 5. Ontvang je geld.
- Voeg het e-mailadres (gameshopenter@gmail.com) prominent toe.

#### [ ] Taak 17 — Contact pagina: openingstijden toevoegen
**Bestanden:** `src/app/contact/page.tsx`
**Wat:**
- Voeg reactietijden/beschikbaarheid informatie toe.
- Bijv. "We reageren doorgaans binnen 24 uur, maandag t/m vrijdag."
- Voeg een klein FAQ sectietje toe met 2-3 snelle vragen.
- Check of het formulier alle velden juist heeft.

#### [ ] Taak 18 — FAQ pagina: meer vragen toevoegen
**Bestanden:** `src/app/faq/page.tsx`
**Wat:**
- Voeg 4-6 extra FAQ items toe, bijv.:
  - "Bieden jullie garantie op producten?"
  - "Kan ik games bij jullie inruilen?"
  - "Hoeveel platforms bieden jullie aan?"
  - "Verkopen jullie ook accessoires?"
  - "Hoe weet ik of een product compleet is?"
  - "Worden producten ook naar Belgie verzonden?"
- Update het FAQPage schema (faqJsonLd) zodat de nieuwe vragen ook in Google verschijnen.

#### [ ] Taak 19 — 404 pagina: suggesties toevoegen
**Bestanden:** `src/app/not-found.tsx`
**Wat:**
- Voeg 3-4 populaire productcategorieen toe als suggesties.
- Bijv. snelle links: "Nintendo Switch games", "GameCube games", "Retro consoles", "Alle producten".
- Maak het speelser/gamified — het "Game Over" thema is al goed.

#### [ ] Taak 20 — Juridische pagina's: inhoud uitbreiden
**Bestanden:** `src/app/privacybeleid/page.tsx`, `src/app/retourbeleid/page.tsx`, `src/app/algemene-voorwaarden/page.tsx`
**Wat:**
- Check of deze pagina's voldoende inhoud hebben.
- Privacybeleid: moet vermelden welke gegevens worden verzameld, cookies, Mollie betalingen, Google Analytics (indien van toepassing).
- Retourbeleid: 14 dagen bedenktijd, voorwaarden, hoe te retourneren, contactgegevens.
- Algemene voorwaarden: bedrijfsgegevens, levering, betaling, aansprakelijkheid.

---

### E. Layout & navigatie

#### [ ] Taak 21 — Footer: inkoop link + social links toevoegen
**Bestanden:** `src/components/layout/Footer.tsx`
**Wat:**
- Voeg "Games verkopen" (inkoop) link toe onder "Shop" sectie.
- Voeg Marktplaats profiel link toe bij contact (als beschikbaar).
- Check of alle bestaande links correct zijn.
- Voeg het jaar automatisch toe (is al dynamisch, controleer).

#### [ ] Taak 22 — Header: actieve staat mobiel menu verbeteren
**Bestanden:** `src/components/layout/Header.tsx`
**Wat:**
- Check of het mobiele menu goed werkt.
- Overweeg een "Winkelwagen" link in het mobiele menu (nu alleen via het icoontje rechts).
- Check of de zoekbalk shortcut (Cmd+K) goed werkt.
- Overweeg om het cart count badge ook in het mobiele menu te tonen.

---

### F. SEO & Performance

#### [ ] Taak 23 — Sitemap: meer pagina's toevoegen
**Bestanden:** `src/app/sitemap.ts`
**Wat:**
- Check of alle pagina's in de sitemap staan (inclusief /inkoop, /contact, /faq, /over-ons).
- Voeg `lastModified` dates toe.
- Voeg priority en changefreq toe aan belangrijke pagina's.
- Product pagina's moeten allemaal in de sitemap staan.

#### [ ] Taak 24 — Robots.txt: optimaliseren
**Bestanden:** `src/app/robots.ts`
**Wat:**
- Check of robots.txt correct geconfigureerd is.
- Zorg dat de sitemap URL correct is: `https://gameshopenter.nl/sitemap.xml`
- Blokkeer onnodige paden (bijv. /api/ als die bestaan).

#### [ ] Taak 25 — Layout metadata: uitbreiden
**Bestanden:** `src/app/layout.tsx`
**Wat:**
- Check of alle OpenGraph tags correct zijn.
- Voeg `verification` toe voor Google Search Console (placeholder).
- Check Schema.org Store markup: voeg `priceRange`, `openingHours`, `areaServed` toe.
- Voeg `alternate` hreflang toe (nl) als dat ontbreekt.

---

### G. UI Componenten

#### [ ] Taak 26 — Badge component: nieuwe varianten
**Bestanden:** `src/components/ui/Badge.tsx`
**Wat:**
- Check welke varianten er zijn (condition, completeness, premium, console).
- Voeg een "new" variant toe voor nieuwe producten.
- Voeg een "sale" variant toe (rood/oranje) voor eventuele toekomstige aanbiedingen.
- Zorg dat alle kleuren goed leesbaar zijn op zowel lichte als donkere achtergronden.

#### [ ] Taak 27 — ProductCard: prijsweergave verbeteren
**Bestanden:** `src/components/shop/ProductCard.tsx`
**Wat:**
- Als een product premium is (>= 100 euro), toon dan "Gratis verzending" als klein label bij de prijs.
- Check of het "+Winkelmand" knopje goed werkt op mobiel (niet te klein).
- De "Toegevoegd" bevestiging animatie is mooi, controleer of timing goed is.

---

## Statusoverzicht

| Taak | Status | Chat | Bestanden |
|------|--------|------|-----------|
| 1 | `[ ]` | — | over-ons/page.tsx |
| 2 | `[ ]` | — | Hero.tsx |
| 3 | `[ ]` | — | TrustStrip.tsx |
| 4 | `[ ]` | — | ReviewsStrip.tsx |
| 5 | `[ ]` | — | FeaturedProducts.tsx |
| 6 | `[ ]` | — | GameMarquee.tsx |
| 7 | `[ ]` | — | PlatformGrid.tsx |
| 8 | `[ ]` | — | AboutPreview.tsx |
| 9 | `[ ]` | — | FaqPreview.tsx |
| 10 | `[ ]` | — | NewsletterCTA.tsx |
| 11 | `[x]` | done | shop/page.tsx |
| 12 | `[x]` | done | ProductDetail.tsx |
| 13 | `[x]` | done | Filters.tsx |
| 14 | `[x]` | done | winkelwagen/page.tsx |
| 15 | `[x]` | done | afrekenen/page.tsx |
| 16 | `[ ]` | — | inkoop/page.tsx |
| 17 | `[ ]` | — | contact/page.tsx |
| 18 | `[ ]` | — | faq/page.tsx |
| 19 | `[ ]` | — | not-found.tsx |
| 20 | `[ ]` | — | privacybeleid + retourbeleid + voorwaarden |
| 21 | `[ ]` | — | Footer.tsx |
| 22 | `[ ]` | — | Header.tsx |
| 23 | `[ ]` | — | sitemap.ts |
| 24 | `[ ]` | — | robots.ts |
| 25 | `[ ]` | — | layout.tsx |
| 26 | `[ ]` | — | Badge.tsx |
| 27 | `[ ]` | — | ProductCard.tsx |

---

## Technische context

- **Framework:** Next.js 14 (App Router, SSG)
- **Styling:** Tailwind CSS 3 + Framer Motion 12
- **Data:** `src/data/products.json` (846 producten, NIET wijzigen tenzij noodzakelijk)
- **Build test:** `npx next build` (moet slagen, 862 pagina's)
- **Branch:** `claude/gameshop-local-access-hnbgR`
- **Push:** `git push -u origin claude/gameshop-local-access-hnbgR`
- **Taal:** Website is in het Nederlands. Code/comments mogen Engels.
- **NOOIT** `prebuild` script terugzetten in package.json (overschrijft 846 producten met oude 346)
