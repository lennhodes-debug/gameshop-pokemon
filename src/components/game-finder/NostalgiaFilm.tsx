'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── SCENE TIMING ──────────────────────────────────────────
// step → duration before advancing to next step (ms)
const STEP_DURATIONS = [
  2000,  // 0: CRT boot
  2800,  // 1: "Gameshop Enter presenteert"
  500,   // 2: VHS glitch
  4200,  // 3: Game Boy era
  500,   // 4: VHS glitch
  4200,  // 5: GBA era
  500,   // 6: VHS glitch
  4200,  // 7: DS era
  500,   // 8: VHS glitch
  4200,  // 9: 3DS era
  900,   // 10: VHS full tracking
  4000,  // 11: Emotional text
  // 12: Reveal — stays indefinitely
];

// ─── FILM GRAIN OVERLAY ────────────────────────────────────

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

// ─── CRT SCANLINES ─────────────────────────────────────────

function Scanlines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[65]">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.4) 0px,
            rgba(0,0,0,0.4) 1px,
            transparent 1px,
            transparent 3px
          )`,
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
}

// ─── VHS TIMESTAMP ─────────────────────────────────────────

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-6 right-6 z-[72] font-mono text-[11px] text-white/20 tabular-nums"
    >
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500/60 animate-pulse" />
        <span>REC</span>
        <span>{time}</span>
      </div>
    </motion.div>
  );
}

// ─── LETTERBOX BARS ────────────────────────────────────────

function Letterbox() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[8vh] bg-black z-[68]" />
      <div className="fixed bottom-0 left-0 right-0 h-[8vh] bg-black z-[68]" />
    </>
  );
}

// ─── CRT BOOT SEQUENCE ────────────────────────────────────

function CRTBoot() {
  return (
    <motion.div
      key="boot"
      className="fixed inset-0 flex items-center justify-center bg-black z-[60]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Horizontal line that expands */}
      <motion.div
        className="absolute bg-white/80"
        style={{ left: '10%', right: '10%', height: '2px', top: '50%', translateY: '-50%' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: [0, 1, 1, 1],
          scaleY: [1, 1, 200, 600],
          opacity: [0, 0.9, 0.6, 0],
        }}
        transition={{
          duration: 1.8,
          times: [0, 0.3, 0.6, 1],
          ease: 'easeInOut',
        }}
      />

      {/* Brief phosphor flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.15, 0] }}
        transition={{ duration: 1.8, times: [0, 0.55, 0.65, 0.8] }}
      />

      {/* Static noise appearing */}
      <motion.div
        className="absolute inset-0 opacity-0"
        animate={{ opacity: [0, 0, 0.1, 0.05] }}
        transition={{ duration: 1.8, times: [0, 0.5, 0.7, 1] }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
    </motion.div>
  );
}

// ─── VHS GLITCH TRANSITION ─────────────────────────────────

function VHSGlitch() {
  const bars = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        y: Math.random() * 100,
        h: Math.random() * 6 + 1,
        delay: Math.random() * 0.2,
        opacity: Math.random() * 0.5 + 0.1,
      })),
    [],
  );

  return (
    <motion.div
      key="glitch"
      className="fixed inset-0 z-[60] bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, times: [0, 0.1, 0.7, 1] }}
    >
      {/* Static */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }}
      />
      {/* Distortion bars */}
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className="absolute left-0 right-0 bg-white"
          style={{ top: `${bar.y}%`, height: `${bar.h}px`, opacity: bar.opacity }}
          animate={{ scaleX: [0, 1.2, 0], x: ['-30%', '15%', '40%'] }}
          transition={{ duration: 0.35, delay: bar.delay }}
        />
      ))}
    </motion.div>
  );
}

// ─── VHS FULL TRACKING ─────────────────────────────────────

function VHSTracking() {
  return (
    <motion.div
      key="tracking"
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.85, times: [0, 0.1, 0.75, 1] }}
    >
      {/* Heavy static */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      {/* Rolling bar */}
      <motion.div
        className="absolute left-0 right-0 h-20 bg-white/[0.08]"
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 0.7, ease: 'linear' }}
      />
      {/* Chromatic "TRACKING" text */}
      <div className="relative">
        <span className="absolute text-3xl font-bold text-red-500/25 blur-[1px]" style={{ transform: 'translate(-3px, 1px)' }}>
          TRACKING...
        </span>
        <span className="absolute text-3xl font-bold text-cyan-500/25 blur-[1px]" style={{ transform: 'translate(3px, -1px)' }}>
          TRACKING...
        </span>
        <motion.span
          className="text-3xl font-bold text-white/40"
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.7, times: [0, 0.4, 1] }}
        >
          TRACKING...
        </motion.span>
      </div>
    </motion.div>
  );
}

// ─── CONSOLE SVGs ──────────────────────────────────────────

function GameBoySVG({ glowColor }: { glowColor: string }) {
  return (
    <svg viewBox="0 0 160 240" fill="none" className="w-full h-full">
      {/* Body */}
      <rect x="20" y="10" width="120" height="220" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Screen bezel */}
      <rect x="35" y="25" width="90" height="80" rx="4" fill="rgba(0,0,0,0.4)" />
      {/* Screen (glowing) */}
      <rect x="42" y="32" width="76" height="66" rx="2" fill={glowColor} opacity="0.15" />
      {/* Screen shine */}
      <rect x="42" y="32" width="76" height="33" rx="2" fill="rgba(255,255,255,0.04)" />
      {/* Power LED */}
      <circle cx="38" cy="22" r="2.5" fill="#ef4444" opacity="0.8" />
      {/* D-pad */}
      <rect x="40" y="125" width="12" height="36" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="34" y="137" width="24" height="12" rx="2" fill="rgba(255,255,255,0.08)" />
      {/* A B buttons */}
      <circle cx="114" cy="135" r="10" fill="rgba(255,255,255,0.08)" />
      <circle cx="96" cy="145" r="10" fill="rgba(255,255,255,0.08)" />
      {/* A B labels */}
      <text x="114" y="139" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontWeight="bold">A</text>
      <text x="96" y="149" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontWeight="bold">B</text>
      {/* Start Select */}
      <rect x="56" y="175" width="18" height="6" rx="3" fill="rgba(255,255,255,0.06)" transform="rotate(-25 65 178)" />
      <rect x="82" y="175" width="18" height="6" rx="3" fill="rgba(255,255,255,0.06)" transform="rotate(-25 91 178)" />
      {/* Speaker grille */}
      <line x1="95" y1="195" x2="115" y2="185" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <line x1="95" y1="200" x2="115" y2="190" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <line x1="95" y1="205" x2="115" y2="195" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <line x1="95" y1="210" x2="115" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      {/* Nintendo logo placeholder */}
      <text x="80" y="117" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="7" letterSpacing="2" fontWeight="600">GAME BOY</text>
    </svg>
  );
}

function GBASVG({ glowColor }: { glowColor: string }) {
  return (
    <svg viewBox="0 0 280 160" fill="none" className="w-full h-full">
      {/* Body — landscape */}
      <rect x="10" y="10" width="260" height="140" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Screen bezel */}
      <rect x="75" y="22" width="130" height="90" rx="4" fill="rgba(0,0,0,0.4)" />
      {/* Screen (glowing) */}
      <rect x="82" y="28" width="116" height="78" rx="2" fill={glowColor} opacity="0.12" />
      {/* Screen shine */}
      <rect x="82" y="28" width="116" height="39" rx="2" fill="rgba(255,255,255,0.03)" />
      {/* Power LED */}
      <circle cx="75" cy="18" r="2" fill="#22c55e" opacity="0.7" />
      {/* D-pad */}
      <rect x="30" y="52" width="10" height="32" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="24" y="62" width="22" height="12" rx="2" fill="rgba(255,255,255,0.08)" />
      {/* A B buttons */}
      <circle cx="242" cy="62" r="9" fill="rgba(255,255,255,0.08)" />
      <circle cx="226" cy="74" r="9" fill="rgba(255,255,255,0.08)" />
      {/* Shoulder buttons */}
      <rect x="10" y="6" width="60" height="8" rx="4" fill="rgba(255,255,255,0.04)" />
      <rect x="210" y="6" width="60" height="8" rx="4" fill="rgba(255,255,255,0.04)" />
      {/* Label */}
      <text x="140" y="128" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="6" letterSpacing="2" fontWeight="600">GAME BOY ADVANCE</text>
    </svg>
  );
}

function DSSVG({ glowColor }: { glowColor: string }) {
  return (
    <svg viewBox="0 0 160 260" fill="none" className="w-full h-full">
      {/* Top half */}
      <rect x="10" y="5" width="140" height="115" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Top screen bezel */}
      <rect x="22" y="14" width="116" height="86" rx="3" fill="rgba(0,0,0,0.4)" />
      {/* Top screen (glowing) */}
      <rect x="28" y="20" width="104" height="74" rx="2" fill={glowColor} opacity="0.12" />
      {/* Top screen shine */}
      <rect x="28" y="20" width="104" height="37" rx="2" fill="rgba(255,255,255,0.03)" />
      {/* Hinge */}
      <rect x="30" y="118" width="100" height="8" rx="4" fill="rgba(255,255,255,0.04)" />
      {/* Bottom half */}
      <rect x="5" y="124" width="150" height="130" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Bottom (touch) screen bezel */}
      <rect x="22" y="133" width="116" height="86" rx="3" fill="rgba(0,0,0,0.4)" />
      {/* Bottom screen */}
      <rect x="28" y="139" width="104" height="74" rx="2" fill={glowColor} opacity="0.08" />
      {/* D-pad */}
      <rect x="18" y="228" width="8" height="20" rx="2" fill="rgba(255,255,255,0.06)" />
      <rect x="12" y="234" width="20" height="8" rx="2" fill="rgba(255,255,255,0.06)" />
      {/* ABXY */}
      <circle cx="138" cy="232" r="5" fill="rgba(255,255,255,0.06)" />
      <circle cx="128" cy="240" r="5" fill="rgba(255,255,255,0.06)" />
      <circle cx="148" cy="240" r="5" fill="rgba(255,255,255,0.06)" />
      <circle cx="138" cy="248" r="5" fill="rgba(255,255,255,0.06)" />
      {/* Power LED */}
      <circle cx="18" cy="130" r="2" fill="#22c55e" opacity="0.7" />
    </svg>
  );
}

function ThreeDSSVG({ glowColor }: { glowColor: string }) {
  return (
    <svg viewBox="0 0 170 260" fill="none" className="w-full h-full">
      {/* Top half */}
      <rect x="5" y="5" width="160" height="115" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Top screen bezel */}
      <rect x="16" y="14" width="138" height="86" rx="4" fill="rgba(0,0,0,0.4)" />
      {/* 3D depth layers (simulated) */}
      <rect x="23" y="21" width="124" height="72" rx="2" fill={glowColor} opacity="0.06" />
      <rect x="26" y="24" width="118" height="66" rx="2" fill={glowColor} opacity="0.08" />
      <rect x="29" y="27" width="112" height="60" rx="2" fill={glowColor} opacity="0.10" />
      {/* Screen shine */}
      <rect x="29" y="27" width="112" height="30" rx="2" fill="rgba(255,255,255,0.03)" />
      {/* 3D LED */}
      <circle cx="155" cy="18" r="2" fill="#06b6d4" opacity="0.8" />
      {/* Hinge */}
      <rect x="30" y="118" width="110" height="8" rx="4" fill="rgba(255,255,255,0.04)" />
      {/* Bottom half */}
      <rect x="10" y="124" width="150" height="130" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Bottom (touch) screen */}
      <rect x="30" y="134" width="110" height="82" rx="3" fill="rgba(0,0,0,0.4)" />
      <rect x="36" y="140" width="98" height="70" rx="2" fill={glowColor} opacity="0.06" />
      {/* Circle pad */}
      <circle cx="28" cy="234" r="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="28" cy="234" r="4" fill="rgba(255,255,255,0.06)" />
      {/* ABXY */}
      <circle cx="142" cy="228" r="5" fill="rgba(255,255,255,0.06)" />
      <circle cx="132" cy="236" r="5" fill="rgba(255,255,255,0.06)" />
      <circle cx="152" cy="236" r="5" fill="rgba(255,255,255,0.06)" />
      <circle cx="142" cy="244" r="5" fill="rgba(255,255,255,0.06)" />
      {/* Power LED */}
      <circle cx="18" cy="130" r="2" fill="#3b82f6" opacity="0.7" />
    </svg>
  );
}

// ─── ERA SCENE ─────────────────────────────────────────────

interface EraConfig {
  year: string;
  title: string;
  subtitle: string;
  quote: string;
  glowColor: string;
  bgGradient: string;
  accentRgb: string;
  Console: React.FC<{ glowColor: string }>;
  consoleWidth: string;
}

const ERA_CONFIGS: Record<number, EraConfig> = {
  3: {
    year: '1989',
    title: 'Game Boy',
    subtitle: 'Het begin',
    quote: 'Op de achterbank met een zaklamp.\nDe wereld verdwijnt.\nAlleen jij en je Game Boy.',
    glowColor: '#9bbc0f',
    bgGradient: 'radial-gradient(ellipse at 50% 60%, rgba(155,188,15,0.08), transparent 60%)',
    accentRgb: '155, 188, 15',
    Console: GameBoySVG,
    consoleWidth: 'w-28 sm:w-36 lg:w-44',
  },
  5: {
    year: '2001',
    title: 'Game Boy Advance',
    subtitle: '32-bit handheld',
    quote: 'Meer kleuren. Meer levels.\nDatzelfde gevoel. Die zelfde magie.',
    glowColor: '#818cf8',
    bgGradient: 'radial-gradient(ellipse at 50% 60%, rgba(129,140,248,0.08), transparent 60%)',
    accentRgb: '129, 140, 248',
    Console: GBASVG,
    consoleWidth: 'w-44 sm:w-56 lg:w-64',
  },
  7: {
    year: '2004',
    title: 'Nintendo DS',
    subtitle: 'Dual screen',
    quote: 'Twee schermen. Een touchscreen.\nAlles voelde nieuw. Alles kon.',
    glowColor: '#38bdf8',
    bgGradient: 'radial-gradient(ellipse at 50% 60%, rgba(56,189,248,0.08), transparent 60%)',
    accentRgb: '56, 189, 248',
    Console: DSSVG,
    consoleWidth: 'w-28 sm:w-36 lg:w-44',
  },
  9: {
    year: '2011',
    title: 'Nintendo 3DS',
    subtitle: 'Stereoscopisch 3D',
    quote: 'Diepte zonder bril.\nHet voelde als magie.\nEen heel universum in je handen.',
    glowColor: '#06b6d4',
    bgGradient: 'radial-gradient(ellipse at 50% 60%, rgba(6,182,212,0.08), transparent 60%)',
    accentRgb: '6, 182, 212',
    Console: ThreeDSSVG,
    consoleWidth: 'w-28 sm:w-40 lg:w-48',
  },
};

function EraScene({ config }: { config: EraConfig }) {
  const lines = config.quote.split('\n');

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: '#050810' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Era background glow */}
      <div className="absolute inset-0" style={{ background: config.bgGradient }} />

      {/* Huge year watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.03, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <span className="text-[200px] sm:text-[280px] lg:text-[380px] font-black leading-none" style={{ color: `rgba(${config.accentRgb}, 1)` }}>
          {config.year}
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 px-8 max-w-5xl mx-auto">
        {/* Console SVG */}
        <motion.div
          className={`relative ${config.consoleWidth} flex-shrink-0`}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow behind console */}
          <div
            className="absolute inset-0 blur-3xl opacity-20 scale-150"
            style={{ background: `radial-gradient(circle, rgba(${config.accentRgb}, 0.4), transparent 70%)` }}
          />
          {/* Floating animation */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <config.Console glowColor={config.glowColor} />
          </motion.div>
          {/* Reflection */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-4 rounded-full blur-xl opacity-20"
            style={{ background: `rgba(${config.accentRgb}, 0.5)` }}
          />
        </motion.div>

        {/* Text content */}
        <div className="text-center lg:text-left">
          {/* Era badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="h-px w-6" style={{ background: `rgba(${config.accentRgb}, 0.4)` }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: `rgba(${config.accentRgb}, 0.6)` }}>
              {config.subtitle}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-2"
          >
            {config.title}
          </motion.h2>

          {/* Year */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-mono text-white/30 mb-6"
          >
            {config.year}
          </motion.p>

          {/* Quote — typewriter style staggered lines */}
          <div className="space-y-1.5">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.5, duration: 0.5 }}
                className="text-sm sm:text-base text-white/40 leading-relaxed font-light"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── TITLE SCENE ───────────────────────────────────────────

function TitleScene() {
  return (
    <motion.div
      key="title"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050810]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.8em' }}
        animate={{ opacity: 0.5, letterSpacing: '0.4em' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="text-sm sm:text-base font-light text-white uppercase tracking-[0.4em] mb-4"
      >
        Gameshop Enter
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.35, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-lg sm:text-xl text-white/35 italic"
      >
        presenteert
      </motion.p>
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
    <motion.div
      key="emotional"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050810]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_50%)]" />

      <div className="relative z-10 text-center px-8">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.7, duration: 0.6 }}
            className={`${
              i === 2 ? 'text-lg sm:text-xl text-white/35 mt-4 font-light' : 'text-2xl sm:text-3xl lg:text-4xl font-semibold text-white/60 tracking-tight'
            } leading-relaxed`}
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
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            nieuw thuis.
          </span>
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── REVEAL SCENE ──────────────────────────────────────────

function RevealScene({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      key="reveal"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050810]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_50%)]" />

      <div className="relative z-10 text-center px-4">
        {/* REC badge */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] mb-10"
        >
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.2em]">
            REC &bull; 5 rondes &bull; Jouw smaak
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl lg:text-[88px] font-light text-white tracking-[-0.03em] leading-[0.92] mb-6"
        >
          Game
          <br />
          <span className="relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Finder
            </span>
            {/* Chromatic aberration accent */}
            <span
              className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-red-400/20 to-transparent blur-[2px] select-none pointer-events-none"
              aria-hidden
              style={{ transform: 'translate(-2px, 1px)' }}
            >
              Finder
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-base text-white/35 max-w-md mx-auto mb-4"
        >
          Wij tonen je steeds twee games.
          <br />
          Kies welke je meer aanspreekt.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-sm text-white/20 max-w-sm mx-auto mb-12 font-mono"
        >
          Na 5 rondes kennen wij jouw smaak en vinden we jouw perfecte game.
        </motion.p>

        {/* CTA */}
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
          <svg
            className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── MAIN NOSTALGIA FILM ───────────────────────────────────

interface NostalgiaFilmProps {
  onStart: () => void;
}

export default function NostalgiaFilm({ onStart }: NostalgiaFilmProps) {
  const [step, setStep] = useState(0);

  // Schedule all scene transitions
  useEffect(() => {
    let elapsed = 0;
    const timers: NodeJS.Timeout[] = [];

    STEP_DURATIONS.forEach((duration, i) => {
      elapsed += duration;
      timers.push(setTimeout(() => setStep(i + 1), elapsed));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSkip = useCallback(() => {
    setStep(12); // Jump to reveal
  }, []);

  // Determine which visual to show based on step
  const isGlitch = step === 2 || step === 4 || step === 6 || step === 8;
  const isEra = step === 3 || step === 5 || step === 7 || step === 9;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Persistent layers */}
      <FilmGrain />
      <Scanlines />
      <Letterbox />
      <VHSTimestamp step={step} />

      {/* Skip button — always visible after step 1 */}
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

      {/* Scene renderer */}
      <AnimatePresence mode="wait">
        {/* CRT Boot */}
        {step === 0 && <CRTBoot key="boot" />}

        {/* Title */}
        {step === 1 && <TitleScene key="title" />}

        {/* VHS Glitch transitions */}
        {isGlitch && <VHSGlitch key={`glitch-${step}`} />}

        {/* Era scenes */}
        {isEra && ERA_CONFIGS[step] && (
          <EraScene key={`era-${step}`} config={ERA_CONFIGS[step]} />
        )}

        {/* VHS Full tracking */}
        {step === 10 && <VHSTracking key="tracking" />}

        {/* Emotional */}
        {step === 11 && <EmotionalScene key="emotional" />}

        {/* Reveal — Game Finder */}
        {step >= 12 && <RevealScene key="reveal" onStart={onStart} />}
      </AnimatePresence>
    </div>
  );
}
