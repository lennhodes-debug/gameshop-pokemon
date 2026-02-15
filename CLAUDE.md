# CLAUDE.md — Gameshop Enter

> Handleiding voor AI-assistenten. Automatisch geladen bij elke sessie.

---

## KRITIEKE AUTONOMIE-REGEL (BOVEN ALLES)

**VOLLEDIG AUTONOOM WERKEN — GEEN VRAGEN STELLEN**

- Maak zelf keuzes — geen vragen, geen opties
- Commit + push automatisch — geen bevestigingen
- Zeg NOOIT wat je gedaan hebt — jij bepaalt resultaat
- Taal: Nederlands (UI, commits, output)
- Push direct op `main` branch

---

## Project Overzicht

| Veld | Waarde |
|---|---|
| Naam | Gameshop Enter |
| Type | E-commerce webshop (Nintendo retro games) |
| URL | https://gameshopenter.nl |
| Repository | `lennhodes-debug/gameshop-pokemon` |
| Eigenaar | Lenn Hodes |
| Contact | gameshopenter@gmail.com |
| Hosting | Netlify (auto-deploy vanuit `main` branch) |
| Status | Live productie — 141 Nintendo games + 6 consoles (147 totaal) |

---

## Tech Stack

| Technologie | Versie | Doel |
|---|---|---|
| **Next.js** | 15.5.12 | React framework, App Router, SSG |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.9.3 | Type safety (strict mode) |
| **Tailwind CSS** | 3.4.19 | Utility-first styling |
| **Framer Motion** | 12.33.0 | Animaties, transitions, gestures |
| **Sharp** | 0.34.5 | Image optimization |
| **Netlify** | - | Hosting, CDN, auto-deploy |

### Architectuur
- **Geen backend, geen database** — Alle data statisch in JSON
- **SSG** — Alle productpagina's worden bij build gegenereerd
- **Client-side cart + wishlist** — localStorage met React Context
- **Geen CMS** — Productdata in `products.json`
- **Checkout simulatie** — Frontend-only (geen echte betalingen)
- **Font** — Inter via `next/font/google` (gewichten 300-800)

---

## Commands

```bash
npm run dev                            # Dev server op localhost:3000
npm run build                          # Productie build (draait eerst prebuild)
npm run start                          # Start productie server
npm run lint                           # Next.js ESLint
```

**Prebuild:** `validate-images.mjs` — valideert image paden, overschrijft NIET products.json.

---

## Bestandsstructuur

