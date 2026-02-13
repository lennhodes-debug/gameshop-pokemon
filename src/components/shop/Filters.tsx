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
      <legend className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide uppercase">{label}</legend>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(isActive && opt.value !== '' ? '' : opt.value)}
              aria-pressed={isActive}
              className={cn(
                'relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
              )}
            >
              {opt.label}
            </button>
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
      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
      <div className="relative">
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Sorteer producten"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:outline-none transition-all appearance-none pr-8 hover:border-slate-300"
        >
          <option value="newest">Nieuw binnen</option>
          <option value="name-asc">Naam A-Z</option>
          <option value="name-desc">Naam Z-A</option>
          <option value="price-asc">Prijs laag &rarr; hoog</option>
          <option value="price-desc">Prijs hoog &rarr; laag</option>
          <option value="discount-desc">Hoogste korting</option>
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </div>
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

      <button
        onClick={() => setShowAllFilters(!showAllFilters)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
      >
        <svg
          className={cn("h-4 w-4 transition-transform duration-200", showAllFilters && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        {showAllFilters ? 'Minder filters' : 'Meer filters'}
        {activeCount > 0 && (
          <span className="h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {activeCount > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => {
              onPlatformChange('');
              onGenreChange('');
              onConditionChange('');
              onCategoryChange('');
              onCompletenessChange('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Filters wissen ({activeCount})
          </motion.button>
        )}
      </AnimatePresence>

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
