# API Documentation - Gameshop Enter

## Overview

This document describes the API routes available in the Gameshop Enter application. All API routes are located in `src/app/api/` and follow Next.js 15.5 conventions.

### API Characteristics
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **Response Format**: JSON
- **Content-Type**: application/json
- **Encoding**: gzip compression ready
- **Caching**: HTTP Cache-Control headers implemented

---

## Authentication

Admin endpoints require Bearer token authentication:

```bash
Authorization: Bearer <ADMIN_API_TOKEN>
```

Set `ADMIN_API_TOKEN` in your `.env.local` file:
```env
ADMIN_API_TOKEN=your-secure-token-here
```

---

## Endpoints

### 1. Mollie Payments

**POST `/api/mollie`** - Initiate payment
**GET `/api/mollie/:id`** - Check payment status

#### POST /api/mollie
Create a payment session for checkout.

**Request**:
```json
{
  "amount": "45.99",
  "description": "Order #12345",
  "redirectUrl": "https://gameshopenter.nl/afrekenen",
  "locale": "nl_NL"
}
```

**Response** (200):
```json
{
  "id": "mollie_1234567890",
  "status": "pending",
  "checkoutUrl": "https://www.mollie.com/checkout/test-...",
  "description": "Order #12345",
  "amount": "45.99"
}
```

**Error Response** (400):
```json
{
  "error": "Missing required fields: amount, description"
}
```

**Notes**:
- Amount must be a string with 2 decimal places: "XX.XX"
- In production: integrates with Mollie API
- Response cached for 0 seconds (real-time)

---

#### GET /api/mollie/:id
Check the status of a payment.

**Response** (200):
```json
{
  "id": "mollie_1234567890",
  "status": "paid",
  "isPaid": true,
  "updatedAt": "2026-02-15T12:00:00.000Z"
}
```

**Possible statuses**: pending, open, paid, failed, expired, canceled

---

### 2. Discount Codes

**POST `/api/discount`** - Validate discount code
**GET `/api/discount?code=CODE`** - Quick code check

#### POST /api/discount
Validate and apply a discount code.

**Request**:
```json
{
  "code": "GE-ABC123",
  "subtotal": 100.00
}
```

**Response** (200):
```json
{
  "valid": true,
  "code": "GE-ABC123",
  "discountPercentage": 10,
  "discountAmount": 10.00,
  "description": "10% korting - Nieuwsbrief abonnement",
  "maxUses": 1
}
```

**Error Response** (400):
```json
{
  "valid": false,
  "error": "Ongeldig kortingscode"
}
```

**Newsletter Code Format**: `GE-XXXXXX` (6 alphanumeric characters)
- Discount: 10% off
- Max uses: 1 (one-time use)

---

#### GET /api/discount?code=CODE
Quick validation of discount code without subtotal.

**Response** (200):
```json
{
  "code": "GE-ABC123",
  "isValid": true
}
```

**Cache**: 10 minutes (for frequently checked codes)

---

### 3. Newsletter

**POST `/api/newsletter`** - Subscribe to newsletter
**GET `/api/newsletter`** - Health check

#### POST /api/newsletter
Subscribe an email address to the newsletter and generate a discount code.

**Request**:
```json
{
  "email": "customer@example.nl",
  "name": "Jan de Vries"
}
```

