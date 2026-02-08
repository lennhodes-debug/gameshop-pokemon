'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';

export default function FloatingActions() {
  const { getItemCount } = useCart();
  const count = getItemCount();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setVisible(currentY <= lastScrollY || currentY < 100);
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setExpanded(false);
  };

  if (count === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-6 right-4 z-50">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex flex-col items-end gap-2"
          >
            {/* Expanded options */}
            <AnimatePresence>
              {expanded && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 10 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      href="/shop"
                      onClick={() => setExpanded(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 shadow-lg text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Zoeken
                    </Link>
                  </motion.div>
                  <motion.button
                    initial={{ scale: 0, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 10 }}
                    onClick={scrollToTop}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 shadow-lg text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                    Omhoog
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
            >
              <button
                onClick={() => setExpanded(!expanded)}
                className="relative h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center"
              >
                <Link href="/winkelwagen" onClick={(e) => { if (expanded) { e.preventDefault(); setExpanded(false); } }}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </Link>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full bg-white text-emerald-600 text-[10px] font-bold px-1 shadow">
                    {count}
                  </span>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
