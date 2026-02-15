# Deployment Guide - Gameshop Enter

This guide covers deploying Gameshop Enter to Netlify.

## Prerequisites

- GitHub account with access to `lennhodes-debug/gameshop-pokemon`
- Netlify account
- Gmail account with app-specific password (for email functionality)
- Mollie account for payment processing (optional)

## Environment Variables

### Local Development

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your development settings (or leave empty to use defaults)

### Netlify Deployment

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site (gameshop-pokemon)
3. Navigate to **Site Settings → Environment → Environment variables**
4. Add the following variables:

#### Required Variables

**Email Configuration (for order confirmations, newsletter, etc.):**
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false`
- `GMAIL_USER`: Your Gmail address (e.g., `gameshopenter@gmail.com`)
- `GMAIL_APP_PASSWORD`: [Google app-specific password](#generating-gmail-app-password)

**Analytics (optional but recommended):**
- `NEXT_PUBLIC_GA_ID`: Your Google Analytics 4 measurement ID (starts with `G_`)

#### Optional Variables

**Mollie API (for real payment processing):**
- `MOLLIE_API_KEY`: Your Mollie API key (starts with `test_` or `live_`)

**Error Tracking (Sentry - future):**
- `SENTRY_DSN`: Your Sentry DSN

## Generating Gmail App Password

1. Enable 2-Factor Authentication on your Google account: https://myaccount.google.com/security
2. Go to App passwords: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or your device)
4. Google will generate a 16-character app password
5. Copy this password to `GMAIL_APP_PASSWORD` in Netlify environment variables

⚠️ **Important**: This is NOT your regular Gmail password. It's a special app-specific password that Google generates for security.

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. Push changes to `claude/website-verbeteringen` branch on GitHub
2. Netlify automatically detects changes and starts building
3. Once build succeeds, the site is live at your Netlify domain
4. View deployment logs at: **Deployments → [Deployment Name] → Logs**

### Option 2: Manual Deployment

1. In Netlify Dashboard, select your site
2. Click **Deploys → Trigger deploy → Deploy site** (builds current main branch)

## Building Locally

```bash
# Development server
npm run dev
# Open http://localhost:3000

# Production build
npm run build
npm start

# Validate images
npm run validate-images
```

## Troubleshooting

### Build Fails

1. Check build logs: **Deployments → [Deployment Name] → Logs**
2. Common issues:
   - Missing environment variables → Set in Netlify UI
   - Image validation warnings → Check `npm run validate-images` output
   - TypeScript errors → Run `npm run build` locally to debug

### Emails Not Sending

1. Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in Netlify
2. Check Gmail account allows app passwords (2FA must be enabled)
3. Review function logs in Netlify: **Functions** tab
4. Test with newsletter signup on `/` page

### Performance Issues

1. Check build output: **Deployments → Summary**
2. Current metrics:
   - Build time: ~7 seconds
   - First Load JS: ~102-185 kB
   - Static pages: 60/60 prerendered
3. Review Web Vitals in Google Analytics if configured

## Database & Storage

### Netlify Blobs

Gameshop uses Netlify Blobs for storing:
- `gameshop-orders`: Order history
- `gameshop-stock`: Inventory levels
- `gameshop-newsletter`: Subscriber list
- `gameshop-discounts`: Discount code tracking

No configuration needed - Netlify handles automatically.

## Monitoring & Analytics

### Google Analytics 4

After setting `NEXT_PUBLIC_GA_ID`:
1. Visit https://analytics.google.com
2. Select your property
3. Monitor real-time traffic, user behavior, etc.

### Error Tracking

Future: Sentry integration will automatically track runtime errors

## Next Steps

- [ ] Set up automated backups for Netlify Blobs data
- [ ] Configure custom domain (gameshopenter.nl)
- [ ] Setup SSL certificate (Netlify auto-renews)
- [ ] Configure DNS records with registrar
- [ ] Test payment processing with Mollie test mode
- [ ] Setup email notifications for order confirmations
- [ ] Configure form submission handling (if needed)

## Support

For issues or questions:
- 📧 Contact: gameshopenter@gmail.com
- 📚 Docs: Check CLAUDE.md for project architecture
- 🐛 Bugs: Create issue in GitHub repository
