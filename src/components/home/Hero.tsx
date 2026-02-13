'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const contentY = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <section
      ref={heroRef}
      className="relative bg-[#050810] overflow-hidden min-h-[90vh] flex items-center"
    >
      {/* Stripe-inspired animated gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />
        {/* Floating gradient orbs — slow morphing mesh */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #10b981, transparent 70%)',
            animation: 'mesh-drift-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #0ea5e9, transparent 70%)',
            animation: 'mesh-drift-2 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full opacity-[0.08] blur-[140px]"
          style={{
            background: 'radial-gradient(circle, #14b8a6, transparent 70%)',
            animation: 'mesh-drift-3 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[50%] left-[60%] w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #8b5cf6, transparent 70%)',
            animation: 'mesh-drift-1 28s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Subtiel dot grid — Vercel-style */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Subtiele pokeball hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          className="w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-[0.02]"
        >
          <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="1.5" />
          <line x1="5" y1="100" x2="70" y2="100" stroke="white" strokeWidth="1.5" />
          <line x1="130" y1="100" x2="195" y2="100" stroke="white" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="10" fill="white" fillOpacity="0.15" />
        </svg>
      </div>

      <motion.div
        className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-44 text-center"
        style={{ y: contentY }}
      >
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-2.5 w-2.5 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white/40 text-xs font-medium">5.0 uit 1.360+ reviews</span>
          </div>
        </motion.div>

        {/* Titel */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Gameshop
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
            Enter
          </span>
        </motion.h1>

        {/* Subtitel */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg text-white/40 leading-relaxed mb-14 max-w-lg mx-auto font-light"
        >
          De Nintendo specialist van Nederland.
          <br className="hidden sm:block" />
          Originele games, persoonlijk getest.
        </motion.p>

        {/* CTA knoppen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
          >
            Bekijk de collectie
            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/inkoop"
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold text-sm hover:bg-white/[0.1] hover:border-white/[0.15] active:scale-[0.98] transition-all duration-200 backdrop-blur-sm"
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
