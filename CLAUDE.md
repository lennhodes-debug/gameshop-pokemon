# CLAUDE.md — Gameshop Enter

## Gedragsregels

- Geef ALLEEN code terug, geen uitleg of tekst tenzij expliciet gevraagd.
- Commit en push na elke voltooide taak.
- Werk altijd op een `claude/` feature branch, nooit direct op `main`.
- Antwoord in het Nederlands tenzij anders gevraagd.

---

## Project Overview

**Gameshop Enter** is een Nederlandse online webshop gespecialiseerd in Nintendo games, consoles en accessoires. De webshop draait op Next.js 14 en wordt gehost via Netlify. Alle productdata komt uit `src/data/products.json`.

- **Repository**: `lennhodes-debug/gameshop`
- **Live hosting**: Netlify (auto-deploy vanuit GitHub)
- **Taal**: Nederlands (NL) — alle UI-teksten, productnamen en beschrijvingen in het Nederlands
- **Doelgroep**: Nederlandse en Belgische retro + modern Nintendo gamers

---

## Tech Stack

| Component | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Taal | TypeScript |
| Styling | Tailwind CSS 3 |
| Animaties | Framer Motion |
| Smooth scroll | @studio-freight/lenis |
| Hosting | Netlify |
| Image format | WebP (500x500, quality 85) |
| Package manager | npm |

---

## Commands

```bash
npm install              # Installeer dependencies
npm run dev              # Start development server (localhost:3000)
npm run build            # Productie build
npm run lint             # Run ESLint
node scripts/convert-excel.js  # Excel → products.json conversie
```

---

## Bestandsstructuur

```
gameshop/
├── CLAUDE.md                          # Dit bestand — AI handleiding
├── package.json
├── netlify.toml                       # Netlify deploy config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
│
├── gameshop_enter_catalogus (2).xlsx   # Bronbestand: alle producten met beschrijvingen + Google Image URLs
├── gameshop_enter_compleet.xlsx        # Oud bronbestand (325 games + 21 consoles)
├── gameshop_enter_verbeterd.xlsx       # Samengevoegd bestand (846 producten)
│
├── public/
│   ├── favicon.svg
│   └── images/products/               # Alle product cover art (WebP, 500x500)
│       ├── sw-001-*.webp              # Switch games
│       ├── 3ds-001-*.webp             # 3DS games
│       ├── ds-001-*.webp              # DS games
│       ├── gba-001-*.webp             # GBA games
│       ├── gb-001-*.webp              # Game Boy / GBC games
│       ├── gc-001-*.webp              # GameCube games
│       ├── n64-001-*.webp             # N64 games
│       ├── snes-001-*.webp            # SNES games
│       ├── nes-001-*.webp             # NES games
│       ├── wii-001-*.webp             # Wii games
│       ├── wiiu-001-*.webp            # Wii U games
│       ├── con-001-*.webp             # Consoles
│       └── acc-001-*.webp             # Accessoires
│
├── scripts/
│   ├── convert-excel.js               # Excel → products.json converter
│   ├── download-covers-pricecharting.mjs  # Cover art downloader (PriceCharting)
│   └── download-images-v3.mjs         # Cover art downloader (Wikipedia)
│
├── src/
│   ├── app/                           # Next.js App Router pages
│   │   ├── layout.tsx                 # Root layout (Header + Footer)
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css                # Global CSS + Tailwind
│   │   ├── robots.ts                  # SEO robots.txt
│   │   ├── sitemap.ts                 # SEO sitemap
│   │   ├── not-found.tsx              # 404 pagina
│   │   ├── shop/
│   │   │   ├── page.tsx               # Shop overzicht (alle producten)
│   │   │   └── [sku]/page.tsx         # Product detail pagina
│   │   ├── winkelwagen/page.tsx       # Winkelwagen
│   │   ├── afrekenen/page.tsx         # Checkout
│   │   ├── inkoop/page.tsx            # Inkoop (trade-in) pagina
│   │   ├── contact/page.tsx           # Contact
│   │   ├── over-ons/page.tsx          # Over ons
│   │   ├── faq/page.tsx               # FAQ
│   │   ├── algemene-voorwaarden/      # Terms
│   │   ├── privacybeleid/             # Privacy
│   │   └── retourbeleid/              # Returns
│   │
│   ├── components/
│   │   ├── cart/
│   │   │   └── CartProvider.tsx        # Winkelwagen context + state
│   │   ├── home/
│   │   │   ├── Hero.tsx               # Hero banner
│   │   │   ├── FeaturedProducts.tsx    # Uitgelichte producten
│   │   │   ├── PlatformGrid.tsx       # Platform categorieën
│   │   │   ├── GameMarquee.tsx        # Scrollende game marquee
│   │   │   ├── TrustStrip.tsx         # Vertrouwensindicatoren
│   │   │   ├── ReviewsStrip.tsx       # Klantreviews
│   │   │   ├── AboutPreview.tsx       # Over ons preview
│   │   │   ├── FaqPreview.tsx         # FAQ preview
│   │   │   └── NewsletterCTA.tsx      # Nieuwsbrief CTA
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Navigatie header
│   │   │   ├── Footer.tsx             # Footer
│   │   │   ├── Logo.tsx               # Logo component
│   │   │   ├── ScrollProgress.tsx     # Scroll progress indicator
│   │   │   └── SmoothScroll.tsx       # Lenis smooth scrolling
│   │   ├── product/
│   │   │   ├── ProductDetail.tsx      # Product detail view
│   │   │   └── RelatedProducts.tsx    # Gerelateerde producten
│   │   ├── shop/
│   │   │   ├── ProductCard.tsx        # Product kaart in grid
│   │   │   ├── ProductGrid.tsx        # Product grid met filters
│   │   │   ├── Filters.tsx            # Platform/genre/prijs filters
│   │   │   └── SearchBar.tsx          # Zoekbalk
│   │   └── ui/
│   │       ├── Button.tsx             # Button component
│   │       ├── Badge.tsx              # Badge component
│   │       ├── Input.tsx              # Input component
│   │       ├── Accordion.tsx          # FAQ accordion
│   │       ├── Toast.tsx              # Toast notificaties
│   │       ├── BackToTop.tsx          # Terug naar boven
│   │       ├── ScrollReveal.tsx       # Scroll animatie wrapper
│   │       └── ...                    # Overige UI componenten
│   │
│   ├── data/
│   │   └── products.json              # ALLE productdata (846 producten)
│   │
│   └── lib/
│       ├── products.ts                # Product helper functies
│       ├── cart.ts                     # Winkelwagen logica
│       └── utils.ts                   # Utility functies
```

