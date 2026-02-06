'use client';

import Link from 'next/link';
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
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Winkelwagen</h1>
          <p className="text-slate-300">
            {items.length} {items.length === 1 ? 'product' : 'producten'} in je wagen
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Je winkelwagen is leeg</h2>
            <p className="text-slate-500 mb-6">Bekijk ons assortiment en voeg producten toe</p>
            <Link href="/shop">
              <Button>Naar de shop</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const colors = PLATFORM_COLORS[item.product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
                const label = PLATFORM_LABELS[item.product.platform] || item.product.platform;
                return (
                  <div key={item.product.sku} className="bg-white rounded-xl border border-slate-100 p-4 flex gap-4">
                    <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white/30 text-xs font-bold">{label}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.product.sku}`} className="font-semibold text-slate-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1">
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{item.product.platform} - {item.product.condition}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.sku, item.quantity - 1)}
                            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.sku, item.quantity + 1)}
                            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.product.sku)}
                            className="ml-2 text-xs text-red-500 hover:text-red-600 font-medium"
                          >
                            Verwijder
                          </button>
                        </div>
                        <span className="font-bold text-slate-900">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={clearCart} className="text-sm text-slate-500 hover:text-red-500 transition-colors">
                Winkelwagen legen
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-28">
                <h3 className="font-bold text-slate-900 mb-4">Overzicht</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotaal</span>
                    <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Verzendkosten</span>
                    <span className="font-medium text-slate-900">
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-emerald-600">
                      Nog {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} tot gratis verzending
                    </p>
                  )}
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    <span className="font-bold text-slate-900">Totaal</span>
                    <span className="font-bold text-slate-900 text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button size="lg" className="w-full mt-6">
                  Afrekenen
                </Button>
                <p className="text-xs text-slate-400 text-center mt-3">
                  Veilig betalen via iDEAL, creditcard, PayPal of Apple Pay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
