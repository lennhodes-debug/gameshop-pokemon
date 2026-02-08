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
import { useToast } from '@/components/ui/Toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [flyData, setFlyData] = useState<{ from: DOMRect; to: DOMRect; image: string } | null>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), { stiffness: 400, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), { stiffness: 400, damping: 20 });
  const scale = useSpring(useTransform(useMotionValue(isHovered ? 1 : 0), [0, 1], [1, 1.02]), { stiffness: 300, damping: 25 });

  // Holographic rainbow gradient that follows cursor
  const holoX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const holoY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const holoBackground = useMotionTemplate`
    radial-gradient(600px circle at ${holoX}% ${holoY}%,
      rgba(16,185,129,0.12) 0%,
      rgba(6,182,212,0.08) 25%,
      rgba(6,182,212,0.06) 50%,
      transparent 80%)
  `;
  const shineBackground = useMotionTemplate`
    radial-gradient(300px circle at ${holoX}% ${holoY}%,
      rgba(255,255,255,0.2) 0%,
      transparent 60%)
  `;
  const edgeLightBackground = useMotionTemplate`
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

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? 1.02 : 1,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{
          y: -12,
          transition: { duration: 0.4, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        className="relative group bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg hover:shadow-[0_30px_80px_-15px_rgba(16,185,129,0.25)] hover:border-emerald-400/40 dark:hover:border-emerald-500/40 transition-all duration-500 backdrop-blur-sm"
      >
        {/* Holographic rainbow glow */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
            style={{ background: holoBackground }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Holographic shine overlay */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
            style={{ background: shineBackground }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Premium glow aura */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-[5] pointer-events-none rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 blur-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}

        {/* Top edge light that follows cursor */}
        {isHovered && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px] z-20 pointer-events-none"
            style={{ background: edgeLightBackground }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Product image */}
        <Link href={`/shop/${product.sku}`}>
          <div className={`relative h-52 ${product.image ? 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-700 dark:to-slate-800' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden`}>
            {product.image ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={cn("object-contain p-4 group-hover:scale-115 transition-all duration-700 ease-out", imageLoaded ? "opacity-100" : "opacity-0")}
                  priority={false}
                  onLoad={() => setImageLoaded(true)}
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

        {/* Content */}
        <div className="relative z-20 p-4">
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

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
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
      </motion.div>
      {confetti && (
        <ConfettiBurst x={confetti.x} y={confetti.y} onComplete={() => setConfetti(null)} />
      )}
      {flyData && typeof document !== 'undefined' && createPortal(
        <motion.div
          className="fixed z-[200] pointer-events-none rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/30"
          initial={{
            left: flyData.from.left,
            top: flyData.from.top,
            width: flyData.from.width,
            height: flyData.from.height,
            opacity: 1,
            borderRadius: 12,
          }}
          animate={{
            left: flyData.to.left + flyData.to.width / 2 - 16,
            top: flyData.to.top + flyData.to.height / 2 - 16,
            width: 32,
            height: 32,
            opacity: 0,
            borderRadius: 16,
          }}
          transition={{ duration: 0.6, ease: [0.32, 0, 0.67, 0] }}
          onAnimationComplete={() => setFlyData(null)}
        >
          <img src={flyData.image} alt="" className="w-full h-full object-contain bg-white" />
        </motion.div>,
        document.body
      )}
    </div>
  );
}
