'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { getAllProducts } from '@/lib/products';

/* ====== ARCADE SCOREBORD ====== */

const gameCount = getAllProducts().length;

const STATS = [
  { value: 3000, suffix: '+', label: 'Tevreden klanten', icon: '👥' },
  { value: 1360, suffix: '+', label: 'Reviews', icon: '⭐' },
  { value: 5, suffix: '.0', label: 'Marktplaats score', icon: '🏆' },
  { value: gameCount, suffix: '+', label: 'Pokémon games', icon: '🎮' },
];

function ArcadeDigit({ digit, delay }: { digit: string; delay: number }) {
  const [display, setDisplay] = useState('0');
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const rollDuration = 600 + delay * 150;

    const animate = (now: number) => {
      const elapsed = now - start;
      if (elapsed < rollDuration) {
        setDisplay(Math.floor(Math.random() * 10).toString());
        frame = requestAnimationFrame(animate);
      } else {
        setDisplay(digit);
        setSettled(true);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [digit, delay]);

  const isSpecial = digit === '.' || digit === ',';

  if (isSpecial) {
    return (
      <span className="text-xl lg:text-2xl font-mono font-bold text-emerald-400/70 mx-0.5">
        {digit}
      </span>
    );
  }

  return (
    <div className={`relative w-7 h-10 lg:w-9 lg:h-12 rounded-md flex items-center justify-center overflow-hidden transition-all duration-300 ${settled ? 'bg-[#081018] border-emerald-500/20' : 'bg-[#0a1020] border-white/[0.04]'} border`}>
      {/* CRT scanlines (subtiel) */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
      }} />
      {/* Flip-display split lijn */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-black/40 z-10" />
      {/* Digit */}
      <span
        className="relative z-20 text-xl lg:text-2xl font-mono font-bold tabular-nums transition-colors duration-300"
        style={{
          color: settled ? '#34d399' : '#6ee7b7',
          textShadow: settled ? '0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.2)' : '0 0 4px rgba(16, 185, 129, 0.3)',
        }}
      >
        {display}
      </span>
      {/* Bovenkant highlight */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
    </div>
  );
}

function ArcadeCounter({ value, suffix, label, icon, index }: {
  value: number; suffix: string; label: string; icon: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chars = value.toLocaleString('nl-NL').split('');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] as const }}
      whileHover={{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="group relative rounded-2xl p-5 lg:p-6 text-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(5,8,16,0.9) 0%, rgba(10,16,26,0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.08)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

      {/* Spinning border bij hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ padding: '1px' }}>
        <div className="absolute inset-0 rounded-2xl animate-spin-slow" style={{ background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #06b6d4, #3b82f6, #8b5cf6, #10b981)', opacity: 0.3 }} />
        <div className="absolute inset-[1px] rounded-2xl bg-[#0a0e1a]" />
      </div>

      {/* CRT overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)',
      }} />

      <div className="relative z-10">
        <div className="text-xl mb-3">{icon}</div>

        {/* Arcade digit display */}
        <div className="flex items-center justify-center gap-[3px] mb-2">
          {visible ? (
            <>
              {chars.map((char, i) => (
                <ArcadeDigit key={`${char}-${i}`} digit={char} delay={i + index * 2} />
              ))}
              {suffix && (
                <span
                  className="ml-1 text-xl lg:text-2xl font-mono font-bold text-emerald-400/60"
                  style={{ textShadow: '0 0 6px rgba(16, 185, 129, 0.3)' }}
                >
                  {suffix}
                </span>
              )}
            </>
          ) : (
            chars.map((_, i) => (
              <div key={i} className="w-7 h-10 lg:w-9 lg:h-12 rounded-md bg-[#0a1020] border border-white/[0.04]" />
            ))
          )}
        </div>

        <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300 uppercase tracking-wider font-medium">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

/* ====== MAIN COMPONENT ====== */

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1.4, 0.8]);
  const textX = useTransform(scrollYProgress, [0, 1], ['-5%', '0%']);
  const statsX = useTransform(scrollYProgress, [0, 1], ['5%', '0%']);

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
          {/* Tekst met horizontale parallax */}
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
              <span className="gradient-text">Pokémon specialist</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-6">
              Wat begon met het verkopen van kaarten op Marktplaats groeide uit
              tot Gameshop Enter: dé Pokémon specialist van Nederland. Alle
              games zijn 100% origineel en persoonlijk getest.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Met meer dan 3.000 tevreden klanten, 1.360+ reviews en een perfecte 5.0 score op
              Marktplaats staan wij garant voor kwaliteit en betrouwbaarheid.
              Van klassieke Game Boy en DS titels tot 3DS releases
              — bij ons vind je het allemaal. Heb je zelf Pokémon games liggen? Je kunt ze ook bij ons verkopen.
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

          {/* Arcade Scorebord */}
          <motion.div className="grid grid-cols-2 gap-4" style={{ x: statsX }}>
            {STATS.map((stat, index) => (
              <ArcadeCounter
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={stat.icon}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
