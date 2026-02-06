'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 300, damping: 30 });
  const shineX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 300, damping: 30 });
  const shineY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 300, damping: 30 });

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
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
        className="relative group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-200/40 transition-all duration-500"
      >
        {/* Spotlight glow effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: `radial-gradient(400px circle at ${shineX.get()}% ${shineY.get()}%, rgba(16,185,129,0.08), transparent 60%)`,
            }}
          />
        )}

        {/* Shine overlay */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(200px circle at ${shineX.get()}% ${shineY.get()}%, rgba(255,255,255,0.15), transparent 60%)`,
            }}
          />
        )}

        {/* Image placeholder with platform gradient */}
        <Link href={`/shop/${product.sku}`}>
          <div className={`relative h-48 bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center overflow-hidden`}>
            {/* Animated shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Platform text */}
            <span className="text-white/[0.15] text-6xl font-black select-none group-hover:scale-110 transition-transform duration-500">
              {platformLabel}
            </span>

            {/* Platform label */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide">
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
            <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatPrice(product.price)}
            </span>
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-shadow duration-300"
            >
              + Winkelmand
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
