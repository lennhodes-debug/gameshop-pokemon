'use client';

import { Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/cart/CartProvider';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image */}
      <div className={`aspect-square rounded-2xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center overflow-hidden`}>
        <span className="text-white/20 text-8xl font-black select-none">
          {platformLabel}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="condition">{product.condition}</Badge>
          <Badge variant="completeness">{product.completeness}</Badge>
          {product.isPremium && <Badge variant="premium">PREMIUM</Badge>}
          {product.isConsole && <Badge variant="console">CONSOLE</Badge>}
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
          <span>{product.platform}</span>
          <span className="text-slate-300">|</span>
          <span>{product.genre}</span>
          <span className="text-slate-300">|</span>
          <span>SKU: {product.sku}</span>
        </div>

        <p className="text-3xl font-bold text-slate-900 mb-6">
          {formatPrice(product.price)}
        </p>

        {product.description && (
          <p className="text-slate-600 leading-relaxed mb-8">
            {product.description}
          </p>
        )}

        <Button size="lg" className="w-full sm:w-auto mb-8" onClick={() => addItem(product)}>
          In winkelwagen
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </Button>

        {/* Order info */}
        <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Bestelinfo</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-slate-900">Verzending via PostNL</span>
                <p className="text-slate-500">Standaard verzending: 3,95 euro. Gratis bij bestelling boven 100 euro.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-slate-900">Veilig betalen</span>
                <p className="text-slate-500">iDEAL, creditcard, PayPal, Bancontact, Apple Pay</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-slate-900">14 dagen bedenktijd</span>
                <p className="text-slate-500">Niet tevreden? Retourneren kan binnen 14 dagen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-slate-900">Vragen?</span>
                <p className="text-slate-500">Mail naar gameshopenter@gmail.com of WhatsApp 06-41126067</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
