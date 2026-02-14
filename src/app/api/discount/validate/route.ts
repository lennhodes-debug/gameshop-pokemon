import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

const DISCOUNT_STORE = 'gameshop-discounts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Geen code opgegeven' });
    }

    const store = getStore(DISCOUNT_STORE);

    let codes: Record<string, { email: string; used: boolean; createdAt: string }> = {};
    try {
      const existing = await store.get('newsletter-codes', { type: 'json' });
      if (existing && typeof existing === 'object') {
        codes = existing as typeof codes;
      }
    } catch {
      return NextResponse.json({ valid: false, message: 'Ongeldige kortingscode' });
    }

    const codeData = codes[code];
    if (!codeData) {
      return NextResponse.json({ valid: false, message: 'Ongeldige kortingscode' });
    }

    if (codeData.used) {
      return NextResponse.json({ valid: false, message: 'Deze code is al gebruikt' });
    }

    return NextResponse.json({
      valid: true,
      type: 'percentage',
      value: 10,
      description: '10% nieuwsbriefkorting',
      message: '10% nieuwsbriefkorting toegepast!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Validatie mislukt';
    console.error('Discount validate error:', message);
    return NextResponse.json({ valid: false, message });
  }
}
