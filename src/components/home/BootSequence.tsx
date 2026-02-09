'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BootSequence() {
  const [phase, setPhase] = useState<'idle' | 'logo' | 'text' | 'burst' | 'warp' | 'done'>('idle');
  const [skip, setSkip] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [warpRadius, setWarpRadius] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('gameshop-booted')) {
      setPhase('done');
      return;
    }

    setPhase('logo');
    const t1 = setTimeout(() => setPhase('text'), 1200);
    const t2 = setTimeout(() => setPhase('burst'), 2200);
    const t3 = setTimeout(() => setPhase('warp'), 2900);
    const t4 = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('gameshop-booted', '1');
    }, 4400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Skip bij klik
  useEffect(() => {
    if (skip || phase === 'done') return;
    const handleClick = () => {
      setSkip(true);
      setPhase('done');
      sessionStorage.setItem('gameshop-booted', '1');
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [skip, phase]);

  // Particle burst animatie
  useEffect(() => {
    if (phase !== 'burst') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; life: number; maxLife: number;
    }> = [];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const colors = ['#10b981', '#06b6d4', '#34d399', '#a3e635', '#22d3ee', '#ffffff'];

    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80 + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 8;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 30 + Math.random() * 30,
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.98;
        p.life++;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (alpha <= 0) continue;
        alive = true;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Warp portal animatie — circulaire reveal
  useEffect(() => {
    if (phase !== 'warp') return;
    const start = performance.now();
    const duration = 1400;
    let frame: number;

    const animate = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // Ease-out quartic voor dramatische opening
      const eased = 1 - Math.pow(1 - p, 4);
      setWarpRadius(eased * 120);
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  if (phase === 'done' || phase === 'idle') return null;

  const isWarp = phase === 'warp';
  const ringOpacity = Math.max(0, 1 - warpRadius / 80);

  return (
    <AnimatePresence>
      {(
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Achtergrond — vast of met portaal-gat */}
          <div
            className="absolute inset-0"
            style={isWarp ? {
              background: `radial-gradient(circle at 50% 50%, transparent ${warpRadius}vmax, #050810 ${warpRadius + 0.4}vmax)`,
            } : {
              backgroundColor: '#050810',
            }}
          />

          {/* Groene gloeiende ring op de rand van het portaal */}
          {isWarp && warpRadius > 0 && (
            <>
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${warpRadius * 2}vmax`,
                  height: `${warpRadius * 2}vmax`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: `2px solid rgba(16, 185, 129, ${ringOpacity * 0.7})`,
                  boxShadow: `
                    0 0 40px 8px rgba(16, 185, 129, ${ringOpacity * 0.35}),
                    0 0 80px 16px rgba(6, 182, 212, ${ringOpacity * 0.15}),
                    inset 0 0 40px 8px rgba(16, 185, 129, ${ringOpacity * 0.2})
                  `,
                }}
              />

              {/* Vonken langs de ring */}
              {warpRadius < 90 && Array.from({ length: 16 }).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 16 + warpRadius * 0.02;
                // vmax naar viewport-eenheden benadering
                const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
                const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
                const vmax = Math.max(vw, vh);
                const rPx = (warpRadius / 100) * vmax;
                const sparkX = vw / 2 + Math.cos(angle) * rPx;
                const sparkY = vh / 2 + Math.sin(angle) * rPx;
                return (
                  <div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 3 + Math.random() * 2,
                      height: 3 + Math.random() * 2,
                      left: sparkX,
                      top: sparkY,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: i % 3 === 0 ? '#34d399' : i % 3 === 1 ? '#06b6d4' : '#a3e635',
                      opacity: ringOpacity * (0.5 + Math.random() * 0.5),
                      boxShadow: `0 0 6px rgba(16, 185, 129, ${ringOpacity * 0.8})`,
                    }}
                  />
                );
              })}
            </>
          )}

          {/* Logo + tekst content — verberg tijdens warp */}
          {!isWarp && (
            <>
              {/* Achtergrond glow */}
              <motion.div
                className="absolute w-[400px] h-[400px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 1.5], opacity: [0, 0.8, 0.4] }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />

              {/* SVG controller met stroke animatie */}
              <motion.div className="relative z-10 flex flex-col items-center">
                <motion.svg
                  viewBox="0 0 120 80"
                  className="w-32 h-20 sm:w-48 sm:h-28"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.path
                    d="M20 25 C20 15, 100 15, 100 25 L105 55 C105 65, 95 70, 85 60 L80 55 L40 55 L35 60 C25 70, 15 65, 15 55 Z"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                  <motion.path
                    d="M38 35 L38 30 L42 30 L42 35 L47 35 L47 39 L42 39 L42 44 L38 44 L38 39 L33 39 L33 35 Z"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                  />
                  <motion.circle
                    cx="78" cy="32" r="4"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8, type: 'spring', stiffness: 300 }}
                  />
                  <motion.circle
                    cx="88" cy="38" r="4"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.9, type: 'spring', stiffness: 300 }}
                  />
                </motion.svg>

                {/* POWER ON tekst */}
                <AnimatePresence>
                  {(phase === 'text' || phase === 'burst') && (
                    <motion.div
                      className="mt-6 flex flex-col items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="text-2xl sm:text-4xl font-extrabold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                        POWER ON
                      </span>
                      <motion.div
                        className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                      <span className="text-xs text-slate-500 tracking-widest uppercase mt-1">
                        Gameshop Enter
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          )}

          {/* Particle burst canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-20 pointer-events-none"
          />

          {/* Skip hint */}
          {!isWarp && (
            <motion.span
              className="absolute bottom-8 text-xs text-slate-600 tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
            >
              Klik om over te slaan
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