---

## Productdata (products.json)

Alle producten staan in `src/data/products.json`. Dit is de **enige bron van waarheid** voor de webshop.

### Product Interface

```typescript
interface Product {
  sku: string;           // "SW-001", "CON-001", "ACC-001"
  slug: string;          // URL-safe: "sw-001-zelda-breath-of-the-wild"
  name: string;          // "The Legend of Zelda: Breath of the Wild"
  platform: string;      // "Nintendo Switch", "Nintendo 3DS", etc.
  category: string;      // "Games > Switch", "Consoles", "Accessoires"
  genre: string;         // "RPG", "Avontuur", "Platformer", etc.
  price: number;         // 45.00 (in EUR)
  condition: string;     // "Zo goed als nieuw" of "Gebruikt"
  completeness: string;  // "Compleet in doos (CIB)" of "Losse cartridge"
  type: string;          // "simple"
  description: string;   // Nederlandse productbeschrijving
  weight: number;        // 0.1 (in kg)
  isConsole: boolean;    // true voor consoles
  isPremium: boolean;    // true als prijs >= €50
  image?: string;        // "/images/products/sw-001-zelda.webp"
  inkoopPrijs?: number;  // Inkoopprijs (trade-in)
  pcUsedPrice?: number;  // PriceCharting used price
}
```

### SKU Prefixes

| Prefix | Platform |
|---|---|
| `SW-` | Nintendo Switch |
| `3DS-` | Nintendo 3DS |
| `DS-` | Nintendo DS |
| `GBA-` | Game Boy Advance |
| `GB-` | Game Boy / Game Boy Color |
| `GC-` | GameCube |
| `N64-` | Nintendo 64 |
| `SNES-` | Super Nintendo |
| `NES-` | NES |
| `WII-` | Wii |
| `WIIU-` | Wii U |
| `CON-` | Consoles |
| `ACC-` | Accessoires |

### Huidige voorraad (846 producten)

| Categorie | Aantal |
|---|---|
| Nintendo Switch games | 128 |
| Nintendo 3DS games | 70 |
| Nintendo DS games | 70 |
| Game Boy Advance games | 69 |
| Game Boy / GBC games | 68 |
| GameCube games | 64 |
| Nintendo 64 games | 65 |
| Super Nintendo games | 63 |
| NES games | 62 |
| Wii games | 64 |
| Wii U games | 61 |
| Consoles | 45 |
| Accessoires | 40 |

---

## Bronbestanden (Excel)

### gameshop_enter_catalogus (2).xlsx
Het primaire bronbestand met alle producten. Bevat per platform een sheet met:
- Game Title
- Platform
- Productomschrijving (uitgebreide Nederlandse beschrijving)
- Cover Art URL (Google Image Search link)

Extra sheets: `Spelcomputers` (consoles) en `Accessoires & Opladers`.

### gameshop_enter_compleet.xlsx
Oorspronkelijk WooCommerce-formaat met 346 producten. Bevat prijzen, genres, condities.

---

## Cover Art / Afbeeldingen

- Formaat: **WebP**, 500x500 pixels, quality 85
- Locatie: `public/images/products/`
- Naamgeving: `{sku-lowercase}-{slug}.webp` (bijv. `sw-001-zelda-breath-of-the-wild.webp`)
- Bron: Google Image Search URLs uit het catalogusbestand → eerste geschikte afbeelding downloaden
- Bij voorkeur PAL/EUR box art covers

