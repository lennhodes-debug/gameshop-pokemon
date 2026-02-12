'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatPrice, PLATFORM_LABELS } from '@/lib/utils';
import { searchProducts, isOnSale, getEffectivePrice } from '@/lib/products';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  className?: string;
}

export default function SearchBar({ value, onChange, resultCount, className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!isFocused || value.length < 2) return [];
    return searchProducts(value, 5);
  }, [value, isFocused]);

  const showDropdown = isFocused && suggestions.length > 0;

  useEffect(() => {
    setHighlightIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'Escape') inputRef.current?.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[highlightIndex];
      if (selected) {
        window.location.href = `/shop/${selected.sku}`;
      }
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  }, [showDropdown, suggestions, highlightIndex]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsFocused(false), 200);
  }, []);

  return (
    <motion.div
      className={cn('relative', className)}
      animate={{
        scale: isFocused ? 1.01 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Focus glow */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/25 to-cyan-500/30 rounded-2xl blur-xl"
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
          animate={{
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? '#10b981' : '#94a3b8',
            rotate: isFocused ? -10 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label="Zoek producten"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
          placeholder="Zoek op titel, platform of genre..."
          className={cn(
            'relative w-full pl-12 pr-28 py-4 rounded-2xl border-2 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all duration-300',
            isFocused
              ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600'
          )}
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          {/* Wis knop */}
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onChange('')}
                aria-label="Zoekopdracht wissen"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Sneltoets hint */}
          {!value && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px]">⌘K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Autocomplete */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden z-50"
            role="listbox"
          >
            {suggestions.map((product, i) => (
              <Link
                key={product.sku}
                href={`/shop/${product.sku}`}
                role="option"
                aria-selected={i === highlightIndex}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  i === highlightIndex
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                  i < suggestions.length - 1 && 'border-b border-slate-100 dark:border-slate-700/50'
                )}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                {/* Afbeelding */}
                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="h-full w-full flex items-center justify-center text-[8px] font-bold text-slate-400">
                      {PLATFORM_LABELS[product.platform] || product.platform}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.platform}</p>
                </div>

                {/* Prijs */}
                <div className="text-right flex-shrink-0">
                  {isOnSale(product) ? (
                    <>
                      <span className="text-sm font-bold text-red-500">{formatPrice(getEffectivePrice(product))}</span>
                      <span className="text-[10px] text-slate-400 line-through block">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
                  )}
                </div>
              </Link>
            ))}

            {/* Alle resultaten */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Druk op <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-[10px] font-mono">Enter</kbd> voor alle resultaten
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultaat teller */}
      <AnimatePresence>
        {value && !showDropdown && resultCount !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -bottom-6 left-4 text-xs text-slate-500 dark:text-slate-400"
          >
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{resultCount}</span> {resultCount === 1 ? 'resultaat' : 'resultaten'} gevonden
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
