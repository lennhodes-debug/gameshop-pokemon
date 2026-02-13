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
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Quick Replies ──────────────────────────────────────────
const INITIAL_QUICK_REPLIES = [
  'Welke games hebben jullie?',
  'Wat zijn de verzendkosten?',
  'Kan ik games verkopen?',
  'Zijn de games origineel?',
  'Wat is de staat van de games?',
  'Hoe kan ik betalen?',
];

// ─── Product search helper ──────────────────────────────────
function searchProducts(query: string, limit = 4): typeof products[number][] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 2);

  const scored = products.map(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    const platform = p.platform.toLowerCase();

    // Exact name match
    if (name.includes(q)) score += 10;
    // Term matches
    terms.forEach(t => {
      if (name.includes(t)) score += 3;
      if (platform.includes(t)) score += 2;
      if (p.genre.toLowerCase().includes(t)) score += 1;
    });
    // Platform shortcuts
    if (/\bgba\b/.test(q) && platform.includes('advance')) score += 5;
    if (/\bds\b/.test(q) && platform.includes('nintendo ds')) score += 5;
    if (/\b3ds\b/.test(q) && platform.includes('3ds')) score += 5;
    if (/\bgb\b/.test(q) && platform.includes('game boy')) score += 4;
    // Premium boost
    if (p.isPremium) score += 0.5;

    return { product: p, score };
  }).filter(s => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.product);
}

