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

interface QuizOption {
  label: string;
  description: string;
  image?: string;
  examples: string[];
  tags: string[];
}

interface QuizQuestion {
  title: string;
  subtitle: string;
  options: QuizOption[];
}

// ─── QUIZ VRAGEN ────────────────────────────────────────────

const QUESTIONS: QuizQuestion[] = [
  {
    title: 'Wat voor soort avontuur zoek je?',
    subtitle: 'Kies wat je het meest aanspreekt',
    options: [
      {
        label: 'Episch verhaal',
        description: 'Uren verdwijnen in een wereld vol lore, personages en quests',
        examples: ['Pokémon', 'Zelda', 'Fire Emblem'],
        tags: ['RPG', 'Avontuur'],
      },
      {
        label: 'Snelle actie',
        description: 'Reflexen testen, vijanden verslaan, levels clearen',
        examples: ['Mario', 'Metroid', 'Kirby'],
        tags: ['Platformer', 'Actie'],
      },
      {
        label: 'Competitief',
        description: 'Races winnen, vechten tegen vrienden, high scores breken',
        examples: ['Mario Kart', 'Smash Bros', 'Wii Sports'],
        tags: ['Race', 'Vecht', 'Sport'],
      },
      {
        label: 'Chill & casual',
        description: 'Ontspannen gameplay, puzzels oplossen, je eigen tempo',
        examples: ['Animal Crossing', 'Professor Layton', 'Nintendogs'],
        tags: ['Simulatie', 'Puzzel', 'Party'],
      },
    ],
  },
  {
    title: 'Welk platform spreekt je aan?',
    subtitle: 'Of waar heb je een console van?',
    options: [
      {
        label: 'Handheld klassiek',
        description: 'Game Boy, GBA — de roots van Nintendo handheld gaming',
        examples: ['Pokémon Red', 'Pokémon Emerald', 'Zelda: Minish Cap'],
        tags: ['Game Boy Advance', 'Game Boy / Color'],
      },
      {
        label: 'Dual screen',
        description: 'Nintendo DS & 3DS — twee schermen, eindeloze mogelijkheden',
        examples: ['Pokémon HeartGold', 'Mario Kart DS', 'Zelda: OoT 3D'],
        tags: ['Nintendo DS', 'Nintendo 3DS'],
      },
      {
        label: 'Woonkamer',
        description: 'Wii & Wii U — samen spelen op het grote scherm',
        examples: ['Mario Kart Wii', 'Smash Bros', 'Zelda: Twilight Princess'],
        tags: ['Wii', 'Wii U'],
      },
      {
        label: 'Maakt niet uit',
        description: 'Ik sta open voor alles — verrras me!',
        examples: ['Alle platforms'],
        tags: [],
      },
    ],
  },
  {
    title: 'Hoeveel wil je uitgeven?',
    subtitle: 'We vinden altijd iets moois binnen je budget',
    options: [
      {
        label: 'Budget friendly',
        description: 'Leuke games zonder de portemonnee te breken',
        examples: ['Veel keuze onder €15'],
        tags: ['budget'],
      },
      {
        label: 'Midden range',
        description: 'De sweet spot — kwaliteit voor een eerlijke prijs',
        examples: ['€15 - €35 range'],
        tags: ['mid'],
      },
      {
        label: 'Premium titels',
        description: 'De grote klassiekers en zeldzame exemplaren',
        examples: ['Pokémon HeartGold', 'Zelda collectie'],
        tags: ['premium'],
      },
      {
        label: 'Maakt niet uit',
        description: 'Prijs is geen issue — ik wil de beste match',
        examples: ['Alle prijsklassen'],
        tags: [],
      },
    ],
  },
  {
    title: 'Hoe wil je je game ontvangen?',
    subtitle: 'Compleet in doos of losse cartridge?',
    options: [
      {
        label: 'Compleet in doos',
        description: 'Met originele doos, boekje — voor de verzamelaar',
        examples: ['CIB = Complete in Box'],
        tags: ['cib'],
      },
      {
        label: 'Losse cartridge',
        description: 'Gewoon de game — plug in en spelen',
        examples: ['Goedkoper, direct speelbaar'],
        tags: ['los'],
      },
      {
        label: 'Maakt niet uit',
        description: 'Als de game maar werkt!',
        examples: ['Beide opties'],
        tags: [],
      },
    ],
  },
];

// ─── MATCHING ENGINE ────────────────────────────────────────

