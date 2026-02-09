'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
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

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!product) return;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [product, handleEscape]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product);
    addToast(`${product.name} toegevoegd aan winkelwagen`, 'success', undefined, product.image || undefined);
  };

  const colors = product ? (PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' }) : { from: '', to: '' };
  const isCIB = product?.completeness.toLowerCase().includes('compleet');
  const freeShipping = product ? product.price >= FREE_SHIPPING_THRESHOLD : false;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
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
                {/* Image */}
                <div className={`relative sm:w-1/2 aspect-square sm:aspect-auto sm:min-h-[320px] ${product.image ? 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center`}>
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
                    <span className="text-white/20 text-6xl font-black select-none">{product.platform}</span>
                  )}

                  {/* Platform badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white text-xs font-semibold">
                      {product.platform}
                    </span>
                  </div>
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
                    <div>
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                      {freeShipping && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          Gratis verzending
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAdd}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        In winkelwagen
                      </button>
                      <Link
                        href={`/shop/${product.sku}`}
                        className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
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
