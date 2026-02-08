'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import Link from 'next/link';

// Define iconic game series
const ICONIC_SERIES = [
  {
    name: 'The Legend of Zelda',
    icon: '🗡️',
    color: 'from-amber-500 to-orange-600',
    description: 'Een quest die generaties lang duurt',
    highlights: ['Classic', 'Adventure', 'Puzzle']
  },
  {
    name: 'Super Mario',
    icon: '🍄',
    color: 'from-red-500 to-red-700',
    description: 'De iconische plumber springt door generaties',
    highlights: ['Platformer', 'Racing', 'Party']
  },
  {
    name: 'Pokémon',
    icon: '⚡',
    color: 'from-yellow-400 to-red-500',
    description: 'Vang ze allemaal, in elk formaat',
    highlights: ['RPG', 'Adventure', 'Strategy']
  },
  {
    name: 'Kirby',
    icon: '👾',
    color: 'from-pink-400 to-pink-600',
    description: 'De roze held van Dream Land',
    highlights: ['Platformer', 'Adventure', 'Party']
  },
  {
    name: 'Fire Emblem',
    icon: '⚔️',
    color: 'from-blue-500 to-indigo-700',
    description: 'Strategie en verhalen die raken',
    highlights: ['Strategy', 'RPG', 'Tactical']
  },
  {
    name: 'Final Fantasy',
    icon: '✨',
    color: 'from-purple-500 to-pink-600',
    description: 'Epische RPG avonturen vol magie',
    highlights: ['RPG', 'Adventure', 'Classic']
  }
];

export default function GameSeriesShowcase() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-1/3 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '3s' }} />
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
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Legendaire Franchises
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            De series die generaties gepraagd hebben. Nu allemaal collectible in originele PAL-verpakking.
          </p>
        </motion.div>

        {/* Series Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {ICONIC_SERIES.map((series) => (
            <motion.div
              key={series.name}
              variants={itemVariants}
              className={`group relative rounded-lg overflow-hidden cursor-pointer`}
              whileHover={{ scale: 1.05 }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${series.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Card content */}
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-white/10 group-hover:border-white/30 rounded-lg p-6 transition-all duration-300 h-full flex flex-col justify-between">
                {/* Top section */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{series.icon}</div>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-white group-hover:to-white/50 group-hover:bg-clip-text transition-all duration-300">
                    {series.name}
                  </h3>

                  <p className="text-sm text-slate-300 group-hover:text-white/80 transition-colors duration-300 mb-4">
                    {series.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {series.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white transition-all duration-300"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
            href="/shop?filter=series"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50"
          >
            Verken Series →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
