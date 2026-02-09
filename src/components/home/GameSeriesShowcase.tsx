'use client';

import { useRef, useCallback, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import Link from 'next/link';

const ICONIC_SERIES = [
  {
    name: 'The Legend of Zelda',
    icon: '🗡️',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245,158,11,0.15)',
    description: 'Een quest die generaties lang duurt',
    highlights: ['Classic', 'Adventure', 'Puzzle'],
  },
  {
    name: 'Super Mario',
    icon: '🍄',
    color: 'from-red-500 to-red-700',
    glowColor: 'rgba(239,68,68,0.15)',
    description: 'De iconische plumber springt door generaties',
    highlights: ['Platformer', 'Racing', 'Party'],
  },
  {
    name: 'Pokémon',
    icon: '⚡',
    color: 'from-yellow-400 to-red-500',
    glowColor: 'rgba(250,204,21,0.15)',
    description: 'Vang ze allemaal, in elk formaat',
    highlights: ['RPG', 'Adventure', 'Strategy'],
  },
  {
    name: 'Kirby',
    icon: '👾',
    color: 'from-pink-400 to-pink-600',
    glowColor: 'rgba(244,114,182,0.15)',
    description: 'De roze held van Dream Land',
    highlights: ['Platformer', 'Adventure', 'Party'],
  },
  {
    name: 'Fire Emblem',
    icon: '⚔️',
    color: 'from-blue-500 to-indigo-700',
    glowColor: 'rgba(99,102,241,0.15)',
    description: 'Strategie en verhalen die raken',
    highlights: ['Strategy', 'RPG', 'Tactical'],
  },
  {
    name: 'Final Fantasy',
    icon: '✨',
    color: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(168,85,247,0.15)',
    description: 'Epische RPG avonturen vol magie',
    highlights: ['RPG', 'Adventure', 'Classic'],
  },
];

function SeriesCard({ series, index }: { series: typeof ICONIC_SERIES[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const spotlightX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotlightY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotlightBg = useMotionTemplate`radial-gradient(300px circle at ${spotlightX}% ${spotlightY}%, ${series.glowColor}, transparent 60%)`;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  // Alternating parallax offset
  const parallaxOffset = index % 2 === 0 ? -20 : 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
        className="group relative rounded-xl overflow-hidden cursor-pointer"
        whileHover={{ y: parallaxOffset / 3, scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Spotlight following cursor */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-xl"
            style={{ background: spotlightBg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Background gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${series.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Card content */}
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-white/10 group-hover:border-white/30 rounded-xl p-6 transition-all duration-500 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className="text-5xl"
                animate={isHovered ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.6 }}
              >
                {series.icon}
              </motion.div>
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                initial={{ scale: 0, opacity: 0 }}
                animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 transition-all duration-300">
              {series.name}
            </h3>

            <p className="text-sm text-slate-300 group-hover:text-white/80 transition-colors duration-300 mb-4">
              {series.description}
            </p>
          </div>

          {/* Staggered tags */}
          <div className="flex flex-wrap gap-2">
            {series.highlights.map((highlight, i) => (
              <motion.span
                key={highlight}
                className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white transition-all duration-300"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              >
                {highlight}
              </motion.span>
            ))}
          </div>

          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GameSeriesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section ref={sectionRef} className="relative py-24 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Parallax background effects */}
      <motion.div className="absolute inset-0 opacity-20 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-10 left-1/3 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '3s' }} />
      </motion.div>

      <div className="relative max-w-7xl mx-auto">
        {/* Title */}
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
            className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            6 Franchises
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Legendaire Franchises
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            De series die generaties hebben gevormd. Nu allemaal collectible in originele PAL-verpakking.
          </p>
        </motion.div>

        {/* Series Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {ICONIC_SERIES.map((series, index) => (
            <SeriesCard key={series.name} series={series} index={index} />
          ))}
        </div>

        {/* Collections CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-300 mb-4">
            Elke franchise kan volledig verzameld worden in originele PAL/EUR versies
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50"
          >
            Verken Series
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
