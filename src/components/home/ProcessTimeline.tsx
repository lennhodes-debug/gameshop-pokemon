'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/* ── Verbeterde SVG illustraties per stap ── */

function InkoopIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Game cartridge */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          {/* Cartridge body */}
          <rect
            x="35"
            y="25"
            width="90"
            height="110"
            rx="6"
            fill={`${accent}12`}
            stroke={accent}
            strokeWidth="2"
          />
          {/* Cartridge label */}
          <rect
            x="45"
            y="35"
            width="70"
            height="40"
            rx="3"
            fill={`${accent}25`}
            stroke={`${accent}40`}
            strokeWidth="1"
          />
          {/* Connector */}
          <rect x="45" y="85" width="70" height="8" rx="2" fill={`${accent}35`} />
          {/* Contact pins */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={50 + i * 15} y="95" width="4" height="8" rx="1" fill={`${accent}50`} />
          ))}
        </svg>
      </motion.div>
      {/* Floating coins */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          animate={{ y: [-8 + i * 4, 8 + i * 4, -8 + i * 4], x: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
          style={{
            [i === 0 ? 'top' : 'bottom']: '12px',
            [i === 0 ? 'right' : 'left']: '16px',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{ background: `${accent}20`, border: `1.5px solid ${accent}`, color: accent }}
          >
            €
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TestenIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Test/verification console */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
          {/* Console body */}
          <rect
            x="25"
            y="15"
            width="130"
            height="110"
            rx="10"
            fill={`${accent}10`}
            stroke={accent}
            strokeWidth="2"
          />
          {/* Screen */}
          <rect
            x="40"
            y="25"
            width="100"
            height="70"
            rx="6"
            fill={`${accent}06`}
            stroke={`${accent}35`}
            strokeWidth="1.5"
          />
          {/* Screen content grid */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={50 + col * 25}
                y={35 + row * 20}
                width="18"
                height="18"
                rx="2"
                fill={`${accent}15`}
              />
            )),
          )}
          {/* Button area */}
          <rect x="40" y="105" width="100" height="12" rx="2" fill={`${accent}15`} />
          <circle cx="55" cy="111" r="2.5" fill={`${accent}40`} />
          <circle cx="75" cy="111" r="2.5" fill={`${accent}40`} />
          <circle cx="95" cy="111" r="2.5" fill={`${accent}40`} />
          <circle cx="115" cy="111" r="2.5" fill={`${accent}40`} />
        </svg>
      </motion.div>

      {/* Checkmark indicator */}
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${accent}25`, border: `2px solid ${accent}` }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

function FotoIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Product card/catalog */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="160" height="180" viewBox="0 0 160 180" fill="none">
          {/* Card container */}
          <rect
            x="20"
            y="15"
            width="120"
            height="150"
            rx="12"
            fill={`${accent}10`}
            stroke={accent}
            strokeWidth="2"
          />
          {/* Product image area */}
          <rect
            x="30"
            y="25"
            width="100"
            height="80"
            rx="8"
            fill={`${accent}15`}
            stroke={`${accent}30`}
            strokeWidth="1"
          />
          {/* Game cartridge in frame */}
          <rect x="45" y="35" width="70" height="60" rx="4" fill={`${accent}08`} />
          {/* Info lines */}
          <rect x="30" y="115" width="100" height="6" rx="2" fill={`${accent}20`} />
          <rect x="30" y="130" width="75" height="4" rx="2" fill={`${accent}15`} />
          <rect x="30" y="140" width="60" height="4" rx="2" fill={`${accent}12`} />
          {/* Price indicator */}
          <rect x="30" y="155" width="35" height="8" rx="2" fill={`${accent}25`} />
        </svg>
      </motion.div>

      {/* Floating catalog cards */}
      <motion.div
        className="absolute -top-3 -right-3 w-10 h-12 rounded-lg border"
        style={{ borderColor: `${accent}40`, background: `${accent}10` }}
        animate={{ y: [-5, 5, -5], rotate: [12, 18, 12], scale: [0.95, 1, 0.95] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-2 -left-2 w-9 h-11 rounded-lg border"
        style={{ borderColor: `${accent}30`, background: `${accent}08` }}
        animate={{ y: [4, -6, 4], rotate: [-8, -14, -8], scale: [0.9, 0.98, 0.9] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
    </div>
  );
}

function VerzendIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Shipping package */}
      <motion.div
        animate={{ y: [-5, 5, -5], rotate: [-1, 1, -1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="160" height="150" viewBox="0 0 160 150" fill="none">
          {/* Package box */}
          <rect
            x="25"
            y="45"
            width="110"
            height="85"
            rx="8"
            fill={`${accent}12`}
            stroke={accent}
            strokeWidth="2"
          />
          {/* Box flap */}
          <path d="M20 45L80 20L140 45" stroke={accent} strokeWidth="2" fill={`${accent}08`} />
          {/* Tape */}
          <rect
            x="70"
            y="45"
            width="20"
            height="85"
            rx="2"
            fill={`${accent}20`}
            stroke={`${accent}35`}
            strokeWidth="1"
          />
          {/* Bubble wrap texture */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={40 + col * 25}
                cy={70 + row * 20}
                r="3"
                fill={`${accent}15`}
                stroke={`${accent}30`}
                strokeWidth="0.5"
              />
            )),
          )}
          {/* Label */}
          <rect
            x="35"
            y="100"
            width="90"
            height="18"
            rx="3"
            fill={`${accent}15`}
            stroke={`${accent}35`}
            strokeWidth="1"
          />
          <line x1="45" y1="105" x2="115" y2="105" stroke={`${accent}40`} strokeWidth="1" />
          <line x1="45" y1="112" x2="95" y2="112" stroke={`${accent}35`} strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Location marker */}
      <motion.div
        className="absolute top-8 right-4"
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="28" height="36" viewBox="0 0 28 36" fill={accent} opacity="0.85">
          <path d="M14 0C6.26 0 0 6.26 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.74-6.26-14-14-14zm0 19a5 5 0 110-10 5 5 0 010 10z" />
        </svg>
      </motion.div>

      {/* Motion trails */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 rounded-full"
          style={{
            width: 30,
            right: -15,
            top: 80 + i * 25,
            background: `linear-gradient(90deg, ${accent}50, transparent)`,
          }}
          animate={{ opacity: [0, 0.6, 0], x: [0, -20, -40] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

const ILLUSTRATIONS = [
  InkoopIllustration,
  TestenIllustration,
  FotoIllustration,
  VerzendIllustration,
];

const STEPS = [
  {
    number: '01',
    title: 'Inkoop',
    subtitle: 'We zoeken de beste games',
    description:
      'We kopen Nintendo games in van particulieren en verzamelaars door heel Nederland. Alleen originele exemplaren — geen reproducties.',
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
    description:
      'Elke game wordt uitgebreid getest: save-functie, pins schoonmaken, labels controleren. Zo weet je zeker dat alles werkt.',
    accent: '#0ea5e9',
    stats: [
      { value: '5+', label: 'Checks per game' },
      { value: '0', label: 'Defecten' },
    ],
  },
  {
    number: '03',
    title: 'Catalogiseren',
    subtitle: "Uitgebreide productpagina's",
    description:
      'Elke game krijgt een gedetailleerde productpagina met conditie-beschrijving, platforminfo en eerlijke prijzen.',
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
    description:
      'Bubbeltjesfolie, stevige dozen, met tracking. Gratis verzending vanaf €100. Meestal binnen 1-2 werkdagen in huis.',
    accent: '#f59e0b',
    stats: [
      { value: '1-2', label: 'Werkdagen' },
      { value: '€0', label: 'Vanaf €100' },
    ],
  },
];

function CinematicStep({ step, index }: { step: (typeof STEPS)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 20%'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const Illustration = ILLUSTRATIONS[index];

  return (
    <motion.div ref={ref} className="relative">
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}
      >
        {/* Illustration side */}
        <motion.div
          className={`relative ${index % 2 === 1 ? 'lg:[order:2]' : ''}`}
          style={{ y: parallaxY }}
        >
          <div
            className="relative aspect-square max-w-full sm:max-w-[280px] md:max-w-[320px] lg:max-w-[400px] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              background: `radial-gradient(ellipse at center, ${step.accent}08, transparent 70%)`,
            }}
          >
            {/* Glow ring */}
            <div
              className="absolute inset-3 sm:inset-4 rounded-2xl transition-opacity duration-1000"
              style={{
                border: `1px solid ${step.accent}15`,
                opacity: isInView ? 1 : 0,
              }}
            />
            {/* Animated illustration */}
            <motion.div
              className="absolute inset-0 p-6 sm:p-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <Illustration accent={step.accent} />
            </motion.div>
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8">
              <div
                className="absolute top-0 left-0 w-full h-px"
                style={{ background: `linear-gradient(90deg, ${step.accent}40, transparent)` }}
              />
              <div
                className="absolute top-0 left-0 h-full w-px"
                style={{ background: `linear-gradient(180deg, ${step.accent}40, transparent)` }}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8">
              <div
                className="absolute bottom-0 right-0 w-full h-px"
                style={{ background: `linear-gradient(270deg, ${step.accent}40, transparent)` }}
              />
              <div
                className="absolute bottom-0 right-0 h-full w-px"
                style={{ background: `linear-gradient(0deg, ${step.accent}40, transparent)` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Text side */}
        <div className={`${index % 2 === 1 ? 'lg:[order:1] lg:text-right' : ''}`}>
          {/* Step number */}
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 1 ? 20 : -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`flex items-center gap-3 mb-6 ${index % 2 === 1 ? 'lg:flex-row-reverse lg:justify-end' : ''}`}
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg font-bold flex-shrink-0"
              style={{
                background: `${step.accent}15`,
                color: step.accent,
                border: `1px solid ${step.accent}25`,
              }}
            >
              {step.number}
            </div>
            <div
              className="h-px flex-1 max-w-[40px] sm:max-w-[60px]"
              style={{
                background: `linear-gradient(${index % 2 === 1 ? '270deg' : '90deg'}, ${step.accent}50, transparent)`,
              }}
            />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] mb-2 sm:mb-3"
          >
            {step.title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base font-medium mb-3 sm:mb-4"
            style={{ color: `${step.accent}bb` }}
          >
            {step.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/40 text-xs sm:text-sm lg:text-base leading-relaxed mb-6 sm:mb-8 max-w-md"
            style={index % 2 === 1 ? { marginLeft: 'auto' } : {}}
          >
            {step.description}
          </motion.p>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex gap-4 sm:gap-6 flex-wrap ${index % 2 === 1 ? 'lg:justify-end' : ''}`}
          >
            {step.stats.map((stat) => (
              <div key={stat.label} className="min-w-fit">
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
                  style={{ color: step.accent }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-white/30 uppercase tracking-wider font-medium mt-0.5">
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
    <section
      ref={containerRef}
      className="relative py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.04),transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-32"
        >
          <p className="text-white/25 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-5">
            Van inkoop tot levering
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-light text-white tracking-[-0.02em] md:tracking-[-0.03em] leading-[1.1] mb-4 sm:mb-6">
            Hoe het{' '}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
              werkt
            </span>
          </h2>
          <p className="text-white/30 text-xs sm:text-sm md:text-base max-w-lg mx-auto leading-relaxed px-2">
            Elke game doorloopt ons volledige kwaliteitsproces voordat hij bij jou thuis wordt
            bezorgd
          </p>

          {/* Progress bar */}
          <div className="mt-8 sm:mt-10 mx-auto max-w-sm h-px bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500"
              style={{ width: progressWidth }}
            />
          </div>
        </motion.div>

        {/* Process steps */}
        <div className="space-y-16 sm:space-y-20 md:space-y-24 lg:space-y-40">
          {STEPS.map((step, index) => (
            <CinematicStep key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 sm:mt-20 md:mt-24 lg:mt-32 text-center"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] flex-wrap justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex-shrink-0"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <span className="text-emerald-300/80 text-[11px] sm:text-sm md:text-base font-medium">
              100% origineel &middot; Persoonlijk getest &middot; Gratis vanaf €100
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
