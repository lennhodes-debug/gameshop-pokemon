'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, Product, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import NostalgiaFilm from '@/components/game-finder/NostalgiaFilm';

// ─── TYPES ──────────────────────────────────────────────────

type Phase = 'intro' | 'battle' | 'transition' | 'result';

interface UserPrefs {
  genres: Record<string, number>;
  platforms: Record<string, number>;
  priceSum: number;
  priceCount: number;
  completeness: Record<string, number>;
}

// ─── CRT SCANLINES OVERLAY ─────────────────────────────────

function CRTOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.3),
            rgba(0, 0, 0, 0.3) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />
      {/* RGB sub-pixel columns */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            rgba(255, 0, 0, 0.03),
            rgba(0, 255, 0, 0.03) 1px,
            rgba(0, 0, 255, 0.03) 2px,
            transparent 3px
          )`,
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}

// ─── VHS STATIC TRANSITION ─────────────────────────────────

function VHSTransition({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 800);
    return () => clearTimeout(t);
  }, [onComplete]);

  const bars = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        y: Math.random() * 100,
        h: Math.random() * 8 + 2,
        delay: Math.random() * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
      })),
    [],
  );

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.8, times: [0, 0.1, 0.7, 1] }}
    >
      {/* Static noise */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      {/* Horizontal distortion bars */}
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className="absolute left-0 right-0 bg-white"
          style={{ top: `${bar.y}%`, height: `${bar.h}px`, opacity: bar.opacity }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1.5, 0], x: ['-20%', '10%', '30%'] }}
          transition={{ duration: 0.5, delay: bar.delay }}
        />
      ))}
      {/* Chromatic aberration text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <span className="absolute text-4xl font-bold text-red-500/30 blur-[1px]" style={{ transform: 'translate(-3px, 1px)' }}>
            TRACKING...
          </span>
          <span className="absolute text-4xl font-bold text-cyan-500/30 blur-[1px]" style={{ transform: 'translate(3px, -1px)' }}>
            TRACKING...
          </span>
          <span className="text-4xl font-bold text-white/60">TRACKING...</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── HOLOGRAPHIC GAME CARD ─────────────────────────────────

function HoloCard({
  product,
  side,
  onPick,
  isExiting,
  isChosen,
}: {
  product: Product;
  side: 'left' | 'right';
  onPick: () => void;
  isExiting: boolean;
  isChosen: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springCfg = { stiffness: 150, damping: 20 };
  const x = useSpring(mouseX, springCfg);
  const y = useSpring(mouseY, springCfg);

  // 3D rotation from mouse
  const rotateX = useTransform(y, [0, 1], [12, -12]);
  const rotateY = useTransform(x, [0, 1], [-12, 12]);

  // Holographic shine position
  const shineX = useTransform(x, [0, 1], [0, 100]);
  const shineY = useTransform(y, [0, 1], [0, 100]);

  // Rainbow hue rotation
  const hueRotate = useTransform(x, [0, 1], [0, 360]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  const price = getEffectivePrice(product);
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{ perspective: 800 }}
      initial={{ opacity: 0, x: side === 'left' ? -60 : 60, scale: 0.85 }}
      animate={
        isExiting
          ? isChosen
            ? { opacity: 0, scale: 1.15, y: -40, transition: { duration: 0.5 } }
            : { opacity: 0, scale: 0.7, filter: 'grayscale(100%) blur(4px)', transition: { duration: 0.5 } }
          : { opacity: 1, x: 0, scale: 1 }
      }
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={onPick}
    >
      <motion.div
        ref={cardRef}
        className="relative group"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Card body */}
        <div className="relative w-56 sm:w-64 lg:w-72 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl shadow-black/50">
          {/* Holographic shine overlay */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: useTransform(
                [shineX, shineY, hueRotate] as never,
                ([sx, sy, hue]: [number, number, number]) =>
                  `radial-gradient(circle at ${sx}% ${sy}%, hsla(${hue}, 80%, 70%, 0.25) 0%, hsla(${hue + 60}, 80%, 60%, 0.15) 30%, hsla(${hue + 120}, 80%, 50%, 0.08) 60%, transparent 80%)`,
              ),
            }}
          />

          {/* Glare highlight */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: useTransform(
                [shineX, shineY] as never,
                ([sx, sy]: [number, number]) =>
                  `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
              ),
            }}
          />

          {/* Game cover image */}
          <div className="relative aspect-square bg-gradient-to-b from-slate-700/30 to-transparent p-3">
            <div className="relative w-full h-full">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 288px"
                  className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.05]"
                  priority
                />
              )}
            </div>

            {/* Rainbow border shimmer */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: useTransform(
                  hueRotate,
                  (hue: number) =>
                    `conic-gradient(from ${hue}deg, rgba(255,0,0,0.15), rgba(255,165,0,0.15), rgba(255,255,0,0.15), rgba(0,128,0,0.15), rgba(0,0,255,0.15), rgba(75,0,130,0.15), rgba(238,130,238,0.15), rgba(255,0,0,0.15))`,
                ),
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                padding: '2px',
              }}
            />
          </div>

          {/* Info section */}
          <div className="p-4 lg:p-5 relative z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-medium text-white/40">
                {platformLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-medium text-white/40">
                {product.genre}
              </span>
            </div>
            <h3 className="text-sm lg:text-base font-semibold text-white leading-tight mb-2 line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-base lg:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 tabular-nums">
                {formatPrice(price)}
              </span>
              <span className="text-[10px] text-white/25">{product.condition}</span>
            </div>
          </div>

          {/* CRT scanline on card */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.03] z-20"
            style={{
              background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)`,
            }}
          />
        </div>

        {/* Card glow */}
        <div className="absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 blur-xl bg-gradient-to-b from-emerald-500/10 to-cyan-500/10" />
      </motion.div>
    </motion.div>
  );
}

// ─── CONFETTI ───────────────────────────────────────────────

function ConfettiExplosion() {
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 600,
        y: -(Math.random() * 400 + 100),
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 0.6 + 0.4,
        color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444'][
          Math.floor(Math.random() * 6)
        ],
        delay: Math.random() * 0.4,
        w: Math.random() > 0.5 ? 8 : 5,
        h: Math.random() > 0.5 ? 5 : 10,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/3 rounded-sm"
          style={{ width: p.w, height: p.h, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotation, scale: p.scale, opacity: [1, 1, 0] }}
          transition={{ duration: 2, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

// ─── SMART PAIRING ──────────────────────────────────────────

function createSmartPairs(
  products: Product[],
  prefs: UserPrefs,
  round: number,
  usedSkus: Set<string>,
): [Product, Product] | null {
  const pool = products.filter((p) => !!p.image && !p.isConsole && !usedSkus.has(p.sku));
  if (pool.length < 2) return null;

  // Shuffle helper
  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  if (round === 0) {
    // Round 1: RPG vs Platformer/Actie — discover genre preference
    const rpg = shuffle(pool.filter((p) => p.genre === 'RPG'));
    const action = shuffle(pool.filter((p) => ['Platformer', 'Actie', 'Avontuur'].includes(p.genre)));
    if (rpg.length > 0 && action.length > 0) return [rpg[0], action[0]];
  }

  if (round === 1) {
    // Round 2: Different platforms within preferred genre area
    const topGenres = Object.entries(prefs.genres)
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g);
    const candidates = shuffle(
      pool.filter((p) => topGenres.includes(p.genre) || topGenres.length === 0),
    );
    // Find two from different platforms
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        if (candidates[i].platform !== candidates[j].platform) {
          return [candidates[i], candidates[j]];
        }
      }
    }
  }

  if (round === 2) {
    // Round 3: Budget vs Premium — discover price preference
    const budget = shuffle(pool.filter((p) => getEffectivePrice(p) < 20));
    const premium = shuffle(pool.filter((p) => getEffectivePrice(p) >= 35));
    if (budget.length > 0 && premium.length > 0) return [budget[0], premium[0]];
  }

  if (round === 3) {
    // Round 4: CIB vs Los — discover completeness preference
    const cib = shuffle(pool.filter((p) => p.completeness.toLowerCase().includes('compleet')));
    const los = shuffle(pool.filter((p) => !p.completeness.toLowerCase().includes('compleet')));
    if (cib.length > 0 && los.length > 0) return [cib[0], los[0]];
  }

  if (round === 4) {
    // Round 5: Two games matching top preferences — the final refinement
    const topGenres = Object.entries(prefs.genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);
    const topPlatforms = Object.entries(prefs.platforms)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([p]) => p);

    const scored = shuffle(pool)
      .map((p) => {
        let s = 0;
        if (topGenres.includes(p.genre)) s += 5;
        if (topPlatforms.includes(p.platform)) s += 3;
        return { p, s };
      })
      .sort((a, b) => b.s - a.s);

    if (scored.length >= 2) return [scored[0].p, scored[1].p];
  }

  // Fallback: random pair
  const shuffled = shuffle(pool);
  return shuffled.length >= 2 ? [shuffled[0], shuffled[1]] : null;
}

// ─── MATCH CALCULATOR ───────────────────────────────────────

function calculateMatches(prefs: UserPrefs, products: Product[]): Product[] {
  const topGenres = Object.entries(prefs.genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([g]) => g);
  const topPlatforms = Object.entries(prefs.platforms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([p]) => p);
  const avgPrice = prefs.priceCount > 0 ? prefs.priceSum / prefs.priceCount : 25;
  const prefersCIB =
    (prefs.completeness['cib'] || 0) > (prefs.completeness['los'] || 0);

  return products
    .filter((p) => !!p.image && !p.isConsole)
    .map((p) => {
      let score = 0;
      if (topGenres.includes(p.genre)) score += 12;
      if (topPlatforms.includes(p.platform)) score += 8;
      // Price proximity (closer = better)
      const price = getEffectivePrice(p);
      const priceDiff = Math.abs(price - avgPrice);
      score += Math.max(0, 6 - priceDiff / 10);
      // Completeness preference
      const isCIB = p.completeness.toLowerCase().includes('compleet');
      if (prefersCIB && isCIB) score += 4;
      if (!prefersCIB && !isCIB) score += 4;
      // Bonus for premium
      if (p.isPremium) score += 1;
      // Small random factor to vary results
      score += Math.random() * 2;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.product);
}

// ─── RESULT SCREEN ──────────────────────────────────────────

function ResultScreen({
  results,
  onRestart,
}: {
  results: Product[];
  onRestart: () => void;
}) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const topPick = results[0];
  const others = results.slice(1, 7);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!topPick) return null;
  const price = getEffectivePrice(topPick);
  const platformLabel = PLATFORM_LABELS[topPick.platform] || topPick.platform;

  const handleAdd = (product: Product) => {
    addItem(product);
    addToast(
      `${product.name} toegevoegd aan winkelwagen`,
      'success',
      undefined,
      product.image || undefined,
    );
  };

  return (
    <div className="relative min-h-screen bg-[#050810] overflow-hidden">
      <CRTOverlay />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_50%)]" />

      {showConfetti && <ConfettiExplosion />}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-20">
        {/* VHS style header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-medium text-white/40 uppercase tracking-[0.2em] font-mono">
              REC &bull; Jouw perfecte match
            </span>
          </motion.div>
        </motion.div>

        {/* Top pick */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-16"
        >
          <div className="relative mb-8">
            {/* Glow behind image */}
            <div className="absolute inset-0 blur-3xl opacity-20 scale-150">
              <div className="w-full h-full bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
            </div>
            <motion.div
              className="relative w-52 h-52 lg:w-72 lg:h-72"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {topPick.image && (
                <Image
                  src={topPick.image}
                  alt={topPick.name}
                  fill
                  sizes="288px"
                  className="object-contain drop-shadow-[0_20px_60px_rgba(16,185,129,0.3)]"
                  priority
                />
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-white/50 mb-4">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              {platformLabel} &middot; {topPick.genre}
            </div>
            <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-3">
              {topPick.name}
            </h2>
            <p className="text-xl lg:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 tabular-nums mb-6">
              {formatPrice(price)}
            </p>
            {topPick.description && (
              <p className="text-sm text-white/35 max-w-md mx-auto leading-relaxed mb-8 line-clamp-3">
                {topPick.description}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => handleAdd(topPick)}
              className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-2xl bg-white text-slate-900 text-sm font-medium shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-[0.97] transition-all duration-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              In winkelwagen
            </button>
            <Link
              href={`/shop/${topPick.sku}`}
              className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-2xl bg-white/[0.06] text-white/80 text-sm font-medium hover:bg-white/[0.1] hover:text-white active:scale-[0.97] transition-all duration-300"
            >
              Bekijk product
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        {/* More recommendations */}
        {others.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />
            <p className="text-xs font-medium text-white/30 uppercase tracking-[0.2em] text-center mb-8 font-mono">
              // Meer op basis van jouw smaak
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((p, i) => (
                <motion.div
                  key={p.sku}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + i * 0.08 }}
                >
                  <Link
                    href={`/shop/${p.sku}`}
                    className="group flex flex-col items-center p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <div className="relative h-28 w-28 mb-3 group-hover:scale-105 transition-transform duration-300">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="112px"
                          className="object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/25 mb-1 font-mono">
                        {PLATFORM_LABELS[p.platform] || p.platform}
                      </p>
                      <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors mb-1 line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-xs font-medium text-emerald-400 tabular-nums">
                        {formatPrice(getEffectivePrice(p))}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Restart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-16 text-center"
        >
          <button
            onClick={onRestart}
            className="text-sm text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-2 font-mono"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Opnieuw spelen
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────

const TOTAL_ROUNDS = 5;

export default function GameFinderPage() {
  const allProducts = useMemo(() => getAllProducts(), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [prefs, setPrefs] = useState<UserPrefs>({
    genres: {},
    platforms: {},
    priceSum: 0,
    priceCount: 0,
    completeness: {},
  });
  const [usedSkus, setUsedSkus] = useState<Set<string>>(new Set());
  const [currentPair, setCurrentPair] = useState<[Product, Product] | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [exitingSide, setExitingSide] = useState<'left' | 'right' | null>(null);
  // No more introStep — NostalgiaFilm handles the intro cinematic

  // Generate first pair when entering battle phase
  useEffect(() => {
    if (phase === 'battle' && !currentPair) {
      const pair = createSmartPairs(allProducts, prefs, round, usedSkus);
      setCurrentPair(pair);
    }
  }, [phase, currentPair, allProducts, prefs, round, usedSkus]);

  const handlePick = useCallback(
    (chosen: Product, rejected: Product, side: 'left' | 'right') => {
      setExitingSide(side);

      // Update preferences
      setPrefs((prev) => {
        const updated = { ...prev };
        updated.genres = { ...prev.genres };
        updated.genres[chosen.genre] = (updated.genres[chosen.genre] || 0) + 2;
        updated.genres[rejected.genre] = (updated.genres[rejected.genre] || 0) - 1;

        updated.platforms = { ...prev.platforms };
        updated.platforms[chosen.platform] = (updated.platforms[chosen.platform] || 0) + 2;

        updated.priceSum = prev.priceSum + getEffectivePrice(chosen);
        updated.priceCount = prev.priceCount + 1;

        updated.completeness = { ...prev.completeness };
        const isCIB = chosen.completeness.toLowerCase().includes('compleet');
        updated.completeness[isCIB ? 'cib' : 'los'] =
          (updated.completeness[isCIB ? 'cib' : 'los'] || 0) + 1;

        return updated;
      });

      // Track used SKUs
      setUsedSkus((prev) => {
        const next = new Set(prev);
        next.add(chosen.sku);
        next.add(rejected.sku);
        return next;
      });

      // Next round or result
      setTimeout(() => {
        setExitingSide(null);
        if (round + 1 >= TOTAL_ROUNDS) {
          // Show VHS transition then results
          setPhase('transition');
        } else {
          setRound((r) => r + 1);
          setCurrentPair(null); // trigger new pair generation
        }
      }, 600);
    },
    [round],
  );

  const handleTransitionComplete = useCallback(() => {
    const matched = calculateMatches(prefs, allProducts);
    setResults(matched);
    setPhase('result');
  }, [prefs, allProducts]);

  const restart = useCallback(() => {
    setPhase('intro');
    setRound(0);
    setPrefs({ genres: {}, platforms: {}, priceSum: 0, priceCount: 0, completeness: {} });
    setUsedSkus(new Set());
    setCurrentPair(null);
    setResults([]);
    setExitingSide(null);
  }, []);

  const progress = ((round + (exitingSide ? 1 : 0)) / TOTAL_ROUNDS) * 100;

  const handleFilmStart = useCallback(() => {
    setPhase('battle');
  }, []);

  return (
    <div className="min-h-screen">
      {/* VHS Transition overlay */}
      <AnimatePresence>
        {phase === 'transition' && (
          <VHSTransition onComplete={handleTransitionComplete} />
        )}
      </AnimatePresence>

      {/* ── NOSTALGIA FILM INTRO ──────────────────── */}
      {phase === 'intro' && (
        <NostalgiaFilm onStart={handleFilmStart} />
      )}

      <AnimatePresence mode="wait">

        {/* ── BATTLE PHASE ──────────────────────── */}
        {phase === 'battle' && currentPair && (
          <motion.div
            key={`battle-${round}`}
            className="relative min-h-screen bg-[#050810] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CRTOverlay />

            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-16">
              {/* Header */}
              <div className="mb-8 lg:mb-10">
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-white/30 uppercase tracking-[0.15em]">
                      Ronde {round + 1} / {TOTAL_ROUNDS}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-white/20 tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    initial={{ width: `${((round) / TOTAL_ROUNDS) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center mb-8 lg:mb-12"
              >
                <h2 className="text-2xl lg:text-4xl font-semibold text-white tracking-tight">
                  Welke spreekt je meer aan?
                </h2>
                <p className="text-sm text-white/25 mt-2 font-mono">
                  Klik op de game die je het liefst zou spelen
                </p>
              </motion.div>

              {/* Card battle area */}
              <div className="flex items-center justify-center gap-6 lg:gap-12">
                {/* Left card */}
                <HoloCard
                  product={currentPair[0]}
                  side="left"
                  onPick={() => handlePick(currentPair[0], currentPair[1], 'left')}
                  isExiting={exitingSide !== null}
                  isChosen={exitingSide === 'left'}
                />

                {/* VS badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center shadow-xl shadow-black/30">
                    <span className="text-xs lg:text-sm font-bold text-white/60 font-mono tracking-wider">
                      VS
                    </span>
                    {/* Pulsating ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                {/* Right card */}
                <HoloCard
                  product={currentPair[1]}
                  side="right"
                  onPick={() => handlePick(currentPair[1], currentPair[0], 'right')}
                  isExiting={exitingSide !== null}
                  isChosen={exitingSide === 'right'}
                />
              </div>

              {/* Round dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i < round
                        ? 'w-6 bg-emerald-500/60'
                        : i === round
                          ? 'w-4 bg-white/30'
                          : 'w-1.5 bg-white/10'
                    }`}
                    layout
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ──────────────────────────────── */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ResultScreen results={results} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
