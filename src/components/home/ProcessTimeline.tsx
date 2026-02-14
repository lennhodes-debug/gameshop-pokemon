'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Inkoop',
    subtitle: 'We zoeken de beste games',
    description:
      'We kopen Nintendo games in van particulieren en verzamelaars door heel Nederland. Alleen originele exemplaren — geen reproducties.',
    accent: '#10b981',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Testen',
    subtitle: 'Elk spel persoonlijk gecontroleerd',
    description:
      'Elke game wordt uitgebreid getest: save-functie, pins schoonmaken, labels controleren. Zo weet je zeker dat alles werkt.',
    accent: '#0ea5e9',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Fotograferen',
    subtitle: 'Eigen productfoto\'s',
    description:
      'Elke game wordt individueel gefotografeerd. Wat je ziet is wat je krijgt — geen stockfoto\'s, altijd het echte product.',
    accent: '#a855f7',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Verzenden',
    subtitle: 'Veilig verpakt, snel geleverd',
    description:
      'Bubbeltjesfolie, stevige dozen, met tracking. Gratis verzending vanaf €100. Meestal binnen 1-2 werkdagen in huis.',
    accent: '#f59e0b',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <motion.div ref={ref} style={{ opacity, y, scale }} className="relative">
      <div className="flex gap-6 lg:gap-10 items-start">
        {/* Verticale lijn + cirkel */}
        <div className="hidden sm:flex flex-col items-center flex-shrink-0">
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${step.accent}20, ${step.accent}08)`,
              border: `1px solid ${step.accent}30`,
              color: step.accent,
            }}
            whileInView={{ scale: [0.8, 1.1, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {step.icon}
            <div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: step.accent }}
            >
              {step.number}
            </div>
          </motion.div>
          {index < STEPS.length - 1 && (
            <motion.div
              className="w-px h-20 lg:h-28 mt-3"
              style={{
                background: `linear-gradient(to bottom, ${step.accent}40, transparent)`,
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-12 lg:pb-16">
          {/* Mobiel nummer */}
          <div
            className="sm:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{
              background: `${step.accent}15`,
              color: step.accent,
            }}
          >
            Stap {step.number}
          </div>

          <h3 className="text-2xl lg:text-3xl font-semibold text-white mb-1.5 tracking-tight">
            {step.title}
          </h3>
          <p
            className="text-sm font-medium mb-3"
            style={{ color: `${step.accent}cc` }}
          >
            {step.subtitle}
          </p>
          <p className="text-white/40 text-sm lg:text-base leading-relaxed max-w-lg">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'end 0.6'],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={containerRef} className="relative py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.04),transparent_60%)]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 lg:mb-24"
        >
          <p className="text-white/30 text-xs font-medium uppercase tracking-[0.25em] mb-4">
            Van inkoop tot levering
          </p>
          <h2 className="text-3xl lg:text-[52px] font-light text-white tracking-[-0.03em] leading-[1.05] mb-5">
            Hoe het{' '}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
              werkt
            </span>
          </h2>
          <p className="text-white/35 text-sm lg:text-base max-w-md mx-auto leading-relaxed">
            Elke game doorloopt ons volledige kwaliteitsproces voordat
            hij bij jou thuis wordt bezorgd
          </p>

          {/* Scrollprogress bar */}
          <div className="mt-8 mx-auto max-w-xs h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500"
              style={{ width: progressWidth }}
            />
          </div>
        </motion.div>

        {/* Stappen */}
        <div className="space-y-2">
          {STEPS.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Afsluiter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06]">
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-emerald-300/90 text-sm font-medium">
              100% origineel &middot; Persoonlijk getest &middot; Eigen foto&apos;s
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
