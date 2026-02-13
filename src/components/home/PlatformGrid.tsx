'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
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

// Levendige hex kleuren per platform
const PLATFORM_HEX: Record<string, { primary: string; secondary: string; glow: string }> = {
  'Nintendo DS':      { primary: '#6366f1', secondary: '#818cf8', glow: '99,102,241' },
  'Nintendo 3DS':     { primary: '#0ea5e9', secondary: '#38bdf8', glow: '14,165,233' },
  'Game Boy Advance': { primary: '#3b82f6', secondary: '#60a5fa', glow: '59,130,246' },
  'Game Boy / Color': { primary: '#22c55e', secondary: '#4ade80', glow: '34,197,94' },
  'Wii':              { primary: '#06b6d4', secondary: '#22d3ee', glow: '6,182,212' },
  'Wii U':            { primary: '#2563eb', secondary: '#3b82f6', glow: '37,99,235' },
};

function PlatformCard({ platform, index, coverImages }: {
  platform: { name: string; count: number };
  index: number;
  coverImages: string[];
}) {
  const label = PLATFORM_LABELS[platform.name] || platform.name;
  const hex = PLATFORM_HEX[platform.name] || { primary: '#10b981', secondary: '#34d399', glow: '16,185,129' };
  const consoleImage = PLATFORM_IMAGES[platform.name];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop?platform=${encodeURIComponent(platform.name)}`} aria-label={`Shop ${platform.name} — ${platform.count} producten`}>
        <div
          className="group relative overflow-hidden rounded-3xl h-72 lg:h-80 flex flex-col justify-end p-6 cursor-pointer transition-all duration-500"
          style={{
            background: `linear-gradient(160deg, ${hex.primary}, ${hex.secondary}20 60%, ${hex.primary}dd)`,
          }}
        >
          {/* Gradient overlay voor leesbaarheid */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Subtiel raster patroon */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Game covers achtergrond — kleurrijke collage */}
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
            {coverImages.slice(0, 3).map((img, i) => (
              <div
                key={i}
                className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-500"
                style={{
                  transform: `rotate(${-6 + i * 6}deg) translateY(${i * 4}px)`,
                }}
              >
                <Image
                  src={img}
                  alt=""
                  width={64}
                  height={64}
                  className="object-contain w-full h-full p-0.5 group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Console afbeelding */}
          {consoleImage && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none">
              <Image
                src={consoleImage}
                alt=""
                width={300}
                height={200}
                className="w-48 h-auto object-contain group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          )}

          {/* Hover glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 80%, rgba(${hex.glow},0.25), transparent 60%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm"
              style={{
                background: `rgba(255,255,255,0.15)`,
                color: 'white',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: hex.secondary }}
              />
              {platform.count} games
            </div>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1 drop-shadow-lg">
              {label}
            </h3>
            <p className="text-white/60 text-sm font-medium">
              {platform.name}
            </p>

            {/* Arrow indicator */}
            <div className="mt-3 flex items-center gap-1.5 text-white/50 group-hover:text-white group-hover:gap-2.5 transition-all duration-300">
              <span className="text-xs font-semibold">Bekijk collectie</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
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

  // Per platform: pak 3 willekeurige game covers
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
    <section className="relative bg-[#f8fafc] py-20 lg:py-28 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 lg:mb-18"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="flex gap-0.5">
              {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((c, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
              ))}
            </span>
            {platforms.length} Platforms
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Shop per{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              platform
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Van klassieke Game Boy tot Wii U — ontdek jouw favoriete Nintendo console
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
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
