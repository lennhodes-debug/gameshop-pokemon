'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import products from '@/data/products.json';

// ─── Types ──────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  links?: { label: string; href: string }[];
  products?: typeof products[number][];
  quickReplies?: string[];
  isStreaming?: boolean;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Quick Replies ──────────────────────────────────────────
const INITIAL_QUICK_REPLIES = [
  'Welke Pokémon games hebben jullie?',
  'Wat zijn de verzendkosten?',
  'Ik wil games verkopen',
  'Zijn alle games origineel?',
  'Hoe kan ik betalen?',
  'Ik zoek een cadeau',
];

const THINKING_PHRASES = [
  'Even denken...',
  'Ik zoek het op...',
  'Momentje...',
  'Ik check het even...',
  'Even kijken...',
  'Beer denkt na...',
];

// ─── Product search helper ──────────────────────────────────
function searchProducts(query: string, limit = 6): typeof products[number][] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 1);

  const scored = products.map(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    const platform = p.platform.toLowerCase();
    const desc = p.description?.toLowerCase() || '';
    const genre = p.genre.toLowerCase();
    const sku = p.sku.toLowerCase();

    // Exact matches
    if (name === q) score += 30;
    if (sku === q.toUpperCase()) score += 30;
    if (name.includes(q)) score += 10;

    // Term matching
    terms.forEach(t => {
      if (name.includes(t)) score += 4;
      if (platform.includes(t)) score += 3;
      if (genre.includes(t)) score += 2;
      if (sku.toLowerCase().includes(t)) score += 2;
      if (desc.includes(t)) score += 1;
    });

    // Platform abbreviation matching
    if (/\bgba\b/.test(q) && platform.includes('advance')) score += 6;
    if (/\bds\b/.test(q) && platform.includes('nintendo ds') && !platform.includes('3ds')) score += 6;
    if (/\b3ds\b/.test(q) && platform.includes('3ds')) score += 6;
    if (/\bgb\b/.test(q) && platform.includes('game boy')) score += 5;
    if (/\bgbc\b/.test(q) && platform.includes('game boy')) score += 5;

    // Fuzzy Pokémon matching
    if (/poke|poké|pokemon|pokémon/.test(q) && name.includes('pok')) score += 5;

    // Premium boost for recommendations
    if (p.isPremium && score > 0) score += 0.5;

    return { product: p, score };
  }).filter(s => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.product);
}

// ─── Smart fallback response engine ─────────────────────────
type FallbackResult = {
  text: string;
  products?: typeof products[number][];
  links?: { label: string; href: string }[];
  quickReplies?: string[];
};

