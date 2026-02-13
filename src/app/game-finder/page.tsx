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

type Phase = 'intro' | 'quiz' | 'result';

interface QuizAnswer {
  genres: string[];
  playStyle: 'solo' | 'samen' | null;
  platforms: string[];
  franchises: string[];
}

// ─── QUIZ CONFIG ────────────────────────────────────────────

interface QuizOption {
  id: string;
  label: string;
  sub: string;
  emoji: string;
  image: string;
  gradient: [string, string];
  glow: string;
}

interface QuizQuestion {
  title: string;
  subtitle: string;
  multi: boolean;
  ambientGlow: string; // Background color theme per question
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    title: 'Wat voor games speel je het liefst?',
    subtitle: 'Kies er een of meerdere',
    multi: true,
    ambientGlow: '124,58,237',
    options: [
      {
        id: 'RPG',
        label: 'RPG',
        sub: 'Diep verhaal, training, levels',
        emoji: '\u2694\uFE0F',
        image: '/images/quiz/rpg.jpg',
        gradient: ['#7C3AED', '#5B21B6'],
        glow: '124,58,237',
      },
      {
        id: 'Avontuur',
        label: 'Avontuur',
        sub: 'Verkennen, puzzels, verhaal',
        emoji: '\uD83C\uDFDD\uFE0F',
        image: '/images/quiz/adventure.jpg',
        gradient: ['#059669', '#047857'],
        glow: '5,150,105',
      },
      {
        id: 'Platformer',
        label: 'Platformer',
        sub: 'Springen, rennen, actie',
        emoji: '\uD83C\uDF1F',
        image: '/images/quiz/platformer.jpg',
        gradient: ['#F59E0B', '#D97706'],
        glow: '245,158,11',
      },
      {
        id: 'Party',
        label: 'Party & Sport',
        sub: 'Samen spelen, competitie',
        emoji: '\uD83C\uDF89',
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
    ambientGlow: '14,165,233',
    options: [
      {
        id: 'solo',
        label: 'Alleen',
        sub: 'Diep in het verhaal, op eigen tempo',
        emoji: '\uD83C\uDFAE',
        image: '/images/quiz/solo.jpg',
        gradient: ['#0EA5E9', '#0284C7'],
        glow: '14,165,233',
      },
      {
        id: 'samen',
        label: 'Met vrienden',
        sub: 'Party games, samen op de bank',
        emoji: '\uD83D\uDC6B',
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
    ambientGlow: '99,102,241',
    options: [
      {
        id: 'Game Boy / Color',
        label: 'Game Boy',
        sub: 'De originele handheld (1989)',
        emoji: '\uD83D\uDFE2',
        image: '/images/platforms/gbc.webp',
        gradient: ['#84CC16', '#65A30D'],
        glow: '132,204,22',
      },
      {
        id: 'Game Boy Advance',
        label: 'GBA',
        sub: '32-bit handheld (2001)',
        emoji: '\uD83D\uDFE3',
        image: '/images/platforms/gba.webp',
        gradient: ['#6366F1', '#4F46E5'],
        glow: '99,102,241',
      },
      {
        id: 'Nintendo DS',
        label: 'Nintendo DS',
        sub: 'Dual screen (2004)',
        emoji: '\uD83D\uDDA5\uFE0F',
        image: '/images/platforms/ds.webp',
        gradient: ['#64748B', '#475569'],
        glow: '100,116,139',
      },
      {
        id: 'Nintendo 3DS',
        label: '3DS',
        sub: 'Stereoscopisch 3D (2011)',
        emoji: '\uD83D\uDD35',
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
    ambientGlow: '239,68,68',
    options: [
      {
        id: 'pokemon',
        label: 'Pok\u00E9mon',
        sub: 'Vangen, trainen, vechten',
        emoji: '\u26A1',
        image: '/images/quiz/pokemon.jpg',
        gradient: ['#EF4444', '#DC2626'],
        glow: '239,68,68',
      },
      {
        id: 'mario',
        label: 'Mario',
        sub: 'Platformer, kart, party',
        emoji: '\uD83C\uDF44',
        image: '/images/quiz/mario.jpg',
        gradient: ['#E52521', '#C41E1C'],
        glow: '229,37,33',
      },
      {
        id: 'zelda',
        label: 'Zelda',
        sub: 'Avontuur, puzzels, dungeons',
        emoji: '\uD83D\uDDE1\uFE0F',
        image: '/images/quiz/zelda.jpg',
        gradient: ['#B89B3E', '#7A6B2A'],
        glow: '184,155,62',
      },
      {
        id: 'surprise',
        label: 'Verrass me',
        sub: 'Ik sta open voor alles',
        emoji: '\u2728',
        image: '/images/quiz/surprise.jpg',
        gradient: ['#8B5CF6', '#6D28D9'],
        glow: '139,92,246',
      },
    ],
  },
];

// ─── FRANCHISE KEYWORDS ─────────────────────────────────────

const FRANCHISE_KEYWORDS: Record<string, string[]> = {
  pokemon: ['pok\u00E9mon', 'pokemon', 'pikachu'],
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

      if (answers.genres.length > 0) {
        if (answers.genres.includes(p.genre)) score += 15;
        if (answers.genres.includes('Party') && ['Vecht', 'Sport', 'Race', 'Party'].includes(p.genre)) score += 10;
      }

      if (answers.playStyle === 'solo') {
        if (['RPG', 'Avontuur', 'Platformer', 'Strategie', 'Simulatie', 'Puzzel'].includes(p.genre)) score += 8;
      } else if (answers.playStyle === 'samen') {
        if (['Party', 'Sport', 'Vecht', 'Race'].includes(p.genre)) score += 12;
      }

      if (answers.platforms.length > 0) {
        if (answers.platforms.includes(p.platform)) score += 10;
      }

      if (answers.franchises.length > 0) {
        if (answers.franchises.includes('surprise')) score += Math.random() * 6;
        for (const fId of answers.franchises) {
          const keywords = FRANCHISE_KEYWORDS[fId];
          if (keywords && keywords.some(kw => name.includes(kw))) score += 14;
        }
      }

      if (p.image) score += 2;
      if (p.isPremium) score += 1;
      score += Math.random() * 3;

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(s => s.product);
}

// ─── PARTICLE BURST (on card selection) ─────────────────────

function SelectionBurst({ color, active }: { color: string; active: boolean }) {
  const particles = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return {
        id: i,
        x: Math.cos(angle) * (60 + Math.random() * 40),
        y: Math.sin(angle) * (60 + Math.random() * 40),
        size: 3 + Math.random() * 4,
        delay: Math.random() * 0.15,
      };
    }),
    [],
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

// ─── FLOATING SHAPES (ambient background) ───────────────────

function FloatingShapes({ glowColor }: { glowColor: string }) {
  const shapes = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: `${10 + Math.random() * 80}%`,
    y: `${10 + Math.random() * 80}%`,
    size: 200 + Math.random() * 300,
    duration: 15 + Math.random() * 10,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full blur-[100px]"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            background: `rgba(${glowColor}, 0.04)`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── CONFETTI ───────────────────────────────────────────────

function ConfettiExplosion() {
  const particles = useMemo(
    () => Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 700,
      y: -(Math.random() * 500 + 100),
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.4,
      color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#3b82f6'][
        Math.floor(Math.random() * 7)
      ],
      delay: Math.random() * 0.5,
      w: Math.random() > 0.5 ? 8 : 5,
      h: Math.random() > 0.5 ? 5 : 12,
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
          transition={{ duration: 2.5, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
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

  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const cfg = { stiffness: 250, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), cfg);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), cfg);

  // Cursor spotlight position inside card
  const spotX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), cfg);
  const spotY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), cfg);
  const spotlight = useMotionTemplate`radial-gradient(350px circle at ${spotX}% ${spotY}%, rgba(${option.glow},0.15), transparent 70%)`;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  const handleClick = useCallback(() => {
    setJustSelected(true);
    onToggle();
    setTimeout(() => setJustSelected(false), 600);
  }, [onToggle]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.12 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 800 }}
    >
      <motion.button
        ref={cardRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.96 }}
        className="group relative text-left w-full"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <div
          className={`relative overflow-hidden rounded-2xl h-60 sm:h-72 transition-all duration-500 ${
            selected ? 'shadow-2xl' : 'shadow-lg shadow-black/20'
          }`}
          style={{
            border: selected
              ? `2px solid rgba(${option.glow}, 0.7)`
              : '1px solid rgba(255,255,255,0.06)',
            boxShadow: selected
              ? `0 20px 60px -12px rgba(${option.glow}, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)`
              : undefined,
          }}
        >
          {/* Background image */}
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
            <Image
              src={option.image}
              alt={option.label}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              quality={90}
            />
          </div>

          {/* Color overlay shift on hover */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: selected
                ? `linear-gradient(135deg, ${option.gradient[0]}cc 0%, ${option.gradient[1]}99 50%, transparent 100%)`
                : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)',
            }}
          />

          {/* Interactive cursor spotlight */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: spotlight }}
          />

          {/* Animated gradient border shimmer for selected */}
          {selected && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: `linear-gradient(45deg, transparent 40%, rgba(${option.glow},0.1) 50%, transparent 60%)`,
                backgroundSize: '200% 200%',
              }}
            />
          )}

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Emoji badge floating */}
          <motion.div
            className="absolute top-4 left-4 z-10 text-2xl sm:text-3xl select-none"
            animate={selected ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}
          >
            {option.emoji}
          </motion.div>

          {/* Content at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <motion.h3
              className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              layout
            >
              {option.label}
            </motion.h3>
            <p className="text-sm text-white/60" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {option.sub}
            </p>
          </div>

          {/* Checkmark with spring animation */}
          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={false}
            animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${option.gradient[0]}, ${option.gradient[1]})`,
                boxShadow: `0 4px 15px rgba(${option.glow}, 0.4)`,
              }}
            >
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </motion.div>

          {/* Unselected ring */}
          {!selected && (
            <div className="absolute top-4 right-4 h-8 w-8 rounded-full border-2 border-white/20 backdrop-blur-sm bg-black/10" />
          )}

          {/* Selection particle burst */}
          <SelectionBurst
            color={`rgba(${option.glow}, 0.8)`}
            active={justSelected && selected}
          />
        </div>
      </motion.button>
    </motion.div>
  );
}

// ─── CIRCULAR PROGRESS ──────────────────────────────────────

function CircularProgress({ current, total }: { current: number; total: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = ((current + 1) / total) * circumference;

  return (
    <div className="relative h-12 w-12 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xs font-semibold text-white/60 tabular-nums">
        {current + 1}/{total}
      </span>
    </div>
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
      {/* Ambient glows */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/[0.03] blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

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
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-white/40 uppercase tracking-[0.2em]">
              Jouw perfecte match
            </span>
          </motion.div>
        </motion.div>

        {/* Top pick */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-16"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 blur-3xl opacity-25 scale-150">
              <div className="w-full h-full bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
            </div>
            {/* Rotating ring behind image */}
            <motion.div
              className="absolute inset-[-20px] rounded-full border border-emerald-500/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-[-40px] rounded-full border border-dashed border-cyan-500/5"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="relative w-56 h-56 lg:w-80 lg:h-80"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {topPick.image && (
                <Image
                  src={topPick.image}
                  alt={topPick.name}
                  fill
                  sizes="320px"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/[0.06] text-xs font-medium text-white/50 mb-4">
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
              className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-2xl bg-white/[0.06] border border-white/[0.06] text-white/80 text-sm font-medium hover:bg-white/[0.1] hover:text-white active:scale-[0.97] transition-all duration-300"
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
                    className="group flex flex-col items-center p-5 rounded-2xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all duration-300"
                  >
                    <div className="relative h-28 w-28 mb-3 group-hover:scale-105 transition-transform duration-500">
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
  const [direction, setDirection] = useState<1 | -1>(1);

  const currentQuestion = QUESTIONS[questionIndex];
  const currentSelection = selections[questionIndex];
  const totalQuestions = QUESTIONS.length;

  // Section-level cursor spotlight
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const sectionSpotlight = useMotionTemplate`radial-gradient(600px circle at ${cursorX}px ${cursorY}px, rgba(${currentQuestion?.ambientGlow || '16,185,129'},0.04), transparent 70%)`;

  const handleSectionMouse = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  }, [cursorX, cursorY]);

  const toggleOption = useCallback((optionId: string) => {
    setSelections(prev => {
      const updated = [...prev];
      const current = [...updated[questionIndex]];
      const q = QUESTIONS[questionIndex];

      if (q.multi) {
        const idx = current.indexOf(optionId);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(optionId);
      } else {
        if (current[0] === optionId) current.length = 0;
        else { current.length = 0; current.push(optionId); }
      }
      updated[questionIndex] = current;
      return updated;
    });
  }, [questionIndex]);

  const handleNext = useCallback(() => {
    setDirection(1);
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex(i => i + 1);
    } else {
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
    setDirection(-1);
    if (questionIndex > 0) setQuestionIndex(i => i - 1);
  }, [questionIndex]);

  const handleStart = useCallback(() => setPhase('quiz'), []);

  const restart = useCallback(() => {
    setPhase('intro');
    setQuestionIndex(0);
    setSelections(QUESTIONS.map(() => []));
    setResults([]);
    setDirection(1);
  }, []);

  // Slide variants based on direction
  const slideVariants = {
    enter: { opacity: 0, x: direction > 0 ? 60 : -60, filter: 'blur(4px)' },
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: direction > 0 ? -60 : 60, filter: 'blur(4px)' },
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
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            {/* Ambient glow orbs */}
            <motion.div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[120px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.1, 0.06] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <motion.div
              className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/[0.04] blur-[80px]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />

            {/* Radial fade */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050810_80%)]" />

            <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-10"
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
                {'Game'.split('').map((char, i) => (
                  <motion.span
                    key={`a${i}`}
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <br />
                {'Finder'.split('').map((char, i) => (
                  <motion.span
                    key={`b${i}`}
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, delay: 0.55 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-base text-white/35 max-w-sm mx-auto mb-4"
              >
                Beantwoord 4 snelle vragen over jouw speelstijl en voorkeuren.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm text-white/20 max-w-sm mx-auto mb-12"
              >
                Wij vinden de perfecte game voor jou uit onze collectie.
              </motion.p>

              <motion.button
                onClick={handleStart}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(16,185,129,0.15)' }}
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
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove={handleSectionMouse}
          >
            {/* Animated ambient background that changes per question */}
            <FloatingShapes glowColor={currentQuestion.ambientGlow} />

            {/* Cursor-following spotlight */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: sectionSpotlight }}
            />

            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-16">
              {/* Header row: circular progress + question label */}
              <div className="flex items-center justify-between mb-8">
                <CircularProgress current={questionIndex} total={totalQuestions} />
                <div className="flex items-center gap-3">
                  {Array.from({ length: totalQuestions }, (_, i) => (
                    <motion.div
                      key={i}
                      className="relative h-1 rounded-full overflow-hidden"
                      animate={{ width: i <= questionIndex ? 28 : 8 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div
                        className={`absolute inset-0 rounded-full transition-colors duration-500 ${
                          i < questionIndex
                            ? 'bg-emerald-500'
                            : i === questionIndex
                              ? 'bg-white/40'
                              : 'bg-white/[0.08]'
                        }`}
                      />
                      {i === questionIndex && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                          layoutId="active-bar"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Question text */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
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
              <div className={`grid gap-4 sm:gap-5 mb-10 ${
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
                  className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                    questionIndex === 0
                      ? 'text-white/10 cursor-not-allowed'
                      : 'text-white/30 hover:text-white/60 hover:-translate-x-1'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Vorige
                </button>

                <motion.button
                  onClick={handleNext}
                  disabled={currentSelection.length === 0}
                  whileHover={currentSelection.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={currentSelection.length > 0 ? { scale: 0.97 } : {}}
                  className={`group inline-flex items-center justify-center h-12 px-8 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentSelection.length > 0
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/10 hover:shadow-white/20'
                      : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                  }`}
                >
                  {questionIndex < totalQuestions - 1 ? 'Volgende' : 'Bekijk resultaten'}
                  <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
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
            transition={{ duration: 0.6 }}
          >
            <ResultScreen results={results} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
