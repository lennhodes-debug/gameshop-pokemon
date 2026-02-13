'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getAllPlatforms } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';

const PLATFORM_IMAGES: Record<string, string> = {
  'Nintendo 3DS': '/images/nintendo/3ds-console.webp',
  'Nintendo DS': '/images/nintendo/ds-console.webp',
  'Game Boy / Color': '/images/nintendo/gameboy-console.webp',
  'Game Boy Advance': '/images/nintendo/gba-console.webp',
  'Wii': '/images/nintendo/wii-console.svg',
  'Wii U': '/images/nintendo/wiiu-console.svg',
};

function PlatformCard({ platform, index }: { platform: { name: string; count: number }; index: number }) {
  const colors = PLATFORM_COLORS[platform.name] || { from: 'from-slate-500', to: 'to-slate-700' };
  const label = PLATFORM_LABELS[platform.name] || platform.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop?platform=${encodeURIComponent(platform.name)}`} aria-label={`Shop ${platform.name} — ${platform.count} producten`}>
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
          <div className={`relative h-44 bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center overflow-hidden`}>
            {/* Subtiel grid */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-1">
              {PLATFORM_IMAGES[platform.name] ? (
                <Image
                  src={PLATFORM_IMAGES[platform.name]}
                  alt={label}
                  width={280}
                  height={140}
                  className="h-28 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="h-28 w-28" />
              )}
              <span className="text-white/90 text-xl font-extrabold tracking-tight">
                {label}
              </span>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{platform.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r ${colors.from} ${colors.to} text-white mt-1`}>
                {platform.count} games
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors duration-300">
              <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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

  return (
    <section className="relative bg-[#f8fafc] py-16 lg:py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4">
            {platforms.length} Platforms
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Shop per{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              platform
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Nintendo games per platform — van Game Boy tot Wii U
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {platforms.map((platform, index) => (
            <PlatformCard key={platform.name} platform={platform} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
