'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProducts } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';

const PLATFORMS = [
  'Nintendo Switch',
  'Nintendo 3DS',
  'Nintendo DS',
  'Game Boy Advance',
  'Game Boy / Color',
  'GameCube',
  'Nintendo 64',
  'Super Nintendo',
  'NES',
  'Wii',
  'Wii U',
];

export default function PlatformSpotlight() {
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Bereken product counts per platform
    const products = getAllProducts();
    const c: Record<string, number> = {};
    for (const p of products) {
      c[p.platform] = (c[p.platform] || 0) + 1;
    }
    setCounts(c);

    // Random startpositie
    setIndex(Math.floor(Math.random() * PLATFORMS.length));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PLATFORMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const platform = PLATFORMS[index];
  const colors = PLATFORM_COLORS[platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const label = PLATFORM_LABELS[platform] || platform;
  const count = counts[platform] || 0;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Link href={`/shop?platform=${encodeURIComponent(platform)}`} className="group block">
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${colors.from} ${colors.to} p-8 sm:p-10 lg:p-12`}>
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Large platform label watermark */}
                <span className="absolute -right-4 -bottom-4 text-[120px] sm:text-[180px] font-black text-white/[0.06] select-none leading-none tracking-tighter">
                  {label}
                </span>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold mb-3"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      Platform Spotlight
                    </motion.div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
                      {platform}
                    </h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      Ontdek {count} {count === 1 ? 'game' : 'games'} &amp; consoles — van zeldzaam tot populair
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 text-white font-bold text-sm hover:bg-white/30 transition-colors flex-shrink-0"
                  >
                    Bekijk collectie
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </motion.div>
                </div>

                {/* Platform navigation dots */}
                <div className="relative z-10 flex items-center gap-1.5 mt-6">
                  {PLATFORMS.map((p, i) => (
                    <button
                      key={p}
                      onClick={(e) => { e.preventDefault(); setIndex(i); }}
                      aria-label={p}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
