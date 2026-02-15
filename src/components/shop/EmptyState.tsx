'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface EmptyStateProps {
  searchQuery?: string;
  filterCount?: number;
  onClearFilters?: () => void;
}

export default function EmptyState({
  searchQuery,
  filterCount = 0,
  onClearFilters,
}: EmptyStateProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 text-center"
    >
      {/* Animated icon */}
      <motion.div
        className="mb-8 inline-block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-3xl" />
          <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Geen resultaten gevonden
      </h3>

      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        {searchQuery
          ? `We konden geen producten vinden die overeenkomen met "${searchQuery}".`
          : filterCount > 0
            ? 'Met je huidige filters vinden we helaas niets.'
            : 'Geen producten beschikbaar.'}
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {filterCount > 0 && onClearFilters && (
          <motion.button
            onClick={onClearFilters}
            className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Filters wissen
          </motion.button>
        )}

        <Link href="/shop">
          <motion.button
            className="px-6 py-3 rounded-lg border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-semibold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Terug naar shop
          </motion.button>
        </Link>
      </div>

      {/* Tips section */}
      <motion.div
        className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-500 font-semibold mb-4">
          Tips
        </p>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>• Controleer je spelling</li>
          <li>• Probeer breder zoeken zonder specifieke filters</li>
          <li>• Ontdek onze populaire categorieën</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
