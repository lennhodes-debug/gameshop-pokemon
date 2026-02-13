'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useCallback } from 'react';

/* Floating game covers scattered behind the hero text — gives depth */
const FLOATING_COVERS = [
  { src: '/images/nintendo/zelda-botw.webp', size: 120, x: '8%', y: '15%', delay: 0, rotate: -12, drift: 15 },
  { src: '/images/nintendo/pokemon-rb.webp', size: 100, x: '85%', y: '20%', delay: 0.3, rotate: 8, drift: -12 },
  { src: '/images/nintendo/zelda-oot.webp', size: 90, x: '75%', y: '70%', delay: 0.6, rotate: -6, drift: 18 },
  { src: '/images/nintendo/smb-nes.webp', size: 80, x: '12%', y: '72%', delay: 0.15, rotate: 10, drift: -14 },
  { src: '/images/nintendo/wii-sports.webp', size: 70, x: '90%', y: '48%', delay: 0.45, rotate: -4, drift: 10 },
  { src: '/images/nintendo/tetris-gb.webp', size: 65, x: '5%', y: '45%', delay: 0.7, rotate: 14, drift: -16 },
];

function FloatingCover({ src, size, x, y, delay, rotate, drift }: typeof FLOATING_COVERS[0]) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, width: size, height: size }}
      initial={{ opacity: 0, scale: 0.6, rotate: rotate - 10 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ duration: 1.2, delay: 0.8 + delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, drift, 0] }}
        transition={{ duration: 8 + delay * 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          className="rounded-xl object-contain opacity-[0.07] blur-[0.5px]"
          loading="eager"
          aria-hidden
        />
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const contentY = useTransform(scrollY, [0, 400], [0, 60]);

  // Cursor tracking for interactive mesh orbs
  const cursorX = useMotionValue(0.5);
  const cursorY = useMotionValue(0.5);
  const springCfg = { stiffness: 40, damping: 25 };
  const cx = useSpring(cursorX, springCfg);
  const cy = useSpring(cursorY, springCfg);

  // Each orb reacts differently to cursor movement
  const orb1X = useTransform(cx, [0, 1], ['-15%', '5%']);
  const orb1Y = useTransform(cy, [0, 1], ['-25%', '-10%']);
  const orb2X = useTransform(cx, [0, 1], ['90%', '70%']);
  const orb2Y = useTransform(cy, [0, 1], ['15%', '30%']);
  const orb3X = useTransform(cx, [0, 1], ['25%', '40%']);
  const orb3Y = useTransform(cy, [0, 1], ['85%', '95%']);
  const orb4X = useTransform(cx, [0, 1], ['55%', '70%']);
  const orb4Y = useTransform(cy, [0, 1], ['40%', '55%']);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      cursorX.set((e.clientX - rect.left) / rect.width);
      cursorY.set((e.clientY - rect.top) / rect.height);
    },
    [cursorX, cursorY],
  );

  return (
    <section
      ref={heroRef}
      className="relative bg-[#050810] overflow-hidden min-h-[90vh] flex items-center"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive gradient mesh — orbs follow cursor with spring physics */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />

        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[120px] pointer-events-none"
          style={{
            left: orb1X,
            top: orb1Y,
            background: 'radial-gradient(circle, #10b981, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[100px] pointer-events-none"
          style={{
            left: orb2X,
            top: orb2Y,
            background: 'radial-gradient(circle, #0ea5e9, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full opacity-[0.08] blur-[140px] pointer-events-none"
          style={{
            left: orb3X,
            top: orb3Y,
            background: 'radial-gradient(circle, #14b8a6, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px] pointer-events-none"
          style={{
            left: orb4X,
            top: orb4Y,
            background: 'radial-gradient(circle, #8b5cf6, transparent 70%)',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating game covers — scattered behind text for depth */}
      <div className="absolute inset-0 hidden lg:block">
        {FLOATING_COVERS.map((cover, i) => (
          <FloatingCover key={i} {...cover} />
        ))}
      </div>

      <motion.div
        className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-44 text-center z-10"
        style={{ y: contentY }}
      >
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  className="h-2.5 w-2.5 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            <span className="text-white/40 text-xs font-medium">5.0 uit 1.360+ reviews</span>
          </div>
        </motion.div>

        {/* Titel */}
        <motion.h1
          className="text-6xl sm:text-7xl lg:text-[112px] font-light text-white leading-[0.92] tracking-[-0.03em] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Gameshop
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-300">
            Enter
          </span>
        </motion.h1>

        {/* Subtitel */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg text-white/40 leading-relaxed mb-6 max-w-lg mx-auto font-normal"
        >
          De Nintendo specialist van Nederland.
          <br className="hidden sm:block" />
          Originele games, persoonlijk getest.
        </motion.p>

        {/* Platform tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {['Game Boy', 'GBA', 'DS', '3DS', 'Wii', 'Wii U'].map((p, i) => (
            <motion.span
              key={p}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
              className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/25 text-[11px] font-medium"
            >
              {p}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA knoppen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg shadow-white/10 hover:shadow-white/20 hover:bg-white/95 active:scale-[0.98] transition-all duration-300"
          >
            Bekijk de collectie
            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/inkoop"
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white/70 font-medium text-sm hover:bg-white/[0.1] hover:text-white active:scale-[0.98] transition-all duration-300 backdrop-blur-sm"
          >
            Games verkopen
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ opacity: scrollOpacity }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="h-5 w-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Fade naar content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
