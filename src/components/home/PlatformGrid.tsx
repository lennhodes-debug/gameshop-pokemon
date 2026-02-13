'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemo, useRef, useState, useEffect } from 'react';
import { getAllPlatforms, getAllProducts } from '@/lib/products';
import { PLATFORM_LABELS } from '@/lib/utils';

const PLATFORM_IMAGES: Record<string, string> = {
  'Nintendo 3DS': '/images/nintendo/3ds-console.webp',
  'Nintendo DS': '/images/nintendo/ds-console.webp',
  'Game Boy / Color': '/images/nintendo/gameboy-console.webp',
  'Game Boy Advance': '/images/nintendo/gba-console.webp',
  'Wii': '/images/nintendo/wii-console.svg',
  'Wii U': '/images/nintendo/wiiu-console.svg',
};

const PLATFORM_ACCENT: Record<string, { color: string; glow: string }> = {
  'Nintendo DS':      { color: '#818cf8', glow: '129,140,248' },
  'Nintendo 3DS':     { color: '#38bdf8', glow: '56,189,248' },
  'Game Boy Advance': { color: '#60a5fa', glow: '96,165,250' },
  'Game Boy / Color': { color: '#4ade80', glow: '74,222,128' },
  'Wii':              { color: '#22d3ee', glow: '34,211,238' },
  'Wii U':            { color: '#3b82f6', glow: '59,130,246' },
};

function AnimatedCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const start = performance.now();
        const duration = 900;
        const animate = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(value * eased));
          if (p < 1) requestAnimationFrame(animate);
          else setCount(value);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, started]);

  return <span ref={ref} className="tabular-nums">{count}</span>;
}

function PlatformCard({ platform, index, coverImages }: {
  platform: { name: string; count: number };
  index: number;
  coverImages: string[];
}) {
  const label = PLATFORM_LABELS[platform.name] || platform.name;
  const accent = PLATFORM_ACCENT[platform.name] || { color: '#34d399', glow: '52,211,153' };
  const consoleImage = PLATFORM_IMAGES[platform.name];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop?platform=${encodeURIComponent(platform.name)}`} aria-label={`Shop ${platform.name}`}>
        <div
          className="group relative overflow-hidden rounded-2xl h-56 lg:h-64 flex flex-col justify-end p-5 lg:p-6 cursor-pointer transition-all duration-500 border border-white/[0.06] hover:border-white/[0.12]"
          style={{
            background: 'linear-gradient(150deg, rgba(15,23,42,0.95), rgba(5,8,16,0.98))',
          }}
        >
          {/* Top accent lijn */}
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-40 group-hover:opacity-80 transition-opacity duration-500"
            style={{
              background: `linear-gradient(90deg, transparent 10%, ${accent.color}, transparent 90%)`,
            }}
          />

          {/* Hover glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 30% 90%, rgba(${accent.glow},0.08), transparent 60%)`,
            }}
          />

          {/* Console watermark */}
          {consoleImage && (
            <div className="absolute top-1/2 right-4 lg:right-6 -translate-y-1/2 opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-700 pointer-events-none">
              <Image
                src={consoleImage}
                alt=""
                width={180}
                height={120}
                className="w-28 lg:w-36 h-auto object-contain"
                loading="lazy"
              />
            </div>
          )}

          {/* Game covers — gestackt */}
          <div className="absolute top-3 right-3 lg:top-4 lg:right-4 flex -space-x-2.5 opacity-25 group-hover:opacity-45 transition-opacity duration-500">
            {coverImages.slice(0, 3).map((img, i) => (
              <div
                key={i}
                className="w-9 h-9 lg:w-11 lg:h-11 rounded-lg overflow-hidden border border-white/10"
                style={{ zIndex: 3 - i }}
              >
                <Image
                  src={img}
                  alt=""
                  width={44}
                  height={44}
                  className="object-contain w-full h-full p-0.5"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: accent.color }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: accent.color }}
              >
                <AnimatedCount value={platform.count} /> games
              </span>
            </div>

            <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight mb-1">
              {label}
            </h3>

            <div className="flex items-center justify-between">
              <p className="text-white/25 text-xs font-medium">
                {platform.name}
              </p>
              <div className="flex items-center gap-1 text-white/20 group-hover:text-white/50 group-hover:gap-2 transition-all duration-300">
                <span className="text-[11px] font-semibold">Ontdek</span>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PlatformGrid() {
  const platforms = useMemo(() => getAllPlatforms(), []);
  const allProducts = useMemo(() => getAllProducts(), []);

  const platformCovers = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const p of platforms) {
      const games = allProducts
        .filter(g => g.platform === p.name && g.image)
        .map(g => g.image!)
        .slice(0, 3);
      map[p.name] = games;
    }
    return map;
  }, [platforms, allProducts]);

  return (
    <section className="relative bg-[#070c18] py-20 lg:py-28 overflow-hidden">
      {/* Subtiele top glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-emerald-400/60 text-xs font-semibold uppercase tracking-[0.25em] mb-5">
            {platforms.length} Platforms
          </p>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Shop per{' '}
            <span className="gradient-text">platform</span>
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Van klassieke Game Boy tot Wii U — ontdek jouw favoriete console
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {platforms.map((platform, index) => (
            <PlatformCard
              key={platform.name}
              platform={platform}
              index={index}
              coverImages={platformCovers[platform.name] || []}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
