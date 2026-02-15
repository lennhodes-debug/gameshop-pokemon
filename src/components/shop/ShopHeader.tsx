'use client';

import { motion, Variants } from 'framer-motion';

interface ShopHeaderProps {
  resultCount: number;
  isSearching: boolean;
}

export default function ShopHeader({ resultCount, isSearching }: ShopHeaderProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-12"
    >
      {/* Premium gradient background */}
      <div className="absolute inset-0 -top-20 -left-1/4 w-1/2 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute inset-0 -bottom-20 -right-1/4 w-1/2 h-64 bg-gradient-to-tl from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />

      <div className="relative">
        {/* Main heading */}
        <div className="mb-6">
          <motion.h1
            className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-3 tracking-tight"
            variants={textVariants}
            custom={0}
          >
            Shop
          </motion.h1>

          <motion.p
            className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl"
            variants={textVariants}
            custom={1}
          >
            Ontdek onze collectie van originele Pokémon games en Nintendo hardware.
            Alles is persoonlijk getest en authenticated.
          </motion.p>
        </div>

        {/* Stats bar */}
        <motion.div
          className="flex flex-wrap items-center gap-4 sm:gap-6"
          variants={textVariants}
          custom={2}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg blur opacity-50" />
              <div className="relative px-4 py-2 bg-slate-900 dark:bg-slate-950 rounded-lg">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                  {resultCount}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Producten</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                In cataloogus
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 border-2 border-white dark:border-slate-800"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}
                />
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">3000+ Klanten</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Tevreden⭐⭐⭐⭐⭐
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
