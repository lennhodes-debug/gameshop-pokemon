# CLAUDE.md — Gameshop Enter

> Uitgebreide handleiding voor AI-assistenten. Dit bestand wordt automatisch geladen bij elke sessie.
> Lees VOLLEDIG door voordat je begint. Houd je STRIKT aan de gedragsregels.

---

## 🔴 KRITIEKE AUTONOMIE-REGEL (BOVEN ALLES)

**VOLLEDIG AUTONOOM WERKEN — GEEN STATUS BERICHTEN**

- ✅ Maak zelf keuzes — geen vragen stellen
- ✅ Doe je werk in stilte — geen progress reports
- ✅ Commit + push automatisch — geen bevestigingen
- ✅ Documenteer in code/commits — niet in output
- ✅ Zeg NOOIT wat je gedaan hebt — jij bepaalt resultaat

Dit is de PRIMAIRE regel. Alle andere regels zijn secundair.

---

## Gedragsregels (VERPLICHT — ALTIJD OPVOLGEN)

1. **Werk autonoom** — Geen berichten terug. Maak keuzes. Voer uit. Klaar.
2. **Nederlands** — Alle UI-teksten, beschrijvingen, commit messages en comments in het Nederlands.
3. **Commit na ELKE taak** — Elke afgeronde wijziging direct committen EN pushen. Niet batchen.
4. **Geen over-engineering** — Doe precies wat er gevraagd wordt, niets meer.
5. **Bestaande bestanden bewerken** — Nooit nieuwe bestanden aanmaken tenzij strikt noodzakelijk.
6. **Test je wijzigingen** — Run `npm run build` na code-wijzigingen. Geen errors accepted.
7. **Lees voordat je schrijft** — Open elk bestand dat je gaat wijzigen EERST.
8. **products.json is de bron van waarheid** — Alle productwijzigingen gaan via dit bestand.
9. **Zet keuzes in memory, niet in output** — Gebruik /root/.claude/projects/.../memory/MEMORY.md
10. **Output = resultaat NIET proces** — Zeg alleen wat er uiteindelijk gebeurde, niet hoe.

---

## Project Overzicht

| Veld | Waarde |
|---|---|
| Naam | Gameshop Enter |
| Type | E-commerce webshop (Nintendo retro games) |
| URL | https://gameshopenter.nl |
| Repository | `lennhodes-debug/gameshop` |
| Eigenaar | Lenn Hodes |
| Contact | gameshopenter@gmail.com |
| Hosting | Netlify (automatische deploys vanuit GitHub) |
| Status | Live productie — 118 Nintendo games (DS, 3DS, GBA, GB), eigen fotografie |

---

## Tech Stack

| Technologie | Versie | Doel | Docs |
|---|---|---|---|
| **Next.js** | 14.x | React framework, App Router, SSG | https://nextjs.org/docs |
| **React** | 18.x | UI library | https://react.dev |
| **TypeScript** | 5.x | Type safety | https://typescriptlang.org/docs |
| **Tailwind CSS** | 3.x | Utility-first styling | https://tailwindcss.com/docs |
| **Framer Motion** | 12.x | Animaties, transitions, gestures | https://motion.dev/docs |
| **Lenis** | 1.x | Smooth scrolling | https://github.com/studio-freight/lenis |
| **Sharp** | 0.34.x | Image optimization (devDep) | https://sharp.pixelplumbing.com |
| **xlsx** | 0.18.x | Excel parsing (prebuild) | https://docs.sheetjs.com |
| **Netlify** | - | Hosting, CDN, auto-deploy | https://docs.netlify.com |

### Architectuur Keuzes
- **Geen backend, geen database** — Alle data statisch in JSON
- **SSG (Static Site Generation)** — Alle productpagina's worden bij build gegenereerd
- **Client-side cart** — localStorage met React Context
- **Geen CMS** — Productdata wordt direct in `products.json` bewerkt
- **Checkout simulatie** — Frontend-only Mollie simulatie (geen echte betalingen)

---

## Commands

```bash
npm install                            # Installeer dependencies
npm run dev                            # Dev server op localhost:3000
npm run build                          # Productie build (draait eerst prebuild)
npm run start                          # Start productie server
npm run lint                           # Next.js ESLint
node scripts/convert-excel.js          # Excel → products.json (OVERSCHRIJFT!)
```

