'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, searchProducts } from '@/lib/products';

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
}

export default function AdvancedSearch({
  value,
  onChange,
  onProductSelect,
  placeholder = 'Zoek op titel, platform, genre...',
}: AdvancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    return value.length > 1 ? searchProducts(value, 8) : [];
  }, [value]);

  const showSuggestions = isFocused && suggestions.length > 0 && value.length > 1;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full"
    >
      {/* Search input */}
      <div className="relative group">
        {/* Animated border on focus */}
        <motion.div
          animate={{
            opacity: isFocused ? 1 : 0,
            boxShadow: isFocused
              ? '0 0 20px rgba(16, 185, 129, 0.3)'
              : '0 0 0px rgba(16, 185, 129, 0)',
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
        />

        {/* Icon */}
        <motion.div
          animate={{ color: isFocused ? '#10b981' : '#94a3b8' }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </motion.div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="relative w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition-all focus:border-emerald-500"
        />

        {/* Clear button */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Keyboard hint */}
        {!value && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex text-xs text-slate-400 gap-1">
            <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 font-mono">⌘K</kbd>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-black/20 overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {suggestions.map((product, index) => (
                <motion.button
                  key={product.sku}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onProductSelect?.(product);
                    onChange('');
                    setIsFocused(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  {/* Product thumbnail */}
                  {product.image && (
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1" />
                    </div>
                  )}

                  {/* Product info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.platform} • {product.genre}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
