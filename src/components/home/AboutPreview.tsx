'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Button from '@/components/ui/Button';
import CountUp from '@/components/ui/CountUp';

const stats = [
  { value: 3000, suffix: '+', label: 'Tevreden klanten' },
  { value: 1360, suffix: '+', label: 'Reviews' },
  { value: 5, suffix: '.0', label: 'Marktplaats score' },
  { value: 820, suffix: '+', label: 'Producten' },
];

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);
  const textX = useTransform(scrollYProgress, [0, 1], ['-3%', '0%']);
  const statsX = useTransform(scrollYProgress, [0, 1], ['3%', '0%']);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Dark background with aurora */}
      <div className="absolute inset-0 bg-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.08),transparent_50%)]" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Animated orb with parallax */}
      <motion.div
        style={{ scale: orbScale }}
        animate={{ opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500 blur-[150px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text with horizontal parallax */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ x: textX }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              Over ons
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Al sinds 2018 de{' '}
              <span className="gradient-text">Nintendo specialist</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-6">
              Wat begon met het verkopen van kaarten op Marktplaats groeide uit
              tot Gameshop Enter: dé Nintendo specialist van Nederland. Alle
              games en consoles zijn 100% origineel en persoonlijk getest.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Met meer dan 3.000 tevreden klanten, 1.360+ reviews en een perfecte 5.0 score op
              Marktplaats staan wij garant voor kwaliteit en betrouwbaarheid.
              Van klassieke Game Boy en N64 titels tot de nieuwste Switch releases
              — bij ons vind je het allemaal. Heb je zelf games liggen? Je kunt ze ook bij ons verkopen.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/over-ons">
                <Button variant="outline" size="lg">
                  Lees ons verhaal
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Button>
              </Link>
              <Link href="/inkoop">
                <Button variant="ghost" size="lg" className="text-emerald-400 hover:text-emerald-300">
                  Games verkopen
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats grid with horizontal parallax */}
          <motion.div className="grid grid-cols-2 gap-4" style={{ x: statsX }}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
                whileHover={{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="glass-card rounded-2xl p-6 lg:p-8 text-center hover:bg-white/[0.06] transition-colors duration-300"
              >
                <div className="text-3xl lg:text-4xl font-extrabold gradient-text mb-2">
                  <CountUp target={stat.value} suffix={stat.suffix} separator="." />
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