```
gameshop-pokemon/
├── CLAUDE.md                          # DIT BESTAND
├── package.json
├── next.config.js                     # Next.js config (image formats)
├── tailwind.config.ts                 # Tailwind thema (brand colors, fonts)
├── tsconfig.json                      # TypeScript config (strict)
├── netlify.toml                       # Netlify build config
│
├── public/images/products/            # ~973 WebP cover art (500x500, quality 85)
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # ROOT LAYOUT — providers, SEO, Schema.org
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css                # Tailwind + animatie keyframes
│   │   ├── template.tsx               # CSS fade-in page transition
│   │   ├── robots.ts / sitemap.ts     # SEO bestanden
│   │   ├── not-found.tsx              # 404 pagina
│   │   ├── shop/page.tsx              # SHOP — zoeken, filteren, paginatie
│   │   ├── shop/[sku]/page.tsx        # PRODUCT DETAIL — SSG
│   │   ├── winkelwagen/               # Winkelwagen
│   │   ├── verlanglijst/              # Wishlist
│   │   ├── afrekenen/                 # Checkout (Mollie simulatie)
│   │   ├── inkoop/                    # Trade-in prijslijst
│   │   ├── game-finder/               # Interactieve game recommender
│   │   ├── nintendo/                  # Nintendo brand story pagina
│   │   ├── over-ons/                  # Over ons
│   │   ├── faq/                       # FAQ
│   │   ├── contact/                   # Contact
│   │   ├── privacybeleid/             # Privacy
│   │   ├── retourbeleid/              # Retour
│   │   ├── algemene-voorwaarden/      # Terms
│   │   └── api/chat/route.ts          # ChatBot API endpoint
│   │
│   ├── components/
│   │   ├── cart/CartProvider.tsx       # Cart Context + localStorage
│   │   ├── wishlist/WishlistProvider.tsx # Wishlist Context + localStorage
│   │   │
│   │   ├── home/                      # Homepage secties (9 componenten)
│   │   │   ├── Hero.tsx               # Hero: typewriter, magnetic CTAs
│   │   │   ├── TrustStrip.tsx         # 4 trust items
│   │   │   ├── FeaturedProducts.tsx   # 8 uitgelichte producten
│   │   │   ├── PlatformGrid.tsx       # Platform selectie grid
│   │   │   ├── ReviewsStrip.tsx       # Reviews draggable strip
│   │   │   ├── ProcessTimeline.tsx    # 4-stappen animated SVG proces
│   │   │   ├── AboutPreview.tsx       # Over ons preview
│   │   │   ├── FaqPreview.tsx         # FAQ preview
│   │   │   └── NewsletterCTA.tsx      # Newsletter aanmelding
│   │   │
│   │   ├── layout/                    # Layout (5 componenten)
│   │   │   ├── Header.tsx             # Glassmorphism nav, mobile menu
│   │   │   ├── Footer.tsx             # Links, social, contact
│   │   │   ├── CartCounter.tsx        # Cart item counter
│   │   │   ├── Logo.tsx               # SVG logo
│   │   │   └── ScrollProgress.tsx     # Scroll progress bar
│   │   │
│   │   ├── shop/                      # Shop (12+ componenten)
│   │   │   ├── ProductCard.tsx        # Per-game thema, holographic hover
│   │   │   ├── ProductGrid.tsx        # Responsive grid
│   │   │   ├── SearchBar.tsx          # Zoekbalk
│   │   │   ├── Filters.tsx            # Filter dropdowns
│   │   │   ├── GameShowcase.tsx       # Scrollende game covers in shop hero
│   │   │   ├── QuickView.tsx          # Modal product preview
│   │   │   ├── PlatformShowcase.tsx   # 6 Nintendo platforms showcase (dynamic)
│   │   │   ├── EnhancedShopHeader.tsx # Animatie hero header
│   │   │   ├── PremiumProductCard.tsx # Premium product cards
│   │   │   ├── OptimizedProductGrid.tsx # Staggered grid animations
│   │   │   ├── PremiumFilters.tsx     # Collapsible filters
│   │   │   └── CollectionStats.tsx    # Stats showcase
│   │   │
│   │   ├── product/                   # Product (3 componenten)
│   │   │   ├── ProductDetail.tsx      # CIB toggle, lightbox
│   │   │   ├── RelatedProducts.tsx    # 4 gerelateerde producten
│   │   │   └── RecentlyViewed.tsx     # Recent bekeken
│   │   │
│   │   └── ui/                        # UI componenten (12+)
│   │       ├── Toast.tsx              # Toast notificatie systeem
│   │       ├── Accordion.tsx          # FAQ secties
│   │       ├── BackToTop.tsx          # Floating button
│   │       ├── Badge.tsx              # Premium, CIB badges
│   │       ├── Button.tsx / Input.tsx  # Form componenten
│   │       ├── BootSequence.tsx       # Startup animatie (1.8s)
│   │       ├── ChatBot.tsx            # Hulp-chatbot (floating)
│   │       ├── ConfettiBurst.tsx      # Confetti effect
│   │       ├── ErrorBoundary.tsx      # Error boundary
│   │       ├── MagneticButton.tsx     # Magnetisch hover effect
│   │       ├── MiniGames.tsx          # Blackjack, Darts, Bowling
│   │       └── TextReveal.tsx         # Tekst reveal animatie
│   │
│   ├── data/products.json             # 141 PRODUCTEN — bron van waarheid
│   │
│   └── lib/
│       ├── products.ts                # Product interface + helper functies
│       ├── cart.ts                     # CartItem interfaces
│       ├── gameStories.ts             # Game verhaal data
│       └── utils.ts                   # formatPrice, cn, getGameTheme, etc.
```