### Prebuild Waarschuwing
`npm run prebuild` (= `node scripts/convert-excel.js`) converteert `data/gameshop_enter_compleet.xlsx` naar `src/data/products.json`. Dit **overschrijft** de huidige 118-producten versie met een oudere 346-producten versie. **Verwijder de prebuild stap of pas het script aan als je de huidige data wilt behouden.**

---

## Bestandsstructuur (Compleet)

```
gameshop/
├── CLAUDE.md                          # DIT BESTAND — AI handleiding
├── package.json                       # Dependencies & scripts
├── package-lock.json                  # Lockfile
├── next.config.js                     # Next.js config (minimal)
├── tailwind.config.ts                 # Tailwind thema (brand colors, fonts, keyframes)
├── tsconfig.json                      # TypeScript config (strict)
├── postcss.config.js                  # PostCSS (Tailwind + autoprefixer)
├── netlify.toml                       # Netlify build config
├── .gitignore                         # Git ignore rules
├── price-data.json                    # PriceCharting marktprijzen (raw data)
│
├── data/
│   └── gameshop_enter_compleet.xlsx   # Excel bron (oud, 346 producten)
│
├── gameshop_enter_catalogus (2).xlsx  # Nieuwe catalogus (657 games, 45 consoles, 40 acc)
│
├── scripts/
│   ├── convert-excel.js               # Excel → products.json converter (prebuild)
│   └── generate-descriptions.js       # Beschrijvingen generator script
│
├── public/
│   ├── favicon.svg                    # Site favicon (SVG)
│   └── images/
│       └── products/                  # 973 WebP cover art (500x500, quality 85)
│           ├── sw-{NNN}-*.webp        # Switch games (163 stuks)
│           ├── 3ds-{NNN}-*.webp       # 3DS games (59 stuks)
│           ├── ds-{NNN}-*.webp        # DS games (59 stuks)
│           ├── gba-{NNN}-*.webp       # GBA games (57 stuks)
│           ├── gb-{NNN}-*.webp        # Game Boy/Color (63 stuks)
│           ├── gc-{NNN}-*.webp        # GameCube games (59 stuks)
│           ├── n64-{NNN}-*.webp       # N64 games (62 stuks)
│           ├── snes-{NNN}-*.webp      # SNES games (46 stuks)
│           ├── nes-{NNN}-*.webp       # NES games (60 stuks)
│           ├── wii-{NNN}-*.webp       # Wii games (69 stuks)
│           ├── wiiu-{NNN}-*.webp      # Wii U games (53 stuks)
│           ├── con-{NNN}-*.webp       # Consoles (45 stuks)
│           └── acc-{NNN}-*.webp       # Accessoires (40 stuks)
│
└── src/
    ├── app/                           # Next.js App Router (pagina's)
    │   ├── layout.tsx                 # ROOT LAYOUT — Header, Footer, Cart, SEO, Schema.org
    │   ├── page.tsx                   # Homepage — Hero → TrustStrip → Featured → Marquee → etc.
    │   ├── globals.css                # GLOBAL STYLES — Tailwind + animatie keyframes (opgeschoond)
    │   ├── template.tsx               # CSS-only fade-in page transition (geen Framer Motion)
    │   ├── robots.ts                  # robots.txt generator
    │   ├── sitemap.ts                 # sitemap.xml generator
    │   ├── not-found.tsx              # 404 pagina
    │   │
    │   ├── shop/
    │   │   ├── page.tsx               # SHOP — zoeken, filteren, sorteren, paginatie (24/pagina)
    │   │   ├── layout.tsx             # Shop SEO metadata
    │   │   └── [sku]/
    │   │       └── page.tsx           # PRODUCT DETAIL — SSG, Schema.org, breadcrumbs
    │   │
    │   ├── winkelwagen/
    │   │   ├── page.tsx               # Winkelwagen overzicht
    │   │   └── layout.tsx             # Winkelwagen metadata
    │   │
    │   ├── afrekenen/
    │   │   └── page.tsx               # CHECKOUT — formulier + Mollie simulatie
    │   │
    │   ├── inkoop/
    │   │   ├── page.tsx               # INKOOP — trade-in prijslijst + zoeken
    │   │   └── layout.tsx             # Inkoop metadata
    │   │
    │   ├── over-ons/                  # Over ons pagina + layout
    │   ├── faq/                       # Veelgestelde vragen + layout
    │   ├── contact/                   # Contact pagina + layout
    │   ├── privacybeleid/             # Privacy policy + layout
    │   ├── retourbeleid/              # Retourbeleid + layout
    │   └── algemene-voorwaarden/      # Algemene voorwaarden + layout
    │
    ├── components/
    │   ├── cart/
    │   │   └── CartProvider.tsx        # CART CONTEXT — localStorage, addItem, removeItem, etc.
    │   │
    │   ├── home/                      # Homepage secties
    │   │   ├── Hero.tsx               # Hero: spotlight, typewriter, magnetic CTAs, pokeball bg
    │   │   ├── TrustStrip.tsx         # Trust: count-up, 3D tilt, spring entrance
    │   │   ├── FeaturedProducts.tsx    # Featured: wave cascade, 3D rotateX entrance
    │   │   ├── GameCarousel3D.tsx     # 3D carousel: auto-rotatie, drag, navigatie, per-game glow
    │   │   ├── GameMarquee.tsx        # Velocity marquee: 3 lagen met depth blur
    │   │   ├── PlatformGrid.tsx       # Platform grid: 3D tilt, spotlight, bounce badges
    │   │   ├── AboutPreview.tsx       # Over ons preview sectie
    │   │   ├── ReviewsStrip.tsx       # Reviews: draggable, spotlight, gradient avatar ring
    │   │   ├── FaqPreview.tsx         # FAQ preview met glow effect
    │   │   └── NewsletterCTA.tsx      # Newsletter: sparkle particles, animated placeholder
    │   │
    │   ├── layout/                    # Layout componenten
    │   │   ├── Header.tsx             # NAVIGATIE — glassmorphism, mobile menu, cart badge
    │   │   ├── Footer.tsx             # Footer met links en contactinfo
    │   │   ├── Logo.tsx               # SVG logo component
    │   │   ├── ScrollProgress.tsx     # Scroll progress bar bovenaan
    │   │   └── SmoothScroll.tsx       # Lenis smooth scroll wrapper
    │   │
    │   ├── product/                   # Product componenten
    │   │   ├── ProductDetail.tsx      # Product detail — per-game kleur, CIB toggle, lightbox
    │   │   └── RelatedProducts.tsx    # 4 gerelateerde producten (zelfde platform)
    │   │
    │   ├── shop/                      # Shop componenten
    │   │   ├── SearchBar.tsx          # Zoekbalk met resultaat counter
    │   │   ├── Filters.tsx            # Filter dropdowns (platform, genre, conditie, etc.)
    │   │   ├── ProductCard.tsx        # PRODUCT KAART — per-game thema, holographic hover, wishlist
    │   │   └── ProductGrid.tsx        # Responsive grid (1-4 kolommen)
    │   │
    │   └── ui/                        # Herbruikbare UI componenten
    │       ├── Accordion.tsx          # Uitklapbare secties (FAQ)
    │       ├── BackToTop.tsx          # Terug naar boven floating button
    │       ├── Badge.tsx              # Badges: premium, console, CIB, conditie
    │       ├── Button.tsx             # Herbruikbare button component
    │       ├── CustomCursor.tsx       # Custom cursor effect
    │       ├── FloatingParticles.tsx  # Achtergrond particles animatie
    │       ├── GradientMesh.tsx       # Gradient mesh achtergrond
    │       ├── Input.tsx              # Form input component
    │       ├── MagneticButton.tsx     # Magnetisch button hover effect
    │       ├── PageTransition.tsx     # Pagina transitie (Framer Motion)
    │       ├── ScrollReveal.tsx       # Element reveal bij scroll
    │       ├── SectionDivider.tsx     # Sectie scheider lijn
    │       ├── TextReveal.tsx         # Tekst reveal animatie
    │       └── Toast.tsx              # Toast notificatie systeem (Context + Provider)
    │
    ├── data/
    │   └── products.json              # ALLE 118 PRODUCTEN — de enige bron van waarheid
    │
    ├── fonts/
    │   └── plus-jakarta-sans-latin-wght-normal.woff2  # Zelf-gehost font (next/font/local)
    │
    └── lib/
        ├── products.ts                # Product interface + getAllProducts, getProductBySku, etc.
        ├── cart.ts                    # CartItem + CartState interfaces
        └── utils.ts                   # formatPrice, cn, PLATFORM_COLORS, getGameTheme, etc.
```