### Cover art downloaden

De Google Image Search URLs in het catalogusbestand (`gameshop_enter_catalogus (2).xlsx`) bevatten per game een zoeklink. Gebruik deze om covers te downloaden:

1. Fetch de Google Image Search pagina met curl
2. Extract image URLs uit de HTML (regex: `https://...\.jpg|png|webp`)
3. Filter Google/gstatic domein URLs weg
4. Prioriteer: Amazon > eBay > Nintendo > overige
5. Download de eerste geldige afbeelding (> 3KB)
6. Converteer naar WebP 500x500 met Pillow of Sharp

---

## Platforms

| Platform | Conditie | Compleetheid | Gewicht |
|---|---|---|---|
| Nintendo Switch | Zo goed als nieuw | Compleet in doos (CIB) | 0.1 kg |
| Nintendo 3DS | Gebruikt | Compleet in doos (CIB) | 0.08 kg |
| Nintendo DS | Gebruikt | Compleet in doos (CIB) | 0.08 kg |
| Game Boy Advance | Gebruikt | Losse cartridge | 0.05 kg |
| Game Boy / GBC | Gebruikt | Losse cartridge | 0.05 kg |
| GameCube | Gebruikt | Compleet in doos (CIB) | 0.1 kg |
| Nintendo 64 | Gebruikt | Losse cartridge | 0.08 kg |
| Super Nintendo | Gebruikt | Losse cartridge | 0.08 kg |
| NES | Gebruikt | Losse cartridge | 0.08 kg |
| Wii | Gebruikt | Compleet in doos (CIB) | 0.1 kg |
| Wii U | Gebruikt | Compleet in doos (CIB) | 0.1 kg |

---

## Genres

RPG, Avontuur, Platformer, Actie, Race, Vecht, Party, Shooter, Sport, Strategie, Simulatie, Puzzel, Muziek, Fitness

---

## Pagina's

| Route | Beschrijving |
|---|---|
| `/` | Homepage met hero, uitgelichte producten, platforms |
| `/shop` | Alle producten met filters (platform, genre, prijs) |
| `/shop/[sku]` | Product detail pagina |
| `/winkelwagen` | Winkelwagen |
| `/afrekenen` | Checkout |
| `/inkoop` | Trade-in / inkoop pagina |
| `/contact` | Contactformulier |
| `/over-ons` | Over Gameshop Enter |
| `/faq` | Veelgestelde vragen |
| `/algemene-voorwaarden` | Algemene voorwaarden |
| `/privacybeleid` | Privacybeleid |
| `/retourbeleid` | Retourbeleid |

---

## Netlify Configuratie

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Git Workflow

1. Werk altijd op een `claude/` branch
2. Commit met duidelijke Nederlandse of Engelse berichten
3. Stage specifieke bestanden (`git add <file>`) — nooit `git add -A`
4. Push met `git push -u origin claude/<branch-name>`
5. Nooit force-push naar `main`
6. Nooit secrets of .env committen

---

## Veelvoorkomende Taken

### Producten toevoegen
1. Voeg toe aan `src/data/products.json` met het juiste SKU-prefix
2. Download cover art naar `public/images/products/`
3. Stel `image` in op `/images/products/{filename}.webp`

### Prijzen aanpassen
1. Edit `src/data/products.json` — veld `price`
2. Zet `isPremium: true` als prijs >= €50

### Cover art vervangen
1. Verwijder oude webp uit `public/images/products/`
2. Download nieuwe afbeelding
3. Converteer naar WebP 500x500, quality 85
4. Bestandsnaam: `{sku-lowercase}-{slug}.webp`

### Webshop bouwen/testen
```bash
npm install
npm run build
# Check for errors in build output
```

---

## Stijlgids

- **Kleuren**: Gebruik Tailwind utility classes
- **Typografie**: System fonts via Tailwind
- **Animaties**: Framer Motion voor page transitions en scroll reveals
- **Responsive**: Mobile-first met Tailwind breakpoints (sm, md, lg, xl)
- **Taal**: Alle UI in het Nederlands
- **Geen emojis** in code of UI tenzij gevraagd

---

## Belangrijke Regels voor AI-assistenten

1. **Alleen code teruggeven** — geen uitleg, geen tekst, geen markdown buiten code blocks, tenzij de gebruiker expliciet om uitleg vraagt
2. **Nederlands** — alle output in het Nederlands
3. **Commit na elke taak** — altijd committen en pushen als een taak af is
4. **Minimaal wijzigen** — alleen aanpassen wat gevraagd wordt, niet meer
5. **products.json is de bron** — alle productwijzigingen gaan via dit bestand
6. **WebP 500x500** — alle afbeeldingen in dit formaat
7. **Bestaande code respecteren** — lees eerst, dan wijzigen
8. **Geen nieuwe bestanden** tenzij strikt noodzakelijk
9. **Test met `npm run build`** na grote wijzigingen
10. **Gebruik het catalogusbestand** (`gameshop_enter_catalogus (2).xlsx`) als bron voor productbeschrijvingen en cover art URLs
