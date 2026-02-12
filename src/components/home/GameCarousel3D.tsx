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
const RADIUS_DESKTOP = 540;
const RADIUS_MOBILE = 250;
const CARD_W_DESKTOP = 200;
const CARD_H_DESKTOP = 295;
const CARD_W_MOBILE = 135;
const CARD_H_MOBILE = 195;

const SPARKLE_COUNT = 8;
const SPARKLES = Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
  id: i,
  angle: (360 / SPARKLE_COUNT) * i,
  distance: 90 + Math.random() * 60,
  size: 2 + Math.random() * 3,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 2,
}));

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 3,
  duration: 4 + Math.random() * 8,
  delay: Math.random() * 4,
}));

function AmbientParticles({ accentColor }: { accentColor: string }) {
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
            background: p.id % 3 === 0
              ? `rgba(${accentColor || '16,185,129'}, ${0.2 + Math.random() * 0.2})`
              : `rgba(16, 185, 129, ${0.1 + Math.random() * 0.15})`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 50, 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0, 0.9, 0],
            scale: [0.3, 1.4, 0.3],
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

function SpotlightSparkles({ accentColor, visible }: { accentColor: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-30" aria-hidden="true">
      {SPARKLES.map((s) => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: s.size,
            height: s.size,
          }}
          animate={{
            x: [
              Math.cos((s.angle * Math.PI) / 180) * s.distance,
              Math.cos(((s.angle + 60) * Math.PI) / 180) * (s.distance + 20),
              Math.cos(((s.angle + 120) * Math.PI) / 180) * s.distance,
            ],
            y: [
              Math.sin((s.angle * Math.PI) / 180) * s.distance,
              Math.sin(((s.angle + 60) * Math.PI) / 180) * (s.distance + 20),
              Math.sin(((s.angle + 120) * Math.PI) / 180) * s.distance,
            ],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}, 0 0 16px ${accentColor}80`,
            }}
          />
        </motion.div>
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
  isFront,
}: {
  product: Product;
  index: number;
  totalCards: number;
  rotation: ReturnType<typeof useSpring>;
  radius: number;
  cardWidth: number;
  cardHeight: number;
  isFront: boolean;
}) {
  const gameTheme = getGameTheme(product.sku, product.genre);
  const cardGlow = gameTheme ? gameTheme.glow : '16,185,129';
  const cardAccent = gameTheme ? gameTheme.bg[0] : '#10b981';
  const cardAccentAlt = gameTheme ? gameTheme.bg[1] : '#0d9488';

  const slotAngle = (2 * Math.PI / totalCards) * index;
  const angle = useTransform(rotation, (r: number) => slotAngle + r);

  const rotateYDeg = useTransform(angle, (a: number) => `${(a * 180) / Math.PI}deg`);

  const cosVal = useTransform(angle, (a: number) => Math.cos(a));

  // Meer dramatische opacity curve — achterste kaarten veel meer vervaagd
  const cardOpacity = useTransform(cosVal, (c: number) => {
    if (c < -0.2) return 0;
    if (c < 0.2) return 0.15;
    if (c < 0.5) return 0.35;
    if (c < 0.8) return 0.7;
    return 1;
  });

  // Meer dramatische scale — voorste kaart is veel groter
  const cardScale = useTransform(cosVal, (c: number) => {
    if (c > 0.9) return 1.08;
    if (c > 0.7) return 0.85;
    if (c > 0.4) return 0.65;
    return 0.45;
  });

  const zIndex = useTransform(cosVal, (c: number) => Math.round(c * 100));

  // Veel agressievere blur
  const cardFilter = useTransform(cosVal, (c: number) => {
    if (c > 0.85) return 'blur(0px) brightness(1.2) saturate(1.2)';
    if (c > 0.6) return 'blur(1px) brightness(1.0)';
    if (c > 0.3) return 'blur(3px) brightness(0.7) saturate(0.7)';
    if (c > 0) return 'blur(5px) brightness(0.5) saturate(0.5)';
    return 'blur(8px) brightness(0.3) saturate(0.4)';
  });

  // Glow intensiteit — per-game kleur, nog dramatischer op front
  const glowShadow = useTransform(cosVal, (c: number) => {
    if (c > 0.9)
      return `0 0 80px rgba(${cardGlow},0.5), 0 0 160px rgba(${cardGlow},0.2), 0 25px 70px rgba(0,0,0,0.8), inset 0 0 30px rgba(${cardGlow},0.05)`;
    if (c > 0.7)
      return `0 0 40px rgba(${cardGlow},0.25), 0 0 80px rgba(${cardGlow},0.1), 0 15px 45px rgba(0,0,0,0.6)`;
    if (c > 0.4)
      return `0 0 20px rgba(${cardGlow},0.1), 0 8px 30px rgba(0,0,0,0.5)`;
    return '0 2px 12px rgba(0,0,0,0.3)';
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
        borderRadius: 20,
      }}
    >
      <div
        className="w-full h-full rounded-[20px] overflow-hidden border group/ccard transition-all duration-300 relative"
        style={{
          background: isFront
            ? `linear-gradient(160deg, rgba(${cardGlow},0.08) 0%, rgba(13,26,48,0.95) 30%, rgba(7,14,26,0.98) 100%)`
            : `linear-gradient(to bottom, rgba(13,26,48,0.95), rgba(7,14,26,0.98))`,
          borderColor: isFront ? `rgba(${cardGlow}, 0.4)` : `rgba(${cardGlow}, 0.1)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `rgba(${cardGlow}, 0.6)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isFront ? `rgba(${cardGlow}, 0.4)` : `rgba(${cardGlow}, 0.1)`;
        }}
      >
        {/* Holographic shimmer sweep op voorgrond kaarten */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `linear-gradient(105deg, transparent 35%, rgba(${cardGlow}, 0.12) 43%, rgba(255,255,255,0.1) 50%, rgba(${cardGlow}, 0.12) 57%, transparent 65%)`,
            backgroundSize: '200% 100%',
            animation: 'holo-sweep 3s ease-in-out infinite',
            animationDelay: `${index * 0.2}s`,
          }}
        />

        {/* Top-accent gradient lijn — dikker voor front card */}
        <div
          className="absolute top-0 left-0 right-0 z-10"
          style={{
            height: isFront ? 3 : 2,
            background: `linear-gradient(to right, transparent, ${cardAccent}, ${cardAccentAlt}, transparent)`,
            opacity: isFront ? 0.9 : 0.4,
          }}
        />

        {/* Bottom accent glow voor front card */}
        {isFront && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to top, rgba(${cardGlow},0.1), transparent)`,
            }}
          />
        )}

        <Link href={`/shop/${product.sku}`} className="flex flex-col w-full h-full">
          {/* Afbeelding */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {/* Achtergrond glow — sterker voor front card */}
            <div
              className="absolute inset-0"
              style={{
                opacity: isFront ? 0.12 : 0.05,
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
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
          </div>

          {/* Separator met game-kleur — glow effect */}
          <div className="relative">
            <div
              className="h-px mx-3"
              style={{ background: `linear-gradient(to right, transparent, ${cardAccent}88, transparent)` }}
            />
            {isFront && (
              <div
                className="absolute inset-0 h-px mx-3 blur-sm"
                style={{ background: `linear-gradient(to right, transparent, ${cardAccent}, transparent)` }}
              />
            )}
          </div>

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
              style={{
                color: cardAccent,
                textShadow: isFront ? `0 0 12px ${cardAccent}60` : 'none',
              }}
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
  const accentAlt = theme ? theme.bg[1] : '#0d9488';
  const glow = theme ? theme.glow : '16,185,129';
  const label = theme ? theme.label : '';

  return (
    <AnimatePresence mode="wait">
      {visible && product && (
        <motion.div
          key={product.sku}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -15, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative flex items-center gap-4 px-6 py-3.5 rounded-2xl backdrop-blur-xl border overflow-hidden"
            style={{
              background: 'rgba(5,8,16,0.9)',
              borderColor: `rgba(${glow}, 0.2)`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(${glow},0.1)`,
            }}
          >
            {/* Gradient accent boven */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(to right, transparent, ${accent}, ${accentAlt}, transparent)` }}
            />

            {/* Animated shimmer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 30%, rgba(${glow},0.05) 50%, transparent 70%)`,
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />

            {/* Pulserende kleur dot */}
            <div className="relative flex-shrink-0">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: accent, boxShadow: `0 0 12px ${accent}80` }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: accent }}
                animate={{ scale: [1, 2, 2], opacity: [0.4, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="flex flex-col">
              <div className="text-white text-sm font-bold truncate max-w-[200px]">
                {product.name}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400">{PLATFORM_LABELS[product.platform] || product.platform}</span>
                {label && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${accent}20`, color: accent }}
                  >
                    {label}
                  </span>
                )}
              </div>
            </div>

            <div
              className="text-base font-extrabold ml-2"
              style={{ color: accent, textShadow: `0 0 10px ${accent}60` }}
            >
              {formatPrice(product.price)}
            </div>

            {/* CTA hint */}
            <motion.div
              className="flex items-center gap-1 text-[10px] font-semibold ml-2 px-2.5 py-1 rounded-lg"
              style={{ background: `${accent}15`, color: accent }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              Bekijk
            </motion.div>
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
  accentGlow,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  accentColor: string;
  accentGlow: string;
}) {
  return (
    <motion.button
      className="absolute top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-14 md:h-14 rounded-full backdrop-blur-xl border flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 overflow-hidden"
      style={{
        [direction === 'left' ? 'left' : 'right']: '3%',
        background: 'rgba(5,8,16,0.7)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
      onClick={onClick}
      whileHover={{
        scale: 1.2,
        borderColor: `rgba(${accentGlow},0.5)`,
        boxShadow: `0 0 30px rgba(${accentGlow},0.3), inset 0 0 20px rgba(${accentGlow},0.05)`,
      }}
      whileTap={{ scale: 0.85 }}
    >
      {/* Hover glow achtergrond */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, rgba(${accentGlow},0.15), transparent 70%)` }}
      />
      <svg className="h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
      className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
    >
      <svg width="70" height="70" viewBox="0 0 100 100" className="opacity-50">
        {/* Track */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
        {/* Glow track */}
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeDasharray="283"
          style={{ strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 6px ${accentColor})` }}
          strokeLinecap="round"
          transform="rotate(-90, 50, 50)"
        />
        {/* Dot op de voortgang */}
        <motion.circle
          cx="50" cy="5" r="4"
          fill={accentColor}
          style={{
            filter: `drop-shadow(0 0 4px ${accentColor})`,
            transformOrigin: '50px 50px',
          }}
        />
      </svg>
    </motion.div>
  );
}

function SpotlightBeam({ accentColor, accentGlow }: { accentColor: string; accentGlow: string }) {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-full pointer-events-none z-5">
      {/* Hoofdbeam */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[70%]"
        style={{
          background: `linear-gradient(180deg, rgba(${accentGlow},0.08) 0%, rgba(${accentGlow},0.03) 40%, transparent 100%)`,
          clipPath: 'polygon(35% 0%, 65% 0%, 90% 100%, 10% 100%)',
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Rand glans */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[70%]"
        style={{
          background: `linear-gradient(180deg, rgba(${accentGlow},0.04) 0%, transparent 60%)`,
          clipPath: 'polygon(30% 0%, 70% 0%, 95% 100%, 5% 100%)',
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </div>
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
  const [frontIndex, setFrontIndex] = useState(0);
  const [frontAccent, setFrontAccent] = useState('#10b981');
  const [frontGlow, setFrontGlow] = useState('16,185,129');

  // Scroll-based parallax voor achtergrond
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.75, 1.1, 0.85]);
  const headerY = useTransform(scrollYProgress, [0, 0.3], ['0px', '-20px']);

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
  const containerHeight = isMobile ? 380 : 560;

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
        setFrontIndex(bestIdx);
        const theme = getGameTheme(prod.sku, prod.genre);
        setFrontAccent(theme ? theme.bg[0] : '#10b981');
        setFrontGlow(theme ? theme.glow : '16,185,129');
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
    resumeTimer.current = setTimeout(() => { autoRotateEnabled.current = true; }, 5000);
  }, [rotation, cardCount]);

  // Keyboard navigatie
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateCard('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateCard('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateCard]);

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
    }, 4000);
  }, []);

  // Scroll wheel rotatie
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      rotation.set(rotation.get() - e.deltaX * 0.003);
    }
  }, [rotation]);

  return (
    <section ref={sectionRef} className="relative bg-[#050810] py-24 lg:py-36 overflow-hidden">
      {/* Dynamische achtergrond — reageert op scroll */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY, scale: bgScale }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,rgba(16,185,129,0.12),transparent_40%)]" />
      </motion.div>

      {/* Dynamische accent glow — VEEL sterker, verandert kleur op basis van voorste kaart */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at 50% 45%, rgba(${frontGlow},0.12) 0%, rgba(${frontGlow},0.04) 30%, transparent 60%)`,
        }}
        transition={{ duration: 1 }}
      />

      {/* Morphing background blob */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] opacity-[0.04] animate-morph-blob pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${frontAccent}, transparent)` }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />

      {/* Grid pattern met diepte */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          perspective: '500px',
          transform: 'rotateX(60deg) translateY(-50%)',
          transformOrigin: 'center top',
        }}
      />

      {/* Ambient particles — nu met accent kleur */}
      <AmbientParticles accentColor={frontGlow} />

      {/* Vloer highlight — versterkt */}
      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-emerald-900/[0.08] via-emerald-900/[0.03] to-transparent" />

      {/* Header */}
      <motion.div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center z-10"
        style={{ y: headerY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="inline-block px-5 py-2 rounded-full border text-xs font-semibold uppercase tracking-[0.2em] mb-6"
            style={{
              background: `rgba(${frontGlow},0.08)`,
              borderColor: `rgba(${frontGlow},0.2)`,
              color: frontAccent,
            }}
            initial={{ scale: 0, rotate: -10 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            Collectie
          </motion.span>
          <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">
            Ontdek onze{' '}
            <span className="relative inline-block">
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                style={{ backgroundSize: '200% 100%', animation: 'text-shimmer 3s linear infinite' }}
              >
                games
              </span>
              {/* Glanzende underline */}
              <motion.div
                className="absolute -bottom-3 left-0 right-0 h-[3px] rounded-full overflow-hidden"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </motion.div>
            </span>
          </h2>
          <motion.p
            className="text-slate-400 mt-5 max-w-lg mx-auto text-sm lg:text-base"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Draai, sleep of gebruik de pijltjes om door onze collectie te browsen
          </motion.p>
        </motion.div>
      </motion.div>

      {/* 3D Carousel */}
      {mounted && (
        <motion.div
          className="relative mx-auto select-none touch-none"
          style={{ height: containerHeight }}
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Spotlight beam van boven */}
          <SpotlightBeam accentColor={frontAccent} accentGlow={frontGlow} />

          {/* Sparkles rond de voorste kaart */}
          <SpotlightSparkles accentColor={frontAccent} visible={!isDragging.current} />

          {/* Navigatie pijlen */}
          <NavArrow direction="left" onClick={() => navigateCard('left')} accentColor={frontAccent} accentGlow={frontGlow} />
          <NavArrow direction="right" onClick={() => navigateCard('right')} accentColor={frontAccent} accentGlow={frontGlow} />

          {/* Carousel container */}
          <div
            className="relative w-full h-full cursor-grab active:cursor-grabbing"
            style={{
              perspective: isMobile ? '900px' : '1400px',
              perspectiveOrigin: '50% 35%',
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
                  isFront={i === frontIndex}
                />
              ))}
            </div>
          </div>

          {/* Reflectie op de "vloer" — veel dramatischer */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-48 pointer-events-none">
            {/* Primaire glow — dynamische kleur */}
            <motion.div
              className="absolute inset-0 blur-3xl"
              animate={{
                background: `radial-gradient(ellipse at 50% 0%, rgba(${frontGlow},0.2) 0%, rgba(${frontGlow},0.05) 40%, transparent 70%)`,
              }}
              transition={{ duration: 1 }}
            />
            {/* Secundaire vaste glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent blur-2xl" />
            {/* Vloer lijn met glow */}
            <div className="relative">
              <motion.div
                className="absolute top-0 left-[5%] right-[5%] h-px"
                animate={{
                  background: `linear-gradient(to right, transparent, rgba(${frontGlow},0.4), rgba(${frontGlow},0.6), rgba(${frontGlow},0.4), transparent)`,
                }}
                transition={{ duration: 1 }}
              />
              <motion.div
                className="absolute top-0 left-[5%] right-[5%] h-[3px] blur-sm"
                animate={{
                  background: `linear-gradient(to right, transparent, rgba(${frontGlow},0.3), transparent)`,
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Info panel van voorste kaart */}
          <CenterCardInfo product={frontProduct} visible={!isDragging.current} />

          {/* Progress ring */}
          <ProgressRing rotation={springRotation} totalCards={cardCount} accentColor={frontAccent} />
        </motion.div>
      )}

      {/* Instructie hint met keyboard */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="text-center mt-10"
      >
        <span className="inline-flex items-center gap-4 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <motion.svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              animate={{ x: [-4, 4, -4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </motion.svg>
            Sleep om te draaien
          </span>
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-400">&larr;</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-400">&rarr;</kbd>
            </span>
            Pijltjestoetsen
          </span>
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
            </svg>
            Klik om te bekijken
          </span>
        </span>
      </motion.div>
    </section>
  );
}
