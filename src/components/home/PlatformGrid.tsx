'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { getAllPlatforms } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';
import TextReveal from '@/components/ui/TextReveal';

const PLATFORM_ICONS: Record<string, string> = {
  'Switch': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  'Nintendo 3DS': 'M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 14H5V6h8v12zm2-6h6v2h-6v-2zm0-4h6v2h-6V8zm0 8h6v2h-6v-2z',
  'Nintendo DS': 'M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 14H5V6h8v12zm2-6h6v2h-6v-2z',
  'Game Boy': 'M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 18H7V4h10v16h-3z',
  'Game Boy Advance': 'M22 8H2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm-8 6H4v-4h10v4z',
  'Nintendo 64': 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2 14H6V6h12v12z',
  'Super Nintendo': 'M22 6H2v12h20V6zm-2 10H4V8h16v8z',
  'NES': 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z',
  'GameCube': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
  'Wii': 'M6 2v20h4V2H6zm8 0v20h4V2h-4z',
  'Wii U': 'M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z',
  'Overig': 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z',
};

function PlatformCard({ platform, index }: { platform: { name: string; count: number }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const spotlightX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotlightY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotlightBg = useMotionTemplate`radial-gradient(400px circle at ${spotlightX}% ${spotlightY}%, rgba(16,185,129,0.15), transparent 60%)`;

  const colors = PLATFORM_COLORS[platform.name] || { from: 'from-slate-500', to: 'to-slate-700' };
  const label = PLATFORM_LABELS[platform.name] || platform.name;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/shop?platform=${encodeURIComponent(platform.name)}`}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200/50 transition-all duration-500"
        >
          {/* Spotlight effect on hover */}
          {hovered && (
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: spotlightBg }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          <div className={`relative h-32 bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center overflow-hidden`}>
            {/* Animated grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Floating particles */}
            <motion.div
              className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full bg-white/20"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-4 left-5 w-1 h-1 rounded-full bg-white/15"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* Platform icon + name */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <svg className="h-8 w-8 text-white/60 group-hover:text-white/80 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d={PLATFORM_ICONS[platform.name] || PLATFORM_ICONS['Overig']} />
              </svg>
              <span className="text-white/90 text-xl font-extrabold tracking-tight group-hover:scale-110 transition-transform duration-300">
                {label}
              </span>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{platform.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{platform.count} producten</p>
            </div>
            <motion.div
              className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function PlatformGrid() {
  const platforms = getAllPlatforms();

  return (
    <section className="relative bg-[#f8fafc] py-16 lg:py-24 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4">
            12 Platforms
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            <TextReveal text="Shop per platform" delay={0.1} />
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Van klassieke retro consoles tot de nieuwste Nintendo Switch
          </p>
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
