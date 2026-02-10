'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, FREE_SHIPPING_THRESHOLD, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const isCIB = product.completeness.toLowerCase().includes('compleet');
  const effectivePrice = getEffectivePrice(product);
  const freeShipping = effectivePrice >= FREE_SHIPPING_THRESHOLD;
  const onSale = isOnSale(product);

  useEffect(() => {
    try {
      const key = 'gameshop-recent';
      const stored: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [product.sku, ...stored.filter(s => s !== product.sku)].slice(0, 12);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [product.sku]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    addToast(`${product.name} toegevoegd aan winkelwagen`, 'success', undefined, product.image || undefined);
    setTimeout(() => setAdded(false), 2000);
  };

  const specs = [
    { label: 'Platform', value: product.platform },
    { label: 'Genre', value: product.genre },
    { label: 'Type', value: product.type },
    { label: 'Conditie', value: product.condition },
    { label: 'Compleetheid', value: isCIB ? 'Compleet in doos (CIB)' : product.completeness },
    { label: 'SKU', value: product.sku },
    { label: 'Gewicht', value: `${product.weight} kg` },
  ];

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        {[
          { href: '/', label: 'Home' },
          { href: '/shop', label: 'Shop' },
          { href: `/shop?platform=${encodeURIComponent(product.platform)}`, label: product.platform },
        ].map((crumb) => (
          <span key={crumb.href} className="contents">
            <Link href={crumb.href} className="hover:text-emerald-600 transition-colors">{crumb.label}</Link>
            <svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </span>
        ))}
        <span className="text-slate-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Afbeelding */}
        <div className="relative group">
          <div className={`aspect-square rounded-2xl ${product.image ? 'bg-slate-50 border border-slate-200' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden relative`}>
            {product.image ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                )}
                <Image
                  src={showBack && product.backImage ? product.backImage : product.image}
                  alt={`${product.name} - ${product.platform} ${showBack ? 'achterkant' : 'cover art'}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={cn(
                    "object-contain p-10 transition-opacity duration-500",
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
                {/* Voor/Achter toggle */}
                {product.backImage && (
                  <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
                    <button
                      onClick={() => setShowBack(false)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        !showBack
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-white/80 border-slate-200 text-slate-400'
                      }`}
                    >
                      Voor
                    </button>
                    <button
                      onClick={() => setShowBack(true)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        showBack
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-white/80 border-slate-200 text-slate-400'
                      }`}
                    >
                      Achter
                    </button>
                  </div>
                )}
                {/* Zoom knop */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 h-10 w-10 rounded-xl bg-white/80 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100 z-20"
                  aria-label="Afbeelding vergroten"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </button>
              </>
            ) : (
              <span className="text-white/30 text-[120px] font-black select-none">
                {platformLabel}
              </span>
            )}

            {/* Badges */}
            <div className="absolute top-5 left-5 flex gap-2">
              <span className={`px-3 py-1.5 rounded-xl ${product.image ? 'bg-slate-900/70' : 'bg-black/20'} text-white text-xs font-semibold`}>
                {product.platform}
              </span>
            </div>
            <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
              {product.isPremium && <Badge variant="premium">PREMIUM</Badge>}
              {product.isConsole && <Badge variant="console">CONSOLE</Badge>}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="condition">{product.condition}</Badge>
            <Badge variant="completeness">{isCIB ? 'Compleet in doos (CIB)' : product.completeness}</Badge>
          </div>

          {/* Titel */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {product.name}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to}`} />
              {product.platform}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{product.genre}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="font-mono text-xs text-slate-400">{product.sku}</span>
          </div>

          {/* Op voorraad */}
          <div className="flex items-center gap-2 mb-6">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">Op voorraad</span>
            <span className="text-xs text-slate-400">— Vandaag besteld, morgen verzonden</span>
          </div>

          {/* Prijs */}
          <div className="flex flex-wrap items-baseline gap-3 mb-8">
            {onSale ? (
              <>
                <span className="text-3xl sm:text-5xl font-extrabold text-red-500 tracking-tight tabular-nums">
                  {formatPrice(effectivePrice)}
                </span>
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded-lg">
                  -{getSalePercentage(product)}%
                </span>
              </>
            ) : (
              <span className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatPrice(product.price)}
              </span>
            )}
            {freeShipping && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Gratis verzending
              </span>
            )}
          </div>

          {/* Beschrijving */}
          {product.description && (
            <div className="mb-8 rounded-2xl bg-slate-50 border border-slate-100 p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Beschrijving</h2>
              <p className="text-slate-600 leading-relaxed text-base">
                {product.description}
              </p>
            </div>
          )}

          {/* In winkelwagen knop */}
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-white text-base font-bold transition-all duration-300 ${
                added
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Toegevoegd aan winkelwagen
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  In winkelwagen
                </span>
              )}
            </button>
          </div>

          {/* Voordelen */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Verzending via PostNL', desc: freeShipping ? 'Gratis verzending' : 'Standaard: \u20AC3,95' },
              { title: 'Veilig betalen', desc: 'iDEAL, creditcard, PayPal' },
              { title: '14 dagen retour', desc: 'Niet goed? Geld terug.' },
              { title: '100% origineel', desc: 'Persoonlijk getest op werking' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{item.title}</span>
                  <span className="text-slate-500 text-xs">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specificaties */}
      <div className="mt-16">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Specificaties</h2>
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          {specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`flex items-center justify-between px-6 py-4 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} ${i < specs.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <span className="text-sm font-medium text-slate-500">{spec.label}</span>
              <span className="text-sm font-semibold text-slate-900">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 truncate">{product.name}</p>
            <p className={cn("text-lg font-extrabold", onSale ? "text-red-500" : "text-slate-900")}>{formatPrice(effectivePrice)}</p>
          </div>
          <button
            onClick={handleAdd}
            className={`flex-shrink-0 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all ${
              added ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
          >
            {added ? 'Toegevoegd!' : 'In winkelwagen'}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && product.image && (
        <div
          className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
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
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={product.image}
              alt={`${product.name} - ${product.platform}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