function matchProducts(answers: number[], products: Product[]): Product[] {
  const genreTags = QUESTIONS[0].options[answers[0]]?.tags || [];
  const platformTags = QUESTIONS[1].options[answers[1]]?.tags || [];
  const priceTags = QUESTIONS[2].options[answers[2]]?.tags || [];
  const complTags = QUESTIONS[3].options[answers[3]]?.tags || [];

  const scored = products
    .filter(p => !!p.image && !p.isConsole)
    .map(p => {
      let score = 0;

      // Genre match
      if (genreTags.length > 0 && genreTags.includes(p.genre)) score += 10;
      // Partial genre match (avontuur-achtig)
      if (genreTags.includes('RPG') && p.genre === 'Avontuur') score += 5;
      if (genreTags.includes('Avontuur') && p.genre === 'RPG') score += 5;
      if (genreTags.includes('Platformer') && p.genre === 'Actie') score += 4;
      if (genreTags.includes('Actie') && p.genre === 'Platformer') score += 4;

      // Platform match
      if (platformTags.length > 0 && platformTags.includes(p.platform)) score += 8;
      if (platformTags.length === 0) score += 3; // "maakt niet uit" = bonus voor alles

      // Price match
      const price = getEffectivePrice(p);
      if (priceTags.includes('budget') && price < 15) score += 6;
      if (priceTags.includes('mid') && price >= 15 && price <= 35) score += 6;
      if (priceTags.includes('premium') && price > 35) score += 6;
      if (priceTags.length === 0) score += 2; // "maakt niet uit"

      // Completeness match
      const isCIB = p.completeness.toLowerCase().includes('compleet');
      if (complTags.includes('cib') && isCIB) score += 4;
      if (complTags.includes('los') && !isCIB) score += 4;
      if (complTags.length === 0) score += 1;

      // Bonus for premium/popular items
      if (p.isPremium) score += 1;

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 12).map(s => s.product);
}

// ─── CONFETTI ───────────────────────────────────────────────

function ConfettiExplosion() {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 500,
      y: -(Math.random() * 350 + 100),
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.4,
      color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.3,
      w: Math.random() > 0.5 ? 8 : 4,
      h: Math.random() > 0.5 ? 4 : 8,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/3 rounded-sm"
          style={{ width: p.w, height: p.h, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotation, scale: p.scale, opacity: [1, 1, 0] }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

// ─── QUIZ OPTION CARD ───────────────────────────────────────

function OptionCard({ option, index, onPick, gameImages }: {
  option: QuizOption;
  index: number;
  onPick: () => void;
  gameImages: string[];
}) {
  const colors = [
    { bg: 'from-emerald-500 to-teal-600', glow: '16, 185, 129' },
    { bg: 'from-cyan-500 to-blue-600', glow: '6, 182, 212' },
    { bg: 'from-amber-500 to-orange-600', glow: '245, 158, 11' },
    { bg: 'from-violet-500 to-purple-600', glow: '139, 92, 246' },
  ];
  const color = colors[index % colors.length];

  return (
    <motion.button
      onClick={onPick}
      className="group relative text-left w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 lg:p-8 overflow-hidden h-full">
        {/* Glow on hover */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ boxShadow: `inset 0 0 40px rgba(${color.glow}, 0.08), 0 0 30px rgba(${color.glow}, 0.08)` }}
        />

        {/* Subtle gradient overlay */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Example game images */}
        {gameImages.length > 0 && (
          <div className="flex gap-2 mb-5">
            {gameImages.slice(0, 3).map((img, i) => (
              <motion.div
                key={i}
                className="relative h-16 w-16 rounded-xl overflow-hidden bg-white/5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.08 + i * 0.05 }}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Label */}
        <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">
          {option.label}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/40 leading-relaxed mb-4">
          {option.description}
        </p>

        {/* Examples */}
        <div className="flex flex-wrap gap-1.5">
          {option.examples.map((ex, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-[11px] text-white/50 font-medium"
            >
              {ex}
            </span>
          ))}
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <svg className="h-3.5 w-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}

// ─── RESULT SCREEN ──────────────────────────────────────────

function ResultScreen({ results, onRestart }: {
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
    addToast(`${product.name} toegevoegd aan winkelwagen`, 'success', undefined, product.image || undefined);
  };

  return (
    <div className="relative min-h-screen bg-[#050810] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10),transparent_50%)]" />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {showConfetti && <ConfettiExplosion />}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-20">
        {/* Top pick */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs font-medium text-emerald-400 uppercase tracking-[0.3em] mb-6"
          >
            Onze #1 aanbeveling voor jou
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 blur-3xl opacity-20">
              <div className="w-full h-full bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
            </div>
            <motion.div
              className="relative w-52 h-52 lg:w-64 lg:h-64 mx-auto"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {topPick.image && (
                <Image
                  src={topPick.image}
                  alt={topPick.name}
                  fill
                  sizes="256px"
                  className="object-contain drop-shadow-[0_20px_50px_rgba(16,185,129,0.25)]"
                  priority
                />
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-white/50 mb-3">
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
              <p className="text-sm text-white/40 max-w-lg mx-auto leading-relaxed mb-8">
                {topPick.description}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
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
            transition={{ delay: 1 }}
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

            <p className="text-xs font-medium text-white/30 uppercase tracking-[0.2em] text-center mb-8">
              Meer aanbevelingen op basis van jouw voorkeuren
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((p, i) => (
                <motion.div
                  key={p.sku}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.06 }}
                >
                  <Link
                    href={`/shop/${p.sku}`}
                    className="group flex flex-col items-center p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <div className="relative h-24 w-24 mb-3 group-hover:scale-105 transition-transform duration-300">
                      {p.image && (
                        <Image src={p.image} alt={p.name} fill sizes="96px" className="object-contain" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/30 mb-1">
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
          transition={{ delay: 1.5 }}
          className="mt-16 text-center"
        >
          <button
            onClick={onRestart}
            className="text-sm text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Opnieuw beginnen
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────

export default function GameFinderPage() {
  const allProducts = useMemo(() => getAllProducts(), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<Product[]>([]);

  // Zoek voorbeeld-images per optie
  const questionImages = useMemo(() => {
    return QUESTIONS.map(q =>
      q.options.map(opt => {
        const matching = allProducts.filter(p => {
          if (!p.image || p.isConsole) return false;
          // Match op genre tags
          if (opt.tags.some(t => t === p.genre)) return true;
          // Match op platform tags
          if (opt.tags.some(t => t === p.platform)) return true;
          // Match op naam keywords
          return opt.examples.some(ex =>
            p.name.toLowerCase().includes(ex.toLowerCase())
          );
        });
        const shuffled = [...matching].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3).map(p => p.image!);
      })
    );
  }, [allProducts]);

  const handleAnswer = useCallback((optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion + 1 >= QUESTIONS.length) {
      // Quiz klaar — bereken resultaten
      const matched = matchProducts(newAnswers, allProducts);
      setResults(matched);
      setPhase('result');
    } else {
      setCurrentQuestion(q => q + 1);
    }
  }, [answers, currentQuestion, allProducts]);

  const restart = useCallback(() => {
    setPhase('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setResults([]);
  }, []);

  const progress = (currentQuestion / QUESTIONS.length) * 100;

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
            <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_50%)]" />

            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />

            {/* Floating preview images */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {allProducts.filter(p => p.image && !p.isConsole).sort(() => Math.random() - 0.5).slice(0, 8).map((p, i) => {
                const positions = [
                  { left: '8%', top: '15%' }, { right: '10%', top: '20%' },
                  { left: '5%', bottom: '25%' }, { right: '7%', bottom: '30%' },
                  { left: '15%', top: '60%' }, { right: '15%', top: '45%' },
                  { left: '20%', bottom: '15%' }, { right: '20%', bottom: '20%' },
                ];
                const pos = positions[i];
                return (
                  <motion.div
                    key={p.sku}
                    className="absolute w-16 h-16 lg:w-20 lg:h-20"
                    style={pos}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.06, 0.12, 0.06],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                  >
                    <Image src={p.image!} alt="" fill sizes="80px" className="object-contain" aria-hidden />
                  </motion.div>
                );
              })}
            </div>

            <div className="relative z-10 text-center px-4">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10, stiffness: 120 }}
                className="mb-8"
              >
                <motion.span
                  className="text-7xl lg:text-8xl select-none block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🎯
                </motion.span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] text-emerald-400 text-[11px] font-medium uppercase tracking-[0.2em] mb-8"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Persoonlijk advies in 4 vragen
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
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
                Beantwoord 4 korte vragen over je voorkeuren en wij matchen je met de perfecte game uit onze collectie.
              </motion.p>

              <motion.button
                onClick={() => setPhase('quiz')}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-300"
              >
                Vind mijn game
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
                  { num: '4', label: 'Vragen' },
                  { num: String(allProducts.filter(p => p.image && !p.isConsole).length) + '+', label: 'Games' },
                  { num: '1', label: 'Perfect match' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    <span className="text-lg font-semibold text-white/50 tabular-nums">{item.num}</span>
                    <span className="uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── QUIZ ──────────────────────────────── */}
        {phase === 'quiz' && (
          <motion.div
            key={`quiz-${currentQuestion}`}
            className="relative min-h-screen bg-[#050810] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_60%)]" />
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-16">
              {/* Progress */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-white/30 uppercase tracking-[0.15em]">
                    Vraag {currentQuestion + 1} van {QUESTIONS.length}
                  </span>
                  <span className="text-[11px] text-white/20 tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    initial={{ width: `${((currentQuestion - 1) / QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <h1 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-3">
                  {QUESTIONS[currentQuestion].title}
                </h1>
                <p className="text-sm text-white/30">
                  {QUESTIONS[currentQuestion].subtitle}
                </p>
              </motion.div>

              {/* Options */}
              <div className={`grid gap-4 ${
                QUESTIONS[currentQuestion].options.length <= 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                <AnimatePresence mode="wait">
                  {QUESTIONS[currentQuestion].options.map((option, i) => (
                    <OptionCard
                      key={`${currentQuestion}-${i}`}
                      option={option}
                      index={i}
                      onPick={() => handleAnswer(i)}
                      gameImages={questionImages[currentQuestion]?.[i] || []}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Back button */}
              {currentQuestion > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    setCurrentQuestion(q => q - 1);
                    setAnswers(a => a.slice(0, -1));
                  }}
                  className="mt-8 mx-auto flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Vorige vraag
                </motion.button>
              )}
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
