'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, type Product } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS } from '@/lib/utils';

const VISIBLE_CARDS = 7; // Hoeveel kaarten zichtbaar (oneven voor symmetrie)
const AUTO_INTERVAL = 4000;

export default function GameCarousel3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoPaused, setAutoPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 0.3], ['0px', '-20px']);

  const products = useMemo(() => {
    const withImage = getAllProducts().filter(p => p.image);
    const premium = withImage.filter(p => p.isPremium);
    const regular = withImage.filter(p => !p.isPremium);
    const mixed: Product[] = [];
    let pi = 0, ri = 0;
    while (mixed.length < 16 && (pi < premium.length || ri < regular.length)) {
      if (pi < premium.length) mixed.push(premium[pi++]);
      if (mixed.length < 16 && ri < regular.length) mixed.push(regular[ri++]);
    }
    return mixed;
  }, []);

  const total = products.length;

  const navigate = useCallback((dir: number) => {
    setDirection(dir);
    setActiveIndex(prev => (prev + dir + total) % total);
  }, [total]);

  const pauseAutoRotation = useCallback(() => {
    setAutoPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setAutoPaused(false), 6000);
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
    if (Math.abs(dragDelta) > 50) {
      navigate(dragDelta > 0 ? -1 : 1);
      pauseAutoRotation();
    }
    setDragDelta(0);
  }, [isDragging, dragDelta, navigate, pauseAutoRotation]);

  // Bereken kaart posities relatief aan active
  const getCardStyle = useCallback((index: number) => {
    let offset = index - activeIndex;
    // Wrap around
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    const half = Math.floor(VISIBLE_CARDS / 2);

    if (absOffset > half) {
      return { visible: false, x: 0, scale: 0, opacity: 0, z: 0, blur: 0 };
    }

    const x = offset * 220;
    const scale = 1 - absOffset * 0.12;
    const opacity = absOffset === 0 ? 1 : Math.max(0.3, 1 - absOffset * 0.22);
    const z = 50 - absOffset * 10;
    const blur = absOffset === 0 ? 0 : absOffset * 1.5;

    return { visible: true, x, scale, opacity, z, blur };
  }, [activeIndex, total]);

  const activeProduct = products[activeIndex];
  const platformLabel = activeProduct ? (PLATFORM_LABELS[activeProduct.platform] || activeProduct.platform) : '';

  if (total === 0) return null;

  return (
    <section ref={sectionRef} className="relative bg-[#050810] py-24 lg:py-32 overflow-hidden">
      {/* Achtergrond */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-900/[0.06] to-transparent" />
      </div>

      {/* Header */}
      <motion.div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center z-10"
        style={{ y: headerY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Collectie
          </span>
          <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">
            Ontdek onze{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              games
            </span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-md mx-auto text-sm lg:text-base">
            Sleep, gebruik pijltjes of klik om door onze collectie te browsen
          </p>
        </motion.div>
      </motion.div>

      {/* Carousel */}
      <div className="relative max-w-7xl mx-auto px-4">
        <div
          className="relative h-[420px] md:h-[480px] select-none touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Glow onder actieve kaart */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          {products.map((product, index) => {
            const style = getCardStyle(index);
            if (!style.visible) return null;

            const isActive = index === activeIndex;
            const pLabel = PLATFORM_LABELS[product.platform] || product.platform;

            return (
              <motion.div
                key={product.sku}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[240px]"
                animate={{
                  x: style.x + (isDragging ? dragDelta * 0.3 : 0),
                  scale: style.scale,
                  opacity: style.opacity,
                  filter: `blur(${style.blur}px)`,
                }}
                transition={isDragging ? { duration: 0 } : {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                style={{
                  zIndex: style.z,
                  marginLeft: '-100px',
                  marginTop: '-190px',
                }}
              >
                <Link
                  href={`/shop/${product.sku}`}
                  onClick={(e) => { if (!isActive) e.preventDefault(); }}
                  className="block"
                >
                  <div
                    className="rounded-2xl overflow-hidden transition-shadow duration-500"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(15,23,42,0.95), rgba(7,14,26,0.98))',
                      boxShadow: isActive
                        ? '0 0 60px rgba(16,185,129,0.15), 0 20px 60px rgba(0,0,0,0.6)'
                        : '0 8px 30px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Accent lijn boven */}
                    {isActive && (
                      <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                    )}

                    {/* Afbeelding */}
                    <div className="relative h-[260px] md:h-[300px] flex items-center justify-center p-4">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="240px"
                          className="object-contain p-4"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-white/20 text-sm font-bold">{pLabel}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-4 pb-4 pt-2 text-center">
                      <p className="text-white text-xs font-bold line-clamp-2 leading-tight mb-1">
                        {product.name}
                      </p>
                      <p className="text-slate-500 text-[10px] font-medium mb-2">{pLabel}</p>
                      <p className="text-emerald-400 font-extrabold text-base">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Navigatie pijlen */}
        <button
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-emerald-500/30 transition-all"
          onClick={() => { navigate(-1); pauseAutoRotation(); }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-emerald-500/30 transition-all"
          onClick={() => { navigate(1); pauseAutoRotation(); }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Actieve game info */}
        <AnimatePresence mode="wait">
          {activeProduct && (
            <motion.div
              key={activeProduct.sku}
              className="flex justify-center mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href={`/shop/${activeProduct.sku}`}
                className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.03] backdrop-blur border border-white/[0.06] hover:border-emerald-500/20 transition-all group"
              >
                <div>
                  <p className="text-white text-sm font-bold group-hover:text-emerald-400 transition-colors">
                    {activeProduct.name}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{platformLabel}</p>
                </div>
                <span className="text-emerald-400 font-extrabold text-lg">
                  {formatPrice(activeProduct.price)}
                </span>
                <span className="text-emerald-500/60 text-xs font-medium flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                  Bekijk
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-6">
          {products.map((_, i) => (
            <button
              key={i}
              className="transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeIndex ? '#10b981' : 'rgba(255,255,255,0.1)',
              }}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1);
                setActiveIndex(i);
                pauseAutoRotation();
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
