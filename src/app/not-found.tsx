'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function RetroLives({ lives }: { lives: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 1 }}
          animate={i > lives ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-xl"
        >
          {i <= lives ? '❤️' : '🖤'}
        </motion.span>
      ))}
    </div>
  );
}

export default function NotFound() {
  const [lives, setLives] = useState(3);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (lives <= 0) return;
    const timer = setTimeout(() => setLives(lives - 1), 3000);
    return () => clearTimeout(timer);
  }, [lives]);

  useEffect(() => {
    if (lives === 0) {
      setGlitch(true);
      const t = setTimeout(() => setGlitch(false), 600);
      return () => clearTimeout(t);
    }
  }, [lives]);

  return (
    <div className="pt-16 lg:pt-20">
      <div className="relative bg-[#050810] min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)]" />
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-emerald-500/5 blur-[80px]"
          />
          <motion.div
            animate={{ x: [0, -20, 15, 0], y: [0, 15, -10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-cyan-500/5 blur-[60px]"
          />
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }} />
        </div>

        <div className={`relative text-center px-4 ${glitch ? 'animate-pulse' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Lives</span>
            <RetroLives lives={lives} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h1 className="text-[120px] sm:text-[160px] lg:text-[200px] font-extrabold leading-none tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white/20 to-white/[0.03] select-none">
                404
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="-mt-8 sm:-mt-12"
          >
            <AnimatePresence mode="wait">
              {lives > 0 ? (
                <motion.h2
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight"
                >
                  Pagina{' '}
                  <span className="relative">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                      niet gevonden
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded" />
                  </span>
                </motion.h2>
              ) : (
                <motion.h2
                  key="gameover"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight"
                >
                  Game{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">
                    Over
                  </span>
                </motion.h2>
              )}
            </AnimatePresence>
            <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed">
              {lives > 0
                ? 'Deze pagina bestaat niet of is verplaatst. Geen zorgen — er zijn genoeg levels om te ontdekken!'
                : 'Geen levens meer! Maar je kunt altijd een nieuw spel starten.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {lives === 0 ? (
              <motion.button
                onClick={() => setLives(3)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-shadow"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Continue?
              </motion.button>
            ) : (
              <>
                <Link href="/">
                  <motion.span
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-shadow"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    Terug naar home
                  </motion.span>
                </Link>
                <Link href="/shop">
                  <motion.span
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold hover:bg-white/[0.1] hover:border-white/[0.15] transition-all"
                  >
                    Bekijk de shop
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </motion.span>
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-14"
          >
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Populaire categorieën</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { href: '/shop?platform=Nintendo+Switch', label: 'Nintendo Switch' },
                { href: '/shop?platform=GameCube', label: 'GameCube' },
                { href: '/shop?platform=Nintendo+64', label: 'Nintendo 64' },
                { href: '/shop?platform=Game+Boy', label: 'Game Boy' },
                { href: '/inkoop', label: 'Games verkopen' },
              ].map((cat, i) => (
                <motion.div
                  key={cat.href}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + i * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <Link href={cat.href}>
                    <motion.span
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-block px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-slate-300 text-sm font-medium hover:bg-white/[0.1] hover:text-white transition-all"
                    >
                      {cat.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.4, 0.6] }}
            transition={{ delay: 1, duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            className="mt-10 text-slate-600 text-xs font-mono tracking-wider uppercase"
          >
            {lives > 0 ? `${lives} ${lives === 1 ? 'leven' : 'levens'} over` : 'Insert coin to continue'}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
