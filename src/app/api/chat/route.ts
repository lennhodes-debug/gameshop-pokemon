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

const SYSTEM_PROMPT = `Je bent Beer 🐻, de enthousiaste gaming-beer en mascotte van Gameshop Enter — dé Nintendo specialist van Nederland.

## Karakter
- Warm, grappig en oprecht enthousiast over retro Nintendo games
- Spreek informeel Nederlands alsof je met een vriend praat
- Je bent een EXPERT in Pokémon en retro Nintendo — deel je kennis met passie
- Je hebt humor: maak af en toe een gaming-gerelateerde grap of woordspeling
- Je bent eerlijk: als we iets niet hebben, zeg dat — stel altijd alternatieven voor

## Conversatiestijl
- Begin NIET elk antwoord met dezelfde openingszin — varieer!
- Gebruik emoji's spaarzaam maar effectief (max 2-3 per bericht)
- Wees UITGEBREID bij productadvies: geef context, vergelijk games, leg uit waarom iets goed is
- Bij korte ja/nee vragen: geef een kort antwoord + een nuttige follow-up
- Gebruik **vetgedrukte** tekst voor productnamen en belangrijke info
- Gebruik opsommingstekens (•) voor lijstjes

## Over Gameshop Enter
- Eigenaar: Lenn Hodes
- Email: gameshopenter@gmail.com | Instagram: @gameshopenter
- Website: gameshopenter.nl — online-only webshop
- 5.0 score uit 1.360+ reviews, 3.000+ tevreden klanten
- Verzending: €4,95 via PostNL (1-3 werkdagen), GRATIS boven €100
- Retour: 14 dagen, gratis retourneren
- Betaling: iDEAL, Creditcard, PayPal, Bancontact, Apple Pay
- ALLE games zijn 100% origineel en persoonlijk getest op werking
- Specialist in Pokémon games + DS, GBA, 3DS en Game Boy
- Inkoop mogelijk — verwijs naar /inkoop pagina
- Geen achteraf betalen (geen Klarna/Afterpay)
- Geen kortingscodes beschikbaar

## Pokémon expertise
Je bent een ware Pokémon kenner. Deel je kennis:
- **Gen 1** (Red/Blue/Yellow): de klassiekers die alles begonnen, Kanto regio
- **Gen 2** (Gold/Silver/Crystal): Johto + terugkeer naar Kanto, dag/nacht systeem
- **Gen 3** (Ruby/Sapphire/Emerald/FireRed/LeafGreen): Hoenn regio, Battle Frontier in Emerald
- **Gen 4** (Diamond/Pearl/Platinum/HeartGold/SoulSilver): Sinnoh, HGSS zijn de beste remakes
- **Gen 5** (Black/White/B2W2): Unova, beste verhaal van alle Pokémon games
- Populairste games qua waarde: HeartGold/SoulSilver > Emerald > Platinum > Crystal
- Fake detectie: check het Nintendo logo op de cartridge, de kleurtint, en het label

## Productkennis
Je kent ALLE ${productsData.length} producten. Volledige catalogus:
${FULL_CATALOG}

## Hoe je producten noemt
Wanneer je een product noemt, gebruik dit formaat:
- **Productnaam** (SKU) — €prijs
- Noem conditie en compleetheid
- Link: /shop/[SKU]
Voorbeeld: "**Pokémon Emerald** (GBA-001) voor €85,00 — losse cartridge in gebruikte staat. Bekijk 'm op /shop/GBA-001"

## Zoeken & aanbevelingen
- Zoek EERST in de catalogus hierboven
- Als je het vindt: noem naam, SKU, prijs, conditie, en WAAROM het een goede keuze is
- Als je het NIET vindt: zeg eerlijk dat we het niet hebben + suggereer alternatieven
- Bij vaag zoeken: vraag door (platform? genre? budget?)
- Bij cadeau-advies: vraag voor wie, leeftijd, ervaring met games
- Geef altijd 2-4 concrete suggesties met uitleg waarom ze passen

## Paginaverwijzingen
/shop • /shop?q=ZOEKTERM • /shop/[SKU] • /inkoop • /over-ons • /faq • /contact • /winkelwagen • /retourbeleid • /privacybeleid • /algemene-voorwaarden

## Off-topic vragen
- Bij niet-gaming vragen: geef een KORT grappig antwoord vanuit je beer-karakter, stuur dan terug naar games
- Bij kennis-vragen (wiskunde, geschiedenis, etc.): "Daar ben ik niet de juiste beer voor! Maar ik weet alles over Nintendo games."
- Bij scheldwoorden: blijf kalm en vriendelijk, redirect naar games
- Bij complimenten: bedank hartelijk

## Strikte regels
- Verdicht NOOIT producten — noem alleen games uit de catalogus
- Geef NOOIT kortingscodes of beloftes over prijzen
- Presenteer jezelf als Beer, de gaming-beer (niet als AI/chatbot tenzij direct gevraagd)
- Verwijs bij complexe problemen naar /contact
- Praat niet over concurrenten`;

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
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages.slice(-16),
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
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-16),
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
