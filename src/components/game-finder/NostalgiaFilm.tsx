'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── SCENE TIMING (ms before advancing) ────────────────────
const STEP_DURATIONS = [
  2000,  // 0: CRT boot
  2800,  // 1: "Gameshop Enter presenteert"
  500,   // 2: VHS glitch
  4800,  // 3: Game Boy boot sequence
  500,   // 4: VHS glitch
  4800,  // 5: GBA boot sequence
  500,   // 6: VHS glitch
  4800,  // 7: DS boot sequence
  500,   // 8: VHS glitch
  4800,  // 9: 3DS boot sequence
  900,   // 10: VHS full tracking
  4000,  // 11: Emotional text
  // 12: Reveal — stays
];

// ─── PERSISTENT OVERLAYS ───────────────────────────────────

function FilmGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
    />
  );
}

function Scanlines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[65]">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
      />
    </div>
  );
}

function VHSTimestamp({ step }: { step: number }) {
  const [time, setTime] = useState('00:00:00');
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      setTime(`00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  if (step < 1) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-6 right-6 z-[72] font-mono text-[11px] text-white/20 tabular-nums">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500/60 animate-pulse" />
        <span>REC</span>
        <span>{time}</span>
      </div>
    </motion.div>
  );
}

function Letterbox() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[8vh] bg-black z-[68]" />
      <div className="fixed bottom-0 left-0 right-0 h-[8vh] bg-black z-[68]" />
    </>
  );
}

// ─── CRT BOOT ──────────────────────────────────────────────

function CRTBoot() {
  return (
    <motion.div key="boot" className="fixed inset-0 flex items-center justify-center bg-black z-[60]" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div
        className="absolute bg-white/80"
        style={{ left: '10%', right: '10%', height: '2px', top: '50%', translateY: '-50%' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 1], scaleY: [1, 1, 200, 600], opacity: [0, 0.9, 0.6, 0] }}
        transition={{ duration: 1.8, times: [0, 0.3, 0.6, 1], ease: 'easeInOut' }}
      />
      <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 0.15, 0] }} transition={{ duration: 1.8, times: [0, 0.55, 0.65, 0.8] }} />
    </motion.div>
  );
}

// ─── VHS GLITCH ────────────────────────────────────────────

function VHSGlitch() {
  const bars = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i, y: Math.random() * 100, h: Math.random() * 6 + 1, delay: Math.random() * 0.2, opacity: Math.random() * 0.5 + 0.1,
  })), []);

  return (
    <motion.div key="glitch" className="fixed inset-0 z-[60] bg-black/90" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.45, times: [0, 0.1, 0.7, 1] }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '150px 150px' }} />
      {bars.map((bar) => (
        <motion.div key={bar.id} className="absolute left-0 right-0 bg-white" style={{ top: `${bar.y}%`, height: `${bar.h}px`, opacity: bar.opacity }} animate={{ scaleX: [0, 1.2, 0], x: ['-30%', '15%', '40%'] }} transition={{ duration: 0.35, delay: bar.delay }} />
      ))}
    </motion.div>
  );
}

// ─── VHS TRACKING ──────────────────────────────────────────

function VHSTracking() {
  return (
    <motion.div key="tracking" className="fixed inset-0 z-[60] bg-black flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.85, times: [0, 0.1, 0.75, 1] }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />
      <motion.div className="absolute left-0 right-0 h-20 bg-white/[0.08]" animate={{ top: ['-10%', '110%'] }} transition={{ duration: 0.7, ease: 'linear' }} />
      <div className="relative">
        <span className="absolute text-3xl font-bold text-red-500/25 blur-[1px]" style={{ transform: 'translate(-3px, 1px)' }}>TRACKING...</span>
        <span className="absolute text-3xl font-bold text-cyan-500/25 blur-[1px]" style={{ transform: 'translate(3px, -1px)' }}>TRACKING...</span>
        <motion.span className="text-3xl font-bold text-white/40" animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 0.7, times: [0, 0.4, 1] }}>TRACKING...</motion.span>
      </div>
    </motion.div>
  );
}

// ─── TITLE SCENE ───────────────────────────────────────────

function TitleScene() {
  return (
    <motion.div key="title" className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050810]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <motion.p initial={{ opacity: 0, letterSpacing: '0.8em' }} animate={{ opacity: 0.5, letterSpacing: '0.4em' }} transition={{ duration: 1.2, ease: 'easeOut' }} className="text-sm sm:text-base font-light text-white uppercase tracking-[0.4em] mb-4">
        Gameshop Enter
      </motion.p>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.35, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="text-lg sm:text-xl text-white/35 italic">
        presenteert
      </motion.p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// BOOT SEQUENCE RECREATIONS
// ═══════════════════════════════════════════════════════════

// ─── GAME BOY BOOT (1989) ──────────────────────────────────
// Nintendo logo drops from top to center on green monochrome screen.
// Two-note "ding ding" represented as visual flash.

function GameBoyBoot() {
  // The classic Game Boy screen colors
  const darkest = '#0f380f';
  const dark = '#306230';
  const light = '#8bac0f';
  const lightest = '#9bbc0f';

  return (
    <motion.div
      key="gb-boot"
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: darkest }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Green screen area */}
      <div className="relative flex flex-col items-center">
        {/* Screen bezel simulation */}
        <div
          className="relative w-[280px] sm:w-[340px] lg:w-[400px] aspect-square rounded-lg overflow-hidden"
          style={{ background: dark, boxShadow: `0 0 80px rgba(155, 188, 15, 0.15), inset 0 0 40px rgba(0,0,0,0.3)` }}
        >
          {/* Screen inner */}
          <div className="absolute inset-3 sm:inset-4 rounded flex flex-col items-center justify-center" style={{ background: light }}>
            {/* Nintendo logo — drops from top */}
            <motion.div
              className="flex flex-col items-center"
              initial={{ y: -120 }}
              animate={{ y: 0 }}
              transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Pixel-style "Nintendo" text */}
              <div className="relative">
                <span
                  className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[0.15em] select-none"
                  style={{ color: darkest, fontFamily: 'monospace' }}
                >
                  Nintendo
                </span>
                {/* Registered trademark */}
                <span className="absolute -top-1 -right-4 text-[8px] font-bold" style={{ color: darkest }}>®</span>
              </div>
            </motion.div>

            {/* "Ding" flash — appears after logo lands */}
            <motion.div
              className="absolute inset-0"
              style={{ background: lightest }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0, 0.6, 0, 0.4, 0] }}
              transition={{ duration: 4, times: [0, 0.49, 0.5, 0.52, 0.56, 0.58, 0.62] }}
            />

            {/* Scanline effect on green screen */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)` }}
            />
          </div>
        </div>

        {/* Era label underneath */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0, 1] }}
          transition={{ duration: 4, times: [0, 0, 0.7, 0.85] }}
        >
          <p className="text-xs font-mono uppercase tracking-[0.3em]" style={{ color: lightest }}>
            1989 &mdash; Game Boy
          </p>
          <p className="text-sm text-white/30 mt-2 font-light">
            Op de achterbank met een zaklamp.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── GBA BOOT (2001) ───────────────────────────────────────
