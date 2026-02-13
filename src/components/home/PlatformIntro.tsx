'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

/* ================================================================
   PLATFORM INTRO — Cinematische Nintendo nostalgie ervaring
   ================================================================ */

const PLATFORMS = [
  {
    name: 'Game Boy',
    year: '1989',
    tagline: 'Waar het allemaal begon',
    accent: '#9BBC0F',
    accentRgb: '155, 188, 15',
    covers: [
      '/images/products/gb-001-pokemon-trading-card-game.webp',
    ],
  },
  {
    name: 'Game Boy\nAdvance',
    year: '2001',
    tagline: 'De volgende generatie',
    accent: '#7B68EE',
    accentRgb: '123, 104, 238',
    covers: [
      '/images/products/gba-001-pokemon-emerald.webp',
      '/images/products/gba-004-pokemon-firered-usa.webp',
      '/images/products/gba-006-pokemon-leafgreen-usa.webp',
      '/images/products/gba-002-pokemon-sapphire-eur.webp',
    ],
  },
  {
    name: 'Nintendo DS',
    year: '2004',
    tagline: 'Twee schermen, dubbel plezier',
    accent: '#94A3B8',
    accentRgb: '148, 163, 184',
    covers: [
      '/images/products/ds-001-pokemon-platinum.webp',
      '/images/products/ds-002-pokemon-soulsilver.webp',
      '/images/products/ds-003-pokemon-heartgold.webp',
      '/images/products/ds-005-pokemon-black.webp',
      '/images/products/ds-006-pokemon-white.webp',
      '/images/products/ds-016-pokemon-black-2.webp',
    ],
  },
  {
    name: 'Nintendo\n3DS',
    year: '2011',
    tagline: 'Een nieuwe dimensie',
    accent: '#EF4444',
    accentRgb: '239, 68, 68',
    covers: [
      '/images/products/3ds-001-pokemon-x.webp',
      '/images/products/3ds-002-pokemon-omega-ruby.webp',
      '/images/products/3ds-003-pokemon-alpha-sapphire.webp',
      '/images/products/3ds-004-pokemon-moon.webp',
    ],
  },
];

/* Timing */
const INTRO_DELAY = 600;
const OPENING_DURATION = 2800;
const SCENE_DURATION = 3600;
const FINALE_DURATION = 2200;

/* ================================================================
   FILM GRAIN overlay
   ================================================================ */
function FilmGrain() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-[0.08]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
    />
  );
}

/* ================================================================
   CINEMATIC BARS (letterbox)
   ================================================================ */
