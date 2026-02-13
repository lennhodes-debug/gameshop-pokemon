'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMemo, useRef, useCallback } from 'react';
import { getAllPlatforms } from '@/lib/products';

// ── Platform showcase data ──────────────────────────────────

interface PlatformShowcase {
  name: string;
  label: string;
  year: number;
  era: string;
  image: string;
  gradient: [string, string];
  glow: string;
  span: 1 | 2;
}

const PLATFORMS: PlatformShowcase[] = [
  {
    name: 'Nintendo DS',
    label: 'Nintendo DS',
    year: 2004,
    era: 'Dual Screen',
    image: '/images/platforms/ds.webp',
    gradient: ['#1e3a5f', '#0f1b3d'],
    glow: '99, 102, 241',
    span: 2,
  },
  {
    name: 'Nintendo 3DS',
    label: 'Nintendo 3DS',
    year: 2011,
    era: 'Stereoscopic 3D',
    image: '/images/platforms/3ds.webp',
    gradient: ['#0c2744', '#061428'],
    glow: '14, 165, 233',
    span: 2,
  },
  {
    name: 'Wii U',
    label: 'Wii U',
    year: 2012,
    era: 'Second Screen',
    image: '/images/platforms/wiiu.webp',
    gradient: ['#0a1e3d', '#050d1e'],
    glow: '37, 99, 235',
    span: 1,
  },
  {
    name: 'Wii',
    label: 'Wii',
    year: 2006,
    era: 'Motion Control',
    image: '/images/platforms/wii.webp',
    gradient: ['#1a2332', '#0d1219'],
    glow: '6, 182, 212',
    span: 1,
  },
  {
    name: 'Game Boy Advance',
    label: 'Game Boy Advance',
    year: 2001,
    era: '32-Bit Handheld',
    image: '/images/platforms/gba.webp',
    gradient: ['#1a1640', '#0d0a28'],
    glow: '99, 102, 241',
    span: 1,
  },
  {
    name: 'Game Boy / Color',
    label: 'Game Boy Color',
    year: 1998,
    era: 'Kleur Handheld',
    image: '/images/platforms/gbc.webp',
    gradient: ['#1a0e30', '#0f0820'],
    glow: '168, 85, 247',
    span: 1,
  },
];

// ── 3D Tilt Card ────────────────────────────────────────────

function PlatformCard({ platform, count, index }: {
  platform: PlatformShowcase;
  count: number;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={platform.span === 2 ? 'lg:col-span-2' : ''}
      style={{ perspective: 1000 }}
    >
      <Link href={`/shop?platform=${encodeURIComponent(platform.name)}`}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="group relative overflow-hidden rounded-3xl cursor-pointer"
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(145deg, ${platform.gradient[0]}, ${platform.gradient[1]})` }}
          />

          {/* Radial glow */}
          <div
            className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700"
            style={{ background: `radial-gradient(ellipse at 50% 80%, rgba(${platform.glow}, 0.15), transparent 60%)` }}
          />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Content */}
          <div className={`relative flex ${platform.span === 2 ? 'flex-row items-center' : 'flex-col'} p-6 sm:p-8 ${platform.span === 2 ? 'min-h-[280px] lg:min-h-[320px]' : 'min-h-[340px]'}`}>

            {/* Text */}
            <div className={`relative z-10 ${platform.span === 2 ? 'flex-1 pr-4' : 'mb-auto'}`}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-medium text-white/50 uppercase tracking-widest mb-4">
                <span className="h-1 w-1 rounded-full" style={{ background: `rgba(${platform.glow}, 0.7)` }} />
                {platform.era}
              </span>

              <h3 className={`font-semibold text-white tracking-tight leading-none mb-2 ${platform.span === 2 ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl'}`}>
                {platform.label}
              </h3>

              <p className="text-sm text-white/30 font-medium mb-4">{platform.year}</p>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: `rgba(${platform.glow}, 0.9)` }}>
                  {count} {count === 1 ? 'game' : 'games'}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/30 font-medium group-hover:text-white/50 transition-colors duration-500">
                  Bekijk collectie
                  <svg className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Console image */}
            <div className={`relative z-10 ${platform.span === 2 ? 'flex-shrink-0 w-[45%] max-w-[280px]' : 'flex-1 flex items-end justify-center mt-4'}`}>
              <div className="relative">
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"
                  style={{ background: `rgba(${platform.glow}, 0.4)` }}
                />
                <Image
                  src={platform.image}
                  alt={`${platform.label} console`}
                  width={400}
                  height={400}
                  className="relative object-contain transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105 drop-shadow-2xl"
                  style={{
                    maxHeight: platform.span === 2 ? '220px' : '180px',
                    width: 'auto',
                    filter: `drop-shadow(0 20px 40px rgba(${platform.glow}, 0.15))`,
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Year watermark */}
          <div
            className="absolute -bottom-6 -right-2 text-[120px] sm:text-[160px] font-black leading-none select-none pointer-events-none opacity-[0.03]"
            style={{ color: `rgba(${platform.glow}, 1)` }}
          >
            {platform.year}
          </div>

          {/* Border glow on hover */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ boxShadow: `inset 0 0 0 1px rgba(${platform.glow}, 0.15)` }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ── Main ────────────────────────────────────────────────────

export default function PlatformGrid() {
  const dbPlatforms = useMemo(() => getAllPlatforms(), []);

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of dbPlatforms) map[p.name] = p.count;
    return map;
  }, [dbPlatforms]);

  return (
    <section className="relative bg-[#050810] py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(99,102,241,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.04),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="h-px w-12 bg-gradient-to-r from-indigo-500 to-cyan-500 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-3">
            Shop per platform
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Zes generaties Nintendo &mdash; van Game Boy tot Wii U.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {PLATFORMS.map((platform, index) => (
            <PlatformCard
              key={platform.name}
              platform={platform}
              count={countMap[platform.name] || 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
