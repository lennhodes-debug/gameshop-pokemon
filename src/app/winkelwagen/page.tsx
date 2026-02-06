'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function WinkelwagenPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const subtotal = getTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  return (
    <div className="pt-20 lg:pt-24">
      <div className="relative bg-[#050810] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">Winkelwagen</h1>
            <p className="text-slate-400">{items.length} {items.length === 1 ? 'product' : 'producten'} in je wagen</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="h-20 w-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Je winkelwagen is leeg</h2>
            <p className="text-slate-500 mb-8">Bekijk ons assortiment en voeg producten toe</p>
            <Link href="/shop"><Button size="lg">Naar de shop</Button></Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item) => {
                  const colors = PLATFORM_COLORS[item.product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
                  const label = PLATFORM_LABELS[item.product.platform] || item.product.platform;
                  return (
                    <motion.div
                      key={item.product.sku}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 shadow-sm"
                    >
                      <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white/30 text-xs font-bold">{label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.product.sku}`} className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1">{item.product.name}</Link>
                        <p className="text-xs text-slate-500 mt-0.5">{item.product.platform} - {item.product.condition}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.product.sku, item.quantity - 1)} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">-</button>
                            <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.sku, item.quantity + 1)} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">+</button>
                            <button onClick={() => removeItem(item.product.sku)} className="ml-3 text-xs text-red-500 hover:text-red-600 font-semibold">Verwijder</button>
                          </div>
                          <span className="font-extrabold text-slate-900">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <button onClick={clearCart} className="text-sm text-slate-400 hover:text-red-500 transition-colors mt-2 font-medium">Winkelwagen legen</button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-28 shadow-sm">
                <h3 className="font-extrabold text-slate-900 mb-5 tracking-tight">Overzicht</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotaal</span><span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Verzendkosten</span><span className="font-semibold text-slate-900">{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span></div>
                  {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-emerald-600 font-medium">Nog {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} tot gratis verzending</p>
                  )}
                  <div className="border-t border-slate-100 pt-3 flex justify-between"><span className="font-extrabold text-slate-900">Totaal</span><span className="font-extrabold text-slate-900 text-xl">{formatPrice(total)}</span></div>
                </div>
                <Button size="lg" className="w-full mt-6">Afrekenen</Button>
                <p className="text-xs text-slate-400 text-center mt-3">Veilig betalen via iDEAL, creditcard, PayPal of Apple Pay</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
