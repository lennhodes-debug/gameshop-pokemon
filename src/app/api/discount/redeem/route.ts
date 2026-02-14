import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

const DISCOUNT_STORE = 'gameshop-discounts';

// Interne route — wordt aangeroepen door de Mollie webhook na betaling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false });
    }

    const store = getStore(DISCOUNT_STORE);

    let codes: Record<string, { email: string; used: boolean; createdAt: string; usedAt?: string; orderNumber?: string }> = {};
    try {
      const existing = await store.get('newsletter-codes', { type: 'json' });
      if (existing && typeof existing === 'object') {
        codes = existing as typeof codes;
      }
    } catch {
      return NextResponse.json({ success: false });
    }

    if (!codes[code]) {
      return NextResponse.json({ success: false, message: 'Code niet gevonden' });
    }

    // Markeer als gebruikt
    codes[code].used = true;
    codes[code].usedAt = new Date().toISOString();
    codes[code].orderNumber = body.orderNumber || '';

    await store.setJSON('newsletter-codes', codes);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Redeem mislukt';
    console.error('Discount redeem error:', message);
    return NextResponse.json({ success: false, message });
  }
}
