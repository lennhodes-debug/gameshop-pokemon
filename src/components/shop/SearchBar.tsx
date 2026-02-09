'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  className?: string;
}

export default function SearchBar({ value, onChange, resultCount, className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      className={cn('relative', className)}
      animate={{
        scale: isFocused ? 1.01 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Glow effect when focused */}
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
          className="absolute left-4 top-1/2 -translate-y-1/2"
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
          onBlur={() => setIsFocused(false)}
          aria-label="Zoek producten"
          placeholder="Zoek op titel, platform of genre..."
          className={cn(
            'relative w-full pl-12 pr-28 py-4 rounded-2xl border-2 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all duration-300',
            isFocused
              ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600'
          )}
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Clear button */}
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

          {/* Keyboard shortcut hint */}
          {!value && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px]">⌘K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Result count indicator */}
      <AnimatePresence>
        {value && resultCount !== undefined && (
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