function fallbackResponse(input: string): FallbackResult {
  const q = input.toLowerCase().trim();
  const words = q.split(/\s+/);

  // ── Begroetingen ──
  if (/^(hoi|hi|hey|hallo|hello|goedemorgen|goedemiddag|goedenavond|yo|dag|moin|heey|hee|wazzup|sup|ola|ohayo|hola|bonjour|guten tag)\b/.test(q))
    return {
      text: 'Hoi! 👋 Ik ben Beer, de gaming-beer van Gameshop Enter! Ik help je graag met al je vragen over onze Nintendo games, verzending, betaling en meer. Waarmee kan ik je helpen?',
      quickReplies: ['Welke games hebben jullie?', 'Wat zijn de verzendkosten?', 'Vertel over jullie winkel'],
    };

  // ── Afscheid ──
  if (/^(doei|bye|dag|tot ziens|later|fijne dag|slaap lekker|welterusten|tot de volgende|ciao|adios)\b/.test(q))
    return { text: 'Tot ziens! 👋 Bedankt voor je bezoek. Mocht je later nog vragen hebben, ik ben er altijd! Game on!' };

  // ── Bedankt ──
  if (/^(bedankt|thanks|dankje|dankjewel|top|thx|merci|danke|thank you)/.test(q) || /bedankt|dankjewel|thanks/.test(q))
    return { text: 'Graag gedaan! 😊 Nog meer vragen? Ik help je graag verder!', quickReplies: ['Ik wil een game zoeken', 'Hoe werkt verzending?'] };

  // ── Hoe gaat het / small talk ──
  if (/hoe gaat het|hoe is het|hoe gaat ie|alles goed|gaat het|hoe ben je|how are you/.test(q))
    return { text: 'Met mij gaat het altijd goed — ik speel de hele dag games! 🎮 Hoe kan ik je helpen vandaag?', quickReplies: ['Ik zoek een game', 'Vertel over jullie winkel'] };

  if (/wie ben (je|jij)|wat ben (je|jij)|vertel over jezelf|what are you/.test(q))
    return { text: 'Ik ben Beer! 🐻 De gaming-beer en assistent van Gameshop Enter. Ik ken ons hele assortiment van Nintendo games en help je graag met al je vragen — van productadvies tot verzending!' };

  if (/\bbeer\b|pixel|nino|beertje|mascotte/.test(q))
    return { text: 'Dat ben ik! 🐻 Beer, de gaming-beer van Gameshop Enter. Altijd klaar om je te helpen met Nintendo games! Hoe kan ik je helpen?', quickReplies: ['Laat me jullie games zien', 'Hoe bestel ik?'] };

  if (/^(ja|yes|yep|jep|okay|ok|oke|oké|sure|zeker|absoluut|natuurlijk)$/.test(q))
    return { text: 'Top! Wat wil je weten? Ik kan je helpen met games zoeken, verzending, betaling, inkoop en meer.', quickReplies: ['Games zoeken', 'Verzendkosten', 'Hoe bestellen?'] };

  if (/^(nee|nope|nah|neen|no)$/.test(q))
    return { text: 'Geen probleem! Mocht je later toch een vraag hebben, ik ben er altijd. 😊' };

  if (/^(help|hulp)$/.test(q))
    return { text: 'Ik kan je helpen met:\n\n🎮 Games zoeken en advies\n📦 Verzending en levertijden\n💳 Betaalmethoden\n↩️ Retourneren\n💰 Games verkopen (inkoop)\n❓ Veelgestelde vragen\n\nWaar heb je hulp bij nodig?', quickReplies: ['Games zoeken', 'Verzendkosten', 'Retourneren', 'Games verkopen'] };

  // ── Assortiment ──
  if (/welke (games|spellen)|wat (heb|hebben|verkop) jullie|assortiment|collectie|aanbod|hoeveel (games|spellen)|wat voor games|jullie games|shop bekijken|laat.*zien/.test(q)) {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
    return {
      text: `We hebben ${products.length} originele Nintendo games! 🎮\n\n${Object.entries(counts).map(([k, v]) => `• ${k}: ${v} games`).join('\n')}\n\nElke game is persoonlijk getest met eigen foto's.`,
      links: [{ label: 'Bekijk alle games', href: '/shop' }],
      quickReplies: ['Welke Pokémon games?', 'Wat is de duurste game?', 'Goedkoopste games?'],
    };
  }

  // ── Platform zoeken ──
  if (/game\s*boy\s*advance|gba\s*(games)?/.test(q)) {
    const found = products.filter(p => p.platform.toLowerCase().includes('advance'));
    return { text: `We hebben ${found.length} Game Boy Advance games! 🕹️`, products: found.slice(0, 6), links: [{ label: 'Alle GBA games', href: '/shop?q=game+boy+advance' }] };
  }
  if (/nintendo\s*ds\b|nds\b/.test(q) && !/3ds/.test(q)) {
    const found = products.filter(p => p.platform === 'Nintendo DS');
    return { text: `We hebben ${found.length} Nintendo DS games!`, products: found.slice(0, 6), links: [{ label: 'Alle DS games', href: '/shop?q=nintendo+ds' }] };
  }
  if (/3ds/.test(q)) {
    const found = products.filter(p => p.platform.includes('3DS'));
    return { text: `We hebben ${found.length} Nintendo 3DS games!`, products: found.slice(0, 6), links: [{ label: 'Alle 3DS games', href: '/shop?q=3ds' }] };
  }
  if (/game\s*boy(?!\s*advance)|\bgb\b|\bgbc\b|game\s*boy\s*color/.test(q)) {
    const found = products.filter(p => p.platform.toLowerCase().includes('game boy') && !p.platform.toLowerCase().includes('advance'));
    return { text: `We hebben ${found.length} Game Boy games! 🎮`, products: found.slice(0, 6), links: [{ label: 'Alle Game Boy games', href: '/shop?q=game+boy' }] };
  }
  if (/switch|nintendo switch/.test(q))
    return { text: 'We zijn gespecialiseerd in retro Nintendo games — denk aan DS, GBA, 3DS en Game Boy. Switch games hebben we momenteel niet, maar check onze retro collectie!', links: [{ label: 'Bekijk onze shop', href: '/shop' }], quickReplies: ['Welke games hebben jullie?', 'Welke Pokémon games?'] };
  if (/wii\b|gamecube|n64|snes|nes|nintendo 64|super nintendo/.test(q))
    return { text: 'We focussen ons momenteel op handheld games: DS, GBA, 3DS en Game Boy. Check regelmatig terug — ons assortiment groeit!', links: [{ label: 'Bekijk wat we hebben', href: '/shop' }], quickReplies: ['Welke platforms hebben jullie?', 'GBA games?'] };

  // ── Pokémon ──
  if (/pok[eé]mon|pikachu|charizard|mewtwo|eevee/.test(q)) {
    const pokemonGames = products.filter(p => p.name.toLowerCase().includes('pok'));
    if (/welke.*beste|beste.*pokemon|welke.*aanraden|welke.*beginnen/.test(q))
      return { text: `Als Pokémon expert raad ik aan:\n\n🏆 Pokémon HeartGold/SoulSilver — de beste remakes ooit\n⭐ Pokémon Emerald — de ultieme GBA ervaring\n💎 Pokémon Platinum — het beste van Gen 4\n\nHier zijn onze Pokémon games:`, products: pokemonGames.slice(0, 6), links: [{ label: 'Alle Pokémon games', href: '/shop?q=pokemon' }] };
    return {
      text: `Pokémon fan? 🎉 We hebben ${pokemonGames.length} Pokémon games! Van klassieke Game Boy titels tot DS en GBA. Alles 100% origineel en persoonlijk getest.`,
      products: pokemonGames.slice(0, 6),
      links: [{ label: 'Alle Pokémon games', href: '/shop?q=pokemon' }],
      quickReplies: ['Welke is de beste?', 'Zijn ze compleet in doos?', 'Duurste Pokémon game?'],
    };
  }

  // ── Specifieke game franchises ──
  if (/zelda|hyrule|triforce|link/.test(q)) {
    const found = searchProducts('zelda');
    return { text: found.length > 0 ? 'Onze Zelda games:' : 'Helaas geen Zelda games op voorraad momenteel. Kijk regelmatig terug!', products: found.length > 0 ? found : undefined, links: [{ label: 'Zoek Zelda', href: '/shop?q=zelda' }] };
  }
  if (/mario|luigi|peach|bowser|toad/.test(q)) {
    const found = searchProducts('mario');
    return { text: found.length > 0 ? 'Onze Mario games:' : 'Helaas geen Mario games op voorraad momenteel. Kijk regelmatig terug!', products: found.length > 0 ? found : undefined, links: [{ label: 'Zoek Mario', href: '/shop?q=mario' }] };
  }
  if (/kirby|meta knight/.test(q)) {
    const found = searchProducts('kirby');
    return { text: found.length > 0 ? 'Onze Kirby games:' : 'Geen Kirby games op voorraad momenteel.', products: found.length > 0 ? found : undefined, links: [{ label: 'Shop', href: '/shop' }] };
  }
  if (/donkey kong|dk/.test(q)) {
    const found = searchProducts('donkey kong');
    return { text: found.length > 0 ? 'Onze Donkey Kong games:' : 'Geen Donkey Kong games op voorraad momenteel.', products: found.length > 0 ? found : undefined, links: [{ label: 'Shop', href: '/shop' }] };
  }
  if (/metroid|samus/.test(q)) {
    const found = searchProducts('metroid');
    return { text: found.length > 0 ? 'Onze Metroid games:' : 'Geen Metroid games op voorraad momenteel.', products: found.length > 0 ? found : undefined, links: [{ label: 'Shop', href: '/shop' }] };
  }
  if (/fire emblem/.test(q)) {
    const found = searchProducts('fire emblem');
    return { text: found.length > 0 ? 'Onze Fire Emblem games:' : 'Geen Fire Emblem games op voorraad momenteel.', products: found.length > 0 ? found : undefined, links: [{ label: 'Shop', href: '/shop' }] };
  }
  if (/animal crossing/.test(q)) {
    const found = searchProducts('animal crossing');
    return { text: found.length > 0 ? 'Onze Animal Crossing games:' : 'Geen Animal Crossing games op voorraad momenteel.', products: found.length > 0 ? found : undefined, links: [{ label: 'Shop', href: '/shop' }] };
  }

  // ── Verzending ──
  if (/verzend|bezorg|lever|shipping|postnl|pakket|track|trace|wanneer (heb|krijg)|levertijd|hoe lang duurt|wanneer komt|delivery/.test(q))
    return {
      text: '📦 Verzending:\n\n• €4,95 via PostNL\n• GRATIS boven €100\n• Levertijd: 1-3 werkdagen\n• Met track & trace\n• Zorgvuldig verpakt met bubbeltjeswrap',
      quickReplies: ['Verzenden jullie naar België?', 'Hoe werkt retourneren?', 'Gratis verzending?'],
    };

  // ── Gratis verzending ──
  if (/gratis verzend|free shipping|verzending gratis/.test(q))
    return { text: 'Ja! Gratis verzending bij bestellingen boven €100. Onder €100 betaal je €4,95 voor PostNL met track & trace.', quickReplies: ['Premium games bekijken', 'Alle games'] };

  // ── België / internationaal ──
  if (/belgi[ëe]|internationaal|buitenland|europa|duitsland|france|frankrijk/.test(q))
    return { text: 'We verzenden momenteel alleen binnen Nederland via PostNL. Houd onze website in de gaten voor uitbreidingen!', quickReplies: ['Verzendkosten Nederland?', 'Contact opnemen'] };

  // ── Betaling ──
  if (/betal|ideal|creditcard|paypal|afrekenen|bancontact|apple\s*pay|pin|contant|how to pay/.test(q))
    return {
      text: '💳 Betaalmethoden:\n\n• iDEAL (alle banken)\n• Creditcard (Visa, Mastercard)\n• PayPal\n• Bancontact\n• Apple Pay\n\nAlles veilig en versleuteld!',
      links: [{ label: 'Winkelwagen', href: '/winkelwagen' }],
      quickReplies: ['Kan ik achteraf betalen?', 'Is betalen veilig?'],
    };

  // ── Achteraf betalen ──
  if (/achteraf|klarna|afterpay|later betalen|spreiding/.test(q))
    return { text: 'We bieden helaas geen achteraf betalen aan (geen Klarna/Afterpay). Wel kun je betalen met iDEAL, Creditcard, PayPal, Bancontact en Apple Pay.', quickReplies: ['Welke betaalmethoden?', 'Hoe bestel ik?'] };

  // ── Retour / garantie ──
  if (/retour|terugstu|ruil|terug|garantie|defect|kapot|werkt niet|stuk|broken|return/.test(q))
    return {
      text: '↩️ Retourbeleid:\n\n• 14 dagen bedenktijd\n• Gratis retourneren\n• Defect? We lossen het op of sturen vervanging\n• Alle games zijn getest vóór verzending\n• Geld terug binnen 3-5 werkdagen',
      links: [{ label: 'Retourbeleid', href: '/retourbeleid' }, { label: 'Contact', href: '/contact' }],
      quickReplies: ['Hoe stuur ik iets terug?', 'Game werkt niet'],
    };

  // ── Hoe retourneren ──
  if (/hoe.*(retour|terugsturen|terugbrengen)/.test(q))
    return { text: 'Retourneren in 4 stappen:\n\n1. Neem contact op via email of formulier\n2. Je ontvangt een retourlabel\n3. Verpak het goed en stuur op\n4. Geld terug binnen 3-5 werkdagen na ontvangst', links: [{ label: 'Contact', href: '/contact' }] };

  // ── Game werkt niet ──
  if (/werkt niet|doet het niet|game start niet|laadt niet|bevriest|freezt|crasht/.test(q))
    return { text: 'Vervelend! Alle games worden getest voor verzending, maar mocht er toch iets mis zijn:\n\n1. Probeer de cartridge schoon te maken met een droge doek\n2. Blaas in de sleuf van je console\n3. Werkt het nog steeds niet? Neem contact met ons op!\n\nWe lossen het altijd op — garantie of vervanging.', links: [{ label: 'Contact', href: '/contact' }], quickReplies: ['Retourbeleid', 'Contact opnemen'] };

  // ── Inkoop / verkopen ──
  if (/verkop|inkoop|inruil|trade|sell|opkop|wil.*(verkopen|kwijt)|games.*kwijt|overkoop/.test(q))
    return {
      text: '💰 Games verkopen? Wij kopen Nintendo games op!\n\n1. Check inkoopprijzen op de inkoop pagina\n2. Neem contact op met je aanbod\n3. Stuur de games op (wij betalen verzending)\n4. Direct betaling na controle\n\nWe kopen DS, GBA, 3DS en Game Boy games!',
      links: [{ label: 'Inkoopprijzen bekijken', href: '/inkoop' }, { label: 'Contact', href: '/contact' }],
      quickReplies: ['Hoeveel krijg ik voor Pokémon?', 'Welke games kopen jullie?'],
    };

  // ── Hoeveel krijg ik ──
  if (/hoeveel.*krijg|wat.*waard|inkoop.*prijs/.test(q))
    return { text: 'De inkoopprijs hangt af van de game, conditie en compleetheid. Check onze inkooppagina voor actuele prijzen — daar zie je direct wat we bieden!', links: [{ label: 'Inkoopprijzen', href: '/inkoop' }], quickReplies: ['Welke games kopen jullie?'] };

  // ── Originaliteit ──
  if (/origineel|nep|fake|echt|authentiek|namaak|reproductie|repro|bootleg|counterfeit/.test(q))
    return {
      text: '✅ 100% Origineel — onze belofte!\n\n• Persoonlijk gecontroleerd op echtheid\n• Getest op echte Nintendo hardware\n• NOOIT reproducties of bootlegs\n• Eigen foto\'s: wat je ziet is wat je krijgt\n• 5.0 uit 1.360+ reviews',
      quickReplies: ['Hoe controleren jullie dat?', 'Zijn alle games getest?'],
    };

  // ── Hoe controleren ──
  if (/hoe.*controleer|hoe.*test|hoe.*check|authenticiteit/.test(q))
    return { text: 'We controleren elke game op echtheid:\n\n• Visuele inspectie van cartridge en labels\n• Test op originele Nintendo hardware\n• Controle van PCB (printplaat)\n• Vergelijking met bekende originelen\n• Jarenlange ervaring met Nintendo games\n\nOnze 5.0 score uit 1.360+ reviews bewijst het!' };

  // ── Conditie ──
  if (/conditie|staat|kwaliteit|gebruikt|nieuw|cib|compleet|los|cartridge|doos|manual|handleiding|boxed|mint|sealed/.test(q))
    return {
      text: '📋 Condities uitgelegd:\n\n• "Zo goed als nieuw" — nauwelijks sporen van gebruik\n• "Gebruikt" — normaal gebruik, 100% werkend\n• "Nieuw" — ongeopend/sealed\n\n📦 Compleetheid:\n• CIB = Compleet in Doos (game + doos + handleiding)\n• Losse cartridge = alleen het spelletje\n\nBij elke game staan eigen foto\'s!',
      quickReplies: ['CIB games bekijken', 'Goedkoopste games?'],
    };

  // ── CIB games ──
  if (/cib|compleet in doos|met doos|boxed/.test(q)) {
    const cib = products.filter(p => p.completeness.toLowerCase().includes('compleet'));
    return { text: `We hebben ${cib.length} CIB (Compleet in Doos) games — met originele doos en handleiding!`, products: cib.slice(0, 6), links: [{ label: 'Alle games', href: '/shop' }] };
  }

  // ── Contact ──
  if (/contact|email|mail|bereik|instagram|bel|telefoon|whatsapp|dm|stuur.*bericht/.test(q))
    return {
      text: '📧 Contact:\n\n• Email: gameshopenter@gmail.com\n• Instagram: @gameshopenter\n• Contactformulier op de website\n\nReactie meestal binnen 24 uur!',
      links: [{ label: 'Contactformulier', href: '/contact' }],
      quickReplies: ['Over Gameshop Enter', 'FAQ bekijken'],
    };

  // ── Over ons ──
  if (/over (jullie|ons|gameshop|de winkel)|eigenaar|oprichter|lenn|verhaal|wie.*achter|started/.test(q))
    return {
      text: '🏪 Gameshop Enter is opgericht door Lenn Hodes — dé Nintendo specialist van Nederland!\n\n• 3.000+ tevreden klanten\n• 5.0 uit 1.360+ reviews\n• Elke game persoonlijk getest\n• Online-only webshop\n• Specialist in Pokémon, DS, GBA, 3DS en Game Boy',
      links: [{ label: 'Over ons', href: '/over-ons' }],
    };

  // ── Reviews ──
  if (/review|beoordel|sterren|rating|ervaring|feedback|trustpilot/.test(q))
    return { text: '⭐ 5.0 gemiddelde score uit 1.360+ reviews!\n\nKlanten waarderen vooral:\n• Kwaliteit van de games\n• Snelle verzending\n• Goede communicatie\n• Betrouwbaarheid', links: [{ label: 'Over ons', href: '/over-ons' }] };

  // ── Prijs / Budget ──
  if (/prijs|kost|duur|goedkoop|budget|onder\s*€?\s*\d|tot\s*€?\s*\d|vanaf|hoeveel kost|wat kost|price/.test(q)) {
    const budgetMatch = q.match(/(?:onder|tot|max(?:imaal)?|budget)\s*€?\s*(\d+)/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]);
      const found = products.filter(p => p.price <= budget).sort((a, b) => b.price - a.price);
      return {
        text: found.length > 0 ? `${found.length} games onder €${budget}:` : `Helaas geen games onder €${budget}. Onze goedkoopste games beginnen vanaf €${Math.min(...products.map(p => p.price)).toFixed(2)}.`,
        products: found.length > 0 ? found.slice(0, 6) : undefined,
        links: [{ label: 'Alle games', href: '/shop' }],
      };
    }
    const min = Math.min(...products.map(p => p.price));
    const max = Math.max(...products.map(p => p.price));
    return { text: `Onze prijzen variëren van €${min.toFixed(2)} tot €${max.toFixed(2)}. Alle prijzen zijn marktconform en we hebben voor elk budget iets!`, links: [{ label: 'Shop bekijken', href: '/shop' }], quickReplies: ['Goedkoopste games?', 'Premium games?'] };
  }

  // ── Goedkoopst ──
  if (/goedkoopst|laagste prijs|cheapest|voordeligst/.test(q)) {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    return { text: 'Onze voordeligste games:', products: sorted.slice(0, 6), quickReplies: ['Premium games?', 'Alle games bekijken'] };
  }

  // ── Duurste / Premium ──
  if (/duurste|premium|zeldzaam|rare|waardevol|expensive|most expensive|collector/.test(q)) {
    const sorted = [...products].sort((a, b) => b.price - a.price);
    return { text: 'Onze premium & zeldzame games:', products: sorted.slice(0, 6), quickReplies: ['Waarom zijn sommige games duur?'] };
  }

  // ── Populairst / cadeau / aanrader ──
  if (/populair|best.*verkocht|aanrader|cadeau|kado|gift|verjaardag|kerst|sinterklaas|sint|christmas|birthday/.test(q)) {
    const popular = products.filter(p => p.isPremium).sort((a, b) => b.price - a.price).slice(0, 6);
    const isGift = /cadeau|kado|gift|verjaardag|kerst|sint|christmas|birthday/.test(q);
    return {
      text: isGift
        ? '🎁 Op zoek naar een cadeau? Pokémon games zijn altijd een hit! Hier zijn onze populairste games:'
        : 'Dit zijn onze populairste en meest gewilde games:',
      products: popular,
      quickReplies: isGift ? ['Goedkope opties?', 'CIB games (met doos)?'] : ['Budget opties?', 'Pokémon games?'],
    };
  }

  // ── Nieuwste / net binnen / new ──
  if (/nieuwste|net binnen|nieuwe voorraad|just arrived|new arrivals|laatst toegevoegd/.test(q)) {
    const recent = products.slice(-6).reverse();
    return { text: 'Onze meest recent toegevoegde games:', products: recent, links: [{ label: 'Shop', href: '/shop' }] };
  }

  // ── Waarom duur ──
  if (/waarom.*(duur|prijs)|prijs.*(hoog|veel)|expensive.*why/.test(q))
    return { text: 'Retro Nintendo games stijgen in waarde door:\n\n• Beperkte oplages (niet meer geproduceerd)\n• Groeiende vraag van collectors\n• Conditie (nieuw/CIB is zeldzamer)\n• Franchise populariteit (Pokémon!)\n• Europese PAL versie (zeldzamer dan US)\n\nOnze prijzen zijn marktconform en we garanderen altijd originele games.' };

  // ── FAQ ──
  if (/faq|veelgestelde|veel gestelde|frequently/.test(q))
    return { text: 'Op onze FAQ pagina vind je alle veelgestelde vragen en antwoorden!', links: [{ label: 'FAQ bekijken', href: '/faq' }], quickReplies: ['Verzendkosten?', 'Retourbeleid?', 'Contact opnemen'] };

  // ── Privacy ──
  if (/privacy|gegevens|gdpr|avg|data|persoonlijke informatie/.test(q))
    return { text: 'We gaan zorgvuldig om met je gegevens:\n\n• Alleen gebruikt voor bestellingen\n• Nooit gedeeld met derden\n• AVG/GDPR compliant\n• Veilige betaling', links: [{ label: 'Privacybeleid', href: '/privacybeleid' }] };

  // ── Voorwaarden ──
  if (/voorwaarden|terms|conditions|algemene/.test(q))
    return { text: 'Onze volledige algemene voorwaarden vind je hier:', links: [{ label: 'Algemene voorwaarden', href: '/algemene-voorwaarden' }] };

  // ── Openingstijden / fysieke winkel ──
  if (/openingstijd|fysieke winkel|locatie|adres|bezoek|langs\s*komen|ophalen|afhalen|pickup|winkel.*adres/.test(q))
    return { text: 'Gameshop Enter is een online-only webshop — geen fysieke winkel. Maar geen zorgen, we leveren in heel Nederland! Games zijn binnen 1-3 werkdagen thuis via PostNL.', quickReplies: ['Hoe bestellen?', 'Verzendkosten?'] };

  // ── Hoe bestellen ──
  if (/hoe.*(bestel|koop|order)|bestel.*(proces|stappen)|how.*order|stappen/.test(q))
    return {
      text: '🛒 Bestellen in 5 stappen:\n\n1. Zoek je game in de shop\n2. Klik "In winkelwagen"\n3. Ga naar de winkelwagen\n4. Vul je gegevens in\n5. Betaal — bevestiging per email!\n\nVerzending binnen 1-3 werkdagen.',
      links: [{ label: 'Naar de shop', href: '/shop' }, { label: 'Winkelwagen', href: '/winkelwagen' }],
    };

  // ── Bestelling status / tracking ──
  if (/bestelling|order|status|waar is mijn|track.*bestelling|wanneer.*bestelling/.test(q))
    return { text: 'Na je bestelling ontvang je een bevestiging per email met een track & trace code van PostNL. Hiermee kun je je pakket volgen. Nog geen email ontvangen? Check je spam of neem contact met ons op!', links: [{ label: 'Contact', href: '/contact' }], quickReplies: ['Levertijden?', 'Contact opnemen'] };

  // ── Annuleren ──
  if (/annuleer|annuleren|cancel|bestelling.*annul/.test(q))
    return { text: 'Bestelling annuleren? Neem zo snel mogelijk contact met ons op via email of het contactformulier. Als het pakket nog niet verzonden is, kunnen we het annuleren. Al verzonden? Dan kun je gebruik maken van ons retourbeleid (14 dagen).', links: [{ label: 'Contact', href: '/contact' }] };

  // ── Genre zoeken ──
  if (/rpg|role.?playing/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'rpg');
    return { text: found.length > 0 ? `We hebben ${found.length} RPG games! Hier zijn de beste:` : 'Geen RPG games op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined, links: [{ label: 'Shop', href: '/shop' }] };
  }
  if (/platform(er|spel)|jump|side.?scroll/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'platformer');
    return { text: found.length > 0 ? `We hebben ${found.length} platformers!` : 'Geen platformers op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined };
  }
  if (/actie|action|avontuur|adventure/.test(q)) {
    const found = products.filter(p => ['Actie', 'Avontuur'].includes(p.genre));
    return { text: found.length > 0 ? `We hebben ${found.length} actie/avontuur games!` : 'Geen actie games op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined };
  }
  if (/race|racing|kart/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'race');
    return { text: found.length > 0 ? 'Onze race games:' : 'Geen race games op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined };
  }
  if (/puzzel|puzzle|brain/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'puzzel');
    return { text: found.length > 0 ? 'Onze puzzelgames:' : 'Geen puzzelgames op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined };
  }
  if (/sport|voetbal|fifa|football/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'sport');
    return { text: found.length > 0 ? 'Onze sportgames:' : 'Geen sportgames op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined };
  }
  if (/strategie|strategy|tactical/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'strategie');
    return { text: found.length > 0 ? 'Onze strategiegames:' : 'Geen strategiegames op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined };
  }
  if (/vecht|fighting|smash/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'vecht');
    return { text: found.length > 0 ? 'Onze vechtgames:' : 'Geen vechtgames op voorraad momenteel.', products: found.length > 0 ? found.slice(0, 6) : undefined };
  }

  // ── Kinderen / leeftijd ──
  if (/kind(eren)?|jong|family|gezin|zoon|dochter|kleinkind|kid|child|for kids|peuter|tiener|teen/.test(q))
    return { text: 'Pokémon games zijn perfect voor alle leeftijden! 🎮 Makkelijk te leren, moeilijk om neer te leggen. Onze aanraders voor jonge gamers:', products: searchProducts('pokemon'), quickReplies: ['Goedkoopste opties?', 'CIB als cadeau?'] };

  // ── Korting ──
  if (/korting|coupon|code|actie|aanbieding|sale|deal|discount|voucher|kortingscode/.test(q))
    return { text: 'Geen actieve kortingscodes op dit moment, maar wel:\n\n✅ Gratis verzending boven €100\n✅ Scherpe marktconforme prijzen\n✅ Volg @gameshopenter op Instagram voor acties!', quickReplies: ['Goedkoopste games?', 'Premium games?'] };

  // ── Cadeaubon ──
  if (/cadeaubon|gift.?card|tegoedbon|waardebon/.test(q))
    return { text: 'We bieden momenteel geen cadeaubonnen aan. Maar je kunt altijd een game als cadeau kopen — we verpakken alles mooi! 🎁', quickReplies: ['Cadeau-tips?', 'Hoe bestellen?'] };

  // ── Veiligheid / betrouwbaarheid ──
  if (/veilig|betrouwbaar|scam|oplichting|vertrouw|legit|legitimate|trustworthy/.test(q))
    return {
      text: '🔒 100% betrouwbaar:\n\n• 5.0 uit 1.360+ reviews\n• 3.000+ tevreden klanten\n• Veilige betaling (SSL)\n• 14 dagen retourrecht\n• Alle games origineel & getest\n• KvK geregistreerd',
      links: [{ label: 'Bekijk reviews', href: '/over-ons' }],
    };

  // ── Vergelijking met andere winkels ──
  if (/marktplaats|bol\.com|amazon|nedgame|gamemania|2dehands|tweedehands|andere winkel|concurrent|goedkoper.*elders/.test(q))
    return { text: 'Bij Gameshop Enter ben je verzekerd van:\n\n• 100% originele games (geen risico op fakes)\n• Persoonlijk getest en gefotografeerd\n• 14 dagen retourrecht\n• 5.0 uit 1.360+ reviews\n\nBij andere platforms heb je die zekerheid niet altijd!', quickReplies: ['Waarom bij jullie kopen?', 'Reviews bekijken'] };

  // ── Waarom bij ons kopen ──
  if (/waarom.*kopen|waarom.*jullie|why.*buy|voordeel|reden/.test(q))
    return { text: 'Waarom Gameshop Enter? 🏆\n\n• 100% originele Nintendo games\n• Persoonlijk getest & gefotografeerd\n• 5.0 score uit 1.360+ reviews\n• Snelle verzending (1-3 werkdagen)\n• 14 dagen gratis retourneren\n• Specialist in Pokémon & retro Nintendo\n• Nederlandse klantenservice' };

  // ── Compatibiliteit / werkt het op mijn console ──
  if (/werkt.*op|compatib|past.*in|speelbaar.*op|kan ik.*spelen.*op/.test(q))
    return { text: 'Nintendo games zijn regio-vrij (PAL/EUR), dus ze werken op alle Europese consoles. Let op:\n\n• GBA games → werken op GBA, GBA SP, DS, DS Lite\n• DS games → werken op alle DS en 3DS modellen\n• 3DS games → alleen op 3DS/2DS consoles\n• Game Boy → originele Game Boy, Color, Advance\n\nTwijfel je? Stuur ons een berichtje!', quickReplies: ['Contact opnemen', 'Welke games hebben jullie?'] };

  // ── Battterij / save ──
  if (/batterij|battery|save|opslaan|klok|clock|interne batterij|cr2025/.test(q))
    return { text: 'Sommige oudere games (Game Boy, GBA) hebben een interne batterij voor save-data. We testen alle games op werking inclusief save-functie. Is de batterij leeg? Dan vermelden we dat. Batterijen zijn eenvoudig te vervangen — neem contact op als je hulp nodig hebt!', quickReplies: ['Contact opnemen', 'Game Boy games?'] };

  // ── Verlanglijst / wishlist / voorraad melding ──
  if (/verlanglijst|wishlist|wachtlijst|voorraad.*melding|notify|laat.*weten.*voorraad|niet op voorraad/.test(q))
    return { text: 'We hebben helaas nog geen meldingssysteem, maar je kunt ons altijd een berichtje sturen met je wensen! We krijgen regelmatig nieuwe voorraad binnen.', links: [{ label: 'Contact', href: '/contact' }], quickReplies: ['Contact opnemen', 'Welke games hebben jullie nu?'] };

  // ── Meerdere bestellen / bulk ──
  if (/meerdere|bulk|groothandel|wholesale|veel.*tegelijk|groot.*bestelling/.test(q))
    return { text: 'Meerdere games bestellen? Dat kan gewoon! Alles in je winkelwagen, afrekenen, klaar. Bij bestellingen boven €100 is verzending gratis! 📦', links: [{ label: 'Shop', href: '/shop' }], quickReplies: ['Premium games?', 'Verzendkosten?'] };

  // ── Cadeauverpakking ──
  if (/cadeau\s*verpak|gift\s*wrap|inpak|mooi ingepakt|als cadeau verpak/.test(q))
    return { text: 'We verpakken alle bestellingen zorgvuldig! Extra cadeauverpakking bieden we momenteel niet aan, maar je kunt in de opmerkingen bij je bestelling aangeven dat het een cadeau is.', quickReplies: ['Cadeau-tips?', 'Hoe bestellen?'] };

  // ── Pre-order / reserveren ──
  if (/pre.?order|reserv|voorbestell|voorbest|binnenkort|upcoming|nieuwe releases/.test(q))
    return { text: 'We hebben momenteel geen pre-order systeem. We verkopen retro Nintendo games — alles wat je in de shop ziet is direct leverbaar! Nieuwe aanwinsten worden regelmatig toegevoegd.', links: [{ label: 'Shop', href: '/shop' }], quickReplies: ['Nieuwste games?', 'Welke platforms?'] };

  // ── Accessoires / controllers ──
  if (/accessoire|controller|oplader|charger|hoesje|case|bescherm|screen\s*protector|stylus|adapter|kabel/.test(q)) {
    const acc = products.filter(p => p.category?.toLowerCase().includes('accessoire'));
    return acc.length > 0
      ? { text: `We hebben ${acc.length} accessoires!`, products: acc.slice(0, 6), links: [{ label: 'Shop', href: '/shop' }] }
      : { text: 'We focussen ons op games en consoles. Accessoires hebben we momenteel beperkt. Check de shop voor het actuele aanbod!', links: [{ label: 'Shop', href: '/shop' }] };
  }

  // ── Console kopen ──
  if (/console.*kop|koop.*console|handheld|apparaat|systeem.*kop|ds.*kop|gba.*kop|gameboy.*kop/.test(q)) {
    const consoles = products.filter(p => p.isConsole);
    return consoles.length > 0
      ? { text: `We hebben ${consoles.length} consoles! Allemaal getest en werkend:`, products: consoles.slice(0, 6), links: [{ label: 'Alle consoles', href: '/shop' }] }
      : { text: 'We hebben momenteel geen losse consoles op voorraad. Houd de shop in de gaten — we krijgen regelmatig nieuwe voorraad!', links: [{ label: 'Shop', href: '/shop' }] };
  }

  // ── Console reparatie ──
  if (/repareer|reparatie|repair|fix.*console|kapotte.*console|scherm.*vervang|scharnier|hinge/.test(q))
    return { text: 'We bieden geen reparatieservice aan, maar we verkopen wél geteste consoles die 100% werken! Heb je een defecte console gekocht bij ons? Neem contact op — we lossen het op.', links: [{ label: 'Contact', href: '/contact' }], quickReplies: ['Consoles bekijken', 'Retourbeleid'] };

  // ── Multiplayer / samen spelen ──
  if (/multiplayer|samen.*spelen|co.?op|local.*play|2.*spelers|twee.*spelers|met.*vriend/.test(q))
    return { text: 'Veel Nintendo games zijn perfect om samen te spelen! Pokémon kun je ruilen en battlen, en veel DS/GBA games hebben multiplayer. Zoek je iets specifieks om samen te spelen?', quickReplies: ['Pokémon games', 'Party games?', 'Alle games'] };

  // ── Moeilijkheidsgraad / voor beginners ──
  if (/makkelijk|moeilijk|beginner|starter|eerste.*game|beginnen.*met|noob|nieuweling|instap/.test(q))
    return { text: 'Voor beginners zijn Pokémon games ideaal — makkelijk te leren maar met veel diepgang! Ook Mario games zijn perfect om mee te starten. Welk platform heb je?', quickReplies: ['Pokémon games', 'Welke platforms?', 'Goedkoopste games?'] };

  // ── Spellenlijst / hoeveel uur speelplezier ──
  if (/hoeveel uur|speeltijd|hoe lang.*spelen|gameplay.*uur|speelduur|content/.test(q))
    return { text: 'De speeltijd verschilt per game:\n\n• Pokémon RPGs: 30-100+ uur\n• Zelda avonturen: 15-60 uur\n• Mario platformers: 10-30 uur\n• Korte games: 5-15 uur\n\nPokémon games bieden verreweg de meeste speeltijd dankzij het vangen en trainen van alle Pokémon!', quickReplies: ['Pokémon games', 'RPG games?'] };

  // ── Verzamelen / collectie opbouwen ──
  if (/verzamel|collectie|collect|compleet.*set|alle.*pokemon|set.*compleet|collector/.test(q))
    return { text: 'Een Nintendo collectie opbouwen? Geweldig! 🏆 We hebben games voor alle grote Nintendo handhelds. Tips:\n\n• Begin met je favoriete franchise\n• CIB (Compleet in Doos) games zijn het meest waardevol\n• Pokémon stijgt het hardst in waarde\n• Koop nu — retro games worden alleen maar duurder!', products: [...products].sort((a, b) => b.price - a.price).slice(0, 4), quickReplies: ['CIB games?', 'Premium games?'] };

  // ── Investering / waarde stijging ──
  if (/investering|investeren|waarde.*stijg|meer.*waard|stijgen.*prijs|geld.*verdienen.*games/.test(q))
    return { text: 'Retro Nintendo games zijn de afgelopen jaren flink in waarde gestegen! Vooral:\n\n📈 Pokémon games (HeartGold/SoulSilver, Emerald)\n📈 CIB (Compleet in Doos) exemplaren\n📈 Sealed/nieuw in folie\n📈 Zeldzame titels\n\nWe garanderen 100% originaliteit — belangrijk voor waardebehoud!', quickReplies: ['Duurste games?', 'CIB games?'] };

  // ── Tweedehands / gebruikt veilig? ──
  if (/tweedehands.*veilig|gebruikt.*goed|kwaliteit.*gebruikt|werken.*gebruikte|houdbaar/.test(q))
    return { text: 'Ja, absoluut! Nintendo cartridges zijn ongelooflijk duurzaam — ze gaan letterlijk tientallen jaren mee. Alle games worden door ons:\n\n✅ Visueel geïnspecteerd\n✅ Getest op originele hardware\n✅ Gefotografeerd (wat je ziet = wat je krijgt)\n✅ Gecontroleerd op save-functie\n\n5.0 uit 1.360+ reviews bewijst het!', quickReplies: ['Hoe controleren jullie?', 'Reviews bekijken'] };

  // ── Verschil tussen versies / welke versie ──
  if (/verschil.*tussen|welke versie|welke.*beter|vergelijk|pal.*ntsc|europese.*versie|japanese/.test(q))
    return { text: 'Al onze games zijn Europese PAL versies — ze werken op alle Europese/Australische consoles. Het verschil met andere regio\'s:\n\n🇪🇺 PAL = Europa (onze games)\n🇺🇸 NTSC-U = Amerika\n🇯🇵 NTSC-J = Japan\n\nDS en 3DS games zijn regio-vrij. GBA ook. Dus geen zorgen!', quickReplies: ['Compatibiliteit?', 'Alle games bekijken'] };

  // ── Nieuwsbrief ──
  if (/nieuwsbrief|newsletter|mail.*lijst|op de hoogte|mailing|abonneer|subscribe/.test(q))
    return { text: 'Volg ons op Instagram @gameshopenter voor de nieuwste aanwinsten en acties! We posten regelmatig nieuwe voorraad en speciale items.', quickReplies: ['Contact opnemen', 'Over de winkel'] };

  // ── Sociale media ──
  if (/instagram|social|socials|facebook|twitter|tiktok|youtube|volgen|follow/.test(q))
    return { text: 'Volg ons op Instagram: @gameshopenter! 📱 Daar delen we:\n\n• Nieuwe voorraad\n• Bijzondere games\n• Behind the scenes\n• Acties\n\nDat is onze meest actieve social media.', quickReplies: ['Over de winkel', 'Contact opnemen'] };

  // ── Verpakking / hoe wordt het verstuurd ──
  if (/verpak|hoe.*verstuur|hoe.*verzend|bubbel|bubble|bescherm.*verzen|stevig/.test(q))
    return { text: 'We verpakken alles met zorg! 📦\n\n• Bubbeltjeswrap rondom de game\n• Stevige verzenddoos\n• Fragile sticker\n• PostNL met track & trace\n\nJe game komt veilig aan!', quickReplies: ['Verzendkosten?', 'Levertijden?'] };

  // ── Betaalbevestiging / factuur ──
  if (/factuur|invoice|bon|bewijs|betaalbewijs|bevestig.*email|order.*bevestig/.test(q))
    return { text: 'Na je bestelling ontvang je automatisch een bevestigingsemail met alle details en je track & trace code. Dit is ook je aankoopbewijs. Check je spam als je niks ontvangen hebt!', links: [{ label: 'Contact', href: '/contact' }], quickReplies: ['Hoe bestellen?', 'Contact opnemen'] };

  // ── Openstaande betaling ──
  if (/openstaand|niet.*betaald|betaling.*mislukt|betaling.*misgelukt|payment.*failed|transactie.*mislukt/.test(q))
    return { text: 'Is je betaling mislukt? Geen zorgen — er wordt niets afgeschreven bij een mislukte transactie. Probeer het opnieuw of kies een andere betaalmethode. Lukt het niet? Neem contact met ons op!', links: [{ label: 'Contact', href: '/contact' }], quickReplies: ['Betaalmethoden?', 'Contact opnemen'] };

  // ── Levertijd specifiek ──
  if (/wanneer.*binnen|wanneer.*thuis|hoe snel|snelste.*levering|express|spoed|haast|morgen.*binnen|vandaag.*bestel/.test(q))
    return { text: 'Bestellingen worden binnen 1 werkdag verzonden via PostNL. Levertijd is 1-3 werkdagen. Vandaag besteld = meestal morgen of overmorgen in huis! Express verzending bieden we momenteel niet aan.', quickReplies: ['Verzendkosten?', 'Track & trace?'] };

  // ── Hoeveel games op voorraad ──
  if (/voorraad|op.*voorraad|hoeveel.*stuks|maar.*1|laatste|uitverkocht|sold out|availability/.test(q))
    return { text: `We hebben ${products.length} producten in onze shop. Alles wat je ziet is op voorraad — we hebben van elke game 1 exemplaar (het zijn unieke retro games). Op = op, dus wees er snel bij!`, links: [{ label: 'Shop', href: '/shop' }], quickReplies: ['Populairste games?', 'Premium games?'] };

  // ── Wat is nieuw / recent toegevoegd ──
  if (/wat is er nieuw|nieuwe.*toevoeg|recent.*toevoeg|update|nieuwe.*stock|vers.*binnen/.test(q)) {
    const recent = products.slice(-6).reverse();
    return { text: 'Dit zijn onze meest recent toegevoegde games:', products: recent, links: [{ label: 'Alle games', href: '/shop' }], quickReplies: ['Populairste games?', 'Pokémon games?'] };
  }

  // ── Welke game moet ik kopen / advies ──
  if (/welke.*kopen|wat.*aanrad|advies|raad.*aan|suggestie|recommend|welke.*kiezen|help.*kiezen|kan.*niet.*kiezen/.test(q))
    return { text: 'Ik help je graag kiezen! Om je goed advies te geven:\n\n🎮 Welk platform heb je? (DS, GBA, 3DS, Game Boy)\n💰 Wat is je budget?\n🎯 Welk genre? (RPG, avontuur, platformer, etc.)\n\nOf als je het niet weet — Pokémon is altijd een goede keuze!', quickReplies: ['Pokémon games', 'Goedkoopste games', 'RPG games'] };

  // ── Emulator / ROM / download ──
  if (/emulator|rom|download|illegaal|piraat|piracy|gratis.*game|free.*game|torrent/.test(q))
    return { text: 'Wij verkopen alleen 100% originele fysieke games — de echte retro ervaring! Het spelen op originele hardware is onverslaanbaar. Bovendien steun je zo de gaming community en behoud je de waarde van je collectie. 🎮', quickReplies: ['Waarom origineel?', 'Alle games bekijken'] };

  // ── Favoriete game / top games ──
  if (/top\s*\d|beste.*game|favoriete|favoriet|all.?time|goat|greatest|ranking|ranglijst/.test(q)) {
    const topGames = [...products].sort((a, b) => b.price - a.price).slice(0, 6);
    return { text: 'Onze meest gewilde games (op basis van populariteit en waarde):', products: topGames, quickReplies: ['Pokémon games?', 'Goedkoopste games?'] };
  }

  // ── Specific Pokémon generatie ──
  if (/gen\s*[1-9]|generatie\s*[1-9]|generation\s*[1-9]|kanto|johto|hoenn|sinnoh|unova|kalos|alola|galar/.test(q)) {
    const pokemonGames = products.filter(p => p.name.toLowerCase().includes('pok'));
    return { text: 'Alle Pokémon generaties zijn legendarisch! Hier zijn onze Pokémon games — van Gen 1 tot de nieuwste:', products: pokemonGames.slice(0, 6), links: [{ label: 'Alle Pokémon', href: '/shop?q=pokemon' }], quickReplies: ['Welke is de beste?', 'Duurste Pokémon?'] };
  }

  // ── Specifieke Pokémon games ──
  if (/emerald|ruby|sapphire|diamond|pearl|platinum|heartgold|soulsilver|black|white|fire\s*red|leaf\s*green|crystal|gold|silver|red|blue|yellow/.test(q)) {
    const found = searchProducts(q, 4);
    return found.length > 0
      ? { text: 'Dit hebben we:', products: found, links: [{ label: 'Alle Pokémon', href: '/shop?q=pokemon' }] }
      : { text: `Helaas hebben we die specifieke game niet op voorraad. Bekijk onze andere Pokémon games:`, products: products.filter(p => p.name.toLowerCase().includes('pok')).slice(0, 4), links: [{ label: 'Alle Pokémon', href: '/shop?q=pokemon' }] };
  }

  // ── Weer / tijd / random vragen (off-topic) ──
  if (/weer|temperatuur|regen|zon|klimaat|weather|forecast/.test(q))
    return { text: 'Het weer weet ik helaas niet, maar ik weet wél alles over Nintendo games! 🎮☀️ Regen of zonneschijn — het is altijd gametijd. Kan ik je helpen met onze games?', quickReplies: ['Games zoeken', 'Populairste games'] };

  if (/hoe laat|tijd|klok|what time|datum|date|vandaag/.test(q))
    return { text: 'De tijd vliegt als je games speelt! ⏰ Maar daar kan ik je helaas niet mee helpen. Wél met onze Nintendo games! Waarmee kan ik je helpen?', quickReplies: ['Games zoeken', 'Hoe bestellen?'] };

  // ── Eten / drinken / random off-topic ──
  if (/eten|drinken|restaurant|pizza|koffie|bier|friet|snack|honger|dorst|food|hungry/.test(q))
    return { text: 'Haha, ik ben een gaming-beer, geen food-beer! 🐻🍕 Maar na een goede game session is pizza altijd een goed idee. Kan ik je helpen met Nintendo games?', quickReplies: ['Games zoeken', 'Populairste games'] };

  // ── School / huiswerk / kennis vragen ──
  if (/school|huiswerk|homework|wiskunde|math|geschied|history|aardrijks|biologie|science|compiler|programm|python|java\b|html|css|code|coding|rekenen|tafel/.test(q))
    return { text: 'Daar ben ik helaas niet de juiste beer voor! 🐻📚 Ik ben gespecialiseerd in Nintendo games. Stel me gerust een vraag over onze games, verzending of de winkel!', quickReplies: ['Welke games hebben jullie?', 'Hoe bestellen?', 'Over de winkel'] };

  // ── Sport / voetbal / niet-gaming ──
  if (/ajax|feyenoord|psv|voetbal.*wed|formule\s*1|f1|olymp|tennis|hockey|wielren/.test(q))
    return { text: 'Ik ben meer van de virtuele sport — Mario Kart en Pokémon battles! 🏎️🎮 Maar kan ik je helpen met onze Nintendo games?', quickReplies: ['Race games?', 'Sport games?', 'Alle games'] };

  // ── Film / series / entertainment ──
  if (/film|movie|serie|netflix|disney|anime|manga|cartoon|television|tv\b/.test(q))
    return { text: 'Ik ken alle Pokémon afleveringen, maar voor film/serie-advies moet je ergens anders zijn! 😄 Wél kan ik je helpen met de beste Nintendo games. Interesse?', quickReplies: ['Pokémon games', 'Populairste games'] };

  // ── Muziek ──
  if (/muziek|music|spotify|playlist|liedje|song|concert|band|zanger/.test(q))
    return { text: 'De beste muziek? Dat zijn Nintendo soundtracks! 🎵 Zelda, Pokémon, Mario... onverslaanbaar. Maar voor muziekadvies ben ik niet de juiste. Kan ik je helpen met games?', quickReplies: ['Games zoeken', 'Populairste games'] };

  // ── Dieren / huisdieren ──
  if (/hond|kat|dier|huisdier|puppy|kitten|hamster|konijn|vis|aquarium|pet/.test(q))
    return { text: 'Ik ben de enige beer die je nodig hebt! 🐻 En als je van dieren houdt — Pokémon is basically het beste huisdieren-spel ooit gemaakt. 😄', quickReplies: ['Pokémon games', 'Games zoeken'] };

  // ── Relatie / persoonlijk ──
  if (/vriendin|vriend|relatie|date|liefde|eenzaam|verdrietig|blij|gelukkig|boos|moe|ziek|pijn/.test(q))
    return { text: 'Ik hoop dat alles goed met je gaat! 🐻 Als gaming-beer kan ik je het beste opvrolijken met een gave game. Games zijn de beste therapie! Kan ik je helpen iets te vinden?', quickReplies: ['Cadeau-tips', 'Populairste games', 'Goedkoopste games'] };

  // ── Leeftijd / hoe oud ──
  if (/hoe oud.*ben|hoe oud.*je|leeftijd|birthday|verjaardag.*beer|wanneer.*geboren/.test(q))
    return { text: 'Ik ben tijdloos, net als de beste Nintendo games! 🐻🎮 Sommige van onze games zijn 20+ jaar oud en spelen nog steeds fantastisch. Kan ik je ergens mee helpen?' };

  // ── Zin van het leven / filosofisch ──
  if (/zin.*leven|meaning.*life|42|waarom.*bestaan|filosofi|doel|purpose/.test(q))
    return { text: 'De zin van het leven? Games spelen natuurlijk! 🎮 In ieder geval, ik help je graag met het vinden van je volgende favoriete Nintendo game. Wat zoek je?', quickReplies: ['Games zoeken', 'Populairste games'] };

  // ── Schelden / grof taalgebruik ──
  if (/kut|shit|fuck|godver|damn|wtf|lul|eikel|sukkel|idioot|stom|klote|kanker|tering|tyfus|pest/.test(q))
    return { text: 'Hey, rustig aan! 🐻 Ik ben maar een vriendelijke gaming-beer. Kan ik je ergens mee helpen? Ik doe m\'n best!', quickReplies: ['Games zoeken', 'Contact opnemen'] };

  // ── Herhaalde vraag / weet je het nog ──
  if (/herinner|onthoud|weet je nog|remember|eerder.*gezegd|vorige.*vraag/.test(q))
    return { text: 'Ik onthoud ons gesprek binnen deze chat! Als je eerder iets gevraagd hebt, scroll even terug. Of stel je vraag gerust opnieuw — ik help je graag!', quickReplies: ['Games zoeken', 'Hoe bestellen?'] };

  // ── Grootte / gewicht / afmeting ──
  if (/groot|klein|afmeting|dimensie|gewicht|weight|size|hoe zwaar|hoe groot|formaat/.test(q))
    return { text: 'Nintendo cartridges zijn lekker compact:\n\n• Game Boy: ~6 x 6.5 cm\n• GBA: ~6 x 3.5 cm\n• DS: ~3.5 x 3.5 cm\n• 3DS: ~3.5 x 3.5 cm\n\nPast makkelijk in je zak! Het gewicht staat bij elk product vermeld.', quickReplies: ['Games bekijken', 'Hoe wordt het verpakt?'] };

  // ── Taal van de games ──
  if (/taal|language|engels|english|nederlands|dutch|frans|french|duits|german|ondertitel|subtitle/.test(q))
    return { text: 'De meeste Nintendo games zijn in het Engels. Sommige (zoals nieuwere Pokémon titels) hebben meerdere talen waaronder Nederlands. Bij de productbeschrijving vermelden we de taal als dat relevant is!', quickReplies: ['Games zoeken', 'Pokémon games'] };

  // ── Easter eggs ──
  if (/grap|mop|grappig|joke|fun fact|leuk weetje/.test(q)) {
    const jokes = [
      'Waarom ging de Pokémon naar de dokter? Omdat hij een PIKA-boo had! 😄',
      'Wat zegt Mario als hij z\'n sleutels kwijt is? "It\'s-a me, waar-io!" 😄',
      'Waarom is Link altijd zo moe? Omdat hij steeds moet ZELDA-redden! 😄',
      'Wat is het favoriete eten van een Pokémon trainer? POKE-bowl natuurlijk! 😄',
      'Hoe noem je een Pokémon die kan typen? Typerachu! 😄',
      'Waarom ging Pikachu naar school? Om WATT beter te worden! ⚡😄',
    ];
    return { text: `${jokes[Math.floor(Math.random() * jokes.length)]}\n\n...Laat me je liever helpen met games zoeken!`, quickReplies: ['Laat maar, zoek een game', 'Nog een grap!'] };
  }
  if (/konami|up up down|cheat|↑↑↓↓/.test(q))
    return { text: '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️ ...Helaas geen extra levens, maar wél de beste Nintendo games van Nederland! 🎮' };
  if (/geheim|secret|hidden|easter egg|verborgen/.test(q))
    return { text: 'Je hebt een geheime boodschap gevonden! 🥚✨ ...Nee grapje, maar onze games zitten wél vol met geheimen. Wil je een game zoeken?', quickReplies: ['Populairste games', 'Pokémon games'] };

  // ── Bot / AI / robot vragen ──
  if (/\b(bot|robot|ai|artificial|kunstmatige|machine|chatgpt|gpt|claude)\b/.test(q))
    return { text: 'Ik ben Beer, de slimme assistent van Gameshop Enter! 🐻 Ik ken ons hele assortiment en kan je helpen met al je vragen. Wat wil je weten?', quickReplies: ['Games zoeken', 'Over de winkel', 'Hoe bestellen?'] };

  // ── Complimenten ──
  if (/goed bezig|goede winkel|goede service|love it|geweldig|fantastisch|amazing|awesome|lekker bezig|cool|nice|mooi|gaaf/.test(q))
    return { text: 'Dankjewel! 😊 Dat is fijn om te horen. We doen ons best voor elke klant. Kan ik je nog ergens mee helpen?' };

  // ── Klachten ──
  if (/klacht|ontevreden|slecht|teleurgesteld|complaint|disappointed|boos|kwaad|niet blij/.test(q))
    return { text: 'Dat is vervelend om te horen! We willen het graag voor je oplossen. Neem direct contact met ons op via email of het contactformulier — we reageren binnen 24 uur.', links: [{ label: 'Contact opnemen', href: '/contact' }] };

  // ── Engels / andere taal ──
  if (/^(what|how|where|when|who|can|do|does|is|are|i want|i need|i\'m looking)\b/.test(q))
    return { text: 'Hi! We speak Dutch primarily, but I can help in English too! 🌍 We sell 100% original Nintendo games (DS, GBA, 3DS, Game Boy). Shipping is €4.95 within the Netherlands, free above €100. How can I help?', quickReplies: ['Show me Pokémon games', 'Shipping info', 'About the shop'] };

  // ── Lange berichten met vraagteken = probeer te helpen ──
  if (q.length > 50 && q.includes('?'))
    return { text: 'Goede vraag! Ik kan je het beste helpen met vragen over onze Nintendo games, verzending, betaling en meer. Kun je je vraag iets specifieker stellen? Dan geef ik je een beter antwoord! 😊', quickReplies: ['Games zoeken', 'Verzendkosten', 'Over de winkel', 'Contact opnemen'] };

  // ── Willekeurig / onzin ──
  if (/^[a-z]{1,2}$/.test(q) || /^\.+$/.test(q) || /^[?!]+$/.test(q) || /^[^a-zA-Z0-9]+$/.test(q))
    return { text: 'Hmm, ik begrijp je niet helemaal. Stel gerust een vraag! Ik kan je helpen met onze games, verzending, betaling en meer. 😊', quickReplies: ['Welke games hebben jullie?', 'Hoe werkt bestellen?', 'Contact opnemen'] };

  // ── Direct product search (before final fallback) ──
  const directSearch = searchProducts(q);
  if (directSearch.length > 0) {
    return {
      text: `Dit heb ik gevonden voor "${input.trim()}":`,
      products: directSearch,
      links: [{ label: 'Meer zoekresultaten', href: `/shop?q=${encodeURIComponent(q)}` }],
      quickReplies: ['Andere game zoeken', 'Filters gebruiken in shop'],
    };
  }

  // ── Smart fallback: probeer woorden als zoekopdracht ──
  if (words.length >= 2) {
    for (const word of words) {
      if (word.length > 3) {
        const partialSearch = searchProducts(word, 4);
        if (partialSearch.length > 0) {
          return {
            text: `Ik vond geen exacte match, maar misschien bedoel je een van deze?`,
            products: partialSearch,
            links: [{ label: 'Zoek in shop', href: `/shop?q=${encodeURIComponent(input.trim())}` }],
            quickReplies: ['Nee, iets anders', 'Alle games bekijken'],
          };
        }
      }
    }
  }

  // ── Ultimate fallback — altijd een vriendelijk antwoord ──
  return {
    text: 'Hmm, daar weet ik niet direct een antwoord op. 🐻 Ik ben Beer, de gaming-beer van Gameshop Enter! Ik kan je het beste helpen met:\n\n🎮 Games zoeken en advies\n📦 Verzending en betaling\n↩️ Retourneren\n💰 Games verkopen\n❓ Winkel informatie\n\nStel gerust een andere vraag!',
    links: [{ label: 'Shop bekijken', href: '/shop' }, { label: 'Contact', href: '/contact' }, { label: 'FAQ', href: '/faq' }],
    quickReplies: ['Welke games hebben jullie?', 'Hoe bestellen?', 'Over de winkel'],
  };
}

// ─── Extract links/products from AI response ────────────────
function parseResponse(text: string): Omit<Message, 'id' | 'role'> {
  const links: { label: string; href: string }[] = [];
  const foundProducts: typeof products[number][] = [];

  const routeMap: Record<string, string> = {
    '/shop': 'Shop', '/inkoop': 'Inkoop', '/contact': 'Contact',
    '/faq': 'FAQ', '/over-ons': 'Over ons', '/retourbeleid': 'Retourbeleid',
    '/winkelwagen': 'Winkelwagen', '/privacybeleid': 'Privacybeleid',
    '/algemene-voorwaarden': 'Voorwaarden',
  };

  Object.entries(routeMap).forEach(([route, label]) => {
    if (text.includes(route)) links.push({ label, href: route });
  });

  const searchMatch = text.match(/\/shop\?q=([^\s)]+)/);
  if (searchMatch) links.push({ label: `Zoek: ${decodeURIComponent(searchMatch[1])}`, href: `/shop?q=${searchMatch[1]}` });

  // Find SKUs
  const skuMatches = text.match(/\b([A-Z]{2,4}-\d{3})\b/g);
  if (skuMatches) {
    skuMatches.forEach(sku => {
      const product = products.find(p => p.sku === sku);
      if (product && !foundProducts.find(fp => fp.sku === sku)) {
        foundProducts.push(product);
        if (!links.find(l => l.href === `/shop/${sku}`)) links.push({ label: product.name, href: `/shop/${sku}` });
      }
    });
  }

  // Find product names
  const lowerText = text.toLowerCase();
  products.forEach(p => {
    if (foundProducts.length < 6 && lowerText.includes(p.name.toLowerCase()) && !foundProducts.find(fp => fp.sku === p.sku)) {
      foundProducts.push(p);
    }
  });

  // Clean route refs from text
  let cleanText = text;
  Object.keys(routeMap).forEach(route => {
    cleanText = cleanText.replace(new RegExp(`\\s*${route.replace(/\//g, '\\/')}(?:\\?[^\\s)]*)?`, 'g'), '');
  });
  cleanText = cleanText.replace(/\s{2,}/g, ' ').trim();

  return {
    text: cleanText || text,
    links: links.length > 0 ? links : undefined,
    products: foundProducts.length > 0 ? foundProducts.slice(0, 6) : undefined,
  };
}

