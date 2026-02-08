'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

const GAMING_ERAS = [
  {
    year: 1985,
    console: 'NES',
    tagline: '8-bit Magic',
    description: 'De revolutie begint',
    color: 'from-gray-600 to-gray-800',
    icon: '🕹️'
  },
  {
    year: 1990,
    console: 'SNES',
    tagline: '16-bit Revolution',
    description: 'De gouden jaren',
    color: 'from-gray-500 to-gray-700',
    icon: '⚡'
  },
  {
    year: 1996,
    console: 'N64',
    tagline: '3D Unleashed',
    description: 'Polygonenwereld',
    color: 'from-green-500 to-emerald-700',
    icon: '🌟'
  },
  {
    year: 2001,
    console: 'GameCube',
    tagline: 'First Disc Era',
    description: 'Digitale toekomst',
    color: 'from-indigo-500 to-blue-700',
    icon: '💿'
  },
  {
    year: 2006,
    console: 'Wii',
    tagline: 'Motion Control',
    description: 'Fysiek gamen',
    color: 'from-cyan-400 to-sky-600',
    icon: '🎮'
  },
  {
    year: 2017,
    console: 'Switch',
    tagline: 'Hybrid Era',
    description: 'Gaming overal',
    color: 'from-red-500 to-red-700',
    icon: '📱'
  }
];

interface EraCardProps {
  era: typeof GAMING_ERAS[0];
  index: number;
  isActive: boolean;
}

function EraCard({ era, index, isActive }: EraCardProps) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0.5, scale: 0.95 }}
      whileInView={{ opacity: isActive ? 1 : 0.6, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: false }}
    >
      {/* Timeline dot */}
      <motion.div
        className={`w-4 h-4 rounded-full mb-4 transition-all duration-300 ${
          isActive ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-slate-600'
        }`}
        animate={isActive ? { scale: [1, 1.5, 1] } : { scale: 1 }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Era card */}
      <motion.div
        className={`bg-gradient-to-b ${era.color} rounded-lg p-4 w-40 text-center backdrop-blur-sm border border-white/10 cursor-pointer hover:border-white/30 transition-all duration-300`}
        whileHover={{ y: -8, scale: 1.05 }}
        animate={isActive ? { boxShadow: '0 0 20px rgba(16,185,129,0.4)' } : {}}
      >
        <div className="text-4xl mb-2">{era.icon}</div>
        <div className="text-sm font-bold text-white/80 mb-1">{era.year}</div>
        <div className="text-lg font-bold text-white mb-1">{era.console}</div>
        <div className="text-xs text-white/70 italic">{era.tagline}</div>
        <div className="text-xs text-white/60 mt-2">{era.description}</div>
      </motion.div>
    </motion.div>
  );
}

export default function GamingEraTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Calculate which era is in view based on scroll
  const xProgress = useTransform(scrollYProgress, [0, 1], [0, GAMING_ERAS.length]);

  return (
    <section
      ref={containerRef}
      className="relative py-20 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
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

        {/* Timeline */}
        <div className="mb-20">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transform -translate-y-1/2 opacity-30" />

          {/* Era cards - scrollable on mobile, grid on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 place-items-center">
            {GAMING_ERAS.map((era, index) => (
              <EraCard
                key={era.year}
                era={era}
                index={index}
                isActive={Math.abs(index - 2) < 2}
              />
            ))}
          </div>
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
