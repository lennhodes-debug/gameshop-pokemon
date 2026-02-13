'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

  const blurTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => setIsFocused(false), 200);
  }, []);
  useEffect(() => () => { if (blurTimerRef.current) clearTimeout(blurTimerRef.current); }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Gradient border glow on focus */}
      <div className={cn(
        'absolute -inset-[1px] rounded-[18px] transition-opacity duration-300 pointer-events-none',
        isFocused ? 'opacity-100' : 'opacity-0'
      )} style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6, #10b981)', backgroundSize: '300% 300%', animation: isFocused ? 'gradient-spin 3s linear infinite' : 'none' }} />

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <svg className={cn("h-5 w-5 transition-colors duration-300", isFocused ? 'text-emerald-600' : 'text-slate-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

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
            'relative w-full pl-12 pr-28 py-4 rounded-2xl bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all duration-300',
            isFocused
              ? 'border-2 border-transparent shadow-xl shadow-emerald-500/[0.08] scale-[1.01]'
              : 'border-2 border-slate-200 shadow-sm hover:border-slate-300'
          )}
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onChange('')}
                aria-label="Zoekopdracht wissen"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {!value && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">⌘K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Autocomplete */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden z-50"
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
                  i === highlightIndex ? 'bg-slate-50' : 'hover:bg-slate-50',
                  i < suggestions.length - 1 && 'border-b border-slate-100'
                )}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="h-full w-full flex items-center justify-center text-[8px] font-medium text-slate-400">
                      {PLATFORM_LABELS[product.platform] || product.platform}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.platform}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  {isOnSale(product) ? (
                    <>
                      <span className="text-sm font-semibold text-red-500">{formatPrice(getEffectivePrice(product))}</span>
                      <span className="text-[10px] text-slate-400 line-through block">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-slate-900">{formatPrice(product.price)}</span>
                  )}
                </div>
              </Link>
            ))}

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Druk op <kbd className="px-1 py-0.5 rounded bg-slate-200 text-[10px] font-mono">Enter</kbd> voor alle resultaten
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
            className="absolute -bottom-6 left-4 text-xs text-slate-500"
          >
            <span className="font-medium text-emerald-600">{resultCount}</span> {resultCount === 1 ? 'resultaat' : 'resultaten'} gevonden
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