---

## Product Interface (EXACT)

```typescript
// src/lib/products.ts — DIT IS HET DEFINITIEVE TYPE
interface Product {
  sku: string;              // "DS-001", "3DS-042", "GBA-003", "GB-001"
  slug: string;             // URL-safe: "ds-001-pokemon-diamond"
  name: string;             // "Pokémon Diamond"
  platform: string;         // "Nintendo DS" (altijd volledige naam)
  category: string;         // "Games > DS", "Games > 3DS", etc.
  genre: string;            // "Avontuur", "RPG", "Platformer", "Actie", etc.
  price: number;            // In EUR, bijv. 45.00 (NOOIT string)
  condition: string;        // "Zo goed als nieuw", "Gebruikt", "Nieuw"
  completeness: string;     // "Compleet in doos (CIB)", "Losse cartridge", "Los"
  type: string;             // Altijd "simple"
  description: string;      // Nederlandse productbeschrijving
  weight: number;           // In kg, bijv. 0.1
  isConsole: boolean;       // true ALLEEN voor consoles
  isPremium: boolean;       // true als price >= 50
  image?: string | null;    // "/images/products/ds-001-pokemon-diamond.webp" of null
  backImage?: string | null;// Achterkant afbeelding, optioneel
  inkoopPrijs?: number | null; // Inkoopprijs (~40% van marktwaarde), optioneel
  pcUsedPrice?: number | null; // PriceCharting used price, optioneel
  inkoopFeatured?: boolean; // true = tonen op inkoop pagina standaard
  salePrice?: number | null;// Actieprijs, optioneel
  cibPrice?: number;        // CIB variant prijs (hoger dan los)
  cibImage?: string;        // CIB variant afbeelding
  cibBackImage?: string;    // CIB variant achterkant
}
```