// "GAME BOY" text flies in letter by letter from bottom-right,
// changing colors → settles to blue. Sparkle sweeps across.
// "ADVANCE" appears below.

function GBABoot() {
  const letters = 'GAMEBOY'.split('');
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <motion.div
      key="gba-boot"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative flex flex-col items-center">
        {/* GAME BOY letters flying in */}
        <div className="flex gap-1 sm:gap-2 mb-2">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              className="text-4xl sm:text-5xl lg:text-7xl font-black select-none"
              style={{ fontFamily: 'system-ui, sans-serif' }}
              initial={{ opacity: 0, x: 200, y: 100, color: colors[i] }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                color: ['#3b82f6', colors[i], '#6366f1', '#2563eb', '#1d4ed8'],
              }}
              transition={{
                opacity: { delay: 0.3 + i * 0.12, duration: 0.3 },
                x: { delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                y: { delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                color: { delay: 0.3 + i * 0.12, duration: 1.5, times: [0, 0.3, 0.5, 0.7, 1] },
              }}
            >
              {letter === 'B' ? (
                <span className="ml-3 sm:ml-4">{letter}</span>
              ) : letter}
            </motion.span>
          ))}
        </div>

        {/* Sparkle sweep across text */}
        <motion.div
          className="absolute top-0 h-20 sm:h-24 lg:h-28 w-16 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 40%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.8) 60%, transparent)',
            filter: 'blur(2px)',
          }}
          initial={{ left: '-10%', opacity: 0 }}
          animate={{ left: ['- 10%', '110%'], opacity: [0, 0, 1, 1, 0] }}
          transition={{ delay: 1.8, duration: 0.8, ease: 'easeInOut', times: [0, 0.05, 0.1, 0.9, 1] }}
        />

        {/* TM */}
        <motion.span
          className="absolute top-0 right-0 -mr-6 text-[8px] font-bold text-blue-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          ™
        </motion.span>

        {/* "ADVANCE" text appearing */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-[0.5em] text-blue-700 select-none" style={{ fontFamily: 'system-ui, sans-serif' }}>
            ADVANCE
          </span>
        </motion.div>

        {/* Nintendo logo below */}
        <motion.p
          className="mt-6 text-sm font-medium text-rose-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          Nintendo®
        </motion.p>

        {/* Era label */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2 }}
        >
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-400">
            2001 &mdash; Game Boy Advance
          </p>
          <p className="text-sm text-slate-400 mt-2 font-light">
            Meer kleuren. Meer levels. Datzelfde gevoel.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── DS BOOT (2004) ────────────────────────────────────────
