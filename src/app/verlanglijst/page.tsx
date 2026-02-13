'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { getAllProducts, Product, isOnSale, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS, cn } from '@/lib/utils';

export default function VerlanglijstPage() {
  const { items: wishlistSkus, removeItem, getShareUrl, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const products = useMemo(() => {
    const all = getAllProducts();
    return wishlistSkus
      .map(sku => all.find(p => p.sku === sku))
      .filter((p): p is Product => !!p);
  }, [wishlistSkus]);

  const handleAddAll = () => {
    products.forEach(p => addItem(p));
    addToast(`${products.length} producten toegevoegd aan winkelwagen`, 'success');
  };

  const handleShare = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    addToast('Verlanglijst link gekopieerd!', 'success');
  };

  return (
    <div className="pt-16 lg:pt-20 pb-24">
      {/* Header */}
      <div className="relative bg-[#050810] py-14 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(244,63,94,0.08),transparent_50%)]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl lg:text-[64px] font-light text-white tracking-[-0.03em] leading-[0.95] mb-2">
              Verlang
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">lijst</span>
            </h1>
            <p className="text-slate-400">
              {products.length} {products.length === 1 ? 'product' : 'producten'} opgeslagen
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 dark:bg-red-900/20 mb-6">
              <svg className="h-10 w-10 text-red-300 dark:text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Je verlanglijst is leeg</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Klik op het hartje bij een product om het op te slaan.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 transition-all"
            >
              Naar de shop
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 mb-6"
            >
              <button
                onClick={handleAddAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Alles in winkelwagen
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                Deel verlanglijst
              </button>
              <button
                onClick={() => { clearWishlist(); addToast('Verlanglijst gewist', 'info'); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                Alles verwijderen
              </button>
            </motion.div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {products.map((product, i) => {
                  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
                  const onSale = isOnSale(product);
                  const price = getEffectivePrice(product);
                  return (
                    <motion.div
                      key={product.sku}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                      <Link href={`/shop/${product.sku}`} className="flex gap-4 p-4">
                        {/* Image */}
                        <div className="h-20 w-20 rounded-xl bg-slate-50 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="h-full w-full flex items-center justify-center text-xs font-semibold text-slate-300 dark:text-slate-500">
                              {platformLabel}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{product.platform}</p>
                          <div className="mt-2 flex items-baseline gap-2">
                            {onSale ? (
                              <>
                                <span className="text-base font-semibold text-red-500">{formatPrice(price)}</span>
                                <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                              </>
                            ) : (
                              <span className="text-base font-semibold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Actions */}
                      <div className="flex border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => { addItem(product); addToast(`${product.name} toegevoegd`, 'success'); }}
                          className="flex-1 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          In winkelwagen
                        </button>
                        <div className="w-px bg-slate-100 dark:bg-slate-700" />
                        <button
                          onClick={() => { removeItem(product.sku); addToast(`${product.name} verwijderd`, 'info'); }}
                          className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label={`${product.name} verwijderen van verlanglijst`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
