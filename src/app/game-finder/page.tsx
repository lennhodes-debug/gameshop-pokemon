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

type Phase = 'intro' | 'quiz' | 'result';

interface QuizAnswer {
  genres: string[];
  playStyle: 'solo' | 'samen' | null;
  platforms: string[];
  franchises: string[];
}

// ─── QUIZ QUESTIONS CONFIG ──────────────────────────────────

interface QuizOption {
  id: string;
  label: string;
  sub: string;
  icon: string; // SVG path
  image: string; // background image path
  gradient: [string, string];
  glow: string;
}

interface QuizQuestion {
  title: string;
  subtitle: string;
  multi: boolean; // allow multiple selections
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    title: 'Wat voor games speel je het liefst?',
    subtitle: 'Kies er een of meerdere',
    multi: true,
    options: [
      {
        id: 'RPG',
        label: 'RPG',
        sub: 'Diep verhaal, training, levels',
        icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
        image: '/images/quiz/rpg.jpg',
        gradient: ['#7C3AED', '#5B21B6'],
        glow: '124,58,237',
      },
      {
        id: 'Avontuur',
        label: 'Avontuur',
        sub: 'Verkennen, puzzels, verhaal',
        icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
        image: '/images/quiz/adventure.jpg',
        gradient: ['#059669', '#047857'],
        glow: '5,150,105',
      },
      {
        id: 'Platformer',
        label: 'Platformer',
        sub: 'Springen, rennen, actie',
        icon: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
        image: '/images/quiz/platformer.jpg',
        gradient: ['#F59E0B', '#D97706'],
        glow: '245,158,11',
      },
      {
        id: 'Party',
        label: 'Party & Sport',
        sub: 'Samen spelen, competitie',
        icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
        image: '/images/quiz/party.jpg',
        gradient: ['#A855F7', '#7E22CE'],
        glow: '168,85,247',
      },
    ],
  },
  {
    title: 'Hoe speel je het liefst?',
    subtitle: 'Kies wat het beste bij je past',
    multi: false,
    options: [
      {
        id: 'solo',
        label: 'Alleen',
        sub: 'Diep in het verhaal, op eigen tempo',
        icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        image: '/images/quiz/solo.jpg',
        gradient: ['#0EA5E9', '#0284C7'],
        glow: '14,165,233',
      },
      {
        id: 'samen',
        label: 'Met vrienden',
        sub: 'Party games, samen op de bank',
        icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
        image: '/images/quiz/together.jpg',
        gradient: ['#EC4899', '#DB2777'],
        glow: '236,72,153',
      },
    ],
  },
  {
    title: 'Welk platform heeft je voorkeur?',
    subtitle: 'Kies er een of meerdere',
    multi: true,
    options: [
      {
        id: 'Game Boy / Color',
        label: 'Game Boy',
        sub: 'De originele handheld (1989)',
        icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
        image: '/images/platforms/gbc.webp',
        gradient: ['#84CC16', '#65A30D'],
        glow: '132,204,22',
      },
      {
        id: 'Game Boy Advance',
        label: 'GBA',
        sub: '32-bit handheld (2001)',
        icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
        image: '/images/platforms/gba.webp',
        gradient: ['#6366F1', '#4F46E5'],
        glow: '99,102,241',
      },
      {
        id: 'Nintendo DS',
        label: 'Nintendo DS',
        sub: 'Dual screen (2004)',
        icon: 'M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5',
        image: '/images/platforms/ds.webp',
        gradient: ['#64748B', '#475569'],
        glow: '100,116,139',
      },
      {
        id: 'Nintendo 3DS',
        label: '3DS',
        sub: 'Stereoscopisch 3D (2011)',
        icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z',
        image: '/images/platforms/3ds.webp',
        gradient: ['#0EA5E9', '#0284C7'],
        glow: '14,165,233',
      },
    ],
  },
  {
    title: 'Welke franchise trekt je het meest?',
    subtitle: 'Kies er een of meerdere',
    multi: true,
    options: [
      {
        id: 'pokemon',
        label: 'Pokémon',
        sub: 'Vangen, trainen, vechten',
        icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c1.5 0 2.5-1.5 2.5-3S13.5 15 12 15s-2.5 1.5-2.5 3 1 3 2.5 3zm0-9a3 3 0 100-6 3 3 0 000 6z',
        image: '/images/quiz/pokemon.jpg',
        gradient: ['#EF4444', '#DC2626'],
        glow: '239,68,68',
      },
      {
        id: 'mario',
        label: 'Mario',
        sub: 'Platformer, kart, party',
        icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
        image: '/images/quiz/mario.jpg',
        gradient: ['#E52521', '#C41E1C'],
        glow: '229,37,33',
      },
      {
        id: 'zelda',
        label: 'Zelda',
        sub: 'Avontuur, puzzels, dungeons',
        icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
        image: '/images/quiz/zelda.jpg',
        gradient: ['#B89B3E', '#7A6B2A'],
        glow: '184,155,62',
      },
      {
        id: 'surprise',
        label: 'Verrass me',
        sub: 'Ik sta open voor alles',
        icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
        image: '/images/quiz/surprise.jpg',
        gradient: ['#8B5CF6', '#6D28D9'],
        glow: '139,92,246',
      },
    ],
  },
];