// "Nintendo" logo fades in with dual "O" characters.
// Large "DS" appears. The two O's slide together, touching
// triggers burst of circles flying outward. Fade to black.

function DSBoot() {
  const burstCircles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i / 16) * Math.PI * 2,
      distance: 150 + Math.random() * 200,
      size: 8 + Math.random() * 12,
      delay: Math.random() * 0.15,
    })),
  []);

  return (
    <motion.div
      key="ds-boot"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative flex flex-col items-center">
        {/* "Nintendo" text */}
        <motion.div
          className="flex items-center gap-0 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-wide" style={{ fontFamily: 'system-ui, sans-serif' }}>
            Nintend
          </span>
          {/* The two overlapping O's — one black, one gray underneath */}
          <span className="relative inline-block w-8 sm:w-10 lg:w-12">
            {/* Gray O (behind) */}
            <motion.span
              className="absolute text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-400"
              style={{ fontFamily: 'system-ui, sans-serif' }}
              initial={{ x: 8 }}
              animate={{ x: [8, 8, 0] }}
              transition={{ duration: 2.5, times: [0, 0.5, 0.7], ease: 'easeInOut' }}
            >
              O
            </motion.span>
            {/* Black O (front) */}
            <motion.span
              className="relative text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              O
            </motion.span>
          </span>
        </motion.div>

        {/* Large "DS" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center"
        >
          <span className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-800 tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>
            DS
          </span>
        </motion.div>

        {/* Burst of O circles — triggered at ~2s */}
        {burstCircles.map((circle) => (
          <motion.div
            key={circle.id}
            className="absolute rounded-full font-bold text-slate-300 flex items-center justify-center select-none"
            style={{
              width: circle.size,
              height: circle.size,
              fontSize: circle.size * 0.7,
              fontFamily: 'system-ui, sans-serif',
            }}
            initial={{ x: 0, y: -20, opacity: 0, scale: 0 }}
            animate={{
              x: [0, 0, Math.cos(circle.angle) * circle.distance],
              y: [-20, -20, Math.sin(circle.angle) * circle.distance - 20],
              opacity: [0, 0, 0, 1, 1, 0],
              scale: [0, 0, 0, 1, 1, 0.5],
            }}
            transition={{
              duration: 3.5,
              times: [0, 0.42, 0.43, 0.46, 0.7, 0.85],
              delay: circle.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            O
          </motion.div>
        ))}

        {/* Fade to dark after burst */}
        <motion.div
          className="fixed inset-0 bg-[#050810] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0, 1] }}
          transition={{ duration: 4.5, times: [0, 0, 0.72, 0.85] }}
        />

        {/* Era label (appears in dark) */}
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0, 1] }}
          transition={{ duration: 4.5, times: [0, 0, 0.8, 0.92] }}
        >
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-sky-400">
              2004 &mdash; Nintendo DS
            </p>
            <p className="text-sm text-white/30 mt-2 font-light">
              Twee schermen. Eindeloze mogelijkheden.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── 3DS BOOT (2011) ───────────────────────────────────────
