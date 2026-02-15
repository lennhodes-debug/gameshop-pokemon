'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface SortOption {
  value: string;
  label: string;
  description?: string;
}

interface AdvancedSortProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
  options: SortOption[];
}

export default function AdvancedSort({
  currentSort,
  onSortChange,
  options,
}: AdvancedSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel =
    options.find((o) => o.value === currentSort)?.label || 'Sorteren';

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-sm">{currentLabel}</span>
        <motion.svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </motion.svg>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full left-0 mt-2 min-w-[280px] bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {options.map((option) => {
              const isActive = option.value === currentSort;

              return (
                <motion.button
                  key={option.value}
                  variants={itemVariants}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-start justify-between group
                    ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }
                  `}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm
                        ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }
                      `}
                    >
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>

                  {isActive && (
                    <motion.div
                      className="ml-2 text-emerald-600 dark:text-emerald-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
