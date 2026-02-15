'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  count: number;
  emoji?: string;
}

interface PremiumFiltersProps {
  title: string;
  options: FilterOption[];
  selectedValue?: string;
  onChange: (value: string) => void;
  icon?: string;
}

export default function PremiumFilters({
  title,
  options,
  selectedValue,
  onChange,
  icon = '🔍',
}: PremiumFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            {options.length}
          </span>
        </div>
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </motion.button>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {/* All option */}
              <motion.button
                onClick={() => onChange('')}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  !selectedValue
                    ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="font-semibold">All</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  {options.reduce((sum, o) => sum + o.count, 0)}
                </span>
              </motion.button>

              {/* Options */}
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  onClick={() => onChange(option.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    selectedValue === option.id
                      ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.emoji && <span className="text-lg">{option.emoji}</span>}
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <motion.span
                    key={`${option.id}-count`}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {option.count}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
