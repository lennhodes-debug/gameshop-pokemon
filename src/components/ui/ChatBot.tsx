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
  'Wat is de conditie van de games?',
  'Hoe kan ik betalen?',
  'Wat zijn jullie populairste games?',
  'Ik zoek een cadeau',
];

const THINKING_PHRASES = [
  'Even denken...',
  'Ik zoek het op...',
  'Momentje...',
  'Ik check het even...',
  'Even kijken...',
];

// ─── Product search helper ──────────────────────────────────
function searchProducts(query: string, limit = 4): typeof products[number][] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 2);

  const scored = products.map(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    const platform = p.platform.toLowerCase();
    const desc = p.description?.toLowerCase() || '';

    if (name.includes(q)) score += 10;
    if (name === q) score += 20;
    terms.forEach(t => {
      if (name.includes(t)) score += 3;
      if (platform.includes(t)) score += 2;
      if (p.genre.toLowerCase().includes(t)) score += 1;
      if (desc.includes(t)) score += 0.5;
    });
    if (/\bgba\b/.test(q) && platform.includes('advance')) score += 5;
    if (/\bds\b/.test(q) && platform.includes('nintendo ds')) score += 5;
    if (/\b3ds\b/.test(q) && platform.includes('3ds')) score += 5;
    if (/\bgb\b/.test(q) && platform.includes('game boy')) score += 4;
    if (p.isPremium) score += 0.5;

    return { product: p, score };
  }).filter(s => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.product);
}