**Response** (201):
```json
{
  "success": true,
  "email": "customer@example.nl",
  "discountCode": "GE-ABC123",
  "message": "Welkom! Je ontvangt een bevestigingsmail met je 10% kortingscode."
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Notes**:
- Email is required and must be valid
- Name is optional
- Generates unique 6-character discount code
- In production: sends welcome email with discount code
- Response NOT cached (real-time)

---

### 4. Shipments

**POST `/api/shipment`** - Create shipment
**GET `/api/shipment?orderId=ID`** - Track shipment

#### POST /api/shipment
Create a shipment label via PostNL API.

**Request**:
```json
{
  "orderId": "GE-20260215001",
  "address": {
    "street": "Kerkstraat",
    "number": "12a",
    "postcode": "1234 AB",
    "city": "Amsterdam"
  },
  "items": [
    { "sku": "DS-001", "quantity": 1 },
    { "sku": "GBA-003", "quantity": 2 }
  ]
}
```

**Response** (201):
```json
{
  "success": true,
  "shipmentId": "SHIP-1234567890",
  "orderId": "GE-20260215001",
  "barcode": "3S123456789NL",
  "trackingUrl": "https://track.postnl.nl/3S123456789NL",
  "carrier": "PostNL",
  "estimatedDelivery": "2026-02-18"
}
```

**Error Response** (400):
```json
{
  "error": "Missing address fields: postcode, city"
}
```

**Postcode Format**: XXXX AB (4 digits, space, 2 letters)

---

#### GET /api/shipment?orderId=ID
Track shipment status.

**Response** (200):
```json
{
  "barcode": "3S123456789NL",
  "status": "in_transit",
  "statusLabel": "Onderweg",
  "carrier": "PostNL",
  "trackingUrl": "https://track.postnl.nl/3S123456789NL",
  "lastUpdate": "2026-02-15T10:30:00.000Z"
}
```

**Possible statuses**:
- `pending` - In voorbereiding
- `picked_up` - Opgehaald
- `in_transit` - Onderweg
- `delivered` - Bezorgd

**Cache**: 5 minutes

---

### 5. Admin Dashboard

**GET `/api/admin/dashboard`** - Dashboard overview
**Requires**: Bearer token authentication

#### GET /api/admin/dashboard
Get admin dashboard data including orders, revenue, and inventory status.

**Request**:
```
GET /api/admin/dashboard
Authorization: Bearer <ADMIN_API_TOKEN>
```

**Response** (200):
```json
{
  "overview": {
    "totalOrders": 0,
    "revenue": "€0.00",
    "averageOrderValue": "€0.00",
    "pendingOrders": 0
  },
  "recentOrders": [],
  "inventory": {
    "totalProducts": 118,
    "lowStock": [],
    "outOfStock": []
  },
  "performance": {
    "views": 0,
    "conversions": 0,
    "conversionRate": "0%"
  },
  "lastUpdated": "2026-02-15T12:00:00.000Z"
}
```

**Error Response** (401):
```json
{
  "error": "Unauthorized"
}
```

**Cache**: 5 minutes (private)

---

### 6. Admin Inventory

**GET `/api/admin/inventory?sku=SKU`** - Get inventory
**PATCH `/api/admin/inventory`** - Update inventory
**Requires**: Bearer token authentication

#### GET /api/admin/inventory?sku=SKU
Get inventory status for a specific product.

**Response** (200):
```json
{
  "sku": "DS-001",
  "stock": 5,
  "reserved": 1,
  "available": 4,
  "reorderLevel": 2,
  "lastUpdated": "2026-02-15T12:00:00.000Z"
}
```

**Cache**: 1 minute

---

#### PATCH /api/admin/inventory
Update inventory stock for a product.

**Request**:
```json
{
  "sku": "DS-001",
  "stock": 10
}
```

**Response** (200):
```json
{
  "success": true,
  "sku": "DS-001",
  "stock": 10,
  "updatedAt": "2026-02-15T12:00:00.000Z"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid auth token |
| 405 | Method Not Allowed - Wrong HTTP method |
| 500 | Internal Server Error - Server error |

---

## Headers

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token> (admin endpoints only)
```

### Response Headers
```
Content-Type: application/json; charset=utf-8
Cache-Control: <caching policy>
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

## Performance & Caching

### Cache Strategies by Endpoint
- **Mollie**: No cache (real-time)
- **Discount validation**: 5-10 minutes
- **Newsletter**: No cache (real-time)
- **Shipment creation**: No cache (real-time)
- **Shipment tracking**: 5 minutes
- **Admin Dashboard**: 5 minutes
- **Admin Inventory**: 1 minute

### Middleware Features
- Request logging with timing
- IP tracking for rate limiting (future)
- Security headers on all responses
- gzip compression ready

---

## Rate Limiting (Future Implementation)

Recommended rate limits:
- Mollie payments: 100 requests/hour per IP
- Newsletter signup: 5 requests/hour per IP
- Discount validation: 50 requests/minute per IP
- Admin endpoints: 200 requests/minute per token

---

## Error Handling

All endpoints include standardized error handling:

**Structure**:
```json
{
  "error": "Description of error",
  "details": "Additional context (optional)"
}
```

**Common errors**:
- Invalid JSON format
- Missing required fields
- Invalid field values
- Unauthorized access
- Server errors

---

## Development Notes

### Testing Endpoints

```bash
# Newsletter signup
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Discount validation
curl -X POST http://localhost:3000/api/discount \
  -H "Content-Type: application/json" \
  -d '{"code":"GE-TEST01","subtotal":100.00}'

# Admin dashboard (with token)
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer your-token"
```

### Environment Variables

```env
ADMIN_API_TOKEN=your-secure-admin-token
MOLLIE_API_KEY=your-mollie-test-key (production)
NETLIFY_BLOB_STORE=gameshop-orders (for production blob storage)
```

---

## TODO: Production Integration

- [ ] Mollie API integration (actual payments)
- [ ] Netlify Blobs for data storage
- [ ] Email sending via Nodemailer + Gmail SMTP
- [ ] Database integration for orders and inventory
- [ ] Rate limiting middleware
- [ ] Request validation middleware
- [ ] Admin authentication with JWT
- [ ] PostNL API integration
- [ ] Monitoring and analytics
- [ ] API versioning (v1, v2, etc.)

---

**Last Updated**: 2026-02-15
**API Version**: 1.0.0
**Framework**: Next.js 15.5
