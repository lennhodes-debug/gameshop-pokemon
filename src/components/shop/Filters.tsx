'use client';

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

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Select
        label="Platform"
        value={selectedPlatform}
        onChange={onPlatformChange}
        options={[
          { value: '', label: 'Alle platforms' },
          ...platforms.map((p) => ({ value: p, label: p })),
        ]}
      />
      <Select
        label="Categorie"
        value={selectedCategory}
        onChange={onCategoryChange}
        options={[
          { value: '', label: 'Alles' },
          { value: 'games', label: 'Games' },
          { value: 'consoles', label: 'Consoles' },
        ]}
      />
      <Select
        label="Conditie"
        value={selectedCondition}
        onChange={onConditionChange}
        options={[
          { value: '', label: 'Alle condities' },
          ...conditions.map((c) => ({ value: c, label: c })),
        ]}
      />
      <Select
        label="Genre"
        value={selectedGenre}
        onChange={onGenreChange}
        options={[
          { value: '', label: 'Alle genres' },
          ...genres.map((g) => ({ value: g, label: g })),
        ]}
      />
      <Select
        label="Compleetheid"
        value={selectedCompleteness}
        onChange={onCompletenessChange}
        options={[
          { value: '', label: 'Alle' },
          { value: 'cib', label: 'Compleet in doos (CIB)' },
          { value: 'los', label: 'Losse cartridge' },
        ]}
      />
      <Select
        label="Sorteren"
        value={sortBy}
        onChange={onSortChange}
        options={[
          { value: 'name-asc', label: 'Naam A-Z' },
          { value: 'name-desc', label: 'Naam Z-A' },
          { value: 'price-asc', label: 'Prijs laag-hoog' },
          { value: 'price-desc', label: 'Prijs hoog-laag' },
        ]}
      />
    </div>
  );
}
