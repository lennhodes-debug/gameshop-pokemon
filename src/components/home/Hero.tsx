'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useCallback } from 'react';

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
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.18] blur-[120px] pointer-events-none"
          style={{
            left: orb1X,
            top: orb1Y,
            background: 'radial-gradient(circle, #10b981, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.14] blur-[100px] pointer-events-none"
          style={{
            left: orb2X,
            top: orb2Y,
            background: 'radial-gradient(circle, #0ea5e9, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full opacity-[0.10] blur-[140px] pointer-events-none"
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

      <motion.div
        className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-36 lg:py-52 text-center z-10"
        style={{ y: contentY }}
      >
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  className="h-2.5 w-2.5 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3 + i * 0.08,
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            <span className="text-white/50 text-xs font-medium">5.0 uit 1.360+ reviews</span>
          </div>
        </motion.div>

        {/* Title — gestaffelde reveal per woord */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[112px] font-light text-white leading-[0.92] tracking-[-0.02em] md:tracking-[-0.03em] mb-6 sm:mb-8">
          <motion.span
            className="block overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Gameshop
          </motion.span>
          <motion.span
            className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Enter
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-sm sm:text-base md:text-lg text-white/45 leading-relaxed mb-10 sm:mb-14 max-w-md mx-auto font-normal"
        >
          De Nintendo specialist van Nederland.
          <br className="hidden sm:block" />
          Originele games, persoonlijk getest.
        </motion.p>

        {/* CTA buttons — gestaffeld per button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg shadow-white/10 hover:shadow-white/20 hover:bg-white/95 active:scale-[0.98] transition-all duration-300"
            >
              Bekijk de collectie
              <svg
                className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/inkoop"
              className="inline-flex items-center justify-center w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-white/[0.08] text-white/80 font-medium text-sm hover:bg-white/[0.12] hover:text-white active:scale-[0.98] transition-all duration-300 backdrop-blur-sm"
            >
              Games verkopen
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ opacity: scrollOpacity }}
      >
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Fade naar content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
