'use client';

import { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, FREE_SHIPPING_THRESHOLD, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import ConfettiBurst from '@/components/ui/ConfettiBurst';
import { useCart } from '@/components/cart/CartProvider';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { useToast } from '@/components/ui/Toast';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const wishlisted = isInWishlist(product.sku);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [flyData, setFlyData] = useState<{ from: DOMRect; to: DOMRect; image: string } | null>(null);
  const [flipped, setFlipped] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [20, -20]), { stiffness: 400, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), { stiffness: 400, damping: 18 });
  const scale = useSpring(useTransform(useMotionValue(isHovered ? 1 : 0), [0, 1], [1, 1.02]), { stiffness: 300, damping: 25 });

  // Holographic glow + shine
  const holoX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const holoY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const holoAngle = useSpring(useTransform(mouseX, [0, 1], [0, 360]), { stiffness: 150, damping: 20 });

  // Premium: prismatic rainbow conic gradient — standaard: emerald glow
  const holoBackground = product.isPremium
    ? useMotionTemplate`
      conic-gradient(
        from ${holoAngle}deg at ${holoX}% ${holoY}%,
        rgba(255,0,0,0.07),
        rgba(255,165,0,0.07),
        rgba(255,255,0,0.07),
        rgba(0,255,0,0.07),
        rgba(0,100,255,0.07),
        rgba(128,0,255,0.07),
        rgba(255,0,0,0.07)
      ),
      radial-gradient(400px circle at ${holoX}% ${holoY}%,
        rgba(255,255,255,0.15) 0%,
        transparent 60%)
    `
    : useMotionTemplate`
      radial-gradient(600px circle at ${holoX}% ${holoY}%,
        rgba(16,185,129,0.14) 0%,
        rgba(6,182,212,0.08) 25%,
        rgba(6,182,212,0.04) 50%,
        transparent 80%),
      radial-gradient(300px circle at ${holoX}% ${holoY}%,
        rgba(255,255,255,0.18) 0%,
        transparent 55%)
    `;
  const edgeLightBackground = product.isPremium
    ? useMotionTemplate`
      linear-gradient(90deg, transparent, rgba(255,200,0,0.35) ${holoX}%, transparent)
    `
    : useMotionTemplate`
      linear-gradient(90deg, transparent, rgba(16,185,129,0.4) ${holoX}%, transparent)
    `;

  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const isCIB = product.completeness.toLowerCase().includes('compleet');

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAddedToCart(true);
    setConfetti({ x: e.clientX, y: e.clientY });
    addToast(`${product.name} toegevoegd aan winkelwagen`, 'success', undefined, product.image || undefined);
    setTimeout(() => setAddedToCart(false), 1500);

    // Fly animation: product image → cart icon
    const imgEl = cardRef.current?.querySelector('img');
    const cartEl = document.querySelector('[aria-label="Winkelwagen"]');
    if (imgEl && cartEl && product.image) {
      const from = imgEl.getBoundingClientRect();
      const to = cartEl.getBoundingClientRect();
      setFlyData({ from, to, image: product.image });
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFlipped(!flipped);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.sku);
    addToast(
      wishlisted ? `${product.name} verwijderd van verlanglijst` : `${product.name} toegevoegd aan verlanglijst`,
      wishlisted ? 'info' : 'success'
    );
  };

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: flipped ? 0 : (isHovered ? rotateX : 0),
          rotateY: flipped ? 180 : (isHovered ? rotateY : 0),
          scale: isHovered ? 1.02 : 1,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{
          y: -12,
          transition: { duration: 0.4, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ rotateY: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        className="relative group"
      >
        {/* === FRONT FACE === */}
        <div style={{ backfaceVisibility: 'hidden' }} className="relative bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-800/95 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_20px_50px_-12px_rgba(16,185,129,0.18)] hover:border-emerald-400/50 dark:hover:border-emerald-500/50 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.04] transition-all duration-500 backdrop-blur-sm flex flex-col">
        {/* Holographic rainbow glow */}
        {isHovered && !flipped && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
            style={{ background: holoBackground }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Premium glow aura */}
        {isHovered && !flipped && (
          <motion.div
            className={cn(
              "absolute inset-0 z-[5] pointer-events-none rounded-2xl blur-2xl",
              product.isPremium
                ? "bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-violet-500/10"
                : "bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10"
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}

        {/* Premium holographic foil texture */}
        {isHovered && !flipped && product.isPremium && (
          <motion.div
            className="absolute inset-0 z-[11] pointer-events-none rounded-2xl holo-foil-texture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Top edge light that follows cursor */}
        {isHovered && !flipped && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px] z-20 pointer-events-none"
            style={{ background: edgeLightBackground }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Product image */}
        <Link href={`/shop/${product.sku}`}>
          <div className={`relative h-52 ${product.image && !imageError ? 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-700 dark:to-slate-800' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden`}>
            {product.image && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                )}
                <Image
                  src={product.image}
                  alt={`${product.name} - ${product.platform} ${product.condition}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={cn("object-contain p-4 group-hover:scale-105 transition-all duration-700 ease-out will-change-transform", imageLoaded ? "opacity-100" : "opacity-0")}
                  priority={false}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {/* Diagonal shimmer sweep on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full -translate-y-full transition-all duration-1200 ease-in-out"
                  animate={isHovered ? { x: 200, y: 200 } : { x: -200, y: -200 }}
                />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <span className="text-white/[0.15] text-6xl font-black select-none group-hover:scale-110 transition-transform duration-500">
                  {platformLabel}
                </span>
              </>
            )}

            {/* Platform label with glass effect */}
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 rounded-lg ${product.image ? 'bg-slate-900/70 backdrop-blur-md' : 'bg-black/20 backdrop-blur-sm'} text-white text-[11px] font-semibold tracking-wide`}>
                {product.platform}
              </span>
            </div>

            {/* Premium/Console badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              {product.isPremium && <Badge variant="premium">PREMIUM</Badge>}
              {product.isConsole && <Badge variant="console">CONSOLE</Badge>}
            </div>
          </div>
        </Link>

        {/* Flip info + wishlist buttons */}
        <div className="absolute bottom-[72px] right-3 z-30 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Verwijder van verlanglijst' : 'Voeg toe aan verlanglijst'}
            className={cn(
              "h-7 w-7 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all duration-300 hover:scale-110",
              wishlisted
                ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-500"
                : "bg-slate-100/90 dark:bg-slate-700/90 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:border-red-300"
            )}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
              aria-label="Quick view"
              className="h-7 w-7 rounded-full bg-slate-100/90 dark:bg-slate-700/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 hover:scale-110"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleFlip}
            aria-label="Meer informatie"
            className="h-7 w-7 rounded-full bg-slate-100/90 dark:bg-slate-700/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 hover:scale-110"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent" />

        {/* Content */}
        <div className="relative z-20 p-4 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <Badge variant="condition">{product.condition}</Badge>
            <Badge variant="completeness">{isCIB ? 'CIB' : product.completeness}</Badge>
          </div>

          <Link href={`/shop/${product.sku}`}>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-200/80 dark:border-slate-600/50">
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.price >= FREE_SHIPPING_THRESHOLD && (
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Gratis verzending</span>
              )}
            </div>
            <motion.button
              onClick={handleAddToCart}
              aria-label={`${product.name} toevoegen aan winkelwagen`}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative h-9 px-4 rounded-lg text-white text-xs font-bold overflow-hidden transition-all duration-300 uppercase tracking-wider",
                addedToCart
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/40"
                  : "bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:from-emerald-400 hover:to-teal-400 animate-cta-attention"
              )}
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Toegevoegd
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    + Winkelmand
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
        </div>

        {/* === BACK FACE — Collector Info === */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-800/95 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm ring-1 ring-slate-900/[0.03] dark:ring-white/[0.04]"
        >
          {/* Header gradient */}
          <div className={`h-14 bg-gradient-to-r ${colors.from} ${colors.to} flex items-center justify-between px-4`}>
            <span className="text-white text-xs font-bold uppercase tracking-wider">Collector Info</span>
            <button
              onClick={handleFlip}
              aria-label="Terug naar voorkant"
              className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 mb-3">
              {product.name}
            </h3>

            {[
              { label: 'Platform', value: product.platform },
              { label: 'Genre', value: product.genre },
              { label: 'Conditie', value: product.condition },
              { label: 'Compleetheid', value: isCIB ? 'CIB' : product.completeness },
              { label: 'SKU', value: product.sku },
              { label: 'Gewicht', value: `${product.weight} kg` },
            ].map((spec) => (
              <div key={spec.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500">{spec.label}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{spec.value}</span>
              </div>
            ))}

            <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-700">
              <Link
                href={`/shop/${product.sku}`}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                Bekijk product
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      {confetti && (
        <ConfettiBurst x={confetti.x} y={confetti.y} onComplete={() => setConfetti(null)} />
      )}
      {flyData && typeof document !== 'undefined' && createPortal(
        <>
          {/* Afterimage trail (4 ghost copies) */}
          {[0.5, 0.3, 0.18, 0.08].map((alpha, i) => (
            <motion.div
              key={`trail-${i}`}
              className="fixed z-[199] pointer-events-none rounded-xl overflow-hidden"
              initial={{
                left: flyData.from.left,
                top: flyData.from.top,
                width: flyData.from.width,
                height: flyData.from.height,
                opacity: alpha,
                scale: 1 - i * 0.05,
              }}
              animate={{
                left: [
                  flyData.from.left,
                  (flyData.from.left + flyData.to.left) / 2 - 30 + i * 15,
                  flyData.to.left + flyData.to.width / 2 - 16,
                ],
                top: [
                  flyData.from.top,
                  Math.min(flyData.from.top, flyData.to.top) - 60 - i * 10,
                  flyData.to.top + flyData.to.height / 2 - 16,
                ],
                width: 32,
                height: 32,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{
                duration: 0.7,
                delay: i * 0.04,
                ease: [0.32, 0, 0.67, 0],
              }}
            >
              <img src={flyData.image} alt="" className="w-full h-full object-contain bg-white/80 rounded-xl" />
            </motion.div>
          ))}
          {/* Main flying element — 3D spiral */}
          <motion.div
            className="fixed z-[200] pointer-events-none rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/30"
            initial={{
              left: flyData.from.left,
              top: flyData.from.top,
              width: flyData.from.width,
              height: flyData.from.height,
              opacity: 1,
              rotateY: 0,
              rotateZ: 0,
              scale: 1,
            }}
            animate={{
              left: [
                flyData.from.left,
                (flyData.from.left + flyData.to.left) / 2 - 40,
                flyData.to.left + flyData.to.width / 2 - 16,
              ],
              top: [
                flyData.from.top,
                Math.min(flyData.from.top, flyData.to.top) - 80,
                flyData.to.top + flyData.to.height / 2 - 16,
              ],
              width: [flyData.from.width, flyData.from.width * 0.6, 32],
              height: [flyData.from.height, flyData.from.height * 0.6, 32],
              opacity: [1, 1, 0],
              rotateY: [0, 360, 720],
              rotateZ: [0, -10, 0],
              scale: [1, 0.7, 0.3],
            }}
            transition={{ duration: 0.7, ease: [0.32, 0, 0.67, 0] }}
            onAnimationComplete={() => setFlyData(null)}
            style={{ transformPerspective: 600 }}
          >
            <img src={flyData.image} alt="" className="w-full h-full object-contain bg-white" />
          </motion.div>
        </>,
        document.body
      )}
    </div>
  );
}
