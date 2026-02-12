'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

const FLOATING_ICONS = [
  { size: 20, x: '10%', y: '20%', delay: 0, duration: 8 },
  { size: 14, x: '85%', y: '15%', delay: 2, duration: 10 },
  { size: 18, x: '75%', y: '70%', delay: 1, duration: 9 },
  { size: 12, x: '20%', y: '75%', delay: 3, duration: 11 },
  { size: 16, x: '50%', y: '10%', delay: 4, duration: 7 },
  { size: 10, x: '40%', y: '85%', delay: 2.5, duration: 12 },
];

const HERO_TITLE_WORDS = ['Gameshop', 'Enter'];

const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function TypewriterText({ text, delay = 1 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          if (interval) clearInterval(interval);
          setTimeout(() => setShowCursor(false), 2000);
        }
      }, 35);
    }, delay * 1000);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <span>
      {displayed}
      {showCursor && <span className="animate-pulse text-emerald-400">|</span>}
    </span>
  );
}

function MagneticCTA({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * 0.15);
      y.set((e.clientY - centerY) * 0.15);
    },
    [x, y],
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div style={{ x: springX, y: springY }} className="inline-flex">
      <Link
        ref={ref}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={
          primary
            ? 'inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse-glow'
            : 'inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white/[0.08] border border-white/[0.12] text-white font-bold text-sm hover:bg-white/[0.14] transition-all duration-300'
        }
      >
        {children}
      </Link>
    </motion.div>
  );
}

interface RingPulse {
  id: number;
  x: number;
  y: number;
}

function ClickRipples({ rings }: { rings: RingPulse[] }) {
  return (
    <>
      {rings.map((ring) => (
        <motion.div
          key={ring.id}
          className="absolute rounded-full border border-emerald-400/40 pointer-events-none"
          style={{ left: ring.x, top: ring.y, translateX: '-50%', translateY: '-50%' }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

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

function HeroBg({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Primaire pokeball — langzame rotatie */}
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

      {/* Secundaire ring — tegengestelde rotatie met gestreepte lijn */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute w-[400px] h-[400px] lg:w-[550px] lg:h-[550px] opacity-[0.025]"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="8 12" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 8" />
      </motion.svg>

      {/* Pulserende glow — primair */}
      <motion.div
        className="absolute w-64 h-64 lg:w-96 lg:h-96 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{
          scale: { times: [0, 0.5, 1], duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          opacity: { times: [0, 0.5, 1], duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
        }}
      />
      {/* Glow — secundair */}
      <motion.div
        className="absolute w-64 h-64 lg:w-96 lg:h-96 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.2 }}
      />
      {/* Diepte-laag: verre ademende glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)',
        }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {FLOATING_ICONS.map((ball, i) => {
        const ballCenterX = parseFloat(ball.x) / 100;
        const ballCenterY = parseFloat(ball.y) / 100;
        const dx = mouseX > 0 ? (ballCenterX * 1000 - mouseX) / 40 : 0;
        const dy = mouseY > 0 ? (ballCenterY * 800 - mouseY) / 40 : 0;
        const repelX = Math.max(-15, Math.min(15, dx));
        const repelY = Math.max(-15, Math.min(15, dy));

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: ball.x, top: ball.y }}
            animate={{
              y: [repelY, repelY - 15, repelY + 5, repelY - 10, repelY],
              x: [repelX, repelX + 8, repelX - 5, repelX + 3, repelX],
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
        );
      })}
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [clickRings, setClickRings] = useState<RingPulse[]>([]);
  const [rawMousePos, setRawMousePos] = useState({ x: 0, y: 0 });
  const ringIdRef = useRef(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  const spotlightBg = useMotionTemplate`radial-gradient(600px circle at ${springX}px ${springY}px, rgba(16,185,129,0.08), transparent 60%)`;

  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouseX.set(x);
        mouseY.set(y);
        setRawMousePos({ x, y });
      }
    },
    [mouseX, mouseY],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ringIdRef.current++;
      setClickRings((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setClickRings((prev) => prev.filter((r) => r.id !== id));
      }, 1300);
    },
    [],
  );

  return (
    <section
      ref={heroRef}
      className="relative bg-[#050810] overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />

      <motion.div className="absolute inset-0 pointer-events-none" style={{ background: spotlightBg }} />

      <ClickRipples rings={clickRings} />

      <HeroBg mouseX={rawMousePos.x} mouseY={rawMousePos.y} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-44 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1]">
            <span className="text-white/70 text-xs font-medium">Nintendo specialist</span>
            <span className="text-white/30">|</span>
            <span className="text-emerald-400 text-xs font-bold">5.0</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  className="h-2.5 w-2.5 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 260, damping: 15 }}
                >
                  <path d={STAR_PATH} />
                </motion.svg>
              ))}
            </div>
            <span className="text-white/40 text-xs">1360+ reviews</span>
          </div>
        </motion.div>

        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
          {HERO_TITLE_WORDS.map((word, i) => (
            <span key={word}>
              {i > 0 && <br />}
              <span className="inline-block overflow-hidden" style={{ perspective: '600px' }}>
                <motion.span
                  className={`inline-block ${i === 1 ? 'bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-text-shimmer' : ''}`}
                  initial={{ y: '120%', rotateX: -80, opacity: 0, filter: 'blur(8px)' }}
                  animate={{ y: '0%', rotateX: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.9,
                    delay: 0.3 + i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ transformOrigin: 'bottom center', backgroundSize: i === 1 ? '200% auto' : undefined }}
                >
                  {word}
                </motion.span>
              </span>
              {i === 1 && (
                <motion.span
                  className="absolute inset-0 inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 pointer-events-none"
                  style={{ perspective: '600px' }}
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{
                    textShadow: [
                      '0 0 0px rgba(16,185,129,0)',
                      '0 0 30px rgba(16,185,129,0.3)',
                      '0 0 0px rgba(16,185,129,0)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                />
              )}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-xl mx-auto"
        >
          <TypewriterText
            text="De Nintendo specialist van Nederland — retro & modern. Originele games, persoonlijk getest en met liefde verpakt."
            delay={1}
          />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <MagneticCTA href="/shop" primary>
            Bekijk de collectie
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticCTA>
          <MagneticCTA href="/inkoop">Games verkopen</MagneticCTA>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ opacity: scrollOpacity }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg
            className="h-6 w-6 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Geanimeerde gradient lijn boven de overgang */}
      <motion.div
        className="absolute bottom-24 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(6,182,212,0.3), transparent)' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