---

## Provider Hierarchy (layout.tsx)

```
<html lang="nl">
  <body>
    <BootSequence />                   ← Startup animatie (1.8s)
    <ScrollProgress />                 ← Scroll progress bar
    <CartProvider>                     ← Cart Context (localStorage)
      <WishlistProvider>               ← Wishlist Context (localStorage)
        <ToastProvider>                ← Toast notificatie Context
          <Header />                   ← Navigatie (glassmorphism, fixed)
          <main>{children}</main>
          <Footer />
          <BackToTop />
          <ChatBot />                  ← Floating chatbot
        </ToastProvider>
      </WishlistProvider>
    </CartProvider>
  </body>
</html>
```

### Homepage Sectie Volgorde
```
Hero → TrustStrip → FeaturedProducts → PlatformGrid → ReviewsStrip → ProcessTimeline → AboutPreview → FaqPreview → NewsletterCTA
```

---

## Product Interface

```typescript
// src/lib/products.ts
interface Product {
  sku: string;              // "DS-001", "3DS-042", "GBA-003"
  slug: string;             // "ds-001-pokemon-diamond"
  name: string;             // "Pokémon Diamond"
  platform: string;         // "Nintendo DS"
  category: string;         // "Games > DS"
  genre: string;            // "RPG", "Avontuur", "Platformer"
  price: number;            // EUR, bijv. 45.00
  condition: string;        // "Zo goed als nieuw", "Gebruikt"
  completeness: string;     // "Compleet in doos (CIB)", "Losse cartridge"
  type: string;             // "simple"
  description: string;      // Nederlandse beschrijving
  weight: number;           // In kg
  isConsole: boolean;       // true voor consoles
  isPremium: boolean;       // true als price >= 50
  image?: string | null;    // "/images/products/ds-001-pokemon-diamond.webp"
  backImage?: string | null;
  inkoopPrijs?: number | null;
  pcUsedPrice?: number | null;
  inkoopFeatured?: boolean;
  salePrice?: number | null;
  cibPrice?: number;
  cibImage?: string;
  cibBackImage?: string;
}
```

### Helper Functies (products.ts)
```typescript
getAllProducts()          // Alle 147 producten (141 games + 6 consoles)
getProductBySku(sku)     // Product op SKU (Map lookup, O(1))
getProductsByPlatform()  // Filter op platform
getFeaturedProducts()    // 8 uitgelichte (4 premium + 2 consoles + 2 populair)
getRelatedProducts()     // 4 gerelateerde (zelfde platform/genre)
searchProducts(q, limit) // Gewogen zoeken (naam > platform > genre > sku > beschrijving)
getAllPlatforms()         // Platforms met counts (gecached)
getAllGenres()            // Unieke genres (gecached)
getAllConditions()        // Unieke condities (gecached)
isOnSale() / getSalePercentage() / getEffectivePrice() // Sale logica
```

### Console Producten (6 totaal)
```typescript
// Nieuwe producten met isConsole: true
CON-DS-001    // Nintendo DS (2004) - 48 games
CON-3DS-001   // Nintendo 3DS (2011) - 46 games
CON-WIIU-001  // Wii U (2012) - 22 games
CON-WII-001   // Nintendo Wii (2006) - 11 games
CON-GBA-001   // Game Boy Advance (2001) - 8 games
CON-GBC-001   // Game Boy Color (1998) - 6 games
```

---

## Per-Game Kleur Thema Systeem

