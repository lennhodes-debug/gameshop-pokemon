'use client';

import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate, useVelocity, useAnimationFrame } from 'framer-motion';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { getAllProducts, type Product } from '@/lib/products';

// ─── HELPERS ───────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2200;
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

// Word-by-word reveal — Apple-style staggered text
function WordReveal({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const words = text.split(' ');

  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: delay + i * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Paragraph fade — each paragraph fades in with blur
function ParagraphReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.p>
  );
}

// Velocity-driven marquee row
function VelocityRow({
  items, baseVelocity, size, blur, opacity, depth, velocityFactor,
}: {
  items: Product[]; baseVelocity: number; size: string; blur: string;
  opacity: number; depth: number; velocityFactor: ReturnType<typeof useMotionValue<number>>;
}) {
  const baseX = useMotionValue(0);
  const [repeated, setRepeated] = useState<Product[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const arr: Product[] = [];
    for (let c = 0; c < 6; c++) arr.push(...items);
    setRepeated(arr);
  }, [items]);

  useAnimationFrame((_, delta) => {
    const factor = velocityFactor.get();
    const moveBy = baseVelocity * (1 + Math.abs(factor) * 0.8) * (delta / 1000);
    let newX = baseX.get() + moveBy;
    if (rowRef.current) {
      const halfWidth = rowRef.current.scrollWidth / 2;
      if (Math.abs(newX) >= halfWidth) newX = 0;
    }
    baseX.set(newX);
  });

  const sizeClass = size === 'sm' ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-lg' :
                    size === 'md' ? 'w-24 h-24 sm:w-32 sm:h-32 rounded-xl' :
                    'w-32 h-32 sm:w-44 sm:h-44 rounded-2xl';
  const gapClass = size === 'sm' ? 'gap-3' : size === 'md' ? 'gap-4' : 'gap-5';

  return (
    <motion.div className="relative mb-3" style={{ opacity, transform: `translateZ(${depth}px)`, filter: blur }}>
      <motion.div ref={rowRef} className={`flex ${gapClass}`} style={{ x: baseX }}>
        {repeated.map((product, i) => (
          <div key={`${product.sku}-${i}`} className={`flex-shrink-0 ${sizeClass} overflow-hidden group/card relative transition-shadow duration-300 ${size === 'lg' ? 'hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`}>
            <Image src={product.image!} alt={product.name} width={size === 'sm' ? 80 : size === 'md' ? 128 : 176} height={size === 'sm' ? 80 : size === 'md' ? 128 : 176} className="object-cover w-full h-full transition-transform duration-300 group-hover/card:scale-110" loading="lazy" />
            {(size === 'md' || size === 'lg') && (
              <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/50 transition-all duration-300 flex items-end p-2 opacity-0 group-hover/card:opacity-100">
                <span className="text-white text-[10px] font-semibold leading-tight line-clamp-2">{product.name}</span>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── DATA ──────────────────────────────────────────────────

const timeline = [
  { year: '2018', title: 'De eerste stappen', description: 'Op mijn 14e begon ik met het verkopen van verzamelkaarten op Marktplaats. Wat begon als zakgeld verdienen, werd al snel een echte passie.', color: 'from-purple-500 to-violet-500' },
  { year: '2019', title: 'Vallen en opstaan', description: 'Ik waagde me aan iPhones en PS5 consoles. Werd meerdere keren opgelicht. Harde lessen over vertrouwen en kwaliteitscontrole.', color: 'from-slate-500 to-slate-600' },
  { year: '2020', title: 'Terug naar de passie', description: 'Na de tegenslagen terug naar mijn roots: Nintendo. Originele Pokémon-games inkopen, testen en doorverkopen.', color: 'from-amber-500 to-orange-500' },
  { year: '2022', title: 'Gameshop Enter', description: 'De focus op originele Pokémon-games groeide snel. Het werd tijd voor een echte naam. Gameshop Enter was geboren.', color: 'from-emerald-500 to-teal-500' },
  { year: '2023', title: 'Studie & praktijk', description: 'Start studie Ondernemerschap en Retailmanagement aan het Saxion. Theorie en praktijk versterken elkaar.', color: 'from-cyan-500 to-blue-500' },
  { year: '2024', title: '3000+ klanten', description: 'Meer dan 3000 tevreden klanten en 1360+ reviews op Marktplaats met een perfecte 5.0 score.', color: 'from-amber-400 to-yellow-500' },
  { year: 'Nu', title: 'Dé specialist', description: 'Gameshop Enter is dé Pokémon games specialist van Nederland. Originele games, eigen fotografie, persoonlijke service.', color: 'from-emerald-400 to-cyan-400' },
];

const processSteps = [
  { num: '01', title: 'Selectie', desc: 'Zorgvuldig zoeken naar originele games bij betrouwbare bronnen', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', gradient: 'from-violet-500 to-purple-500' },
  { num: '02', title: 'Authenticatie', desc: 'Elke game gecontroleerd op originaliteit — geen reproducties', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', gradient: 'from-emerald-500 to-teal-500' },
  { num: '03', title: 'Testen', desc: 'Persoonlijk getest op werking — save, batterij, connectie', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085', gradient: 'from-cyan-500 to-blue-500' },
  { num: '04', title: 'Fotografie', desc: 'Eigen productfoto\'s — wat je ziet is wat je krijgt', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z', gradient: 'from-amber-500 to-orange-500' },
  { num: '05', title: 'Verpakken', desc: 'Bubbeltjesenvelop of versterkte doos — beschermd en veilig', icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25', gradient: 'from-rose-500 to-pink-500' },
  { num: '06', title: 'Verzending', desc: 'PostNL volgende werkdag met track & trace', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h.008M21 12.75h-2.25A2.25 2.25 0 0016.5 15v.75', gradient: 'from-teal-500 to-emerald-500' },
];

// ─── PAGE ──────────────────────────────────────────────────

export default function OverOnsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);

  // Hero parallax
  const { scrollYProgress: heroScrollProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 0.6], [1, 0.92]);

  // Hero mouse glow
  const heroMouse = useMotionValue(0.5);
  const heroMouseY = useMotionValue(0.5);
  const heroGlowX = useSpring(useTransform(heroMouse, [0, 1], [20, 80]), { stiffness: 50, damping: 20 });
  const heroGlowY = useSpring(useTransform(heroMouseY, [0, 1], [20, 80]), { stiffness: 50, damping: 20 });
  const heroGlow = useMotionTemplate`radial-gradient(800px circle at ${heroGlowX}% ${heroGlowY}%, rgba(16,185,129,0.15), transparent 50%)`;

  // Timeline scroll line
  const { scrollYProgress: timelineProgress } = useScroll({ target: timelineRef, offset: ['start end', 'end start'] });
  const lineHeight = useTransform(timelineProgress, [0, 1], ['0%', '100%']);

  // Mission parallax
  const { scrollYProgress: missionProgress } = useScroll({ target: missionRef, offset: ['start end', 'end start'] });
  const missionScale = useTransform(missionProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  // Game showcase layers
  const { layer1, layer2, layer3 } = useMemo(() => {
    const withImage = getAllProducts().filter(p => p.image);
    const l1: Product[] = [], l2: Product[] = [], l3: Product[] = [];
    withImage.forEach((p, i) => {
      if (i % 3 === 0) l1.push(p); else if (i % 3 === 1) l2.push(p); else l3.push(p);
    });
    return { layer1: l1, layer2: l2, layer3: l3 };
  }, []);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const showcaseIsVisible = useInView(showcaseRef, { once: true, margin: '-100px' });

  const handleHeroMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroMouse.set((e.clientX - rect.left) / rect.width);
    heroMouseY.set((e.clientY - rect.top) / rect.height);
  }, [heroMouse, heroMouseY]);

  return (
    <div className="pt-20 lg:pt-24">

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC HERO — Full-screen parallax met word-by-word reveal
          ═══════════════════════════════════════════════════════════ */}
      <div
        ref={heroRef}
        onMouseMove={handleHeroMove}
        className="relative bg-[#050810] min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Layered backgrounds */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: heroGlow }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.06),transparent_50%)]" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] right-[15%] w-64 h-64 rounded-full bg-emerald-500/[0.03] blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[20%] left-[10%] w-48 h-48 rounded-full bg-cyan-500/[0.04] blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute top-[40%] left-[50%] w-96 h-96 -translate-x-1/2 rounded-full bg-teal-500/[0.03] blur-3xl"
        />

        {/* Particle dust */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-emerald-400"
            style={{ top: `${8 + (i * 4.7) % 84}%`, left: `${3 + (i * 5.3) % 94}%` }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 2, 0] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
          />
        ))}

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-[0.2em] mb-10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Het verhaal achter Gameshop Enter
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.05] mb-8">
            <WordReveal text="Van kaarten" className="block" delay={0.3} />
            <WordReveal text="op Marktplaats" className="block" delay={0.5} />
            <span className="block mt-2">
              <WordReveal text="tot Pokémon" className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400" delay={0.7} />
            </span>
            <span className="block">
              <WordReveal text="specialist." className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400" delay={0.9} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg lg:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Het eerlijke verhaal van Lenn Hodes — van tegenslagen en harde lessen tot de Pokémon specialist van Nederland.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
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

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATS — Grote nummers met glassmorphism
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative -mt-12 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 lg:p-10"
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tabular-nums mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-semibold text-slate-800 mb-0.5">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HET VERHAAL — Cinematic storytelling met fade+blur reveals
          ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-px w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mb-8 origin-left"
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-12 leading-[1.1]"
          >
            Hoi, ik ben <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Lenn</span>.
          </motion.h2>

          <div className="space-y-7 text-lg lg:text-xl text-slate-600 leading-relaxed">
            <ParagraphReveal delay={0}>
              In 2018, op mijn veertiende, verkocht ik mijn eerste verzamelkaarten op Marktplaats. Pokémon-kaarten, Nintendo-kaarten — alles wat ik kon vinden. Het was het begin van iets groters.
            </ParagraphReveal>

            <ParagraphReveal delay={0.1}>
              Daarna waagde ik me aan iPhones en PlayStation 5 consoles. Dat liep niet goed. Ik werd meerdere keren opgelicht. <strong className="text-slate-900 font-bold">Harde lessen</strong> — maar ze leerden me alles over vertrouwen, kwaliteitscontrole en eerlijk zakendoen.
            </ParagraphReveal>

            <ParagraphReveal delay={0.15}>
              Uiteindelijk keerde ik terug naar mijn echte passie: <strong className="text-slate-900 font-bold">Pokémon</strong>. Originele games inkopen, elke cartridge persoonlijk testen, en met zorg doorverkopen aan liefhebbers zoals ik. Die focus op kwaliteit en originaliteit maakte het verschil.
            </ParagraphReveal>

            <ParagraphReveal delay={0.2}>
              Vandaag studeer ik Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Wat ik leer, pas ik direct toe. Die combinatie maakt Gameshop Enter niet alleen een webshop — maar een <strong className="text-slate-900 font-bold">specialist die je bij naam kent</strong>.
            </ParagraphReveal>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ONS PROCES — Apple-style stappen
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-px w-12 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6 origin-center"
            />
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Van inkoop tot levering
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Elk product doorloopt ons zorgvuldige 6-stappen proces.
            </p>
          </motion.div>

          {/* Process line + steps */}
          <div className="relative">
            <div className="hidden lg:block absolute top-[56px] left-[8%] right-[8%] h-px bg-slate-200" />
            <motion.div
              className="hidden lg:block absolute top-[56px] left-[8%] right-[8%] h-px bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ y: -8, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="relative mx-auto"
                  >
                    <div className={`h-28 w-28 mx-auto rounded-3xl bg-gradient-to-br ${step.gradient} p-[2px] shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <div className="h-full w-full rounded-3xl bg-white flex flex-col items-center justify-center gap-2">
                        <svg className="h-7 w-7 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                        </svg>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{step.num}</span>
                      </div>
                    </div>
                  </motion.div>
                  <h3 className="font-bold text-slate-900 text-sm mt-5 mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[150px] mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TIMELINE — Donkere sectie met animated lijn
          ═══════════════════════════════════════════════════════════ */}
      <section ref={timelineRef} className="relative bg-[#050810] py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_70%)]" />

        {/* Atmospheric particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/20"
            style={{ top: `${12 + (i * 8.5) % 76}%`, left: `${6 + (i * 11.3) % 88}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-px w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto mb-6 origin-center"
            />
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Mijn reis
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Elk hoofdstuk heeft me gevormd tot wie ik nu ben.
            </p>
          </motion.div>

          <div className="relative">
            {/* Animated vertical line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-white/[0.06] lg:-translate-x-px" />
            <motion.div
              className="absolute left-6 lg:left-1/2 top-0 w-px bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 lg:-translate-x-px origin-top"
              style={{ height: lineHeight }}
            />

            <div className="space-y-20">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex items-start gap-8 lg:gap-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Node */}
                  <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      whileInView={{ scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 250 }}
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg ring-4 ring-[#050810]`}
                    >
                      <span className="text-xs font-extrabold">{item.year === 'Nu' ? '→' : item.year.slice(-2)}</span>
                    </motion.div>
                  </div>

                  {/* Card */}
                  <div className={`flex-1 ml-20 lg:ml-0 ${i % 2 === 0 ? 'lg:pr-20 lg:text-right' : 'lg:pl-20'}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-500 group"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-xs font-bold mb-3`}>
                        {item.year}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm">{item.description}</p>
                    </motion.div>
                  </div>

                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GAME SHOWCASE — Velocity marquee
          ═══════════════════════════════════════════════════════════ */}
      <section ref={showcaseRef} className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">Ons assortiment</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm">Elke game persoonlijk getest en met zorg geselecteerd</p>
          </motion.div>
        </div>

        <div className="absolute top-0 bottom-0 left-0 w-24 lg:w-40 bg-gradient-to-r from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 lg:w-40 bg-gradient-to-l from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={showcaseIsVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          <VelocityRow items={layer3} baseVelocity={-80} size="sm" blur="blur(1.5px)" opacity={0.3} depth={-200} velocityFactor={velocityFactor} />
          <VelocityRow items={layer2} baseVelocity={50} size="md" blur="blur(0.5px)" opacity={0.6} depth={-100} velocityFactor={velocityFactor} />
          <VelocityRow items={layer1} baseVelocity={-30} size="lg" blur="none" opacity={1} depth={0} velocityFactor={velocityFactor} />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MISSIE — Cinematic quote
          ═══════════════════════════════════════════════════════════ */}
      <section ref={missionRef} className="relative py-32 lg:py-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/20 to-white" />

        {/* Decorative marks */}
        <div className="absolute top-[12%] left-[6%] text-[240px] font-serif text-emerald-500/[0.03] select-none leading-none">&ldquo;</div>
        <div className="absolute bottom-[12%] right-[6%] text-[240px] font-serif text-emerald-500/[0.03] select-none leading-none">&rdquo;</div>

        <motion.div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ scale: missionScale }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <motion.blockquote
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-3xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-8 max-w-3xl mx-auto"
            >
              &ldquo;Retro gaming is meer dan nostalgie. Het is tijdloze klassiekers <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">bewaren</span> voor de volgende generatie.&rdquo;
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mx-auto w-20 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-6"
            />

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="text-sm text-slate-400 font-medium tracking-wide"
            >
              — Lenn Hodes, oprichter
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WAAROM WIJ — Dark glassmorphism grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#050810] py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.06),transparent_50%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-px w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto mb-6 origin-center"
            />
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Waarom Gameshop Enter
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Geen anonieme verkoper — een specialist die je bij naam kent.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: '100% Origineel', desc: 'Elke game gecontroleerd op originaliteit. Geen reproducties, gegarandeerd echt.', gradient: 'from-emerald-400 to-teal-400', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
              { title: 'Persoonlijk getest', desc: 'Elk product handmatig getest op werking. Werkt het niet? Dan verkopen we het niet.', gradient: 'from-cyan-400 to-blue-400', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63' },
              { title: 'Eigen fotografie', desc: 'Wat je op de website ziet is exact wat je ontvangt. Geen stock foto\'s.', gradient: 'from-amber-400 to-orange-400', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z' },
              { title: 'Eerlijke prijzen', desc: 'Marktconforme prijzen op basis van PriceCharting. Geen woekerprijzen, geen verborgen kosten.', gradient: 'from-violet-400 to-purple-400', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Snelle verzending', desc: 'Volgende werkdag bezorgd via PostNL met track & trace. Gratis boven €100.', gradient: 'from-rose-400 to-pink-400', icon: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
              { title: '14 dagen retour', desc: 'Niet tevreden? Stuur het terug voor volledige terugbetaling. Zonder gedoe.', gradient: 'from-teal-400 to-emerald-400', icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                className="group"
              >
                <div className="relative h-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-500">
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 blur-xl`} />
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-emerald-300 transition-colors duration-300">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          REVIEWS — Testimonials
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-px w-12 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-6 origin-center"
            />
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
              Wat klanten zeggen
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              1360+ reviews met een perfecte 5.0 score
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Mark V.', text: 'Snelle levering, perfect verpakt en de game werkt uitstekend. Precies wat ik verwachtte op basis van de foto\'s. Topservice!', product: 'Pokémon HeartGold' },
              { name: 'Sanne K.', text: 'Eindelijk een betrouwbare verkoper voor Pokémon games. Alles origineel, netjes getest en supersnel geleverd. Zeker weer bestellen!', product: 'Pokémon Platinum' },
              { name: 'Thomas B.', text: 'De mooiste DS-collectie die ik online heb gevonden. Lenn reageert snel op vragen en de verpakking was echt top. Aanrader!', product: 'Pokémon Black 2' },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative h-full bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                  {/* Stars */}
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
                      <span className="text-[10px] font-bold uppercase tracking-wider">Geverifieerd</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BEDRIJFSINFO — Clean, minimal
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-px w-12 bg-gradient-to-r from-slate-300 to-slate-400 mb-8 origin-left"
            />
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Bedrijfsgegevens</h2>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
              {[
                ['Bedrijfsnaam', 'Gameshop Enter'],
                ['Eigenaar', 'Lenn Hodes'],
                ['KvK-nummer', '93642474'],
                ['Actief sinds', '2018'],
                ['Specialisatie', 'Originele Pokémon games'],
                ['Platforms', 'DS, GBA, 3DS, Game Boy'],
              ].map(([label, value], i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</dt>
                  <dd className="text-slate-900 font-medium">{value}</dd>
                </motion.div>
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
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Full-screen cinematic
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#050810] py-32 lg:py-44 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_55%)]" />

        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [12, 18, 12] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] right-[15%] w-32 h-32 rounded-3xl bg-white/[0.02] border border-white/[0.04] rotate-12"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[20%] left-[10%] w-20 h-20 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/[0.04] -rotate-12"
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Klaar om te{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                shoppen
              </span>
              ?
            </h2>
            <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto">
              Ontdek ons complete assortiment originele Pokémon games — elke game persoonlijk getest en gefotografeerd.
            </p>
            <Link href="/shop">
              <Button size="lg">
                Bekijk alle producten
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
