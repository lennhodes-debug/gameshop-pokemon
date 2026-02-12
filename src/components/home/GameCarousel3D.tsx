'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useAnimationFrame, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, type Product } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS, IMAGE_ROTATION } from '@/lib/utils';

const CARD_COUNT_DESKTOP = 14;
const CARD_COUNT_MOBILE = 10;
const ROTATION_DURATION = 20;
const RADIUS_DESKTOP = 420;
const RADIUS_MOBILE = 240;
const CARD_W_DESKTOP = 190;
const CARD_H_DESKTOP = 270;
const CARD_W_MOBILE = 130;
const CARD_H_MOBILE = 185;

function CarouselCard({
  product,
  index,
  totalCards,
  rotation,
  radius,
  cardWidth,
  cardHeight,
}: {
  product: Product;
  index: number;
  totalCards: number;
  rotation: ReturnType<typeof useSpring>;
  radius: number;
  cardWidth: number;
  cardHeight: number;
}) {
  const slotAngle = (2 * Math.PI / totalCards) * index;

  const angle = useTransform(rotation, (r: number) => slotAngle + r);
  const rotateYDeg = useTransform(angle, (a: number) => `${(a * 180) / Math.PI}deg`);
  const cardOpacity = useTransform(angle, (a: number) => {
    const cosVal = Math.cos(a);
    if (cosVal < -0.3) return 0;
    return 0.3 + 0.7 * ((cosVal + 0.3) / 1.3);
  });
  const cardScale = useTransform(angle, (a: number) => {
    const cosVal = Math.cos(a);
    return 0.7 + 0.3 * ((cosVal + 1) / 2);
  });
  const zIndex = useTransform(angle, (a: number) => Math.round(Math.cos(a) * 100));
  const cardFilter = useTransform(angle, (a: number) => {
    const cosVal = Math.cos(a);
    if (cosVal > 0.5) return 'blur(0px)';
    if (cosVal > 0) return 'blur(1px)';
    return 'blur(2px)';
  });

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: cardWidth,
        height: cardHeight,
        marginLeft: -cardWidth / 2,
        marginTop: -cardHeight / 2,
        transformStyle: 'preserve-3d',
        rotateY: rotateYDeg,
        translateZ: radius,
        opacity: cardOpacity,
        scale: cardScale,
        filter: cardFilter,
        zIndex,
      }}
    >
      <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0a1628] border border-white/10 shadow-2xl group/ccard hover:border-emerald-500/40 transition-colors duration-300">
        <Link href={`/shop/${product.sku}`} className="block w-full h-full flex flex-col">
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="120px"
                className="object-contain p-2 group-hover/ccard:scale-105 transition-transform duration-300"
                style={IMAGE_ROTATION[product.sku] ? { transform: `rotate(${IMAGE_ROTATION[product.sku]}deg) scale(1.1)` } : undefined}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <span className="text-white/20 text-xs font-black">{product.platform}</span>
              </div>
            )}
          </div>
          <div className="px-3 pb-3 text-center">
            <p className="text-white text-[11px] font-bold line-clamp-2 leading-tight mb-1">{product.name}</p>
            <p className="text-emerald-400 text-[10px] font-medium">{PLATFORM_LABELS[product.platform] || product.platform}</p>
            <p className="text-white font-extrabold text-sm mt-1">{formatPrice(product.price)}</p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function GameCarousel3D() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rotation = useMotionValue(0);
  const springRotation = useSpring(rotation, { stiffness: 80, damping: 25 });
  const isDragging = useRef(false);
  const autoRotateEnabled = useRef(true);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cardCount = isMobile ? CARD_COUNT_MOBILE : CARD_COUNT_DESKTOP;
  const radius = isMobile ? RADIUS_MOBILE : RADIUS_DESKTOP;
  const cardWidth = isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP;
  const cardHeight = isMobile ? CARD_H_MOBILE : CARD_H_DESKTOP;
  const containerHeight = isMobile ? 340 : 460;

  const carouselProducts = useMemo(() => {
    const withImage = getAllProducts().filter(p => p.image);
    const premium = withImage.filter(p => p.isPremium);
    const regular = withImage.filter(p => !p.isPremium);
    const mixed: Product[] = [];
    let pi = 0, ri = 0;
    while (mixed.length < CARD_COUNT_DESKTOP && (pi < premium.length || ri < regular.length)) {
      if (pi < premium.length) mixed.push(premium[pi++]);
      if (mixed.length < CARD_COUNT_DESKTOP && ri < regular.length) mixed.push(regular[ri++]);
    }
    return mixed;
  }, []);

  const displayProducts = useMemo(
    () => carouselProducts.slice(0, cardCount),
    [carouselProducts, cardCount]
  );

  // Auto-rotatie
  useAnimationFrame((_, delta) => {
    if (isDragging.current || !autoRotateEnabled.current) return;
    const increment = (2 * Math.PI / ROTATION_DURATION) * (delta / 1000);
    rotation.set(rotation.get() + increment);
  });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    autoRotateEnabled.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    dragStartX.current = e.clientX;
    dragStartRotation.current = rotation.get();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [rotation]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    rotation.set(dragStartRotation.current + dx * 0.005);
  }, [rotation]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    resumeTimer.current = setTimeout(() => {
      autoRotateEnabled.current = true;
    }, 3000);
  }, []);

  return (
    <section className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)]" />

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Collectie
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
            Ontdek onze games
          </h2>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto">
            Draai door onze collectie originele Pokémon games — sleep om te draaien
          </p>
        </motion.div>
      </div>

      {/* 3D Carousel */}
      {mounted && (
        <div
          className="relative mx-auto cursor-grab active:cursor-grabbing select-none touch-none"
          style={{
            height: containerHeight,
            perspective: '1000px',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {displayProducts.map((product, i) => (
              <CarouselCard
                key={product.sku}
                product={product}
                index={i}
                totalCards={cardCount}
                rotation={springRotation}
                radius={radius}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructie hint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="text-center mt-4"
      >
        <span className="text-slate-500 text-xs flex items-center justify-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Sleep om te draaien
        </span>
      </motion.div>
    </section>
  );
}