// ─── FRANCHISE KEYWORDS FOR MATCHING ────────────────────────

const FRANCHISE_KEYWORDS: Record<string, string[]> = {
  pokemon: ['pokémon', 'pokemon', 'pikachu'],
  mario: ['mario', 'luigi', 'peach', 'toad', 'yoshi', 'wario', 'donkey kong'],
  zelda: ['zelda', 'link'],
};

// ─── MATCH CALCULATOR ───────────────────────────────────────

function calculateMatches(answers: QuizAnswer, products: Product[]): Product[] {
  const pool = products.filter(p => !!p.image && !p.isConsole);

  return pool
    .map(p => {
      let score = 0;
      const name = p.name.toLowerCase();

      // Genre match (biggest weight)
      if (answers.genres.length > 0) {
        if (answers.genres.includes(p.genre)) score += 15;
        // Party preference also matches Vecht, Sport, Race
        if (answers.genres.includes('Party') && ['Vecht', 'Sport', 'Race', 'Party'].includes(p.genre)) score += 10;
      }

      // Play style
      if (answers.playStyle === 'solo') {
        if (['RPG', 'Avontuur', 'Platformer', 'Strategie', 'Simulatie', 'Puzzel'].includes(p.genre)) score += 8;
      } else if (answers.playStyle === 'samen') {
        if (['Party', 'Sport', 'Vecht', 'Race'].includes(p.genre)) score += 12;
      }

      // Platform match
      if (answers.platforms.length > 0) {
        if (answers.platforms.includes(p.platform)) score += 10;
      }

      // Franchise match
      if (answers.franchises.length > 0) {
        if (answers.franchises.includes('surprise')) {
          // Random boost for surprise
          score += Math.random() * 6;
        }
        for (const fId of answers.franchises) {
          const keywords = FRANCHISE_KEYWORDS[fId];
          if (keywords && keywords.some(kw => name.includes(kw))) {
            score += 14;
          }
        }
      }

      // Bonus for items with images (better UX)
      if (p.image) score += 2;
      // Small premium bonus
      if (p.isPremium) score += 1;
      // Slight randomness for variety
      score += Math.random() * 3;

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(s => s.product);
}

// ─── CONFETTI ───────────────────────────────────────────────

function ConfettiExplosion() {
  const particles = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
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
      {particles.map(p => (
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

// ─── QUIZ OPTION CARD ───────────────────────────────────────

function OptionCard({
  option,
  selected,
  onToggle,
  index,
}: {
  option: QuizOption;
  selected: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="group relative text-left"
    >
      <div
        className={`relative overflow-hidden rounded-2xl h-56 sm:h-64 transition-all duration-500 ${
          selected ? 'shadow-xl' : 'shadow-md'
        }`}
        style={{
          border: selected ? `2px solid rgba(${option.glow}, 0.6)` : '2px solid rgba(255,255,255,0.08)',
          boxShadow: selected ? `0 12px 40px rgba(${option.glow}, 0.25)` : undefined,
        }}
      >
        {/* Background image via Next.js Image for sharp rendering */}
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
          <Image
            src={option.image}
            alt={option.label}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            quality={90}
          />
        </div>

        {/* Brightness overlay for vivid look */}
        <div className="absolute inset-0 mix-blend-soft-light bg-white/10" />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: selected
              ? `linear-gradient(to top, ${option.gradient[1]}ee 0%, ${option.gradient[0]}88 40%, transparent 100%)`
              : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        {/* Selected glow ring */}
        {selected && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ boxShadow: `inset 0 0 30px rgba(${option.glow}, 0.2)` }}
          />
        )}

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 drop-shadow-lg">
            {option.label}
          </h3>
          <p className="text-sm text-white/60 drop-shadow-md">
            {option.sub}
          </p>
        </div>

        {/* Checkmark */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          initial={false}
          animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${option.gradient[0]}, ${option.gradient[1]})` }}
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </motion.div>

        {/* Unselected circle outline */}
        {!selected && (
          <div className="absolute top-4 right-4 h-7 w-7 rounded-full border-2 border-white/30" />
        )}
      </div>
    </motion.button>
  );
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_50%)]" />

      {showConfetti && <ConfettiExplosion />}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-20">
        {/* Header */}
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
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-white/40 uppercase tracking-[0.2em]">
              Jouw perfecte match
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
            <p className="text-xs font-medium text-white/30 uppercase tracking-[0.2em] text-center mb-8">
              Meer op basis van jouw smaak
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
                      <p className="text-[10px] text-white/25 mb-1">
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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-16 flex items-center justify-center gap-6"
        >
          <button
            onClick={onRestart}
            className="text-sm text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Opnieuw
          </button>
          <Link
            href="/shop"
            className="text-sm text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-2"
          >
            Bekijk alle games
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────

export default function GameFinderPage() {
  const allProducts = useMemo(() => getAllProducts(), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selections, setSelections] = useState<string[][]>(QUESTIONS.map(() => []));
  const [results, setResults] = useState<Product[]>([]);

  const currentQuestion = QUESTIONS[questionIndex];
  const currentSelection = selections[questionIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = (questionIndex / totalQuestions) * 100;

  const toggleOption = useCallback((optionId: string) => {
    setSelections(prev => {
      const updated = [...prev];
      const current = [...updated[questionIndex]];
      const q = QUESTIONS[questionIndex];

      if (q.multi) {
        // Toggle in multi-select
        const idx = current.indexOf(optionId);
        if (idx >= 0) {
          current.splice(idx, 1);
        } else {
          current.push(optionId);
        }
      } else {
        // Single select — replace
        if (current[0] === optionId) {
          current.length = 0;
        } else {
          current.length = 0;
          current.push(optionId);
        }
      }
      updated[questionIndex] = current;
      return updated;
    });
  }, [questionIndex]);

  const handleNext = useCallback(() => {
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex(i => i + 1);
    } else {
      // Calculate results
      const answers: QuizAnswer = {
        genres: selections[0],
        playStyle: (selections[1][0] as 'solo' | 'samen') || null,
        platforms: selections[2],
        franchises: selections[3],
      };
      const matched = calculateMatches(answers, allProducts);
      setResults(matched);
      setPhase('result');
    }
  }, [questionIndex, totalQuestions, selections, allProducts]);

  const handleBack = useCallback(() => {
    if (questionIndex > 0) {
      setQuestionIndex(i => i - 1);
    }
  }, [questionIndex]);

  const handleStart = useCallback(() => {
    setPhase('quiz');
  }, []);

  const restart = useCallback(() => {
    setPhase('intro');
    setQuestionIndex(0);
    setSelections(QUESTIONS.map(() => []));
    setResults([]);
  }, []);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {/* ── INTRO ──────────────────────────────── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="relative min-h-screen bg-[#050810] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_50%)]" />
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] mb-10"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-[0.2em]">
                  4 vragen &bull; Jouw smaak
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl lg:text-[80px] font-light text-white tracking-[-0.03em] leading-[0.92] mb-6"
              >
                Game<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Finder
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-base text-white/35 max-w-sm mx-auto mb-4"
              >
                Beantwoord 4 snelle vragen over jouw speelstijl en voorkeuren.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-white/20 max-w-sm mx-auto mb-12"
              >
                Wij vinden de perfecte game voor jou uit onze collectie.
              </motion.p>

              <motion.button
                onClick={handleStart}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-300"
              >
                Start de quiz
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── QUIZ ───────────────────────────────── */}
        {phase === 'quiz' && (
          <motion.div
            key={`quiz-${questionIndex}`}
            className="relative min-h-screen bg-[#050810] overflow-hidden"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-16">
              {/* Progress */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-white/30 uppercase tracking-[0.15em]">
                    Vraag {questionIndex + 1} van {totalQuestions}
                  </span>
                  <span className="text-[11px] font-medium text-white/20 tabular-nums">
                    {Math.round(((questionIndex + 1) / totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    initial={{ width: `${progress}%` }}
                    animate={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 lg:mb-10"
              >
                <h2 className="text-2xl lg:text-4xl font-semibold text-white tracking-tight mb-2">
                  {currentQuestion.title}
                </h2>
                <p className="text-sm text-white/25">
                  {currentQuestion.subtitle}
                </p>
              </motion.div>

              {/* Options grid */}
              <div className={`grid gap-4 mb-10 ${
                currentQuestion.options.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {currentQuestion.options.map((option, i) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    selected={currentSelection.includes(option.id)}
                    onToggle={() => toggleOption(option.id)}
                    index={i}
                  />
                ))}
              </div>

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <button
                  onClick={handleBack}
                  disabled={questionIndex === 0}
                  className={`inline-flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                    questionIndex === 0 ? 'text-white/10 cursor-not-allowed' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Vorige
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentSelection.length === 0}
                  className={`group inline-flex items-center justify-center h-12 px-8 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentSelection.length > 0
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-[0.97]'
                      : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                  }`}
                >
                  {questionIndex < totalQuestions - 1 ? 'Volgende' : 'Bekijk resultaten'}
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </motion.div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i < questionIndex
                        ? 'w-6 bg-emerald-500/60'
                        : i === questionIndex
                          ? 'w-4 bg-white/30'
                          : 'w-1.5 bg-white/10'
                    }`}
                    layout
                  />
                ))}
              </div>
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
