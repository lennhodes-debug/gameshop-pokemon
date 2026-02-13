'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, Product, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';

// ─── TYPES ──────────────────────────────────────────────────

type Phase = 'intro' | 'battle' | 'result';

interface MatchUp {
  left: Product;
  right: Product;
}

// ─── UTILS ──────────────────────────────────────────────────

function pickCandidates(products: Product[], count: number): Product[] {
  const withImage = products.filter(p => !!p.image && !p.isConsole);
  const shuffled = [...withImage].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getGenreEmoji(genre: string): string {
  const map: Record<string, string> = {
    'RPG': '⚔️', 'Avontuur': '🗺️', 'Platformer': '🍄', 'Actie': '💥',
    'Race': '🏎️', 'Vecht': '🥊', 'Party': '🎉', 'Shooter': '🔫',
    'Sport': '⚽', 'Strategie': '♟️', 'Simulatie': '🏠', 'Puzzel': '🧩',
    'Muziek': '🎵', 'Fitness': '💪',
  };
  return map[genre] || '🎮';
}

// ─── BRACKET SIZE ───────────────────────────────────────────

const BRACKET_SIZE = 8; // 8 → 4 → 2 → 1 (3 rondes)

// ─── VERSUS CARD ────────────────────────────────────────────

function VersusCard({ product, side, onPick, roundLabel }: {
  product: Product;
  side: 'left' | 'right';
  onPick: () => void;
  roundLabel: string;
}) {
  const price = getEffectivePrice(product);
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;

  return (
    <motion.button
      onClick={onPick}
      className="group relative flex-1 min-h-[400px] lg:min-h-[500px] flex flex-col items-center justify-center p-6 lg:p-10 cursor-pointer overflow-hidden"
      initial={{ opacity: 0, x: side === 'left' ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === 'left' ? -60 : 60, scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/3 group-hover:to-transparent transition-all duration-500" />

      {/* Game image */}
      <div className="relative w-48 h-48 lg:w-56 lg:h-56 mb-8 group-hover:scale-110 transition-transform duration-500 ease-out">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="224px"
            className="object-contain drop-shadow-2xl"
            priority
          />
        ) : (
          <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="text-4xl">{getGenreEmoji(product.genre)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative text-center max-w-[280px]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-500 mb-3">
          <span>{platformLabel}</span>
          <span className="text-slate-300">&middot;</span>
          <span>{product.genre}</span>
        </div>
        <h3 className="text-lg lg:text-xl font-semibold text-slate-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 font-medium tabular-nums">{formatPrice(price)}</p>
      </div>

      {/* Kies mij indicator */}
      <div className="mt-6 px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        Kies mij
      </div>
    </motion.button>
  );
}

// ─── VS DIVIDER ─────────────────────────────────────────────

function VsDivider() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
      <motion.div
        className="h-16 w-16 lg:h-20 lg:w-20 rounded-full bg-slate-900 flex items-center justify-center shadow-2xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 15, stiffness: 200 }}
      >
        <span className="text-white font-black text-lg lg:text-xl tracking-tight">VS</span>
      </motion.div>
    </div>
  );
}

// ─── PROGRESS BAR ───────────────────────────────────────────

function BracketProgress({ round, totalRounds, matchInRound, matchesInRound }: {
  round: number;
  totalRounds: number;
  matchInRound: number;
  matchesInRound: number;
}) {
  const roundLabels = ['Kwartfinale', 'Halve finale', 'Finale'];
  const labels = totalRounds === 3 ? roundLabels : roundLabels.slice(3 - totalRounds);
  const overallProgress = ((round * matchesInRound + matchInRound) / (totalRounds * matchesInRound)) * 100;

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {labels[round] || `Ronde ${round + 1}`}
        </span>
        <span className="text-xs text-slate-400 tabular-nums">
          {matchInRound + 1}/{matchesInRound}
        </span>
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
  const price = getEffectivePrice(winner);
  const platformLabel = PLATFORM_LABELS[winner.platform] || winner.platform;

  const handleAdd = () => {
    addItem(winner);
    addToast(`${winner.name} toegevoegd aan winkelwagen`, 'success', undefined, winner.image || undefined);
  };

  return (
    <motion.div
      className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Trophy / confetti burst */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 12, stiffness: 150 }}
        className="text-6xl lg:text-8xl mb-6 select-none"
      >
        🏆
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm font-medium text-emerald-600 uppercase tracking-[0.2em] mb-4"
      >
        Jouw winnaar
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-64 h-64 lg:w-80 lg:h-80 mb-8"
      >
        {winner.image && (
          <Image
            src={winner.image}
            alt={winner.name}
            fill
            sizes="320px"
            className="object-contain drop-shadow-2xl"
            priority
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-500 mb-3">
          {platformLabel} &middot; {winner.genre}
        </div>
        <h2 className="text-3xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-3">
          {winner.name}
        </h2>
        <p className="text-2xl font-semibold text-emerald-600 tabular-nums">{formatPrice(price)}</p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3 mb-16"
      >
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all duration-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          In winkelwagen
        </button>
        <Link
          href={`/shop/${winner.sku}`}
          className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 active:scale-[0.98] transition-all duration-200"
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
          transition={{ delay: 0.9 }}
          className="w-full max-w-2xl"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center mb-4">
            Ook de moeite waard
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {runners.slice(0, 3).map((p) => (
              <Link
                key={p.sku}
                href={`/shop/${p.sku}`}
                className="group flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-12 w-12 flex-shrink-0">
                  {p.image && (
                    <Image src={p.image} alt={p.name} fill sizes="48px" className="object-contain" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{p.name}</p>
                  <p className="text-[11px] text-slate-400 tabular-nums">{formatPrice(getEffectivePrice(p))}</p>
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
        transition={{ delay: 1.1 }}
        className="mt-12 text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
        Opnieuw spelen
      </motion.button>
    </motion.div>
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

  const totalRounds = Math.log2(BRACKET_SIZE); // 3
  const matchesInCurrentRound = Math.floor(currentRound.length / 2);

  const currentMatch: MatchUp | null = useMemo(() => {
    if (phase !== 'battle' || matchIndex * 2 + 1 >= currentRound.length) return null;
    return {
      left: currentRound[matchIndex * 2],
      right: currentRound[matchIndex * 2 + 1],
    };
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
    setPhase('battle');
  }, [allProducts]);

  const handlePick = useCallback((winner: Product, loser: Product) => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      const updatedNext = [...nextRound, winner];
      const updatedEliminated = [...eliminated, loser];
      setNextRound(updatedNext);
      setEliminated(updatedEliminated);

      const nextMatchIndex = matchIndex + 1;

      if (nextMatchIndex >= matchesInCurrentRound) {
        // Ronde klaar
        if (updatedNext.length === 1) {
          // Finale klaar — we hebben een winnaar
          setWinner(updatedNext[0]);
          setPhase('result');
        } else {
          // Volgende ronde
          setCurrentRound(updatedNext);
          setNextRound([]);
          setMatchIndex(0);
          setRound(r => r + 1);
        }
      } else {
        setMatchIndex(nextMatchIndex);
      }

      setIsAnimating(false);
    }, 400);
  }, [isAnimating, nextRound, eliminated, matchIndex, matchesInCurrentRound]);

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-[#f8fafc]">
      {/* ── INTRO ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative bg */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              className="text-7xl lg:text-8xl mb-8 select-none"
            >
              🎮
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl lg:text-6xl font-semibold text-slate-900 tracking-tight mb-4"
            >
              Game Finder
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-500 max-w-md mb-4"
            >
              Geen idee welke game je wilt? Wij helpen je kiezen.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-slate-400 max-w-sm mb-10"
            >
              8 games gaan de strijd aan. Kies steeds welke je het leukst vindt &mdash; tot er eentje overblijft.
            </motion.p>

            <motion.button
              onClick={startGame}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="group inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-slate-900 text-white font-medium text-sm shadow-xl hover:shadow-2xl hover:bg-slate-800 active:scale-[0.97] transition-all duration-300"
            >
              Start het toernooi
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-16 flex items-center gap-8 text-xs text-slate-400"
            >
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-sm">8</span>
                <span>Kandidaten</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-sm">3</span>
                <span>Rondes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-sm">1</span>
                <span>Winnaar</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── BATTLE ──────────────────────────────── */}
        {phase === 'battle' && currentMatch && (
          <motion.div
            key={`battle-${round}-${matchIndex}`}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight mb-2">
                Welke game kies jij?
              </h1>
              <p className="text-sm text-slate-400">
                Klik op de game die je het liefst zou spelen
              </p>
            </div>

            <BracketProgress
              round={round}
              totalRounds={totalRounds}
              matchInRound={matchIndex}
              matchesInRound={matchesInCurrentRound}
            />

            {/* Battle arena */}
            <div className="relative bg-white rounded-3xl shadow-sm overflow-hidden">
              {/* Vertical divider */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-100 hidden sm:block" />

              <div className="flex flex-col sm:flex-row">
                <AnimatePresence mode="wait">
                  <VersusCard
                    key={`left-${currentMatch.left.sku}`}
                    product={currentMatch.left}
                    side="left"
                    onPick={() => handlePick(currentMatch.left, currentMatch.right)}
                    roundLabel={`Ronde ${round + 1}`}
                  />
                </AnimatePresence>

                <VsDivider />

                {/* Mobile divider */}
                <div className="h-px bg-slate-100 sm:hidden" />

                <AnimatePresence mode="wait">
                  <VersusCard
                    key={`right-${currentMatch.right.sku}`}
                    product={currentMatch.right}
                    side="right"
                    onPick={() => handlePick(currentMatch.right, currentMatch.left)}
                    roundLabel={`Ronde ${round + 1}`}
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Remaining bracket info */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                {candidates.map((p) => {
                  const isEliminated = eliminated.some(e => e.sku === p.sku);
                  const isWinnerSoFar = [...nextRound, ...currentRound.slice((matchIndex + 1) * 2)].some(w => w.sku === p.sku);
                  return (
                    <div
                      key={p.sku}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        isEliminated
                          ? 'bg-slate-200 scale-75'
                          : isWinnerSoFar
                          ? 'bg-emerald-400'
                          : 'bg-slate-400'
                      }`}
                      title={p.name}
                    />
                  );
                })}
              </div>
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