function CinematicBars({ visible }: { visible: boolean }) {
  return (
    <>
      <motion.div
        className="absolute top-0 left-0 right-0 bg-black z-40"
        initial={{ height: '100%' }}
        animate={{ height: visible ? '8%' : '100%' }}
        exit={{ height: '0%' }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black z-40"
        initial={{ height: '100%' }}
        animate={{ height: visible ? '8%' : '100%' }}
        exit={{ height: '0%' }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />
    </>
  );
}

/* ================================================================
   HORIZONTAL COVER RAIL — Eindeloos scrollende covers
   ================================================================ */
function CoverRail({ covers, accent, direction = 1 }: { covers: string[]; accent: string; direction?: number }) {
  // Dupliceer covers zodat ze eindeloos scrollen
  const allCovers = useMemo(() => [...covers, ...covers, ...covers], [covers]);

  return (
    <motion.div
      className="flex gap-4 sm:gap-6"
      initial={{ x: direction > 0 ? '0%' : '-50%' }}
      animate={{ x: direction > 0 ? '-33.33%' : '0%' }}
      transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
    >
      {allCovers.map((cover, i) => (
        <motion.div
          key={`${cover}-${i}`}
          className="relative flex-shrink-0"
          initial={{ opacity: 0, scale: 0.7, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.4 + (i % covers.length) * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div
            className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-2xl overflow-hidden"
            style={{
              boxShadow: `0 25px 80px -15px rgba(0,0,0,0.8), 0 0 40px -10px ${accent}30`,
            }}
          >
            <Image
              src={cover}
              alt=""
              fill
              sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, (max-width: 1024px) 176px, 208px"
              className="object-cover"
              priority
            />
            {/* Glans overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-black/20" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ================================================================
   SINGLE HERO COVER — Groot centraal cover met 3D perspectief
   ================================================================ */
function HeroCover({ cover, accent }: { cover: string; accent: string }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.3, rotateY: -30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
    >
      <div
        className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden"
        style={{
          boxShadow: `
            0 30px 100px -20px rgba(0,0,0,0.9),
            0 0 60px -10px ${accent}40,
            0 0 120px -20px ${accent}20
          `,
        }}
      >
        <Image src={cover} alt="" fill sizes="288px" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-black/30" />
        {/* Sweeping light */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2, delay: 0.8, ease: 'easeInOut' }}
        />
      </div>
      {/* Glow ring */}
      <motion.div
        className="absolute -inset-3 rounded-3xl"
        style={{ border: `1px solid ${accent}30` }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: [0, 0.5, 0], scale: [1.1, 1.0, 1.05] }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
      />
    </motion.div>
  );
}

/* ================================================================
   LIGHT STREAKS — Horizontale lens flares
   ================================================================ */
function LightStreaks({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[0.2, 0.45, 0.7].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute h-[1px] left-0 right-0"
          style={{
            top: `${pos * 100}%`,
            background: `linear-gradient(90deg, transparent, ${accent}15, ${accent}30, ${accent}15, transparent)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 2, delay: 0.5 + i * 0.3, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   FLOATING PARTICLES
   ================================================================ */
function Particles({ accent, count = 30 }: { accent: string; count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: accent,
          }}
          animate={{
            opacity: [0, 0.5, 0],
            y: [0, -(40 + Math.random() * 60)],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   YEAR COUNTER — Telt op van vorig jaar naar huidig
   ================================================================ */
function YearCounter({ from, to }: { from: number; to: number }) {
  const motionVal = useMotionValue(from);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    motionVal.set(from);
    const controls = animate(motionVal, to, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [from, to, motionVal, rounded]);

  return <span>{display}</span>;
}

/* ================================================================
   PLATFORM SCENE — Één platform, één scène
   ================================================================ */
function PlatformScene({
  platform,
  prevYear,
}: {
  platform: (typeof PLATFORMS)[number];
  prevYear: number;
}) {
  const hasMultipleCovers = platform.covers.length > 1;
  const lines = platform.name.split('\n');

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Achtergrond glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(${platform.accentRgb}, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 30% 70%, rgba(${platform.accentRgb}, 0.04) 0%, transparent 60%)
          `,
        }}
      />

      <Particles accent={platform.accent} />
      <LightStreaks accent={platform.accent} />

      {/* Content wrapper */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-6">
        {/* Jaar counter */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <span
            className="inline-block font-mono text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter"
            style={{ color: platform.accent, opacity: 0.15 }}
          >
            <YearCounter from={prevYear} to={parseInt(platform.year)} />
          </span>
        </motion.div>

        {/* Platform naam */}
        <div className="text-center mb-2">
          {lines.map((line, li) => (
            <div key={li} className="overflow-hidden">
              <motion.div
                initial={{ y: '120%', rotateX: -40 }}
                animate={{ y: '0%', rotateX: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + li * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <h2 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.95] tracking-tight">
                  {line}
                </h2>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          className="text-center text-sm sm:text-base md:text-lg text-white/30 font-medium tracking-wide mb-10 sm:mb-14 md:mb-20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {platform.tagline}
        </motion.p>

        {/* Covers */}
        <div className="flex justify-center overflow-hidden">
          {hasMultipleCovers ? (
            <div className="w-full overflow-hidden" style={{ perspective: 1200 }}>
              <CoverRail covers={platform.covers} accent={platform.accent} />
            </div>
          ) : (
            <HeroCover cover={platform.covers[0]} accent={platform.accent} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================
   OPENING SCENE — "Gameshop Enter presents"
   ================================================================ */
function OpeningScene() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.div
          className="overflow-hidden mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="inline-block text-[10px] sm:text-xs font-mono tracking-[0.5em] uppercase text-white/30"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Gameshop Enter
          </motion.span>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-light text-white/80 tracking-wide"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Een reis door
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Nintendo geschiedenis
          </motion.h1>
        </div>

        {/* Decoratieve lijn */}
        <motion.div
          className="mt-8 mx-auto h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

/* ================================================================
   FINALE SCENE — Logo reveal + overgang naar site
   ================================================================ */
function FinaleScene() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Emerald glow achtergrond */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_60%)]" />

      <div className="text-center">
        <div className="overflow-hidden">
          <motion.h2
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Gameshop
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 leading-none"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Enter
          </motion.h2>
        </div>

        <motion.p
          className="mt-6 text-sm sm:text-base text-white/30 font-medium tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Dé Pokémon specialist van Nederland
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
type Phase = 'opening' | 'platforms' | 'finale';

export default function PlatformIntro() {
  const [phase, setPhase] = useState<Phase>('opening');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [barsVisible, setBarsVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check of al gespeeld
  useEffect(() => {
    const played = sessionStorage.getItem('gameshop-intro-v2');
    if (played) {
      setIsVisible(false);
      return;
    }
    // Scroll blokkeren tijdens intro
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Phase sequencing
  useEffect(() => {
    if (!isVisible) return;

    const clear = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    if (phase === 'opening') {
      timerRef.current = setTimeout(() => {
        setPhase('platforms');
        setSceneIndex(0);
      }, OPENING_DURATION);
    } else if (phase === 'platforms') {
      timerRef.current = setTimeout(() => {
        if (sceneIndex < PLATFORMS.length - 1) {
          setSceneIndex((prev) => prev + 1);
        } else {
          setPhase('finale');
        }
      }, SCENE_DURATION);
    } else if (phase === 'finale') {
      timerRef.current = setTimeout(() => {
        setBarsVisible(false);
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('gameshop-intro-v2', '1');
          document.body.style.overflow = '';
        }, 800);
      }, FINALE_DURATION);
    }

    return clear;
  }, [phase, sceneIndex, isVisible]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem('gameshop-intro-v2', '1');
    document.body.style.overflow = '';
  }, []);

  if (!isVisible) return null;

  const prevYear =
    phase === 'platforms' && sceneIndex > 0
      ? parseInt(PLATFORMS[sceneIndex - 1].year)
      : phase === 'platforms'
        ? 1980
        : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#030306]"
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <FilmGrain />
          <CinematicBars visible={barsVisible} />

          {/* Scene content */}
          <div className="absolute inset-0 z-20">
            <AnimatePresence mode="wait">
              {phase === 'opening' && <OpeningScene key="opening" />}
              {phase === 'platforms' && (
                <PlatformScene
                  key={`platform-${sceneIndex}`}
                  platform={PLATFORMS[sceneIndex]}
                  prevYear={prevYear}
                />
              )}
              {phase === 'finale' && <FinaleScene key="finale" />}
            </AnimatePresence>
          </div>

          {/* Progress indicator */}
          {phase === 'platforms' && (
            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3">
              {PLATFORMS.map((p, i) => (
                <div key={p.year} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    className="h-[2px] rounded-full overflow-hidden"
                    animate={{
                      width: i === sceneIndex ? 56 : 20,
                      backgroundColor:
                        i < sceneIndex
                          ? 'rgba(255,255,255,0.3)'
                          : i === sceneIndex
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(255,255,255,0.05)',
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {i === sceneIndex && (
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: PLATFORMS[sceneIndex].accent }}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: SCENE_DURATION / 1000, ease: 'linear' }}
                      />
                    )}
                    {i < sceneIndex && (
                      <div className="h-full w-full rounded-full bg-white/40" />
                    )}
                  </motion.div>
                  <span
                    className="text-[9px] font-mono transition-colors duration-300"
                    style={{
                      color:
                        i === sceneIndex
                          ? PLATFORMS[sceneIndex].accent
                          : i < sceneIndex
                            ? 'rgba(255,255,255,0.25)'
                            : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {p.year}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Skip */}
          <motion.button
            onClick={handleSkip}
            className="absolute bottom-[12%] right-6 z-50 flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium text-white/30 hover:text-white/60 transition-all duration-300 rounded-full border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Overslaan
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Scene counter */}
          {phase === 'platforms' && (
            <div className="absolute bottom-[12%] left-6 z-50 font-mono text-[10px] text-white/15 tracking-widest">
              {String(sceneIndex + 1).padStart(2, '0')}/{String(PLATFORMS.length).padStart(2, '0')}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