// ─── SSE Stream Parser ──────────────────────────────────────
async function streamResponse(
  messages: ApiMessage[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: () => void,
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, stream: true }),
    });

    if (!res.ok || !res.body) { onError(); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(fullText);
          }
        } catch { /* skip unparseable lines */ }
      }
    }

    onDone(fullText || '');
  } catch {
    onError();
  }
}

// ─── Component ──────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [thinkingPhrase, setThinkingPhrase] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  function handleOpen() {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([{
        id: 'welcome', role: 'bot',
        text: 'Hoi! 👋 Ik ben Beer, de gaming-beer van Gameshop Enter! Stel me gerust een vraag over onze Nintendo games, verzending, betaling en meer!',
        quickReplies: INITIAL_QUICK_REPLIES,
      }]);
    }
  }

  function handleNewChat() {
    setMessages([{
      id: 'welcome-' + Date.now(), role: 'bot',
      text: 'Nieuw gesprek! 🎮 Waarmee kan ik je helpen?',
      quickReplies: INITIAL_QUICK_REPLIES,
    }]);
    setApiHistory([]);
    setAiAvailable(true);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || typing) return;
    const trimmed = text.trim();

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setThinkingPhrase(THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]);

    const newHistory: ApiMessage[] = [...apiHistory, { role: 'user', content: trimmed }];
    setApiHistory(newHistory);

    if (aiAvailable) {
      const streamBotId = `b-${Date.now()}`;

      let streamStarted = false;
      await streamResponse(
        newHistory,
        (partialText) => {
          if (!streamStarted) {
            streamStarted = true;
            setTyping(false);
          }
          setMessages(prev => {
            const existing = prev.find(m => m.id === streamBotId);
            if (existing) {
              return prev.map(m => m.id === streamBotId ? { ...m, text: partialText, isStreaming: true } : m);
            }
            return [...prev, { id: streamBotId, role: 'bot' as const, text: partialText, isStreaming: true }];
          });
          scrollToBottom();
        },
        (fullText) => {
          setTyping(false);
          if (fullText) {
            const parsed = parseResponse(fullText);
            setMessages(prev => prev.map(m =>
              m.id === streamBotId ? { ...m, ...parsed, isStreaming: false } : m
            ));
            setApiHistory(prev => [...prev, { role: 'assistant', content: fullText }]);
          } else {
            const fb = fallbackResponse(trimmed);
            setMessages(prev => {
              const hasStream = prev.find(m => m.id === streamBotId);
              if (hasStream) return prev.map(m => m.id === streamBotId ? { id: streamBotId, role: 'bot' as const, ...fb, isStreaming: false } : m);
              return [...prev, { id: streamBotId, role: 'bot' as const, ...fb }];
            });
            setApiHistory(prev => [...prev, { role: 'assistant', content: fb.text }]);
          }
        },
        () => {
          setAiAvailable(false);
          setTyping(false);
          const fb = fallbackResponse(trimmed);
          setMessages(prev => [...prev, { id: streamBotId, role: 'bot' as const, ...fb }]);
          setApiHistory(prev => [...prev, { role: 'assistant', content: fb.text }]);
        },
      );
    } else {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
      const fb = fallbackResponse(trimmed);
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: 'bot', ...fb }]);
      setApiHistory(prev => [...prev, { role: 'assistant', content: fb.text }]);
      setTyping(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot' && !m.isStreaming);
  const showQuickReplies = lastBotMsg?.quickReplies && !typing;

  return (
    <>
      {/* Floating chat trigger */}
      <button
        onClick={() => open ? setOpen(false) : handleOpen()}
        aria-label={open ? 'Chat sluiten' : 'Chat openen'}
        className="fixed bottom-5 right-5 z-[1000] group"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className={`
          relative w-16 h-16 rounded-full shadow-lg
          bg-gradient-to-br from-emerald-500 to-teal-600
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${open ? 'scale-90 rotate-180' : 'scale-100 hover:scale-110'}
          group-hover:shadow-emerald-500/30 group-hover:shadow-xl
        `}>
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <Image src="/images/mascot.svg" alt="Chat met Beer" width={48} height={48} className="rounded-full" />
          )}
          {!open && !hasOpened && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
          )}
        </div>
      </button>

      {/* Chat window */}
      <div className={`
        fixed z-[999]
        sm:bottom-24 sm:right-5 sm:w-[440px] sm:max-w-[calc(100vw-40px)] sm:rounded-2xl
        max-sm:inset-0 max-sm:rounded-none
        overflow-hidden shadow-2xl shadow-black/25
        transition-all duration-300 ease-out sm:origin-bottom-right
        flex flex-col bg-white
        ${open ? 'scale-100 opacity-100 sm:translate-y-0' : 'scale-95 opacity-0 sm:translate-y-4 pointer-events-none max-sm:scale-100 max-sm:translate-y-full'}
      `} style={{ maxHeight: open ? 'calc(100vh - 40px)' : undefined }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src="/images/mascot.svg" alt="Beer" width={36} height={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Beer</p>
            <p className="text-emerald-100 text-xs flex items-center gap-1.5">
              {typing ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block animate-pulse" /> {thinkingPhrase}</>
              ) : aiAvailable ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" /> AI-assistent</>
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" /> Online</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleNewChat} title="Nieuw gesprek" className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button onClick={() => setOpen(false)} title="Sluiten" className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3 min-h-0 sm:h-[480px] sm:max-h-[60vh]" style={{ scrollBehavior: 'smooth' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.2s_ease]`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden shadow-sm">
                  <Image src="/images/mascot.svg" alt="" width={28} height={28} />
                </div>
              )}
              <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`
                  px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-sm shadow-sm'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'
                  }
                `}>
                  {msg.text}
                  {msg.isStreaming && <span className="inline-block w-1 h-4 bg-emerald-500 ml-0.5 animate-pulse align-middle" />}
                </div>

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && !msg.isStreaming && (
                  <div className="space-y-1.5 w-full">
                    {msg.products.map(p => (
                      <Link key={p.sku} href={`/shop/${p.sku}`}
                        className="flex items-center gap-2.5 p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                        {p.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                            <Image src={p.image} alt={p.name} width={48} height={48} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.platform} · {p.condition} · {p.completeness}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-emerald-600">&euro;{p.price.toFixed(2)}</p>
                          <p className="text-[9px] text-emerald-500">Bekijk</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Links */}
                {msg.links && msg.links.length > 0 && !msg.isStreaming && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.links.map(link => (
                      <Link key={link.href} href={link.href}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100">
                        {link.label}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2.5 items-start animate-[fadeIn_0.2s_ease]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                <Image src="/images/mascot.svg" alt="" width={28} height={28} />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick replies */}
          {showQuickReplies && lastBotMsg?.quickReplies && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {lastBotMsg.quickReplies.map(qr => (
                <button key={qr} onClick={() => sendMessage(qr)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-white border border-emerald-200 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm active:scale-95">
                  {qr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="bg-white border-t border-slate-100 p-3 flex gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Stel een vraag..."
            disabled={typing}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder:text-slate-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex-shrink-0 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
