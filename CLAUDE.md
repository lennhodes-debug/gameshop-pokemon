# CLAUDE.md — Gameshop Enter

> Uitgebreide handleiding voor AI-assistenten. Dit bestand wordt automatisch geladen bij elke sessie.
> Lees VOLLEDIG door voordat je begint. Houd je STRIKT aan de gedragsregels.

---

## KRITIEKE AUTONOMIE-REGEL (BOVEN ALLES)

**VOLLEDIG AUTONOOM WERKEN — GEEN STATUS BERICHTEN**

- Maak zelf keuzes — geen vragen stellen
- Doe je werk in stilte — geen progress reports
- Commit + push automatisch — geen bevestigingen
- Documenteer in code/commits — niet in output
- Zeg NOOIT wat je gedaan hebt — jij bepaalt resultaat

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

---

## Project Overzicht

| Veld | Waarde |
|---|---|
| Naam | Gameshop Enter |
| Type | E-commerce webshop (Nintendo games & consoles) |
| URL | https://gameshopenter.nl |
| Repository | `lennhodes-debug/gameshop-pokemon` |
| Eigenaar | Lenn Hodes |
| Contact | gameshopenter@gmail.com |
| Hosting | Netlify (automatische deploys vanuit GitHub) |
| Status | Live productie — 846 producten, 100% cover art |

---

## Tech Stack

| Technologie | Versie | Doel |
|---|---|---|
| **Next.js** | 15.5.x | React framework, App Router, SSG |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type safety (strict mode) |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Framer Motion** | 12.x | Animaties, transitions, gestures |
| **Lenis** | 1.x | Smooth scrolling |
| **Mollie API** | 4.x | Betalingen (iDEAL, creditcard, PayPal, etc.) |
| **Nodemailer** | 8.x | E-mails (Gmail SMTP) |
| **Netlify Blobs** | 10.x | Server-side opslag (orders, voorraad, kortingscodes) |
| **PostNL API** | - | Verzendlabels & track and trace |
| **Sharp** | 0.34.x | Image optimization (devDep) |

### Architectuur

**Frontend (SSG)**
- Alle 846 productpagina's worden bij build gegenereerd (Static Site Generation)
- Client-side cart via React Context + localStorage
- Wishlist via React Context + localStorage

**Backend (API Routes)**
- Mollie Payments API voor echte betalingen
- Netlify Blobs voor persistente opslag (orders, voorraad, nieuwsbrief, kortingscodes)
- Gmail SMTP voor transactionele e-mails (orderbevestiging, track & trace, nieuwsbrief welkom)
- PostNL API voor verzendlabels en tracking
- Admin dashboard met wachtwoord-authenticatie

---

## Commands

```bash
npm install                            # Installeer dependencies
npm run dev                            # Dev server op localhost:3000
npm run build                          # Productie build (draait eerst prebuild)
npm run start                          # Start productie server
npm run lint                           # Next.js ESLint
```

---

## Bestandsstructuur

