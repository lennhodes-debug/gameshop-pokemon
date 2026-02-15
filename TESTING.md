# Testing Gids - Gameshop Enter

## Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000
```

## Build & Validation

```bash
# Run image validation
npm run validate-images

# Run full production build
npm run build

# Start production server (after build)
npm start
```

## API Testing

### Using cURL

#### Create Payment
```bash
curl -X POST http://localhost:3000/api/mollie/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": {
      "currency": "EUR",
      "value": "45.00"
    },
    "description": "Testbestelling",
    "redirectUrl": "http://localhost:3000/afrekenen/status",
    "webhookUrl": "http://localhost:3000/api/mollie/webhook"
  }'
```

#### Check Payment Status
```bash
curl http://localhost:3000/api/mollie/status?paymentId=tr_TEST123
```

#### Submit Review
```bash
curl -X POST http://localhost:3000/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "3DS-001",
    "rating": 5,
    "title": "Geweldig!",
    "comment": "Dit product werkt perfect en is goed ingepakt.",
    "author": "Test User",
    "email": "test@example.com"
  }'
```

#### Create Order
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Jan Jansen",
    "customerEmail": "jan@example.com",
    "items": [
      {
        "sku": "3DS-001",
        "name": "Pokémon X",
        "quantity": 1,
        "price": 25.00
      }
    ],
    "subtotal": 25.00,
    "shipping": 3.95,
    "total": 28.95,
    "shippingAddress": {
      "street": "Hoofdstraat",
      "number": "42",
      "postcode": "1234 AB",
      "city": "Amsterdam"
    },
    "paymentMethod": "ideal"
  }'
```

### Using API Client (Insomnia/Postman)

1. **Import Collection**
   - Copy API.md endpoints in je API client
   - Set base URL: `http://localhost:3000/api`

2. **Test Endpoints**
   - POST /mollie/create-payment → Copy payment ID
   - GET /mollie/status?paymentId={ID} → Check status
   - POST /reviews/submit → Should return 201
   - GET /reviews/get?sku=3DS-001 → Should return reviews array

## Feature Testing

### 1. Homepage
- [ ] Hero banner loads met animaties
- [ ] Featured products tonen (max 8)
- [ ] Marquee scrolling van game covers
- [ ] Newsletter form werkt en submit → `/api/newsletter`
- [ ] Dark mode toggle werkt (check localStorage)

### 2. Shop
- [ ] Alle 34 producten laden
- [ ] Zoeken werkt op naam/SKU
- [ ] Filters (platform, genre, conditie) reduceren resultaten
- [ ] Sorteren werkt (naam, prijs)
- [ ] Paginatie: 24 items per pagina
- [ ] Add to cart: item verschijnt in winkelwagen badge

### 3. Product Detail
- [ ] Pagina laadt via `/shop/[sku]` (SSG)
- [ ] Afbeelding en backImage tonen
- [ ] Product info (conditie, compleetheid, genre)
- [ ] Gerelateerde producten (zelfde platform)
- [ ] Add to cart button werkt
- [ ] Breadcrumbs kloppen

### 4. Winkelwagen
- [ ] Items tonen met aantal en prijs
- [ ] Totaal berekenen (excl. verzending)
- [ ] Hoeveelheid aanpassen
- [ ] Item verwijderen
- [ ] Verder winkelen → `/shop`
- [ ] Naar checkout → `/afrekenen`

### 5. Checkout (afrekenen)
- [ ] Formulier laden
- [ ] Validatie werkt:
  - [x] Voornaam: niet leeg
  - [x] Email: geldig format
  - [x] Postcode: 1234 AB format
  - [x] Alle required fields
- [ ] Adresgegevens opgeslagen in localStorage
- [ ] Discount code invoeren en toepassen
- [ ] Betaalmethode selecteren
- [ ] Order placement → `/api/orders/create`
- [ ] Success page met order nummer
- [ ] Confetti animatie

### 6. Email
- [ ] Newsletter signup → email naar `/api/email/welcome`
- [ ] Discount code in welcome email
- [ ] Order confirmation → `/api/email/order-confirmation`
- [ ] Abandoned cart → `/api/email/abandoned-cart`

