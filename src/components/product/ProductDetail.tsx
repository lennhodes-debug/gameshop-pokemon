'use client';

import { motion } from 'framer-motion';
import { Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/cart/CartProvider';
import { useState } from 'react';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative group"
      >
        <div className={`aspect-square rounded-3xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center overflow-hidden relative`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-8 border border-white/[0.06] rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-16 border border-dashed border-white/[0.04] rounded-full"
          />
          <span className="text-white/[0.12] text-[120px] font-black select-none relative z-10">
            {platformLabel}
          </span>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm text-white text-xs font-semibold">
              {product.platform}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            {product.isPremium && <Badge variant="premium">PREMIUM</Badge>}
            {product.isConsole && <Badge variant="console">CONSOLE</Badge>}
          </div>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="condition">{product.condition}</Badge>
          <Badge variant="completeness">{product.completeness}</Badge>
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
          <span>{product.platform}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{product.genre}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="font-mono text-xs text-slate-400">SKU: {product.sku}</span>
        </div>

        <div className="flex items-baseline gap-3 mb-8">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.price >= 100 && (
            <span className="text-sm text-emerald-600 font-semibold">Gratis verzending</span>
          )}
        </div>

        {product.description && (
          <p className="text-slate-600 leading-relaxed mb-8 text-lg">
            {product.description}
          </p>
        )}

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button size="lg" className="w-full sm:w-auto text-base" onClick={handleAdd}>
            {added ? (
              <>
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Toegevoegd
              </>
            ) : (
              <>
                In winkelwagen
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </>
            )}
          </Button>
        </motion.div>

        {/* Order info */}
        <div className="mt-8 bg-slate-50 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm tracking-wide">Bestelinfo</h3>
          <div className="space-y-3 text-sm">
            {[
              {
                title: 'Verzending via PostNL',
                desc: 'Standaard: 3,95 euro. Gratis boven 100 euro.',
              },
              {
                title: 'Veilig betalen',
                desc: 'iDEAL, creditcard, PayPal, Bancontact, Apple Pay',
              },
              {
                title: '14 dagen bedenktijd',
                desc: 'Niet tevreden? Retourneren kan binnen 14 dagen.',
              },
              {
                title: 'Vragen?',
                desc: 'gameshopenter@gmail.com of WhatsApp 06-41126067',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <p className="text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
