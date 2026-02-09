'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, AnimatePresence } from 'framer-motion';

const CONSOLES = [
  { name: 'NES', fullName: 'NES', era: '1985', games: 60, desc: 'Waar het allemaal begon', image: '/images/nintendo/nes-console.webp', color: '#6b7280', platform: 'NES' },
  { name: 'Game Boy', fullName: 'Game Boy', era: '1989', games: 63, desc: 'Gaming voor onderweg', image: '/images/nintendo/gameboy-console.webp', color: '#84cc16', platform: 'Game Boy' },
  { name: 'SNES', fullName: 'Super Nintendo', era: '1991', games: 46, desc: '16-bit meesterwerken', image: '/images/nintendo/snes-console.webp', color: '#9ca3af', platform: 'Super Nintendo' },
  { name: 'N64', fullName: 'Nintendo 64', era: '1996', games: 62, desc: 'De 3D revolutie', image: '/images/nintendo/n64-console.webp', color: '#22c55e', platform: 'Nintendo 64' },
  { name: 'GBC', fullName: 'Game Boy Color', era: '1998', games: 63, desc: 'Kleur op zak', image: '/images/nintendo/gbc-console.webp', color: '#eab308', platform: 'Game Boy Color' },
  { name: 'GBA', fullName: 'Game Boy Advance', era: '2001', games: 57, desc: '32-bit handheld kracht', image: '/images/nintendo/gba-console.webp', color: '#6366f1', platform: 'Game Boy Advance' },
  { name: 'GameCube', fullName: 'GameCube', era: '2001', games: 59, desc: 'Compact maar krachtig', image: '/images/nintendo/gamecube-console.webp', color: '#818cf8', platform: 'GameCube' },
  { name: 'DS', fullName: 'Nintendo DS', era: '2004', games: 59, desc: 'Dubbel scherm innovatie', image: '/images/nintendo/ds-console.webp', color: '#64748b', platform: 'Nintendo DS' },
  { name: 'Wii', fullName: 'Wii', era: '2006', games: 69, desc: 'Beweging als controller', image: '/images/nintendo/wii-console.webp', color: '#22d3ee', platform: 'Wii' },
  { name: '3DS', fullName: 'Nintendo 3DS', era: '2011', games: 59, desc: '3D zonder bril', image: '/images/nintendo/3ds-console.webp', color: '#0ea5e9', platform: 'Nintendo 3DS' },
  { name: 'Wii U', fullName: 'Wii U', era: '2012', games: 53, desc: 'Tweede scherm gaming', image: '/images/nintendo/wiiu-console.webp', color: '#3b82f6', platform: 'Wii U' },
  { name: 'Switch', fullName: 'Nintendo Switch', era: '2017', games: 163, desc: 'Thuis én onderweg', image: '/images/nintendo/switch-console.webp', color: '#ef4444', platform: 'Nintendo Switch' },
];

function AnimatedCount({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(0);
    const duration = 800;
    const start = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * value));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <div ref={ref} className="text-3xl lg:text-4xl font-black tabular-nums text-emerald-400">{count}</div>;
}

export default function ConsoleMuseum() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    return scrollYProgress.on('change', (value) => {
      const total = CONSOLES.length;
      const idx = value >= 0.99 ? total - 1 : Math.min(total - 1, Math.floor(value * total));
      setActiveIdx(idx);
    });
  }, [scrollYProgress]);

  const active = CONSOLES[activeIdx];

  return (
    <div ref={sectionRef} className="h-[250vh] relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#050810] flex items-center justify-center">
        {/* Dynamische achtergrond glow per console */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: `radial-gradient(ellipse at 50% 35%, ${active.color}18 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, ${active.color}08 0%, transparent 40%)`,
          }}
          transition={{ duration: 0.8 }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Jaar watermark */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.era}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
            animate={{ opacity: 0.035, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[20vw] font-black text-white tracking-tighter leading-none">
              {active.era}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Header */}
        <div className="absolute top-6 lg:top-10 left-0 right-0 text-center z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-wider"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Console Museum
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-4xl font-extrabold text-white mt-3 tracking-tight"
          >
            40 jaar <span className="gradient-text">Nintendo</span>
          </motion.h2>
        </div>

        {/* Console display — centraal */}
        <div className="relative z-10 flex flex-col items-center mt-4">
          {/* Spotlight boven console */}
          <motion.div
            className="absolute -top-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
            animate={{ backgroundColor: `${active.color}30` }}
            transition={{ duration: 0.6 }}
          />

          {/* Console afbeelding */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              className="relative w-56 h-36 sm:w-72 sm:h-44 lg:w-[420px] lg:h-[260px]"
              initial={{ opacity: 0, y: 50, scale: 0.8, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: -50, scale: 0.8, rotateX: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: '800px' }}
            >
              <Image
                src={active.image}
                alt={active.fullName}
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 288px, 224px"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Glazen podium */}
          <div className="relative mt-2">
            <div className="w-64 sm:w-80 lg:w-[28rem] h-[2px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="mx-auto w-40 sm:w-56 lg:w-72 h-12 bg-gradient-to-b from-white/[0.04] to-transparent rounded-b-3xl" />
            {/* Reflectie gloed */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] rounded-full blur-sm"
              animate={{ backgroundColor: `${active.color}60` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          {/* Info panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              className="text-center -mt-2"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {active.fullName}
              </h3>
              <p className="text-base sm:text-lg text-white/40 mt-1.5 font-medium">
                {active.era} · {active.desc}
              </p>

              <div className="flex items-center justify-center gap-6 sm:gap-8 mt-5">
                <div className="text-center">
                  <AnimatedCount value={active.games} />
                  <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider mt-0.5">Games</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <Link
                  href={`/shop?platform=${encodeURIComponent(active.platform)}`}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-white text-sm font-semibold hover:bg-white/[0.12] transition-all duration-300"
                  style={{
                    borderColor: `${active.color}30`,
                    boxShadow: `0 0 20px ${active.color}10`,
                  }}
                >
                  Bekijk collectie
                  <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Timeline dots onderaan */}
        <div className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-1.5 sm:gap-2">
          {CONSOLES.map((c, i) => (
            <button
              key={c.name}
              className="flex flex-col items-center gap-1 group"
              aria-label={`${c.fullName} (${c.era})`}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeIdx ? 12 : 8,
                  height: i === activeIdx ? 12 : 8,
                  backgroundColor: i === activeIdx ? active.color : i < activeIdx ? `${CONSOLES[i].color}60` : 'rgba(255,255,255,0.1)',
                  boxShadow: i === activeIdx ? `0 0 12px ${active.color}80` : 'none',
                }}
              />
              {i === activeIdx && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[8px] sm:text-[9px] text-white/50 font-semibold whitespace-nowrap"
                >
                  {c.era}
                </motion.span>
              )}
            </button>
          ))}
        </div>

        {/* Scroll indicator rechts */}
        <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-2">
          <motion.div
            className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] [writing-mode:vertical-lr]">
            Scroll
          </span>
        </div>

        {/* Progressie lijn bovenaan */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.03]">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${((activeIdx + 1) / CONSOLES.length) * 100}%`,
              backgroundColor: active.color,
              boxShadow: `0 0 10px ${active.color}60`,
              transition: 'width 0.4s ease, background-color 0.6s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