// Black background. Red squares flash in corners.
// "Nintendo" and "DS" text visible, then move backward (shrink).
// Red "3" zooms in to fill the gap.

function ThreeDSBoot() {
  return (
    <motion.div
      key="3ds-boot"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Red squares in corners */}
      <motion.div
        className="absolute top-[15%] left-[15%] w-6 h-6 sm:w-8 sm:h-8"
        style={{ background: '#dc2626' }}
        animate={{ opacity: [0, 1, 0, 0, 0], scale: [0.5, 1, 0.5, 0, 0] }}
        transition={{ duration: 3, times: [0, 0.1, 0.2, 0.25, 1] }}
      />
      <motion.div
        className="absolute bottom-[15%] right-[15%] w-6 h-6 sm:w-8 sm:h-8"
        style={{ background: '#dc2626' }}
        animate={{ opacity: [0, 1, 0, 0, 0], scale: [0.5, 1, 0.5, 0, 0] }}
        transition={{ duration: 3, times: [0, 0.1, 0.2, 0.25, 1] }}
      />

      <div className="relative flex items-center">
        {/* "Nintendo" text — moves backward (shrinks) */}
        <motion.span
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide"
          style={{ fontFamily: 'system-ui, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0.7],
            scale: [1, 1, 1, 0.7],
            x: [0, 0, 0, -30],
          }}
          transition={{ duration: 3, times: [0, 0.15, 0.45, 0.7], ease: 'easeInOut' }}
        >
          Nintendo
        </motion.span>

        {/* The red "3" — zooms in dramatically between Nintendo and DS */}
        <motion.span
          className="text-6xl sm:text-7xl lg:text-9xl font-black mx-1"
          style={{ color: '#dc2626', fontFamily: 'system-ui, sans-serif' }}
          initial={{ opacity: 0, scale: 0, rotate: -15 }}
          animate={{
            opacity: [0, 0, 0, 1, 1],
            scale: [0, 0, 0, 1.2, 1],
            rotate: [- 15, -15, -15, 5, 0],
          }}
          transition={{ duration: 3, times: [0, 0, 0.5, 0.65, 0.75], ease: [0.16, 1, 0.3, 1] }}
        >
          3
        </motion.span>

        {/* "DS" text — moves backward too */}
        <motion.span
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide"
          style={{ fontFamily: 'system-ui, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0.7],
            scale: [1, 1, 1, 0.7],
            x: [0, 0, 0, 30],
          }}
          transition={{ duration: 3, times: [0, 0.15, 0.45, 0.7], ease: 'easeInOut' }}
        >
          DS
        </motion.span>
      </div>

      {/* 3D LED glow */}
      <motion.div
        className="absolute w-3 h-3 rounded-full"
        style={{ background: '#dc2626', boxShadow: '0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3)' }}
        initial={{ opacity: 0, top: '42%', right: '28%' }}
        animate={{ opacity: [0, 0, 0, 1] }}
        transition={{ duration: 3, times: [0, 0, 0.65, 0.75] }}
      />

      {/* Era label */}
      <motion.div
        className="absolute bottom-[20%] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 1] }}
        transition={{ duration: 4.5, times: [0, 0, 0.78, 0.9] }}
      >
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400">
          2011 &mdash; Nintendo 3DS
        </p>
        <p className="text-sm text-white/30 mt-2 font-light">
          Een nieuwe dimensie. Letterlijk.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── EMOTIONAL SCENE ───────────────────────────────────────

function EmotionalScene() {
  const lines = [
    'Die uren.',
    'Die levels.',
    'Die glimlach als je weer een stukje verder kwam.',
  ];

  return (
    <motion.div key="emotional" className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050810]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="relative z-10 text-center px-8">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.7, duration: 0.6 }}
            className={`${i === 2 ? 'text-lg sm:text-xl text-white/35 mt-4 font-light' : 'text-2xl sm:text-3xl lg:text-4xl font-semibold text-white/60 tracking-tight'} leading-relaxed`}
          >
            {line}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white/70 tracking-tight mt-8"
        >
          Die games verdienen een{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">nieuw thuis.</span>
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── REVEAL SCENE ──────────────────────────────────────────

function RevealScene({ onStart }: { onStart: () => void }) {
  return (
    <motion.div key="reveal" className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050810]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_50%)]" />
      <div className="relative z-10 text-center px-4">
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.3, duration: 0.4 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] mb-10">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.2em]">REC &bull; 5 rondes &bull; Jouw smaak</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl lg:text-[88px] font-light text-white tracking-[-0.03em] leading-[0.92] mb-6"
        >
          Game<br />
          <span className="relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Finder</span>
            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-red-400/20 to-transparent blur-[2px] select-none pointer-events-none" aria-hidden style={{ transform: 'translate(-2px, 1px)' }}>Finder</span>
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-base text-white/35 max-w-md mx-auto mb-4">
          Wij tonen je steeds twee games.<br />Kies welke je meer aanspreekt.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="text-sm text-white/20 max-w-sm mx-auto mb-12 font-mono">
          Na 5 rondes kennen wij jouw smaak en vinden we jouw perfecte game.
        </motion.p>

        <motion.button
          onClick={onStart}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-300"
        >
          Start de Game Finder
          <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── MAIN NOSTALGIA FILM ───────────────────────────────────

