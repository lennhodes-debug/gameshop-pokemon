'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const PLATFORMS = [
  {
    name: 'Game Boy',
    year: '1989',
    tagline: 'Waar het allemaal begon',
    accent: '#9BBC0F',
    cover: '/images/products/gb-001-pokemon-trading-card-game.webp',
  },
  {
    name: 'Game Boy Advance',
    year: '2001',
    tagline: 'De volgende generatie',
    accent: '#7B68EE',
    cover: '/images/products/gba-001-pokemon-emerald.webp',
  },
  {
    name: 'Nintendo DS',
    year: '2004',
    tagline: 'Twee schermen, dubbel plezier',
    accent: '#94A3B8',
    cover: '/images/products/ds-001-pokemon-platinum.webp',
  },
  {
    name: 'Nintendo 3DS',
    year: '2011',
    tagline: 'Een nieuwe dimensie',
    accent: '#EF4444',
    cover: '/images/products/3ds-001-pokemon-x.webp',
  },
];

const SCENE_MS = 3000;

export default function PlatformIntro() {
  const [mounted, setMounted] = useState(false);
  const [scene, setScene] = useState(-1);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [sceneFade, setSceneFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('gameshop-intro-v4')) {
        setVisible(false);
        return;
      }
    } catch { /* private browsing */ }

    setMounted(true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Scene sequencing
  useEffect(() => {
    if (!mounted || !visible) return;

    timerRef.current = setTimeout(() => {
      if (scene < PLATFORMS.length) {
        // Fade out huidige scene
        setSceneFade(false);
        setTimeout(() => {
          setScene((s) => s + 1);
          setSceneFade(true);
        }, 400);
      } else {
        // Einde: fade out hele overlay
        finish();
      }
    }, SCENE_MS);

    return () => clearTimeout(timerRef.current);
  }, [scene, mounted, visible]);

  const finish = useCallback(() => {
    setFading(true);
    document.body.style.overflow = '';
    try { sessionStorage.setItem('gameshop-intro-v4', '1'); } catch {}
    setTimeout(() => setVisible(false), 800);
  }, []);

  if (!visible || !mounted) return null;

  const isPlatform = scene >= 0 && scene < PLATFORMS.length;
  const isFinale = scene >= PLATFORMS.length;
  const platform = isPlatform ? PLATFORMS[scene] : null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700"
      style={{
        backgroundColor: '#030306',
        opacity: fading ? 0 : 1,
      }}
    >
      {/* Letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-[6%] bg-black z-30" />
      <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-black z-30" />

      {/* Scene content met CSS fade */}
      <div
        className="relative z-10 text-center w-full max-w-4xl mx-auto px-6 transition-opacity duration-400"
        style={{ opacity: sceneFade ? 1 : 0 }}
      >
        {/* OPENING */}
        {scene === -1 && (
          <>
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.5em] uppercase text-white/30 mb-6">
              Gameshop Enter
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white/80 tracking-wide">
              Een reis door
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mt-2">
              Nintendo geschiedenis
            </h1>
            <div
              className="mt-8 mx-auto h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
              style={{ width: 200 }}
            />
          </>
        )}

        {/* PLATFORM SCENES */}
        {isPlatform && platform && (
          <>
            {/* Achtergrond glow */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${platform.accent}15 0%, transparent 70%)`,
              }}
            />

            <p
              className="font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-4"
              style={{ color: platform.accent, opacity: 0.2 }}
            >
              {platform.year}
            </p>

            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-3">
              {platform.name}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-white/30 font-medium tracking-wide mb-12">
              {platform.tagline}
            </p>

            <div
              className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto rounded-2xl overflow-hidden"
              style={{
                boxShadow: `0 30px 80px -15px rgba(0,0,0,0.8), 0 0 50px -10px ${platform.accent}30`,
              }}
            >
              <Image
                src={platform.cover}
                alt={platform.name}
                fill
                sizes="256px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
            </div>
          </>
        )}

        {/* FINALE */}
        {isFinale && (
          <>
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none">
              Gameshop
            </h2>
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 leading-none">
              Enter
            </h2>
            <p className="mt-6 text-sm sm:text-base text-white/30 font-medium tracking-wider">
              De Pokemon specialist van Nederland
            </p>
          </>
        )}
      </div>

      {/* Progress dots */}
      {isPlatform && (
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {PLATFORMS.map((p, i) => (
            <div key={p.year} className="flex flex-col items-center gap-1">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === scene ? 40 : 12,
                  backgroundColor: i === scene ? p.accent : i < scene ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              />
              <span
                className="text-[9px] font-mono transition-colors duration-300"
                style={{ color: i === scene ? p.accent : 'rgba(255,255,255,0.15)' }}
              >
                {p.year}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skip */}
      <button
        onClick={finish}
        className="absolute bottom-[10%] right-6 z-30 flex items-center gap-2 px-4 py-2 text-[11px] font-medium text-white/25 hover:text-white/60 transition-colors rounded-full border border-white/[0.06] hover:border-white/10"
      >
        Overslaan
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
