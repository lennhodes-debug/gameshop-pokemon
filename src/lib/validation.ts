import { z } from 'zod';

// ─── Checkout / Mollie ──────────────────────────────────────

export const checkoutItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive().max(10),
  price: z.number().positive(),
});

export const checkoutCustomerSchema = z.object({
  voornaam: z.string().min(1).max(100),
  achternaam: z.string().min(1).max(100),
  email: z.string().email(),
  straat: z.string().min(1).max(200),
  huisnummer: z.string().min(1).max(20),
  postcode: z.string().regex(/^[0-9]{4}\s?[a-zA-Z]{2}$/, 'Ongeldige postcode'),
  plaats: z.string().min(1).max(100),
  betaalmethode: z.enum(['ideal', 'creditcard', 'paypal', 'bancontact', 'applepay']).optional(),
  opmerkingen: z.string().max(1000).optional().default(''),
});

export const createPaymentSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customer: checkoutCustomerSchema,
  shipping: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  discountCode: z.string().optional().default(''),
  total: z.number().positive(),
});

// ─── Newsletter ─────────────────────────────────────────────

export const newsletterSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres').max(254),
});

// ─── Discount ───────────────────────────────────────────────

export const discountValidateSchema = z.object({
  code: z.string().min(1, 'Geen code opgegeven').max(20).transform(v => v.trim().toUpperCase()),
});

export const discountRedeemSchema = z.object({
  code: z.string().min(1).max(20).transform(v => v.trim().toUpperCase()),
  orderNumber: z.string().optional().default(''),
});

// ─── Stock ──────────────────────────────────────────────────

export const stockUpdateSchema = z.object({
  sku: z.string().min(1),
  action: z.enum(['increment', 'decrement']).optional(),
  stock: z.number().int().min(0).optional(),
});

export const stockBulkSchema = z.object({
  stockUpdates: z.record(z.string(), z.number().int().min(0)),
});

// ─── Shipment ───────────────────────────────────────────────

export const shipmentCustomerSchema = z.object({
  voornaam: z.string().min(1),
  achternaam: z.string().min(1),
  email: z.string().email().optional(),
  straat: z.string().min(1),
  huisnummer: z.string().min(1),
  postcode: z.string().min(4),
  plaats: z.string().min(1),
});

export const createShipmentSchema = z.object({
  orderNumber: z.string().min(1),
  customer: shipmentCustomerSchema,
  items: z.array(z.object({
    name: z.string().optional(),
    quantity: z.number().int().positive().optional().default(1),
    price: z.number().optional().default(0),
    weight: z.number().optional(),
  })).optional().default([]),
});
