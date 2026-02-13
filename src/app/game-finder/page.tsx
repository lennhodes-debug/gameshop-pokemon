'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, Product, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';

// ─── TYPES ──────────────────────────────────────────────────

type Phase = 'intro' | 'battle' | 'result';

// ─── UTILS ──────────────────────────────────────────────────

function pickCandidates(products: Product[], count: number): Product[] {
  const withImage = products.filter(p => !!p.image && !p.isConsole);
  const shuffled = [...withImage].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const BRACKET_SIZE = 8;

// ─── CONFETTI PARTICLES ─────────────────────────────────────

function ConfettiExplosion() {
  const particles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: -(Math.random() * 400 + 100),
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.4,
      color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 0.3,
      width: Math.random() > 0.5 ? 8 : 4,
      height: Math.random() > 0.5 ? 4 : 8,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{ width: p.width, height: p.height, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotation,
            scale: p.scale,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.8,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}

// ─── FLOATING GAME COVERS (INTRO) ──────────────────────────

function FloatingCovers({ products }: { products: Product[] }) {
  const covers = useMemo(() => {
    const withImage = products.filter(p => !!p.image && !p.isConsole);
    const shuffled = [...withImage].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 12);
  }, [products]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {covers.map((p, i) => {
        const angle = (i / covers.length) * Math.PI * 2;
        const radius = 280 + Math.random() * 120;
        const x = 50 + Math.cos(angle) * (radius / 8);
        const y = 50 + Math.sin(angle) * (radius / 6);
        const size = 60 + Math.random() * 40;
        const duration = 18 + Math.random() * 12;

        return (
          <motion.div
            key={p.sku}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.15, 0.15, 0],
              scale: [0.5, 1, 1, 0.5],
              y: [0, -30, 30, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {p.image && (
              <Image
                src={p.image}
                alt=""
                fill
                sizes={`${size}px`}
                className="object-contain rounded-lg blur-[0.5px]"
                aria-hidden
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── ENERGY RING (INTRO) ───────────────────────────────────

function EnergyRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 200 + i * 120,
            height: 200 + i * 120,
            border: `1px solid rgba(16, 185, 129, ${0.08 - i * 0.02})`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, 360] }}
          transition={{ duration: 12 + i * 4, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

// ─── 3D TILT BATTLE CARD ───────────────────────────────────

function BattleCard({ product, side, onPick, isAnimating }: {
  product: Product;
  side: 'left' | 'right';
  onPick: () => void;
  isAnimating: boolean;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 20 });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 20 });
  const glare = useMotionTemplate`radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const price = getEffectivePrice(product);
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const accentColor = side === 'left' ? '16, 185, 129' : '6, 182, 212';

  return (
    <motion.button
      ref={cardRef}
      onClick={() => !isAnimating && onPick()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={isAnimating}
      className="group relative flex-1 flex flex-col items-center justify-center p-8 lg:p-12 cursor-pointer"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, x: side === 'left' ? -80 : 80, rotateY: side === 'left' ? 15 : -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 60, rotateX: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 3D tilting card surface */}
      <motion.div
        className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        {/* Card background */}
        <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 lg:p-10">
          {/* Glare overlay */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none z-10"
            style={{ background: glare }}
          />

          {/* Glow pulse on hover */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ boxShadow: `inset 0 0 60px rgba(${accentColor}, 0.08), 0 0 40px rgba(${accentColor}, 0.1)` }}
          />

          {/* Scan lines */}
          <div className="absolute inset-0 rounded-3xl opacity-[0.02] pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
          }} />

          {/* Game image with float animation */}
          <motion.div
            className="relative w-44 h-44 lg:w-52 lg:h-52 mx-auto mb-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transform: 'translateZ(40px)' }}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="208px"
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                priority
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-white/5 flex items-center justify-center">
                <span className="text-5xl">🎮</span>
              </div>
            )}

            {/* Floating glow under image */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"
              style={{ background: `rgba(${accentColor}, 0.5)` }}
            />
          </motion.div>

          {/* Info */}
          <div className="relative text-center" style={{ transform: 'translateZ(20px)' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[11px] font-medium text-white/50 mb-3">
              <span className="h-1 w-1 rounded-full" style={{ background: `rgba(${accentColor}, 0.8)` }} />
              {platformLabel} &middot; {product.genre}
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-white leading-snug mb-3">
              {product.name}
            </h3>
            <p className="text-lg font-semibold tabular-nums" style={{ color: `rgba(${accentColor}, 0.9)` }}>
              {formatPrice(price)}
            </p>
          </div>

          {/* Pick indicator */}
          <motion.div
            className="mt-8 mx-auto w-fit px-6 py-2.5 rounded-full text-sm font-medium"
            style={{
              background: `rgba(${accentColor}, 0.1)`,
              color: `rgba(${accentColor}, 0.9)`,
            }}
            initial={false}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Kies mij
          </motion.div>
        </div>
      </motion.div>
    </motion.button>
  );
}

// ─── VS BADGE ───────────────────────────────────────────────

function VsBadge({ round }: { round: number }) {
  const labels = ['Kwartfinale', 'Halve finale', 'Finale'];

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2">
      {/* Pulse rings */}
      <div className="relative">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        <motion.div
          className="relative h-20 w-20 lg:h-24 lg:w-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', damping: 12, stiffness: 150 }}
        >
          <span className="text-white font-black text-2xl lg:text-3xl tracking-tighter">VS</span>
        </motion.div>
      </div>

      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em]"
      >
        {labels[round] || `Ronde ${round + 1}`}
      </motion.span>
    </div>
  );
}

// ─── BRACKET VISUALIZATION ──────────────────────────────────

function BracketVisualization({ candidates, eliminated, nextRound, currentRound, matchIndex }: {
  candidates: Product[];
  eliminated: Product[];
  nextRound: Product[];
  currentRound: Product[];
  matchIndex: number;
}) {
  return (
    <div className="flex justify-center gap-1.5 mt-8">
      {candidates.map((p) => {
        const isEliminated = eliminated.some(e => e.sku === p.sku);
        const isInBattle = currentRound[matchIndex * 2]?.sku === p.sku || currentRound[matchIndex * 2 + 1]?.sku === p.sku;
        const isAdvanced = nextRound.some(w => w.sku === p.sku);

        return (
          <motion.div
            key={p.sku}
            className="relative group"
            animate={{
              scale: isInBattle ? 1.3 : isEliminated ? 0.7 : 1,
              opacity: isEliminated ? 0.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className={`h-8 w-8 rounded-lg overflow-hidden relative ${
              isInBattle ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' :
              isAdvanced ? 'ring-1 ring-emerald-400/50' : ''
            }`}>
              {p.image ? (
                <Image src={p.image} alt={p.name} fill sizes="32px" className={`object-contain ${isEliminated ? 'grayscale' : ''}`} />
              ) : (
                <div className={`w-full h-full ${isEliminated ? 'bg-slate-800' : 'bg-slate-700'} flex items-center justify-center text-[10px]`}>🎮</div>
              )}
              {isEliminated && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-white/10 backdrop-blur text-[9px] text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── PROGRESS ───────────────────────────────────────────────

function BattleProgress({ round, totalRounds, matchInRound, matchesInRound }: {
  round: number; totalRounds: number; matchInRound: number; matchesInRound: number;
}) {
  const progress = ((round * matchesInRound + matchInRound) / (totalRounds * matchesInRound)) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ─── WINNER SCREEN ──────────────────────────────────────────

function WinnerScreen({ winner, runners, onRestart }: {
  winner: Product;
  runners: Product[];
  onRestart: () => void;
}) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const price = getEffectivePrice(winner);
  const platformLabel = PLATFORM_LABELS[winner.platform] || winner.platform;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = () => {
    addItem(winner);
    addToast(`${winner.name} toegevoegd aan winkelwagen`, 'success', undefined, winner.image || undefined);
  };

  return (
    <div className="relative min-h-screen bg-[#050810] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_50%)]" />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {showConfetti && <ConfettiExplosion />}

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Crown */}
        <motion.div
          initial={{ y: -100, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', damping: 10, stiffness: 100 }}
          className="text-7xl lg:text-9xl mb-2 select-none"
        >
          👑
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xs font-medium text-emerald-400 uppercase tracking-[0.3em] mb-8"
        >
          Jouw winnaar
        </motion.p>

        {/* Winner card with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-10"
        >
          {/* Glow behind */}
          <div className="absolute inset-0 blur-3xl opacity-20">
            <div className="w-full h-full bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
          </div>

          <motion.div
            className="relative w-56 h-56 lg:w-72 lg:h-72"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {winner.image && (
              <Image
                src={winner.image}
                alt={winner.name}
                fill
                sizes="288px"
                className="object-contain drop-shadow-[0_30px_60px_rgba(16,185,129,0.3)]"
                priority
              />
            )}
          </motion.div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-white/50 mb-4">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            {platformLabel} &middot; {winner.genre}
          </div>
          <h2 className="text-4xl lg:text-6xl font-semibold text-white tracking-tight mb-4">
            {winner.name}
          </h2>
          <p className="text-2xl lg:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 tabular-nums">
            {formatPrice(price)}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 mb-16"
        >
          <button
            onClick={handleAdd}
            className="group inline-flex items-center justify-center gap-2 h-13 px-8 rounded-2xl bg-white text-slate-900 text-sm font-medium shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-[0.97] transition-all duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            In winkelwagen
          </button>
          <Link
            href={`/shop/${winner.sku}`}
            className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-2xl bg-white/[0.06] text-white/80 text-sm font-medium hover:bg-white/[0.1] hover:text-white active:scale-[0.97] transition-all duration-300"
          >
            Bekijk product
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>

        {/* Runners up */}
        {runners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="w-full max-w-2xl"
          >
            <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] text-center mb-4">
              Ook de moeite waard
            </p>
            <div className="grid grid-cols-3 gap-3">
              {runners.slice(0, 3).map((p, i) => (
                <Link
                  key={p.sku}
                  href={`/shop/${p.sku}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-300"
                >
                  <div className="relative h-16 w-16">
                    {p.image && (
                      <Image src={p.image} alt={p.name} fill sizes="64px" className="object-contain" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-white/70 truncate max-w-[120px] group-hover:text-white transition-colors">{p.name}</p>
                    <p className="text-[10px] text-white/30 tabular-nums">{formatPrice(getEffectivePrice(p))}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Restart */}
        <motion.button
          onClick={onRestart}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-14 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Opnieuw spelen
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────

export default function GameFinderPage() {
  const allProducts = useMemo(() => getAllProducts(), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [candidates, setCandidates] = useState<Product[]>([]);
  const [currentRound, setCurrentRound] = useState<Product[]>([]);
  const [nextRound, setNextRound] = useState<Product[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [eliminated, setEliminated] = useState<Product[]>([]);
  const [winner, setWinner] = useState<Product | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pickFlash, setPickFlash] = useState<'left' | 'right' | null>(null);

  const totalRounds = Math.log2(BRACKET_SIZE);
  const matchesInCurrentRound = Math.floor(currentRound.length / 2);

  const currentMatch = useMemo(() => {
    if (phase !== 'battle' || matchIndex * 2 + 1 >= currentRound.length) return null;
    return { left: currentRound[matchIndex * 2], right: currentRound[matchIndex * 2 + 1] };
  }, [phase, currentRound, matchIndex]);

  const startGame = useCallback(() => {
    const picked = pickCandidates(allProducts, BRACKET_SIZE);
    setCandidates(picked);
    setCurrentRound(picked);
    setNextRound([]);
    setMatchIndex(0);
    setRound(0);
    setEliminated([]);
    setWinner(null);
    setPickFlash(null);
    setPhase('battle');
  }, [allProducts]);

  const handlePick = useCallback((pickedWinner: Product, loser: Product, side: 'left' | 'right') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPickFlash(side);

    setTimeout(() => {
      setPickFlash(null);
      const updatedNext = [...nextRound, pickedWinner];
      const updatedEliminated = [...eliminated, loser];
      setNextRound(updatedNext);
      setEliminated(updatedEliminated);

      const nextMatchIdx = matchIndex + 1;

      if (nextMatchIdx >= matchesInCurrentRound) {
        if (updatedNext.length === 1) {
          setWinner(updatedNext[0]);
          setPhase('result');
        } else {
          setCurrentRound(updatedNext);
          setNextRound([]);
          setMatchIndex(0);
          setRound(r => r + 1);
        }
      } else {
        setMatchIndex(nextMatchIdx);
      }

      setIsAnimating(false);
    }, 500);
  }, [isAnimating, nextRound, eliminated, matchIndex, matchesInCurrentRound]);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {/* ── INTRO ──────────────────────────────── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="relative min-h-screen bg-[#050810] flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_50%)]" />

            <FloatingCovers products={allProducts} />
            <EnergyRings />

            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />

            {/* Content */}
            <div className="relative z-10 text-center px-4">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10, stiffness: 120 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <motion.span
                    className="text-8xl lg:text-9xl select-none block"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🎮
                  </motion.span>
                  {/* Glow under controller */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-emerald-500/20 rounded-full blur-xl" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] text-emerald-400 text-[11px] font-medium uppercase tracking-[0.2em] mb-8"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Interactief keuze toernooi
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl lg:text-[80px] font-light text-white tracking-[-0.03em] leading-[0.95] mb-6"
              >
                Game
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Finder
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-base lg:text-lg text-white/40 max-w-md mx-auto mb-4"
              >
                Geen idee welke game je wilt? Wij helpen je kiezen.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-white/25 max-w-sm mx-auto mb-12"
              >
                8 willekeurige games strijden in een toernooi. Kies steeds je favoriet &mdash; tot er eentje overblijft.
              </motion.p>

              <motion.button
                onClick={startGame}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-300"
              >
                Start het toernooi
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-16 flex items-center justify-center gap-10 text-xs text-white/30"
              >
                {[
                  { num: '8', label: 'Kandidaten' },
                  { num: '3', label: 'Rondes' },
                  { num: '1', label: 'Winnaar' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    <span className="text-lg font-semibold text-white/50 tabular-nums">{item.num}</span>
                    <span className="uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Scroll fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050810] to-transparent" />
          </motion.div>
        )}

        {/* ── BATTLE ──────────────────────────────── */}
        {phase === 'battle' && currentMatch && (
          <motion.div
            key={`battle-${round}-${matchIndex}`}
            className="relative min-h-screen bg-[#050810] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />

            {/* Flash effect on pick */}
            <AnimatePresence>
              {pickFlash && (
                <motion.div
                  className={`absolute inset-0 z-40 pointer-events-none ${
                    pickFlash === 'left'
                      ? 'bg-gradient-to-r from-emerald-500/20 to-transparent'
                      : 'bg-gradient-to-l from-cyan-500/20 to-transparent'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-col min-h-screen pt-20 lg:pt-24 pb-8">
              {/* Header */}
              <div className="text-center px-4 mb-4">
                <motion.h1
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl lg:text-3xl font-semibold text-white tracking-tight mb-1"
                >
                  Welke game kies jij?
                </motion.h1>
                <p className="text-xs text-white/30">
                  Klik op de game die je het liefst zou spelen
                </p>
              </div>

              <BattleProgress
                round={round}
                totalRounds={totalRounds}
                matchInRound={matchIndex}
                matchesInRound={matchesInCurrentRound}
              />

              {/* Battle arena */}
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="relative w-full max-w-5xl">
                  <div className="flex flex-col lg:flex-row items-stretch">
                    <AnimatePresence mode="wait">
                      <BattleCard
                        key={`left-${currentMatch.left.sku}`}
                        product={currentMatch.left}
                        side="left"
                        onPick={() => handlePick(currentMatch.left, currentMatch.right, 'left')}
                        isAnimating={isAnimating}
                      />
                    </AnimatePresence>

                    <VsBadge round={round} />

                    <AnimatePresence mode="wait">
                      <BattleCard
                        key={`right-${currentMatch.right.sku}`}
                        product={currentMatch.right}
                        side="right"
                        onPick={() => handlePick(currentMatch.right, currentMatch.left, 'right')}
                        isAnimating={isAnimating}
                      />
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Bracket visualization */}
              <BracketVisualization
                candidates={candidates}
                eliminated={eliminated}
                nextRound={nextRound}
                currentRound={currentRound}
                matchIndex={matchIndex}
              />
            </div>
          </motion.div>
        )}

        {/* ── RESULT ──────────────────────────────── */}
        {phase === 'result' && winner && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <WinnerScreen
              winner={winner}
              runners={eliminated.slice(-3).reverse()}
              onRestart={() => {
                setPhase('intro');
                setWinner(null);
                setEliminated([]);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
