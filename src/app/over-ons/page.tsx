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
    <svg className="pointer-events-none fixed inset-0 z-[200] h-full w-full opacity-[0.04]" aria-hidden>
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
              <h2 className="text-4xl lg:text-[64px] font-light text-white tracking-[-0.03em] leading-[1.05] mb-6">
                Waar wij
                <br />
                voor{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 font-semibold">
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
                <div className="relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.04] rounded-3xl p-10 lg:p-14">
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
  { year: 'Nu', title: 'Dé gaming specialist', description: 'Gameshop Enter is dé retro gaming specialist van Nederland. Originele games, persoonlijke service, eerlijke prijzen — van Game Boy tot Wii U.', color: 'from-emerald-400 to-cyan-500' },
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
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium uppercase tracking-[0.15em] w-fit mb-3">
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
  const revealText = 'Wij zijn anders. Elke game persoonlijk geselecteerd, gecontroleerd op originaliteit en getest op werking. Geen anonieme webshop — een specialist die je bij naam kent.';

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
          <p className="text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-300/40 leading-[1.25] tracking-tight">
            {dimText}
          </p>
          <motion.p
            className="absolute inset-0 text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.25] tracking-tight text-slate-900"
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
  { num: '04', title: 'Catalogiseren', desc: 'Gedetailleerde productpagina met eerlijke conditie-beschrijving', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z', gradient: 'from-amber-500 to-orange-500' },
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
    <div className="pt-16 lg:pt-20">
      <NoiseOverlay />

      {/* ── HERO ────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative bg-[#050810] min-h-[90vh] flex items-center justify-center overflow-hidden"
        onMouseMove={handleHeroMouse}
      >
        {/* Interactive mesh orbs + dot grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a1628] to-[#050810]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <motion.div
            className="absolute w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[140px] pointer-events-none"
            style={{ left: orbX, top: orbY, background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none"
            style={{ left: orb2X, top: orb2Y, background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none"
            style={{ right: '10%', bottom: '20%', background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.09, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full opacity-[0.05] blur-[80px] pointer-events-none"
            style={{ left: '15%', bottom: '30%', background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
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
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.05] text-emerald-400 text-xs font-medium uppercase tracking-[0.2em] mb-10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Het verhaal achter Gameshop Enter
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-[112px] font-light text-white tracking-[-0.04em] leading-[0.9] mb-8">
            {'Van hobby'.split('').map((char, i) => (
              <motion.span
                key={`a${i}`}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
                style={{ minWidth: char === ' ' ? '0.3em' : undefined }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
            <br />
            {'naar gaming'.split('').map((char, i) => (
              <motion.span
                key={`b${i}`}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.55 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
                style={{ minWidth: char === ' ' ? '0.3em' : undefined }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
            <br />
            {'specialist.'.split('').map((char, i) => (
              <motion.span
                key={`c${i}`}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.85 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
                style={{ minWidth: char === ' ' ? '0.3em' : undefined }}
              >
                {char}
              </motion.span>
            ))}
          </h1>

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

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent" />
      </div>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <section className="relative -mt-14 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10"
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
                <div className="text-sm font-medium text-slate-800 mb-0.5">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CURSOR MASK REVEAL ──────────────────────────── */}
      <CursorSpotlight />

      {/* ── HET VERHAAL ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-px w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mb-8 origin-left"
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl lg:text-[64px] font-light text-slate-900 tracking-[-0.03em] leading-[0.95] mb-16"
        >
          Hoi, ik ben{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold">Lenn</span>.
        </motion.h2>

        <div className="space-y-6">
          <ScrollParagraph
            text="In 2018, op mijn veertiende, begon ik met het verkopen van games en verzamelkaarten op Marktplaats. Nintendo DS, Game Boy, alles wat ik kon vinden. Wat begon als zakgeld verdienen, werd al snel een echte passie."
            className="text-2xl lg:text-3xl text-slate-900 font-medium leading-[1.4] tracking-tight"
          />

          <ScrollParagraph
            text="Daarna waagde ik me aan iPhones en PlayStation consoles. Dat liep niet goed. Ik werd meerdere keren opgelicht. Harde lessen — maar ze leerden me alles over vertrouwen, kwaliteitscontrole en eerlijk zakendoen."
            className="text-2xl lg:text-3xl text-slate-900 font-medium leading-[1.4] tracking-tight"
          />
        </div>

        {/* Pull quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="my-16 lg:my-24 py-14 border-y border-slate-200 relative"
        >
          {/* Decorative quote mark */}
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[120px] leading-none font-serif text-slate-100 select-none pointer-events-none">&ldquo;</span>
          <p className="relative text-3xl lg:text-[44px] font-light text-slate-900 tracking-[-0.02em] leading-[1.2] text-center max-w-3xl mx-auto">
            Die focus op{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold">kwaliteit en originaliteit</span>
            {' '}maakte het verschil.
          </p>
        </motion.div>

        <div className="space-y-6">
          <ScrollParagraph
            text="Uiteindelijk keerde ik terug naar mijn echte passie: Nintendo. Originele games inkopen, elke cartridge persoonlijk testen, en met zorg doorverkopen aan liefhebbers."
            className="text-2xl lg:text-3xl text-slate-900 font-medium leading-[1.4] tracking-tight"
          />

          <ScrollParagraph
            text="Vandaag studeer ik Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Wat ik leer, pas ik direct toe. Die combinatie maakt Gameshop Enter niet alleen een webshop — maar een specialist die je bij naam kent."
            className="text-2xl lg:text-3xl text-slate-900 font-medium leading-[1.4] tracking-tight"
          />
        </div>
      </section>

      {/* ── HORIZONTAL VALUES ────────────────────────────── */}
      <HorizontalValues />

      {/* ── ONS PROCES ───────────────────────────────────── */}
      <section className="relative py-24 lg:py-36 overflow-hidden bg-slate-50">
        {/* Subtiele achtergrond decoratie */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-emerald-200/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-56 h-56 rounded-full bg-cyan-200/15 blur-[80px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <h2 className="text-3xl lg:text-[52px] font-light text-slate-900 tracking-[-0.02em] leading-[1.1] mb-4">
              Van inkoop tot{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold">levering</span>
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Elk product doorloopt ons zorgvuldige 6-stappen proces.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div className="relative bg-white rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                        </svg>
                      </div>
                      <span className="text-3xl font-black text-slate-100 select-none">{step.num}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="h-px w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-4">
              Waarom Gameshop Enter
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Geen anonieme verkoper &mdash; een specialist die je bij naam kent.
            </p>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {/* Hero card — 100% Origineel */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="col-span-2 lg:col-span-2 row-span-2"
            >
              <div className="group relative h-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-8 lg:p-10 hover:from-emerald-500/15 hover:to-cyan-500/15 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-emerald-400/10 to-transparent blur-[80px] pointer-events-none" />
                <div className="relative">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white mb-6 shadow-lg">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-semibold text-white mb-3 tracking-tight">100% Origineel</h3>
                  <p className="text-base lg:text-lg text-slate-300 leading-relaxed max-w-md">
                    Elke game wordt gecontroleerd op authenticiteit. Geen reproducties, geen namaak. Gegarandeerd origineel &mdash; dat is onze belofte.
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400 uppercase tracking-[0.15em]">Gegarandeerd</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Smaller cards */}
            {[
              { title: 'Persoonlijk getest', desc: 'Elk product handmatig getest. Werkt het niet? Dan verkopen we het niet.', gradient: 'from-cyan-400 to-blue-400', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63' },
              { title: 'Eerlijke beschrijving', desc: 'Conditie altijd nauwkeurig vermeld bij elk product.', gradient: 'from-amber-400 to-orange-400', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z' },
              { title: 'Veilig betalen', desc: 'iDEAL, geen extra kosten.', gradient: 'from-violet-400 to-purple-400', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
              { title: 'Snelle verzending', desc: 'PostNL, volgende werkdag. Gratis boven €100.', gradient: 'from-rose-400 to-pink-400', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h.008M21 12.75h-2.25A2.25 2.25 0 0016.5 15v.75' },
              { title: '14 dagen retour', desc: 'Niet tevreden? Volledige terugbetaling.', gradient: 'from-teal-400 to-emerald-400', icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="group relative h-full bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-500 hover:scale-[1.02]">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS MARQUEE ─────────────────────────────── */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 px-4">
            <h2 className="text-3xl lg:text-[52px] font-light text-slate-900 tracking-[-0.02em] leading-[1.1] mb-3">
              1.360+ tevreden{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 font-semibold">klanten</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-slate-500">5.0 op Marktplaats</span>
            </div>
          </motion.div>

          {/* Fade edges */}
          <div className="absolute top-0 bottom-0 left-0 w-20 lg:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-20 lg:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Marquee row 1 */}
          <div className="flex gap-5 mb-5 animate-marquee" style={{ width: 'max-content' }}>
            {[
              { name: 'Mark V.', text: 'Snelle levering, perfect verpakt. Precies wat ik verwachtte op basis van de foto\'s. Topservice!', product: 'Pokémon HeartGold' },
              { name: 'Sanne K.', text: 'Eindelijk een betrouwbare verkoper voor retro games. Alles origineel, netjes getest en supersnel geleverd.', product: 'Mario Kart DS' },
              { name: 'Thomas B.', text: 'De mooiste Nintendo collectie online. Lenn reageert snel op vragen en de verpakking was echt top!', product: 'Pokémon Emerald' },
              { name: 'Emma L.', text: 'Binnen 24 uur geleverd, game werkt perfect. Echt een aanrader voor iedereen die originele games zoekt.', product: 'Pokémon Platinum' },
              { name: 'Daan W.', text: 'Mijn zoon was dolblij. Alles keurig verpakt en precies zoals beschreven. Dankjewel Lenn!', product: 'Pokémon White' },
              { name: 'Lisa M.', text: 'Al meerdere keren besteld, altijd perfect. De foto\'s kloppen precies met wat je ontvangt.', product: 'Pokémon SoulSilver' },
              { name: 'Mark V.', text: 'Snelle levering, perfect verpakt. Precies wat ik verwachtte op basis van de foto\'s. Topservice!', product: 'Pokémon HeartGold' },
              { name: 'Sanne K.', text: 'Eindelijk een betrouwbare verkoper voor retro games. Alles origineel, netjes getest en supersnel geleverd.', product: 'Mario Kart DS' },
              { name: 'Thomas B.', text: 'De mooiste Nintendo collectie online. Lenn reageert snel op vragen en de verpakking was echt top!', product: 'Pokémon Emerald' },
              { name: 'Emma L.', text: 'Binnen 24 uur geleverd, game werkt perfect. Echt een aanrader voor iedereen die originele games zoekt.', product: 'Pokémon Platinum' },
              { name: 'Daan W.', text: 'Mijn zoon was dolblij. Alles keurig verpakt en precies zoals beschreven. Dankjewel Lenn!', product: 'Pokémon White' },
              { name: 'Lisa M.', text: 'Al meerdere keren besteld, altijd perfect. De foto\'s kloppen precies met wat je ontvangt.', product: 'Pokémon SoulSilver' },
            ].map((review, i) => (
              <div key={i} className="flex-shrink-0 w-[340px] bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{review.name}</div>
                    <div className="text-[11px] text-slate-400">{review.product}</div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[9px] font-medium uppercase tracking-wider">Geverifieerd</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Marquee row 2 (reverse) */}
          <div className="flex gap-5 animate-marquee-reverse" style={{ width: 'max-content' }}>
            {[
              { name: 'Jasper H.', text: 'Fantastische service! Game was compleet in doos met handleiding. Precies zoals de foto\'s lieten zien.', product: 'Pokémon Black 2' },
              { name: 'Nina R.', text: 'Ik zoek altijd naar originele games en bij Gameshop Enter weet ik zeker dat het klopt. Aanrader!', product: 'Mario & Luigi' },
              { name: 'Bram J.', text: 'Razendsnelle levering en heel netjes verpakt. Mijn DS game werkt als een zonnetje. Top!', product: 'Zelda Spirit Tracks' },
              { name: 'Sophie V.', text: 'Lenn denkt echt mee. Had een vraag over een game en kreeg binnen een uur uitgebreid antwoord.', product: 'Animal Crossing' },
              { name: 'Rick P.', text: 'Na jarenlang zoeken eindelijk een betrouwbare plek voor retro Nintendo. Wordt vaste klant!', product: 'Pokémon Diamond' },
              { name: 'Fleur D.', text: 'Cadeautje voor mijn broer, perfect aangekomen. De verpakking was echt met zorg gedaan.', product: 'New Super Mario Bros' },
              { name: 'Jasper H.', text: 'Fantastische service! Game was compleet in doos met handleiding. Precies zoals de foto\'s lieten zien.', product: 'Pokémon Black 2' },
              { name: 'Nina R.', text: 'Ik zoek altijd naar originele games en bij Gameshop Enter weet ik zeker dat het klopt. Aanrader!', product: 'Mario & Luigi' },
              { name: 'Bram J.', text: 'Razendsnelle levering en heel netjes verpakt. Mijn DS game werkt als een zonnetje. Top!', product: 'Zelda Spirit Tracks' },
              { name: 'Sophie V.', text: 'Lenn denkt echt mee. Had een vraag over een game en kreeg binnen een uur uitgebreid antwoord.', product: 'Animal Crossing' },
              { name: 'Rick P.', text: 'Na jarenlang zoeken eindelijk een betrouwbare plek voor retro Nintendo. Wordt vaste klant!', product: 'Pokémon Diamond' },
              { name: 'Fleur D.', text: 'Cadeautje voor mijn broer, perfect aangekomen. De verpakking was echt met zorg gedaan.', product: 'New Super Mario Bros' },
            ].map((review, i) => (
              <div key={i} className="flex-shrink-0 w-[340px] bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{review.name}</div>
                    <div className="text-[11px] text-slate-400">{review.product}</div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[9px] font-medium uppercase tracking-wider">Geverifieerd</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Marktplaats link */}
          <div className="text-center mt-10">
            <a
              href="https://www.marktplaats.nl/u/lenn-hodes/10036834/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Bekijk alle reviews op Marktplaats
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── BEDRIJFSINFO ─────────────────────────────────── */}
      <section className="relative bg-[#050810] py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 mb-8" />
            <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-4">Bedrijfsgegevens</h2>
            <p className="text-slate-400 max-w-md mb-12">De feiten op een rij &mdash; transparant en eerlijk, zoals alles wat we doen.</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Bedrijfsnaam', value: 'Gameshop Enter', icon: 'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0020.25 9.35m-16.5 0c0-1.08.286-2.09.79-2.967L6.25 3h11.5l1.71 3.382A5.99 5.99 0 0120.25 9.35' },
                { label: 'Eigenaar', value: 'Lenn Hodes', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
                { label: 'KvK-nummer', value: '93642474', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
                { label: 'Actief sinds', value: '2018', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
                { label: 'Specialisatie', value: 'Originele Nintendo games', icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z' },
                { label: 'Platforms', value: 'DS, GBA, 3DS, Game Boy', icon: 'M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="group"
                >
                  <div className="relative bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-500 h-full">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-emerald-400 mb-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{item.label}</dt>
                    <dd className="text-white font-semibold text-lg">{item.value}</dd>
                  </div>
                </motion.div>
              ))}

              {/* E-mail card met accent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.36, duration: 0.5 }}
                className="group"
              >
                <div className="relative bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-500 h-full">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">E-mail</dt>
                  <dd><a href="mailto:gameshopenter@gmail.com" className="text-emerald-400 hover:text-emerald-300 font-semibold text-lg transition-colors">gameshopenter@gmail.com</a></dd>
                </div>
              </motion.div>

              {/* Verkoop card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.42, duration: 0.5 }}
                className="group"
              >
                <div className="relative bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-500 h-full">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Betaalmethode</dt>
                  <dd className="text-white font-semibold text-lg">iDEAL</dd>
                </div>
              </motion.div>

              {/* Verzending card — accentkaart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.48, duration: 0.5 }}
                className="group"
              >
                <div className="relative bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-6 hover:from-emerald-500/15 hover:to-cyan-500/15 transition-all duration-500 h-full">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white mb-4 shadow-lg">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h.008M21 12.75h-2.25A2.25 2.25 0 0016.5 15v.75" />
                    </svg>
                  </div>
                  <dt className="text-xs font-medium text-emerald-400/70 uppercase tracking-wider mb-1">Verzending</dt>
                  <dd className="text-white font-semibold text-lg">PostNL &mdash; volgende werkdag</dd>
                  <p className="text-sm text-slate-400 mt-1">Gratis boven &euro;100</p>
                </div>
              </motion.div>
            </div>

            {/* Condities */}
            <div className="mt-12 pt-10 border-t border-white/[0.06]">
              <h3 className="text-xl font-semibold text-white mb-6">Onze condities</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/[0.03] p-6 hover:bg-white/[0.05] transition-all duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </span>
                    <h4 className="font-semibold text-white">Zo goed als nieuw</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Bijna nieuw &mdash; minimale tot geen gebruikssporen. Het product ziet er vrijwel ongebruikt uit en functioneert perfect.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-6 hover:bg-white/[0.05] transition-all duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <h4 className="font-semibold text-white">Gebruikt</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Tweedehands &mdash; normale gebruikssporen aanwezig. Het product is volledig getest op werking en functioneert naar behoren.
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

        {/* Decorative dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Floating decoratieve orbs */}
        <motion.div
          className="absolute top-[15%] left-[8%] w-3 h-3 rounded-full bg-emerald-400/30"
          animate={{ y: [-20, 20, -20], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[35%] right-[12%] w-2 h-2 rounded-full bg-cyan-400/25"
          animate={{ y: [15, -15, 15], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-[25%] left-[20%] w-2.5 h-2.5 rounded-full bg-teal-400/20"
          animate={{ y: [-10, 25, -10], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl lg:text-[72px] font-light text-white tracking-[-0.03em] mb-6 leading-[1.05]">
              Vind jouw volgende{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                game
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-14 max-w-lg mx-auto leading-relaxed">
              Elke game in onze collectie is persoonlijk getest, gefotografeerd en klaar om bij jou thuis te komen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic className="inline-block">
                <Link href="/shop">
                  <Button size="lg">
                    Bekijk de collectie
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </Link>
              </Magnetic>
              <Magnetic className="inline-block">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/15 text-white/70 text-sm font-medium hover:border-white/30 hover:text-white transition-all duration-300"
                >
                  Neem contact op
                </Link>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
