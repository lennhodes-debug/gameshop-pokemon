'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '@/components/ui/Button';
import GradientMesh from '@/components/ui/GradientMesh';
import TextReveal from '@/components/ui/TextReveal';
import { AnimatedCounter } from '@/components/ui/TextReveal';
import MagneticButton from '@/components/ui/MagneticButton';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);
  const ringY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5], [0.02, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#030608]" />

      {/* Animated gradient mesh */}
      <GradientMesh variant="hero" />

      {/* Animated noise grain overlay */}
      <div className="absolute inset-0 noise-overlay opacity-40" />

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: gridOpacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </motion.div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large rotating ring system */}
        <motion.div
          className="absolute top-20 right-[12%] opacity-[0.06] hidden lg:block"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <path d="M70 5L128 35V105L70 135L12 105V35Z" stroke="url(#hex1)" strokeWidth="0.5" />
            <defs>
              <linearGradient id="hex1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Floating circles */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-emerald-400/30 hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[60%] right-[20%] w-1.5 h-1.5 rounded-full bg-cyan-400/20 hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[45%] left-[5%] w-1 h-1 rounded-full bg-teal-400/25 hidden lg:block"
        />

        {/* Animated line decorations */}
        <motion.div
          className="absolute top-[20%] left-[8%] hidden xl:block"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.06 }}
          transition={{ duration: 3, delay: 1 }}
        >
          <svg width="200" height="1" viewBox="0 0 200 1" fill="none">
            <motion.line
              x1="0" y1="0.5" x2="200" y2="0.5"
              stroke="url(#line1)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.5 }}
            />
            <defs>
              <linearGradient id="line1" x1="0" y1="0" x2="200" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Decorative spinning ring system with parallax */}
      <motion.div className="absolute right-[5%] top-1/2 -translate-y-1/2 hidden xl:block" style={{ y: ringY }}>
        <motion.div
          style={{ rotate: ringRotate }}
          className="relative w-[420px] h-[420px]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 rounded-full border border-emerald-500/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-emerald-400/50 shadow-lg shadow-emerald-400/30" />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-6"
          >
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/[0.08]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400/40" />
          </motion.div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-14"
          >
            <div className="absolute inset-0 rounded-full border border-teal-500/[0.05]" />
          </motion.div>

          {/* Center glow */}
          <div className="absolute inset-[35%] rounded-full bg-emerald-500/[0.03] blur-xl" />
        </motion.div>
      </motion.div>

      {/* Content with parallax */}
      <motion.div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40" style={{ y: textY, opacity, scale }}>
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-slate-300 text-sm font-medium">
                Al meer dan 1386 tevreden klanten
              </span>
              <span className="text-emerald-400 text-sm font-bold">5.0</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3 w-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Heading with text reveal animation */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            <TextReveal text="Originele Nintendo" delay={0.3} />
            <br />
            <span className="relative inline-block">
              <span className="gradient-text">
                <TextReveal text="games & consoles" delay={0.5} />
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full origin-left"
              />
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl"
          >
            Al sinds 2019 de Nintendo specialist van Nederland. Alle producten
            zijn 100% origineel en persoonlijk getest op werking. Met een
            perfecte{' '}
            <span className="text-white font-semibold">5.0 score</span> op
            Marktplaats.
          </motion.p>

          {/* CTAs with magnetic effect */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <MagneticButton strength={0.2}>
              <Link href="/shop">
                <Button size="lg" className="group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Bekijk alle producten
                    <motion.svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                  </span>
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link href="/over-ons">
                <Button variant="outline" size="lg">
                  Over Gameshop Enter
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Animated stats with counters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-white/[0.06]"
          >
            {[
              { value: '346+', label: 'Producten' },
              { value: '6+', label: 'Jaar ervaring' },
              { value: '12', label: 'Platforms' },
              { value: '100%', label: 'Origineel' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold gradient-text">
                  <AnimatedCounter value={stat.value} delay={1.4 + i * 0.15} />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + i * 0.15 }}
                  className="text-sm text-slate-500 mt-0.5"
                >
                  {stat.label}
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
