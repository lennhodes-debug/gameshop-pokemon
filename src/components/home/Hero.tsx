'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [started, target]);

  return (
    <div ref={ref} className="text-xl font-bold text-white tabular-nums" aria-label={`${target.toLocaleString('nl-NL')}${suffix}`}>
      {count.toLocaleString('nl-NL')}{suffix}
    </div>
  );
}

/* Shooting star component */
function ShootingStar({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
      style={{
        width: '120px',
        top: `${8 + Math.random() * 25}%`,
        left: '-120px',
        rotate: '-15deg',
        filter: 'blur(0.3px)',
      }}
      animate={{
        x: [0, typeof window !== 'undefined' ? window.innerWidth + 400 : 2000],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.8,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 8 + Math.random() * 12,
        ease: 'easeOut',
      }}
    >
      {/* Glow trail */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent blur-[2px] scale-y-[3]" />
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Multi-layer parallax
  const skyY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const starsY = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);
  const mountainFarY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const mountainMidY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const mountainNearY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const cloudsY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  // Mouse interactive aurora
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  // Aurora glow position based on mouse
  const auroraX = useTransform(smoothX, [0, 1], ['10%', '80%']);
  const auroraY = useTransform(smoothY, [0, 1], ['5%', '35%']);

  return (
    <section ref={sectionRef} className="relative h-[110vh] overflow-hidden" onMouseMove={handleMouseMove}>
      {/* === SKY LAYER === */}
      <motion.div className="absolute inset-0" style={{ y: skyY }}>
        {/* Base sky gradient - deep blue night sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040a18] via-[#081428] via-40% to-[#0c1e38]" />

        {/* Interactive aurora that follows mouse */}
        <motion.div
          className="absolute w-[70%] h-[50%] rounded-full opacity-[0.12] pointer-events-none"
          style={{
            left: auroraX,
            top: auroraY,
            background: 'radial-gradient(ellipse, rgba(16,185,129,0.7) 0%, rgba(6,182,212,0.4) 30%, rgba(139,92,246,0.15) 60%, transparent 80%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Static aurora accents */}
        <motion.div
          className="absolute top-[5%] left-[10%] w-[60%] h-[40%] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(ellipse, rgba(16,185,129,0.6) 0%, rgba(6,182,212,0.3) 40%, transparent 70%)',
          }}
          animate={{ x: [0, 40, -20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[10%] right-[5%] w-[40%] h-[30%] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, rgba(16,185,129,0.2) 40%, transparent 70%)',
          }}
          animate={{ x: [0, -30, 20, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Warm horizon glow */}
        <div className="absolute bottom-[20%] left-0 right-0 h-[35%] bg-gradient-to-t from-[#ff6b3520] via-[#ff8c4210] to-transparent" />
        <div className="absolute bottom-[25%] left-[20%] right-[20%] h-[20%] bg-gradient-to-t from-[#fbbf2415] to-transparent rounded-full blur-[60px]" />
      </motion.div>

      {/* === STARS — geoptimaliseerd: CSS-only op mobiel, Framer Motion op desktop === */}
      <motion.div className="absolute inset-0" style={{ y: starsY }}>
        {[
          { t: '4%', l: '8%', s: 2.5, d: 3 }, { t: '8%', l: '15%', s: 2, d: 3 },
          { t: '12%', l: '45%', s: 1.5, d: 4 }, { t: '5%', l: '72%', s: 2.5, d: 2.5 },
          { t: '18%', l: '88%', s: 1, d: 5 }, { t: '15%', l: '32%', s: 1.5, d: 3.5 },
          { t: '22%', l: '58%', s: 1, d: 4.5 }, { t: '7%', l: '8%', s: 1.5, d: 3 },
          { t: '25%', l: '78%', s: 2, d: 2 }, { t: '10%', l: '92%', s: 1, d: 5.5 },
          { t: '3%', l: '52%', s: 2, d: 4 }, { t: '28%', l: '22%', s: 1, d: 3.2 },
        ].map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ top: star.t, left: star.l, width: star.s, height: star.s }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: star.d, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        {/* Extra sterren alleen op desktop */}
        {[
          { t: '16%', l: '65%', s: 2.5, d: 2.8 }, { t: '20%', l: '5%', s: 1, d: 4.2 },
          { t: '6%', l: '38%', s: 1.5, d: 3.8 }, { t: '2%', l: '25%', s: 1, d: 5.2 },
          { t: '13%', l: '82%', s: 2, d: 3.3 }, { t: '9%', l: '60%', s: 1, d: 4.7 },
          { t: '24%', l: '42%', s: 1.5, d: 2.6 }, { t: '1%', l: '95%', s: 2, d: 3.9 },
          { t: '17%', l: '18%', s: 1, d: 4.1 }, { t: '11%', l: '76%', s: 1.5, d: 3.4 },
          { t: '30%', l: '50%', s: 1, d: 5.1 }, { t: '14%', l: '3%', s: 2, d: 2.9 },
        ].map((star, i) => (
          <motion.div
            key={`d-${i}`}
            className="absolute rounded-full bg-white hidden md:block"
            style={{ top: star.t, left: star.l, width: star.s, height: star.s }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: star.d, repeat: Infinity, delay: (i + 12) * 0.2 }}
          />
        ))}
      </motion.div>

      {/* === SHOOTING STARS === */}
      <ShootingStar delay={3} />
      <ShootingStar delay={9} />
      <ShootingStar delay={16} />

      {/* === FAR MOUNTAINS (darkest, most blurred) === */}
      <motion.div className="absolute bottom-0 left-0 right-0" style={{ y: mountainFarY }}>
        <svg viewBox="0 0 1440 400" className="w-full" preserveAspectRatio="none" style={{ height: '55vh' }}>
          <defs>
            <linearGradient id="mtn-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c1a30" />
              <stop offset="100%" stopColor="#071018" />
            </linearGradient>
          </defs>
          <path d="M0,200 L80,160 L160,180 L280,90 L360,130 L440,70 L520,120 L640,50 L720,100 L800,60 L920,130 L1000,80 L1080,110 L1200,40 L1280,100 L1360,70 L1440,120 L1440,400 L0,400 Z" fill="url(#mtn-far)" opacity="0.7" />
        </svg>
      </motion.div>

      {/* === MID MOUNTAINS === */}
      <motion.div className="absolute bottom-0 left-0 right-0" style={{ y: mountainMidY }}>
        <svg viewBox="0 0 1440 400" className="w-full" preserveAspectRatio="none" style={{ height: '45vh' }}>
          <defs>
            <linearGradient id="mtn-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#091525" />
              <stop offset="60%" stopColor="#060e1a" />
              <stop offset="100%" stopColor="#050a12" />
            </linearGradient>
          </defs>
          <path d="M0,220 L100,170 L200,200 L320,110 L420,160 L500,90 L600,140 L720,70 L840,130 L920,80 L1020,150 L1120,100 L1200,140 L1320,60 L1440,110 L1440,400 L0,400 Z" fill="url(#mtn-mid)" opacity="0.85" />
        </svg>
      </motion.div>

      {/* === FLOATING CLOUDS (parallax layer) === */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: cloudsY }}>
        <motion.div
          className="absolute top-[30%] -left-[10%]"
          animate={{ x: ['0%', '120%'] }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-[300px] h-[60px] bg-white/[0.04] rounded-full blur-[30px]" />
        </motion.div>
        <motion.div
          className="absolute top-[25%] left-[40%]"
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear', delay: 20 }}
        >
          <div className="w-[200px] h-[40px] bg-white/[0.03] rounded-full blur-[25px]" />
        </motion.div>
        <motion.div
          className="absolute top-[45%] -right-[5%]"
          animate={{ x: ['-120%', '0%'] }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear', delay: 10 }}
        >
          <div className="w-[250px] h-[50px] bg-white/[0.05] rounded-full blur-[20px]" />
        </motion.div>
        <motion.div
          className="absolute top-[38%] left-[20%]"
          animate={{ x: [0, 60, 0], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-[180px] h-[30px] bg-white/[0.04] rounded-full blur-[15px]" />
        </motion.div>
      </motion.div>

      {/* === NEAR MOUNTAINS (foreground, darkest) === */}
      <motion.div className="absolute bottom-0 left-0 right-0" style={{ y: mountainNearY }}>
        <svg viewBox="0 0 1440 300" className="w-full" preserveAspectRatio="none" style={{ height: '35vh' }}>
          <defs>
            <linearGradient id="mtn-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#060d18" />
              <stop offset="100%" stopColor="#040810" />
            </linearGradient>
          </defs>
          <path d="M0,180 L120,140 L240,170 L380,100 L480,150 L560,80 L680,130 L760,90 L880,150 L960,110 L1080,160 L1180,120 L1300,80 L1440,140 L1440,300 L0,300 Z" fill="url(#mtn-near)" />
        </svg>
      </motion.div>

      {/* === FLOATING GAME COVERS with glow halos (desktop only) === */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block" style={{ perspective: '800px' }}>
        {[
          { img: '/images/products/sw-001-the-legend-of-zelda-breath-of-the-wild.webp', t: '18%', l: '3%', z: -200, s: 80, d: 10, del: 0, glow: 'rgba(16,185,129,0.3)' },
          { img: '/images/products/gc-001-the-legend-of-zelda-the-wind-waker.webp', t: '36%', l: '89%', z: -150, s: 72, d: 12, del: 1, glow: 'rgba(99,102,241,0.3)' },
          { img: '/images/products/n64-001-super-mario-64.webp', t: '10%', l: '86%', z: -100, s: 64, d: 9, del: 2, glow: 'rgba(239,68,68,0.3)' },
          { img: '/images/products/sw-004-mario-kart-8-deluxe.webp', t: '50%', l: '1%', z: -120, s: 68, d: 11, del: 0.5, glow: 'rgba(245,158,11,0.3)' },
          { img: '/images/products/gb-001-pokemon-blue.webp', t: '56%', l: '94%', z: -180, s: 56, d: 8, del: 1.5, glow: 'rgba(59,130,246,0.3)' },
          { img: '/images/products/snes-001-super-mario-world.webp', t: '8%', l: '12%', z: -250, s: 52, d: 13, del: 3, glow: 'rgba(168,85,247,0.3)' },
        ].map((cover, i) => (
          <motion.div
            key={i}
            className="absolute rounded-xl overflow-hidden"
            style={{
              top: cover.t,
              left: cover.l,
              width: cover.s,
              height: cover.s,
              opacity: cover.z < -180 ? 0.4 : cover.z < -120 ? 0.6 : 0.8,
              filter: cover.z < -180 ? 'blur(1.5px)' : cover.z < -120 ? 'blur(0.5px)' : 'none',
              boxShadow: `0 0 30px 5px ${cover.glow}, 0 8px 32px rgba(0,0,0,0.3)`,
            }}
            animate={{
              y: [0, -14, 0, 10, 0],
              rotateY: [-3, 4, -3],
              rotateX: [2, -3, 2],
              scale: [1, 1.04, 1, 0.96, 1],
            }}
            transition={{
              duration: cover.d,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: cover.del,
            }}
          >
            <img
              src={cover.img}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* === MAGICAL SPARKLES / FIREFLIES (alleen desktop) === */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {[
          { t: '55%', l: '15%', d: 4, del: 0, color: 'bg-emerald-300' },
          { t: '50%', l: '35%', d: 5, del: 1, color: 'bg-cyan-300' },
          { t: '60%', l: '55%', d: 3.5, del: 2, color: 'bg-emerald-300' },
          { t: '48%', l: '75%', d: 4.5, del: 0.5, color: 'bg-teal-300' },
          { t: '58%', l: '90%', d: 5.5, del: 1.5, color: 'bg-cyan-300' },
        ].map((spark, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${spark.color}`}
            style={{ top: spark.t, left: spark.l }}
            animate={{
              y: [0, -20, -10, -30, 0],
              opacity: [0, 0.7, 0.3, 0.9, 0],
              scale: [0.5, 1.2, 0.8, 1.4, 0.5],
            }}
            transition={{ duration: spark.d, repeat: Infinity, delay: spark.del, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* === CONTENT OVERLAY === */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ y: textY, opacity: textOpacity, scale: textScale }}
      >
        <div className="text-center px-4 max-w-4xl mx-auto">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.1]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium">3000+ tevreden klanten</span>
              <span className="text-white/30">|</span>
              <span className="text-emerald-400 text-xs font-bold">5.0</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-2.5 w-2.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main heading with shimmer effect on "Enter" */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
          >
            <span className="block">Gameshop</span>
            <span className="block relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400">
                Enter
              </span>
              {/* Shimmer sweep over title */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['-100% 0%', '200% 0%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              >
                Enter
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Van klassieke NES-parels tot de nieuwste Switch-titels — elk product origineel, getest en met liefde verpakt. 846+ games & consoles op voorraad.
          </motion.p>

          {/* CTA Buttons with glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/shop"
              className="group relative inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 hover:scale-[1.03] transition-all duration-300 animate-cta-attention"
            >
              {/* Button glow pulse */}
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
              Ontdek de collectie
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/inkoop"
              className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] text-white font-bold text-sm hover:bg-white/[0.14] hover:border-white/[0.2] transition-all duration-300"
            >
              Games verkopen
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex justify-center gap-12 mt-16"
          >
            {[
              { target: 846, suffix: '+', label: 'Games & Consoles' },
              { target: 12, suffix: '', label: 'Platforms' },
              { target: 100, suffix: '%', label: 'Origineel' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.15, duration: 0.5 }}
              >
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient to page content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] dark:from-slate-900 to-transparent z-10" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1 h-2 rounded-full bg-white/40"
            animate={{ y: [0, 12, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
