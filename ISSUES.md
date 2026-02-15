# Gameshop Enter — Live Go Issues & Blockers

**Status**: Ready for other chat to fix. All analyzed and documented below.

---

## 🔴 CRITICAL BLOCKERS (Must Fix Before Launch)

### #1 MOLLIE_API_KEY ontbreekt

- **File**: `src/app/api/mollie/create-payment/route.ts`
- **Problem**: Checkout werkt, maar payment redirect gaat naar fallback
- **Fix Required**:
  1. User naar https://www.mollie.com/dashboard
  2. Copy API Key (sandbox of production)
  3. Netlify env: `MOLLIE_API_KEY = xxx`
- **Impact**: Klanten kunnen niet betalen (fallback mode)

### #2 PostNL Credentials ontbreken (3x)

- **Files**: `src/app/api/admin/shipment/route.ts`
- **Problem**: Shipping labels gaan naar fallback tracking codes
- **Fix Required**:
  1. `POSTNL_API_KEY` — from https://developer.postnl.nl/
  2. `POSTNL_CUSTOMER_CODE` — from PostNL account
  3. `POSTNL_CUSTOMER_NUMBER` — from PostNL account
- **Impact**: Echte verzendlabels niet gegenereerd

### #3 GMAIL_EMAIL & GMAIL_PASSWORD ontbreken

- **File**: `src/lib/email.ts` line 4-9
- **Problem**: Order confirmation emails gaan niet uit
- **Fix Required**:
  1. Gmail app password: https://myaccount.google.com/apppasswords
  2. Netlify env: `GMAIL_EMAIL = gameshopenter@gmail.com`
  3. Netlify env: `GMAIL_PASSWORD = (16-char app password)`
- **Impact**: Klanten krijgen geen order bevestiging

### #4 ADMIN_API_KEY niet ingesteld

- **Files**:
  - `src/app/api/orders/list/route.ts` line 12
  - `src/app/api/admin/shipment/route.ts` line 24
- **Problem**: Admin panels (`/admin/*`) vereisen Bearer token
- **Fix Required**:
  1. Generate sterke key: `openssl rand -base64 32`
  2. Netlify env: `ADMIN_API_KEY = xxx`
- **Impact**: Admin panel niet bereikbaar, geen order management

---

## 🟡 HIGH PRIORITY BUGS (Pre-Launch)

### #5 Admin Order Detail Page — Data Not Loaded

- **File**: `src/app/admin/bestellingen/[id]/page.tsx`
- **Problem**: Page toont altijd "Bestelling niet gevonden"
- **Root Cause**: Awaits params maar fetcht order data niet van API
- **Lines**: 47-60 (param resolution), 75 (error check)
- **Fix**:
  ```typescript
  // After resolveParams(), add:
  const orderResponse = await fetch('/api/orders/list', {
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  });
  const data = await orderResponse.json();
  const order = data.orders.find((o) => o.orderNumber === id);
  setOrder(order);
  ```
- **Impact**: Can't view order details, no order management

### #6 Missing Error Boundaries

- **File**: `src/app/afrekenen/page.tsx`
- **Problem**: Payment errors not caught, checkout crashes
- **Lines**: 200-240 (payment logic)
- **Fix**: Add try/catch around checkout logic + user-friendly error messages
- **Impact**: Failed payments → no recovery, bad UX

### #7 Missing Null Checks (SSR Hydration)

- **Files**:
  - `src/app/shop/[sku]/page.tsx` — window object calls
  - `src/app/afrekenen/page.tsx` — form field assumptions
- **Problem**: Potential hydration mismatches in SSR context
- **Fix**: Guard all window/document calls with `typeof window !== 'undefined'`
- **Impact**: Hydration warnings, potential crashes

### #8 Postcode Validation Incomplete

- **File**: `src/app/afrekenen/page.tsx` line 113
- **Current**: `/^[0-9]{4}\s?[a-zA-Z]{2}$/`
- **Problem**: Some valid Dutch postcodes rejected
- **Fix**: Should accept: `1234 AB`, `1234AB`, `1234a AB`, etc.
- **Impact**: Valid orders rejected

### #9 Mobile Responsiveness Issues

- **Files**: `/admin/*` pages, checkout form
- **Problem**: Admin panels untested on mobile, checkout may overflow
- **Fix**:
  1. Test on iPhone/iPad (Chrome DevTools)
  2. Fix overflow issues (max-width, padding)
  3. Mobile-friendly touch targets (44px minimum)
- **Impact**: Mobile users can't complete orders

---

## 🟠 MEDIUM PRIORITY (Nice-to-Have, Not Blocking)

### #10 Missing Analytics Setup

- **Problem**: No Google Analytics, no conversion tracking
- **Fix**: Add Google Analytics 4 script to `src/app/layout.tsx`
- **Impact**: Can't track conversions, business metrics

### #11 Missing Error Logging / Monitoring

- **Problem**: API errors console.log only, no centralized tracking
- **Fix**: Add Sentry (https://sentry.io/) integration
- **Impact**: Can't debug production issues

### #12 Bundle Size & Performance Not Optimized

- **Problem**: No image lazy loading, no code splitting
- **Fix**:
  1. Add `loading="lazy"` to product images
  2. Dynamic imports for heavy components
  3. Check bundle size: `npm run build` → analyze `.next` folder
- **Impact**: Slower page loads, worse UX

---

## ✅ WHAT'S WORKING

- ✅ Shop (filters, search, pagination) — 141 products
- ✅ Product detail pages (SSG, Schema.org)
- ✅ Cart (localStorage, context)
- ✅ Checkout form (validation, localStorage)
- ✅ Mollie API skeleton (fallback working)
- ✅ PostNL API skeleton (fallback working)
- ✅ Email templates (ready for credentials)
- ✅ Order storage (Netlify Blobs)
- ✅ Admin panels (auth template ready)
- ✅ Build (TypeScript strict, no errors, 172 pages)

---

## 📋 USER CREDENTIAL CHECKLIST

```
MUST SET IN NETLIFY ENVIRONMENT VARIABLES:
[ ] MOLLIE_API_KEY = (from mollie.com dashboard)
[ ] POSTNL_API_KEY = (from postnl developer portal)
[ ] POSTNL_CUSTOMER_CODE = (from PostNL account)
[ ] POSTNL_CUSTOMER_NUMBER = (from PostNL account)
[ ] ADMIN_API_KEY = (random strong secret, min 32 chars)
[ ] GMAIL_EMAIL = gameshopenter@gmail.com
[ ] GMAIL_PASSWORD = (Gmail app password, NOT account password)
```

---

## 🎯 OTHER CHAT ROADMAP (In Order of Priority)

1. **#1-4**: User must set credentials in Netlify (NOT CODE FIX)
2. **#5**: Fix order detail page data loading
3. **#6**: Add error boundaries to checkout
4. **#7**: Fix SSR null checks
5. **#8**: Improve postcode validation
6. **#9**: Test & fix mobile responsiveness
7. **#10-12**: Optional (analytics, monitoring, performance)

---

## Recent Commits (Context)

```
c785968 Mollie Payment API integratie (NEW — created this session)
5e33ee5 PostNL Shipment V4 API integratie
c9066b2 PostNL verzending en Google Maps integratie
b5679f1 Centraal orderbeheer systeem
fc97819 Geautomatiseerde emails
```

---

**Last Updated**: This session
**Branch**: `claude/cleanup-dark-classes`
**Status**: Ready for implementation