// ─── Comprehensive fallback response engine ─────────────────
function fallbackResponse(input: string): { text: string; products?: typeof products[number][]; links?: { label: string; href: string }[]; quickReplies?: string[] } {
  const q = input.toLowerCase().trim();

  // ── Begroetingen ──
  if (/^(hoi|hi|hey|hallo|hello|goedemorgen|goedemiddag|goedenavond|yo|dag|moin|heey|hee|wazzup|sup)\b/.test(q))
    return {
      text: 'Hoi! Ik ben Beertje, de mascotte van Gameshop Enter! Ik help je graag met al je vragen over onze Nintendo games, verzending, retour en meer. Wat kan ik voor je doen?',
      quickReplies: ['Welke games hebben jullie?', 'Wat zijn de verzendkosten?', 'Vertel over jullie winkel'],
    };

  // ── Afscheid ──
  if (/^(doei|bye|dag|tot ziens|later|fijne dag|slaap lekker)\b/.test(q))
    return { text: 'Tot ziens! Bedankt voor je bezoek. Als je nog vragen hebt, ben ik er altijd!' };

  // ── Bedankt ──
  if (/bedankt|thanks|dankje|dankjewel|top|super|geweldig|perfect|nice|mooi|fijn|cool/.test(q))
    return {
      text: 'Graag gedaan! Nog meer vragen? Stel ze gerust! Ik help je met plezier.',
      quickReplies: ['Ik wil een game zoeken', 'Hoe werkt verzending?'],
    };

  // ── Compleet assortiment ──
  if (/welke (games|spellen)|wat (heb|hebben) jullie|assortiment|collectie|aanbod|hoeveel (games|spellen)/.test(q)) {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
    return {
      text: `We hebben ${products.length} originele Nintendo games in ons assortiment!\n\n${Object.entries(counts).map(([k, v]) => `${k}: ${v} games`).join('\n')}\n\nElke game is persoonlijk getest en gefotografeerd.`,
      links: [{ label: 'Bekijk alle games', href: '/shop' }],
      quickReplies: ['Welke Pokémon games?', 'Wat is de duurste game?', 'Welke zijn het goedkoopst?'],
    };
  }

  // ── Specifiek platform zoeken ──
  if (/game\s*boy\s*advance|gba\s*(games)?/.test(q)) {
    const found = products.filter(p => p.platform.toLowerCase().includes('advance'));
    return {
      text: `We hebben ${found.length} Game Boy Advance games! Hier zijn er een paar:`,
      products: found.slice(0, 4),
      links: [{ label: 'Alle GBA games', href: '/shop?q=game+boy+advance' }],
    };
  }
  if (/nintendo\s*ds\b|nds\b/.test(q) && !/3ds/.test(q)) {
    const found = products.filter(p => p.platform === 'Nintendo DS');
    return {
      text: `We hebben ${found.length} Nintendo DS games! Hier zijn er een paar:`,
      products: found.slice(0, 4),
      links: [{ label: 'Alle DS games', href: '/shop?q=nintendo+ds' }],
    };
  }
  if (/3ds/.test(q)) {
    const found = products.filter(p => p.platform.includes('3DS'));
    return {
      text: `We hebben ${found.length} Nintendo 3DS games! Hier zijn er een paar:`,
      products: found.slice(0, 4),
      links: [{ label: 'Alle 3DS games', href: '/shop?q=3ds' }],
    };
  }
  if (/game\s*boy(?!\s*advance)|\bgb\b|\bgbc\b|game\s*boy\s*color/.test(q)) {
    const found = products.filter(p => p.platform.toLowerCase().includes('game boy') && !p.platform.toLowerCase().includes('advance'));
    return {
      text: `We hebben ${found.length} Game Boy games! Klassiekers uit de jaren '90.`,
      products: found.slice(0, 4),
      links: [{ label: 'Alle Game Boy games', href: '/shop?q=game+boy' }],
    };
  }

  // ── Pokémon specifiek ──
  if (/pok[eé]mon|pikachu|charizard/.test(q)) {
    const pokemonGames = products.filter(p => p.name.toLowerCase().includes('pok'));
    return {
      text: `Pokémon fan? We hebben ${pokemonGames.length} Pokémon games! Van klassieke Game Boy titels tot DS en GBA. Elke game is 100% origineel en persoonlijk getest.`,
      products: pokemonGames.slice(0, 4),
      links: [{ label: 'Alle Pokémon games', href: '/shop?q=pokemon' }],
      quickReplies: ['Welke is het zeldzaamst?', 'Zijn ze compleet in doos?'],
    };
  }

  // ── Zelda ──
  if (/zelda|link|hyrule|triforce/.test(q)) {
    const found = searchProducts('zelda');
    return {
      text: found.length > 0
        ? 'The Legend of Zelda is een van de beste Nintendo series ooit! Hier zijn onze Zelda games:'
        : 'Op dit moment hebben we helaas geen Zelda games op voorraad. Kijk regelmatig terug, ons assortiment wordt vaak aangevuld!',
      products: found.length > 0 ? found : undefined,
      links: [{ label: 'Zoek Zelda games', href: '/shop?q=zelda' }],
    };
  }

  // ── Mario ──
  if (/mario|luigi|mushroom|toad/.test(q)) {
    const found = searchProducts('mario');
    return {
      text: found.length > 0
        ? 'Mario games zijn altijd populair! Hier zijn onze Mario titels:'
        : 'Op dit moment hebben we helaas geen Mario games op voorraad. Kijk regelmatig terug!',
      products: found.length > 0 ? found : undefined,
      links: [{ label: 'Zoek Mario games', href: '/shop?q=mario' }],
    };
  }

  // ── Verzending ──
  if (/verzend|bezorg|lever|shipping|postnl|pakket|track|trace|wanneer (heb|krijg)|levertijd|hoe lang duurt/.test(q))
    return {
      text: 'Over verzending:\n\n- Verzendkosten: €4,95 via PostNL\n- Gratis verzending bij bestellingen boven €100\n- Levertijd: 1-3 werkdagen\n- Alle bestellingen met track & trace\n- Zorgvuldig verpakt met bubbeltjeswrap\n\nBestel voor 16:00 uur en we proberen dezelfde dag te verzenden!',
      quickReplies: ['Verzenden jullie ook naar België?', 'Hoe werkt retourneren?'],
    };

  // ── België / internationaal ──
  if (/belgi[ëe]|internationaal|buitenland|europa|duitsland/.test(q))
    return {
      text: 'Op dit moment verzenden we alleen binnen Nederland. We hopen in de toekomst ook naar België en andere landen te kunnen verzenden! Houd onze website in de gaten.',
      quickReplies: ['Wat zijn de verzendkosten?', 'Hoe kan ik contact opnemen?'],
    };

  // ── Betaling ──
  if (/betal|ideal|creditcard|paypal|afrekenen|bancontact|apple\s*pay|pin|contant|klarna|afterpay/.test(q))
    return {
      text: 'We accepteren de volgende betaalmethoden:\n\n- iDEAL (alle Nederlandse banken)\n- Creditcard (Visa, Mastercard)\n- PayPal\n- Bancontact\n- Apple Pay\n\nAlle betalingen verlopen veilig en versleuteld.',
      links: [{ label: 'Naar de winkelwagen', href: '/winkelwagen' }],
      quickReplies: ['Is mijn betaling veilig?', 'Kan ik achteraf betalen?'],
    };

  // ── Achteraf betalen ──
  if (/achteraf|klarna|afterpay|betaling.*(later|achteraf)/.test(q))
    return { text: 'Op dit moment bieden we geen achteraf betalen aan. We accepteren iDEAL, Creditcard, PayPal, Bancontact en Apple Pay.' };

  // ── Retour ──
  if (/retour|terugstu|ruil|terug|garantie|defect|kapot|werkt niet|stuk/.test(q))
    return {
      text: 'Ons retourbeleid:\n\n- 14 dagen bedenktijd\n- Gratis retourneren\n- Niet tevreden? Stuur het terug en ontvang je geld terug\n- Defect? We lossen het direct op of sturen een vervanging\n- Alle games zijn getest voor verzending\n\nBij problemen kun je altijd contact opnemen!',
      links: [{ label: 'Retourbeleid', href: '/retourbeleid' }, { label: 'Contact', href: '/contact' }],
      quickReplies: ['Hoe stuur ik iets terug?', 'Wat als mijn game niet werkt?'],
    };

  // ── Hoe retourneren ──
  if (/hoe.*(retour|terugsturen)|stap.*(retour|terug)/.test(q))
    return {
      text: 'Retourneren is simpel:\n\n1. Neem contact met ons op via email of contactformulier\n2. Je ontvangt een retourlabel\n3. Verpak het product goed en stuur het op\n4. Na ontvangst krijg je je geld binnen 3-5 werkdagen terug\n\nMakkelijk toch?',
      links: [{ label: 'Contactformulier', href: '/contact' }],
    };

  // ── Inkoop / Games verkopen ──
  if (/verkop|inkoop|inruil|trade|sell|opkop|wil.*(verkopen|kwijt)|games?.*(over|weg)|aanbied/.test(q))
    return {
      text: 'Wil je Nintendo games verkopen? Dat kan! Wij kopen Nintendo games op tegen eerlijke prijzen.\n\nZo werkt het:\n1. Bekijk onze inkoopprijzen op de inkoop pagina\n2. Neem contact op met welke games je hebt\n3. We doen een bod\n4. Je stuurt de games op (wij betalen verzending)\n5. Na controle ontvang je direct je betaling\n\nWe kopen DS, GBA, 3DS, Game Boy en meer!',
      links: [{ label: 'Inkoopprijzen bekijken', href: '/inkoop' }, { label: 'Contact opnemen', href: '/contact' }],
      quickReplies: ['Wat bieden jullie voor Pokémon games?', 'Hoeveel krijg ik voor mijn games?'],
    };

  // ── Originaliteit ──
  if (/origineel|nep|fake|echt|authentiek|namaak|reproductie|repro|bootleg/.test(q))
    return {
      text: '100% Origineel — dat is onze belofte!\n\n- Alle games zijn gegarandeerd originele Nintendo producten\n- Persoonlijk gecontroleerd op echtheid\n- Elke game wordt getest op een echte console\n- We verkopen NOOIT reproducties of bootlegs\n- Met eigen foto\'s: wat je ziet is wat je krijgt\n\nOnze 5.0 rating uit 1.360+ reviews bewijst het!',
      quickReplies: ['Hoe controleren jullie dat?', 'Wat als het toch nep is?'],
    };

  // ── Hoe controleren ──
  if (/hoe.*(controleer|test|check)|echt.*(controleer|test)|nep.*(herkennen|checken)/.test(q))
    return {
      text: 'We controleren elke game op meerdere manieren:\n\n- Visuele inspectie van de cartridge (labels, plastic, schroeven)\n- PCB-controle op chipmarkering\n- Test op echte Nintendo hardware\n- Vergelijking met bekende originelen\n\nJaren ervaring met Nintendo producten zorgt ervoor dat we nep direct herkennen.',
    };

  // ── Conditie ──
  if (/conditie|staat|kwaliteit|gebruikt|nieuw|cib|compleet|los|cartridge|doos|manual|handleiding/.test(q))
    return {
      text: 'Over de conditie van onze games:\n\n- "Zo goed als nieuw": nauwelijks gebruikssporen\n- "Gebruikt": normale gebruikssporen maar perfect werkend\n- "Nieuw": ongeopend in originele verpakking\n\nCIB = Compleet in Doos (game + doosje + handleiding)\nLosse cartridge = alleen het spelletje\n\nBij elke game staan eigen foto\'s — wat je ziet is wat je krijgt!',
      quickReplies: ['Zijn alle games getest?', 'Hebben jullie CIB games?'],
    };

  // ── CIB specifiek ──
  if (/cib|compleet in doos|met doos|met handleiding/.test(q)) {
    const cibGames = products.filter(p => p.completeness.toLowerCase().includes('compleet'));
    return {
      text: `We hebben ${cibGames.length} games die Compleet in Doos (CIB) zijn — inclusief originele doos en handleiding. Perfect voor verzamelaars!`,
      products: cibGames.slice(0, 4),
      links: [{ label: 'Alle CIB games', href: '/shop' }],
    };
  }

  // ── Contact ──
  if (/contact|email|mail|bereik|instagram|bel|telefoon|whatsapp|dm/.test(q))
    return {
      text: 'Je kunt ons bereiken via:\n\n- Email: gameshopenter@gmail.com\n- Instagram: @gameshopenter (DM\'s open)\n- Contactformulier op de website\n\nWe reageren meestal binnen 24 uur! Het liefst via email voor uitgebreide vragen.',
      links: [{ label: 'Contactformulier', href: '/contact' }],
      quickReplies: ['Wat zijn jullie openingstijden?'],
    };

  // ── Over ons / Wie ──
  if (/wie (ben|zijn)|over (jullie|ons|gameshop)|eigenaar|oprichter|verhaal|lenn|wanneer opgericht/.test(q))
    return {
      text: 'Gameshop Enter is opgericht door Lenn Hodes — dé Nintendo specialist van Nederland!\n\nOnze missie: elke Nintendo fan voorzien van 100% originele games tegen eerlijke prijzen.\n\nCijfers:\n- 3.000+ tevreden klanten\n- 5.0 uit 1.360+ reviews\n- Elke game persoonlijk getest met eigen foto\'s\n- Specialist in DS, GBA, 3DS, Game Boy en meer',
      links: [{ label: 'Lees meer over ons', href: '/over-ons' }],
    };

  // ── Reviews ──
  if (/review|beooreel|sterren|rating|ervaring|mening/.test(q))
    return {
      text: 'We zijn trots op onze beoordelingen!\n\n- 5.0 gemiddelde score\n- 1.360+ reviews\n- 3.000+ tevreden klanten\n\nOnze klanten waarderen vooral de kwaliteit van de games, snelle verzending en goede communicatie.',
      links: [{ label: 'Meer over ons', href: '/over-ons' }],
    };

  // ── Prijs / Budget ──
  if (/prijs|kost|duur|goedkoop|budget|onder\s*\d|tot\s*\d|vanaf/.test(q)) {
    const minPrice = Math.min(...products.map(p => p.price));
    const maxPrice = Math.max(...products.map(p => p.price));
    const budgetMatch = q.match(/(?:onder|tot|max(?:imaal)?)\s*[€]?\s*(\d+)/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]);
      const found = products.filter(p => p.price <= budget).sort((a, b) => b.price - a.price);
      return {
        text: `We hebben ${found.length} games onder €${budget}! Hier zijn de beste opties:`,
        products: found.slice(0, 4),
        links: [{ label: 'Alle games bekijken', href: '/shop' }],
      };
    }
    return {
      text: `Onze prijzen variëren van €${minPrice.toFixed(2)} tot €${maxPrice.toFixed(2)}.\n\nPrijzen zijn altijd eerlijk en marktconform. Premium of zeldzame games zijn natuurlijk wat duurder.`,
      links: [{ label: 'Shop — sorteer op prijs', href: '/shop' }],
      quickReplies: ['Wat is de goedkoopste game?', 'Welke games zijn premium?'],
    };
  }

  // ── Goedkoopste game ──
  if (/goedkoopst|laagste prijs|cheapest/.test(q)) {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    return {
      text: 'Dit zijn onze voordeligste games:',
      products: sorted.slice(0, 4),
    };
  }

  // ── Duurste / Premium ──
  if (/duurste|premium|zeldzaam|rare|waardevol|exclusief/.test(q)) {
    const sorted = [...products].sort((a, b) => b.price - a.price);
    return {
      text: 'Dit zijn onze premium / zeldzaamste games:',
      products: sorted.slice(0, 4),
      quickReplies: ['Waarom zijn sommige games zo duur?'],
    };
  }

  // ── Waarom duur ──
  if (/waarom.*(duur|prijs)|prijs.*(hoog|veel)/.test(q))
    return { text: 'Retro Nintendo games stijgen in waarde door beperkte oplages en groeiende vraag van verzamelaars. Factoren die de prijs bepalen:\n\n- Zeldzaamheid van de game\n- Conditie (nieuw vs gebruikt)\n- Compleetheid (CIB is meer waard)\n- Populariteit van de franchise\n- Europese (PAL) versie vs andere regio\'s\n\nOnze prijzen zijn altijd eerlijk en gebaseerd op actuele marktwaarden.' };

  // ── FAQ ──
  if (/faq|veelgestelde|veel\s*gesteld/.test(q))
    return {
      text: 'Op onze FAQ pagina vind je antwoord op de meest gestelde vragen over bestellen, verzending, retourneren en meer.',
      links: [{ label: 'Naar de FAQ', href: '/faq' }],
    };

  // ── Privacy ──
  if (/privacy|gegevens|data|gdpr|avg/.test(q))
    return {
      text: 'We gaan zorgvuldig om met je persoonsgegevens. Je gegevens worden alleen gebruikt voor het verwerken van je bestelling. We delen niets met derden.',
      links: [{ label: 'Privacybeleid', href: '/privacybeleid' }],
    };

  // ── Algemene voorwaarden ──
  if (/algemene voorwaarden|terms|voorwaarden/.test(q))
    return {
      text: 'Onze algemene voorwaarden vind je op de volgende pagina:',
      links: [{ label: 'Algemene voorwaarden', href: '/algemene-voorwaarden' }],
    };

  // ── Openingstijden ──
  if (/openingstijd|open|gesloten|fysieke winkel|locatie|adres|bezoek|langs\s*komen/.test(q))
    return {
      text: 'Gameshop Enter is een online-only webshop — we hebben geen fysieke winkel. Maar dat betekent dat we overal in Nederland kunnen leveren!\n\nBestel gewoon via de webshop en je ontvangt je games binnen 1-3 werkdagen.',
      quickReplies: ['Hoe kan ik bestellen?', 'Wat zijn de verzendkosten?'],
    };

  // ── Hoe bestellen ──
  if (/hoe.*(bestel|koop|order)|bestel.*(proces|stappen)|order plaatsen/.test(q))
    return {
      text: 'Bestellen is simpel:\n\n1. Zoek je game in onze shop\n2. Klik op "In winkelwagen"\n3. Ga naar de winkelwagen\n4. Vul je gegevens in\n5. Kies een betaalmethode\n6. Betaal en klaar!\n\nJe ontvangt direct een bevestiging per email.',
      links: [{ label: 'Naar de shop', href: '/shop' }, { label: 'Winkelwagen', href: '/winkelwagen' }],
    };

  // ── Specifieke game zoeken ──
  if (/zoek|heb.*(je|jullie).*(game|spel)|is\s.*\s(er|beschikbaar|op voorraad)/.test(q) || q.includes('hebben jullie')) {
    const found = searchProducts(q);
    if (found.length > 0) {
      return {
        text: 'Dit heb ik gevonden:',
        products: found,
        links: [{ label: 'Meer zoekresultaten', href: `/shop?q=${encodeURIComponent(q)}` }],
      };
    }
    return {
      text: 'Ik kon die game helaas niet vinden in ons assortiment. Misschien kun je het proberen in onze shop met de zoekfunctie, of neem contact op — we kunnen misschien helpen!',
      links: [{ label: 'Zoek in de shop', href: '/shop' }, { label: 'Contact', href: '/contact' }],
    };
  }

  // ── Vergelijking / Wat is beter ──
  if (/wat is beter|verschil tussen|vergelijk|aanraden|advies|tip|suggestie|welke.*kopen/.test(q))
    return {
      text: 'Het hangt af van je voorkeur! Mijn tip: kijk naar de beschrijvingen op de productpagina\'s en welk genre je leuk vindt. Of vertel me wat voor soort game je zoekt, dan help ik je verder!',
      quickReplies: ['Ik zoek een RPG', 'Ik zoek een platformer', 'Ik zoek iets voor kinderen'],
    };

  // ── Genre zoeken ──
  if (/rpg|role.?playing/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'rpg').slice(0, 4);
    return {
      text: found.length > 0 ? 'Dit zijn onze RPG games:' : 'We hebben momenteel geen RPG games op voorraad.',
      products: found.length > 0 ? found : undefined,
      links: [{ label: 'Alle games', href: '/shop' }],
    };
  }
  if (/platform(er|spel)|jump|spring/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'platformer').slice(0, 4);
    return {
      text: found.length > 0 ? 'Dit zijn onze platformer games:' : 'We hebben momenteel geen platformer games op voorraad.',
      products: found.length > 0 ? found : undefined,
      links: [{ label: 'Alle games', href: '/shop' }],
    };
  }
  if (/actie|action|avontuur|adventure/.test(q)) {
    const found = products.filter(p => ['Actie', 'Avontuur'].includes(p.genre)).slice(0, 4);
    return {
      text: found.length > 0 ? 'Dit zijn onze actie/avontuur games:' : 'We hebben momenteel geen actie games op voorraad.',
      products: found.length > 0 ? found : undefined,
    };
  }

  // ── Voor kinderen ──
  if (/kind(eren)?|jong|geschikt voor|leeftijd|family|gezin/.test(q)) {
    const found = searchProducts('pokemon');
    return {
      text: 'Pokémon games zijn perfect voor kinderen! Geschikt voor alle leeftijden en altijd leuk. Daarnaast zijn Mario en Kirby games ook een aanrader.',
      products: found,
    };
  }

  // ── Nieuw op voorraad ──
  if (/nieuw(e)?( games)?( binnen)?|net binnen|laatste|recent|toegevoegd/.test(q))
    return {
      text: 'We voegen regelmatig nieuwe games toe aan ons assortiment! Check onze shop voor de nieuwste toevoegingen. Volg ons ook op Instagram (@gameshopenter) om als eerste te weten wanneer er nieuwe games binnenkomen.',
      links: [{ label: 'Naar de shop', href: '/shop' }],
    };

  // ── Verzamelaar / Collector ──
  if (/verzamel|collector|collectie|raar|zeldzaam|mint|sealed/.test(q))
    return {
      text: 'Als verzamelaar ben je bij ons aan het juiste adres! We hebben:\n\n- CIB (Compleet in Doos) games\n- Zeldzame titels\n- Alle games zijn 100% origineel\n- Europese PAL versies\n\nElke game heeft eigen foto\'s zodat je precies de conditie kunt zien.',
      links: [{ label: 'Shop bekijken', href: '/shop' }],
      quickReplies: ['Welke zijn het zeldzaamst?', 'Hebben jullie CIB games?'],
    };

  // ── Wie is Beertje ──
  if (/wie ben (je|jij)|beertje|mascotte|bot|robot|ai|kunstmatige/.test(q))
    return {
      text: 'Ik ben Beertje — de mascotte en assistent van Gameshop Enter! Ik ken ons hele assortiment en kan je helpen met vragen over games, verzending, retour en meer. Ik combineer slimme patronen met AI om je zo goed mogelijk te helpen!',
    };

  // ── Grappig / Easter egg ──
  if (/grap|mop|lach|grappig|funny|joke/.test(q))
    return { text: 'Waarom ging de Pokémon naar de dokter? Omdat hij een PIKA-boo had! ...Oké dat was slecht. Laat me je liever helpen met games zoeken!' };

  if (/konami|up up down|cheat/.test(q))
    return { text: 'Up, Up, Down, Down, Left, Right, Left, Right, B, A... Helaas geen extra levens hier, maar wel de beste Nintendo games van Nederland!' };

  // ── Korting ──
  if (/korting|coupon|code|actie|aanbieding|sale|uitverkoop|deal|black\s*friday/.test(q))
    return {
      text: 'Op dit moment hebben we geen actieve kortingscodes. Maar we hebben wel gratis verzending bij bestellingen boven €100! Houd onze Instagram in de gaten voor toekomstige acties.',
      quickReplies: ['Wanneer is de volgende actie?', 'Hoe krijg ik gratis verzending?'],
    };

  // ── Gratis verzending ──
  if (/gratis verzend|free shipping|100/.test(q))
    return { text: 'Bij bestellingen boven €100 is de verzending gratis! Anders betaal je €4,95 voor PostNL verzending met track & trace.' };

  // ── Veiligheid ──
  if (/veilig|betrouwbaar|scam|oplichting|trust|vertrouw/.test(q))
    return {
      text: 'Gameshop Enter is 100% betrouwbaar:\n\n- 5.0 uit 1.360+ reviews\n- 3.000+ tevreden klanten\n- Veilige betaling via iDEAL, PayPal, etc.\n- 14 dagen retourrecht\n- Alle games 100% origineel en getest\n- KvK geregistreerd\n\nJe kunt met een gerust hart bij ons bestellen!',
      links: [{ label: 'Reviews en meer', href: '/over-ons' }],
    };

  // ── Direct product naam herkennen ──
  const directSearch = searchProducts(q);
  if (directSearch.length > 0) {
    return {
      text: 'Dit heb ik gevonden in ons assortiment:',
      products: directSearch,
      links: [{ label: 'Meer zoekresultaten', href: `/shop?q=${encodeURIComponent(q)}` }],
    };
  }

  // ── Fallback ──
  return {
    text: 'Hmm, dat is een goede vraag! Ik kan je helpen met vragen over onze games, verzending, retour, inkoop en meer. Probeer het anders te formuleren, of neem contact met ons op!',
    links: [{ label: 'Naar de shop', href: '/shop' }, { label: 'Contact', href: '/contact' }],
    quickReplies: ['Welke games hebben jullie?', 'Hoe kan ik bestellen?', 'Vertel over jullie winkel'],
  };
}

