'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion';
import Link from 'next/link';

const GAMING_ERAS = [
  {
    year: 1985,
    console: 'NES',
    tagline: '8-bit Magic',
    description: 'De revolutie begint',
    color: 'from-gray-600 to-gray-800',
    glowColor: 'rgba(156,163,175,0.4)',
    icon: '🕹️'
  },
  {
    year: 1990,
    console: 'SNES',
    tagline: '16-bit Revolution',
    description: 'De gouden jaren',
    color: 'from-gray-500 to-gray-700',
    glowColor: 'rgba(107,114,128,0.4)',
    icon: '⚡'
  },
  {
    year: 1996,
    console: 'N64',
    tagline: '3D Unleashed',
    description: 'Polygonenwereld',
    color: 'from-green-500 to-emerald-700',
    glowColor: 'rgba(16,185,129,0.5)',
    icon: '🌟'
  },
  {
    year: 2001,
    console: 'GameCube',
    tagline: 'First Disc Era',
    description: 'Digitale toekomst',
    color: 'from-indigo-500 to-blue-700',
    glowColor: 'rgba(99,102,241,0.4)',
    icon: '💿'
  },
  {
    year: 2006,
    console: 'Wii',
    tagline: 'Motion Control',
    description: 'Fysiek gamen',
    color: 'from-cyan-400 to-sky-600',
    glowColor: 'rgba(34,211,238,0.4)',
    icon: '🎮'
  },
  {
    year: 2017,
    console: 'Switch',
    tagline: 'Hybrid Era',
    description: 'Gaming overal',
    color: 'from-red-500 to-red-700',
    glowColor: 'rgba(239,68,68,0.4)',
    icon: '📱'
  }
];

function EraCard({ era, index, progress }: { era: typeof GAMING_ERAS[0]; index: number; progress: number }) {
  // Each card activates at its segment of the scroll
  const segSize = 1 / GAMING_ERAS.length;
  const start = index * segSize;
  const peak = start + segSize * 0.5;
  const end = start + segSize;

  // Calculate activation: 0 = inactive, 1 = fully active
  let activation = 0;
  if (progress >= start && progress <= peak) {
    activation = (progress - start) / (peak - start);
  } else if (progress > peak && progress <= end) {
    activation = 1 - (progress - peak) / (end - peak) * 0.4; // stays at 0.6 min after peak
  } else if (progress > end) {
    activation = 0.6; // already passed — stays visible
  }

  const isActive = activation > 0.5;
  const cardScale = 0.9 + activation * 0.15;
  const cardOpacity = 0.3 + activation * 0.7;

  return (
    <motion.div
      className="flex flex-col items-center"
      style={{
        opacity: cardOpacity,
        scale: cardScale,
      }}
    >
      {/* Timeline dot */}
      <motion.div
        className="w-4 h-4 rounded-full mb-4 transition-all duration-500"
        style={{
          backgroundColor: isActive ? '#34d399' : '#475569',
          boxShadow: isActive ? `0 0 20px ${era.glowColor}` : 'none',
        }}
        animate={isActive ? { scale: [1, 1.5, 1] } : { scale: 1 }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />

      {/* Year connector line */}
      <motion.div
        className="w-0.5 h-6 mb-2 rounded-full transition-all duration-500"
        style={{
          backgroundColor: isActive ? '#34d399' : '#334155',
          scaleY: activation,
        }}
      />

      {/* Era card */}
      <motion.div
        className={`bg-gradient-to-b ${era.color} rounded-xl p-5 w-44 text-center backdrop-blur-sm border transition-all duration-500 cursor-pointer`}
        style={{
          borderColor: isActive ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)',
          boxShadow: isActive ? `0 0 30px ${era.glowColor}, 0 20px 40px rgba(0,0,0,0.3)` : '0 4px 12px rgba(0,0,0,0.2)',
        }}
        whileHover={{ y: -8, scale: 1.05 }}
      >
        <motion.div
          className="text-4xl mb-2"
          animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {era.icon}
        </motion.div>
        <div className="text-2xl font-black text-white mb-0.5">{era.year}</div>
        <div className="text-lg font-bold text-white mb-1">{era.console}</div>
        <div className="text-xs text-white/70 italic font-medium">{era.tagline}</div>
        <motion.div
          className="text-xs text-white/50 mt-2 overflow-hidden"
          style={{ maxHeight: isActive ? 40 : 0, opacity: isActive ? 1 : 0 }}
        >
          {era.description}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function GamingEraTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  // Track progress for era activation
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setCurrentProgress(v);
  });

  // Animated timeline line that grows with scroll
  const lineScaleX = useSpring(
    useTransform(scrollYProgress, [0, 0.9], [0, 1]),
    { stiffness: 100, damping: 30 }
  );

  return (
    <section
      ref={containerRef}
      className="relative py-24 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Gaming Generaties
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Vier decennia van innovatie. Van 8-bit klassiekers tot hybride toekomst.
            Elk moment is een mijlpaal in gaming geschiedenis.
          </p>
        </motion.div>

        {/* Animated timeline line */}
        <div className="relative mb-8 hidden lg:block">
          <div className="h-1 bg-slate-700 rounded-full mx-8" />
          <motion.div
            className="absolute top-0 left-8 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full origin-left"
            style={{ scaleX: lineScaleX, width: 'calc(100% - 4rem)' }}
          />
          {/* Year markers on timeline */}
          {GAMING_ERAS.map((era, i) => {
            const pct = (i / (GAMING_ERAS.length - 1)) * 100;
            const isReached = currentProgress > i / GAMING_ERAS.length;
            return (
              <div
                key={era.year}
                className="absolute -top-2 transition-all duration-300"
                style={{ left: `calc(${pct}% * 0.85 + 7.5%)` }}
              >
                <div className={`text-[10px] font-bold mb-1 text-center transition-colors duration-300 ${isReached ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {era.year}
                </div>
                <div className={`w-3 h-3 rounded-full mx-auto transition-all duration-300 ${isReached ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Era cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4 place-items-center mb-20">
          {GAMING_ERAS.map((era, index) => (
            <EraCard
              key={era.year}
              era={era}
              index={index}
              progress={currentProgress}
            />
          ))}
        </div>

        {/* Storytelling section */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {[
            {
              icon: '📦',
              title: 'Originele Verpakkingen',
              description: 'Alle games in authentieke PAL/EUR boxen - exact zoals ze bedoeld waren.'
            },
            {
              icon: '🌍',
              title: 'Europese Versies',
              description: 'PAL-standaard, Nederlands handleidingen, originele regionale content.'
            },
            {
              icon: '💎',
              title: 'Collector Kwaliteit',
              description: 'Geconditioneerd, compleet in doos. Elk spel is een stukje gaming erfgoed.'
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="glass rounded-lg p-6 border border-white/10 hover:border-emerald-400/50 transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            href="/shop"
            className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
          >
            Begin Je Reis →
          </Link>
          <p className="text-slate-400 mt-4 text-sm">
            {GAMING_ERAS.length} decennia. {GAMING_ERAS.length}00+ klassieke spellen. Jouw nostalgie wacht.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
