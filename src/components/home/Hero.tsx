'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const FLOATING_POKEBALLS = [
  { size: 20, x: '10%', y: '20%', delay: 0, duration: 8 },
  { size: 14, x: '85%', y: '15%', delay: 2, duration: 10 },
  { size: 18, x: '75%', y: '70%', delay: 1, duration: 9 },
  { size: 12, x: '20%', y: '75%', delay: 3, duration: 11 },
  { size: 16, x: '50%', y: '10%', delay: 4, duration: 7 },
  { size: 10, x: '40%', y: '85%', delay: 2.5, duration: 12 },
];

const HERO_TITLE_WORDS = ['Gameshop', 'Enter'];

function MiniPokeball({ size }: { size: number }) {
  const r = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="opacity-[0.06]">
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke="white" strokeWidth="1" />
      <line x1="1" y1={r} x2={r - 3} y2={r} stroke="white" strokeWidth="1" />
      <line x1={r + 3} y1={r} x2={size - 1} y2={r} stroke="white" strokeWidth="1" />
      <circle cx={r} cy={r} r={3} fill="none" stroke="white" strokeWidth="1" />
    </svg>
  );
}

function PokeballBg() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Langzaam roterende Pokeball silhouet */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-[0.05]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="3" />
        <line x1="5" y1="100" x2="70" y2="100" stroke="white" strokeWidth="3" />
        <line x1="130" y1="100" x2="195" y2="100" stroke="white" strokeWidth="3" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="white" strokeWidth="3" />
        <circle cx="100" cy="100" r="12" fill="white" fillOpacity="0.3" />
      </motion.svg>

      {/* Glowing orb achter de Pokeball — spring entrance van scale 0 naar 1 */}
      <motion.div
        className="absolute w-64 h-64 lg:w-96 lg:h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{
          scale: {
            times: [0, 0.5, 1],
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          },
          opacity: {
            times: [0, 0.5, 1],
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          },
        }}
      />
      {/* Extra entrance spring animatie voor de orb */}
      <motion.div
        className="absolute w-64 h-64 lg:w-96 lg:h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 12,
          delay: 0.2,
        }}
      />

      {/* Zwevende mini Pokéballs */}
      {FLOATING_POKEBALLS.map((ball, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: ball.x, top: ball.y }}
          animate={{
            y: [0, -15, 5, -10, 0],
            x: [0, 8, -5, 3, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: ball.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: ball.delay,
          }}
        >
          <MiniPokeball size={ball.size} />
        </motion.div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative bg-[#050810] overflow-hidden">
      {/* Subtiele gradient achtergrond */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />

      {/* Pokeball achtergrond */}
      <PokeballBg />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-44 text-center">
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1]">
            <span className="text-white/70 text-xs font-medium">Pokémon specialist</span>
            <span className="text-white/30">|</span>
            <span className="text-emerald-400 text-xs font-bold">5.0</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-2.5 w-2.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Titel — per woord 3D rotateX flip entrance */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
          {HERO_TITLE_WORDS.map((word, i) => (
            <span key={word}>
              {i > 0 && <br />}
              <span className="inline-block overflow-hidden" style={{ perspective: '600px' }}>
                <motion.span
                  className={`inline-block ${i === 1 ? 'bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400' : ''}`}
                  initial={{ y: '120%', rotateX: -80, opacity: 0 }}
                  animate={{ y: '0%', rotateX: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ transformOrigin: 'bottom center' }}
                >
                  {word}
                </motion.span>
              </span>
            </span>
          ))}
        </h1>

        {/* Subtitel — letter-spacing animatie van wider naar normaal */}
        <motion.p
          initial={{ opacity: 0, y: 16, letterSpacing: '0.15em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0em' }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Dé Pokémon specialist van Nederland. Originele games, persoonlijk getest en met liefde verpakt.
        </motion.p>

        {/* CTA knoppen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300"
          >
            Bekijk de collectie
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/inkoop"
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white/[0.12] border border-white/[0.12] text-white font-bold text-sm hover:bg-white/[0.16] transition-all duration-300"
          >
            Games verkopen
          </Link>
        </motion.div>
      </div>

      {/* Scroll-down indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        </svg>
      </motion.div>

      {/* Gradient overgang naar pagina */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050810] to-transparent" />
    </section>
  );
}
