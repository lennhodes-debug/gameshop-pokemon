'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useAnimationFrame, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, type Product } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS, getGameTheme } from '@/lib/utils';

const CARD_COUNT_DESKTOP = 14;
const CARD_COUNT_MOBILE = 8;
const ROTATION_DURATION = 35;
const RADIUS_DESKTOP = 520;
const RADIUS_MOBILE = 240;
const CARD_W_DESKTOP = 190;
const CARD_H_DESKTOP = 280;
const CARD_W_MOBILE = 130;
const CARD_H_MOBILE = 185;

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2.5,
  duration: 4 + Math.random() * 8,
  delay: Math.random() * 4,
}));

function AmbientParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(16, 185, 129, ${0.15 + Math.random() * 0.2})`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

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
  const gameTheme = getGameTheme(product.sku, product.genre);
  const cardGlow = gameTheme ? gameTheme.glow : '16,185,129';
  const cardAccent = gameTheme ? gameTheme.bg[0] : '#10b981';
  const cardAccentAlt = gameTheme ? gameTheme.bg[1] : '#0d9488';

  const slotAngle = (2 * Math.PI / totalCards) * index;
  const angle = useTransform(rotation, (r: number) => slotAngle + r);

  const rotateYDeg = useTransform(angle, (a: number) => `${(a * 180) / Math.PI}deg`);

  const cosVal = useTransform(angle, (a: number) => Math.cos(a));

  const cardOpacity = useTransform(cosVal, (c: number) => {
    if (c < -0.3) return 0;
    return 0.1 + 0.9 * ((c + 0.3) / 1.3);
  });

  const cardScale = useTransform(cosVal, (c: number) => {
    return 0.5 + 0.5 * ((c + 1) / 2);
  });

  const zIndex = useTransform(cosVal, (c: number) => Math.round(c * 100));

  const cardFilter = useTransform(cosVal, (c: number) => {
    if (c > 0.75) return 'blur(0px) brightness(1.15) saturate(1.15)';
    if (c > 0.4) return 'blur(0.5px) brightness(1.02)';
    if (c > 0) return 'blur(1.5px) brightness(0.8) saturate(0.8)';
    return 'blur(3px) brightness(0.5) saturate(0.6)';
  });

  // Glow intensiteit op basis van positie — per-game kleur
  const glowShadow = useTransform(cosVal, (c: number) => {
    if (c > 0.85)
      return `0 0 60px rgba(${cardGlow},0.4), 0 0 120px rgba(${cardGlow},0.15), 0 20px 60px rgba(0,0,0,0.7)`;
    if (c > 0.6)
      return `0 0 35px rgba(${cardGlow},0.2), 0 0 70px rgba(${cardGlow},0.08), 0 12px 40px rgba(0,0,0,0.6)`;
    if (c > 0.3)
      return `0 0 15px rgba(${cardGlow},0.08), 0 6px 24px rgba(0,0,0,0.5)`;
    return '0 2px 10px rgba(0,0,0,0.3)';
  });

  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;

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
        boxShadow: glowShadow,
        borderRadius: 18,
      }}
    >
      <div
        className="w-full h-full rounded-[18px] overflow-hidden border group/ccard transition-all duration-300 relative"
        style={{
          background: `linear-gradient(to bottom, rgba(13,26,48,0.95), rgba(7,14,26,0.98))`,
          borderColor: `rgba(${cardGlow}, 0.12)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `rgba(${cardGlow}, 0.5)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `rgba(${cardGlow}, 0.12)`;
        }}
      >
        {/* Holographic shimmer sweep op voorgrond kaarten */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `linear-gradient(105deg, transparent 40%, rgba(${cardGlow}, 0.08) 45%, rgba(255,255,255,0.06) 50%, rgba(${cardGlow}, 0.08) 55%, transparent 60%)`,
            backgroundSize: '200% 100%',
            animation: 'holo-sweep 4s ease-in-out infinite',
            animationDelay: `${index * 0.3}s`,
          }}
        />

        {/* Top-accent gradient lijn */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] z-10"
          style={{
            background: `linear-gradient(to right, transparent, ${cardAccent}, ${cardAccentAlt}, transparent)`,
            opacity: 0.6,
          }}
        />

        <Link href={`/shop/${product.sku}`} className="flex flex-col w-full h-full">
          {/* Afbeelding */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {/* Achtergrond glow */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                background: `radial-gradient(circle at 50% 60%, ${cardAccent}, transparent 70%)`,
              }}
            />

            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="200px"
                className="object-contain p-3 group-hover/ccard:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/20 text-xs font-black">{product.platform}</span>
              </div>
            )}

            {/* Top shine */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
          </div>

          {/* Separator met game-kleur */}
          <div
            className="h-px mx-4"
            style={{ background: `linear-gradient(to right, transparent, ${cardAccent}66, transparent)` }}
          />

          {/* Info */}
          <div className="px-3 py-3 text-center">
            <p className="text-white text-[11px] font-bold line-clamp-2 leading-tight mb-1.5">
              {product.name}
            </p>
            <p className="text-[10px] font-semibold mb-1.5" style={{ color: `${cardAccent}CC` }}>
              {platformLabel}
            </p>
            <p
              className="font-extrabold text-sm tracking-tight"
              style={{ color: cardAccent }}
            >
              {formatPrice(product.price)}
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

function CenterCardInfo({
  product,
  visible,
}: {
  product: Product | null;
  visible: boolean;
}) {
  if (!product) return null;
  const theme = getGameTheme(product.sku, product.genre);
  const accent = theme ? theme.bg[0] : '#10b981';
  const label = theme ? theme.label : '';

  return (
    <AnimatePresence mode="wait">
      {visible && product && (
        <motion.div
          key={product.sku}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/[0.08]"
            style={{ background: 'rgba(5,8,16,0.85)' }}
          >
            {/* Kleur dot */}
            <div className="relative">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: accent, boxShadow: `0 0 10px ${accent}80` }}
              />
            </div>
            <div className="text-white text-xs font-bold truncate max-w-[200px]">
              {product.name}
            </div>
            {label && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${accent}20`, color: accent }}
              >
                {label}
              </span>
            )}
            <div className="text-white/80 text-xs font-bold">
              {formatPrice(product.price)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavArrow({
  direction,
  onClick,
  accentColor,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  accentColor: string;
}) {
  return (
    <motion.button
      className="absolute top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-md border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-all duration-300"
      style={{
        [direction === 'left' ? 'left' : 'right']: '4%',
        background: 'rgba(5,8,16,0.6)',
      }}
      onClick={onClick}
      whileHover={{
        scale: 1.15,
        borderColor: `${accentColor}60`,
        boxShadow: `0 0 20px ${accentColor}30`,
      }}
      whileTap={{ scale: 0.9 }}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={direction === 'left' ? 'M15.75 19.5L8.25 12l7.5-7.5' : 'M8.25 4.5l7.5 7.5-7.5 7.5'}
        />
      </svg>
    </motion.button>
  );
}

function ProgressRing({ rotation, totalCards, accentColor }: { rotation: ReturnType<typeof useSpring>; totalCards: number; accentColor: string }) {
  const progress = useTransform(rotation, (r: number) => {
    const normalized = ((r % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return normalized / (2 * Math.PI);
  });
  const dashOffset = useTransform(progress, (p: number) => 283 * (1 - p));

  return (
    <motion.div
      className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      <svg width="60" height="60" viewBox="0 0 100 100" className="opacity-40">
        {/* Track */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        {/* Progress */}
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeDasharray="283"
          style={{ strokeDashoffset: dashOffset }}
          strokeLinecap="round"
          transform="rotate(-90, 50, 50)"
        />
      </svg>
    </motion.div>
  );
}

export default function GameCarousel3D() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rotation = useMotionValue(0);
  const springRotation = useSpring(rotation, { stiffness: 35, damping: 28, mass: 1.5 });
  const isDragging = useRef(false);
  const autoRotateEnabled = useRef(true);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [frontProduct, setFrontProduct] = useState<Product | null>(null);
  const [frontAccent, setFrontAccent] = useState('#10b981');

  // Scroll-based parallax voor achtergrond
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);

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
  const containerHeight = isMobile ? 360 : 520;

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

  // Track welke kaart vooraan staat
  useEffect(() => {
    if (!mounted || displayProducts.length === 0) return;
    const unsubscribe = springRotation.on('change', (r: number) => {
      let bestIdx = 0;
      let bestCos = -2;
      for (let i = 0; i < displayProducts.length; i++) {
        const slotAngle = (2 * Math.PI / displayProducts.length) * i;
        const c = Math.cos(slotAngle + r);
        if (c > bestCos) {
          bestCos = c;
          bestIdx = i;
        }
      }
      const prod = displayProducts[bestIdx];
      if (prod) {
        setFrontProduct(prod);
        const theme = getGameTheme(prod.sku, prod.genre);
        setFrontAccent(theme ? theme.bg[0] : '#10b981');
      }
    });
    return () => unsubscribe();
  }, [mounted, displayProducts, springRotation]);

  // Auto-rotatie
  useAnimationFrame((_, delta) => {
    if (isDragging.current || !autoRotateEnabled.current) return;
    const increment = (2 * Math.PI / ROTATION_DURATION) * (delta / 1000);
    rotation.set(rotation.get() + increment);
  });

  // Navigate naar volgende/vorige kaart
  const navigateCard = useCallback((direction: 'left' | 'right') => {
    const step = (2 * Math.PI) / cardCount;
    const target = rotation.get() + (direction === 'right' ? -step : step);
    rotation.set(target);
    autoRotateEnabled.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { autoRotateEnabled.current = true; }, 4000);
  }, [rotation, cardCount]);

  // Pointer events
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
    }, 3500);
  }, []);

  // Scroll wheel rotatie
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      rotation.set(rotation.get() - e.deltaX * 0.002);
    }
  }, [rotation]);

  return (
    <section ref={sectionRef} className="relative bg-[#050810] py-20 lg:py-32 overflow-hidden">
      {/* Dynamische achtergrond — reageert op scroll */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY, scale: bgScale }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,rgba(16,185,129,0.1),transparent_40%)]" />
      </motion.div>

      {/* Dynamische accent glow — verandert kleur op basis van voorste kaart */}
      <motion.div
        className="absolute inset-0 transition-all duration-1000 ease-out pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${frontAccent}10, transparent 50%)`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient particles */}
      <AmbientParticles />

      {/* Vloer highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-emerald-900/[0.06] via-emerald-900/[0.02] to-transparent" />

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              background: `${frontAccent}12`,
              borderColor: `${frontAccent}30`,
              color: frontAccent,
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            Collectie
          </motion.span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
            Ontdek onze{' '}
            <span className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-aurora" style={{ backgroundSize: '200% 100%' }}>
                games
              </span>
              {/* Glanzende underline */}
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full overflow-hidden"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </motion.div>
            </span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-lg mx-auto text-sm lg:text-base">
            Draai, sleep of gebruik de pijltjes om door onze collectie te browsen
          </p>
        </motion.div>
      </div>

      {/* 3D Carousel */}
      {mounted && (
        <motion.div
          className="relative mx-auto select-none touch-none"
          style={{ height: containerHeight }}
          initial={{ opacity: 0, scale: 0.8, rotateX: 15 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Navigatie pijlen */}
          <NavArrow direction="left" onClick={() => navigateCard('left')} accentColor={frontAccent} />
          <NavArrow direction="right" onClick={() => navigateCard('right')} accentColor={frontAccent} />

          {/* Carousel container */}
          <div
            className="relative w-full h-full cursor-grab active:cursor-grabbing"
            style={{
              perspective: isMobile ? '800px' : '1200px',
              perspectiveOrigin: '50% 38%',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
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

          {/* Reflectie op de "vloer" */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-40 pointer-events-none">
            {/* Primaire glow — dynamische kleur */}
            <div
              className="absolute inset-0 blur-3xl transition-colors duration-1000"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${frontAccent}18, transparent 70%)`,
              }}
            />
            {/* Secundaire vaste glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/[0.04] via-emerald-500/[0.02] to-transparent blur-2xl" />
            {/* Vloer lijn */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-px transition-colors duration-1000"
              style={{
                background: `linear-gradient(to right, transparent, ${frontAccent}40, transparent)`,
              }}
            />
          </div>

          {/* Info panel van voorste kaart */}
          <CenterCardInfo product={frontProduct} visible={!isDragging.current} />

          {/* Progress ring */}
          <ProgressRing rotation={springRotation} totalCards={cardCount} accentColor={frontAccent} />
        </motion.div>
      )}

      {/* Instructie hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-center mt-8"
      >
        <span className="inline-flex items-center gap-3 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <motion.svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              animate={{ x: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </motion.svg>
            Sleep om te draaien
          </span>
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Pijltjes om te navigeren
          </span>
        </span>
      </motion.div>
    </section>
  );
}