```
gameshop/
├── CLAUDE.md                          # DIT BESTAND — AI handleiding
├── package.json                       # Dependencies & scripts
├── next.config.js                     # Next.js config
├── tailwind.config.ts                 # Tailwind thema (brand colors, fonts)
├── tsconfig.json                      # TypeScript config (strict)
├── netlify.toml                       # Netlify build + headers + caching
│
├── public/
│   ├── favicon.svg
│   └── images/products/               # 973 WebP cover art (500x500, quality 85)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # ROOT LAYOUT — Header, Footer, Cart, Wishlist, SEO
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css                # Tailwind + 30+ animatie keyframes
│   │   ├── robots.ts                  # robots.txt generator
│   │   ├── sitemap.ts                 # sitemap.xml generator
│   │   ├── not-found.tsx              # 404 pagina
│   │   │
│   │   ├── shop/
│   │   │   ├── page.tsx               # Shop — filters, zoeken, sorteren, paginatie
│   │   │   └── [sku]/page.tsx         # Product detail (SSG, 846 pagina's)
│   │   │
│   │   ├── winkelwagen/page.tsx       # Winkelwagen
│   │   ├── afrekenen/page.tsx         # Checkout (Mollie integratie)
│   │   ├── afrekenen/status/page.tsx  # Betaalstatus pagina
│   │   ├── verlanglijst/page.tsx      # Verlanglijst
│   │   ├── inkoop/page.tsx            # Trade-in prijslijst
│   │   ├── admin/page.tsx             # Admin panel (dashboard, voorraad, verzending)
│   │   │
│   │   ├── over-ons/                  # Over ons
│   │   ├── nintendo/                  # Nintendo info pagina
│   │   ├── faq/                       # Veelgestelde vragen
│   │   ├── contact/                   # Contact
│   │   ├── privacybeleid/             # Privacy policy
│   │   ├── retourbeleid/              # Retourbeleid
│   │   ├── algemene-voorwaarden/      # Algemene voorwaarden
│   │   │
│   │   └── api/
│   │       ├── mollie/
│   │       │   ├── create-payment/route.ts   # Mollie betaling aanmaken
│   │       │   ├── webhook/route.ts          # Mollie webhook (order opslaan + emails)
│   │       │   └── status/route.ts           # Betaalstatus ophalen
│   │       ├── admin/
│   │       │   ├── dashboard/route.ts        # Dashboard statistieken
│   │       │   ├── stock/route.ts            # Voorraad beheer
│   │       │   └── shipment/route.ts         # PostNL verzending aanmaken
│   │       ├── discount/
│   │       │   ├── validate/route.ts         # Kortingscode valideren
│   │       │   └── redeem/route.ts           # Kortingscode als gebruikt markeren
│   │       └── newsletter/route.ts           # Nieuwsbrief aanmelding
│   │
│   ├── components/
│   │   ├── cart/CartProvider.tsx       # Cart Context (localStorage + kortingscodes)
│   │   ├── wishlist/WishlistProvider.tsx # Wishlist Context
│   │   ├── home/                      # Homepage secties (Hero, Featured, Newsletter, etc.)
│   │   ├── layout/                    # Header, Footer, Logo
│   │   ├── product/                   # ProductDetail, RelatedProducts
│   │   ├── shop/                      # ProductCard, ProductGrid, Filters, SearchBar
│   │   └── ui/                        # Accordion, BackToTop, Badge, Button, Toast, etc.
│   │
│   ├── data/
│   │   └── products.json              # ALLE 846 PRODUCTEN — bron van waarheid
│   │
│   ├── hooks/
│   │   └── useStock.ts                # Voorraad hook
│   │
│   └── lib/
│       ├── products.ts                # Product interface + query functies
│       ├── cart.ts                     # CartItem & CartState types
│       ├── utils.ts                   # formatPrice, PLATFORM_COLORS, SHIPPING_COST
│       ├── email.ts                   # E-mail templates (orderbevestiging, track & trace, etc.)
│       ├── postnl.ts                  # PostNL API integratie
│       ├── series.ts                  # Game series mapping
│       └── gameStories.ts             # Game achtergrondverhalen
```

---

## API Routes

| Route | Method | Auth | Beschrijving |
|---|---|---|---|
| `/api/mollie/create-payment` | POST | - | Mollie betaling aanmaken |
| `/api/mollie/webhook` | POST | - | Mollie webhook: order opslaan, emails versturen, korting markeren |
| `/api/mollie/status` | GET | - | Betaalstatus ophalen |
| `/api/admin/dashboard` | GET | Bearer | Dashboard statistieken (omzet, orders, voorraad, nieuwsbrief) |
| `/api/admin/stock` | GET/POST | Bearer | Voorraad ophalen/wijzigen |
| `/api/admin/shipment` | POST | Bearer | PostNL verzending aanmaken + track & trace email |
| `/api/discount/validate` | POST | - | Kortingscode valideren (GE-XXXXXX) |
| `/api/discount/redeem` | POST | - | Kortingscode als gebruikt markeren |
| `/api/newsletter` | POST | - | Nieuwsbrief aanmelding + unieke kortingscode genereren |

### Netlify Blobs (server-side opslag)

| Store | Key | Data |
|---|---|---|
| `gameshop-orders` | `orders` | Array van betaalde bestellingen |
| `gameshop-stock` | `stock` | Object met SKU → voorraadaantal |
| `gameshop-newsletter` | `subscribers` | Object met email → kortingscode |
| `gameshop-discounts` | `newsletter-codes` | Object met code → { email, used, createdAt } |

---

## Environment Variables

```env
# Mollie betalingen
MOLLIE_API_KEY=live_xxx

# E-mail (Gmail SMTP)
GMAIL_USER=gameshopenter@gmail.com
GMAIL_APP_PASSWORD=xxx

# PostNL verzending
POSTNL_API_KEY=xxx
POSTNL_CUSTOMER_CODE=xxx
POSTNL_CUSTOMER_NUMBER=xxx
POSTNL_SANDBOX=false

# Admin panel
ADMIN_PASSWORD=xxx

# Site URL
NEXT_PUBLIC_SITE_URL=https://gameshopenter.nl
```

---

## Product Interface

