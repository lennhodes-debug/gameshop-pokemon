'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';

interface CollectibleItem {
  icon: string;
  title: string;
  description: string;
  valueNum: number;
  valueSuffix: string;
  color: string;
  glowColor: string;
  level: string;
}

const COLLECTIBLES: CollectibleItem[] = [
  {
    icon: '🎮',
    title: 'Losse Cartridge',
    description: 'Pure gameplay — het hart van elke collectie. Getest en werkend.',
    valueNum: 0,
    valueSuffix: 'Basis waarde',
    color: 'from-emerald-400 to-green-600',
    glowColor: 'rgba(52,211,153,0.3)',
    level: 'Level 1',
  },
  {
    icon: '📦',
    title: 'Compleet in Doos (CIB)',
    description: 'Originele verpakking met handleiding — het gouden standaard van collectors.',
    valueNum: 40,
    valueSuffix: '% meer waarde',
    color: 'from-amber-400 to-amber-600',
    glowColor: 'rgba(251,191,36,0.3)',
    level: 'Level 2',
  },
  {
    icon: '🌍',
    title: 'PAL/EUR Region',
    description: 'Europese versies — origineel, Nederlands, zeldzamer dan NTSC.',
    valueNum: 20,
    valueSuffix: '% rarity bonus',
    color: 'from-blue-400 to-indigo-600',
    glowColor: 'rgba(96,165,250,0.3)',
    level: 'Level 3',
  },
  {
    icon: '✨',
    title: 'Pristine Condition',
    description: 'Zo goed als nieuw — geen krassen, geen slijtage, collector-grade.',
    valueNum: 30,
    valueSuffix: '% premium',
    color: 'from-purple-400 to-pink-600',
    glowColor: 'rgba(192,132,252,0.3)',
    level: 'Level 4',
  },
];

function AnimatedValue({ target, suffix, isVisible }: { target: number; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible || target === 0) return;
    const duration = 1200;
    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [isVisible, target]);

  if (target === 0) return <span className="text-emerald-300 font-bold">{suffix}</span>;
  return <span className="text-amber-300 font-bold">+{count}{suffix}</span>;
}

function CollectibleCard({ item, index, activation }: { item: CollectibleItem; index: number; activation: number }) {
  const isActive = activation > 0.3;
  const isFullyActive = activation > 0.7;

  return (
    <motion.div
      className="relative"
      style={{
        opacity: 0.2 + activation * 0.8,
        scale: 0.92 + activation * 0.08,
      }}
    >
      {/* Connecting line from previous card */}
      {index > 0 && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 origin-top"
          style={{
            scaleY: activation,
            background: `linear-gradient(to bottom, ${item.glowColor}, transparent)`,
          }}
        />
      )}

      {/* Level badge */}
      <motion.div
        className="absolute -top-3 left-6 z-10"
        style={{
          opacity: activation,
          scale: 0.8 + activation * 0.2,
        }}
      >
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gradient-to-r ${item.color} text-white`}>
          {item.level}
        </span>
      </motion.div>

      {/* Card */}
      <motion.div
        className={`relative rounded-xl overflow-hidden border transition-all duration-700 ${
          isActive
            ? 'border-white/20 bg-slate-800/60 backdrop-blur-sm'
            : 'border-slate-700/50 bg-slate-800/30'
        }`}
        style={{
          boxShadow: isFullyActive ? `0 0 40px ${item.glowColor}, 0 20px 60px rgba(0,0,0,0.3)` : '0 4px 12px rgba(0,0,0,0.2)',
        }}
        whileHover={{ y: -4, scale: 1.02 }}
      >
        {/* Background gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${item.color} transition-opacity duration-700`}
          style={{ opacity: isActive ? 0.08 : 0 }}
        />

        {/* Content */}
        <div className="relative p-6 flex items-start gap-5">
          {/* Icon with glow */}
          <motion.div
            className="relative flex-shrink-0"
            animate={isFullyActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-5xl block">{item.icon}</span>
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: item.glowColor }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1.5 }}
              />
            )}
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1.5">{item.title}</h3>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">{item.description}</p>

            {/* Animated value badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <AnimatedValue target={item.valueNum} suffix={item.valueSuffix} isVisible={isActive} />
            </div>
          </div>

          {/* Unlock indicator */}
          <motion.div
            className="flex-shrink-0 mt-1"
            style={{ opacity: activation }}
          >
            {isFullyActive ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
            )}
          </motion.div>
        </div>

        {/* Progress bar at bottom */}
        <motion.div
          className={`h-0.5 bg-gradient-to-r ${item.color}`}
          style={{ scaleX: activation, transformOrigin: 'left' }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function CollectibleShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.7', 'end 0.3'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setProgress(v);
  });

  // Progress path line
  const pathProgress = useSpring(
    useTransform(scrollYProgress, [0, 0.9], [0, 1]),
    { stiffness: 80, damping: 25 }
  );

  return (
    <section
      ref={containerRef}
      className="relative py-24 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            Collector's Journey
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              Waarde Opbouwen
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Elke stap verhoogt de waarde van je collectie. Scroll en ontdek de niveaus.
          </p>
        </motion.div>

        {/* Vertical progress line (desktop only) */}
        <div className="absolute left-4 lg:left-8 top-[200px] bottom-[200px] w-0.5 bg-slate-700/50 hidden md:block">
          <motion.div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-400 via-amber-400 to-purple-400 origin-top rounded-full"
            style={{ scaleY: pathProgress, height: '100%' }}
          />
        </div>

        {/* Cards stack */}
        <div className="flex flex-col gap-8 md:pl-12 lg:pl-16">
          {COLLECTIBLES.map((item, index) => {
            const segSize = 1 / COLLECTIBLES.length;
            const start = index * segSize;
            const peak = start + segSize * 0.6;
            let activation = 0;
            if (progress >= start && progress <= peak) {
              activation = (progress - start) / (peak - start);
            } else if (progress > peak) {
              activation = 1;
            }

            return (
              <CollectibleCard
                key={index}
                item={item}
                index={index}
                activation={Math.min(activation, 1)}
              />
            );
          })}
        </div>

        {/* Summary */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-slate-800 to-slate-900 border border-amber-400/20 rounded-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-3">Waarom dit uitmaakt</h3>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Dit zijn niet zomaar games — dit zijn stukjes Nintendo-erfgoed. Elke cartridge of disc vertegenwoordigt jaren van innovatie. We beschouwen elke aankoop als een investering in gaming geschiedenis.
          </p>
          <div className="mt-6 text-amber-300 font-semibold">
            100% authentieke PAL/EUR versies met geverifieerde herkomst
          </div>
        </motion.div>
      </div>
    </section>
  );
}
