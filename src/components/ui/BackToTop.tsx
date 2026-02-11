'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [CIRCUMFERENCE, 0]);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label="Terug naar boven"
          className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 h-12 w-12 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-2 border-slate-900/10 dark:border-slate-600 shadow-lg shadow-slate-200/50 dark:shadow-black/30 flex items-center justify-center overflow-hidden group/btn hover:shadow-emerald-200/40 dark:hover:shadow-emerald-500/15 transition-shadow"
        >
          {/* Pokeball bovenkant (rood, emerald bij hover) */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-red-400 to-red-500 group-hover/btn:from-emerald-400 group-hover/btn:to-teal-500 transition-colors duration-300" />
          {/* Pokeball onderkant (wit) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white dark:bg-slate-200" />
          {/* Pokeball middenlijn */}
          <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-slate-900/80 dark:bg-slate-700 z-10" />
          {/* Pokeball center button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900/80 dark:bg-slate-700 z-20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-200 group-hover/btn:bg-emerald-100 transition-colors duration-300" />
          </div>

          {/* Progress ring */}
          <svg className="absolute inset-0 w-12 h-12 -rotate-90 z-30" viewBox="0 0 48 48" aria-hidden="true">
            <motion.circle
              cx="24"
              cy="24"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-emerald-500"
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset,
              }}
              strokeLinecap="round"
            />
          </svg>

          {/* Pijl icoon */}
          <svg className="h-3.5 w-3.5 relative z-30 text-slate-900 dark:text-slate-700 group-hover/btn:text-emerald-700 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
