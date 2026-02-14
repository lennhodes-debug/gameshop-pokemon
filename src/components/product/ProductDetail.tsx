'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS, FREE_SHIPPING_THRESHOLD, cn, getGameTheme } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'los' | 'cib'>('los');

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const isCIB = product.completeness.toLowerCase().includes('compleet');
  const effectivePrice = getEffectivePrice(product);
  const freeShipping = effectivePrice >= FREE_SHIPPING_THRESHOLD;

  const hasCibOption = !!product.cibPrice;
  const displayPrice = (hasCibOption && selectedVariant === 'cib') ? product.cibPrice! : effectivePrice;
  const displayImage = (hasCibOption && selectedVariant === 'cib' && product.cibImage) ? product.cibImage : product.image;
  const displayBackImage = (hasCibOption && selectedVariant === 'cib' && product.cibBackImage) ? product.cibBackImage : product.backImage;

  // Accent kleur: per game uniek, standaard emerald
  const typeInfo = getGameTheme(product.sku, product.genre);
  const accent = typeInfo ? typeInfo.bg[0] : '#10b981';
  const accentAlt = typeInfo ? typeInfo.bg[1] : '#14b8a6';
  const glowRgb = typeInfo ? typeInfo.glow : '16,185,129';

  // Gesimuleerde bekijkers op basis van SKU
  const viewerCount = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < product.sku.length; i++) hash = ((hash << 5) - hash + product.sku.charCodeAt(i)) | 0;
    const base = Math.abs(hash) % 8;
    return product.isPremium ? base + 5 : base + 2;
  }, [product.sku, product.isPremium]);

  const particles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 200 + Math.random() * 300,
      duration: 12 + Math.random() * 8,
      delay: Math.random() * 5,
    }));
  }, []);

  useEffect(() => {
    try {
      const key = 'gameshop-recent';
      const raw = JSON.parse(localStorage.getItem(key) || '[]');
      const stored: string[] = Array.isArray(raw)
        ? raw.filter((s): s is string => typeof s === 'string' && s.length > 0)
        : [];
      const updated = [product.sku, ...stored.filter(s => s !== product.sku)].slice(0, 12);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [product.sku]);

  const handleAdd = () => {
    addItem(product, selectedVariant === 'cib' ? 'cib' : undefined);
    setAdded(true);
    addToast(`${product.name}${selectedVariant === 'cib' ? ' (CIB)' : ''} toegevoegd aan winkelwagen`, 'success', undefined, displayImage || undefined);
    setTimeout(() => setAdded(false), 2000);
  };

  const specs = [
    { label: 'Platform', value: product.platform },
    { label: 'Genre', value: product.genre },
    { label: 'Conditie', value: product.condition },
    { label: 'Compleetheid', value: (hasCibOption && selectedVariant === 'cib') ? 'Compleet in doos (CIB)' : isCIB ? 'Compleet in doos (CIB)' : product.completeness },
    { label: 'SKU', value: product.sku },
    { label: 'Gewicht', value: `${product.weight} kg` },
  ];

  return (
    <div className="relative">
      {/* Achtergrond glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, rgba(${glowRgb}, 0.06) 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, 30, -20, 10, 0],
              y: [0, -20, 15, -10, 0],
              scale: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Breadcrumbs */}
      <nav className="relative flex items-center gap-2 text-sm text-slate-500 mb-8">
        {[
          { href: '/', label: 'Home' },
          { href: '/shop', label: 'Shop' },
          { href: `/shop?platform=${encodeURIComponent(product.platform)}`, label: product.platform },
        ].map((crumb) => (
          <span key={crumb.href} className="contents">
            <Link href={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
            <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </span>
        ))}
        <span className="text-slate-300 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Afbeelding */}
        <motion.div
          className="relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="aspect-square rounded-3xl flex items-center justify-center overflow-hidden relative"
            style={{
              background: displayImage
                ? `linear-gradient(145deg, ${accent}12 0%, #0a0e1a 40%, ${accentAlt}08 100%)`
                : `linear-gradient(135deg, ${accent}, ${accentAlt})`,
              border: `1.5px solid ${accent}25`,
              boxShadow: `0 0 80px ${accent}12, 0 0 160px ${accent}06, 0 30px 60px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 30% 20%, rgba(${glowRgb}, 0.08) 0%, transparent 50%)`,
              }}
            />

            {displayImage && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-900 animate-pulse rounded-3xl" />
                )}
                <Image
                  src={showBack && displayBackImage ? displayBackImage : displayImage}
                  alt={`${product.name} - ${product.platform} ${showBack ? 'achterkant' : 'cover art'}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={cn(
                    "object-contain p-8 lg:p-12 transition-all duration-700",
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  )}
                  priority
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {/* Voor/achter toggle */}
                {displayBackImage && (
                  <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
                    <button
                      onClick={() => { setShowBack(false); setImageLoaded(false); }}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border backdrop-blur-sm transition-all"
                      style={!showBack
                        ? { background: `${accent}30`, borderColor: `${accent}60`, color: 'white' }
                        : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }
                      }
                    >
                      Voor
                    </button>
                    <button
                      onClick={() => { setShowBack(true); setImageLoaded(false); }}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border backdrop-blur-sm transition-all"
                      style={showBack
                        ? { background: `${accent}30`, borderColor: `${accent}60`, color: 'white' }
                        : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }
                      }
                    >
                      Achter
                    </button>
                  </div>
                )}
                {/* Zoom */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                  aria-label="Afbeelding vergroten"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <svg className="h-20 w-20 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                </svg>
                <span className="text-white/10 text-3xl font-black select-none">{platformLabel}</span>
              </div>
            )}

            {/* Platform badge */}
            <div className="absolute top-5 left-5 flex gap-2">
              <span className="px-3 py-1.5 rounded-xl text-white/90 text-xs font-semibold backdrop-blur-sm"
                style={{ background: `${accent}35`, border: `1px solid ${accent}50` }}>
                {product.platform}
              </span>
            </div>
            {product.isPremium && (
              <div className="absolute top-5 right-5">
                <Badge variant="premium">PREMIUM</Badge>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          className="flex flex-col relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.08]">
              {product.condition}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
              {(hasCibOption && selectedVariant === 'cib') ? 'Compleet in doos (CIB)' : isCIB ? 'CIB' : product.completeness}
            </span>
            {product.genre && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                {product.genre}
              </span>
            )}
          </div>

          {/* Titel */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
            {product.name}
          </h1>
          <div className="h-1 w-16 rounded-full mb-5" style={{ background: `linear-gradient(90deg, ${accent}, ${accentAlt})` }} />

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-5">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}60` }} />
              {product.platform}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="font-mono text-xs text-slate-500">{product.sku}</span>
          </div>

          {/* Voorraad + bekijkers */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.5)' }} />
              <span className="text-sm font-semibold text-emerald-400">Op voorraad</span>
              <span className="text-xs text-slate-500">— Vandaag besteld, morgen verzonden</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs text-slate-400">
                <span className="font-bold text-orange-400">{viewerCount}</span> mensen bekijken dit nu
              </span>
            </div>
          </div>

          {/* Variant toggle */}
          {hasCibOption && (
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kies variant</p>
              <div className="inline-flex rounded-2xl p-1.5 gap-1"
                style={{ background: `${accent}08`, border: `1.5px solid ${accent}18` }}>
                <button
                  onClick={() => { setSelectedVariant('los'); setImageLoaded(false); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                  style={selectedVariant === 'los'
                    ? { background: `linear-gradient(135deg, ${accent}, ${accentAlt})`, color: 'white', boxShadow: `0 4px 15px ${accent}40` }
                    : { color: '#94a3b8' }
                  }
                >
                  Losse cartridge
                </button>
                <button
                  onClick={() => { setSelectedVariant('cib'); setImageLoaded(false); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                  style={selectedVariant === 'cib'
                    ? { background: `linear-gradient(135deg, ${accent}, ${accentAlt})`, color: 'white', boxShadow: `0 4px 15px ${accent}40` }
                    : { color: '#94a3b8' }
                  }
                >
                  Met doos (CIB)
                </button>
              </div>
            </div>
          )}

          {/* Prijs */}
          <div className="flex flex-wrap items-baseline gap-3 mb-8">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums"
              style={{ color: accent, textShadow: `0 0 40px rgba(${glowRgb}, 0.3)` }}>
              {formatPrice(displayPrice)}
            </span>
            {hasCibOption && selectedVariant === 'cib' && (
              <span className="text-lg text-slate-600 line-through">
                {formatPrice(effectivePrice)}
              </span>
            )}
            {displayPrice >= FREE_SHIPPING_THRESHOLD && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl"
                style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Gratis verzending
              </span>
            )}
          </div>

          {/* Beschrijving */}
          {product.description && (
            <div className="mb-8 rounded-2xl p-6 backdrop-blur-sm"
              style={{ background: `linear-gradient(135deg, ${accent}06, rgba(255,255,255,0.02))`, border: `1px solid ${accent}12` }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: accent }}>Beschrijving</h2>
              <p className="text-slate-400 leading-relaxed text-[15px]">
                {product.description}
              </p>
            </div>
          )}

          {/* Winkelwagen knop */}
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-white text-base font-bold transition-all duration-300 ${
              added ? 'bg-emerald-500' : ''
            }`}
            style={added ? undefined : {
              background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
              boxShadow: `0 8px 30px rgba(${glowRgb}, 0.35), 0 2px 8px rgba(${glowRgb}, 0.2)`,
            }}
          >
            {added ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Toegevoegd!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                In winkelwagen
              </span>
            )}
          </motion.button>

          {/* Voordelen */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12', title: 'PostNL verzending', desc: freeShipping ? 'Gratis verzending' : 'Vanaf \u20AC4,95 via PostNL' },
              { icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', title: 'Veilig betalen', desc: 'iDEAL, creditcard, PayPal' },
              { icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182', title: '14 dagen retour', desc: 'Niet goed? Geld terug.' },
              { icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: '100% origineel', desc: 'Persoonlijk getest' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}12`, color: accent }}>
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">{item.title}</span>
                  <span className="text-slate-500 text-xs">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Specificaties */}
      <motion.div
        className="relative mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-6">Specificaties</h2>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${accent}15` }}>
          {specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`flex items-center justify-between px-6 py-4 border-l-2 border-transparent hover:bg-white/[0.04] transition-colors duration-200 ${i < specs.length - 1 ? 'border-b' : ''}`}
              style={{
                background: i % 2 === 0 ? `${accent}04` : 'transparent',
                borderColor: `${accent}10`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; }}
            >
              <span className="text-sm font-medium text-slate-500">{spec.label}</span>
              <span className="text-sm font-semibold text-slate-200">{spec.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="backdrop-blur-md border-t px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: 'rgba(5,8,16,0.92)', borderColor: `${accent}20` }}>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 truncate">{product.name}{selectedVariant === 'cib' ? ' (CIB)' : ''}</p>
            <p className="text-lg font-extrabold" style={{ color: accent }}>{formatPrice(displayPrice)}</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex-shrink-0 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all"
            style={added ? { background: '#10b981' } : {
              background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
              boxShadow: `0 4px 15px rgba(${glowRgb}, 0.3)`,
            }}
          >
            {added ? 'Toegevoegd!' : 'In winkelwagen'}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && displayImage && !imageError && (
        <motion.div
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex items-center justify-center cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Sluiten"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <motion.div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <img
              src={displayImage!}
              alt={`${product.name} - ${product.platform}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
