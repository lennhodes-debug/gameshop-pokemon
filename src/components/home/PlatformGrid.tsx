'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getAllPlatforms, getAllProducts } from '@/lib/products';
import { PLATFORM_LABELS } from '@/lib/utils';

const PLATFORM_ACCENT: Record<string, string> = {
  'Nintendo DS':      '#6366f1',
  'Nintendo 3DS':     '#0ea5e9',
  'Game Boy Advance': '#3b82f6',
  'Game Boy / Color': '#22c55e',
  'Wii':              '#06b6d4',
  'Wii U':            '#2563eb',
};

function PlatformCard({ platform, index, coverImage }: {
  platform: { name: string; count: number };
  index: number;
  coverImage: string | null;
}) {
  const label = PLATFORM_LABELS[platform.name] || platform.name;
  const accent = PLATFORM_ACCENT[platform.name] || '#10b981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/shop?platform=${encodeURIComponent(platform.name)}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] hover:border-slate-200">
          {/* Image area */}
          <div
            className="relative h-40 sm:h-48 flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #f8fafb 0%, #f1f5f9 50%, #eef2f7 100%)',
            }}
          >
            {coverImage && (
              <Image
                src={coverImage}
                alt={label}
                width={160}
                height={160}
                className="object-contain w-24 h-24 sm:w-32 sm:h-32 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
                loading="lazy"
              />
            )}
            {/* Subtle accent glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 70%, ${accent}08, transparent 60%)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                  {label}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {platform.count} {platform.count === 1 ? 'game' : 'games'}
                </p>
              </div>
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 group-hover:scale-110"
                style={{ backgroundColor: `${accent}0d` }}
              >
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5"
                  style={{ color: accent }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
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
    const map: Record<string, string | null> = {};
    for (const p of platforms) {
      const game = allProducts.find(g => g.platform === p.name && g.image);
      map[p.name] = game?.image || null;
    }
    return map;
  }, [platforms, allProducts]);

  return (
    <section className="relative bg-slate-50 py-20 lg:py-28 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-14"
        >
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.3em] mb-4">
            Platforms
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Shop per platform
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {platforms.map((platform, index) => (
            <PlatformCard
              key={platform.name}
              platform={platform}
              index={index}
              coverImage={platformCovers[platform.name]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