```typescript
interface Product {
  sku: string;              // "SW-001", "CON-003", "ACC-015"
  slug: string;             // URL-safe: "sw-001-zelda-breath-of-the-wild"
  name: string;
  platform: string;         // "Nintendo Switch" (altijd volledige naam)
  category: string;         // "Games > Switch", "Consoles", "Accessoires"
  genre: string;            // "RPG", "Avontuur", "Platformer", "Actie"
  price: number;            // In EUR (NOOIT string)
  condition: string;        // "Zo goed als nieuw", "Gebruikt", "Nieuw"
  completeness: string;     // "Compleet in doos (CIB)", "Losse cartridge"
  type: string;             // Altijd "simple"
  description: string;      // Nederlandse productbeschrijving
  weight: number;           // In kg
  isConsole: boolean;
  isPremium: boolean;       // true als price >= 50
  image?: string | null;    // "/images/products/..."
  backImage?: string | null;
  inkoopPrijs?: number;     // Inkoopprijs (~40% van marktwaarde)
  pcUsedPrice?: number;     // PriceCharting referentieprijs
  inkoopFeatured?: boolean;
  salePrice?: number;       // Actieprijs
  cibPrice?: number;        // Complete-in-box variant prijs
  cibImage?: string;
  cibBackImage?: string;
}
```

---

## SKU Schema

| Prefix | Platform | Bereik |
|---|---|---|
| `SW-` | Nintendo Switch | SW-001 t/m SW-163 |
| `3DS-` | Nintendo 3DS | 3DS-001 t/m 3DS-059 |
| `DS-` | Nintendo DS | DS-001 t/m DS-059 |
| `GBA-` | Game Boy Advance | GBA-001 t/m GBA-057 |
| `GB-` | Game Boy / Color | GB-001 t/m GB-063 |
| `GC-` | GameCube | GC-001 t/m GC-059 |
| `N64-` | Nintendo 64 | N64-001 t/m N64-062 |
| `SNES-` | Super Nintendo | SNES-001 t/m SNES-046 |
| `NES-` | NES | NES-001 t/m NES-060 |
| `WII-` | Wii | WII-001 t/m WII-069 |
| `WIIU-` | Wii U | WIIU-001 t/m WIIU-053 |
| `CON-` | Consoles | CON-001 t/m CON-045 |
| `ACC-` | Accessoires | ACC-001 t/m ACC-040 |

---

## Business Logica

### Prijzen & Verzending
```typescript
SHIPPING_COST = 3.95;           // PostNL standaard
FREE_SHIPPING_THRESHOLD = 100;  // Gratis verzending boven EUR 100
```

### Kortingscodes
- **Unieke codes (GE-XXXXXX):** Gegenereerd bij nieuwsbrief aanmelding, 10% korting, eenmalig gebruik
- **Validatie:** Server-side via `/api/discount/validate`
- **Afschrijving:** Na betaling via Mollie webhook → `/api/discount/redeem`

### Checkout Flow
1. Klant vult formulier in (naam, adres, betaalmethode)
2. Frontend stuurt naar `/api/mollie/create-payment`
3. Klant betaalt via Mollie (iDEAL, creditcard, etc.)
4. Mollie stuurt webhook naar `/api/mollie/webhook`
5. Webhook: order opslaan in Blobs, kortingscode markeren, emails versturen
6. Klant ziet betaalstatus op `/afrekenen/status`