---

## SKU Schema (Actieve Prefixen)

| Prefix | Platform | Bereik | Aantal | Voorbeeld |
|---|---|---|---|---|
| `DS-` | Nintendo DS | DS-001 t/m DS-058 | 54 | `DS-001` |
| `3DS-` | Nintendo 3DS | 3DS-001 t/m 3DS-050 | 50 | `3DS-002` |
| `GBA-` | Game Boy Advance | GBA-001 t/m GBA-008 | 8 | `GBA-003` |
| `GB-` | Game Boy / Color | GB-001 t/m GB-006 | 6 | `GB-001` |

**Nieuw product toevoegen:** gebruik het volgende vrije nummer in de reeks.

---

## Platform Specificaties (Actief)

| Platform | Afk. | Games | Standaard conditie | Standaard compleetheid | Gewicht | Kleuren (Tailwind) |
|---|---|---|---|---|---|---|
| Nintendo DS | DS | 54 | Gebruikt | Mix CIB/Los | 0.08 kg | from-slate-500 to-slate-700 |
| Nintendo 3DS | 3DS | 50 | Gebruikt | Mix CIB/Los | 0.08 kg | from-sky-500 to-blue-700 |
| Game Boy Advance | GBA | 8 | Gebruikt | Losse cartridge | 0.05 kg | from-blue-500 to-indigo-700 |
| Game Boy / Color | GB/GBC | 6 | Gebruikt | Losse cartridge | 0.05 kg | from-lime-500 to-green-700 |

---

## Design Systeem

### Kleuren

| Naam | Waarde | Gebruik |
|---|---|---|
| Brand gradient | emerald-500 → teal-500 | CTA knoppen, primaire acties |
| Navy 900 | `#050810` | Hero secties, donkere achtergronden |
| Navy 800 | `#0a0e1a` | Scrollbar track, header glass |
| Body bg | `#f8fafc` (slate-50) | Pagina achtergrond |
| Text | slate-900 | Body tekst |
| Gold | `#d4a76a` | Premium accenten |
| Success | emerald-500/600 | Succesberichten, badges |
| Error | red-500 | Foutenmelding, filter wissen |

### Typografie
- **Font:** Plus Jakarta Sans — gewichten 300-800
- **Import:** `next/font/local` met zelf-gehoste WOFF2 (`src/fonts/plus-jakarta-sans-latin-wght-normal.woff2`)
- **Fallback:** system-ui, sans-serif

