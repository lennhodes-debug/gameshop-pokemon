# Verbeterplan Gameshop Enter

> Samengesteld op basis van 5 parallelle analyses: Architectuur, Security, Performance, UX en Code Review.
> Gerangschikt op impact en urgentie.

---

## FASE 1 — Directe Gebruikersproblemen (Prioriteit: KRITIEK)

### 1.1 Productafbeeldingen opschonen
**Probleem:** Sommige productfoto's staan scheef/schuin, andere zijn in-game screenshots i.p.v. box art (o.a. Omega Ruby, X, Crystal, Red-gerelateerde games).

**Actie:**
- Alle 34 productafbeeldingen visueel controleren
- Scheve foto's rechtzetten of vervangen door rechte box art
- In-game screenshots vervangen door correcte PAL/EUR box art covers
- Betreft minimaal: `3ds-001-pokemon-x.webp`, `3ds-002-pokemon-omega-ruby.webp`, en vergelijkbare
- Alle nieuwe afbeeldingen: WebP 500x500, quality 85

### 1.2 Type-particles verwijderen van ProductCard
**Probleem:** Bij hover over productkaarten verschijnen vuur-/waterdeeltjes en andere type-specifieke particles. Ongewenst visueel effect.

**Actie:**
- `TypeParticles` component verwijderen uit `src/components/shop/ProductCard.tsx`
- Particle animatie CSS (@keyframes particle-float, particle-drift, particle-spark, ghost-mist, particle-sparkle) verwijderen uit `src/app/globals.css`
- De gekleurde type-kaart styling (gradient achtergrond, glow shadows) behouden — alleen de zwevende deeltjes weg

### 1.3 Type-labels ("Vuur", "Water", etc.) verwijderen
**Probleem:** Op de product detail pagina staan labels als "Vuur", "Water", "Gras" etc. naast het platform. Deze zijn lelijk/ongewenst.

**Actie:**
- Type label badge verwijderen in `src/components/product/ProductDetail.tsx` (regel 237-242)
- `typeInfo.label` property mag in `utils.ts` blijven (wordt wellicht later gebruikt), maar niet meer getoond in UI

### 1.4 Uitgebreide productbeschrijvingen toevoegen
**Probleem:** Huidige beschrijvingen zijn 221-354 tekens — te kort voor goede SEO en productinformatie.

**Actie:**
- Per game een uitgebreide beschrijving schrijven (minimaal 500-800 tekens)
- Inhoud per beschrijving: verhaallijn, gameplay highlights, generatie, legendarische Pokemon, bijzonderheden, verzamelwaarde, conditie-details
- Direct in `src/data/products.json` bijwerken

---

## FASE 2 — Performance Verbeteringen (Prioriteit: HOOG)

### 2.1 ProductGrid Framer Motion optimaliseren
**Probleem:** Bij 48 producten per pagina draaien 48 individuele scroll observers, spring animaties en transform berekeningen. Zwaar op mobiel.

**Actie:**
- `ShelfCard` wrapper met individuele `useScroll`/`useTransform`/`useSpring` verwijderen uit `src/components/shop/ProductGrid.tsx`
- Vervangen door lichtgewicht CSS-only entrance animatie
- `whileInView` stagger animatie behouden maar met `once: true` zodat het maar 1x triggert

### 2.2 Mouse tracking per kaart optimaliseren
**Probleem:** `setMousePos` bij elke `onMouseMove` triggert re-render van hele ProductCard inclusief kinderen.

**Actie:**
- Mouse positie verplaatsen naar CSS custom properties via `useRef` i.p.v. `useState`
- Of: `requestAnimationFrame` throttle toepassen op mouse moves

### 2.3 Oneindige animaties in shop header stoppen buiten viewport
**Probleem:** Twee gradient orbs (12s en 15s) en floating grid (8s) animeren altijd, ook buiten beeld.

**Actie:**
- `useInView` gebruiken om animaties te pauzeren wanneer de header uit beeld is
- Of: CSS `animation-play-state: paused` via Intersection Observer

### 2.4 Dode dark: classes verwijderen
**Probleem:** Veel componenten bevatten `dark:` Tailwind classes, maar er is geen dark mode. Dit vergroot de CSS bundle onnodig.

**Actie:**
- Alle `dark:` prefixed classes verwijderen uit de codebase
- Of: `darkMode: 'class'` toevoegen aan tailwind.config als dark mode gepland is

---

## FASE 3 — Code Kwaliteit & Bugs (Prioriteit: HOOG)

### 3.1 Korting dubbel-aftrek bug in checkout
**Probleem:** `getTotal()` retourneert al het subtotaal MINUS korting, maar de checkout toont `getTotal()` als "subtotaal" EN de korting als aparte regel. Visueel misleidend.

**Actie:**
- `getSubtotal()` (voor korting) exporteren uit CartProvider
- Checkout pagina: bruto subtotaal tonen via `getSubtotal()`, korting als aparte aftrekpost, totaal via `getTotal()`

### 3.2 Debounce useEffect dependency fix
**Probleem:** In shop page leest het debounce effect `debouncedSearch` in de closure maar die staat niet in de dependency array.

**Actie:**
- `debouncedSearch` toevoegen aan de dependency array: `[search, debouncedSearch]`

