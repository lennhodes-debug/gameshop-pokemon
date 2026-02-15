'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllProducts, getAllGenres } from '@/lib/products';

interface GenreShowcaseProps {
  onGenreSelect: (genre: string) => void;
  selectedGenre?: string;
}

// Genre indicators (symbols without emojis)
const GENRE_SYMBOLS: Record<string, string> = {
  'Action': '⚡',
  'RPG': '◆',
  'Adventure': '▲',
  'Puzzle': '□',
  'Strategy': '◆',
  'Sports': '●',
  'Racing': '▶',
  'Shooter': '◀',
  'Fighting': '■',
  'Platformer': '▌',
  'Simulation': '⊙',
  'Party': '◯',
  'Music': '♪',
  'Educational': '❚',
};

export default function GenreShowcase({ onGenreSelect, selectedGenre }: GenreShowcaseProps) {
  const genreStats = useMemo(() => {
    const allProducts = getAllProducts();
    const allGenres = getAllGenres();

    return allGenres
      .map((genre) => {
        const products = allProducts.filter((p) => p.genre === genre);
        return {
          name: genre,
          count: products.length,
          symbol: GENRE_SYMBOLS[genre] || '◯',
        };
      })
      .filter((g) => g.count > 0)
      .sort((a, b) => b.count - a.count);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (index: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.04,
      },
    }),
  } as any;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
          Blader per genre
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {genreStats.reduce((sum, g) => sum + g.count, 0)} producten in {genreStats.length} genres
        </p>
      </div>

      <motion.div
        className="flex flex-wrap gap-2"
        variants={containerVariants}
      >
        {genreStats.map((genre, index) => (
          <motion.button
            key={genre.name}
            variants={itemVariants}
            custom={index}
            initial="hidden"
            animate="visible"
            onClick={() => onGenreSelect(genre.name === selectedGenre ? '' : genre.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all overflow-hidden ${
              genre.name === selectedGenre
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            {/* Animated background on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(16,185,129,0.02))',
              }}
            />

            <span className="relative z-10 flex items-center gap-1.5">
              <span className="text-base font-bold">{genre.symbol}</span>
              <span>{genre.name}</span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                {genre.count}
              </motion.span>
            </span>

            {/* Selection indicator */}
            {genre.name === selectedGenre && (
              <motion.div
                layoutId="active-genre"
                className="absolute inset-0 border-2 border-emerald-500 rounded-lg"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
