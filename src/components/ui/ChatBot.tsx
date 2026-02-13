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

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Quick Replies ──────────────────────────────────────────
const QUICK_REPLIES = [
  'Welke games hebben jullie?',
  'Wat zijn de verzendkosten?',
  'Kan ik games verkopen?',
  'Zijn de games origineel?',
  'Welke Pokémon games hebben jullie?',
  'Hoe werkt retourneren?',
];

// ─── Fallback response engine (when API unavailable) ────────
function fallbackResponse(input: string): string {
  const q = input.toLowerCase().trim();

  if (/^(hoi|hi|hey|hallo|hello|goedemorgen|goedemiddag|goedenavond|yo|dag)\b/.test(q))
    return 'Hoi! 🐻 Ik ben Beertje, de mascotte van Gameshop Enter! Ik help je graag met al je vragen over onze Nintendo games. Wat kan ik voor je doen?';

  if (/welke (games|spellen)|wat (heb|hebben) jullie|assortiment|collectie|aanbod/.test(q)) {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
    return `We hebben ${products.length} originele Nintendo games! 🎮\n\n${Object.entries(counts).map(([k, v]) => `• ${k}: ${v} games`).join('\n')}\n\nBekijk /shop voor het volledige aanbod!`;
  }

  if (/verzend|bezorg|lever|shipping|postNL|pakket/.test(q))
    return '📦 Verzending:\n• €4,95 via PostNL, gratis boven €100\n• Levertijd: 1-3 werkdagen\n• Met track & trace\n• Zorgvuldig verpakt';

  if (/betal|ideal|creditcard|paypal|afrekenen/.test(q))
    return '💳 We accepteren iDEAL, Creditcard, PayPal, Bancontact en Apple Pay. Alle betalingen zijn veilig.';

  if (/retour|terugstu|ruil|terug|garantie|defect/.test(q))
    return '↩️ 14 dagen retourrecht, gratis retourneren. Niet tevreden? Stuur het binnen 14 dagen terug. Defect? We lossen het direct op! Zie /retourbeleid';

  if (/verkop|inkoop|inruil|trade|sell|opkop/.test(q))
    return '🤝 Games verkopen? Dat kan! Wij kopen Nintendo games op tegen eerlijke prijzen. Bekijk /inkoop voor de inkoopprijzen of neem contact op via /contact';

  if (/origineel|nep|fake|echt|authentiek|namaak/.test(q))
    return '✅ 100% Origineel! Alle games zijn gegarandeerd originele Nintendo producten, persoonlijk gecontroleerd en getest. We verkopen NOOIT reproducties.';

  if (/conditie|staat|kwaliteit|gebruikt|nieuw|cib|compleet/.test(q))
    return '📋 Alle games worden persoonlijk getest. Elke game heeft eigen foto\'s — wat je ziet is wat je krijgt. Condities: "Zo goed als nieuw", "Gebruikt" of "Nieuw". CIB = Compleet in Doos.';

  if (/contact|email|mail|bereik|instagram/.test(q))
    return '📬 Email: gameshopenter@gmail.com\nInstagram: @gameshopenter\nOf gebruik /contact\n\nWe reageren meestal binnen 24 uur!';

  if (/wie|over|eigenaar|verhaal/.test(q))
    return '🐻 Gameshop Enter is dé Nintendo specialist van Nederland, opgericht door Lenn Hodes. 3.000+ tevreden klanten, 5.0 uit 1.360+ reviews! Meer op /over-ons';

  if (/pok[eé]mon|pikachu/.test(q))
    return `Pokémon fan? 🎯 We hebben ${products.filter(p => p.name.toLowerCase().includes('pok')).length}+ Pokémon games! Bekijk /shop?q=pokemon`;

  if (/bedankt|thanks|dankje|top|super|geweldig/.test(q))
    return 'Graag gedaan! 🐻✨ Nog meer vragen? Stel ze gerust!';

  if (/prijs|kost|duur|goedkoop|budget/.test(q))
    return `Onze prijzen variëren van €${Math.min(...products.map(p => p.price)).toFixed(2)} tot €${Math.max(...products.map(p => p.price)).toFixed(2)}. Bekijk /shop voor alle games!`;

  return 'Dat is een goede vraag! 🤔 Ik kan je helpen met vragen over onze games, verzending, retour, inkoop en meer. Of neem contact op via /contact';
}

