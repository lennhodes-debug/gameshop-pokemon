'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { getAllProducts } from '@/lib/products';

const gameCount = getAllProducts().length;

const STATS = [
  { value: 3000, suffix: '+', label: 'Tevreden klanten', accent: 'text-blue-400/70', hoverGlow: 'from-blue-500/[0.04] to-blue-400/[0.04]', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.208V17.21c0-2.4 1.942-4.34 4.34-4.34h.132c.635 0 1.263.092 1.862.27M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
  { value: 1360, suffix: '+', label: 'Reviews', accent: 'text-amber-400/70', hoverGlow: 'from-amber-500/[0.04] to-amber-400/[0.04]', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
  { value: 5, suffix: '.0', label: 'Marktplaats score', accent: 'text-emerald-400/70', hoverGlow: 'from-emerald-500/[0.04] to-emerald-400/[0.04]', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m5.25-6.124V2.721" /></svg> },
  { value: gameCount, suffix: '+', label: 'Nintendo games', accent: 'text-violet-400/70', hoverGlow: 'from-violet-500/[0.04] to-violet-400/[0.04]', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.466 3.2.836 4.748a48.354 48.354 0 009.57 0c.37-1.548.65-3.135.836-4.748a48.39 48.39 0 01-4.163.3.64.64 0 01-.657-.643v0z" /></svg> },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const start = performance.now();
        const duration = 1200;
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(value * eased));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(value);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className="text-3xl lg:text-4xl font-semibold text-white tabular-nums">
      {count.toLocaleString('nl-NL')}{suffix}
    </span>
  );
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl p-5 lg:p-6 text-center overflow-hidden border border-white/[0.06] hover:border-white/[0.1] transition-colors duration-300"
      style={{ background: 'linear-gradient(135deg, rgba(5,8,16,0.9), rgba(10,16,26,0.95))' }}
    >
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${stat.hoverGlow}`} />

      <div className="relative z-10">
        <div className={`${stat.accent} mb-3 flex justify-center`}>{stat.icon}</div>
        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
        <div className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-2">
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutPreview() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/25 text-xs font-medium uppercase tracking-[0.3em] mb-5">
              Over ons
            </p>
            <h2 className="text-3xl lg:text-5xl font-semibold text-white leading-tight tracking-tight mb-6">
              Al sinds 2018 de Nintendo specialist
            </h2>
            <p className="text-base text-slate-400 leading-relaxed mb-6">
              Wat begon met het verkopen van games op Marktplaats groeide uit
              tot Gameshop Enter: d&eacute; Nintendo specialist van Nederland. Alle
              games zijn 100% origineel en persoonlijk getest.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Met meer dan 3.000 tevreden klanten en een perfecte 5.0 score op
              Marktplaats staan wij garant voor kwaliteit en betrouwbaarheid.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/over-ons"
                className="inline-flex items-center h-12 px-6 rounded-xl border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.06] transition-colors duration-200"
              >
                Lees ons verhaal
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
              <Link
                href="/inkoop"
                className="inline-flex items-center h-12 px-6 rounded-xl text-emerald-400 font-semibold text-sm hover:text-emerald-300 transition-colors duration-200"
              >
                Games verkopen
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
