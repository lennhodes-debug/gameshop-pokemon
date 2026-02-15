# Gameshop Enter - API Documentation

## 📧 Email API

### Overview
Complete email automation system for order confirmations, welcome emails, abandoned cart recovery, and generic email sending.

### Endpoints

#### 1. Generic Email Sender
**POST** `/api/email/send`

Send a custom email through the email service.

**Request Body:**
```json
{
  "to": "customer@example.com",
  "subject": "Your subject here",
  "html": "<h1>Email content</h1>",
  "text": "Plain text fallback (optional)",
  "replyTo": "support@gameshopenter.nl (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "abc-123-def",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

**Response (400/500):**
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

**Cache:** No cache (dynamic)

---

#### 2. Order Confirmation Email
**POST** `/api/email/order-confirmation`

Automatically sends order confirmation email to customer after successful checkout.

**Request Body:**
```json
{
  "orderNumber": "GE-ABC123XYZ",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "items": [
    {
      "name": "Pokémon Red (GBA)",
      "quantity": 1,
      "price": 45.00
    }
  ],
  "subtotal": 45.00,
  "shipping": 3.95,
  "total": 48.95,
  "shippingAddress": {
    "street": "Straatnaam",
    "number": "42",
    "postcode": "1234 AB",
    "city": "Amsterdam"
  },
  "paymentMethod": "iDEAL"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "order-abc-123",
  "orderNumber": "GE-ABC123XYZ",
  "customerEmail": "john@example.com",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

**Cache:** No cache

**Auto-triggered by:** `/src/app/afrekenen/page.tsx` (checkout page)

---

#### 3. Welcome Email (Newsletter)
**POST** `/api/email/welcome`

Sends welcome email with discount code to new newsletter subscribers.

**Request Body:**
```json
{
  "email": "subscriber@example.com",
  "discountCode": "GE-ABC1234567",
  "discountPercentage": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "welcome-abc-123",
  "email": "subscriber@example.com",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

**Cache:** No cache

---

#### 4. Abandoned Cart Recovery Email
**POST** `/api/email/abandoned-cart`

Sends recovery email when customer abandons checkout.

**Request Body:**
```json
{
  "customerEmail": "customer@example.com",
  "customerName": "Jane Doe",
  "cartItems": [
    {
      "name": "Pokémon Blue (3DS)",
      "quantity": 1,
      "price": 55.00
    }
  ],
  "cartTotal": 55.00,
  "cartUrl": "https://gameshopenter.nl/winkelwagen",
  "reminderType": "first"
}
```

**reminderType values:**
- `first`: Sent after 5 minutes
- `second`: Sent after 24 hours
- `third`: Sent after 72 hours

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "cart-abc-123",
  "customerEmail": "customer@example.com",
  "reminderType": "first",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

**Cache:** No cache

---

#### 5. Email Status Tracking
**GET** `/api/email/status?messageId=abc-123-def`

Check the delivery status of a sent email.

**Query Parameters:**
- `messageId` (required): The message ID from send response

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "abc-123-def",
  "status": "sent",
  "timestamp": "2024-02-15T10:30:00.000Z",
  "error": null
}
```

**Cache:** 5 minutes (short-term)

**Status values:**
- `sent`: Successfully delivered
- `pending`: Queued for delivery
- `failed`: Delivery failed

---

#### 6. Email Status Management
**POST** `/api/email/status`

Get all email statuses or perform cleanup operations.

**Request Body (Get All):**
```json
{
  "action": "all"
}
```

**Request Body (Cleanup):**
```json
{
  "action": "cleanup",
  "hoursOld": 24
}
```

**Response:**
```json
{
  "success": true,
  "count": 150,
  "statuses": [
    {
      "messageId": "abc-123",
      "timestamp": "2024-02-15T10:30:00.000Z",
      "status": "sent",
      "error": null
    }
  ]
}
```

**Cache:** 30 seconds (short)

---

### Newsletter API

#### Subscribe & Get Discount Code
**POST** `/api/newsletter`

Subscribe to newsletter and receive welcome email with discount code.

**Request Body:**
```json
{
  "email": "subscriber@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "email": "subscriber@example.com",
  "discountCode": "GE-ABC1234567",
  "discountPercentage": 10,
  "timestamp": "2024-02-15T10:30:00.000Z",
  "message": "Welkom! Check je inbox voor je kortingscode."
}
```

**Cache:** No cache

**Auto-triggered by:** Newsletter form on homepage

---

## 🏥 Health Check APIs

### Health Status
**GET** `/api/health`

Simple health check for monitoring and uptime checks.

**Response (200 OK):**
```json
{
  "status": "operational",
  "checks": {
    "api": true,
    "timestamp": "2024-02-15T10:30:00.000Z",
    "uptime": 3600.5,
    "memory": {
      "used": 125.5,
      "total": 512
    }
  },
  "responseTime": "12ms",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

**Cache:** 60 seconds

**Also available:** `HEAD /api/health` (no response body, just headers)

---

### Admin Status Dashboard
**GET** `/api/admin/status`

Detailed system metrics and email statistics (admin only).

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-02-15T10:30:00.000Z",
  "system": {
    "status": "operational",
    "version": "1.0.0"
  },
  "email": {
    "totalSent": 1250,
    "sentToday": 45,
    "successCount": 1240,
    "failureCount": 10,
    "successRate": "99.20%",
    "recentStatuses": [...]
  },
  "queue": {
    "total": 15,
    "pending": 5,
    "sent": 8,
    "failed": 2,
    "isProcessing": false
  },
  "health": {
    "emailService": {
      "status": "healthy",
      "operational": true
    },
    "queue": {
      "status": "healthy",
      "operational": true,
      "message": "Queue operating normally"
    }
  }
}
```

**Cache:** 5 minutes

**Admin Actions (POST):**

**Cleanup old emails:**
```json
{
  "action": "cleanup-emails",
  "hoursOld": 24
}
```

**Cleanup queue items:**
```json
{
  "action": "cleanup-queue",
  "daysOld": 7
}
```

---

## 🔐 Security & Performance

### Security Headers (All Endpoints)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### Caching Strategy
| Endpoint | Strategy | Duration | Use Case |
|----------|----------|----------|----------|
| `/api/email/send` | NONE | Dynamic | POST requests |
| `/api/email/welcome` | NONE | Dynamic | POST requests |
| `/api/email/order-confirmation` | NONE | Dynamic | POST requests |
| `/api/email/abandoned-cart` | NONE | Dynamic | POST requests |
| `/api/email/status?messageId=` | SHORT | 5 minutes | Status polling |
| `/api/newsletter` | NONE | Dynamic | POST requests |
| `/api/health` | SHORT | 60 seconds | Uptime monitoring |
| `/api/admin/status` | SHORT | 5 minutes | Dashboard |
| GET endpoints (documentation) | MEDIUM | 1 hour | API documentation |

### Request Validation
All POST endpoints use Zod schema validation:
- Type-safe request parsing
- Detailed validation error messages
- Email format validation
- URL validation
- Required field validation

---

## 📝 Email Templates

### Languages
All email templates are in Dutch (Nederlands).

### Template Types

1. **Order Confirmation** (`OrderConfirmationData`)
   - Order number and details
   - Item list with prices
   - Shipping address
   - Total calculation (subtotal + shipping)

2. **Welcome Email** (`WelcomeEmailData`)
   - Personalized greeting
   - Discount code (10%)
   - Features of Gameshop Enter
   - One-time use code disclaimer

3. **Abandoned Cart** (`AbandonedCartData`)
   - Customer name
   - Cart items with quantities and prices
   - Total amount
   - Direct link to complete purchase
   - Reminder type indication

---

## 🔄 Implementation Examples

### JavaScript/TypeScript

```typescript
// Send order confirmation
const response = await fetch('/api/email/order-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderNumber: 'GE-ABC123',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [{ name: 'Game', quantity: 1, price: 45.00 }],
    subtotal: 45.00,
    shipping: 3.95,
    total: 48.95,
    shippingAddress: {
      street: 'Street',
      number: '42',
      postcode: '1234 AB',
      city: 'Amsterdam'
    },
    paymentMethod: 'iDEAL'
  })
});

const data = await response.json();
console.log('Email sent:', data.messageId);
```

```typescript
// Subscribe to newsletter
const response = await fetch('/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'subscriber@example.com' })
});

const data = await response.json();
console.log('Discount code:', data.discountCode);
```

### cURL

```bash
# Send order confirmation
curl -X POST https://gameshopenter.nl/api/email/order-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "GE-ABC123",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    ...
  }'

# Check health
curl https://gameshopenter.nl/api/health
```

---

## 🚀 Deployment Notes

### Environment Variables Required
```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
NODE_ENV=production
```

### Rate Limiting
Currently no built-in rate limiting, but infrastructure is available in `api-utils.ts`.

### Monitoring
- Health checks: 60-second intervals
- Admin dashboard: 5-minute intervals
- Email queue: Auto-cleanup after 24 hours (configurable)

### Production Checklist
- [ ] Add admin authentication to `/api/admin/*`
- [ ] Configure rate limiting per endpoint
- [ ] Set up email alerts for queue backlog
- [ ] Monitor email delivery success rate
- [ ] Regular cleanup of old email records
- [ ] SSL/TLS certificates updated

---

## 🔗 Related Documentation

- **Email Service:** See `src/lib/email-service.ts`
- **Email Queue:** See `src/lib/email-queue.ts`
- **API Utilities:** See `src/lib/api-utils.ts`
- **Middleware:** See `src/middleware.ts`
- **Type Definitions:** See `src/lib/email-service.ts` (types)

---

## 📞 Support

For issues or questions:
- Email: gameshopenter@gmail.com
- GitHub Issues: lennhodes-debug/gameshop-pokemon

---

**Last Updated:** February 15, 2024
**API Version:** 1.0.0
