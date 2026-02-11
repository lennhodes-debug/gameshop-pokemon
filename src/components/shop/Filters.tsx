'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FiltersProps {
  platforms: string[];
  genres: string[];
  conditions: string[];
  hasConsoles: boolean;
  hasSaleItems: boolean;
  selectedPlatform: string;
  selectedGenre: string;
  selectedCondition: string;
  selectedCategory: string;
  selectedCompleteness: string;
  sortBy: string;
  onPlatformChange: (v: string) => void;
  onGenreChange: (v: string) => void;
  onConditionChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCompletenessChange: (v: string) => void;
  onSortChange: (v: string) => void;
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 tracking-wide uppercase">{label}</legend>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              onClick={() => onChange(isActive && opt.value !== '' ? '' : opt.value)}
              aria-pressed={isActive}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden',
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={`pill-bg-${label}`}
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="sr-only">Sorteer op</label>
      <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sorteer producten"
        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none pr-8 hover:border-slate-300 dark:hover:border-slate-600"
      >
        <option value="newest">Nieuw binnen</option>
        <option value="name-asc">Naam A-Z</option>
        <option value="name-desc">Naam Z-A</option>
        <option value="price-asc">Prijs laag → hoog</option>
        <option value="price-desc">Prijs hoog → laag</option>
        <option value="discount-desc">Hoogste korting</option>
      </select>
    </div>
  );
}

export default function Filters({
  platforms,
  genres,
  conditions,
  hasConsoles,
  hasSaleItems,
  selectedPlatform,
  selectedGenre,
  selectedCondition,
  selectedCategory,
  selectedCompleteness,
  sortBy,
  onPlatformChange,
  onGenreChange,
  onConditionChange,
  onCategoryChange,
  onCompletenessChange,
  onSortChange,
}: FiltersProps) {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const activeCount = [selectedPlatform, selectedGenre, selectedCondition, selectedCategory, selectedCompleteness].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Top row: Category pills + Sort */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PillGroup
          label="Categorie"
          options={[
            { value: '', label: 'Alles' },
            { value: 'games', label: 'Games' },
            ...(hasConsoles ? [{ value: 'consoles', label: 'Consoles' }] : []),
            ...(hasSaleItems ? [{ value: 'sale', label: 'Aanbiedingen' }] : []),
          ]}
          value={selectedCategory}
          onChange={onCategoryChange}
        />
        <SortSelect value={sortBy} onChange={onSortChange} />
      </div>

      {/* Platform pills — Game Boy variants grouped */}
      <PillGroup
        label="Platform"
        options={[
          { value: '', label: 'Alle platforms' },
          ...platforms
            .filter((p) => !p.startsWith('Game Boy'))
            .map((p) => ({ value: p, label: p })),
          { value: 'Game Boy (alle)', label: 'Game Boy (alle)' },
          ...platforms
            .filter((p) => p.startsWith('Game Boy'))
            .map((p) => ({ value: p, label: p })),
        ]}
        value={selectedPlatform}
        onChange={onPlatformChange}
      />

      {/* Toggle more filters */}
      <motion.button
        onClick={() => setShowAllFilters(!showAllFilters)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        whileHover={{ x: 2 }}
      >
        <motion.svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          animate={{ rotate: showAllFilters ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </motion.svg>
        {showAllFilters ? 'Minder filters' : 'Meer filters'}
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.span
              key={activeCount}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center"
            >
              {activeCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Reset alle filters */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onPlatformChange('');
              onGenreChange('');
              onConditionChange('');
              onCategoryChange('');
              onCompletenessChange('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Filters wissen ({activeCount})
          </motion.button>
        )}
      </AnimatePresence>

      {/* Extended filters */}
      <AnimatePresence>
        {showAllFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-1">
              <PillGroup
                label="Conditie"
                options={[
                  { value: '', label: 'Alle' },
                  ...conditions.map((c) => ({ value: c, label: c })),
                ]}
                value={selectedCondition}
                onChange={onConditionChange}
              />
              <PillGroup
                label="Genre"
                options={[
                  { value: '', label: 'Alle genres' },
                  ...genres.map((g) => ({ value: g, label: g })),
                ]}
                value={selectedGenre}
                onChange={onGenreChange}
              />
              <PillGroup
                label="Compleetheid"
                options={[
                  { value: '', label: 'Alle' },
                  { value: 'cib', label: 'Compleet (CIB)' },
                  { value: 'los', label: 'Los' },
                ]}
                value={selectedCompleteness}
                onChange={onCompletenessChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
