import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { sendNewsletterWelcome } from '@/lib/email';

const STORE_NAME = 'gameshop-newsletter';
const DISCOUNT_CODE = 'BRIEF10';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    const store = getStore(STORE_NAME);

    // Bestaande abonnees ophalen
    let subscribers: string[] = [];
    try {
      const existing = await store.get('subscribers', { type: 'json' });
      if (Array.isArray(existing)) {
        subscribers = existing;
      }
    } catch {
      // Eerste keer
    }

    // Check of al aangemeld
    if (subscribers.includes(email)) {
      return NextResponse.json({
        success: true,
        message: 'Je bent al aangemeld voor de nieuwsbrief!',
        alreadySubscribed: true,
      });
    }

    // Toevoegen
    subscribers.push(email);
    await store.setJSON('subscribers', subscribers);

    // Welkomstmail sturen met kortingscode
    await sendNewsletterWelcome({ to: email, discountCode: DISCOUNT_CODE });

    return NextResponse.json({
      success: true,
      message: 'Je bent aangemeld! Check je inbox voor je 10% kortingscode.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Aanmelding mislukt';
    console.error('Newsletter subscribe error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