// ─── Comprehensive fallback response engine ─────────────────
function fallbackResponse(input: string): { text: string; products?: typeof products[number][]; links?: { label: string; href: string }[]; quickReplies?: string[] } {
  const q = input.toLowerCase().trim();

  // Begroetingen
  if (/^(hoi|hi|hey|hallo|hello|goedemorgen|goedemiddag|goedenavond|yo|dag|moin|heey|hee|wazzup|sup)\b/.test(q))
    return {
      text: 'Hoi! Ik ben Pixel, de gaming-beer van Gameshop Enter! Ik help je graag met al je vragen over onze Nintendo games, verzending, retour en meer. Wat kan ik voor je doen?',
      quickReplies: ['Welke games hebben jullie?', 'Wat zijn de verzendkosten?', 'Vertel over jullie winkel'],
    };

  // Afscheid
  if (/^(doei|bye|dag|tot ziens|later|fijne dag|slaap lekker)\b/.test(q))
    return { text: 'Tot ziens! Bedankt voor je bezoek aan Gameshop Enter. Als je nog vragen hebt, ben ik er altijd!' };

  // Bedankt
  if (/bedankt|thanks|dankje|dankjewel|top|super|geweldig|perfect|nice|mooi|fijn|cool/.test(q))
    return { text: 'Graag gedaan! Nog meer vragen? Stel ze gerust!', quickReplies: ['Ik wil een game zoeken', 'Hoe werkt verzending?'] };

  // Assortiment
  if (/welke (games|spellen)|wat (heb|hebben) jullie|assortiment|collectie|aanbod|hoeveel (games|spellen)/.test(q)) {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
    return {
      text: `We hebben ${products.length} originele Nintendo games!\n\n${Object.entries(counts).map(([k, v]) => `${k}: ${v} games`).join('\n')}\n\nElke game is persoonlijk getest en gefotografeerd.`,
      links: [{ label: 'Bekijk alle games', href: '/shop' }],
      quickReplies: ['Welke Pokémon games?', 'Wat is de duurste game?', 'Welke zijn het goedkoopst?'],
    };
  }

  // Platform zoeken
  if (/game\s*boy\s*advance|gba\s*(games)?/.test(q)) {
    const found = products.filter(p => p.platform.toLowerCase().includes('advance'));
    return { text: `We hebben ${found.length} Game Boy Advance games!`, products: found.slice(0, 4), links: [{ label: 'Alle GBA games', href: '/shop?q=game+boy+advance' }] };
  }
  if (/nintendo\s*ds\b|nds\b/.test(q) && !/3ds/.test(q)) {
    const found = products.filter(p => p.platform === 'Nintendo DS');
    return { text: `We hebben ${found.length} Nintendo DS games!`, products: found.slice(0, 4), links: [{ label: 'Alle DS games', href: '/shop?q=nintendo+ds' }] };
  }
  if (/3ds/.test(q)) {
    const found = products.filter(p => p.platform.includes('3DS'));
    return { text: `We hebben ${found.length} Nintendo 3DS games!`, products: found.slice(0, 4), links: [{ label: 'Alle 3DS games', href: '/shop?q=3ds' }] };
  }
  if (/game\s*boy(?!\s*advance)|\bgb\b|\bgbc\b|game\s*boy\s*color/.test(q)) {
    const found = products.filter(p => p.platform.toLowerCase().includes('game boy') && !p.platform.toLowerCase().includes('advance'));
    return { text: `We hebben ${found.length} Game Boy games!`, products: found.slice(0, 4), links: [{ label: 'Alle Game Boy games', href: '/shop?q=game+boy' }] };
  }

  // Pokémon
  if (/pok[eé]mon|pikachu|charizard/.test(q)) {
    const pokemonGames = products.filter(p => p.name.toLowerCase().includes('pok'));
    return {
      text: `Pokémon fan? We hebben ${pokemonGames.length} Pokémon games! Van klassieke Game Boy titels tot DS en GBA. Elke game is 100% origineel en persoonlijk getest.`,
      products: pokemonGames.slice(0, 4),
      links: [{ label: 'Alle Pokémon games', href: '/shop?q=pokemon' }],
      quickReplies: ['Welke is het zeldzaamst?', 'Zijn ze compleet in doos?'],
    };
  }

  // Zelda
  if (/zelda|hyrule|triforce/.test(q)) {
    const found = searchProducts('zelda');
    return {
      text: found.length > 0 ? 'Hier zijn onze Zelda games:' : 'Helaas geen Zelda games op voorraad momenteel. Kijk regelmatig terug!',
      products: found.length > 0 ? found : undefined, links: [{ label: 'Zoek Zelda', href: '/shop?q=zelda' }],
    };
  }

  // Mario
  if (/mario|luigi/.test(q)) {
    const found = searchProducts('mario');
    return {
      text: found.length > 0 ? 'Hier zijn onze Mario games:' : 'Helaas geen Mario games op voorraad momenteel.',
      products: found.length > 0 ? found : undefined, links: [{ label: 'Zoek Mario', href: '/shop?q=mario' }],
    };
  }

  // Verzending
  if (/verzend|bezorg|lever|shipping|postnl|pakket|track|trace|wanneer (heb|krijg)|levertijd|hoe lang duurt/.test(q))
    return {
      text: 'Over verzending:\n\n- €4,95 via PostNL, GRATIS boven €100\n- Levertijd: 1-3 werkdagen\n- Met track & trace\n- Zorgvuldig verpakt',
      quickReplies: ['Verzenden jullie naar België?', 'Hoe werkt retourneren?'],
    };

  // België
  if (/belgi[ëe]|internationaal|buitenland|europa/.test(q))
    return { text: 'We verzenden momenteel alleen binnen Nederland. Houd onze website in de gaten voor toekomstige uitbreidingen!', quickReplies: ['Wat zijn de verzendkosten?', 'Hoe kan ik contact opnemen?'] };

  // Betaling
  if (/betal|ideal|creditcard|paypal|afrekenen|bancontact|apple\s*pay|pin|contant/.test(q))
    return { text: 'Betaalmethoden:\n\n- iDEAL (alle banken)\n- Creditcard (Visa, Mastercard)\n- PayPal\n- Bancontact\n- Apple Pay\n\nAlles veilig en versleuteld.', links: [{ label: 'Winkelwagen', href: '/winkelwagen' }], quickReplies: ['Is mijn betaling veilig?', 'Kan ik achteraf betalen?'] };

  // Achteraf
  if (/achteraf|klarna|afterpay/.test(q))
    return { text: 'We bieden helaas geen achteraf betalen aan. Wel iDEAL, Creditcard, PayPal, Bancontact en Apple Pay.' };

  // Retour
  if (/retour|terugstu|ruil|terug|garantie|defect|kapot|werkt niet|stuk/.test(q))
    return {
      text: 'Retourbeleid:\n\n- 14 dagen bedenktijd\n- Gratis retourneren\n- Defect? We lossen het op of sturen vervanging\n- Alle games zijn getest voor verzending',
      links: [{ label: 'Retourbeleid', href: '/retourbeleid' }, { label: 'Contact', href: '/contact' }],
      quickReplies: ['Hoe stuur ik iets terug?'],
    };

  // Hoe retourneren
  if (/hoe.*(retour|terugsturen)/.test(q))
    return { text: 'Retourneren:\n\n1. Neem contact op via email of formulier\n2. Je ontvangt een retourlabel\n3. Verpak het goed en stuur op\n4. Geld terug binnen 3-5 werkdagen', links: [{ label: 'Contact', href: '/contact' }] };

  // Inkoop
  if (/verkop|inkoop|inruil|trade|sell|opkop|wil.*(verkopen|kwijt)/.test(q))
    return {
      text: 'Games verkopen? Wij kopen Nintendo games op!\n\n1. Check inkoopprijzen op de inkoop pagina\n2. Neem contact op met je aanbod\n3. Stuur de games op (wij betalen verzending)\n4. Direct betaling na controle',
      links: [{ label: 'Inkoopprijzen', href: '/inkoop' }, { label: 'Contact', href: '/contact' }],
      quickReplies: ['Hoeveel krijg ik voor Pokémon games?'],
    };

  // Originaliteit
  if (/origineel|nep|fake|echt|authentiek|namaak|reproductie|repro|bootleg/.test(q))
    return {
      text: '100% Origineel — onze belofte!\n\n- Persoonlijk gecontroleerd op echtheid\n- Getest op echte Nintendo hardware\n- NOOIT reproducties of bootlegs\n- Eigen foto\'s: wat je ziet is wat je krijgt\n- 5.0 uit 1.360+ reviews',
      quickReplies: ['Hoe controleren jullie dat?'],
    };

  // Conditie
  if (/conditie|staat|kwaliteit|gebruikt|nieuw|cib|compleet|los|cartridge|doos|manual|handleiding/.test(q))
    return {
      text: 'Condities:\n\n- "Zo goed als nieuw": nauwelijks sporen\n- "Gebruikt": normaal gebruik, perfect werkend\n- "Nieuw": ongeopend\n\nCIB = Compleet in Doos (game + doos + handleiding)\nLosse cartridge = alleen het spelletje\n\nBij elke game staan eigen foto\'s!',
      quickReplies: ['Zijn alle games getest?', 'Hebben jullie CIB games?'],
    };

  // CIB
  if (/cib|compleet in doos/.test(q)) {
    const cib = products.filter(p => p.completeness.toLowerCase().includes('compleet'));
    return { text: `We hebben ${cib.length} CIB games — inclusief originele doos en handleiding.`, products: cib.slice(0, 4), links: [{ label: 'Shop', href: '/shop' }] };
  }

  // Contact
  if (/contact|email|mail|bereik|instagram|bel|telefoon|whatsapp/.test(q))
    return { text: 'Contact:\n\n- Email: gameshopenter@gmail.com\n- Instagram: @gameshopenter\n- Contactformulier op de website\n\nReactie meestal binnen 24 uur!', links: [{ label: 'Contactformulier', href: '/contact' }] };

  // Over ons
  if (/wie (ben|zijn)|over (jullie|ons|gameshop)|eigenaar|oprichter|lenn/.test(q))
    return {
      text: 'Gameshop Enter is opgericht door Lenn Hodes — dé Nintendo specialist van Nederland!\n\n- 3.000+ tevreden klanten\n- 5.0 uit 1.360+ reviews\n- Elke game persoonlijk getest\n- Specialist in DS, GBA, 3DS, Game Boy en meer',
      links: [{ label: 'Over ons', href: '/over-ons' }],
    };

  // Reviews
  if (/review|beoordel|sterren|rating/.test(q))
    return { text: '5.0 gemiddelde score uit 1.360+ reviews!\n\nKlanten waarderen vooral de kwaliteit, snelle verzending en goede communicatie.', links: [{ label: 'Over ons', href: '/over-ons' }] };

  // Prijs / Budget
  if (/prijs|kost|duur|goedkoop|budget|onder\s*\d|tot\s*\d|vanaf/.test(q)) {
    const budgetMatch = q.match(/(?:onder|tot|max(?:imaal)?)\s*[€]?\s*(\d+)/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]);
      const found = products.filter(p => p.price <= budget).sort((a, b) => b.price - a.price);
      return { text: `${found.length} games onder €${budget}:`, products: found.slice(0, 4), links: [{ label: 'Alle games', href: '/shop' }] };
    }
    const min = Math.min(...products.map(p => p.price));
    const max = Math.max(...products.map(p => p.price));
    return { text: `Prijzen: €${min.toFixed(2)} — €${max.toFixed(2)}`, links: [{ label: 'Shop', href: '/shop' }], quickReplies: ['Goedkoopste games?', 'Premium games?'] };
  }

  // Goedkoopst
  if (/goedkoopst|laagste prijs/.test(q)) {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    return { text: 'Onze voordeligste games:', products: sorted.slice(0, 4) };
  }

  // Duurste / Premium
  if (/duurste|premium|zeldzaam|rare|waardevol/.test(q)) {
    const sorted = [...products].sort((a, b) => b.price - a.price);
    return { text: 'Onze premium games:', products: sorted.slice(0, 4), quickReplies: ['Waarom zijn sommige games duur?'] };
  }

  // Populairst / cadeau
  if (/populair|best.*verkocht|aanrader|cadeau|kado|gift/.test(q)) {
    const popular = products.filter(p => p.isPremium).sort((a, b) => b.price - a.price).slice(0, 4);
    return { text: 'Dit zijn onze populairste en meest gewilde games:', products: popular, quickReplies: ['Ik zoek iets voor kinderen', 'Budget opties?'] };
  }

  // Waarom duur
  if (/waarom.*(duur|prijs)|prijs.*(hoog|veel)/.test(q))
    return { text: 'Retro Nintendo games stijgen in waarde door beperkte oplages en groeiende vraag. Factoren:\n\n- Zeldzaamheid\n- Conditie (nieuw vs gebruikt)\n- Compleetheid (CIB is meer waard)\n- Franchise populariteit\n- Europese PAL versie\n\nOnze prijzen zijn marktconform.' };

  // FAQ
  if (/faq|veelgestelde/.test(q))
    return { text: 'Op onze FAQ pagina vind je alle veelgestelde vragen.', links: [{ label: 'FAQ', href: '/faq' }] };

  // Privacy
  if (/privacy|gegevens|gdpr|avg/.test(q))
    return { text: 'We gaan zorgvuldig om met je gegevens. Alleen gebruikt voor bestellingen, nooit gedeeld met derden.', links: [{ label: 'Privacybeleid', href: '/privacybeleid' }] };

  // Openingstijden
  if (/openingstijd|fysieke winkel|locatie|adres|bezoek|langs\s*komen/.test(q))
    return { text: 'Gameshop Enter is een online-only webshop. Geen fysieke winkel, maar we leveren in heel Nederland! Games binnen 1-3 werkdagen thuis.', quickReplies: ['Hoe bestellen?', 'Verzendkosten?'] };

  // Hoe bestellen
  if (/hoe.*(bestel|koop|order)|bestel.*(proces|stappen)/.test(q))
    return { text: 'Bestellen:\n\n1. Zoek je game in de shop\n2. Klik "In winkelwagen"\n3. Ga naar de winkelwagen\n4. Vul je gegevens in\n5. Betaal\n6. Klaar! Bevestiging per email.', links: [{ label: 'Shop', href: '/shop' }, { label: 'Winkelwagen', href: '/winkelwagen' }] };

  // Genre
  if (/rpg|role.?playing/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'rpg').slice(0, 4);
    return { text: found.length > 0 ? 'Onze RPG games:' : 'Geen RPG games op voorraad.', products: found.length > 0 ? found : undefined };
  }
  if (/platform(er|spel)|jump/.test(q)) {
    const found = products.filter(p => p.genre.toLowerCase() === 'platformer').slice(0, 4);
    return { text: found.length > 0 ? 'Onze platformers:' : 'Geen platformers op voorraad.', products: found.length > 0 ? found : undefined };
  }
  if (/actie|action|avontuur|adventure/.test(q)) {
    const found = products.filter(p => ['Actie', 'Avontuur'].includes(p.genre)).slice(0, 4);
    return { text: found.length > 0 ? 'Actie/avontuur games:' : 'Geen actie games op voorraad.', products: found.length > 0 ? found : undefined };
  }

  // Kinderen
  if (/kind(eren)?|jong|family|gezin/.test(q)) {
    return { text: 'Pokémon games zijn perfect voor kinderen! Geschikt voor alle leeftijden.', products: searchProducts('pokemon'), quickReplies: ['Welke Pokémon games?'] };
  }

  // Korting
  if (/korting|coupon|code|actie|aanbieding|sale|deal/.test(q))
    return { text: 'Geen actieve kortingscodes, maar wel gratis verzending boven €100! Volg @gameshopenter op Instagram voor acties.' };

  // Veiligheid
  if (/veilig|betrouwbaar|scam|oplichting|vertrouw/.test(q))
    return { text: '100% betrouwbaar:\n\n- 5.0 uit 1.360+ reviews\n- 3.000+ tevreden klanten\n- Veilige betaling\n- 14 dagen retourrecht\n- KvK geregistreerd', links: [{ label: 'Over ons', href: '/over-ons' }] };

  // Wie is Beertje
  if (/wie ben (je|jij)|pixel|nino|beertje|mascotte|bot|robot|ai/.test(q))
    return { text: 'Ik ben Pixel, de gaming-beer van Gameshop Enter! Mijn naam komt van Nintendo — net als alles in onze winkel. Ik ken ons hele assortiment en help je graag!' };

  // Easter eggs
  if (/grap|mop|grappig/.test(q))
    return { text: 'Waarom ging de Pokémon naar de dokter? Omdat hij een PIKA-boo had! ...Laat me je liever helpen met games zoeken!' };
  if (/konami|up up down|cheat/.test(q))
    return { text: 'Up, Up, Down, Down, Left, Right, Left, Right, B, A... Helaas geen extra levens, maar wel de beste Nintendo games van Nederland!' };

  // Direct product search
  const directSearch = searchProducts(q);
  if (directSearch.length > 0) {
    return { text: 'Dit heb ik gevonden:', products: directSearch, links: [{ label: 'Meer resultaten', href: `/shop?q=${encodeURIComponent(q)}` }] };
  }

  // Fallback
  return {
    text: 'Daar weet ik helaas niet direct het antwoord op. Ik kan je helpen met vragen over onze games, verzending, retour, inkoop en meer. Of neem contact met ons op!',
    links: [{ label: 'Shop', href: '/shop' }, { label: 'Contact', href: '/contact' }],
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
        text: 'Hoi! Ik ben Pixel, de gaming-beer van Gameshop Enter! Stel me gerust een vraag over onze Nintendo games, verzending, retour, inkoop en meer!',
        quickReplies: INITIAL_QUICK_REPLIES,
      }]);
    }
  }

  function handleNewChat() {
    setMessages([{
      id: 'welcome-' + Date.now(), role: 'bot',
      text: 'Nieuw gesprek gestart! Waar kan ik je mee helpen?',
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

      // Try streaming first
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
            // Empty response, use fallback
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
          // Stream error — fall back to non-streaming, then pattern matching
          setAiAvailable(false);
          setTyping(false);
          const fb = fallbackResponse(trimmed);
          setMessages(prev => [...prev, { id: streamBotId, role: 'bot' as const, ...fb }]);
          setApiHistory(prev => [...prev, { role: 'assistant', content: fb.text }]);
        },
      );
    } else {
      // Simulate short delay for fallback
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
            <Image src="/images/mascot.svg" alt="Chat met Pixel" width={48} height={48} className="rounded-full" />
          )}
          {!open && !hasOpened && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
          )}
        </div>
      </button>

      {/* Chat window — large on desktop, fullscreen on mobile */}
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
            <Image src="/images/mascot.svg" alt="Pixel" width={36} height={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Pixel</p>
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
