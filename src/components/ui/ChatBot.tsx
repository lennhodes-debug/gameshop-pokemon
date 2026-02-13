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
}

// ─── Knowledge Base ─────────────────────────────────────────
const STORE_INFO = {
  name: 'Gameshop Enter',
  owner: 'Lenn Hodes',
  email: 'gameshopenter@gmail.com',
  instagram: '@gameshopenter',
  specialty: 'Nintendo games',
  rating: '5.0 uit 1.360+ reviews',
  customers: '3.000+ tevreden klanten',
  shipping: '€4,95 verzendkosten via PostNL, gratis boven €100',
  shippingTime: '1-3 werkdagen',
  returns: '14 dagen retourrecht, gratis retourneren',
  payment: 'iDEAL, Creditcard, PayPal, Bancontact, Apple Pay',
  platforms: ['Nintendo DS', 'Nintendo 3DS', 'Game Boy Advance', 'Game Boy / Color', 'Wii', 'Wii U'],
  productCount: products.length,
  priceRange: `€${Math.min(...products.map(p => p.price)).toFixed(2)} - €${Math.max(...products.map(p => p.price)).toFixed(2)}`,
};

const QUICK_REPLIES = [
  'Welke games hebben jullie?',
  'Wat zijn de verzendkosten?',
  'Kan ik games verkopen?',
  'Zijn de games origineel?',
];

