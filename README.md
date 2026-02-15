# Gameshop Enter — Pokémon Retro Game E-commerce

[![Netlify Status](https://api.netlify.com/api/v1/badges/4c2f14d5-6e4c-4df8-9b92-1a7d5b6c8d3e/deploy-status)](https://app.netlify.com/sites/gameshop-enter/deploys)

[🌐 Live Website](https://gameshopenter.nl) | [📚 CLAUDE.md](CLAUDE.md) | [🔌 API Docs](API.md) | [🧪 Testing](TESTING.md) | [🚀 Deployment](DEPLOYMENT.md)

## Over Gameshop Enter

Gameshop Enter is dé Nederlandse specialist in originele Pokémon games voor Nintendo. We verkopen uitsluitend authentieke cartridges, handhelds en accessoires, persoonlijk getest en gefotografeerd.

- **34 producten** in katalogus (GBA, DS, 3DS, GB)
- **5-sterren** klantbeoordeling (1360+ reviews)
- **3000+ tevreden klanten** sinds 2023
- **Originele hardware** — geen reprints, geen vervalsingen

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/lennhodes-debug/gameshop-pokemon.git
cd gameshop-pokemon
npm install
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

## 📋 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Next.js | 15.5 |
| **UI Library** | React | 19 |
| **Type Safety** | TypeScript | 5.9 (strict) |
| **Styling** | Tailwind CSS | 3.4 |
| **Animations** | Framer Motion | 12 |
| **Database** | Netlify Blobs | - |
| **Payments** | Mollie | v2 API |
| **Hosting** | Netlify | - |

## 📁 Project Structure

```
gameshop-pokemon/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (Header, Footer, Providers)
│   │   ├── globals.css         # Global styles + animations
│   │   ├── page.tsx            # Homepage
│   │   ├── shop/               # Product shop + detail pages
│   │   ├── afrekenen/          # Checkout flow
│   │   ├── winkelwagen/        # Shopping cart
│   │   ├── api/                # API endpoints
│   │   └── ...                 # Other pages
│   ├── components/             # React components
│   │   ├── layout/             # Header, Footer
│   │   ├── home/               # Homepage sections
│   │   ├── shop/               # Shop components
│   │   ├── cart/               # Cart Context
│   │   └── ui/                 # UI components
│   ├── data/
│   │   └── products.json       # Product catalog (34 items)
│   └── lib/
│       ├── products.ts         # Product utilities
│       ├── utils.ts            # Common utilities
│       ├── email-service.ts    # Email handling
│       └── api-utils.ts        # API helpers
├── public/
│   └── images/products/        # 80 product images (WebP)
├── CLAUDE.md                   # AI instruction guide
├── API.md                      # API reference
├── TESTING.md                  # Test procedures
├── DEPLOYMENT.md               # Deployment guide
└── package.json
```

## 🎨 Features

### Shop
- ✅ Browse 34 products met platform/genre/conditie filters
- ✅ Real-time search op naam, SKU, platform
- ✅ Product detail met afbeelding + backImage
- ✅ Related products (zelfde platform)
- ✅ Pagination (24 items/pagina)

### Cart & Checkout
- ✅ Client-side cart met localStorage persistence
- ✅ Discount code support (10% for newsletter subscribers)
- ✅ Shipping cost logic (€3.95 standaard, gratis > €100)
- ✅ Checkout form validatie
- ✅ Order confirmation emails

### Admin
- ✅ Dashboard endpoint voor statistieken
- ✅ Inventory management API
- ✅ Order management API
- ✅ Bearer token authentication

### Content
- ✅ Homepage met featured products
- ✅ Over ons, FAQ, Contact pagina's
- ✅ Privacy policy & Terms of service
- ✅ Newsletter signup met discount code
- ✅ Dark mode toggle

## 🔌 API Endpoints

Zie [API.md](API.md) voor volledige documentatie.

### Payment
- `POST /api/mollie/create-payment` — Create Mollie payment
- `GET /api/mollie/status` — Check payment status
- `POST /api/mollie/webhook` — Mollie webhook handler

### Orders
- `POST /api/orders/create` — Create order after payment

### Inventory
- `GET /api/inventory` — Get all inventory
- `GET /api/inventory?sku=SKU` — Get product inventory

### Reviews
- `POST /api/reviews/submit` — Submit product review
- `GET /api/reviews/get?sku=SKU` — Get product reviews

### Email
- `POST /api/email/order-confirmation` — Send order email
- `POST /api/email/welcome` — Send newsletter welcome
- `POST /api/email/abandoned-cart` — Send cart reminder
- `POST /api/newsletter` — Subscribe to newsletter

### Admin
- `GET /api/admin/dashboard` — Dashboard data (Bearer required)
- `GET /api/admin/status` — Admin status check

## 📊 Performance

- **Build time**: ~7s
- **First Load JS**: ~102 kB
- **Static pages**: 69/69 prerendered
- **LCP**: < 2.5s (target < 2.5s)
- **CLS**: < 0.1 (target < 0.1)

## 🧪 Testing

```bash
# Image validation
npm run validate-images

# Full build
npm run build

# Start dev server for testing
npm run dev
```

See [TESTING.md](TESTING.md) for comprehensive test procedures.

## 📦 Environment Variables

### Development
Create `.env.local`:
```bash
NODE_ENV=development
# Email & Mollie configs optional in dev
```

### Production (Netlify)
Set in Site Settings → Environment:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
GMAIL_USER=gameshopenter@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
MOLLIE_API_KEY=live_or_test_key
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup.

## 🚀 Deployment

### GitHub → Netlify (Automatic)
1. Push to `claude/website-verbeteringen` branch
2. Netlify detects change and builds automatically
3. Deploy preview generated
4. Production live after merge

### Manual Deploy
```bash
git push origin claude/website-verbeteringen
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for environment setup and troubleshooting.

## 📝 Contributing

1. Clone repo
2. Create feature branch
3. Follow [CLAUDE.md](CLAUDE.md) guidelines
4. Test with `npm run build`
5. Commit with descriptive message
6. Push and create PR

## 🔒 Security

- TypeScript strict mode (no `any`)
- Zod validation on all API inputs
- Bearer token auth on admin endpoints
- HTML sanitization on user input
- No sensitive data in version control
- Environment variables for secrets

## 📞 Support

- **Email**: gameshopenter@gmail.com
- **Issues**: GitHub Issues
- **Docs**: See CLAUDE.md, API.md, DEPLOYMENT.md

## 📄 License

Private project — Gameshop Enter © 2025

## 🎯 Roadmap

- [ ] User accounts & wishlist persistence
- [ ] Product reviews & ratings system
- [ ] Real Mollie payment integration
- [ ] PostNL shipping integration
- [ ] Admin dashboard UI (full)
- [ ] Inventory tracking per product
- [ ] Email marketing automation
- [ ] SEO optimization (schema.org)
- [ ] Analytics dashboard
- [ ] Mobile app (future)

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** — Complete project guide for AI assistants
- **[API.md](API.md)** — Full API reference & examples
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Deployment & configuration guide
- **[TESTING.md](TESTING.md)** — Testing procedures & checklists

---

Made with ❤️ for Pokémon game collectors
