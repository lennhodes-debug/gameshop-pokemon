'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Combo event systeem — luistert naar custom events van CartProvider
export default function ComboOverlay() {
  const [combo, setCombo] = useState(0);
  const [visible, setVisible] = useState(false);
  const [legendary, setLegendary] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const COMBO_WINDOW = 3000; // 3 seconden om combo op te bouwen

  const spawnParticles = useCallback((count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; life: number; maxLife: number;
      shape: 'circle' | 'star';
    }> = [];

    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#ffffff', '#a3e635'];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      const y = canvas.height + 20;
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -(6 + Math.random() * 10),
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 40 + Math.random() * 40,
        shape: Math.random() > 0.5 ? 'circle' : 'star',
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.vx *= 0.99;
        p.life++;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (alpha <= 0) continue;
        alive = true;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          // Ster tekenen
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.1);
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const a = (s * Math.PI * 2) / 5 - Math.PI / 2;
            const r = p.size * alpha;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            const ia = a + Math.PI / 5;
            ctx.lineTo(Math.cos(ia) * r * 0.4, Math.sin(ia) * r * 0.4);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (alive) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    // Cleanup na max particle lifetime
    setTimeout(() => cancelAnimationFrame(frame), 3000);
  }, []);

  const handleAddToCart = useCallback(() => {
    setCombo(prev => {
      const newCombo = prev + 1;

      // Reset timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCombo(0);
        setVisible(false);
        setLegendary(false);
      }, COMBO_WINDOW);

      // Toon overlay bij 2+ combo
      if (newCombo >= 2) {
        setVisible(true);
        // Particles geschaald op combo
        spawnParticles(Math.min(newCombo * 15, 100));

        // Legendary bij 5x
        if (newCombo >= 5) {
          setLegendary(true);
        }
      }

      return newCombo;
    });
  }, [spawnParticles]);

  useEffect(() => {
    // Luister naar custom event vanuit CartProvider
    window.addEventListener('gameshop:add-to-cart', handleAddToCart);
    return () => {
      window.removeEventListener('gameshop:add-to-cart', handleAddToCart);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleAddToCart]);

  const comboLabels: Record<number, string> = {
    2: 'DOUBLE!',
    3: 'TRIPLE!',
    4: 'MEGA!',
    5: 'LEGENDARY!',
  };

  const comboColors: Record<number, string> = {
    2: 'from-emerald-400 to-teal-400',
    3: 'from-cyan-400 to-blue-400',
    4: 'from-purple-400 to-pink-400',
    5: 'from-amber-400 via-yellow-300 to-amber-400',
  };

  const label = comboLabels[Math.min(combo, 5)] || `${combo}x COMBO!`;
  const gradient = comboColors[Math.min(combo, 5)] || 'from-amber-400 to-yellow-300';

  return (
    <>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9990] pointer-events-none"
      />

      {/* Combo counter */}
      <AnimatePresence>
        {visible && combo >= 2 && (
          <motion.div
            key={`combo-${combo}`}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[9991] pointer-events-none"
            initial={{ opacity: 0, scale: 0.3, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
            }}
          >
            <div className="flex flex-col items-center gap-1">
              {/* Combo multiplier nummer */}
              <motion.span
                className={`text-6xl sm:text-8xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent drop-shadow-lg`}
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, -3, 3, 0],
                }}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                }}
              >
                {combo}x
              </motion.span>

              {/* Label */}
              <motion.span
                className={`text-lg sm:text-2xl font-extrabold tracking-[0.2em] bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '0.2em' }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {label}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legendary banner */}
      <AnimatePresence>
        {legendary && (
          <motion.div
            className="fixed top-1/2 left-0 right-0 -translate-y-1/2 z-[9992] pointer-events-none"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="bg-gradient-to-r from-transparent via-amber-500/20 to-transparent py-6 backdrop-blur-sm">
              <motion.p
                className="text-center text-3xl sm:text-5xl font-black tracking-[0.3em] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(245, 158, 11, 0.3)',
                    '0 0 40px rgba(245, 158, 11, 0.5)',
                    '0 0 20px rgba(245, 158, 11, 0.3)',
                  ],
                }}
                transition={{ duration: 1, repeat: 2 }}
              >
                LEGENDARY SHOPPER
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
