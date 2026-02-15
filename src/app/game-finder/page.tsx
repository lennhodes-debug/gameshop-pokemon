'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
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
  budget: 'budget' | 'mid' | 'premium' | 'any' | null;
}

// ─── QUIZ CONFIG ────────────────────────────────────────────

interface QuizOption {
  id: string;
  label: string;
  sub: string;
  image: string;
  gradient: [string, string];
  glow: string;
}

interface QuizQuestion {
  title: string;
  subtitle: string;
  multi: boolean;
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
        image: '/images/quiz/rpg.webp',
        gradient: ['#7C3AED', '#5B21B6'],
        glow: '124,58,237',
      },
      {
        id: 'Avontuur',
        label: 'Avontuur',
        sub: 'Verkennen, puzzels, verhaal',
        image: '/images/quiz/adventure.webp',
        gradient: ['#059669', '#047857'],
        glow: '5,150,105',
      },
      {
        id: 'Platformer',
        label: 'Platformer',
        sub: 'Springen, rennen, actie',
        image: '/images/quiz/platformer.webp',
        gradient: ['#F59E0B', '#D97706'],
        glow: '245,158,11',
      },
      {
        id: 'Actie',
        label: 'Actie & Vecht',
        sub: 'Snelle reflexen, combos',
        image: '/images/quiz/adventure.webp',
        gradient: ['#EF4444', '#B91C1C'],
        glow: '239,68,68',
      },
      {
        id: 'Party',
        label: 'Party & Sport',
        sub: 'Samen spelen, competitie',
        image: '/images/quiz/party.webp',
        gradient: ['#A855F7', '#7E22CE'],
        glow: '168,85,247',
      },
      {
        id: 'Puzzel',
        label: 'Puzzel & Strategie',
        sub: 'Nadenken, plannen, logica',
        image: '/images/quiz/solo.webp',
        gradient: ['#06B6D4', '#0891B2'],
        glow: '6,182,212',
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
        image: '/images/quiz/solo.webp',
        gradient: ['#0EA5E9', '#0284C7'],
        glow: '14,165,233',
      },
      {
        id: 'samen',
        label: 'Met vrienden',
        sub: 'Party games, samen op de bank',
        image: '/images/quiz/together.webp',
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
        sub: 'De originele handheld',
        image: '/images/platforms/gbc.webp',
        gradient: ['#84CC16', '#65A30D'],
        glow: '132,204,22',
      },
      {
        id: 'Game Boy Advance',
        label: 'GBA',
        sub: '32-bit handheld',
        image: '/images/platforms/gba.webp',
        gradient: ['#6366F1', '#4F46E5'],
        glow: '99,102,241',
      },
      {
        id: 'Nintendo DS',
        label: 'Nintendo DS',
        sub: 'Dual screen',
        image: '/images/platforms/ds.webp',
        gradient: ['#64748B', '#475569'],
        glow: '100,116,139',
      },
      {
        id: 'Nintendo 3DS',
        label: '3DS',
        sub: 'Stereoscopisch 3D',
        image: '/images/platforms/3ds.webp',
        gradient: ['#0EA5E9', '#0284C7'],
        glow: '14,165,233',
      },
      {
        id: 'Wii',
        label: 'Wii',
        sub: 'Bewegingsbesturing',
        image: '/images/platforms/wii.webp',
        gradient: ['#F0F0F0', '#CCCCCC'],
        glow: '200,200,200',
      },
      {
        id: 'Wii U',
        label: 'Wii U',
        sub: 'GamePad & TV',
        image: '/images/platforms/wiiu.webp',
        gradient: ['#0EA5E9', '#1D4ED8'],
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
        label: 'Pok\u00E9mon',
        sub: 'Vangen, trainen, vechten',
        image: '/images/quiz/pokemon.webp',
        gradient: ['#EF4444', '#DC2626'],
        glow: '239,68,68',
      },
      {
        id: 'mario',
        label: 'Mario',
        sub: 'Platformer, kart, party',
        image: '/images/quiz/mario.webp',
        gradient: ['#E52521', '#C41E1C'],
        glow: '229,37,33',
      },
      {
        id: 'zelda',
        label: 'Zelda',
        sub: 'Avontuur, puzzels, dungeons',
        image: '/images/quiz/zelda.webp',
        gradient: ['#B89B3E', '#7A6B2A'],
        glow: '184,155,62',
      },
      {
        id: 'surprise',
        label: 'Verrass me',
        sub: 'Ik sta open voor alles',
        image: '/images/quiz/surprise.webp',
        gradient: ['#8B5CF6', '#6D28D9'],
        glow: '139,92,246',
      },
    ],
  },
  {
    title: 'Wat is je budget?',
    subtitle: 'We zoeken de beste match in jouw prijsklasse',
    multi: false,
    options: [
      {
        id: 'budget',
        label: 'Tot \u20AC25',
        sub: 'Betaalbare klassiekers',
        image: '/images/quiz/adventure.webp',
        gradient: ['#10B981', '#059669'],
        glow: '16,185,129',
      },
      {
        id: 'mid',
        label: '\u20AC25 \u2013 \u20AC60',
        sub: 'De sweet spot',
        image: '/images/quiz/rpg.webp',
        gradient: ['#F59E0B', '#D97706'],
        glow: '245,158,11',
      },
      {
        id: 'premium',
        label: '\u20AC60+',
        sub: 'Premium & collector\u2019s items',
        image: '/images/quiz/zelda.webp',
        gradient: ['#8B5CF6', '#6D28D9'],
        glow: '139,92,246',
      },
      {
        id: 'any',
        label: 'Maakt niet uit',
        sub: 'Laat alles maar zien',
        image: '/images/quiz/surprise.webp',
        gradient: ['#64748B', '#475569'],
        glow: '100,116,139',
      },
    ],
  },
];

