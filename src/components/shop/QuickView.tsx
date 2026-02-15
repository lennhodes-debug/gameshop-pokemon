'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { useScrollLock } from '@/hooks/useScrollLock';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
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
    },
    [onClose],
  );

  useScrollLock(!!product);

  useEffect(() => {
    if (!product) return;
    document.addEventListener('keydown', handleKeyDown);
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const first = modalRef.current.querySelector<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        first?.focus();
      }
    }, 100);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, handleKeyDown]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product);
    addToast(
      `${product.name} toegevoegd aan winkelwagen`,
      'success',
      undefined,
      product.image || undefined,
    );
  };

  const colors = product
    ? PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' }
    : { from: '', to: '' };
  const isCIB = product?.completeness.toLowerCase().includes('compleet');
  const freeShipping = product ? getEffectivePrice(product) >= FREE_SHIPPING_THRESHOLD : false;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
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
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-white/80 backdrop-blur border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Sluiten"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div
                  className={`relative sm:w-1/2 aspect-square sm:aspect-auto sm:min-h-[320px] ${product.image ? 'bg-white' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center`}
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain p-8"
                      priority
                    />
                  ) : (
                    <span className="text-white/20 text-6xl font-black select-none">
                      {product.platform}
                    </span>
                  )}

                  {/* Platform badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white text-xs font-medium">
                      {product.platform}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="sm:w-1/2 p-6 flex flex-col">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="condition">{product.condition}</Badge>
                    <Badge variant="completeness">{isCIB ? 'CIB' : product.completeness}</Badge>
                    {product.isPremium && <Badge variant="premium">Premium</Badge>}
                  </div>

                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">
                    {product.name}
                  </h2>

                  <p className="text-sm text-slate-500 mb-1">
                    {product.platform} &middot; {product.genre}
                  </p>

                  {product.description && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-4">
                    <div>
                      {isOnSale(product) ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-semibold text-red-500 tracking-tight">
                            {formatPrice(getEffectivePrice(product))}
                          </span>
                          <span className="text-lg text-slate-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
                            -{getSalePercentage(product)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xl font-semibold text-slate-900 tracking-tight">
                          {formatPrice(product.price)}
                        </span>
                      )}
                      {freeShipping && (
                        <span className="ml-2 text-xs text-emerald-600 font-medium">
                          Gratis verzending
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAdd}
                        className="flex-1 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-slate-800"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                        In winkelwagen
                      </button>
                      <Link
                        href={`/shop/${product.sku}`}
                        className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2"
                      >
                        Details
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
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
