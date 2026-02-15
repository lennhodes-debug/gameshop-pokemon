'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';
import Image from 'next/image';
import { getAllProducts, type Product } from '@/lib/products';

// ─── REUSABLE ANIMATION COMPONENTS ─────────────────────────

function CharReveal({
  text,
  className = '',
  delay = 0,
  stagger = 0.025,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <span ref={ref} className={`inline ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '120%', rotateX: -90, opacity: 0 }}
            animate={isInView ? { y: 0, rotateX: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function WordReveal({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <span ref={ref} className={`inline ${className}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
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

  return (
    <span ref={ref}>
      {count.toLocaleString('nl-NL')}
      {suffix}
    </span>
  );
}

function Magnetic({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * strength);
      y.set((e.clientY - rect.top - rect.height / 2) * strength);
    },
    [x, y, strength],
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

// ─── DATA ───────────────────────────────────────────────────

const processSteps = [
  {
    num: '01',
    title: "Maak foto's",
    desc: "Maak duidelijke foto's van je games of consoles — voor- en achterkant",
    icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    num: '02',
    title: 'Stuur ze op',
    desc: "Vul het formulier in en stuur je foto's mee via e-mail",
    icon: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    num: '03',
    title: 'Ontvang je bod',
    desc: 'Wij reageren binnen 24 uur met een eerlijk bod op basis van marktwaarde',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    num: '04',
    title: 'Ontvang betaling',
    desc: 'Akkoord? Betaling binnen 2 werkdagen op je rekening',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    gradient: 'from-violet-500 to-purple-500',
  },
];

// ─── PAGE ───────────────────────────────────────────────────

export default function InkoopPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    naam: '',
    email: '',
    telefoon: '',
    platform: '',
    beschrijving: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Hero parallax + mouse glow
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 0.6], [1, 0.95]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glowX = useSpring(useTransform(mouseX, [0, 1], [20, 80]), { stiffness: 50, damping: 20 });
  const glowY = useSpring(useTransform(mouseY, [0, 1], [20, 80]), { stiffness: 50, damping: 20 });
  const heroGlow = useMotionTemplate`radial-gradient(600px circle at ${glowX}% ${glowY}%, rgba(16,185,129,0.12), transparent 50%)`;

  // Floating product covers
  const products = getAllProducts()
    .filter((p) => p.image)
    .slice(0, 8);

  const handleHeroMove = useCallback(
    (e: React.MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY],
  );

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateMailto = () => {
    const subject = encodeURIComponent('Inkoop aanvraag — Nintendo games verkopen');
    const body = encodeURIComponent(
      `Hallo Gameshop Enter,\n\nIk wil graag Nintendo games/consoles verkopen.\n\nNaam: ${form.naam}\nE-mail: ${form.email}\nTelefoon: ${form.telefoon || 'Niet opgegeven'}\nPlatform: ${form.platform || 'Niet opgegeven'}\n\nBeschrijving:\n${form.beschrijving}\n\n(Foto's worden als bijlage meegestuurd)\n\nMet vriendelijke groet,\n${form.naam}`,
    );
    return `mailto:gameshopenter@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = generateMailto();
      }
    }, 300);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-16 lg:pt-20">
      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC HERO — Full-screen met parallax en char reveal
          ═══════════════════════════════════════════════════════════ */}
      <div
        ref={heroRef}
        onMouseMove={handleHeroMove}
        className="relative bg-[#050810] min-h-[80vh] flex items-center justify-center overflow-hidden"
      >
        <NoiseOverlay opacity={0.04} />
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: heroGlow }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.06),transparent_50%)]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating product covers — cinematic depth */}
        {products.slice(0, 6).map((product, i) => {
          const positions = [
            {
              top: '8%',
              left: '5%',
              rotate: -12,
              size: 'w-20 h-20 lg:w-28 lg:h-28',
              opacity: 0.15,
            },
            {
              top: '15%',
              right: '8%',
              rotate: 8,
              size: 'w-16 h-16 lg:w-24 lg:h-24',
              opacity: 0.12,
            },
            {
              bottom: '25%',
              left: '8%',
              rotate: 6,
              size: 'w-14 h-14 lg:w-20 lg:h-20',
              opacity: 0.1,
            },
            {
              bottom: '12%',
              right: '12%',
              rotate: -8,
              size: 'w-18 h-18 lg:w-24 lg:h-24',
              opacity: 0.13,
            },
            {
              top: '45%',
              left: '2%',
              rotate: -4,
              size: 'w-12 h-12 lg:w-16 lg:h-16',
              opacity: 0.08,
            },
            {
              top: '35%',
              right: '3%',
              rotate: 10,
              size: 'w-14 h-14 lg:w-18 lg:h-18',
              opacity: 0.1,
            },
          ];
          const pos = positions[i];
          return (
            <motion.div
              key={product.sku}
              className={`absolute ${pos.size} rounded-2xl overflow-hidden hidden md:block`}
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                bottom: pos.bottom,
                opacity: pos.opacity,
              }}
              animate={{
                y: [0, -15 + i * 3, 0],
                rotate: [pos.rotate, pos.rotate + 3, pos.rotate],
              }}
              transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={product.image!}
                alt=""
                width={120}
                height={120}
                className="object-cover w-full h-full rounded-2xl"
              />
            </motion.div>
          );
        })}

        {/* Particle dust */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-emerald-400"
            style={{ top: `${10 + ((i * 5.7) % 80)}%`, left: `${5 + ((i * 6.3) % 90)}%` }}
            animate={{ opacity: [0, 0.5, 0], scale: [0, 2, 0] }}
            transition={{
              duration: 2.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.06] text-emerald-400 text-xs font-medium uppercase tracking-[0.2em] mb-10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Snel &amp; eerlijk
          </motion.div>

          <h1 className="text-4xl lg:text-[80px] font-light text-white tracking-[-0.03em] leading-[0.95] mb-8">
            <span className="block">
              <CharReveal text="Nintendo games" delay={0.3} stagger={0.025} />
            </span>
            <span className="block mt-2">
              <CharReveal
                text="verkopen?"
                className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
                delay={0.7}
                stagger={0.03}
              />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg lg:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed mb-12"
          >
            Stuur foto&apos;s van je games of consoles, dan doen wij je een eerlijk bod. Van Game
            Boy tot Switch — alles van Nintendo is welkom.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <Magnetic strength={0.25}>
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-medium text-base shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300"
              >
                Start je aanvraag
                <motion.svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                  />
                </motion.svg>
              </button>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR — Glassmorphism floating over hero edge
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative -mt-10 z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 p-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 3000, suffix: '+', label: 'Games ingekocht', sub: 'en groeiend' },
              { value: 24, suffix: 'u', label: 'Reactietijd', sub: 'of sneller' },
              { value: 2, suffix: ' dagen', label: 'Betaling', sub: 'na akkoord' },
              { value: 100, suffix: '%', label: 'Eerlijk', sub: 'op basis van marktwaarde' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tabular-nums mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-slate-800 mb-0.5">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROCES — Apple-style 4-stappen met animated lijn
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-slate-50">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h2 className="text-3xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
              <WordReveal text="Zo werkt het" />
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              In vier simpele stappen van games naar geld.
            </p>
          </motion.div>

          {/* Process steps with connecting line */}
          <div className="relative">
            {/* Horizontal connector */}
            <div className="hidden lg:block absolute top-[64px] left-[12%] right-[12%] h-px bg-slate-200" />
            <motion.div
              className="hidden lg:block absolute top-[64px] left-[12%] right-[12%] h-px bg-gradient-to-r from-amber-500 via-emerald-500 via-cyan-500 to-violet-500 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <div
                      className={`h-32 w-32 mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} p-[2px] shadow-lg group-hover:shadow-2xl transition-shadow duration-500`}
                    >
                      <div className="h-full w-full rounded-2xl bg-white flex flex-col items-center justify-center gap-3">
                        <svg
                          className="h-8 w-8 text-slate-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                        </svg>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.15em]">
                          {step.num}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  <h3 className="font-semibold text-slate-900 mt-6 mb-2 text-base">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[180px] mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FORMULIER — Premium glassmorphism form + sidebar
          ═══════════════════════════════════════════════════════════ */}
      <section ref={formRef} className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-px w-12 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6 origin-center"
            />
            <h2 className="text-3xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
              <WordReveal text="Wat wil je verkopen?" />
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Vul het formulier in en stuur foto&apos;s mee. Wij doen je een eerlijk bod.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="lg:col-span-3"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-2xl p-10 text-center shadow-lg"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
                      className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25"
                    >
                      <svg
                        className="h-10 w-10 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </motion.div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                      Je e-mail app is geopend!
                    </h2>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                      Vergeet niet je foto&apos;s als bijlage toe te voegen. We reageren binnen 24
                      uur met een eerlijk bod.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                    >
                      Nieuw formulier invullen
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-8 lg:p-10 shadow-lg shadow-slate-100/50"
                  >
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="inkoop-naam"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            Naam *
                          </label>
                          <input
                            id="inkoop-naam"
                            type="text"
                            required
                            value={form.naam}
                            onChange={(e) => updateField('naam', e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-400/20 outline-none transition-all text-sm hover:bg-slate-100/80 focus:bg-white"
                            placeholder="Je naam"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="inkoop-email"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            E-mail *
                          </label>
                          <input
                            id="inkoop-email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-400/20 outline-none transition-all text-sm hover:bg-slate-100/80 focus:bg-white"
                            placeholder="je@email.nl"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="inkoop-telefoon"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            Telefoon <span className="text-slate-400 font-normal">(optioneel)</span>
                          </label>
                          <input
                            id="inkoop-telefoon"
                            type="tel"
                            value={form.telefoon}
                            onChange={(e) => updateField('telefoon', e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-400/20 outline-none transition-all text-sm hover:bg-slate-100/80 focus:bg-white"
                            placeholder="06-12345678"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="inkoop-platform"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            Platform <span className="text-slate-400 font-normal">(optioneel)</span>
                          </label>
                          <select
                            id="inkoop-platform"
                            value={form.platform}
                            onChange={(e) => updateField('platform', e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-400/20 outline-none transition-all text-sm hover:bg-slate-100/80 focus:bg-white appearance-none bg-no-repeat bg-[right_14px_center] bg-[length:16px_16px] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')]"
                          >
                            <option value="">Kies platform...</option>
                            <option value="Nintendo Switch">Nintendo Switch</option>
                            <option value="Nintendo 3DS">Nintendo 3DS</option>
                            <option value="Nintendo DS">Nintendo DS</option>
                            <option value="Wii U">Wii U</option>
                            <option value="Wii">Wii</option>
                            <option value="GameCube">GameCube</option>
                            <option value="Nintendo 64">Nintendo 64</option>
                            <option value="SNES">SNES</option>
                            <option value="NES">NES</option>
                            <option value="Game Boy Advance">Game Boy Advance</option>
                            <option value="Game Boy / Color">Game Boy / Color</option>
                            <option value="Game & Watch">Game &amp; Watch</option>
                            <option value="Sega">Sega</option>
                            <option value="Meerdere / Anders">Meerdere / Anders</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="inkoop-beschrijving"
                          className="block text-sm font-medium text-slate-700 mb-2"
                        >
                          Wat wil je verkopen? *
                        </label>
                        <textarea
                          id="inkoop-beschrijving"
                          required
                          value={form.beschrijving}
                          onChange={(e) => updateField('beschrijving', e.target.value)}
                          rows={5}
                          className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-slate-400/20 outline-none transition-all text-sm resize-none hover:bg-slate-100/80 focus:bg-white"
                          placeholder="Beschrijf wat je wilt verkopen (bijv. Pokémon games, SNES cartridges, Game Boy, lege doosjes, consoles). Vermeld de staat en of je de originele doos nog hebt."
                        />
                      </div>

                      {/* Photo tip */}
                      <div className="bg-amber-50/70 rounded-2xl px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg
                              className="h-4 w-4 text-amber-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            <strong className="text-slate-800">Tip:</strong> Na het verzenden opent
                            je e-mail app. Voeg foto&apos;s toe van de voor- en achterkant.
                            Duidelijke foto&apos;s = beter bod!
                          </p>
                        </div>
                      </div>

                      <Magnetic strength={0.15}>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.01, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-6 py-4.5 rounded-2xl bg-slate-900 text-white font-medium text-base shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2.5"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                            />
                          </svg>
                          Verstuur via e-mail
                        </motion.button>
                      </Magnetic>

                      {/* Trust signals */}
                      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2">
                        {['Reactie binnen 24 uur', 'Eerlijk bod', 'Betaling binnen 2 dagen'].map(
                          (text) => (
                            <span
                              key={text}
                              className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                            >
                              <svg
                                className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                              {text}
                            </span>
                          ),
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Why sell to us */}
              <div className="bg-white rounded-2xl p-7 shadow-sm">
                <h3 className="font-semibold text-slate-900 text-lg mb-5">
                  Waarom bij ons verkopen?
                </h3>
                <div className="space-y-5">
                  {[
                    {
                      title: 'Eerlijk bod',
                      desc: 'Wij doen je altijd een eerlijk bod op basis van marktwaarde',
                      gradient: 'from-emerald-500 to-teal-500',
                      icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
                    },
                    {
                      title: 'Snelle afhandeling',
                      desc: 'Reactie binnen 24u, betaling binnen 2 dagen',
                      gradient: 'from-cyan-500 to-blue-500',
                      icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
                    },
                    {
                      title: 'Nintendo specialist',
                      desc: 'Game Boy tot Switch, SNES tot Wii U — alles welkom',
                      gradient: 'from-violet-500 to-purple-500',
                      icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z',
                    },
                    {
                      title: 'Gratis verzending',
                      desc: 'Stuur je pakket gratis op via PostNL',
                      gradient: 'from-amber-500 to-orange-500',
                      icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                      className="flex items-start gap-3.5 group"
                    >
                      <div
                        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow`}
                      >
                        <svg
                          className="h-4.5 w-4.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                        <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Marktplaats rating */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex text-amber-400 text-lg tracking-tight">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-slate-900">5.0</span>
                    <span className="text-sm text-slate-500 ml-1.5">op Marktplaats</span>
                    <span className="block text-xs text-slate-400">1360+ reviews</span>
                  </div>
                </div>
              </motion.div>

              {/* Direct contact card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="relative bg-[#050810] rounded-2xl p-7 overflow-hidden"
              >
                <NoiseOverlay opacity={0.04} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.1),transparent_60%)]" />

                <div className="relative">
                  <h3 className="text-white font-semibold mb-2">Liever direct contact?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Stuur je foto&apos;s en beschrijving direct naar ons. We reageren binnen 24 uur.
                  </p>
                  <a
                    href="mailto:gameshopenter@gmail.com?subject=Inkoop%20aanvraag"
                    className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    gameshopenter@gmail.com
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Cinematic full-width
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#050810] py-28 lg:py-36 overflow-hidden">
        <NoiseOverlay opacity={0.035} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_55%)]" />

        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [8, 14, 8] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[15%] w-24 h-24 rounded-2xl bg-white/[0.03] rotate-12"
        />
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[25%] left-[10%] w-16 h-16 rounded-2xl bg-emerald-500/[0.04] -rotate-6"
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl lg:text-6xl font-semibold text-white tracking-tight mb-6 leading-tight">
              Of liever{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                kopen
              </span>
              ?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
              Ontdek ons complete assortiment originele Nintendo games — elke game persoonlijk
              getest.
            </p>
            <Magnetic strength={0.25}>
              <a
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-medium text-base shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300"
              >
                Bekijk alle producten
                <motion.svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </motion.svg>
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
