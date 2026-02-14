import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { stockUpdateSchema, stockBulkSchema } from '@/lib/validation';

const STORE_NAME = 'gameshop-stock';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return authHeader === `Bearer ${adminPassword}`;
}

// GET: Haal alle voorraad op
export async function GET(request: NextRequest) {
  try {
    const store = getStore(STORE_NAME);
    const stockData = await store.get('stock', { type: 'json' });
    return NextResponse.json(stockData || {});
  } catch {
    // Fallback: lege voorraad (alles beschikbaar)
    return NextResponse.json({});
  }
}

// POST: Update voorraad voor een product
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = stockUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'SKU is verplicht' }, { status: 400 });
    }

    const { sku, stock, action } = parsed.data;

    const store = getStore(STORE_NAME);
    let stockData: Record<string, number> = {};

    try {
      const existing = await store.get('stock', { type: 'json' });
      if (existing && typeof existing === 'object') {
        stockData = existing as Record<string, number>;
      }
    } catch {
      // Eerste keer, lege data
    }

    if (action === 'increment') {
      stockData[sku] = (stockData[sku] ?? 1) + 1;
    } else if (action === 'decrement') {
      stockData[sku] = Math.max(0, (stockData[sku] ?? 1) - 1);
    } else if (typeof stock === 'number') {
      stockData[sku] = Math.max(0, stock);
    }

    await store.setJSON('stock', stockData);

    return NextResponse.json({ sku, stock: stockData[sku] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Voorraad update mislukt';
    console.error('Stock update error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Bulk update voorraad
export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = stockBulkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'stockUpdates object is verplicht' }, { status: 400 });
    }

    const { stockUpdates } = parsed.data;

    const store = getStore(STORE_NAME);
    let stockData: Record<string, number> = {};

    try {
      const existing = await store.get('stock', { type: 'json' });
      if (existing && typeof existing === 'object') {
        stockData = existing as Record<string, number>;
      }
    } catch {
      // Lege data
    }

    for (const [sku, stock] of Object.entries(stockUpdates)) {
      stockData[sku] = Math.max(0, stock as number);
    }

    await store.setJSON('stock', stockData);

    return NextResponse.json({ updated: Object.keys(stockUpdates).length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bulk update mislukt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