// ─── Extract links/products from AI response ────────────────
function parseResponse(text: string): Omit<Message, 'id' | 'role'> {
  const links: { label: string; href: string }[] = [];
  const foundProducts: typeof products[number][] = [];

  const routeMap: Record<string, string> = {
    '/shop': 'Naar de shop', '/inkoop': 'Inkoopprijzen', '/contact': 'Contact',
    '/faq': 'FAQ', '/over-ons': 'Over ons', '/retourbeleid': 'Retourbeleid',
    '/winkelwagen': 'Winkelwagen', '/privacybeleid': 'Privacybeleid',
  };

  Object.entries(routeMap).forEach(([route, label]) => {
    if (text.includes(route)) links.push({ label, href: route });
  });

  const searchMatch = text.match(/\/shop\?q=([^\s)]+)/);
  if (searchMatch) links.push({ label: `Zoek: ${decodeURIComponent(searchMatch[1])}`, href: `/shop?q=${searchMatch[1]}` });

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

  const lowerText = text.toLowerCase();
  products.forEach(p => {
    if (foundProducts.length < 4 && lowerText.includes(p.name.toLowerCase()) && !foundProducts.find(fp => fp.sku === p.sku)) {
      foundProducts.push(p);
    }
  });

  let cleanText = text;
  Object.keys(routeMap).forEach(route => {
    cleanText = cleanText.replace(new RegExp(`\\s*${route.replace('/', '\\/')}(?:\\?[^\\s)]*)?`, 'g'), '');
  });
  cleanText = cleanText.replace(/\s{2,}/g, ' ').trim();

  return {
    text: cleanText || text,
    links: links.length > 0 ? links : undefined,
    products: foundProducts.length > 0 ? foundProducts.slice(0, 4) : undefined,
  };
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  function handleOpen() {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([{
        id: 'welcome',
        role: 'bot',
        text: 'Hoi! Ik ben Beertje, de slimme assistent van Gameshop Enter! Stel me een vraag over onze Nintendo games, verzending, retour en meer.',
        quickReplies: INITIAL_QUICK_REPLIES,
      }]);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || typing) return;
    const trimmed = text.trim();

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const newHistory: ApiMessage[] = [...apiHistory, { role: 'user', content: trimmed }];
    setApiHistory(newHistory);

    let botMsg: Message;

    if (aiAvailable) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newHistory }),
        });

        if (res.ok) {
          const data = await res.json();
          const responseText = data.reply || '';
          if (responseText) {
            const parsed = parseResponse(responseText);
            botMsg = { id: `b-${Date.now()}`, role: 'bot', ...parsed };
          } else {
            const fb = fallbackResponse(trimmed);
            botMsg = { id: `b-${Date.now()}`, role: 'bot', ...fb };
          }
        } else {
          setAiAvailable(false);
          const fb = fallbackResponse(trimmed);
          botMsg = { id: `b-${Date.now()}`, role: 'bot', ...fb };
        }
      } catch {
        setAiAvailable(false);
        const fb = fallbackResponse(trimmed);
        botMsg = { id: `b-${Date.now()}`, role: 'bot', ...fb };
      }
    } else {
      const fb = fallbackResponse(trimmed);
      botMsg = { id: `b-${Date.now()}`, role: 'bot', ...fb };
    }

    setMessages(prev => [...prev, botMsg]);
    setApiHistory(prev => [...prev, { role: 'assistant', content: botMsg.text }]);
    setTyping(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // Get quick replies from the last bot message
  const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot');
  const showQuickReplies = lastBotMsg?.quickReplies && !typing;

  return (
    <>
      {/* Chat bubble trigger */}
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
          ${open ? 'scale-90 rotate-90' : 'scale-100 hover:scale-110'}
          group-hover:shadow-emerald-500/25 group-hover:shadow-xl
        `}>
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <Image src="/images/mascot.svg" alt="Chat met Beertje" width={48} height={48} className="rounded-full" />
          )}
          {!open && !hasOpened && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
          )}
        </div>
      </button>

      {/* Chat window */}
      <div className={`
        fixed bottom-24 right-5 z-[999]
        w-[400px] max-w-[calc(100vw-40px)]
        rounded-2xl overflow-hidden
        shadow-2xl shadow-black/20
        transition-all duration-300 ease-out origin-bottom-right
        ${open ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src="/images/mascot.svg" alt="Beertje" width={36} height={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Beertje</p>
            <p className="text-emerald-100 text-xs flex items-center gap-1.5">
              {aiAvailable ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block animate-pulse" /> AI-assistent</>
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" /> Online</>
              )}
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-[420px] max-h-[60vh] overflow-y-auto bg-slate-50 p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden shadow-sm">
                  <Image src="/images/mascot.svg" alt="" width={28} height={28} />
                </div>
              )}
              <div className={`max-w-[82%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`
                  px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-sm shadow-sm'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'
                  }
                `}>
                  {msg.text}
                </div>

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="space-y-1.5 w-full">
                    {msg.products.map(p => (
                      <Link key={p.sku} href={`/shop/${p.sku}`}
                        className="flex items-center gap-2.5 p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                        {p.image && (
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                            <Image src={p.image} alt={p.name} width={44} height={44} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.platform} · {p.condition}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-600 flex-shrink-0">&euro;{p.price.toFixed(2)}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Links */}
                {msg.links && msg.links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.links.map(link => (
                      <Link key={link.href} href={link.href}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100">
                        {link.label}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2.5 items-start">
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

          {/* Context-aware quick replies */}
          {showQuickReplies && lastBotMsg?.quickReplies && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {lastBotMsg.quickReplies.map(qr => (
                <button key={qr} onClick={() => sendMessage(qr)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-white border border-emerald-200 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm">
                  {qr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white border-t border-slate-100 p-3 flex gap-2">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Stel een vraag..."
            className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-400" />
          <button type="submit" disabled={!input.trim() || typing}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