### Email Systeem (src/lib/email.ts)
- **Orderbevestiging** → Klant (professionele HTML met producttabel)
- **Order notificatie** → Shop eigenaar (HTML met SKU's, opmerkingen)
- **Track & trace** → Klant (PostNL tracking link)
- **Nieuwsbrief welkom** → Nieuwe abonnee (met unieke kortingscode)

### Admin Panel (/admin)
- Wachtwoord-beveiligd (ADMIN_PASSWORD env var)
- **Dashboard tab:** Omzet KPI's, recente bestellingen, top producten, voorraad alerts
- **Voorraad tab:** Zoeken/filteren, +/- knoppen per product
- **Verzending tab:** PostNL label aanmaken, track & trace email versturen

---

## Design Systeem

### Kleuren
| Naam | Waarde | Gebruik |
|---|---|---|
| Brand gradient | emerald-500 → teal-500 | CTA knoppen, primaire acties |
| Navy 900 | `#050810` | Hero secties, donkere achtergronden |
| Body bg | `#f8fafc` (slate-50) | Pagina achtergrond |
| Gold | `#d4a76a` | Premium accenten |

### Typografie
- **Font:** Plus Jakarta Sans (Google Fonts) — gewichten 300-800
- **Fallback:** system-ui, sans-serif

### Glassmorphism (globals.css)
```css
.glass        → backdrop-blur(20px) + rgba(5,8,16,0.7)     /* Header */
.glass-card   → backdrop-blur(16px) + rgba(255,255,255,0.03) /* Dark bg cards */
.glass-light  → backdrop-blur(20px) + rgba(255,255,255,0.8)  /* Light bg cards */
```

---

## Provider Hierarchy (layout.tsx)

```
<CartProvider>           ← Cart Context (localStorage)
  <WishlistProvider>     ← Verlanglijst Context (localStorage)
    <ToastProvider>      ← Toast notificaties
      <Header />         ← Fixed top navigatie
      <main>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
      <BackToTop />
    </ToastProvider>
  </WishlistProvider>
</CartProvider>
```

---

## SEO

- **Root:** JSON-LD `Store` schema met AggregateRating (5.0, 1360 reviews)
- **Product pagina's:** JSON-LD `Product` schema + `BreadcrumbList`
- **Automatisch:** `robots.ts` en `sitemap.ts`
- **OpenGraph + Twitter Cards** op alle pagina's

---

## Navigatie Routes

| Route | Type | Beschrijving |
|---|---|---|
| `/` | Server | Homepage |
| `/shop` | Client | Shop met filters |
| `/shop/[sku]` | SSG | Product detail (846 pagina's) |
| `/winkelwagen` | Client | Winkelwagen |
| `/verlanglijst` | Client | Verlanglijst |
| `/afrekenen` | Client | Checkout |
| `/afrekenen/status` | Client | Betaalstatus |
| `/inkoop` | Client | Trade-in prijslijst |
| `/admin` | Client | Admin panel |
| `/over-ons` | Server | Over Gameshop Enter |
| `/nintendo` | Server | Nintendo info |
| `/faq` | Server | Veelgestelde vragen |
| `/contact` | Server | Contactformulier |
| `/privacybeleid` | Server | Privacy policy |
| `/retourbeleid` | Server | Retourbeleid |
| `/algemene-voorwaarden` | Server | Terms |

---

## Git Workflow

- Werk op branches met prefix `claude/`
- Nooit direct op `main` of `master`
- Nederlandse commit messages
- Stage specifieke bestanden, nooit `git add -A`
- Commit + push na elke afgeronde taak

---

## Deployment (Netlify)

Automatische deploy bij push naar GitHub:
1. `npm run prebuild` → Image validatie
2. `next build` → SSG van alle pagina's
3. Output naar `.next` → gehost door Netlify CDN

Caching:
- `/images/products/*` → 7 dagen
- `/_next/static/*` → 1 jaar (immutable)
- Security headers (X-Content-Type-Options, X-Frame-Options, HSTS)

---

## Codestijl

### TypeScript
- Strict mode, NOOIT `any`
- `interface` boven `type`
- Expliciete return types bij exports

### React
- `'use client'` alleen voor state/effects/event handlers
- Server Components voor statische pagina's
- Event handlers: `handle` prefix

### Tailwind
- Utility-first, geen custom CSS tenzij animaties
- Mobile-first: `sm:`, `md:`, `lg:`
- `cn()` helper voor conditionele classes

### Naamgeving
```
Componenten:  PascalCase      → ProductCard.tsx
Utilities:    camelCase        → products.ts
Constanten:   SCREAMING_SNAKE  → SHIPPING_COST
Routes:       kebab-case       → /over-ons
SKU's:        PREFIX-NNN       → SW-001
```

---

## Quick Reference

```
BESTANDEN:
  Producten:     src/data/products.json
  Types:         src/lib/products.ts
  Cart:          src/components/cart/CartProvider.tsx
  Utils:         src/lib/utils.ts
  Email:         src/lib/email.ts
  PostNL:        src/lib/postnl.ts
  Layout:        src/app/layout.tsx
  Shop:          src/app/shop/page.tsx
  Product:       src/app/shop/[sku]/page.tsx
  Checkout:      src/app/afrekenen/page.tsx
  Admin:         src/app/admin/page.tsx
  Header:        src/components/layout/Header.tsx
  Footer:        src/components/layout/Footer.tsx

COMMANDS:
  npm run dev        → Dev server
  npm run build      → Productie build
  npm run lint       → Linter

ENV VARS:
  MOLLIE_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD
  POSTNL_API_KEY, POSTNL_CUSTOMER_CODE, POSTNL_CUSTOMER_NUMBER
  ADMIN_PASSWORD, NEXT_PUBLIC_SITE_URL
```