### 7. Dark Mode
- [ ] Theme toggle in Header
- [ ] Light/Dark/System options
- [ ] localStorage persistence (key: 'theme')
- [ ] Tailwind dark: classes toepassen

### 8. Mobile Responsiveness
- [ ] Header: hamburger menu < 768px
- [ ] Product grid: responsive (1-4 kolommen)
- [ ] Forms: readable op mobile
- [ ] Buttons: groot genoeg (min 44px)

## Performance Testing

### Google PageSpeed Insights
1. Go to https://pagespeed.web.dev
2. Enter: `https://gameshopenter.nl` (production)
3. Check metrics:
   - FCP (First Contentful Paint): < 1.5s
   - LCP (Largest Contentful Paint): < 2.5s
   - CLS (Cumulative Layout Shift): < 0.1
   - TTI (Time to Interactive): < 3.5s

### Local Performance
```bash
# Build & analyze
npm run build

# Check bundle size
# Expect: ~102 kB First Load JS
```

## SEO Testing

### Meta Tags
- [ ] Homepage: title, description, og:image
- [ ] Product pages: dynamic title "{name} - {platform} | Gameshop"
- [ ] Mobile viewport meta tag
- [ ] Canonical URLs

### Structured Data (JSON-LD)
- [ ] Homepage: Schema.org Store, SearchAction
- [ ] Product pages: Product schema, BreadcrumbList
- [ ] Validate via: https://schema.org/validator/

### Sitemaps
- [ ] Visit `/sitemap.xml`
- [ ] Expect: 66+ routes
- [ ] Use: https://www.xml-sitemaps.com/validate-xml-sitemap.html

### Robots.txt
- [ ] Visit `/robots.txt`
- [ ] Check Allow/Disallow rules

## Browser Testing

### Desktop
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Samsung Internet

### Accessibility
- [ ] Keyboard navigation (Tab/Shift+Tab)
- [ ] Screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] Focus indicators visible
- [ ] Color contrast: min 4.5:1

## Security Testing

### OWASP Top 10
- [ ] XSS: Form inputs escaped (Zod validation)
- [ ] CSRF: Next.js CSRF protection enabled
- [ ] SQL Injection: No SQL queries (JSON data)
- [ ] Weak Auth: Bearer token on admin endpoints
- [ ] Sensitive data: No passwords/secrets in code

### Environment Variables
- [ ] `.env.local` niet in git
- [ ] `MOLLIE_API_KEY` configured production-only
- [ ] `GMAIL_APP_PASSWORD` secure (not hardcoded)

## Deployment Testing

### Netlify Build
1. Go to: https://app.netlify.com
2. Select: gameshop-pokemon site
3. Check latest deploy:
   - [ ] Build succeeded
   - [ ] Deploy preview working
   - [ ] Production live

### Environment Variables (Netlify)
- [ ] Set in Site Settings → Environment
- [ ] Deploy & verify working

### DNS
- [ ] Custom domain: gameshopenter.nl
- [ ] SSL certificate: auto-renewed by Netlify
- [ ] Visit https://gameshopenter.nl (not http)

## Bug Reporting Template

```markdown
### Title
[COMPONENT] Brief description

### Steps to Reproduce
1. Go to page X
2. Click button Y
3. Observe issue Z

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Browser: Chrome 120
- Device: Windows 10 / iPhone 15
- OS: Windows / iOS
- URL: https://...

### Screenshots
[Paste images if relevant]
```

## Performance Checklist

- [ ] Build time < 15s
- [ ] First Load JS < 200 kB
- [ ] Static pages: 66/66 prerendered
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No warnings (except image duplicates)

## Launch Checklist

- [ ] All tests passing
- [ ] No console errors in production
- [ ] Environment variables set
- [ ] SSL certificate working
- [ ] Analytics configured (Google Analytics 4)
- [ ] Email working (test order confirmation)
- [ ] Mollie test mode activated
- [ ] Backup strategy planned
- [ ] Monitoring configured
- [ ] Support email setup