// ─── Response Engine ────────────────────────────────────────
function generateResponse(input: string): Omit<Message, 'id' | 'role'> {
  const q = input.toLowerCase().trim();

  // Greeting
  if (/^(hoi|hi|hey|hallo|hello|goedemorgen|goedemiddag|goedenavond|yo|dag)/.test(q)) {
    return {
      text: `Hoi! 🐻 Ik ben Beertje, de mascotte van Gameshop Enter! Ik help je graag met al je vragen over onze Nintendo games. Wat kan ik voor je doen?`,
    };
  }

  // Product search
  if (/welke (games|spellen)|wat (heb|hebben) jullie|assortiment|collectie|aanbod/.test(q)) {
    const platformCounts: Record<string, number> = {};
    products.forEach(p => { platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1; });
    const summary = Object.entries(platformCounts).map(([k, v]) => `${k}: ${v} games`).join('\n• ');
    return {
      text: `We hebben ${STORE_INFO.productCount} originele Nintendo games! 🎮\n\n• ${summary}\n\nAllemaal persoonlijk getest met eigen foto's. Bekijk onze shop voor het volledige aanbod!`,
      links: [{ label: 'Naar de shop', href: '/shop' }],
    };
  }

  // Specific platform
  const platformMatch = q.match(/(game ?boy|gba|gb|ds|3ds|wii ?u|wii|switch|nintendo)/i);
  if (platformMatch && /game|spel|wat|heb|zoek|koop/.test(q)) {
    const pm = platformMatch[1].toLowerCase().replace(/\s/g, '');
    const platformMap: Record<string, string> = {
      'gameboy': 'Game Boy', 'gb': 'Game Boy', 'gba': 'Game Boy Advance',
      'ds': 'Nintendo DS', '3ds': 'Nintendo 3DS', 'wii': 'Wii', 'wiiu': 'Wii U',
    };
    const platformName = Object.entries(platformMap).find(([k]) => pm.includes(k))?.[1];
    if (platformName) {
      const found = products.filter(p => p.platform.includes(platformName)).slice(0, 4);
      if (found.length > 0) {
        return {
          text: `We hebben ${products.filter(p => p.platform.includes(platformName)).length} ${platformName} games! Hier zijn een paar toppers:`,
          products: found,
          links: [{ label: `Alle ${platformName} games`, href: `/shop?platform=${encodeURIComponent(platformName)}` }],
        };
      }
    }
  }

  // Search for specific game
  const searchTerms = q.replace(/(?:heb je|hebben jullie|is er|zoek|koop|prijs van|wat kost)\s*/g, '').trim();
  if (searchTerms.length > 2) {
    const found = products.filter(p =>
      p.name.toLowerCase().includes(searchTerms) ||
      p.slug.includes(searchTerms.replace(/\s/g, '-'))
    ).slice(0, 4);
    if (found.length > 0) {
      return {
        text: found.length === 1
          ? `Gevonden! 🎉 ${found[0].name} voor ${found[0].platform} — €${found[0].price.toFixed(2)} (${found[0].condition})`
          : `Ik heb ${found.length} resultaten gevonden:`,
        products: found.length > 1 ? found : undefined,
        links: found.length === 1 ? [{ label: 'Bekijk product', href: `/shop/${found[0].sku}` }] : undefined,
      };
    }
  }

  // Pricing
  if (/prijs|kost|duur|goedkoop|budget|betaalbaar/.test(q)) {
    const cheap = products.filter(p => p.price <= 15).slice(0, 3);
    return {
      text: `Onze prijzen variëren van ${STORE_INFO.priceRange}. We hebben games voor elk budget! 💰\n\nBudget tips (onder €15):`,
      products: cheap.length > 0 ? cheap : undefined,
      links: [{ label: 'Shop op prijs', href: '/shop?sort=price-asc' }],
    };
  }

  // Shipping
  if (/verzend|bezorg|lever|shipping|postNL|pakket|opstu/.test(q)) {
    return {
      text: `📦 Verzending:\n\n• ${STORE_INFO.shipping}\n• Levertijd: ${STORE_INFO.shippingTime}\n• Verzending via PostNL met track & trace\n• Zorgvuldig verpakt voor veilig transport`,
    };
  }

  // Payment
  if (/betal|ideal|creditcard|paypal|afrekenen|betaalmethod/.test(q)) {
    return {
      text: `💳 Betaalmethoden:\n\n${STORE_INFO.payment}\n\nAlle betalingen zijn veilig en versleuteld.`,
      links: [{ label: 'Naar winkelwagen', href: '/winkelwagen' }],
    };
  }

  // Returns
  if (/retour|terugstu|ruil|terug|garantie|defect/.test(q)) {
    return {
      text: `↩️ Retourbeleid:\n\n• ${STORE_INFO.returns}\n• Niet tevreden? Stuur het product binnen 14 dagen terug\n• Na ontvangst betalen wij het bedrag binnen 5 werkdagen terug\n• Defect bij ontvangst? We lossen het direct op!`,
      links: [{ label: 'Volledig retourbeleid', href: '/retourbeleid' }],
    };
  }

  // Sell / trade-in
  if (/verkop|inkoop|inruil|trade|sell|opkop|aanbied/.test(q)) {
    return {
      text: `🤝 Games verkopen? Dat kan!\n\nWij kopen Nintendo games op tegen eerlijke prijzen. Bekijk onze inkoopprijzen op de inkoop pagina of stuur een bericht via het contactformulier met wat je wilt verkopen.`,
      links: [
        { label: 'Inkoopprijzen bekijken', href: '/inkoop' },
        { label: 'Contact opnemen', href: '/contact' },
      ],
    };
  }

  // Originality / authenticity
  if (/origineel|nep|fake|echt|authentiek|namaak|reproductie/.test(q)) {
    return {
      text: `✅ 100% Origineel!\n\nAlle games bij Gameshop Enter zijn gegarandeerd originele Nintendo producten. Elk product wordt persoonlijk gecontroleerd en getest voordat het wordt verstuurd. We verkopen NOOIT reproducties of namaak.`,
    };
  }

  // Condition
  if (/conditie|staat|kwaliteit|gebruikt|nieuw|cib|compleet|cartridge/.test(q)) {
    return {
      text: `📋 Over de conditie:\n\n• Alle games worden persoonlijk getest op werking\n• Elke game heeft eigen foto's — wat je ziet is wat je krijgt\n• Condities: "Zo goed als nieuw", "Gebruikt", "Nieuw"\n• CIB = Compleet in Doos (met handleiding)\n• Alle producten worden zorgvuldig beschreven`,
    };
  }

  // Contact
  if (/contact|email|mail|bereik|bel|telefoon|instagram|social/.test(q)) {
    return {
      text: `📬 Contact:\n\n• Email: ${STORE_INFO.email}\n• Instagram: ${STORE_INFO.instagram}\n• Of gebruik ons contactformulier\n\nWe reageren meestal binnen 24 uur!`,
      links: [
        { label: 'Contactformulier', href: '/contact' },
        { label: 'Instagram', href: 'https://www.instagram.com/gameshopenter/' },
      ],
    };
  }

  // About
  if (/wie|over|eigenaar|verhaal|ontstaan|achter/.test(q)) {
    return {
      text: `🐻 Over Gameshop Enter:\n\nGameshop Enter is dé Nintendo specialist van Nederland, opgericht door ${STORE_INFO.owner}. Met ${STORE_INFO.customers} en een ${STORE_INFO.rating} zijn we trots op onze service!\n\nElke game wordt persoonlijk getest en gefotografeerd.`,
      links: [{ label: 'Meer over ons', href: '/over-ons' }],
    };
  }

  // Pokémon specific
  if (/pok[eé]mon|pikachu/.test(q)) {
    const pokemon = products.filter(p => p.name.toLowerCase().includes('pok')).slice(0, 4);
    return {
      text: `Pokémon fan? Dan ben je bij ons aan het juiste adres! 🎯 We hebben een enorme collectie Pokémon games:`,
      products: pokemon,
      links: [{ label: 'Alle Pokémon games', href: '/shop?q=pokemon' }],
    };
  }

  // FAQ
  if (/faq|vraag|veelgesteld/.test(q)) {
    return {
      text: `Bekijk onze veelgestelde vragen pagina voor snelle antwoorden! Je kunt ook altijd hier aan mij vragen stellen. 😊`,
      links: [{ label: 'FAQ pagina', href: '/faq' }],
    };
  }

  // Thanks
  if (/bedankt|thanks|dankje|dank je|top|super|geweldig|fijn/.test(q)) {
    return {
      text: `Graag gedaan! 🐻✨ Als je nog meer vragen hebt, stel ze gerust. Veel plezier met gamen!`,
    };
  }

  // Fallback
  return {
    text: `Hmm, daar weet ik niet direct het antwoord op. 🤔 Probeer een van deze vragen, of neem contact op met ons team!`,
    links: [
      { label: 'Contactformulier', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  };
}

// ─── Component ──────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  function handleOpen() {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([{
        id: 'welcome',
        role: 'bot',
        text: `Hoi! 🐻 Ik ben Beertje, de hulpvaardige mascotte van Gameshop Enter! Stel me gerust een vraag over onze games, verzending, of wat dan ook.`,
      }]);
    }
  }

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = generateResponse(text);
      const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', ...response };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

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
          ${open ? 'scale-90 rotate-0' : 'scale-100 hover:scale-110'}
          group-hover:shadow-emerald-500/25 group-hover:shadow-xl
        `}>
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <Image src="/images/mascot.svg" alt="Chat met Beertje" width={48} height={48} className="rounded-full" />
          )}
          {/* Notification pulse */}
          {!open && !hasOpened && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
          )}
        </div>
      </button>

      {/* Chat window */}
      <div className={`
        fixed bottom-24 right-5 z-[999]
        w-[360px] max-w-[calc(100vw-40px)]
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
            <p className="text-emerald-100 text-xs">Gameshop Enter assistent</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="h-[380px] max-h-[50vh] overflow-y-auto bg-slate-50 p-4 space-y-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center mt-1 overflow-hidden">
                  <Image src="/images/mascot.svg" alt="" width={24} height={24} />
                </div>
              )}
              <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`
                  px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-md'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md'
                  }
                `}>
                  {msg.text}
                </div>

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="space-y-2 w-full">
                    {msg.products.map(p => (
                      <Link
                        key={p.sku}
                        href={`/shop/${p.sku}`}
                        className="flex items-center gap-2 p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
                      >
                        {p.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                            <Image src={p.image} alt={p.name} width={48} height={48} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.platform} · {p.condition}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-600 flex-shrink-0">€{p.price.toFixed(2)}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Links */}
                {msg.links && msg.links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.links.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
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
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image src="/images/mascot.svg" alt="" width={24} height={24} />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick replies (show after welcome only) */}
          {messages.length === 1 && !typing && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-white border border-emerald-200 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white border-t border-slate-100 p-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Stel een vraag..."
            className="flex-1 px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex-shrink-0"
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
