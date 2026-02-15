# Gameshop Enter API Documentatie

## Base URL

```
Development: http://localhost:3000/api
Production: https://gameshopenter.nl/api
```

## Payment APIs (Mollie)

### Create Payment
**POST** `/mollie/create-payment`

Maakt een nieuwe betaling aan voor checkout.

**Request Body:**
```json
{
  "amount": {
    "currency": "EUR",
    "value": "45.00"
  },
  "description": "Bestelling GE-ABC123",
  "redirectUrl": "https://gameshopenter.nl/afrekenen/status",
  "webhookUrl": "https://gameshopenter.nl/api/mollie/webhook",
  "metadata": {
    "orderNumber": "GE-ABC123"
  }
}
```

**Response:**
```json
{
  "id": "tr_1234567890",
  "status": "open",
  "amount": { "currency": "EUR", "value": "45.00" },
  "checkoutUrl": "https://www.mollie.com/checkout/select-method/tr_1234567890",
  "createdAt": "2025-02-15T10:30:00Z",
  "expiresAt": "2025-02-15T10:45:00Z"
}
```

### Check Payment Status
**GET** `/mollie/status?paymentId=tr_1234567890`

Controleert de status van een betaling.

**Response:**
```json
{
  "id": "tr_1234567890",
  "status": "paid",
  "isPaid": true,
  "amount": { "currency": "EUR", "value": "45.00" }
}
```

**Status Values:**
- `open` - Betaling nog niet gestart
- `pending` - Betaling in uitvoering
- `paid` - Betaling succesvol
- `failed` - Betaling mislukt
- `cancelled` - Betaling geannuleerd
- `expired` - Betaling verlopen

### Webhook
**POST** `/mollie/webhook`

Ontvangt status updates van Mollie.

---

## Order APIs

### Create Order
**POST** `/orders/create`

Maakt een nieuwe bestelling aan na betaling.

**Request Body:**
```json
{
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
  "paymentMethod": "ideal",
  "molliePaymentId": "tr_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "orderNumber": "GE-1739591234ABC",
  "order": {
    "orderNumber": "GE-1739591234ABC",
    "status": "pending",
    "createdAt": "2025-02-15T10:35:00Z"
  }
}
```

---

## Inventory APIs

### Get Product Inventory
**GET** `/inventory?sku=3DS-001`

Haalt voorraadinformatie op voor een product.

**Response:**
```json
{
  "sku": "3DS-001",
  "stock": 5,
  "reserved": 1,
  "available": 4,
  "condition": "Gebruikt",
  "location": "A-12",
  "lastUpdated": "2025-02-15T10:00:00Z"
}
```

### Get All Inventory
**GET** `/inventory`

Haalt alle voorraadinformatie op.

---

## Reviews APIs

### Submit Review
**POST** `/reviews/submit`

Dient een review in voor een product.

**Request Body:**
```json
{
  "sku": "3DS-001",
  "rating": 5,
  "title": "Geweldig product!",
  "comment": "De cartridge werkt perfect en is goed ingepakt geweest. Aanrader!",
  "author": "Jan Jansen",
  "email": "jan@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dank je wel voor je review! We controleren deze voordat deze wordt gepubliceerd.",
  "reviewId": "review_1739591234567"
}
```

### Get Product Reviews
**GET** `/reviews/get?sku=3DS-001`

Haalt alle goedgekeurde reviews op voor een product.

**Response:**
```json
{
  "sku": "3DS-001",
  "reviews": [
    {
      "id": "review_1739591234567",
      "sku": "3DS-001",
      "rating": 5,
      "title": "Geweldig product!",
      "comment": "De cartridge werkt perfect...",
      "author": "Jan Jansen",
      "createdAt": "2025-02-15T10:35:00Z"
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 12,
  "ratingDistribution": {
    "5": 10,
    "4": 2,
    "3": 0,
    "2": 0,
    "1": 0
  }
}
```

---

## Wishlist APIs

### Sync Wishlist
**POST** `/wishlist/sync`

Synchroniseert de wenslijst van de klant.

**Request Body:**
```json
{
  "items": [
    {
      "sku": "3DS-001",
      "addedAt": "2025-02-15T10:00:00Z"
    },
    {
      "sku": "DS-005",
      "addedAt": "2025-02-14T15:30:00Z"
    }
  ],
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wishlist opgeslagen",
  "itemCount": 2
}
```

---

## Email APIs

### Send Order Confirmation
**POST** `/email/order-confirmation`

Stuurt een bevestigingsemail na checkout.

### Send Newsletter Welcome
**POST** `/email/welcome`

Stuurt een welkomstemail met kortingscode.

### Send Abandoned Cart Email
**POST** `/email/abandoned-cart`

Stuurt een herinnering voor verlaten winkelwagen.

---

## Admin APIs

### Dashboard
**GET** `/admin/dashboard`

Headers Required:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Haalt dashboardstatistieken op.

**Response:**
```json
{
  "stats": {
    "totalOrders": 42,
    "totalRevenue": 1250.50,
    "pendingOrders": 3,
    "completedOrders": 39,
    "averageOrderValue": 29.77
  },
  "recentOrders": [],
  "topProducts": [],
  "inventory": {
    "totalItems": 34,
    "lowStockItems": 2
  }
}
```

---

## Error Responses

Alle endpoints geven error responses in dit format:

```json
{
  "error": "Beschrijving van de fout",
  "details": ["detail 1", "detail 2"]
}
```

**HTTP Status Codes:**
- `400` - Bad Request (validatiefout)
- `401` - Unauthorized (ontbrekende auth)
- `403` - Forbidden (onvoldoende rechten)
- `404` - Not Found
- `500` - Internal Server Error

---

## Development vs Production

### Development Mode
- Mollie payments simuleren met random statussen
- Emails loggen naar console
- Geen echte database/blob storage

### Production Mode
- Mollie API calls met MOLLIE_API_KEY
- Echte emails via SMTP
- Data opgeslagen in Netlify Blobs

---

## Environment Variables

```bash
# Mollie
MOLLIE_API_KEY=test_or_live_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
GMAIL_USER=gameshopenter@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Admin
ADMIN_TOKEN=your-secret-token

# Google Analytics
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
```

---

## Rate Limits

Momenteel geen rate limiting. In productie toevoegen:
- 100 requests/minuut per IP voor public endpoints
- 1000 requests/minuut voor authenticated endpoints