// ─── Extract links/products from AI response ────────────────
function parseResponse(text: string): Omit<Message, 'id' | 'role'> {
  const links: { label: string; href: string }[] = [];
  const foundProducts: typeof products[number][] = [];

  // Extract /route references and create links
  const routeMap: Record<string, string> = {
    '/shop': 'Naar de shop', '/inkoop': 'Inkoopprijzen', '/contact': 'Contact',
    '/faq': 'FAQ', '/over-ons': 'Over ons', '/retourbeleid': 'Retourbeleid',
    '/winkelwagen': 'Winkelwagen', '/privacybeleid': 'Privacybeleid',
  };

  Object.entries(routeMap).forEach(([route, label]) => {
    if (text.includes(route)) {
      links.push({ label, href: route });
    }
  });

  // Extract shop search links
  const searchMatch = text.match(/\/shop\?q=([^\s)]+)/);
  if (searchMatch) {
    links.push({ label: `Zoek: ${decodeURIComponent(searchMatch[1])}`, href: `/shop?q=${searchMatch[1]}` });
  }

  // Find mentioned product SKUs
  const skuMatches = text.match(/\b([A-Z]{2,4}-\d{3})\b/g);
  if (skuMatches) {
    skuMatches.forEach(sku => {
      const product = products.find(p => p.sku === sku);
      if (product && !foundProducts.find(fp => fp.sku === sku)) {
        foundProducts.push(product);
        if (!links.find(l => l.href === `/shop/${sku}`)) {
          links.push({ label: product.name, href: `/shop/${sku}` });
        }
      }
    });
  }

  // Find mentioned product names
  const lowerText = text.toLowerCase();
  products.forEach(p => {
    if (foundProducts.length < 4 && lowerText.includes(p.name.toLowerCase()) && !foundProducts.find(fp => fp.sku === p.sku)) {
      foundProducts.push(p);
    }
  });

  // Clean route references from displayed text
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
        text: 'Hoi! 🐻 Ik ben Beertje, de slimme assistent van Gameshop Enter! Stel me gerust een vraag — ik weet alles over onze Nintendo games, verzending, retour en meer.',
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

    let responseText: string;

    if (aiAvailable) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newHistory }),
        });

        if (res.ok) {
          const data = await res.json();
          responseText = data.reply || fallbackResponse(trimmed);
        } else {
          // API not configured or error — use fallback silently
          setAiAvailable(false);
          responseText = fallbackResponse(trimmed);
        }
      } catch {
        setAiAvailable(false);
        responseText = fallbackResponse(trimmed);
      }
    } else {
      responseText = fallbackResponse(trimmed);
    }

    const parsed = parseResponse(responseText);
    const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', ...parsed };

    setMessages(prev => [...prev, botMsg]);
    setApiHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
    setTyping(false);
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
          ${open ? 'scale-90' : 'scale-100 hover:scale-110'}
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
        w-[380px] max-w-[calc(100vw-40px)]
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
                <><span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" /> Gameshop Enter assistent</>
              )}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-[400px] max-h-[55vh] overflow-y-auto bg-slate-50 p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center mt-1 overflow-hidden">
                  <Image src="/images/mascot.svg" alt="" width={24} height={24} />
                </div>
              )}
              <div className={`max-w-[82%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`
                  px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-md'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md'
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
                        <p className="text-sm font-bold text-emerald-600 flex-shrink-0">€{p.price.toFixed(2)}</p>
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
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image src="/images/mascot.svg" alt="" width={24} height={24} />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick replies */}
          {messages.length === 1 && !typing && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_REPLIES.map(qr => (
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
