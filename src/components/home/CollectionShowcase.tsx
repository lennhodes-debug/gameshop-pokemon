'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/* ================================================================
   COLLECTION SHOWCASE — Cinematische 3D game collectie presentatie
   Draait automatisch door een spotlight reel van alle games,
   als een premium showroom / museum vitrine.
   ================================================================ */

interface ShowcaseItem {
  image: string;
  name: string;
  platform: string;
  accent: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  // Game Boy
  { image: '/images/products/gb-001-pokemon-trading-card-game.webp', name: 'Pokemon Trading Card Game', platform: 'Game Boy', accent: '#9BBC0F' },
  // GBA
  { image: '/images/products/gba-001-pokemon-emerald.webp', name: 'Pokemon Emerald', platform: 'Game Boy Advance', accent: '#10B981' },
  { image: '/images/products/gba-004-pokemon-firered-usa.webp', name: 'Pokemon FireRed', platform: 'Game Boy Advance', accent: '#EF4444' },
  { image: '/images/products/gba-006-pokemon-leafgreen-usa.webp', name: 'Pokemon LeafGreen', platform: 'Game Boy Advance', accent: '#22C55E' },
  // DS
  { image: '/images/products/ds-001-pokemon-platinum.webp', name: 'Pokemon Platinum', platform: 'Nintendo DS', accent: '#94A3B8' },
  { image: '/images/products/ds-002-pokemon-soulsilver.webp', name: 'Pokemon SoulSilver', platform: 'Nintendo DS', accent: '#C0C0C0' },
  { image: '/images/products/ds-003-pokemon-heartgold.webp', name: 'Pokemon HeartGold', platform: 'Nintendo DS', accent: '#F59E0B' },
  { image: '/images/products/ds-005-pokemon-black.webp', name: 'Pokemon Black', platform: 'Nintendo DS', accent: '#475569' },
  { image: '/images/products/ds-006-pokemon-white.webp', name: 'Pokemon White', platform: 'Nintendo DS', accent: '#E2E8F0' },
  // 3DS
  { image: '/images/products/3ds-001-pokemon-x.webp', name: 'Pokemon X', platform: 'Nintendo 3DS', accent: '#3B82F6' },
  { image: '/images/products/3ds-002-pokemon-omega-ruby.webp', name: 'Pokemon Omega Ruby', platform: 'Nintendo 3DS', accent: '#DC2626' },
  { image: '/images/products/3ds-004-pokemon-moon.webp', name: 'Pokemon Moon', platform: 'Nintendo 3DS', accent: '#7C3AED' },
];

const ROTATION_INTERVAL = 4000;

/* ================================================================
   SPOTLIGHT CARD — Groot centraal item met glow + reflectie
   ================================================================ */
function SpotlightCard({ item }: { item: ShowcaseItem }) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient glow achter de kaart */}
      <div
        className="absolute -inset-20 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${item.accent}40, transparent 70%)`,
        }}
      />

      {/* Game box */}
      <div className="relative group" style={{ perspective: 800 }}>
        <motion.div
          className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden"
          style={{
            boxShadow: `
              0 40px 80px -20px rgba(0,0,0,0.9),
              0 0 60px -15px ${item.accent}30,
              0 0 100px -30px ${item.accent}15
            `,
          }}
          whileHover={{ rotateY: 5, rotateX: -3, scale: 1.02 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
            className="object-cover"
            priority
          />
          {/* Glans sweep */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
            }}
            initial={{ x: '-150%' }}
            animate={{ x: '150%' }}
            transition={{ duration: 3, delay: 0.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.06]" />
        </motion.div>

        {/* Reflectie */}
        <div className="relative w-48 h-16 sm:w-56 sm:h-20 md:w-64 md:h-24 lg:w-72 lg:h-28 mx-auto mt-2 overflow-hidden rounded-b-2xl opacity-20 pointer-events-none"
          style={{
            transform: 'scaleY(-1) perspective(800px) rotateX(20deg)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 80%)',
          }}
        >
          <Image
            src={item.image}
            alt=""
            fill
            sizes="288px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Naam en platform */}
      <motion.div
        className="text-center mt-6 sm:mt-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          {item.name}
        </h3>
        <span
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: `${item.accent}99` }}
        >
          {item.platform}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================
   MINI THUMBNAIL RAIL — Kleine thumbnails links en rechts
   ================================================================ */
function ThumbnailRail({
  items,
  currentIndex,
  onSelect,
}: {
  items: ShowcaseItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="hidden lg:flex flex-col gap-3 justify-center">
      {items.map((item, i) => {
        const isActive = i === currentIndex;
        const distance = Math.abs(i - currentIndex);
        const isNear = distance <= 3;

        if (!isNear) return null;

        return (
          <motion.button
            key={item.name}
            onClick={() => onSelect(i)}
            className="relative rounded-xl overflow-hidden transition-all duration-300"
            style={{
              width: isActive ? 64 : 48,
              height: isActive ? 64 : 48,
              opacity: isActive ? 1 : 0.4,
              border: isActive ? `2px solid ${item.accent}60` : '2px solid transparent',
              boxShadow: isActive ? `0 0 20px ${item.accent}20` : 'none',
            }}
            whileHover={{ opacity: 0.8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            layout
          >
            <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
          </motion.button>
        );
      })}
    </div>
  );
}

/* ================================================================
   PROGRESS DOTS
   ================================================================ */
function ProgressDots({
  total,
  current,
  accent,
}: {
  total: number;
  current: number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === current ? 24 : 6,
            height: 6,
            backgroundColor: i === current ? accent : 'rgba(255,255,255,0.1)',
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function CollectionShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: '-20%' });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentItem = useMemo(() => SHOWCASE_ITEMS[activeIndex], [activeIndex]);

  // Auto-rotatie
  useEffect(() => {
    if (!isInView || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, ROTATION_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInView, isPaused]);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    // Hervat na 8 sec
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#050810] overflow-hidden py-20 sm:py-28 lg:py-36"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Achtergrond effecten */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#08101d] to-[#050810]" />
        <motion.div
          className="absolute inset-0 transition-colors duration-1000"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${currentItem.accent}08, transparent 70%)`,
          }}
        />
        {/* Subtiele grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/40 block mb-4">
            Onze collectie
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Premium{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Pokemon
            </span>{' '}
            games
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/30 max-w-md mx-auto">
            Elk exemplaar persoonlijk getest en gefotografeerd
          </p>
        </motion.div>
      </div>

      {/* Showcase area */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-8 lg:gap-16">
          {/* Linker thumbnails */}
          <ThumbnailRail
            items={SHOWCASE_ITEMS}
            currentIndex={activeIndex}
            onSelect={handleSelect}
          />

          {/* Centraal spotlight */}
          <div className="relative min-h-[420px] sm:min-h-[500px] md:min-h-[560px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <SpotlightCard key={activeIndex} item={currentItem} />
            </AnimatePresence>
          </div>

          {/* Rechter thumbnails (gespiegeld) */}
          <ThumbnailRail
            items={SHOWCASE_ITEMS}
            currentIndex={activeIndex}
            onSelect={handleSelect}
          />
        </div>

        {/* Progress */}
        <div className="flex justify-center mt-8 sm:mt-12">
          <ProgressDots
            total={SHOWCASE_ITEMS.length}
            current={activeIndex}
            accent={currentItem.accent}
          />
        </div>

        {/* Item counter */}
        <div className="flex justify-center mt-4">
          <span className="font-mono text-[10px] text-white/15 tracking-widest">
            {String(activeIndex + 1).padStart(2, '0')} / {String(SHOWCASE_ITEMS.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Overgang gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