### Glassmorphism (globals.css)
```css
.glass        → backdrop-blur(20px) + rgba(5,8,16,0.7)    /* Header */
.glass-card   → backdrop-blur(16px) + rgba(255,255,255,0.03) /* Cards op dark bg */
.glass-light  → backdrop-blur(20px) + rgba(255,255,255,0.8)  /* Cards op light bg */
```

### Gradient Utilities (globals.css)
```css
.gradient-text      → emerald-400 via teal-400 to cyan-400
.gradient-text-gold → amber-300 via yellow-400 to amber-500
```

### Animatie Klassen (globals.css)
```
animate-marquee / reverse     → 40s horizontale scroll
animate-marquee-slow / reverse-slow → 60s langzame scroll
animate-aurora                → 15s gradient shift
animate-shimmer               → 2s shimmer sweep
animate-badge-in              → 0.3s badge pop-in
animate-fade-in               → 0.3s page transition
animate-spin-slow             → 4s gradient border rotatie
perspective-1000              → 3D card perspective container
holo-sweep (keyframe)         → Holographic glans op ProductCards
```

### Responsive Breakpoints (Tailwind defaults)
- Mobile first
- `sm:` ≥ 640px
- `md:` ≥ 768px
- `lg:` ≥ 1024px
- `xl:` ≥ 1280px
- Max content width: `max-w-7xl` (1280px)

---

## Per-Game Kleur Thema Systeem

Elke game heeft een uniek kleurthema via `getGameTheme(sku, genre?)` in `utils.ts`:

```typescript
// 3-laags thema resolutie:
// 1. POKEMON_TYPE_MAP (43 Pokémon games → 14 types: fire, water, grass, etc.)
// 2. FRANCHISE_THEME_MAP (60+ niet-Pokémon games → 26 franchise thema's: mario, zelda, kirby, etc.)
// 3. GENRE_THEME_COLORS (12 genre fallbacks: RPG, Avontuur, Platformer, etc.)

interface PokemonTypeInfo {
  name: string;
  bg: [string, string];  // Gradient kleuren [primary, secondary]
  glow: string;           // RGB string voor box-shadow glow
  particle: string;       // Particle kleur
  label: string;          // Nederlands label
}

getGameTheme('DS-001')           // → fire (Pokémon Diamond)
getGameTheme('DS-035')           // → racing (Mario Kart DS)
getGameTheme('3DS-014')          // → animalcrossing
getGameTheme('DS-999', 'RPG')    // → genre fallback RPG
```

Wordt gebruikt in: ProductCard, ProductDetail, winkelwagen, afrekenen, GameCarousel3D.

---

## Component Architectuur

### Provider Hierarchy (layout.tsx)
```
<html lang="nl">
  <body>
    <ScrollProgress />         ← Scroll progress bar
    <SmoothScroll>             ← Lenis smooth scrolling
      <CartProvider>           ← Cart Context (localStorage)
        <ToastProvider>        ← Toast notificatie Context
          <Header />           ← Navigatie (fixed top, glassmorphism)
          <main>
            <PageTransition>   ← Framer Motion page transitions
              {children}       ← Pagina content
            </PageTransition>
          </main>
          <Footer />           ← Footer
          <BackToTop />        ← Floating back-to-top button
        </ToastProvider>
      </CartProvider>
    </SmoothScroll>
  </body>
</html>
```

### State Management
- **Cart:** React Context (`CartProvider`) + `localStorage` key `gameshop-cart`
- **Toast:** React Context (`ToastProvider`)
- **Filters:** Component-level `useState` in `shop/page.tsx`
- **Geen global state library** — geen Redux, Zustand, etc.

### Data Flow
```
products.json → getAllProducts() → Component props / useMemo filtering
                getProductBySku() → Product detail page
                getFeaturedProducts() → Homepage
                searchProducts() → SearchBar autocomplete

utils.ts      → getGameTheme(sku, genre?) → Per-game kleur in ProductCard/Detail/Cart
                POKEMON_TYPE_MAP → Pokémon game kleuren
                FRANCHISE_THEME_MAP → Nintendo franchise kleuren
                GENRE_THEME_COLORS → Genre-gebaseerde fallback kleuren
```

### Homepage Sectie Volgorde (page.tsx)
```
Hero → TrustStrip → FeaturedProducts → GameCarousel3D → PlatformGrid → GameMarquee → AboutPreview → ReviewsStrip → FaqPreview → NewsletterCTA
```

