'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { getAllPlatforms } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';
import TextReveal from '@/components/ui/TextReveal';

const PLATFORM_IMAGES: Record<string, string> = {
  'Nintendo Switch': '/images/nintendo/switch-console.webp',
  'Nintendo 3DS': '/images/nintendo/3ds-console.webp',
  'Nintendo DS': '/images/nintendo/ds-console.webp',
  'Game Boy': '/images/nintendo/gameboy-console.webp',
  'Game Boy Advance': '/images/nintendo/gba-console.webp',
  'Game Boy Color': '/images/nintendo/gbc-console.webp',
  'Nintendo 64': '/images/nintendo/n64-console.webp',
  'Super Nintendo': '/images/nintendo/snes-console.webp',
  'NES': '/images/nintendo/nes-console.webp',
  'GameCube': '/images/nintendo/gamecube-console.webp',
  'Wii': '/images/nintendo/wii-console.webp',
  'Wii U': '/images/nintendo/wiiu-console.webp',
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
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-200/50 dark:hover:border-emerald-500/30 transition-all duration-500"
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

            {/* Console afbeelding + naam */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              {PLATFORM_IMAGES[platform.name] ? (
                <Image
                  src={PLATFORM_IMAGES[platform.name]}
                  alt={label}
                  width={160}
                  height={80}
                  className="h-16 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="h-20 w-20" />
              )}
              <span className="text-white/90 text-xl font-extrabold tracking-tight group-hover:scale-110 transition-transform duration-300">
                {label}
              </span>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{platform.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{platform.count} producten</p>
            </div>
            <motion.div
              className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors duration-300"
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
    <section className="relative bg-[#f8fafc] dark:bg-slate-900 py-16 lg:py-24 overflow-hidden">
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
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            {platforms.length} Platforms
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            <TextReveal text="Shop per platform" delay={0.1} />
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
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
