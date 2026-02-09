'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import { getAllProducts } from '@/lib/products';

export default function WinkelwagenPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const subtotal = getTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const suggestions = useMemo(() => {
    if (items.length === 0) return [];
    const cartSkus = new Set(items.map((i) => i.product.sku));
    const cartPlatforms = Array.from(new Set(items.map((i) => i.product.platform)));
    const all = getAllProducts();
    const candidates = all.filter(
      (p) => !cartSkus.has(p.sku) && cartPlatforms.includes(p.platform) && !!p.image
    );
    // Shuffle deterministically based on cart contents
    const shuffled = candidates.sort((a, b) => a.sku.localeCompare(b.sku));
    return shuffled.slice(0, 4);
  }, [items]);

  return (
    <div className="pt-16 lg:pt-20">
      {/* Header */}
      <div className="relative bg-[#050810] py-14 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_50%)]" />
          <motion.div
            animate={{ x: [0, 20, -10, 0], y: [0, -15, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 right-[15%] w-48 h-48 rounded-full bg-emerald-500/[0.08] blur-[60px]"
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
              Winkel
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">wagen</span>
            </h1>
            <p className="text-slate-400">
              {items.length} {items.length === 1 ? 'product' : 'producten'} in je wagen
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-24"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-8 shadow-lg"
            >
              <svg className="h-12 w-12 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Je winkelwagen is leeg</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Ontdek ons assortiment van originele Nintendo games en consoles</p>
            <Link href="/shop">
              <motion.span
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-shadow"
              >
                Naar de shop
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Free shipping progress bar */}
              {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 mb-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      Gratis verzending
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Nog {formatPrice(remainingForFreeShipping)}
                    </span>
                  </div>
                  <div className="h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {subtotal >= FREE_SHIPPING_THRESHOLD && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 mb-4 flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Gratis verzending! Je bestelling wordt gratis verzonden via PostNL.</span>
                </motion.div>
              )}

              {/* Verder winkelen knop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group">
                  <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Verder winkelen
                </Link>
              </motion.div>

              <AnimatePresence>
                {items.map((item, index) => {
                  const colors = PLATFORM_COLORS[item.product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
                  const label = PLATFORM_LABELS[item.product.platform] || item.product.platform;
                  return (
                    <motion.div
                      key={item.product.sku}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, scale: 0.95, filter: 'blur(4px)', height: 0, marginBottom: 0, padding: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex gap-4 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300"
                    >
                      {/* Product image */}
                      <Link href={`/shop/${item.product.sku}`} className="flex-shrink-0">
                        <div className={`w-20 h-20 rounded-xl ${item.product.image ? 'bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden relative`}>
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="object-contain p-1.5"
                            />
                          ) : (
                            <span className="text-white/30 text-xs font-bold">{label}</span>
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.product.sku}`} className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 transition-colors line-clamp-1">
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${colors.from} ${colors.to}`} />
                          {item.product.platform} &middot; {item.product.condition}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQuantity(item.product.sku, item.quantity - 1)}
                              aria-label={`Aantal ${item.product.name} verminderen`}
                              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all text-sm font-medium"
                            >
                              -
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className="text-sm font-bold w-8 text-center"
                              aria-label={`Aantal: ${item.quantity}`}
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQuantity(item.product.sku, item.quantity + 1)}
                              aria-label={`Aantal ${item.product.name} verhogen`}
                              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all text-sm font-medium"
                            >
                              +
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.product.sku)}
                              aria-label={`${item.product.name} verwijderen uit winkelwagen`}
                              className="ml-2 p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </motion.button>
                          </div>
                          <motion.span
                            key={item.product.price * item.quantity}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="font-extrabold text-slate-900 dark:text-white"
                          >
                            {formatPrice(item.product.price * item.quantity)}
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div className="relative mt-3">
                <AnimatePresence>
                  {showClearConfirm ? (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3"
                    >
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">Winkelwagen legen?</span>
                      <button
                        onClick={() => { clearCart(); setShowClearConfirm(false); }}
                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                      >
                        Ja, legen
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        Annuleren
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowClearConfirm(true)}
                      className="text-sm text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1.5"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Winkelwagen legen
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Upsell suggestions */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-10"
                >
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Misschien ook interessant</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {suggestions.map((product) => {
                      const c = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
                      return (
                        <Link key={product.sku} href={`/shop/${product.sku}`}>
                          <motion.div
                            whileHover={{ scale: 1.03, y: -2 }}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300"
                          >
                            <div className="aspect-square bg-slate-50 dark:bg-slate-700 relative">
                              <Image
                                src={product.image!}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 50vw, 25vw"
                                className="object-contain p-3"
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${c.from} ${c.to}`} />
                                {product.platform}
                              </p>
                              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">{formatPrice(product.price)}</p>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 sticky top-28 shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-6 tracking-tight">Overzicht</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Subtotaal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Verzendkosten</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-slate-900 dark:text-white">Totaal</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="font-extrabold text-slate-900 dark:text-white text-2xl"
                      >
                        {formatPrice(total)}
                      </motion.span>
                    </div>
                  </div>
                </div>

                <Link href="/afrekenen">
                  <motion.span
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full mt-6 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all text-center"
                  >
                    Afrekenen
                  </motion.span>
                </Link>

                {/* Payment methods */}
                <div className="mt-5 flex items-center justify-center gap-2">
                  {['iDEAL', 'Visa', 'PayPal'].map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Trust signals */}
                <div className="mt-6 space-y-2">
                  {[
                    'Veilig betalen via iDEAL, creditcard of PayPal',
                    'Verzending via PostNL binnen 1-3 werkdagen',
                    '14 dagen bedenktijd',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <svg className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
