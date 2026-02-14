'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showBack, setShowBack] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!product) return;
    setAddedToCart(false);
    setShowBack(false);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = modalRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
      first?.focus();
    }, 100);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, handleKeyDown]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product);
    addToast(`${product.name} toegevoegd aan winkelwagen`, 'success', undefined, product.image || undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const colors = product ? (PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' }) : { from: '', to: '' };
  const isCIB = product?.completeness.toLowerCase().includes('compleet');
  const effectivePrice = product ? getEffectivePrice(product) : 0;
  const freeShipping = effectivePrice >= FREE_SHIPPING_THRESHOLD;
  const hasBackImage = !!product?.backImage;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={product ? `${product.name} snelle weergave` : ''}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Sluiten"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col sm:flex-row">
                {/* Image met front/back toggle */}
                <div className={`relative sm:w-1/2 aspect-square sm:aspect-auto sm:min-h-[360px] ${product.image ? 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center`}>
                  {product.image ? (
                    <Image
                      src={showBack && hasBackImage ? product.backImage! : product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain p-8"
                      priority
                    />
                  ) : (
                    <span className="text-white/20 text-6xl font-black select-none">{product.platform}</span>
                  )}

                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white text-xs font-semibold">
                      {product.platform}
                    </span>
                    {isOnSale(product) && (
                      <span className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-[11px] font-bold">
                        -{getSalePercentage(product)}%
                      </span>
                    )}
                  </div>

                  {/* Front/Back toggle */}
                  {hasBackImage && product.image && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      <button
                        onClick={() => setShowBack(false)}
                        className={`h-8 px-3 rounded-lg text-[11px] font-bold backdrop-blur-sm transition-all ${!showBack ? 'bg-white/90 text-slate-900 shadow' : 'bg-white/40 text-white hover:bg-white/60'}`}
                      >
                        Voorkant
                      </button>
                      <button
                        onClick={() => setShowBack(true)}
                        className={`h-8 px-3 rounded-lg text-[11px] font-bold backdrop-blur-sm transition-all ${showBack ? 'bg-white/90 text-slate-900 shadow' : 'bg-white/40 text-white hover:bg-white/60'}`}
                      >
                        Achterkant
                      </button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="sm:w-1/2 p-6 flex flex-col">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="condition">{product.condition}</Badge>
                    <Badge variant="completeness">{isCIB ? 'CIB' : product.completeness}</Badge>
                    {product.isPremium && <Badge variant="premium">PREMIUM</Badge>}
                  </div>

                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                    {product.name}
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    {product.platform} &middot; {product.genre}
                  </p>

                  {product.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-4">
                    {/* Prijs */}
                    <div>
                      {isOnSale(product) ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-red-500 tracking-tight">
                            {formatPrice(effectivePrice)}
                          </span>
                          <span className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</span>
                        </div>
                      ) : (
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Trust signals */}
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Getest &amp; werkend</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                        {freeShipping ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gratis verzending</span>
                        ) : (
                          <span>Verzending {formatPrice(SHIPPING_COST)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                        <span>14 dagen retourrecht</span>
                      </div>
                    </div>

                    {/* CTA knoppen */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={handleAdd}
                        whileTap={{ scale: 0.97 }}
                        className={`flex-1 px-6 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                          addedToCart
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35'
                        }`}
                      >
                        {addedToCart ? (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Toegevoegd!
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.293-5.67a1.125 1.125 0 00-1.093-1.397H6.982l-.54-2.023a1.08 1.08 0 00-1.044-.814H2.25" />
                            </svg>
                            In winkelmand — {formatPrice(effectivePrice)}
                          </>
                        )}
                      </motion.button>
                      <Link
                        href={`/shop/${product.sku}`}
                        className="px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        Details
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
