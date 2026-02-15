'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllProducts, getAllPlatforms } from '@/lib/products';

interface CategoryShowcaseProps {
  onPlatformSelect: (platform: string) => void;
  selectedPlatform?: string;
}

export default function CategoryShowcase({ onPlatformSelect, selectedPlatform }: CategoryShowcaseProps) {
  const platformStats = useMemo(() => {
    const allProducts = getAllProducts();
    const allPlatforms = getAllPlatforms();

    return allPlatforms.map((platform) => {
      const products = allProducts.filter((p) => p.platform === platform.name || (platform.name === 'Game Boy (alle)' && p.platform.startsWith('Game Boy')));
      const consoles = products.filter((p) => p.isConsole).length;
      const games = products.filter((p) => !p.isConsole).length;

      return {
        name: platform.name,
        color: platform.color,
        totalCount: products.length,
        consoleCount: consoles,
        gameCount: games,
        emoji: platform.emoji,
      };
    }).sort((a, b) => b.totalCount - a.totalCount);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
          Ontdek platforms
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {platformStats.reduce((sum, p) => sum + p.totalCount, 0)} producten beschikbaar
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {platformStats.map((platform) => (
          <motion.button
            key={platform.name}
            variants={itemVariants}
            onClick={() => onPlatformSelect(platform.name === selectedPlatform ? '' : platform.name)}
            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
              platform.name === selectedPlatform
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-800'
            }`}
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${platform.color}20, ${platform.color}10)`,
              }}
            />

            {/* Glow effect on hover */}
            <motion.div
              className="absolute -inset-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle, ${platform.color}40, transparent)`,
                filter: 'blur(8px)',
                zIndex: -1,
              }}
            />

            <div className="relative z-10">
              {/* Platform emoji/icon */}
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-lg mb-2.5 font-bold"
                style={{
                  background: `${platform.color}20`,
                  border: `1.5px solid ${platform.color}40`,
                }}
              >
                {platform.emoji}
              </div>

              {/* Platform name */}
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white text-left truncate mb-2">
                {platform.name}
              </h3>

              {/* Stats */}
              <div className="space-y-1">
                {platform.totalCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {platform.gameCount > 0 && platform.consoleCount > 0 ? 'Totaal' : platform.gameCount > 0 ? 'Games' : 'Consoles'}
                    </span>
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs font-extrabold text-slate-900 dark:text-white"
                      style={{ color: platform.color }}
                    >
                      {platform.totalCount}
                    </motion.span>
                  </div>
                )}

                {/* Breakdown if we have both games and consoles */}
                {platform.gameCount > 0 && platform.consoleCount > 0 && (
                  <div className="flex items-center text-[9px] text-slate-400 dark:text-slate-500 gap-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>{platform.gameCount} games</span>
                    <span>•</span>
                    <span>{platform.consoleCount} cons.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Selection indicator */}
            {platform.name === selectedPlatform && (
              <motion.div
                layoutId="active-platform"
                className="absolute inset-0 border-2 border-emerald-500 rounded-2xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
