'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={scrollToTop}
          aria-label="Terug naar bovenkant"
          className="fixed bottom-8 right-8 z-40 h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/50 transition-all flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16.41l2.88-2.88a2 2 0 012.83 0L17 19m-6-6l2.88-2.88a2 2 0 012.83 0L21 15" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14" />
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
