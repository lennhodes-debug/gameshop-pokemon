'use client';

import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// ─── ANIMATED COUNTER ───────────────────────────────────────

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString('nl-NL')}{suffix}</span>;
}

// ─── SCROLL WORD (Apple-style progressive text reveal) ──────

function ScrollWord({ word, progress, start, end }: {
  word: string;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.08, 1]);
  const blur = useTransform(progress, [start, end], [4, 0]);
  const filterStr = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span className="inline-block mr-[0.3em]" style={{ opacity, filter: filterStr }}>
      {word}
    </motion.span>
  );
}

function ScrollParagraph({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'end 0.3'],
  });
  const words = text.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <ScrollWord
          key={i}
          word={word}
          progress={scrollYProgress}
          start={i / words.length}
          end={Math.min((i + 2) / words.length, 1)}
        />
      ))}
    </p>
  );
}

// ─── MAGNETIC HOVER ─────────────────────────────────────────

function Magnetic({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── NOISE TEXTURE ──────────────────────────────────────────

function NoiseOverlay() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-[200] h-full w-full opacity-[0.025]" aria-hidden>
      <filter id="noise-over-ons">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-over-ons)" />
    </svg>
  );
}

// ─── HORIZONTAL SCROLL SECTION ──────────────────────────────
// Sticky container met horizontale scroll op basis van verticaal scrollen

