'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, type Product } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS, getGameTheme } from '@/lib/utils';

const VISIBLE_CARDS = 9;
const AUTO_INTERVAL = 5000;
const DRAG_THRESHOLD = 40;

// Beste afbeelding kiezen: CIB > standaard
function getBestImage(product: Product): string | null {
  return product.cibImage || product.image || null;
}

export default function GameCarousel3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoPaused, setAutoPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const products = useMemo(() => {
    const all = getAllProducts().filter(p => p.image || p.cibImage);
    // Prioriteit: CIB producten eerst (die zien er beter uit in carousel)
    const withCib = all.filter(p => p.cibImage);
    const premium = all.filter(p => p.isPremium && !p.cibImage);
    const regular = all.filter(p => !p.isPremium && !p.cibImage);
    const mixed: Product[] = [];

    // CIB producten eerst (max 8), dan premium, dan regular tot 18
    for (const p of withCib) { if (mixed.length < 18) mixed.push(p); }
    for (const p of premium) { if (mixed.length < 18) mixed.push(p); }
    for (const p of regular) { if (mixed.length < 18) mixed.push(p); }

    return mixed;
  }, []);

  const total = products.length;

  const navigate = useCallback((dir: number) => {
    setActiveIndex(prev => (prev + dir + total) % total);
  }, [total]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const pauseAutoRotation = useCallback(() => {
    setAutoPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setAutoPaused(false), 8000);
  }, []);

  // Auto-rotatie
  useEffect(() => {
    if (autoPaused || total === 0) return;
    autoTimer.current = setTimeout(() => navigate(1), AUTO_INTERVAL);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [activeIndex, autoPaused, navigate, total]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { navigate(-1); pauseAutoRotation(); }
      if (e.key === 'ArrowRight') { navigate(1); pauseAutoRotation(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, pauseAutoRotation]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragDelta(0);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragDelta(e.clientX - dragStartX);
  }, [isDragging, dragStartX]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragDelta) > DRAG_THRESHOLD) {
      navigate(dragDelta > 0 ? -1 : 1);
      pauseAutoRotation();
    }
    setDragDelta(0);
  }, [isDragging, dragDelta, navigate, pauseAutoRotation]);

  // Card posities
  const getCardStyle = useCallback((index: number) => {
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    const half = Math.floor(VISIBLE_CARDS / 2);

    if (absOffset > half) {
      return { visible: false, x: 0, scale: 0, opacity: 0, z: 0, rotateY: 0 };
    }

    // Meer dramatische diepte: actieve kaart domineert
    const spacing = absOffset === 0 ? 0 : 160 + absOffset * 40;
    const x = offset === 0 ? 0 : Math.sign(offset) * spacing;
    const scale = absOffset === 0 ? 1 : Math.max(0.55, 0.82 - absOffset * 0.07);
    const opacity = absOffset === 0 ? 1 : Math.max(0.2, 0.7 - absOffset * 0.12);
    const z = absOffset === 0 ? 100 : 50 - absOffset * 12;
    // Subtiele 3D rotatie voor diepte-effect
    const rotateY = absOffset === 0 ? 0 : Math.sign(offset) * -15;

    return { visible: true, x, scale, opacity, z, rotateY };
  }, [activeIndex, total]);

  const activeProduct = products[activeIndex];
  const activeTheme = activeProduct ? getGameTheme(activeProduct.sku, activeProduct.genre) : null;
  const accentColor = activeTheme ? activeTheme.bg[0] : '#10b981';
  const accentGlow = activeTheme ? activeTheme.glow : '16,185,129';

  if (total === 0) return null;

  return (
    <section ref={sectionRef} className="relative bg-[#050810] py-28 lg:py-40 overflow-hidden">
      {/* Dynamische achtergrond die verandert per actieve game */}
      <motion.div className="absolute inset-0 transition-colors duration-1000" style={{ opacity: bgOpacity }}>
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(${accentGlow},0.06), transparent 70%)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#050810] to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#050810] to-transparent" />
      </motion.div>

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-white/25 text-xs font-medium uppercase tracking-[0.3em] mb-4">
            Collectie
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            Ontdek onze games
          </h2>
        </motion.div>
      </div>

      {/* Carousel */}
      <div className="relative max-w-7xl mx-auto px-4" style={{ perspective: '1200px' }}>
        <div
          className="relative h-[440px] md:h-[520px] select-none touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Reflectie glow */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-48 rounded-full pointer-events-none blur-3xl transition-colors duration-700"
            style={{ background: `rgba(${accentGlow},0.08)` }}
          />

          {products.map((product, index) => {
            const style = getCardStyle(index);
            if (!style.visible) return null;

            const isActive = index === activeIndex;
            const isHovered = hoveredIndex === index;
            const displayImage = getBestImage(product);
            const pLabel = PLATFORM_LABELS[product.platform] || product.platform;
            const theme = getGameTheme(product.sku, product.genre);
            const cardAccent = theme ? theme.bg[0] : '#10b981';

            return (
              <motion.div
                key={product.sku}
                className="absolute left-1/2 top-1/2"
                animate={{
                  x: style.x + (isDragging ? dragDelta * 0.4 : 0),
                  scale: style.scale,
                  opacity: style.opacity,
                  rotateY: style.rotateY,
                }}
                transition={isDragging ? { duration: 0 } : {
                  type: 'spring',
                  stiffness: 260,
                  damping: 28,
                  mass: 0.8,
                }}
                style={{
                  zIndex: style.z,
                  width: isActive ? 260 : 220,
                  marginLeft: isActive ? -130 : -110,
                  marginTop: isActive ? -220 : -190,
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (!isActive) {
                    let offset = index - activeIndex;
                    if (offset > total / 2) offset -= total;
                    if (offset < -total / 2) offset += total;
                    navigate(offset > 0 ? 1 : -1);
                    pauseAutoRotation();
                  }
                }}
              >
                <Link
                  href={`/shop/${product.sku}`}
                  onClick={(e) => { if (!isActive) e.preventDefault(); }}
                  className="block"
                  draggable={false}
                >
                  <div
                    className="rounded-2xl overflow-hidden transition-all duration-500"
                    style={{
                      background: isActive
                        ? `linear-gradient(145deg, rgba(15,23,42,0.97), rgba(10,16,30,0.99))`
                        : 'rgba(15,23,42,0.9)',
                      boxShadow: isActive
                        ? `0 0 80px rgba(${accentGlow},0.12), 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)`
                        : '0 8px 32px rgba(0,0,0,0.5)',
                      border: isActive ? `1px solid rgba(${accentGlow},0.15)` : '1px solid rgba(255,255,255,0.04)',
                      cursor: isActive ? 'pointer' : 'default',
                    }}
                  >
                    {/* Top accent */}
                    <div
                      className="h-[2px] transition-all duration-700"
                      style={{
                        background: isActive
                          ? `linear-gradient(90deg, transparent, ${cardAccent}, transparent)`
                          : 'transparent',
                      }}
                    />

                    {/* Afbeelding */}
                    <div className={`relative ${isActive ? 'h-[300px] md:h-[340px]' : 'h-[240px] md:h-[280px]'} flex items-center justify-center overflow-hidden`}>
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={product.name}
                          fill
                          sizes={isActive ? '260px' : '220px'}
                          className="object-contain p-3 transition-transform duration-700 ease-out"
                          style={{
                            transform: isActive && isHovered ? 'scale(1.05)' : 'scale(1)',
                          }}
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <span className="text-white/15 text-sm font-bold">{pLabel}</span>
                      )}

                      {/* Subtiele overlay voor niet-actieve kaarten */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-[#050810]/20 pointer-events-none" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-4 pb-4 pt-1 text-center">
                      <p className={`text-white font-bold line-clamp-2 leading-snug mb-1 transition-all duration-300 ${isActive ? 'text-sm' : 'text-xs'}`}>
                        {product.name}
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-slate-500 text-[10px] font-medium">{pLabel}</span>
                        {product.condition && isActive && (
                          <>
                            <span className="text-slate-700 text-[10px]">·</span>
                            <span className="text-slate-500 text-[10px] font-medium">{product.condition}</span>
                          </>
                        )}
                      </div>
                      <p
                        className={`font-bold transition-all duration-300 ${isActive ? 'text-lg' : 'text-base'}`}
                        style={{ color: cardAccent }}
                      >
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Navigatie knoppen — minimalistisch */}
        <button
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-300"
          onClick={() => { navigate(-1); pauseAutoRotation(); }}
          aria-label="Vorige"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-300"
          onClick={() => { navigate(1); pauseAutoRotation(); }}
          aria-label="Volgende"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Actieve product CTA */}
        <AnimatePresence mode="wait">
          {activeProduct && (
            <motion.div
              key={activeProduct.sku}
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/shop/${activeProduct.sku}`}
                className="group inline-flex items-center gap-5 px-7 py-3.5 rounded-2xl transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `rgba(${accentGlow},0.2)`;
                  e.currentTarget.style.background = `rgba(${accentGlow},0.03)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <div className="text-left">
                  <p className="text-white text-sm font-bold group-hover:text-emerald-400 transition-colors">
                    {activeProduct.name}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {PLATFORM_LABELS[activeProduct.platform] || activeProduct.platform}
                  </p>
                </div>
                <span className="text-lg font-bold" style={{ color: accentColor }}>
                  {formatPrice(activeProduct.price)}
                </span>
                <span
                  className="text-xs font-semibold flex items-center gap-1 transition-all duration-300 group-hover:gap-2"
                  style={{ color: `rgba(${accentGlow},0.6)` }}
                >
                  Bekijk
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator — minimaal */}
        <div className="flex justify-center items-center gap-1 mt-8">
          {products.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                className="transition-all duration-400 rounded-full"
                style={{
                  width: isActive ? 28 : 5,
                  height: 5,
                  background: isActive
                    ? `linear-gradient(90deg, ${accentColor}, ${activeTheme ? activeTheme.bg[1] : '#14b8a6'})`
                    : 'rgba(255,255,255,0.08)',
                }}
                onClick={() => {
                  goToIndex(i);
                  pauseAutoRotation();
                }}
                aria-label={`Ga naar game ${i + 1}`}
              />
            );
          })}
        </div>

        {/* Teller */}
        <p className="text-center text-slate-600 text-xs mt-3 tabular-nums">
          {activeIndex + 1} / {total}
        </p>
      </div>
    </section>
  );
}
