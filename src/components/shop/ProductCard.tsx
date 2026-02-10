'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, FREE_SHIPPING_THRESHOLD, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  searchQuery?: string;
}

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  const lowerQuery = query.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerQuery
          ? <mark key={i} className="bg-emerald-200/60 text-inherit rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </>
  );
}

const ProductCard = React.memo(function ProductCard({ product, onQuickView, searchQuery }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const isCIB = product.completeness.toLowerCase().includes('compleet');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAddedToCart(true);
    addToast(`${product.name} toegevoegd aan winkelwagen`, 'success', undefined, product.image || undefined);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div className="group">
      <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col">
        {/* Product afbeelding */}
        <Link href={`/shop/${product.sku}`}>
          <div className={`relative h-52 ${product.image && !imageError ? 'bg-slate-50' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden`}>
            {product.image && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                )}
                <Image
                  src={product.image}
                  alt={`${product.name} - ${product.platform}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={cn(
                    "object-contain p-4 group-hover:scale-105 transition-transform duration-500",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <span className="text-white/20 text-6xl font-black select-none">
                {platformLabel}
              </span>
            )}

            {/* Platform label */}
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 rounded-lg ${product.image ? 'bg-slate-900/70' : 'bg-black/20'} text-white text-[11px] font-semibold`}>
                {product.platform}
              </span>
            </div>

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              {isOnSale(product) && (
                <span className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-[11px] font-bold shadow-sm">
                  -{getSalePercentage(product)}%
                </span>
              )}
              {product.isPremium && <Badge variant="premium">PREMIUM</Badge>}
              {product.isConsole && <Badge variant="console">CONSOLE</Badge>}
            </div>
          </div>
        </Link>

        {/* Scheidingslijn */}
        <div className="h-px bg-slate-100" />

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <Badge variant="condition">{product.condition}</Badge>
            <Badge variant="completeness">{isCIB ? 'CIB' : product.completeness}</Badge>
          </div>

          <Link href={`/shop/${product.sku}`}>
            <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
              <HighlightText text={product.name} query={searchQuery} />
            </h3>
          </Link>

          {product.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
            <div>
              {isOnSale(product) ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-red-500 tracking-tight">
                    {formatPrice(getEffectivePrice(product))}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {formatPrice(product.price)}
                </span>
              )}
              {getEffectivePrice(product) >= FREE_SHIPPING_THRESHOLD && (
                <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">Gratis verzending</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              aria-label={`${product.name} toevoegen aan winkelwagen`}
              className={cn(
                "h-9 px-4 rounded-lg text-white text-xs font-bold transition-all duration-300",
                addedToCart
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-md hover:shadow-emerald-500/25"
              )}
            >
              {addedToCart ? (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Toegevoegd
                </span>
              ) : (
                '+ Winkelmand'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
