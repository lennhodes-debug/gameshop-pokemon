'use client';

import Link from 'next/link';
import { Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;

  const isCIB = product.completeness.toLowerCase().includes('compleet');

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-emerald-200/50 transition-all duration-300">
      {/* Image placeholder with platform gradient */}
      <Link href={`/shop/${product.sku}`}>
        <div className={`relative h-48 bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center overflow-hidden`}>
          <span className="text-white/20 text-6xl font-black select-none">
            {platformLabel}
          </span>

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-sm text-white text-xs font-medium">
              {product.platform}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {product.isPremium && (
              <Badge variant="premium">PREMIUM</Badge>
            )}
            {product.isConsole && (
              <Badge variant="console">CONSOLE</Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge variant="condition">{product.condition}</Badge>
          {isCIB ? (
            <Badge variant="completeness">CIB</Badge>
          ) : (
            <Badge variant="completeness">{product.completeness}</Badge>
          )}
        </div>

        <Link href={`/shop/${product.sku}`}>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-xs text-slate-500 line-clamp-1 mb-3">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="h-9 px-3 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-semibold hover:bg-emerald-100 active:scale-95 transition-all duration-200"
          >
            + Winkelmand
          </button>
        </div>
      </div>
    </div>
  );
}
