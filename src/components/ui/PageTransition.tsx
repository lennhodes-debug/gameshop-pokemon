'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
    filter: 'blur(12px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.99,
    filter: 'blur(8px)',
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

function CoinOverlay({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 700);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dim overlay */}
      <motion.div
        className="absolute inset-0 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      />
      {/* Coin */}
      <motion.div
        className="relative w-8 h-8"
        initial={{ y: -120, opacity: 0, rotateY: 0 }}
        animate={{ y: 0, opacity: 1, rotateY: 720 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-2 border-amber-600 shadow-lg shadow-amber-500/40 flex items-center justify-center">
          <span className="text-amber-800 font-black text-sm" style={{ fontFamily: 'monospace' }}>G</span>
        </div>
      </motion.div>
      {/* Flash — subtiel, geen full-screen wit */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.15, 0] }}
        transition={{ duration: 0.7, times: [0, 0.45, 0.55, 0.7] }}
      />
    </motion.div>
  );
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [showCoin, setShowCoin] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (pathname !== prevPath) {
      if (!isMobile && !prefersReducedMotion) {
        setShowCoin(true);
      }
      setPrevPath(pathname);
    }
  }, [pathname, prevPath, isMobile, prefersReducedMotion]);

  return (
    <>
      <AnimatePresence>
        {showCoin && <CoinOverlay onComplete={() => setShowCoin(false)} />}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={prefersReducedMotion ? reducedMotionVariants : pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
