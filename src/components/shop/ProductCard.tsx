'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, FREE_SHIPPING_THRESHOLD, cn, getGameTheme } from '@/lib/utils';
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

function flyToCartAnimation(cardEl: HTMLElement, imageSrc: string | null | undefined) {
  if (!imageSrc) return;
  const cartIcon = document.getElementById('cart-icon-target');
  if (!cartIcon) return;

  const cardRect = cardEl.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flyEl = document.createElement('div');
  flyEl.style.cssText = `
    position: fixed;
    z-index: 9999;
    width: 50px;
    height: 50px;
    border-radius: 12px;
    overflow: hidden;
    pointer-events: none;
    left: ${cardRect.left + cardRect.width / 2 - 25}px;
    top: ${cardRect.top + 40}px;
    transition: all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 4px 20px rgba(16,185,129,0.4);
  `;

  const img = document.createElement('img');
  img.src = imageSrc;
  img.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:4px;background:white;border-radius:12px;';
  flyEl.appendChild(img);
  document.body.appendChild(flyEl);

  requestAnimationFrame(() => {
    flyEl.style.left = `${cartRect.left + cartRect.width / 2 - 12}px`;
    flyEl.style.top = `${cartRect.top + cartRect.height / 2 - 12}px`;
    flyEl.style.width = '24px';
    flyEl.style.height = '24px';
    flyEl.style.opacity = '0.3';
    flyEl.style.transform = 'scale(0.3)';
  });

  setTimeout(() => {
    cartIcon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 300);
  }, 600);

  setTimeout(() => flyEl.remove(), 800);
}

