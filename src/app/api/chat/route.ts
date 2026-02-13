import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// Build compact product catalog for context
function buildCatalog(): string {
  const platforms: Record<string, { count: number; priceRange: string; examples: string[] }> = {};

  productsData.forEach((p: { platform: string; price: number; name: string; sku: string; condition: string }) => {
    if (!platforms[p.platform]) {
      platforms[p.platform] = { count: 0, priceRange: '', examples: [] };
    }
    platforms[p.platform].count++;
    if (platforms[p.platform].examples.length < 5) {
      platforms[p.platform].examples.push(`${p.name} (${p.sku}) - €${p.price.toFixed(2)} [${p.condition}]`);
    }
  });

  Object.keys(platforms).forEach(key => {
    const prices = productsData.filter((p: { platform: string }) => p.platform === key).map((p: { price: number }) => p.price);
    platforms[key].priceRange = `€${Math.min(...prices).toFixed(2)} - €${Math.max(...prices).toFixed(2)}`;
  });

  return Object.entries(platforms)
    .map(([name, info]) => `${name} (${info.count} games, ${info.priceRange}):\n${info.examples.map(e => `  - ${e}`).join('\n')}`)
    .join('\n\n');
}

const SYSTEM_PROMPT = `Je bent Beertje 🐻, de vrolijke en behulpzame mascotte van Gameshop Enter — dé Nintendo specialist van Nederland.

## Wie je bent
- Een schattige, enthousiaste beer die van Nintendo games houdt
- Je spreekt Nederlands (informeel, vriendelijk, met af en toe een emoji)
- Je bent behulpzaam, geduldig en kent alles over de winkel
- Houd antwoorden kort en to-the-point (max 3-4 zinnen tenzij details nodig zijn)
- Gebruik NOOIT Engelse woorden als er een Nederlands alternatief is

## Over Gameshop Enter
- Eigenaar: Lenn Hodes
- Email: gameshopenter@gmail.com
- Instagram: @gameshopenter
- 5.0 score uit 1.360+ reviews, 3.000+ tevreden klanten
- Verzending: €4,95 via PostNL (1-3 werkdagen), GRATIS boven €100
- Retour: 14 dagen, gratis retourneren
- Betaling: iDEAL, Creditcard, PayPal, Bancontact, Apple Pay
- Alle games zijn 100% origineel, persoonlijk getest met eigen foto's
- Games verkopen/inkoop is mogelijk — verwijs naar /inkoop pagina

## Productcatalogus (${productsData.length} producten)
${buildCatalog()}

## Zoekgedrag
Als een klant naar een specifiek product zoekt, zoek dan in de catalogus hierboven. Noem de exacte naam, SKU, prijs en conditie. Verwijs naar /shop/[SKU] voor de productpagina.

## Pagina's om naar te verwijzen
- /shop — Alle games bekijken
- /shop?q=ZOEKTERM — Zoeken in de shop
- /inkoop — Games verkopen / inkoopprijzen
- /over-ons — Over Gameshop Enter
- /faq — Veelgestelde vragen
- /contact — Contactformulier
- /winkelwagen — Winkelwagen
- /retourbeleid — Retourbeleid
- /privacybeleid — Privacybeleid

## Belangrijke regels
- Als je het antwoord niet weet, zeg dat eerlijk en verwijs naar het contactformulier
- Geef NOOIT kortingscodes of beloftes over prijzen
- Verdicht geen producten — noem alleen games uit de catalogus hierboven
- Bij technische vragen over games, geef je beste advies maar verwijs ook naar de productpagina`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!ANTHROPIC_KEY) {
      return NextResponse.json({ error: 'API key niet geconfigureerd' }, { status: 500 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Geen berichten' }, { status: 400 });
    }

    // Rate limiting: max 20 messages per conversation
    if (messages.length > 40) {
      return NextResponse.json({
        reply: 'We hebben al een heel gesprek gehad! 🐻 Start een nieuw gesprek of neem contact op via ons contactformulier voor meer hulp.',
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10), // Only send last 10 messages for context
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      return NextResponse.json({ error: 'AI service niet beschikbaar' }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, ik kon geen antwoord genereren. Probeer het opnieuw!';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
