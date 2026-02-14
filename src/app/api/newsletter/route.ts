import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { sendNewsletterWelcome } from '@/lib/email';

const STORE_NAME = 'gameshop-newsletter';
const DISCOUNT_STORE = 'gameshop-discounts';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GE-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    const store = getStore(STORE_NAME);
    const discountStore = getStore(DISCOUNT_STORE);

    // Bestaande abonnees ophalen
    let subscribers: Record<string, string> = {};
    try {
      const existing = await store.get('subscribers', { type: 'json' });
      if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
        subscribers = existing as Record<string, string>;
      } else if (Array.isArray(existing)) {
        // Migreer oud formaat (array) naar nieuw formaat (object met codes)
        for (const e of existing) {
          subscribers[e] = '';
        }
      }
    } catch {
      // Eerste keer
    }

    // Check of al aangemeld
    if (subscribers[email]) {
      return NextResponse.json({
        success: true,
        message: 'Je bent al aangemeld! Check je inbox voor je kortingscode.',
        alreadySubscribed: true,
      });
    }

    // Unieke code genereren
    const discountCode = generateCode();

    // Code opslaan in discount store
    let codes: Record<string, { email: string; used: boolean; createdAt: string }> = {};
    try {
      const existing = await discountStore.get('newsletter-codes', { type: 'json' });
      if (existing && typeof existing === 'object') {
        codes = existing as typeof codes;
      }
    } catch {
      // Eerste keer
    }

    codes[discountCode] = {
      email,
      used: false,
      createdAt: new Date().toISOString(),
    };
    await discountStore.setJSON('newsletter-codes', codes);

    // Abonnee opslaan met code
    subscribers[email] = discountCode;
    await store.setJSON('subscribers', subscribers);

    // Welkomstmail sturen met unieke kortingscode
    await sendNewsletterWelcome({ to: email, discountCode });

    return NextResponse.json({
      success: true,
      discountCode,
      message: 'Je bent aangemeld! Check je inbox voor je persoonlijke kortingscode.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Aanmelding mislukt';
    console.error('Newsletter subscribe error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