### 3.3 Validations object stabiliseren in checkout
**Probleem:** `validations` object wordt elke render opnieuw aangemaakt en dient als dependency van `useMemo` voor `progress`. Memo is hierdoor nutteloos.

**Actie:**
- `validations` wrappen in `useMemo` of als `useRef` opslaan

### 3.4 RecentlyViewed: Map lookup i.p.v. lineaire scan
**Probleem:** `allProducts.find()` per SKU terwijl `getProductBySku()` O(1) Map lookup biedt.

**Actie:**
- `getProductBySku()` gebruiken i.p.v. `getAllProducts().find()`

### 3.5 Hardcoded AggregateRating per product verwijderen
**Probleem:** Elk product claimt 5.0 met 1360 reviews in structured data. Google kan dit als spam beschouwen.

**Actie:**
- `aggregateRating` verwijderen uit individuele product JSON-LD schemas
- Alleen behouden in het root Store schema

---

## FASE 4 — Architectuur Verbeteringen (Prioriteit: MIDDEL)

### 4.1 Shop filter state consolideren
**Probleem:** 11 afzonderlijke `useState` hooks voor filters maken de code complex en foutgevoelig.

**Actie:**
- Refactoren naar `useReducer` met `FilterState` type
- `clearFilters` wordt dan een enkele `dispatch({ type: 'CLEAR' })`
- Bonus: URL sync wordt eenvoudiger

### 4.2 ProductCard opsplitsen
**Probleem:** 478 regels met twee volledig gescheiden render paths (Pokemon vs standaard).

**Actie:**
- Gedeelde logica extraheren (handleAddToCart, mouse tracking, variant toggle)
- `PokemonProductCard` en `StandardProductCard` als aparte varianten
- `ProductCard` als wrapper die de juiste variant selecteert

### 4.3 Gedupliceerde patronen extraheren
**Probleem:** Free shipping progress bar (3x), image fallback (7x), SVG iconen (6+ locaties) zijn gedupliceerd.

**Actie:**
- `<FreeShippingProgress />` component maken
- `<ProductImage />` component met fallback logica
- Icon library component voor veelgebruikte SVG's (winkelwagen, vinkje, vrachtwagen)

### 4.4 Winkelwagen pagina opsplitsen
**Probleem:** 592 regels monolithisch bestand met cart items, order summary, kortingscode, upsell, recently viewed.

**Actie:**
- Opsplitsen in: `CartItems`, `OrderSummary`, `DiscountCode`, `UpsellSuggestions` componenten

---

## FASE 5 — Security Verbeteringen (Prioriteit: MIDDEL)

### 5.1 Checkout formulier validatie versterken
**Actie:**
- Server-side achtige validatie voor email, postcode, naam
- Prijsveld NaN-check toevoegen in shop filters
- localStorage.setItem debouncing toevoegen in checkout

### 5.2 Kortingscodes uit client bundle halen
**Probleem:** Codes `WELKOM10`, `RETRO5`, `NINTENDO15`, `GAMESHOP20` staan in plain-text in de JavaScript bundle.

**Actie:**
- Documenteren als bekende beperking (simulatie-omgeving)
- Bij backend integratie: server-side validatie implementeren

### 5.3 ErrorBoundary granulairder plaatsen
**Actie:**
- Error boundaries toevoegen rond CartProvider, WishlistProvider
- Individuele boundaries rond ProductGrid en FeaturedProducts
- `componentDidCatch` implementeren voor error logging

---

## FASE 6 — UX & Conversie Optimalisatie (Prioriteit: LAAG-MIDDEL)

### 6.1 Loading states toevoegen
**Actie:**
- Skeleton cards tonen bij initieel laden van shop pagina
- Loading state voor winkelwagen terwijl localStorage wordt gelezen
- Smooth fade-in voor RecentlyViewed om layout shift te voorkomen

### 6.2 Scroll-lock centraliseren
**Probleem:** Scroll locking wordt op 3 plekken onafhankelijk geimplementeerd.

**Actie:**
- `useScrollLock` custom hook maken
- Gebruiken in ProductDetail lightbox, QuickView modal, Header mobile menu

### 6.3 Lightbox Image component gebruiken
**Probleem:** Lightbox gebruikt `<img>` tag i.p.v. Next.js `<Image>`.

**Actie:**
- Vervangen door `<Image fill sizes="100vw" />` voor optimalisatie

### 6.4 CartProvider getTotal/getItemCount optimaliseren
**Probleem:** Worden als functies in context value gestopt. Elke consumer herberekent.

**Actie:**
- Omzetten naar `useMemo` berekende waarden `total` en `itemCount`

---

## Samenvatting Prioriteiten

| Fase | Focus | Items | Impact |
|------|-------|-------|--------|
| **1** | Gebruikersproblemen | Afbeeldingen, particles, labels, beschrijvingen | Direct zichtbaar voor klant |
| **2** | Performance | Framer Motion, mouse tracking, animaties | Snelheid op mobiel |
| **3** | Bugs & Code | Korting bug, dependencies, SEO spam | Correctheid |
| **4** | Architectuur | State management, component splits | Onderhoud |
| **5** | Security | Validatie, error handling | Betrouwbaarheid |
| **6** | UX Polish | Loading states, scroll-lock, optimalisaties | Afwerking |

---

*Plan opgesteld door 5 gespecialiseerde agents: Architect, Security Auditor, Performance Profiler, UX Researcher, Code Reviewer.*