function getWishlist(): string[] {
  try {
    const data = localStorage.getItem('gameshop-wishlist');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function toggleWishlistItem(sku: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(sku);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem('gameshop-wishlist', JSON.stringify(list));
    return false;
  }
  list.push(sku);
  localStorage.setItem('gameshop-wishlist', JSON.stringify(list));
  return true;
}

const ProductCard = React.memo(function ProductCard({ product, onQuickView, searchQuery }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'los' | 'cib'>('los');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [heartBounce, setHeartBounce] = useState(false);
  const [imageTransition, setImageTransition] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsWishlisted(getWishlist().includes(product.sku));
  }, [product.sku]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleWishlistItem(product.sku);
    setIsWishlisted(newState);
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 400);
    addToast(
      newState ? `${product.name} op verlanglijst gezet` : `${product.name} van verlanglijst verwijderd`,
      newState ? 'success' : 'info'
    );
  }, [product.sku, product.name, addToast]);

  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const isCIB = product.completeness.toLowerCase().includes('compleet');
  const hasCibOption = !!product.cibPrice;
  const typeInfo = getGameTheme(product.sku, product.genre);

  const accentColor = typeInfo ? typeInfo.bg[0] : '#10b981';
  const accentGlow = typeInfo ? typeInfo.glow : '16,185,129';
  const accentAlt = typeInfo ? typeInfo.bg[1] : '#14b8a6';

  // Afbeelding en prijs op basis van geselecteerde variant
  const displayImage = (hasCibOption && selectedVariant === 'cib') ? (product.cibImage || product.image) : product.image;
  const displayPrice = (hasCibOption && selectedVariant === 'cib') ? product.cibPrice! : product.price;
  const currentImage = displayImage;

  const variantTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleVariantSwitch = useCallback((variant: 'los' | 'cib') => {
    if (variant === selectedVariant) return;
    if (variantTimeoutRef.current) clearTimeout(variantTimeoutRef.current);
    setImageTransition(true);
    setImageLoaded(false);
    variantTimeoutRef.current = setTimeout(() => {
      setSelectedVariant(variant);
      setImageTransition(false);
    }, 150);
  }, [selectedVariant]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = (hasCibOption && selectedVariant === 'cib') ? 'cib' as const : undefined;
    addItem(product, variant);
    const label = variant ? `${product.name} (CIB)` : product.name;
    setAddedToCart(true);
    addToast(`${label} toegevoegd aan winkelwagen`, 'success', undefined, (currentImage || product.image) || undefined);
    if (cardRef.current) {
      flyToCartAnimation(cardRef.current, currentImage || product.image);
    }
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div className="group">
      <div
        className="relative rounded-2xl overflow-hidden flex flex-col"
        style={{
          transform: `translateY(${isHovered ? -4 : 0}px)`,
          transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.5s ease',
          background: 'white',
          boxShadow: isHovered
            ? '0 20px 50px rgba(0,0,0,0.08)'
            : 'none',
        }}
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image stage — generous padding, premium backdrop */}
        <Link href={`/shop/${product.sku}`}>
          <div
            className="relative h-56 flex items-center justify-center overflow-hidden"
            style={{
              background: 'white',
            }}
          >
            {/* Subtle accent glow behind image on hover */}
            <div
              className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
              style={{
                opacity: isHovered ? 0.06 : 0,
                background: `radial-gradient(circle at 50% 60%, ${accentColor}, transparent 70%)`,
              }}
            />

            {currentImage && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 animate-pulse" style={{ background: '#f1f5f9' }} />
                )}
                <Image
                  src={currentImage}
                  alt={`${product.name} - ${product.platform}${selectedVariant === 'cib' ? ' (CIB)' : ''}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={cn(
                    "object-contain p-6 transition-all duration-700 ease-out",
                    imageLoaded && !imageTransition ? "opacity-100" : "opacity-0",
                    isHovered ? "scale-[1.03]" : "scale-100"
                  )}
                  style={{
                    filter: isHovered ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.08))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.04))',
                    transition: 'transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.5s ease, filter 0.7s ease',
                  }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", colors.from, colors.to)}>
                <span className="text-white/50 text-sm font-medium tracking-wider uppercase select-none">
                  {platformLabel}
                </span>
              </div>
            )}

            {/* Platform — minimal pill */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 bg-white/90 backdrop-blur-sm border border-slate-200/60">
                {platformLabel}
              </span>
            </div>

            {/* Badges + wishlist */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              {isOnSale(product) && (
                <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-medium">
                  -{getSalePercentage(product)}%
                </span>
              )}
              {product.isPremium && (
                <Badge variant="premium">Premium</Badge>
              )}
              {product.isConsole && <Badge variant="console">Console</Badge>}
              <button
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? 'Verwijder van verlanglijst' : 'Voeg toe aan verlanglijst'}
                className="p-1.5 rounded-lg backdrop-blur-sm transition-all z-30"
                style={{
                  background: isWishlisted ? `${accentColor}12` : 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  transform: heartBounce ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease',
                }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={isWishlisted ? accentColor : 'none'} stroke={isWishlisted ? accentColor : '#cbd5e1'} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>
        </Link>

        {/* Content — clean, spacious */}
        <div className="p-4 flex flex-col flex-1">
          {/* Variant toggle */}
          {hasCibOption ? (
            <div className="mb-3">
              <div
                className="relative inline-flex rounded-xl p-0.5 w-full"
                style={{ background: '#f1f5f9' }}
              >
                <div
                  className="absolute top-0.5 bottom-0.5 rounded-[10px] transition-all duration-300 ease-out"
                  style={{
                    width: '50%',
                    left: selectedVariant === 'los' ? '2px' : 'calc(50% - 2px)',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                />
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVariantSwitch('los'); }}
                  className="relative z-10 flex-1 py-1.5 text-center text-[11px] font-medium transition-colors duration-200 rounded-[10px]"
                  style={{ color: selectedVariant === 'los' ? '#334155' : '#94a3b8' }}
                >
                  Los
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVariantSwitch('cib'); }}
                  className="relative z-10 flex-1 py-1.5 text-center text-[11px] font-medium transition-colors duration-200 rounded-[10px]"
                  style={{ color: selectedVariant === 'cib' ? '#334155' : '#94a3b8' }}
                >
                  Compleet (CIB)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100">
                {product.condition}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100">
                {isCIB ? 'CIB' : product.completeness}
              </span>
            </div>
          )}

          <Link href={`/shop/${product.sku}`}>
            <h3 className="font-medium text-slate-800 text-[13px] leading-snug mb-1.5 line-clamp-2 transition-colors duration-500 group-hover:text-slate-900">
              <HighlightText text={product.name} query={searchQuery} />
            </h3>
          </Link>

          <div className="flex items-end justify-between pt-3 mt-auto">
            <div>
              {hasCibOption ? (
                <div>
                  <span className="text-lg font-semibold tracking-tight text-slate-900 tabular-nums">
                    {formatPrice(displayPrice)}
                  </span>
                  {selectedVariant === 'cib' && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Los vanaf {formatPrice(product.price)}
                    </span>
                  )}
                  {selectedVariant === 'los' && product.cibPrice && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      CIB {formatPrice(product.cibPrice)}
                    </span>
                  )}
                </div>
              ) : isOnSale(product) ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tracking-tight tabular-nums" style={{ color: accentColor }}>
                    {formatPrice(getEffectivePrice(product))}
                  </span>
                  <span className="text-xs text-slate-300 line-through tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-semibold tracking-tight text-slate-900 tabular-nums">
                  {formatPrice(product.price)}
                </span>
              )}
              {displayPrice >= FREE_SHIPPING_THRESHOLD && (
                <span className="block text-[10px] text-emerald-500/70 font-medium mt-0.5">Gratis verzending</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              aria-label={`${product.name} toevoegen aan winkelwagen`}
              className={cn(
                "h-9 px-4 rounded-xl text-xs font-medium transition-all duration-300",
                addedToCart && "animate-scale-bounce"
              )}
              style={{
                background: addedToCart
                  ? accentColor
                  : '#0f172a',
                color: 'white',
                boxShadow: isHovered && !addedToCart
                  ? '0 2px 8px rgba(0,0,0,0.12)'
                  : undefined,
              }}
            >
              {addedToCart ? (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Winkelmand
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