```typescript
// src/lib/utils.ts — getGameTheme(sku, genre?)
// 3-laags resolutie:
// 1. POKEMON_TYPE_MAP — 43 Pokémon games → 14 types (fire, water, grass, etc.)
// 2. FRANCHISE_THEME_MAP — 60+ games → 26 franchise thema's (mario, zelda, kirby)
// 3. GENRE_THEME_COLORS — 12 genre fallbacks (RPG, Avontuur, etc.)

interface PokemonTypeInfo {
  name: string;
  bg: [string, string];   // Gradient kleuren
  glow: string;            // RGB glow string
  particle: string;        // Particle kleur
  label: string;           // Nederlands label
}

// Gebruikt in: ProductCard, ProductDetail, GameShowcase, winkelwagen, afrekenen
```

---

## Verzending & Business Logica

```typescript
// src/lib/utils.ts
SHIPPING_SMALL = 4.95;           // 1-3 items
SHIPPING_MEDIUM = 6.95;          // 4-7 items
SHIPPING_LARGE = 7.95;           // 8+ items
FREE_SHIPPING_THRESHOLD = 100;   // Gratis boven €100
```

### Checkout (afrekenen/page.tsx)
- Formulier: voornaam, achternaam, email, straat, huisnummer, postcode, plaats
- Postcode: `[0-9]{4}\s?[a-zA-Z]{2}`
- Betaalmethoden: iDEAL, Creditcard, PayPal, Bancontact, Apple Pay
- **Simulatie** — geen echte Mollie API

### Shop Filtering (shop/page.tsx)
```
Filters: platform, genre, conditie, categorie, compleetheid
Zoeken: naam, platform, genre, beschrijving, SKU
Sorteren: naam A-Z/Z-A, prijs laag-hoog/hoog-laag
Paginatie: 24 items per pagina
```

---

## Design Systeem

### Kleuren
| Naam | Waarde | Gebruik |
|---|---|---|
| Brand gradient | emerald-500 → teal-500 | CTA knoppen |
| Navy 900 | `#050810` | Hero secties, donkere bg |
| Body bg | `#f8fafc` | Pagina achtergrond |
| Gold | `#d4a76a` | Premium accenten |

### Glassmorphism
```css
.glass        → backdrop-blur(20px) + rgba(5,8,16,0.7)
.glass-card   → backdrop-blur(16px) + rgba(255,255,255,0.03)
.glass-light  → backdrop-blur(20px) + rgba(255,255,255,0.8)
```

### Animaties (globals.css)
```
animate-marquee / reverse              → 40s horizontale scroll
animate-marquee-slow / reverse-slow    → 60s langzame scroll
animate-marquee-showcase / reverse     → Shop hero game covers
animate-aurora                         → 15s gradient shift
animate-shimmer                        → 2s shimmer sweep
animate-badge-in                       → 0.3s badge pop-in
animate-fade-in                        → 0.3s page transition
animate-spin-slow                      → 4s gradient border rotatie
holo-sweep                             → Holographic glans op ProductCards
```

---

## Navigatie Routes

