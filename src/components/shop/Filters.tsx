'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FiltersProps {
  platforms: string[];
  genres: string[];
  conditions: string[];
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
    <div>
      <span className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide uppercase">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              onClick={() => onChange(isActive && opt.value !== '' ? '' : opt.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden',
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50'
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
    </div>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none pr-8 hover:border-slate-300"
      >
        <option value="newest">Nieuw binnen</option>
        <option value="name-asc">Naam A-Z</option>
        <option value="name-desc">Naam Z-A</option>
        <option value="price-asc">Prijs laag → hoog</option>
        <option value="price-desc">Prijs hoog → laag</option>
      </select>
    </div>
  );
}

export default function Filters({
  platforms,
  genres,
  conditions,
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
            { value: 'consoles', label: 'Consoles' },
          ]}
          value={selectedCategory}
          onChange={onCategoryChange}
        />
        <SortSelect value={sortBy} onChange={onSortChange} />
      </div>

      {/* Platform pills — grouped */}
      <div>
        <span className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide uppercase">Platform</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: '', label: 'Alle platforms' },
            ...(() => {
              const handheld = ['Game Boy', 'Game Boy Color', 'Game Boy Advance', 'Nintendo DS', 'Nintendo 3DS'];
              const home = ['NES', 'Super Nintendo', 'Nintendo 64', 'GameCube', 'Wii', 'Wii U', 'Switch'];
              const ordered = [
                ...home.filter(p => platforms.includes(p)),
                ...handheld.filter(p => platforms.includes(p)),
                ...platforms.filter(p => !home.includes(p) && !handheld.includes(p)),
              ];
              return ordered.map(p => ({ value: p, label: p }));
            })(),
          ].map((opt) => {
            const isActive = selectedPlatform === opt.value;
            return (
              <motion.button
                key={opt.value}
                onClick={() => onPlatformChange(isActive && opt.value !== '' ? '' : opt.value)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden',
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="pill-bg-Platform"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Toggle more filters */}
      <motion.button
        onClick={() => setShowAllFilters(!showAllFilters)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        whileHover={{ x: 2 }}
      >
        <motion.svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          animate={{ rotate: showAllFilters ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </motion.svg>
        {showAllFilters ? 'Minder filters' : 'Meer filters'}
        {activeCount > 0 && (
          <span className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </motion.button>

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
                  ...genres.slice(0, 10).map((g) => ({ value: g, label: g })),
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
