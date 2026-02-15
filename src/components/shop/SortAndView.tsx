'use client';

import { motion } from 'framer-motion';

interface SortAndViewProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  resultCount: number;
}

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Naam (A-Z)', icon: '↑' },
  { value: 'name-desc', label: 'Naam (Z-A)', icon: '↓' },
  { value: 'price-asc', label: 'Prijs laag→hoog', icon: '💰' },
  { value: 'price-desc', label: 'Prijs hoog→laag', icon: '💎' },
  { value: 'newest', label: 'Nieuwst', icon: '✨' },
  { value: 'discount-desc', label: 'Beste deals', icon: '🔥' },
];

export default function SortAndView({ sortBy, onSortChange, viewMode = 'grid', onViewModeChange, resultCount }: SortAndViewProps) {
  const activeSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center justify-between gap-4 py-4"
    >
      {/* Results counter with animation */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <span className="text-sm text-slate-500 dark:text-slate-400">
          <motion.span
            key={resultCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="font-bold text-slate-900 dark:text-white"
          >
            {resultCount}
          </motion.span>
          {' '}producten
        </span>
      </motion.div>

      {/* Sort dropdown with enhanced UI */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="relative group"
      >
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
        >
          <span>{activeSortOption?.icon}</span>
          <span>{activeSortOption?.label}</span>
          <svg
            className="h-4 w-4 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {/* Dropdown menu with animations */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          whileHover={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-black/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
        >
          <div className="p-2 space-y-1">
            {SORT_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                  sortBy === option.value
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-base">{option.icon}</span>
                <span className="flex-1">{option.label}</span>
                {sortBy === option.value && (
                  <motion.div
                    layoutId="active-sort"
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
