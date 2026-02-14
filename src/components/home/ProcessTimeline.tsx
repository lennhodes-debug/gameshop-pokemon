'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/* ── Animated SVG illustrations per stap ── */

function InkoopIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Geld/coins floating */}
      <motion.div
        className="absolute"
        animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          {/* Cartridge shape */}
          <rect x="50" y="30" width="100" height="140" rx="8" fill={`${accent}15`} stroke={accent} strokeWidth="2" />
          <rect x="65" y="45" width="70" height="50" rx="4" fill={`${accent}20`} />
          <rect x="75" y="105" width="50" height="8" rx="4" fill={`${accent}25`} />
          <rect x="85" y="120" width="30" height="6" rx="3" fill={`${accent}15`} />
          {/* Notch */}
          <rect x="80" y="30" width="40" height="10" rx="2" fill={`${accent}30`} />
        </svg>
      </motion.div>
      {/* Floating coin 1 */}
      <motion.div
        className="absolute top-4 right-8"
        animate={{ y: [-12, 4, -12], x: [0, 6, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      >
        <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold" style={{ borderColor: accent, color: accent, background: `${accent}10` }}>
          €
        </div>
      </motion.div>
      {/* Floating coin 2 */}
      <motion.div
        className="absolute bottom-8 left-6"
        animate={{ y: [6, -10, 6], x: [0, -4, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
      >
        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: accent, color: accent, background: `${accent}10` }}>
          €
        </div>
      </motion.div>
      {/* Arrow pointing down */}
      <motion.div
        className="absolute -bottom-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </div>
  );
}

function TestenIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Console shape */}
      <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="220" height="160" viewBox="0 0 220 160" fill="none">
          {/* DS body */}
          <rect x="30" y="10" width="160" height="140" rx="12" fill={`${accent}10`} stroke={accent} strokeWidth="1.5" />
          {/* Top screen */}
          <rect x="50" y="20" width="120" height="55" rx="6" fill={`${accent}08`} stroke={`${accent}40`} strokeWidth="1" />
          {/* Bottom screen */}
          <rect x="50" y="85" width="120" height="55" rx="6" fill={`${accent}08`} stroke={`${accent}40`} strokeWidth="1" />
          {/* Hinge */}
          <line x1="40" y1="78" x2="180" y2="78" stroke={`${accent}30`} strokeWidth="1.5" />
        </svg>
      </motion.div>
      {/* Checkmark animating */}
      <motion.div
        className="absolute top-6 right-4"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3, ease: 'easeOut' }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${accent}20`, border: `2px solid ${accent}` }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>
      {/* Pulsing scanning line */}
      <motion.div
        className="absolute left-[50px] w-[120px] h-0.5 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        animate={{ top: ['30px', '60px', '30px'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function FotoIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Camera body */}
      <motion.div animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="200" height="180" viewBox="0 0 200 180" fill="none">
          {/* Camera body */}
          <rect x="30" y="50" width="140" height="100" rx="16" fill={`${accent}12`} stroke={accent} strokeWidth="2" />
          {/* Lens */}
          <circle cx="100" cy="100" r="35" fill={`${accent}08`} stroke={accent} strokeWidth="2" />
          <circle cx="100" cy="100" r="25" fill={`${accent}06`} stroke={`${accent}50`} strokeWidth="1" />
          <circle cx="100" cy="100" r="12" fill={`${accent}15`} />
          {/* Flash */}
          <rect x="40" y="40" width="30" height="15" rx="4" fill={`${accent}20`} stroke={accent} strokeWidth="1" />
          {/* Viewfinder */}
          <rect x="130" y="40" width="20" height="14" rx="3" fill={`${accent}15`} stroke={`${accent}50`} strokeWidth="1" />
        </svg>
      </motion.div>
      {/* Flash burst */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 55%, ${accent}30, transparent 50%)` }}
        animate={{ opacity: [0, 0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', times: [0, 0.7, 0.75, 1] }}
      />
      {/* Floating photo frames */}
      <motion.div
        className="absolute -top-1 -right-1 w-14 h-14 rounded-lg border"
        style={{ borderColor: `${accent}40`, background: `${accent}08` }}
        animate={{ y: [-6, 6, -6], rotate: [8, 12, 8] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1 -left-1 w-12 h-12 rounded-lg border"
        style={{ borderColor: `${accent}30`, background: `${accent}06` }}
        animate={{ y: [4, -8, 4], rotate: [-6, -10, -6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </div>
  );
}

function VerzendIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Package */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="180" height="160" viewBox="0 0 180 160" fill="none">
          {/* Box body */}
          <rect x="30" y="50" width="120" height="90" rx="8" fill={`${accent}12`} stroke={accent} strokeWidth="2" />
          {/* Box lid */}
          <path d="M25 50 L90 20 L155 50" stroke={accent} strokeWidth="2" fill={`${accent}08`} />
          <line x1="90" y1="20" x2="90" y2="50" stroke={`${accent}40`} strokeWidth="1" strokeDasharray="4 3" />
          {/* Tape */}
          <rect x="75" y="50" width="30" height="90" rx="2" fill={`${accent}15`} stroke={`${accent}40`} strokeWidth="1" />
          {/* Bubble wrap dots */}
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={45 + i * 15} cy={80} r="4" fill={`${accent}10`} stroke={`${accent}30`} strokeWidth="0.5" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <circle key={`b${i}`} cx={52 + i * 15} cy={95} r="4" fill={`${accent}10`} stroke={`${accent}30`} strokeWidth="0.5" />
          ))}
        </svg>
      </motion.div>
      {/* Speed lines */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 rounded-full"
          style={{
            width: 20 + i * 10,
            left: -10 - i * 8,
            top: 60 + i * 20,
            background: `linear-gradient(90deg, transparent, ${accent}60)`,
          }}
          animate={{ opacity: [0, 0.7, 0], x: [-20, 10, 30] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
        />
      ))}
      {/* Location pin */}
      <motion.div
        className="absolute top-2 right-6"
        animate={{ y: [-4, 4, -4], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <svg width="24" height="32" viewBox="0 0 24 32" fill={accent} opacity={0.7}>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0zm0 16a4 4 0 110-8 4 4 0 010 8z" />
        </svg>
      </motion.div>
    </div>
  );
}

const ILLUSTRATIONS = [InkoopIllustration, TestenIllustration, FotoIllustration, VerzendIllustration];

const STEPS = [
  {
    number: '01',
    title: 'Inkoop',
    subtitle: 'We zoeken de beste games',
    description: 'We kopen Nintendo games in van particulieren en verzamelaars door heel Nederland. Alleen originele exemplaren — geen reproducties.',
    accent: '#10b981',
    stats: [
      { value: '100%', label: 'Origineel' },
      { value: 'NL', label: 'Landelijk' },
    ],
  },
  {
    number: '02',
    title: 'Testen',
    subtitle: 'Elk spel persoonlijk gecontroleerd',
    description: 'Elke game wordt uitgebreid getest: save-functie, pins schoonmaken, labels controleren. Zo weet je zeker dat alles werkt.',
    accent: '#0ea5e9',
    stats: [
      { value: '5+', label: 'Checks per game' },
      { value: '0', label: 'Defecten' },
    ],
  },
  {
    number: '03',
    title: 'Catalogiseren',
    subtitle: 'Uitgebreide productpagina\'s',
    description: 'Elke game krijgt een gedetailleerde productpagina met conditie-beschrijving, platforminfo en eerlijke prijzen.',
    accent: '#a855f7',
    stats: [
      { value: '141+', label: 'Producten' },
      { value: '6', label: 'Platforms' },
    ],
  },
  {
    number: '04',
    title: 'Verzenden',
    subtitle: 'Veilig verpakt, snel geleverd',
    description: 'Bubbeltjesfolie, stevige dozen, met tracking. Gratis verzending vanaf €100. Meestal binnen 1-2 werkdagen in huis.',
    accent: '#f59e0b',
    stats: [
      { value: '1-2', label: 'Werkdagen' },
      { value: '€0', label: 'Vanaf €100' },
    ],
  },
];

function CinematicStep({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const Illustration = ILLUSTRATIONS[index];

  return (
    <motion.div
      ref={ref}
      className="relative"
    >
      <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
        {/* Illustratie kant */}
        <motion.div
          className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}
          style={{ y: parallaxY }}
        >
          <div
            className="relative aspect-square max-w-[320px] lg:max-w-[400px] mx-auto rounded-3xl overflow-hidden"
            style={{
              background: `radial-gradient(ellipse at center, ${step.accent}08, transparent 70%)`,
            }}
          >
            {/* Glow ring */}
            <div
              className="absolute inset-4 rounded-2xl transition-opacity duration-1000"
              style={{
                border: `1px solid ${step.accent}15`,
                opacity: isInView ? 1 : 0,
              }}
            />
            {/* Animated illustration */}
            <motion.div
              className="absolute inset-0 p-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <Illustration accent={step.accent} />
            </motion.div>
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8">
              <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, ${step.accent}40, transparent)` }} />
              <div className="absolute top-0 left-0 h-full w-px" style={{ background: `linear-gradient(180deg, ${step.accent}40, transparent)` }} />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8">
              <div className="absolute bottom-0 right-0 w-full h-px" style={{ background: `linear-gradient(270deg, ${step.accent}40, transparent)` }} />
              <div className="absolute bottom-0 right-0 h-full w-px" style={{ background: `linear-gradient(0deg, ${step.accent}40, transparent)` }} />
            </div>
          </div>
        </motion.div>

        {/* Tekst kant */}
        <div className={`${index % 2 === 1 ? 'lg:order-1 lg:text-right' : ''}`}>
          {/* Stap nummer */}
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 1 ? 20 : -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`flex items-center gap-3 mb-6 ${index % 2 === 1 ? 'lg:justify-end' : ''}`}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${step.accent}15`, color: step.accent, border: `1px solid ${step.accent}25` }}
            >
              {step.number}
            </div>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(${index % 2 === 1 ? '270deg' : '90deg'}, ${step.accent}50, transparent)` }} />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] mb-2"
          >
            {step.title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-base font-medium mb-4"
            style={{ color: `${step.accent}bb` }}
          >
            {step.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/40 text-sm lg:text-base leading-relaxed mb-8 max-w-md"
            style={index % 2 === 1 ? { marginLeft: 'auto' } : {}}
          >
            {step.description}
          </motion.p>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex gap-6 ${index % 2 === 1 ? 'lg:justify-end' : ''}`}
          >
            {step.stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: step.accent }}>
                  {stat.value}
                </div>
                <div className="text-[11px] text-white/30 uppercase tracking-wider font-medium mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.5'],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={containerRef} className="relative py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.04),transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cinematic header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 lg:mb-32"
        >
          <p className="text-white/25 text-[11px] font-medium uppercase tracking-[0.3em] mb-5">
            Van inkoop tot levering
          </p>
          <h2 className="text-4xl lg:text-[64px] font-light text-white tracking-[-0.03em] leading-[1] mb-6">
            Hoe het{' '}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
              werkt
            </span>
          </h2>
          <p className="text-white/30 text-sm lg:text-base max-w-lg mx-auto leading-relaxed">
            Elke game doorloopt ons volledige kwaliteitsproces voordat
            hij bij jou thuis wordt bezorgd
          </p>

          {/* Scroll progress bar */}
          <div className="mt-10 mx-auto max-w-sm h-px bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500"
              style={{ width: progressWidth }}
            />
          </div>
        </motion.div>

        {/* Cinematic stappen */}
        <div className="space-y-24 lg:space-y-40">
          {STEPS.map((step, index) => (
            <CinematicStep key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Afsluiter */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 lg:mt-32 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <span className="text-emerald-300/80 text-sm lg:text-base font-medium">
              100% origineel &middot; Persoonlijk getest &middot; Gratis vanaf &euro;100
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
