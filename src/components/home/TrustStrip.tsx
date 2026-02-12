'use client';

import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

function AnimatedNumber({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const startTime = performance.now();
        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(2, -10 * progress);
          setCount(Math.floor(value * eased));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(value);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString('nl-NL')}{suffix}</span>;
}

const trustItems = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '100% Origineel',
    description: 'Alle producten persoonlijk getest',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.2)',
    animatedValue: null as null | { value: number; suffix: string },
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: 'Zorgvuldig verpakt',
    description: 'Bubbeltjesfolie + stevige doos via PostNL',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.2)',
    animatedValue: null as null | { value: number; suffix: string },
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Gratis verzending',
    description: 'Vanaf €100 — anders vanaf €4,95',
    gradient: 'from-sky-500 to-blue-500',
    glow: 'rgba(14,165,233,0.2)',
    animatedValue: null as null | { value: number; suffix: string },
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
    title: '14 dagen bedenktijd',
    description: 'Geen gedoe — gewoon terugsturen',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.2)',
    animatedValue: { value: 14, suffix: ' dagen bedenktijd' },
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.25 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 180, damping: 18 },
  },
} as const;

function TrustCard({ item }: { item: typeof trustItems[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const spotX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotBg = useMotionTemplate`radial-gradient(250px circle at ${spotX}% ${spotY}%, ${item.glow}, transparent 70%)`;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    void x; void y;
    e.currentTarget.style.transform = 'scale(1.02)';
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  }, []);

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      onMouseMove={(e) => {
        handleMouseMove(e);
        handleCardMouseMove(e);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={(e) => {
        setHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
        handleCardMouseLeave(e);
      }}
      style={{ transition: 'transform 0.3s ease' }}
      className="relative group flex flex-col items-center text-center p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-slate-200/80 dark:hover:border-slate-600 transition-all duration-300 overflow-hidden"
    >
      {hovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: spotBg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      <motion.div
        className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}
        style={{ boxShadow: hovered ? `0 8px 30px ${item.glow}` : undefined }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {item.icon}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient}`}
          animate={{ scale: [1, 1.4, 1.4], opacity: [0.3, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <h3 className="relative z-10 font-bold text-slate-900 dark:text-white mb-1 text-base lg:text-lg">
        {item.animatedValue ? (
          <AnimatedNumber value={item.animatedValue.value} suffix={item.animatedValue.suffix} />
        ) : (
          item.title
        )}
      </h3>
      <p className="relative z-10 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
    </motion.div>
  );
}

export default function TrustStrip() {
  return (
    <section className="bg-[#f8fafc] dark:bg-slate-900 py-12 lg:py-16 -mt-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Waarom Gameshop Enter?</p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {trustItems.map((item, index) => (
            <TrustCard key={index} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
