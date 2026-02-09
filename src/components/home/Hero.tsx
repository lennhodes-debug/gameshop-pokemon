'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
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
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-xl font-bold text-white tabular-nums">
      {count.toLocaleString('nl-NL')}{suffix}
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section ref={sectionRef} className="relative h-[110vh] overflow-hidden">
      {/* === SKY LAYER === */}
      <motion.div className="absolute inset-0" style={{ y: skyY }}>
        {/* Base sky gradient - deep blue night sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d1f] via-[#0c1a30] via-40% to-[#0e2240]" />

        {/* Aurora / Northern lights effect */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-[5%] left-[10%] w-[60%] h-[40%] rounded-full opacity-[0.08]"
            style={{
              background: 'radial-gradient(ellipse, rgba(16,185,129,0.6) 0%, rgba(6,182,212,0.3) 40%, transparent 70%)',
            }}
            animate={{ x: [0, 40, -20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-[10%] right-[5%] w-[40%] h-[30%] rounded-full opacity-[0.06]"
            style={{
              background: 'radial-gradient(ellipse, rgba(6,182,212,0.4) 0%, rgba(16,185,129,0.2) 40%, transparent 70%)',
            }}
            animate={{ x: [0, -30, 20, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Warm horizon glow */}
        <div className="absolute bottom-[20%] left-0 right-0 h-[35%] bg-gradient-to-t from-[#ff6b3520] via-[#ff8c4210] to-transparent" />
        <div className="absolute bottom-[25%] left-[20%] right-[20%] h-[20%] bg-gradient-to-t from-[#fbbf2415] to-transparent rounded-full blur-[60px]" />
      </motion.div>

      {/* === STARS === */}
      <motion.div className="absolute inset-0" style={{ y: starsY }}>
        {[
          { t: '8%', l: '15%', s: 2, d: 3 }, { t: '12%', l: '45%', s: 1.5, d: 4 },
          { t: '5%', l: '72%', s: 2, d: 2.5 }, { t: '18%', l: '88%', s: 1, d: 5 },
          { t: '15%', l: '32%', s: 1.5, d: 3.5 }, { t: '22%', l: '58%', s: 1, d: 4.5 },
          { t: '7%', l: '8%', s: 1.5, d: 3 }, { t: '25%', l: '78%', s: 2, d: 2 },
          { t: '10%', l: '92%', s: 1, d: 5.5 }, { t: '3%', l: '52%', s: 1.5, d: 4 },
          { t: '28%', l: '22%', s: 1, d: 3.2 }, { t: '16%', l: '65%', s: 2, d: 2.8 },
          { t: '20%', l: '5%', s: 1, d: 4.2 }, { t: '6%', l: '38%', s: 1.5, d: 3.8 },
        ].map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ top: star.t, left: star.l, width: star.s, height: star.s }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: star.d, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.div>

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
        {/* Cloud 1 - large, slow */}
        <motion.div
          className="absolute top-[30%] -left-[10%]"
          animate={{ x: ['0%', '120%'] }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-[300px] h-[60px] bg-white/[0.04] rounded-full blur-[30px]" />
        </motion.div>

        {/* Cloud 2 */}
        <motion.div
          className="absolute top-[25%] left-[40%]"
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear', delay: 20 }}
        >
          <div className="w-[200px] h-[40px] bg-white/[0.03] rounded-full blur-[25px]" />
        </motion.div>

        {/* Cloud 3 - between mountains */}
        <motion.div
          className="absolute top-[45%] -right-[5%]"
          animate={{ x: ['-120%', '0%'] }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear', delay: 10 }}
        >
          <div className="w-[250px] h-[50px] bg-white/[0.05] rounded-full blur-[20px]" />
        </motion.div>

        {/* Cloud wisps near peaks */}
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

      {/* === MAGICAL SPARKLES / FIREFLIES === */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { t: '55%', l: '15%', d: 4, del: 0 },
          { t: '50%', l: '35%', d: 5, del: 1 },
          { t: '60%', l: '55%', d: 3.5, del: 2 },
          { t: '48%', l: '75%', d: 4.5, del: 0.5 },
          { t: '58%', l: '90%', d: 5.5, del: 1.5 },
          { t: '52%', l: '25%', d: 4, del: 3 },
          { t: '45%', l: '65%', d: 3, del: 2.5 },
          { t: '62%', l: '45%', d: 5, del: 0.8 },
        ].map((spark, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-300"
            style={{ top: spark.t, left: spark.l }}
            animate={{
              y: [0, -20, -10, -30, 0],
              opacity: [0, 0.6, 0.3, 0.8, 0],
              scale: [0.5, 1, 0.8, 1.2, 0.5],
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
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
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

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
          >
            <span className="block">Gameshop</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400">
              Enter
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Van klassieke NES-parels tot de nieuwste Switch-titels — elk product origineel, getest en met liefde verpakt. 820+ games & consoles op voorraad.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300"
            >
              Ontdek de collectie
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/inkoop"
              className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] text-white font-bold text-sm hover:bg-white/[0.12] transition-all duration-300"
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
              { target: 820, suffix: '+', label: 'Games & Consoles' },
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
