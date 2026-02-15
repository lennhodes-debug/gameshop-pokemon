'use client';

import { motion } from 'framer-motion';

interface FilterTag {
  label: string;
  value: string;
  type: 'platform' | 'genre' | 'condition' | 'category' | 'completeness' | 'price' | 'search';
}

interface FilterSummaryProps {
  filters: FilterTag[];
  onRemoveFilter: (type: string, value: string) => void;
  onClearAll: () => void;
  resultCount: number;
}

export default function FilterSummary({
  filters,
  onRemoveFilter,
  onClearAll,
  resultCount,
}: FilterSummaryProps) {
  if (filters.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { staggerChildren: 0.05 },
    },
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 border border-emerald-200 dark:border-slate-700"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707l-6 6a1 1 0 00-.263.464l-2 8a1 1 0 11-1.942-.39l1.846-7.386A1 1 0 0010 12.414l-6-6A1 1 0 013 5V3z"
              />
            </svg>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {resultCount} resultaten
            </span>
          </div>
          {filters.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Alles wissen
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <motion.div
              key={`${filter.type}-${filter.value}`}
              variants={tagVariants}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-slate-600 shadow-sm"
            >
              <span>{filter.label}</span>
              <button
                onClick={() => onRemoveFilter(filter.type, filter.value)}
                className="ml-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