---

## Business Logica

### Prijzen & Verzending
```typescript
// src/lib/utils.ts
const SHIPPING_SMALL = 4.95;             // 1-3 items (brievenbuspakket)
const SHIPPING_MEDIUM = 6.95;            // 4-7 items (pakket)
const SHIPPING_LARGE = 7.95;             // 8+ items (groot pakket)
const FREE_SHIPPING_THRESHOLD = 100;     // Gratis verzending boven €100
const SHIPPING_COST = SHIPPING_SMALL;    // Legacy alias
```

### Cart
```typescript
// Hook: useCart()
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;      // Subtotaal excl. verzending
  getItemCount: () => number;  // Totaal aantal items
}
```

### Checkout (src/app/afrekenen/page.tsx)
- Formuliervelden: voornaam, achternaam, email, straat, huisnummer, postcode, plaats, opmerkingen
- Postcode validatie: `[0-9]{4}\s?[a-zA-Z]{2}`
- Betaalmethoden: iDEAL, Creditcard, PayPal, Bancontact, Apple Pay
- **Simuleert** Mollie-betaling (setTimeout 1500ms) — geen echte API

### Inkoop / Trade-in (src/app/inkoop/page.tsx)
- Toont producten waar `inkoopPrijs > 0`
- Default view: alleen producten met `inkoopFeatured === true`
- Zoekfunctie doorzoekt ALLE producten met inkoopprijs
- Formule: `inkoopPrijs ≈ pcUsedPrice * 0.4` (afgerond)
- Sorteerbaar op naam of prijs
- Filterbaar op platform en categorie (games/consoles)

### Featured Products (homepage)
```typescript
// src/lib/products.ts — getFeaturedProducts()
// Selecteert 4 premium (isPremium) + 2 consoles + 2 populaire (price > 30) = max 8
```

### Shop Filtering (src/app/shop/page.tsx)
```
Filters: platform, genre, conditie, categorie (games/consoles), compleetheid (CIB/los)
Zoeken: naam, platform, genre, beschrijving, SKU
Sorteren: naam A-Z, naam Z-A, prijs laag-hoog, prijs hoog-laag
Paginatie: 24 items per pagina
```

---

## SEO

### Root Metadata (layout.tsx)
- `metadataBase`: `https://gameshopenter.nl`
- `lang`: `nl`, `locale`: `nl_NL`
- OpenGraph + Twitter Cards
- JSON-LD `Store` schema met `AggregateRating` (5.0 score, 1360 reviews)
- `SearchAction` schema voor Google

### Product Pagina SEO (shop/[sku]/page.tsx)
- `generateStaticParams()` → alle 118 SKU's worden bij build gegenereerd
- Dynamische `<title>`: `{name} - {platform} | Gameshop Enter`
- JSON-LD `Product` schema: prijs, conditie, beschikbaarheid, verzendkosten
- JSON-LD `BreadcrumbList`: Home → Shop → Platform → Product

### Automatische Bestanden
- `robots.ts` → `robots.txt`
- `sitemap.ts` → `sitemap.xml` met alle routes

---

## Navigatie Routes

| Route | Component | Type | Beschrijving |
|---|---|---|---|
| `/` | `page.tsx` | Server | Homepage |
| `/shop` | `shop/page.tsx` | Client (`'use client'`) | Shop met filters |
| `/shop/[sku]` | `shop/[sku]/page.tsx` | Server (SSG) | Product detail |
| `/winkelwagen` | `winkelwagen/page.tsx` | Client | Winkelwagen |
| `/afrekenen` | `afrekenen/page.tsx` | Client | Checkout |
| `/inkoop` | `inkoop/page.tsx` | Client | Trade-in prijslijst |
| `/over-ons` | `over-ons/page.tsx` | Server | Over Gameshop Enter |
| `/faq` | `faq/page.tsx` | Server | Veelgestelde vragen |
| `/contact` | `contact/page.tsx` | Server | Contactformulier |
| `/privacybeleid` | `privacybeleid/page.tsx` | Server | Privacy policy |
| `/retourbeleid` | `retourbeleid/page.tsx` | Server | Retourbeleid |
| `/algemene-voorwaarden` | `algemene-voorwaarden/page.tsx` | Server | Terms |