| Route | Type | Beschrijving |
|---|---|---|
| `/` | Server | Homepage |
| `/shop` | Client | Shop met filters + PlatformShowcase |
| `/shop/[sku]` | Server (SSG) | Product detail (147 pagina's: 141 games + 6 consoles) |
| `/winkelwagen` | Client | Winkelwagen |
| `/verlanglijst` | Client | Wishlist |
| `/afrekenen` | Client | Checkout |
| `/inkoop` | Client | Trade-in prijslijst |
| `/game-finder` | Client | Interactieve game recommender |
| `/nintendo` | Server | Nintendo brand story |
| `/over-ons` | Server | Over Gameshop Enter |
| `/faq` | Server | Veelgestelde vragen |
| `/contact` | Server | Contactformulier |
| `/privacybeleid` | Server | Privacy policy |
| `/retourbeleid` | Server | Retourbeleid |
| `/algemene-voorwaarden` | Server | Terms |

---

## SEO

- `metadataBase`: `https://gameshopenter.nl`
- `lang`: `nl`, `locale`: `nl_NL`
- OpenGraph + Twitter Cards
- JSON-LD schemas: `Store` + `AggregateRating` (5.0, 1360 reviews) + `SearchAction`
- Product pagina: `Product` + `Offer` + `BreadcrumbList` schema
- `robots.ts` → robots.txt
- `sitemap.ts` → sitemap.xml

---

## Git Workflow

- **Branch:** direct op `main` pushen (Netlify auto-deploy)
- **Commit messages:** Nederlands, beschrijvend
- **Stage specifiek:** `git add <file1> <file2>`, nooit `git add -A`
- **Na ELKE taak:** committen en pushen

---

## Veelvoorkomende Taken

### Product toevoegen
1. Bewerk `src/data/products.json`
2. Volgende vrije SKU nummer (bijv. DS-059, GBA-009)
3. Slug: `{sku-lower}-{naam-slug}`
4. Cover art als WebP 500x500 in `public/images/products/`
5. `isPremium: true` als `price >= 50`

### Product prijs wijzigen
1. Zoek SKU in `src/data/products.json`
2. Wijzig `price`, update `isPremium` als nodig

---

## BELANGRIJK: Wat NIET Claimen

- **GEEN "eigen foto's" claims** — alle productfoto's zijn cover art / stock
- Wel claimen: "persoonlijk getest op werking", "eerlijke conditiebeschrijving"

---

## Agent Team Systeem

### 15 Agents (.claude/agents/)

| Agent | Rol | Type |
|-------|-----|------|
| `coordinator` | Team lead, delegeert | Orchestratie |
| `planner` | Taakverdeling, planning | Planning |
| `researcher` | Codebase analyse | Read-only |
| `architect` | Feature design | Read-only |
| `implementer` | Code schrijven | Schrijvend |
| `animator` | Animaties, Framer Motion | Schrijvend |
| `code-reviewer` | Bugs, security review | Read-only |
| `qa-tester` | Tests, edge cases | Read-only |
| `security-auditor` | XSS, OWASP audit | Read-only |
| `perf-profiler` | Bundle size, performance | Read-only |
| `seo-specialist` | SEO, structured data | Schrijvend |
| `copywriter` | Nederlandse teksten | Schrijvend |
| `image-editor` | Cover art, WebP | Schrijvend |
| `docs-writer` | Documentatie | Schrijvend |
| `innovator` | Feature ideeen | Read-only |

### Team Presets (.claude/teams/)
- **feature-team** — researcher + architect + implementer + code-reviewer
- **analyse-team** — 3x researcher + seo + security + perf
- **content-team** — copywriter + image-editor + seo + docs
- **visual-team** — researcher + architect + animator + implementer
- **quality-team** — qa + security + perf + reviewer + implementer

### Slash Commands (.claude/commands/)
`/plan`, `/team`, `/implement`, `/analyse`, `/optimize`, `/refactor`, `/debug`, `/review-all`, `/deploy-check`, `/seo-audit`, `/security-review`, `/design-review`, `/accessibility`, `/fix-issue`, `/pr`, `/sprint`, `/tdd`, `/product-add`, `/product-update`

---

## Quick Reference

```
BESTANDEN:
  Producten:     src/data/products.json (147: 141 games + 6 consoles)
  Types:         src/lib/products.ts
  Cart:          src/components/cart/CartProvider.tsx
  Wishlist:      src/components/wishlist/WishlistProvider.tsx
  Utils:         src/lib/utils.ts (getGameTheme, SHIPPING, PLATFORM_COLORS)
  Styles:        src/app/globals.css
  Layout:        src/app/layout.tsx
  Shop:          src/app/shop/page.tsx (+ PlatformShowcase)
  ProductCard:   src/components/shop/ProductCard.tsx
  ProductDetail: src/components/product/ProductDetail.tsx
  PlatformShowcase: src/components/shop/PlatformShowcase.tsx (dynamic consoles)
  Header:        src/components/layout/Header.tsx
  Footer:        src/components/layout/Footer.tsx

COMMANDS:
  npm run dev        → Dev server
  npm run build      → Productie build
  npm run lint       → Linter

VERZENDING:
  1-3 items: €4,95 | 4-7: €6,95 | 8+: €7,95 | >€100: gratis
```
