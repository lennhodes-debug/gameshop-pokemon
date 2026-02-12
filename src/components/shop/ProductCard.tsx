'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, FREE_SHIPPING_THRESHOLD, cn, IMAGE_ROTATION } from '@/lib/utils';
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

// Fly-to-cart animatie: maakt een mini thumbnail die naar het cart icoon vliegt
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

  // Cart badge bounce
  setTimeout(() => {
    cartIcon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 300);
  }, 600);

  setTimeout(() => flyEl.remove(), 800);
}

// Wishlist helper functies
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
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'los' | 'cib'>('los');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [heartBounce, setHeartBounce] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialiseer wishlist state
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

  // Huidige variant image
  const displayImage = (hasCibOption && selectedVariant === 'cib') ? product.cibImage : product.image;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = (hasCibOption && selectedVariant === 'cib') ? 'cib' as const : undefined;
    addItem(product, variant);
    const label = variant ? `${product.name} (CIB)` : product.name;
    setAddedToCart(true);
    addToast(`${label} toegevoegd aan winkelwagen`, 'success', undefined, (displayImage || product.image) || undefined);
    // Fly-to-cart animatie
    if (cardRef.current) {
      flyToCartAnimation(cardRef.current, displayImage || product.image);
    }
    setTimeout(() => setAddedToCart(false), 1500);
  };

  // === STANDAARD CARD (alle producten uniform) ===
  return (
    <div className="group">
      <div
        className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-emerald-200/60 transition-all duration-300 flex flex-col"
        style={{
          transform: `translateY(${isHovered ? -4 : 0}px)`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
          boxShadow: isHovered
            ? '0 12px 36px rgba(16,185,129,0.14), 0 6px 16px rgba(0,0,0,0.08)'
            : undefined,
        }}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 50, y: 50 }); }}
      >
        {/* Shine sweep overlay */}
        <div
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 transition-transform duration-[600ms] ease-out"
            style={{
              transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 60%, transparent 100%)',
            }}
          />
        </div>
        {/* Product afbeelding */}
        <Link href={`/shop/${product.sku}`}>
          <div className="relative h-52 bg-slate-50 flex items-center justify-center overflow-hidden">
            {product.image && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                )}
                <Image
                  src={product.image}
                  alt={`${product.name} - ${product.platform}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={cn(
                    "object-contain p-4 group-hover:scale-105 transition-transform duration-500",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  style={IMAGE_ROTATION[product.sku] ? { transform: `rotate(${IMAGE_ROTATION[product.sku]}deg) scale(1.1)` } : undefined}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", colors.from, colors.to)}>
                <span className="text-white/60 text-lg font-black select-none">
                  {platformLabel}
                </span>
              </div>
            )}

            {/* Platform label */}
            <div className="absolute top-2 left-3">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/70 text-white text-[11px] font-semibold">
                {product.platform}
              </span>
            </div>

            {/* Badges */}
            <div className="absolute top-2 right-3 flex flex-col gap-1.5 items-end">
              {isOnSale(product) && (
                <span className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-[11px] font-bold shadow-sm">
                  -{getSalePercentage(product)}%
                </span>
              )}
              {product.isConsole && <Badge variant="console">CONSOLE</Badge>}
              <button
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? 'Verwijder van verlanglijst' : 'Voeg toe aan verlanglijst'}
                className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all z-30"
                style={{
                  transform: heartBounce ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill={isWishlisted ? '#ef4444' : 'none'} stroke={isWishlisted ? '#ef4444' : '#94a3b8'} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
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