### Header Navigatie (src/components/layout/Header.tsx)
```typescript
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/inkoop', label: 'Inkoop' },
  { href: '/over-ons', label: 'Over ons' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];
```

---

## Veelvoorkomende Taken

### Product toevoegen
1. Bewerk `src/data/products.json`
2. Voeg nieuw object toe met ALLE velden uit Product interface
3. SKU: volgende nummer in de reeks (`SW-164`, `CON-046`, etc.)
4. Slug: `{sku-lower}-{naam-slug}` (geen speciale tekens)
5. Cover art downloaden als WebP 500x500 naar `public/images/products/`
6. `image`: `/images/products/{sku-lower}-{naam-slug}.webp`
7. `isPremium`: `true` als `price >= 50`
8. Commit en push

### Product prijs wijzigen
1. Bewerk `src/data/products.json`
2. Zoek op SKU, wijzig `price` veld
3. Update `isPremium` als nodig (`true` bij >= 50, `false` bij < 50)
4. Commit en push

### Cover art downloaden (bewezen methode voor 118/118 producten)
```python
# 1. Google Image Search pagina ophalen
url = "https://www.google.com/search?q={game}+{platform}+EUR+PAL+box+art+cover&tbm=isch"
# 2. Image URLs extraheren met regex
img_urls = re.findall(r'(https://[^"\'\\&\s]+\.(?:jpg|jpeg|png|webp))', html)
# 3. Filteren: skip google.com, gstatic.com, googleapis.com
# 4. Prioriteren: amazon > ebayimg > nintendo > overige
# 5. Downloaden: eerste die > 3KB is
# 6. Converteren naar WebP 500x500:
from PIL import Image
img = Image.open(path).convert('RGB')
img.thumbnail((500, 500), Image.LANCZOS)
img.save(output, 'WEBP', quality=85)
```

### Nieuwe pagina toevoegen
1. Maak `src/app/{route}/page.tsx`
2. Optioneel: `layout.tsx` voor metadata
3. Voeg link toe in `Header.tsx` → `navLinks` array
4. Voeg link toe in `Footer.tsx`
5. Commit en push

### Inkoopprijs instellen
```
inkoopPrijs = Math.round(pcUsedPrice * 0.4)
inkoopFeatured = true  // als je het op de inkoop pagina wilt tonen
```

---

## Git Workflow

### Branches
- **Altijd** werken op branches met prefix `claude/`
- Nooit direct op `main` of `master` pushen
- Branch naamgeving: `claude/{feature}-{session-id}`

### Commit Regels
- **Nederlands** commit messages
- **Beschrijvend** — waarom, niet wat
- **Na ELKE taak** — niet batchen
- **Stage specifiek** — `git add <file1> <file2>`, nooit `git add -A`
- **Nooit** secrets, credentials, `.env` committen

### Push Protocol
```bash
git push -u origin claude/{branch-naam}
# Bij network error: retry 4x met exponential backoff (2s, 4s, 8s, 16s)
```

---

## Deployment (Netlify)

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Automatische deploy bij push naar GitHub. Build process:
1. `npm run prebuild` → `scripts/convert-excel.js` (Excel → JSON)
2. `next build` → SSG van alle pagina's + statische assets
3. Output naar `.next` → gehost door Netlify CDN

---

## Codestijl

### TypeScript
- Strict mode
- `interface` boven `type` (tenzij union/intersection nodig)
- Expliciete return types bij exports
- Geen `any` — gebruik `unknown` of specifiek type

### React
- `'use client'` directive voor client components (state, effects, event handlers)
- Server Components voor statische pagina's
- Hooks bovenaan de component
- Event handlers: `handle` prefix (`handleAdd`, `handleMouseMove`)
- `useCallback` voor functies die als prop worden doorgegeven

### Tailwind
- Utility-first, geen custom CSS tenzij voor animaties
- `cn()` helper voor conditionele classes: `cn('base', condition && 'active')`
- Mobile-first responsive: `sm:`, `md:`, `lg:`
- Dark navy hero secties: `bg-[#050810]`
- Emerald/teal gradient CTAs: `bg-gradient-to-r from-emerald-500 to-teal-500`

### Naamgeving
```
Componenten:  PascalCase      → ProductCard.tsx, CartProvider.tsx
Utilities:    camelCase        → products.ts, utils.ts
Constanten:   SCREAMING_SNAKE  → SHIPPING_COST, PLATFORM_COLORS
CSS klassen:  kebab-case       → animate-fade-up, glass-card
Routes:       kebab-case       → /over-ons, /winkelwagen
SKU's:        PREFIX-NNN       → SW-001, CON-045
```