// ─── FRANCHISE KEYWORDS ─────────────────────────────────────

const FRANCHISE_KEYWORDS: Record<string, string[]> = {
  pokemon: ['pokémon', 'pokemon', 'pikachu', 'mystery dungeon'],
  mario: ['mario', 'luigi', 'peach', 'toad', 'yoshi', 'wario', 'donkey kong', 'kart'],
  zelda: ['zelda', 'link', 'hyrule'],
};

// ─── MATCH CALCULATOR ───────────────────────────────────────

// Simpele hash voor deterministische variatie per product
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function calculateMatches(answers: QuizAnswer, products: Product[]): Product[] {
  const pool = products.filter((p) => !!p.image && !p.isConsole);

  return pool
    .map((p) => {
      let score = 0;
      const name = p.name.toLowerCase();
      const price = getEffectivePrice(p);

      // Genre matching
      if (answers.genres.length > 0) {
        if (answers.genres.includes(p.genre)) score += 15;
        if (
          answers.genres.includes('Party') &&
          ['Vecht', 'Sport', 'Race', 'Party'].includes(p.genre)
        )
          score += 10;
        if (answers.genres.includes('Actie') && ['Actie', 'Vecht', 'Shooter'].includes(p.genre))
          score += 10;
        if (
          answers.genres.includes('Puzzel') &&
          ['Puzzel', 'Strategie', 'Simulatie'].includes(p.genre)
        )
          score += 10;
      }

      // Play style matching
      if (answers.playStyle === 'solo') {
        if (['RPG', 'Avontuur', 'Platformer', 'Strategie', 'Simulatie', 'Puzzel'].includes(p.genre))
          score += 8;
      } else if (answers.playStyle === 'samen') {
        if (['Party', 'Sport', 'Vecht', 'Race'].includes(p.genre)) score += 12;
      }

      // Platform matching
      if (answers.platforms.length > 0) {
        if (answers.platforms.includes(p.platform)) score += 10;
      }

      // Franchise matching
      if (answers.franchises.length > 0) {
        if (answers.franchises.includes('surprise')) {
          score += hashCode(p.sku) % 7;
        }
        for (const fId of answers.franchises) {
          const keywords = FRANCHISE_KEYWORDS[fId];
          if (keywords && keywords.some((kw) => name.includes(kw))) score += 14;
        }
      }

      // Budget matching
      if (answers.budget && answers.budget !== 'any') {
        if (answers.budget === 'budget' && price <= 25) score += 10;
        else if (answers.budget === 'mid' && price > 25 && price <= 60) score += 10;
        else if (answers.budget === 'premium' && price > 60) score += 10;
        // Kleine penalty als buiten budget
        if (answers.budget === 'budget' && price > 40) score -= 5;
        if (answers.budget === 'premium' && price < 40) score -= 3;
      }

      // Bonuspunten
      if (p.image) score += 2;
      if (p.isPremium) score += 1;
      // Deterministische variatie op basis van SKU
      score += hashCode(p.sku) % 4;

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.product);
}

// ─── SELECTION BURST ────────────────────────────────────────

function SelectionBurst({ color, active }: { color: string; active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return {
          id: i,
          x: Math.cos(angle) * (50 + Math.random() * 30),
          y: Math.sin(angle) * (50 + Math.random() * 30),
          size: 3 + Math.random() * 3,
          delay: Math.random() * 0.1,
        };
      }),
    [],
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

// ─── CONFETTI ───────────────────────────────────────────────

function ConfettiExplosion() {
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 600,
        y: -(Math.random() * 400 + 80),
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 0.5 + 0.5,
        color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'][
          Math.floor(Math.random() * 5)
        ],
        delay: Math.random() * 0.4,
        w: Math.random() > 0.5 ? 7 : 4,
        h: Math.random() > 0.5 ? 4 : 10,
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
          transition={{ duration: 2.2, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

// ─── 3D TILT OPTION CARD ────────────────────────────────────

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
  const cardRef = useRef<HTMLButtonElement>(null);
  const [justSelected, setJustSelected] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const cfg = { stiffness: 250, damping: 22 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), cfg);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), cfg);

  const spotX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), cfg);
  const spotY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), cfg);
  const spotlight = useMotionTemplate`radial-gradient(300px circle at ${spotX}% ${spotY}%, rgba(${option.glow},0.12), transparent 70%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  const handleClick = useCallback(() => {
    setJustSelected(true);
    onToggle();
    setTimeout(() => setJustSelected(false), 500);
  }, [onToggle]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 800 }}
    >
      <motion.button
        ref={cardRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.97 }}
        className="group relative text-left w-full"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <div
          className={`relative overflow-hidden rounded-2xl h-56 sm:h-64 transition-all duration-500 ${
            selected ? 'shadow-2xl' : 'shadow-lg shadow-black/20'
          }`}
          style={{
            border: selected
              ? `2px solid rgba(${option.glow}, 0.6)`
              : '1px solid rgba(255,255,255,0.06)',
            boxShadow: selected
              ? `0 16px 48px -8px rgba(${option.glow}, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)`
              : undefined,
          }}
        >
          {/* Background image */}
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
            <Image
              src={option.image}
              alt={option.label}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              quality={85}
            />
          </div>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: selected
                ? `linear-gradient(160deg, ${option.gradient[0]}bb 0%, ${option.gradient[1]}88 40%, transparent 100%)`
                : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.05) 100%)',
            }}
          />

          {/* Cursor spotlight */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: spotlight }}
          />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3
              className="text-lg sm:text-xl font-semibold text-white tracking-tight mb-0.5"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              {option.label}
            </h3>
            <p
              className="text-[13px] text-white/50"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            >
              {option.sub}
            </p>
          </div>

          {/* Selected checkmark */}
          <motion.div
            className="absolute top-3.5 right-3.5 z-10"
            initial={false}
            animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${option.gradient[0]}, ${option.gradient[1]})`,
                boxShadow: `0 4px 12px rgba(${option.glow}, 0.35)`,
              }}
            >
              <svg
                className="h-3.5 w-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </motion.div>

          {/* Unselected ring */}
          {!selected && (
            <div className="absolute top-3.5 right-3.5 h-7 w-7 rounded-full border-2 border-white/15 backdrop-blur-sm bg-black/10" />
          )}

          {/* Selection burst */}
          <SelectionBurst color={`rgba(${option.glow}, 0.7)`} active={justSelected && selected} />
        </div>
      </motion.button>
    </motion.div>
  );
}

