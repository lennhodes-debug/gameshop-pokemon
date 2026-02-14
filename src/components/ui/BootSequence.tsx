'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'gameshop-boot-seen';
const SEQUENCE_DURATION = 1800;

export default function BootSequence() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Alleen tonen als nog niet gezien + geen reduced motion
    const seen = localStorage.getItem(STORAGE_KEY);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!seen && !prefersReduced) {
      setShow(true);
      document.body.style.overflow = 'hidden';

      // Fase timings
      const t1 = setTimeout(() => setPhase(1), 100);   // CRT power on
      const t2 = setTimeout(() => setPhase(2), 350);   // Logo drops
      const t3 = setTimeout(() => setPhase(3), 800);   // "ENTER" appears
      const t4 = setTimeout(() => setPhase(4), 1200);  // Flash
      const t5 = setTimeout(() => {
        setPhase(5); // Fade out
        localStorage.setItem(STORAGE_KEY, '1');
      }, 1400);
      const t6 = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
      }, SEQUENCE_DURATION);

      return () => {
        [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
        document.body.style.overflow = '';
      };
    }
  }, []);

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
    document.body.style.overflow = '';
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer"
          onClick={skip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ background: '#020408' }}
        >
          {/* CRT scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)',
              backgroundSize: '100% 2px',
            }}
          />

          {/* Screen glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: phase >= 1 && phase < 5 ? 1 : 0,
            }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.06), transparent 70%)',
            }}
          />

          {/* CRT power-on line */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-white/80 pointer-events-none"
            initial={{ height: 0, opacity: 0 }}
            animate={
              phase === 1
                ? { height: 2, opacity: 0.8, scaleX: 1 }
                : phase >= 2
                  ? { height: '100vh', opacity: 0, scaleX: 1 }
                  : { height: 0, opacity: 0 }
            }
            transition={
              phase === 1
                ? { duration: 0.15, ease: 'easeOut' }
                : { duration: 0.3, ease: 'easeIn' }
            }
          />

          {/* Logo content */}
          <div className="relative flex flex-col items-center select-none">
            {/* GAMESHOP text — drops down like Nintendo logo */}
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={
                phase >= 2
                  ? { y: 0, opacity: 1 }
                  : { y: -60, opacity: 0 }
              }
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                mass: 0.8,
              }}
            >
              <span
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight"
                style={{
                  color: '#e2e8f0',
                  textShadow: phase >= 2 ? '0 0 30px rgba(16,185,129,0.3)' : 'none',
                }}
              >
                GAMESHOP
              </span>
            </motion.div>

            {/* ENTER text — fades in below */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={
                phase >= 3
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 4 }
              }
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span
                className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-[0.4em] uppercase"
                style={{
                  background: 'linear-gradient(90deg, #10b981, #14b8a6, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Enter
              </span>
            </motion.div>

            {/* Registered mark — appears with ENTER */}
            <motion.p
              className="text-white/15 text-[10px] mt-6 tracking-widest uppercase font-medium"
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Nintendo Specialist
            </motion.p>
          </div>

          {/* Flash pulse */}
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={phase === 4 ? { opacity: [0, 0.15, 0] } : { opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
            }}
          />

          {/* Skip hint */}
          <motion.p
            className="absolute bottom-8 text-white/15 text-[10px] tracking-widest uppercase font-medium"
            initial={{ opacity: 0 }}
            animate={phase >= 2 && phase < 5 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Klik om over te slaan
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