---

## Catalogus Bronbestanden

| Bestand | Inhoud | Producten | Status |
|---|---|---|---|
| `gameshop_enter_catalogus (2).xlsx` | Nieuw: 12 sheets met beschrijvingen + Google Image URLs | 657 games + 45 consoles + 40 acc | Primaire bron |
| `data/gameshop_enter_compleet.xlsx` | Oud: WooCommerce formaat met prijzen, genres, condities | 325 games + 21 consoles | Wordt gebruikt door prebuild |
| `price-data.json` | PriceCharting marktprijzen (PAL) | ~300 producten | Gebruikt voor inkoop berekening |
| `src/data/products.json` | 118 Nintendo games (DS/3DS/GBA/GB) met eigen fotografie | 118 producten | **BRON VAN WAARHEID** |

---

## Bekende Beperkingen

| Beperking | Impact | Mogelijke Oplossing |
|---|---|---|
| Prebuild overschrijft products.json | Verliest 34→346 producten | Prebuild nu veilig (validate-images.mjs) |
| Checkout is simulatie | Geen echte betalingen | Backend + Mollie API integratie |
| Client-side zoeken | Trager bij veel producten | Algolia of server-side search |
| Geen voorraad tracking | Alles "op voorraad" | Database + admin panel |
| Geen gebruikersaccounts | Geen orderhistorie | Auth + database |
| Geen admin panel | Productbeheer via JSON | Headless CMS (Sanity, Strapi) |

---

## Quick Reference (Kopieer & Plak)

```
BESTANDEN:
  Producten:     src/data/products.json (118 producten)
  Types:         src/lib/products.ts
  Cart:          src/components/cart/CartProvider.tsx
  Utils:         src/lib/utils.ts (getGameTheme, SHIPPING, PLATFORM_COLORS)
  Afbeeldingen:  public/images/products/
  Font:          src/fonts/plus-jakarta-sans-latin-wght-normal.woff2
  Styles:        src/app/globals.css
  Tailwind:      tailwind.config.ts
  Layout:        src/app/layout.tsx
  Template:      src/app/template.tsx (CSS-only fade-in)
  Shop:          src/app/shop/page.tsx
  Product:       src/app/shop/[sku]/page.tsx
  ProductCard:   src/components/shop/ProductCard.tsx
  ProductDetail: src/components/product/ProductDetail.tsx
  Carousel:      src/components/home/GameCarousel3D.tsx
  Checkout:      src/app/afrekenen/page.tsx
  Inkoop:        src/app/inkoop/page.tsx
  Header:        src/components/layout/Header.tsx
  Footer:        src/components/layout/Footer.tsx

COMMANDS:
  npm run dev        → Dev server
  npm run build      → Productie build (136 pagina's)
  npm run lint       → Linter

GENRES:
  RPG, Avontuur, Platformer, Actie, Race, Vecht, Party,
  Shooter, Sport, Strategie, Simulatie, Puzzel, Muziek, Fitness

VERZENDING:
  1-3 items: €4,95 | 4-7 items: €6,95 | 8+ items: €7,95 | >€100: gratis
```

---

## Agent Team Conventies

- **Default team size:** 3 teammates
- **File locking:** Teammates bewerken NOOIT dezelfde bestanden tegelijk
- **Documentatie:** Elke teammate documenteert welke bestanden ze bewerken
- **Task scope:** Taken worden beperkt tot ~30 minuten werk per stuk
- **Communicatie:** Gebruik SendMessage voor overleg, niet broadcasts tenzij kritiek
- **Task tracking:** Gebruik het gedeelde TaskList systeem voor coördinatie

---

## Checklist Nieuwe Sessie

Voer deze stappen uit bij het starten van een nieuwe chat-sessie:

1. Dit bestand (CLAUDE.md) is automatisch geladen — lees de gedragsregels
2. `git status` + `git log --oneline -5` — check huidige staat
3. Check welke branch je moet gebruiken (staat in de task description)
4. `npm run build` — verifieer dat alles werkt (optioneel)
5. Begin met de gevraagde taak
6. Commit en push na elke afgeronde wijziging