// ─── PROGRESS BAR ───────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-white/30 tabular-nums mr-1">
        {current + 1}/{total}
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="relative">
            <motion.div
              className="h-1 rounded-full"
              animate={{
                width: i <= current ? 24 : 8,
                backgroundColor:
                  i < current
                    ? 'rgb(16, 185, 129)'
                    : i === current
                      ? 'rgb(255, 255, 255)'
                      : 'rgba(255, 255, 255, 0.08)',
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ──────────────────────────────────────────

function ResultScreen({ results, onRestart }: { results: Product[]; onRestart: () => void }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const topPick = results[0];
  const others = results.slice(1, 7);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2500);
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
      {/* Ambient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
      </div>

      {showConfetti && <ConfettiExplosion />}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-white/35 uppercase tracking-[0.2em]">
              Jouw perfecte match
            </span>
          </div>
        </motion.div>

        {/* Top pick */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-16"
        >
          {/* Floating image */}
          <div className="relative mb-8">
            <div className="absolute inset-0 blur-3xl opacity-20 scale-150">
              <div className="w-full h-full bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
            </div>
            <motion.div
              className="absolute inset-[-16px] rounded-full border border-emerald-500/[0.08]"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
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
                  className="object-contain drop-shadow-[0_16px_48px_rgba(16,185,129,0.25)]"
                  priority
                />
              )}
            </motion.div>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-white/40 mb-4">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              {platformLabel} &middot; {topPick.genre}
            </div>
            <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-3">
              {topPick.name}
            </h2>
            <p className="text-xl lg:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 tabular-nums mb-5">
              {formatPrice(price)}
            </p>
            {topPick.description && (
              <p className="text-sm text-white/30 max-w-md mx-auto leading-relaxed mb-8 line-clamp-3">
                {topPick.description}
              </p>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => handleAdd(topPick)}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-white text-slate-900 text-sm font-medium shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-[0.97] transition-all duration-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              In winkelwagen
            </button>
            <Link
              href={`/shop/${topPick.sku}`}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-white/[0.06] border border-white/[0.06] text-white/70 text-sm font-medium hover:bg-white/[0.1] hover:text-white active:scale-[0.97] transition-all duration-300"
            >
              Bekijk product
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        {/* More recommendations */}
        {others.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-10" />
            <p className="text-xs font-medium text-white/25 uppercase tracking-[0.2em] text-center mb-8">
              Meer op basis van jouw smaak
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {others.map((p, i) => (
                <motion.div
                  key={p.sku}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.06 }}
                  className="group relative flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300"
                >
                  <Link href={`/shop/${p.sku}`} className="flex flex-col items-center w-full">
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 mb-3 group-hover:scale-105 transition-transform duration-500">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="112px"
                          className="object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/20 mb-1">
                        {PLATFORM_LABELS[p.platform] || p.platform}
                      </p>
                      <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors mb-1 line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-xs font-medium text-emerald-400/80 tabular-nums mb-3">
                        {formatPrice(getEffectivePrice(p))}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(p);
                    }}
                    className="w-full h-8 rounded-lg bg-white/[0.06] border border-white/[0.06] text-white/50 text-xs font-medium hover:bg-white/[0.12] hover:text-white active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Toevoegen
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-14 flex items-center justify-center gap-6"
        >
          <button
            onClick={onRestart}
            className="text-sm text-white/25 hover:text-white/50 transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
            Opnieuw
          </button>
          <Link
            href="/shop"
            className="text-sm text-white/25 hover:text-white/50 transition-colors inline-flex items-center gap-2"
          >
            Alle games
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
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
  const [direction, setDirection] = useState<1 | -1>(1);

  const currentQuestion = QUESTIONS[questionIndex];
  const currentSelection = selections[questionIndex];
  const totalQuestions = QUESTIONS.length;

  const handleNext = useCallback(() => {
    setDirection(1);
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      const answers: QuizAnswer = {
        genres: selections[0],
        playStyle: (selections[1][0] as 'solo' | 'samen') || null,
        platforms: selections[2],
        franchises: selections[3],
        budget: (selections[4]?.[0] as QuizAnswer['budget']) || null,
      };
      const matched = calculateMatches(answers, allProducts);
      setResults(matched);
      setPhase('result');
    }
  }, [questionIndex, totalQuestions, selections, allProducts]);

  const toggleOption = useCallback(
    (optionId: string) => {
      const q = QUESTIONS[questionIndex];
      let willAutoAdvance = false;

      setSelections((prev) => {
        const updated = [...prev];
        const current = [...updated[questionIndex]];

        if (q.multi) {
          const idx = current.indexOf(optionId);
          if (idx >= 0) current.splice(idx, 1);
          else current.push(optionId);
        } else {
          if (current[0] === optionId) {
            current.length = 0;
          } else {
            current.length = 0;
            current.push(optionId);
            willAutoAdvance = true;
          }
        }
        updated[questionIndex] = current;
        return updated;
      });

      // Auto-advance na 400ms bij single-select
      if (!q.multi && willAutoAdvance) {
        setTimeout(() => {
          handleNext();
        }, 400);
      }
    },
    [questionIndex, handleNext],
  );

  const handleBack = useCallback(() => {
    setDirection(-1);
    if (questionIndex > 0) setQuestionIndex((i) => i - 1);
  }, [questionIndex]);

  const handleStart = useCallback(() => setPhase('quiz'), []);

  const restart = useCallback(() => {
    setPhase('intro');
    setQuestionIndex(0);
    setSelections(QUESTIONS.map(() => []));
    setResults([]);
    setDirection(1);
  }, []);

  const slideVariants = {
    enter: { opacity: 0, x: direction > 0 ? 50 : -50, filter: 'blur(4px)' },
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: direction > 0 ? -50 : 50, filter: 'blur(4px)' },
  };

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
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            {/* Ambient orbs */}
            <motion.div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.05] blur-[120px]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.08, 0.05] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/[0.03] blur-[100px]"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />

            {/* Radial fade */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050810_80%)]" />

            <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-white/35 uppercase tracking-[0.2em]">
                  5 vragen &bull; Jouw smaak
                </span>
              </motion.div>

              {/* Title with staggered letter reveal */}
              <motion.h1 className="text-5xl lg:text-[76px] font-light text-white tracking-[-0.03em] leading-[0.92] mb-6">
                {'Game'.split('').map((char, i) => (
                  <motion.span
                    key={`a${i}`}
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, delay: 0.25 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <br />
                {'Finder'.split('').map((char, i) => (
                  <motion.span
                    key={`b${i}`}
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-base text-white/35 max-w-sm mx-auto mb-3"
              >
                Beantwoord 5 snelle vragen over jouw speelstijl en voorkeuren.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="text-sm text-white/20 max-w-sm mx-auto mb-12"
              >
                Wij vinden de perfecte game voor jou uit onze collectie.
              </motion.p>

              {/* CTA */}
              <motion.button
                onClick={handleStart}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center h-13 px-10 rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg shadow-white/10 hover:shadow-white/15 transition-all duration-300"
              >
                Start de quiz
                <svg
                  className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
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
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Subtle ambient glow per question */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[140px] opacity-[0.04] transition-colors duration-1000"
              style={{
                backgroundColor: `rgb(${currentQuestion.options[0]?.glow || '16,185,129'})`,
              }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-16">
              {/* Progress */}
              <div className="flex items-center justify-between mb-10">
                <ProgressBar current={questionIndex} total={totalQuestions} />
                <button
                  onClick={handleNext}
                  className="text-xs text-white/20 hover:text-white/40 transition-colors"
                >
                  Sla over
                </button>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="mb-8 lg:mb-10"
              >
                <h2 className="text-2xl lg:text-4xl font-semibold text-white tracking-tight mb-2">
                  {currentQuestion.title}
                </h2>
                <p className="text-sm text-white/25">{currentQuestion.subtitle}</p>
              </motion.div>

              {/* Options grid */}
              <div
                className={`grid gap-3 sm:gap-4 mb-10 ${
                  currentQuestion.options.length <= 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : currentQuestion.options.length <= 4
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
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
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between"
              >
                <button
                  onClick={handleBack}
                  disabled={questionIndex === 0}
                  className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                    questionIndex === 0
                      ? 'text-white/[0.07] cursor-not-allowed'
                      : 'text-white/25 hover:text-white/50 hover:-translate-x-0.5'
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                  Vorige
                </button>

                <motion.button
                  onClick={handleNext}
                  disabled={currentSelection.length === 0}
                  whileHover={currentSelection.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={currentSelection.length > 0 ? { scale: 0.97 } : {}}
                  className={`group inline-flex items-center justify-center h-11 px-7 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentSelection.length > 0
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/10 hover:shadow-white/15'
                      : 'bg-white/[0.04] text-white/15 cursor-not-allowed'
                  }`}
                >
                  {questionIndex < totalQuestions - 1 ? 'Volgende' : 'Bekijk resultaten'}
                  <svg
                    className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </motion.button>
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
            transition={{ duration: 0.5 }}
          >
            <ResultScreen results={results} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