export default function NostalgiaFilm({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let elapsed = 0;
    const timers: NodeJS.Timeout[] = [];
    STEP_DURATIONS.forEach((duration, i) => {
      elapsed += duration;
      timers.push(setTimeout(() => setStep(i + 1), elapsed));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSkip = useCallback(() => setStep(12), []);

  const isGlitch = step === 2 || step === 4 || step === 6 || step === 8;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <FilmGrain />
      <Scanlines />
      <Letterbox />
      <VHSTimestamp step={step} />

      {step >= 1 && step < 12 && (
        <motion.button
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-[10vh] right-6 z-[75] text-[11px] font-mono text-white/20 hover:text-white/50 transition-colors uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06]"
        >
          Skip intro &rarr;
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && <CRTBoot key="boot" />}
        {step === 1 && <TitleScene key="title" />}
        {isGlitch && <VHSGlitch key={`glitch-${step}`} />}
        {step === 3 && <GameBoyBoot key="gb" />}
        {step === 5 && <GBABoot key="gba" />}
        {step === 7 && <DSBoot key="ds" />}
        {step === 9 && <ThreeDSBoot key="3ds" />}
        {step === 10 && <VHSTracking key="tracking" />}
        {step === 11 && <EmotionalScene key="emotional" />}
        {step >= 12 && <RevealScene key="reveal" onStart={onStart} />}
      </AnimatePresence>
    </div>
  );
}
