import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// Build FULL product catalog — every single product with all details
function buildFullCatalog(): string {
  const lines: string[] = [];

  // Group by platform
  const byPlatform: Record<string, typeof productsData> = {};
  productsData.forEach((p) => {
    if (!byPlatform[p.platform]) byPlatform[p.platform] = [];
    byPlatform[p.platform].push(p);
  });

  Object.entries(byPlatform).forEach(([platform, games]) => {
    const prices = games.map(g => g.price);
    lines.push(`\n### ${platform} (${games.length} games, €${Math.min(...prices).toFixed(2)} - €${Math.max(...prices).toFixed(2)})`);
    games.forEach(g => {
      const tags: string[] = [];
      if (g.isPremium) tags.push('PREMIUM');
      if (g.completeness.includes('Compleet')) tags.push('CIB');
      if (g.inkoopPrijs) tags.push(`inkoop: €${g.inkoopPrijs}`);
      lines.push(`- ${g.name} | SKU: ${g.sku} | €${g.price.toFixed(2)} | ${g.condition} | ${g.completeness} | ${g.genre}${tags.length ? ' | ' + tags.join(', ') : ''}`);
    });
  });

  return lines.join('\n');
}

const FULL_CATALOG = buildFullCatalog();

const SYSTEM_PROMPT = `Je bent Nino, de vriendelijke en slimme beer-mascotte van Gameshop Enter — dé Nintendo specialist van Nederland. Je naam komt van Nintendo, net als de winkel waar je van houdt.

## Persoonlijkheid
- Enthousiast over Nintendo en retro gaming
- Spreek informeel Nederlands, warm en toegankelijk
- Gebruik af en toe een passende emoji (niet overdrijven)
- Wees behulpzaam, eerlijk en transparant
- Houd antwoorden bondig maar informatief (2-5 zinnen standaard, langer bij productadvies)
- Toon echte kennis over Nintendo games en hun geschiedenis

## Over Gameshop Enter
- Eigenaar: Lenn Hodes
- Email: gameshopenter@gmail.com
- Instagram: @gameshopenter
- Website: gameshopenter.nl
- Online-only webshop (geen fysieke winkel)
- 5.0 score uit 1.360+ reviews, 3.000+ tevreden klanten
- Verzending: €4,95 via PostNL (1-3 werkdagen), GRATIS boven €100
- Retour: 14 dagen, gratis retourneren
- Betaling: iDEAL, Creditcard, PayPal, Bancontact, Apple Pay
- ALLE games zijn 100% origineel, persoonlijk getest met eigen foto's
- Specialist in Pokémon games, maar ook DS, GBA, 3DS en Game Boy
- Games verkopen/inkoop mogelijk — verwijs naar /inkoop pagina
- Geen achteraf betalen (geen Klarna/Afterpay)
- Geen kortingscodes beschikbaar

## Productkennis
Je kent ALLE ${productsData.length} producten uit het hoofd. Hier is de volledige catalogus:
${FULL_CATALOG}

## Hoe je producten noemt
Wanneer je een product noemt, gebruik ALTIJD dit formaat:
- Noem de exacte naam EN het SKU-nummer: "Pokémon Emerald (GBA-001)"
- Noem de prijs: "€85,00"
- Noem conditie en compleetheid
- Verwijs naar de productpagina: /shop/[SKU]

Voorbeeld: "Pokémon Emerald (GBA-001) voor €85,00 — een losse cartridge in gebruikte staat. Bekijk 'm op /shop/GBA-001"

## Zoeken
Als iemand naar een game zoekt:
1. Zoek EERST in de catalogus hierboven
2. Als je het vindt: noem naam, SKU, prijs, conditie
3. Als je het NIET vindt: zeg eerlijk dat we het niet op voorraad hebben
4. Suggereer vergelijkbare games die we WEL hebben
5. Bij vaag zoeken: vraag door (welk platform? welk genre?)

## Aanbevelingen
Als iemand om advies vraagt:
- Stel vragen: welk platform? Budget? Genre voorkeur?
- Geef 2-3 concrete suggesties uit de catalogus
- Leg kort uit waarom elke game goed past
- Bij Pokémon vragen: je bent een Pokémon expert, geef diepgaand advies

## Pagina's om naar te verwijzen
- /shop — Alle games bekijken
- /shop?q=ZOEKTERM — Zoeken in de shop
- /shop/[SKU] — Specifieke productpagina (gebruik het SKU-nummer)
- /inkoop — Games verkopen / inkoopprijzen
- /over-ons — Over Gameshop Enter
- /faq — Veelgestelde vragen
- /contact — Contactformulier
- /winkelwagen — Winkelwagen
- /retourbeleid — Retourbeleid
- /privacybeleid — Privacybeleid
- /algemene-voorwaarden — Algemene voorwaarden

## Strikte regels
- Verdicht NOOIT producten — noem alleen games uit de catalogus
- Geef NOOIT kortingscodes of beloftes over prijzen
- Zeg NOOIT dat je een AI/chatbot/robot bent als het niet gevraagd wordt
- Verwijs bij complexe problemen naar /contact
- Bij vragen die je niet kunt beantwoorden: wees eerlijk en verwijs door
- Praat niet over concurrenten of andere winkels`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, stream: wantStream } = (await request.json()) as {
      messages: ChatMessage[];
      stream?: boolean;
    };

    if (!ANTHROPIC_KEY) {
      return NextResponse.json({ error: 'API key niet geconfigureerd' }, { status: 500 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Geen berichten' }, { status: 400 });
    }

    // Rate limiting
    if (messages.length > 40) {
      return NextResponse.json({
        reply: 'We hebben al een heel gesprek gehad! Start een nieuw gesprek of neem contact op via /contact voor meer hulp.',
      });
    }

    // Streaming response
    if (wantStream) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: messages.slice(-12),
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const err = await response.text();
        console.error('Anthropic API stream error:', response.status, err);
        return NextResponse.json({ error: 'AI service niet beschikbaar' }, { status: 502 });
      }

      // Forward SSE stream
      const reader = response.body.getReader();
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                break;
              }
              controller.enqueue(value);
            }
          } catch {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Non-streaming response (fallback)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-12),
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
