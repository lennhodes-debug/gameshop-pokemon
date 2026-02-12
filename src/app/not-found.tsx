'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function PokeballSVG({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="3"/>
      <line x1="5" y1="100" x2="195" y2="100" stroke="white" strokeWidth="3"/>
      <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="3"/>
      <circle cx="100" cy="100" r="15" fill="white" fillOpacity="0.3"/>
    </svg>
  );
}

function FloatingPokeball({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -15, 5, -10, 0],
        rotate: [0, 8, -5, 3, 0],
      }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
    >
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className="opacity-[0.07]">
        <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="4"/>
        <line x1="5" y1="100" x2="195" y2="100" stroke="white" strokeWidth="4"/>
        <circle cx="100" cy="100" r="25" stroke="white" strokeWidth="4"/>
        <circle cx="100" cy="100" r="12" fill="white" fillOpacity="0.4"/>
      </svg>
    </motion.div>
  );
}

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
          {i <= lives ? '\u2764\uFE0F' : '\uD83D\uDDA4'}
        </motion.span>
      ))}
    </div>
  );
}

export default function NotFound() {
  const [lives, setLives] = useState(3);
  const [glitch, setGlitch] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (lives <= 0) return;
    const timer = setTimeout(() => setLives(lives - 1), 3000);
    return () => clearTimeout(timer);
  }, [lives]);

  const triggerHitEffect = useCallback(() => {
    setShake(true);
    setGlitch(true);
    const t1 = setTimeout(() => setShake(false), 400);
    const t2 = setTimeout(() => setGlitch(false), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (lives < 3 && lives >= 0) {
      const cleanup = triggerHitEffect();
      return cleanup;
    }
  }, [lives, triggerHitEffect]);

  return (
    <div className="pt-16 lg:pt-20">
      <div className="relative bg-[#050810] min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Achtergrond effecten */}
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
          {/* Scanline overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }} />
        </div>

        {/* Grote Pokeball achtergrond decoratie */}
        <PokeballSVG className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.04]" />

        {/* Floating Pokeballs */}
        <FloatingPokeball delay={0} x="8%" y="15%" size={40} />
        <FloatingPokeball delay={2} x="85%" y="25%" size={32} />
        <FloatingPokeball delay={4} x="15%" y="70%" size={28} />
        <FloatingPokeball delay={1.5} x="78%" y="65%" size={36} />

        {/* Content */}
        <div
          className="relative text-center px-4"
          style={{
            animation: shake ? 'notfound-shake 0.4s ease-out' : 'none',
          }}
        >
          {/* Glitch color overlay */}
          <AnimatePresence>
            {glitch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute inset-0 pointer-events-none z-10 mix-blend-screen"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,0,0,0.08) 33%, rgba(0,255,0,0.08) 66%, rgba(0,0,255,0.08) 100%)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Lives indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Lives</span>
            <RetroLives lives={lives} />
          </motion.div>

          {/* Encounter frame */}
          <div className="relative max-w-lg mx-auto">
            {/* Retro encounter border */}
            <div className="absolute -inset-6 sm:-inset-8 border border-white/[0.06] rounded-3xl pointer-events-none" />
            <div className="absolute -inset-6 sm:-inset-8 rounded-3xl pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
            </div>

            {/* 404 nummer */}
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

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="-mt-8 sm:-mt-12"
            >
              <AnimatePresence mode="wait">
                {lives > 0 ? (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight flex items-center justify-center gap-3">
                      <svg className="h-6 w-6 sm:h-7 sm:w-7 text-red-400 flex-shrink-0" viewBox="0 0 200 200" fill="none">
                        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="8"/>
                        <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="8"/>
                        <circle cx="100" cy="100" r="25" stroke="currentColor" strokeWidth="8"/>
                        <circle cx="100" cy="100" r="10" fill="currentColor" fillOpacity="0.5"/>
                      </svg>
                      <span>
                        Wild{' '}
                        <span className="relative">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                            MissingNo.
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded" />
                        </span>
                        {' '}verscheen!
                      </span>
                    </h2>
                  </motion.div>
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
                  ? 'Deze pagina is verdwenen in het hoge gras. Geen zorgen — er zijn genoeg routes om te ontdekken!'
                  : 'Geen levens meer! Maar je kunt altijd een nieuw spel starten.'}
              </p>
            </motion.div>
          </div>

          {/* Knoppen */}
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

          {/* Categorieen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-14"
          >
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Populaire categorieen</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { href: '/shop?platform=Nintendo+DS', label: 'Nintendo DS' },
                { href: '/shop?platform=Game+Boy+Advance', label: 'Game Boy Advance' },
                { href: '/shop?platform=Nintendo+3DS', label: 'Nintendo 3DS' },
                { href: '/shop?platform=Game+Boy+%2F+Color', label: 'Game Boy' },
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