function HorizontalValues() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-65%']);

  const values = [
    { word: 'Origineel', sub: 'Elke game gecontroleerd op authenticiteit' },
    { word: 'Getest', sub: 'Persoonlijk getest op werking en save-functie' },
    { word: 'Eerlijk', sub: 'Transparante prijzen, geen verborgen kosten' },
    { word: 'Persoonlijk', sub: 'Geen anonieme webshop — wij kennen onze klanten' },
    { word: 'Vakkundig', sub: 'Studie Ondernemerschap aan het Saxion' },
  ];

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-[#050810]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />

        <motion.div
          style={{ x }}
          className="flex gap-16 lg:gap-24 px-[10vw] will-change-transform"
        >
          {/* Intro card */}
          <div className="flex-shrink-0 w-[90vw] sm:w-[60vw] lg:w-[40vw] flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="h-px w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 mb-8" />
              <h2 className="text-4xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
                Waar wij
                <br />
                voor{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                  staan
                </span>.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                Vijf principes die elk product, elke interactie en elke beslissing bij Gameshop Enter vormgeven.
              </p>
            </motion.div>
          </div>

          {/* Value cards */}
          {values.map((val, i) => (
            <motion.div
              key={i}
              className="flex-shrink-0 w-[85vw] sm:w-[50vw] lg:w-[35vw] flex items-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="relative group">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 lg:p-14">
                  <span className="text-[120px] lg:text-[160px] font-black bg-clip-text text-transparent bg-gradient-to-b from-white/[0.06] to-transparent leading-none block mb-4 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-4">
                    {val.word}
                  </h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {val.sub}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── STACKING CARDS TIMELINE ────────────────────────────────

const timeline = [
  { year: '2018', title: 'De eerste stappen', description: 'Op mijn 14e begon ik met het verkopen van games en verzamelkaarten op Marktplaats. Nintendo DS, Game Boy, alles. Wat begon als zakgeld verdienen, werd een echte passie.', color: 'from-violet-500 to-purple-600' },
  { year: '2019', title: 'Vallen en opstaan', description: 'Ik waagde me aan iPhones en PlayStation consoles. Werd meerdere keren opgelicht. Harde lessen — maar ze leerden me alles over vertrouwen en kwaliteitscontrole.', color: 'from-slate-500 to-slate-700' },
  { year: '2020', title: 'Terug naar de passie', description: 'Na de tegenslagen terug naar mijn roots: Nintendo. Originele games inkopen, testen en met zorg doorverkopen. Focus op kwaliteit boven kwantiteit.', color: 'from-amber-500 to-orange-600' },
  { year: '2022', title: 'Gameshop Enter', description: 'Tijd voor een echte naam. Gameshop Enter werd opgericht als dé plek voor originele, geteste Nintendo games met eerlijke prijzen.', color: 'from-emerald-500 to-teal-600' },
  { year: '2023', title: 'Studie & praktijk', description: 'Start studie Ondernemerschap en Retailmanagement aan het Saxion. Elke les direct toepasbaar op de webshop.', color: 'from-cyan-500 to-blue-600' },
  { year: '2024', title: '3000+ tevreden klanten', description: 'Meer dan 3000 blije klanten en 1360+ reviews met een perfecte 5.0 score op Marktplaats. De groei gaat door.', color: 'from-amber-400 to-yellow-500' },
  { year: 'Nu', title: 'Dé gaming specialist', description: 'Gameshop Enter is dé retro gaming specialist van Nederland. Originele games, eigen fotografie, persoonlijke service — van Game Boy tot Switch.', color: 'from-emerald-400 to-cyan-500' },
];

function StackingCard({ item, index, count, progress }: {
  item: typeof timeline[0];
  index: number; count: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const targetScale = 1 - ((count - index) * 0.02);
  const scale = useTransform(progress, [index / count, 1], [1, targetScale]);

  return (
    <div className="h-[32vh] lg:h-[36vh] sticky" style={{ top: `${100 + index * 25}px` }}>
      <motion.div
        style={{ scale, transformOrigin: 'top center' }}
        className={`relative h-full bg-gradient-to-br ${item.color} rounded-3xl p-8 lg:p-12 text-white shadow-2xl overflow-hidden`}
      >
        <div className="absolute top-0 right-4 lg:right-8 text-[80px] lg:text-[140px] font-black text-white/[0.06] leading-none select-none pointer-events-none">
          {item.year}
        </div>
        <div className="relative z-10 flex flex-col justify-end h-full">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold uppercase tracking-[0.15em] w-fit mb-3">
            {item.year}
          </span>
          <h3 className="text-2xl lg:text-3xl font-semibold mb-2 leading-tight">{item.title}</h3>
          <p className="text-white/80 text-sm lg:text-base leading-relaxed max-w-lg">{item.description}</p>
        </div>
      </motion.div>
    </div>
  );
}

function StackingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section className="relative bg-[#050810] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="h-px w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-3">
            Mijn reis
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Elk hoofdstuk heeft me gevormd tot wie ik nu ben.
          </p>
        </motion.div>
      </div>

      <div ref={containerRef} className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-[15vh]">
        {timeline.map((item, i) => (
          <StackingCard key={i} item={item} index={i} count={timeline.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

// ─── 3D PERSPECTIVE QUOTE ───────────────────────────────────

function PerspectiveQuote() {
  const quoteRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: quoteRef,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [30, 0, 0, -30]);
  const perspScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.85]);
  const quoteOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const quoteY = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);
  const lineScaleX = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

  return (
    <section ref={quoteRef} className="relative py-32 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/20 to-white" />

      <div className="absolute top-[12%] left-[6%] text-[200px] lg:text-[280px] font-serif text-emerald-500/[0.03] select-none leading-none pointer-events-none">&ldquo;</div>
      <div className="absolute bottom-[12%] right-[6%] text-[200px] lg:text-[280px] font-serif text-emerald-500/[0.03] select-none leading-none pointer-events-none">&rdquo;</div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ perspective: '1200px' }}>
        <motion.div
          style={{ rotateX, scale: perspScale, opacity: quoteOpacity, y: quoteY }}
          className="text-center"
        >
          <blockquote className="text-3xl lg:text-5xl font-semibold text-slate-900 leading-tight tracking-tight mb-8 max-w-3xl mx-auto">
            &ldquo;Gaming is meer dan een hobby. Het is{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">tijdloze klassiekers</span>
            {' '}bewaren voor de volgende generatie.&rdquo;
          </blockquote>

          <motion.div
            className="mx-auto w-20 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-6 origin-center"
            style={{ scaleX: lineScaleX }}
          />

          <p className="text-sm text-slate-400 font-medium tracking-wide">
            &mdash; Lenn Hodes, oprichter
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── CURSOR SPOTLIGHT REVEAL ────────────────────────────────
// Desktop: tekst wordt onthuld door cursor-gestuurde spotlight
// Mobile: scroll-based progressive reveal

function CursorSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const size = useSpring(50, { stiffness: 180, damping: 22 });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    size.set(isHovered ? 400 : 50);
  }, [isHovered, size]);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  }, [mx, my]);

  const clipPath = useMotionTemplate`circle(${size}px at ${mx}px ${my}px)`;

  const dimText = 'Een webshop met games. Niets bijzonders, toch? Gewoon een plek waar je Nintendo games koopt. Net als honderd andere winkels online.';
  const revealText = 'Wij zijn anders. Elke game persoonlijk geselecteerd, gecontroleerd op originaliteit, getest en met eigen fotografie vastgelegd. Geen anonieme webshop — een specialist die je bij naam kent.';

  if (isMobile) {
    return (
      <section className="py-24 lg:py-36">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollParagraph
            text={revealText}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 leading-[1.25] tracking-tight"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 lg:py-36">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-px w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mb-12 origin-left"
        />
        <div
          ref={containerRef}
          className="relative cursor-none select-none"
          onMouseMove={handleMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-200 leading-[1.25] tracking-tight">
            {dimText}
          </p>
          <motion.p
            className="absolute inset-0 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.25] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"
            style={{ clipPath }}
          >
            {revealText}
          </motion.p>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            animate={{ opacity: isHovered ? 0 : [0.4, 0.8, 0.4] }}
            transition={isHovered ? { duration: 0.2 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-500 text-sm font-medium shadow-lg">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
              Ontdek
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center gap-4"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent" />
          <span className="text-sm font-medium text-emerald-600 tracking-wide">Dat is onze belofte</span>
          <div className="h-px flex-1 bg-gradient-to-l from-emerald-200 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── PROCESS STEPS ──────────────────────────────────────────

const processSteps = [
  { num: '01', title: 'Selectie', desc: 'Zorgvuldig zoeken naar originele games bij betrouwbare bronnen', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', gradient: 'from-violet-500 to-purple-500' },
  { num: '02', title: 'Authenticatie', desc: 'Elke game gecontroleerd op originaliteit — geen reproducties', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', gradient: 'from-emerald-500 to-teal-500' },
  { num: '03', title: 'Testen', desc: 'Persoonlijk getest op werking — save, batterij, connectie', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085', gradient: 'from-cyan-500 to-blue-500' },
  { num: '04', title: 'Fotografie', desc: 'Eigen productfoto\'s — wat je ziet is wat je krijgt', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z', gradient: 'from-amber-500 to-orange-500' },
  { num: '05', title: 'Verpakken', desc: 'Bubbeltjesenvelop of versterkte doos — beschermd en veilig', icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25', gradient: 'from-rose-500 to-pink-500' },
  { num: '06', title: 'Verzending', desc: 'PostNL volgende werkdag met track & trace', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h.008M21 12.75h-2.25A2.25 2.25 0 0016.5 15v.75', gradient: 'from-teal-500 to-emerald-500' },
];

// ─── PAGE ───────────────────────────────────────────────────

export default function OverOnsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 180]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  // Cursor tracking for hero mesh
  const cursorX = useMotionValue(0.5);
  const cursorY = useMotionValue(0.5);
  const springCfg = { stiffness: 30, damping: 25 };
  const cx = useSpring(cursorX, springCfg);
  const cy = useSpring(cursorY, springCfg);
  const orbX = useTransform(cx, [0, 1], ['-10%', '10%']);
  const orbY = useTransform(cy, [0, 1], ['-10%', '10%']);
  const orb2X = useTransform(cx, [0, 1], ['85%', '65%']);
  const orb2Y = useTransform(cy, [0, 1], ['70%', '50%']);

  const handleHeroMouse = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    cursorX.set((e.clientX - rect.left) / rect.width);
    cursorY.set((e.clientY - rect.top) / rect.height);
  }, [cursorX, cursorY]);

  return (
    <div className="pt-20 lg:pt-24">
      <NoiseOverlay />

      {/* ── HERO ────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative bg-[#050810] min-h-[90vh] flex items-center justify-center overflow-hidden"
        onMouseMove={handleHeroMouse}
      >
        {/* Interactive mesh orbs */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />
          <motion.div
            className="absolute w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[140px] pointer-events-none"
            style={{ left: orbX, top: orbY, background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none"
            style={{ left: orb2X, top: orb2Y, background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-[0.2em] mb-10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Het verhaal achter Gameshop Enter
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-8xl font-semibold text-white tracking-tight leading-[1.05] mb-8"
          >
            Van hobby
            <br />
            naar gaming
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              specialist.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg lg:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Het eerlijke verhaal van Lenn Hodes &mdash; van harde lessen op Marktplaats tot een webshop met 3000+ tevreden klanten.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex flex-col items-center gap-2 text-slate-500 text-xs tracking-widest uppercase"
            >
              <span>Scroll</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <section className="relative -mt-14 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 backdrop-blur-2xl rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 lg:p-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: 3000, suffix: '+', label: 'Tevreden klanten', sub: 'en groeiend' },
              { value: 1360, suffix: '+', label: 'Reviews', sub: '100% positief' },
              { value: 5, suffix: '.0', label: 'Marktplaats score', sub: 'perfecte rating' },
              { value: 8, suffix: '+', label: 'Jaar ervaring', sub: 'sinds 2018' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tabular-nums mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-semibold text-slate-800 mb-0.5">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CURSOR MASK REVEAL ──────────────────────────── */}
      <CursorSpotlight />

      {/* ── HET VERHAAL ──────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mb-8" />
          <h2 className="text-4xl lg:text-6xl font-semibold text-slate-900 tracking-tight mb-12 leading-[1.1]">
            Hoi, ik ben{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Lenn</span>.
          </h2>

          <div className="space-y-8 text-lg lg:text-xl text-slate-600 leading-relaxed">
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              In 2018, op mijn veertiende, begon ik met het verkopen van games en verzamelkaarten op Marktplaats. Nintendo DS, Game Boy, alles wat ik kon vinden. Wat begon als zakgeld verdienen, werd al snel een echte passie.
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Daarna waagde ik me aan iPhones en PlayStation consoles. Dat liep niet goed. Ik werd meerdere keren opgelicht. <strong className="text-slate-900 font-semibold">Harde lessen</strong> &mdash; maar ze leerden me alles over vertrouwen, kwaliteitscontrole en eerlijk zakendoen.
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Uiteindelijk keerde ik terug naar mijn echte passie: <strong className="text-slate-900 font-semibold">Nintendo</strong>. Originele games inkopen, elke cartridge persoonlijk testen, en met zorg doorverkopen aan liefhebbers. Die focus op kwaliteit en originaliteit maakte het verschil.
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              Vandaag studeer ik Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Wat ik leer, pas ik direct toe. Die combinatie maakt Gameshop Enter niet alleen een webshop &mdash; maar een <strong className="text-slate-900 font-semibold">specialist die je bij naam kent</strong>.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* ── HORIZONTAL VALUES ────────────────────────────── */}
      <HorizontalValues />

      {/* ── ONS PROCES ───────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="h-px w-12 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
              Van inkoop tot levering
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Elk product doorloopt ons zorgvuldige 6-stappen proces.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-[56px] left-[8%] right-[8%] h-px bg-slate-200" />
            <motion.div
              className="hidden lg:block absolute top-[56px] left-[8%] right-[8%] h-px bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <div className={`h-28 w-28 mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} p-[2px] shadow-lg`}>
                    <div className="h-full w-full rounded-2xl bg-white flex flex-col items-center justify-center gap-2">
                      <svg className="h-7 w-7 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">{step.num}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mt-5 mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[150px] mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STACKING CARDS TIMELINE ─────────────────────── */}
      <StackingTimeline />

      {/* ── 3D PERSPECTIVE QUOTE ────────────────────────── */}
      <PerspectiveQuote />

      {/* ── WAAROM WIJ ───────────────────────────────────── */}
      <section className="relative bg-[#050810] py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.06),transparent_50%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="h-px w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-4">
              Waarom Gameshop Enter
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Geen anonieme verkoper &mdash; een specialist die je bij naam kent.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: '100% Origineel', desc: 'Elke game gecontroleerd op originaliteit. Geen reproducties, gegarandeerd echt.', gradient: 'from-emerald-400 to-teal-400', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
              { title: 'Persoonlijk getest', desc: 'Elk product handmatig getest op werking. Werkt het niet? Dan verkopen we het niet.', gradient: 'from-cyan-400 to-blue-400', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63' },
              { title: 'Eigen fotografie', desc: 'Wat je op de website ziet is exact wat je ontvangt. Geen stock foto\'s, geen verrassingen.', gradient: 'from-amber-400 to-orange-400', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z' },
              { title: 'Veilig betalen', desc: 'Betaal direct en veilig via iDEAL. Geen extra kosten, geen gedoe.', gradient: 'from-violet-400 to-purple-400', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
              { title: 'Snelle verzending', desc: 'Volgende werkdag bezorgd via PostNL met track & trace. Gratis boven €100.', gradient: 'from-rose-400 to-pink-400', icon: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
              { title: '14 dagen retour', desc: 'Niet tevreden? Stuur het terug voor volledige terugbetaling. Zonder gedoe.', gradient: 'from-teal-400 to-emerald-400', icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="group relative h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={`relative h-10 w-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="relative font-semibold text-white text-lg mb-2">{item.title}</h3>
                  <p className="relative text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────── */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="h-px w-12 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-3">
              Wat klanten zeggen
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              1360+ reviews met een perfecte 5.0 score
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Mark V.', text: 'Snelle levering, perfect verpakt en de game werkt uitstekend. Precies wat ik verwachtte op basis van de foto\'s. Topservice!', product: 'Pokémon HeartGold' },
              { name: 'Sanne K.', text: 'Eindelijk een betrouwbare verkoper voor retro games. Alles origineel, netjes getest en supersnel geleverd. Zeker weer bestellen!', product: 'Mario Kart DS' },
              { name: 'Thomas B.', text: 'De mooiste Nintendo collectie die ik online heb gevonden. Lenn reageert snel op vragen en de verpakking was echt top. Aanrader!', product: 'Pokémon Emerald' },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative h-full bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">{review.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Kocht: {review.product}</div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Geverifieerd</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEDRIJFSINFO ─────────────────────────────────── */}
      <section className="bg-slate-50 py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-slate-300 to-slate-400 mb-8" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-8">Bedrijfsgegevens</h2>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
              {[
                ['Bedrijfsnaam', 'Gameshop Enter'],
                ['Eigenaar', 'Lenn Hodes'],
                ['KvK-nummer', '93642474'],
                ['Actief sinds', '2018'],
                ['Specialisatie', 'Originele Nintendo games'],
                ['Platforms', 'DS, GBA, 3DS, Game Boy'],
                ['Betaalmethode', 'iDEAL'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</dt>
                  <dd className="text-slate-900 font-medium">{value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">E-mail</dt>
                <dd><a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">gameshopenter@gmail.com</a></dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Verkoop</dt>
                <dd className="text-slate-900 font-medium">Uitsluitend online</dd>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Onze condities</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </span>
                    <h4 className="font-semibold text-slate-900">Zo goed als nieuw</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Bijna nieuw &mdash; minimale tot geen gebruikssporen. Het product ziet er vrijwel ongebruikt uit en functioneert perfect.
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <h4 className="font-semibold text-slate-900">Gebruikt</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    2de hands &mdash; normale gebruikssporen aanwezig. Het product is volledig getest op werking en functioneert naar behoren.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative bg-[#050810] py-32 lg:py-44 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_55%)]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl lg:text-6xl font-semibold text-white tracking-tight mb-6 leading-tight">
              Klaar om te{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                shoppen
              </span>
              ?
            </h2>
            <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto">
              Ontdek ons complete assortiment originele Nintendo games &mdash; van Game Boy tot Switch, elke game persoonlijk getest en gefotografeerd.
            </p>
            <Magnetic className="inline-block">
              <Link href="/shop">
                <Button size="lg">
                  Bekijk alle producten
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
