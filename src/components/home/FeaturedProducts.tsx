'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getFeaturedProducts } from '@/lib/products';
import ProductCard from '@/components/shop/ProductCard';
import TextReveal from '@/components/ui/TextReveal';
import MagneticButton from '@/components/ui/MagneticButton';
import Button from '@/components/ui/Button';

function getNextSunday23h59(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntilSunday);
  target.setHours(23, 59, 59, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 7);
  }
  return target;
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = getNextSunday23h59();
      const diff = Math.max(0, end.getTime() - now.getTime());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const blocks = [
    { label: 'dagen', value: timeLeft.d },
    { label: 'uur', value: timeLeft.h },
    { label: 'min', value: timeLeft.m },
    { label: 'sec', value: timeLeft.s },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-extrabold text-white tabular-nums leading-none bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
              {String(b.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5">{b.label}</span>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-slate-500 font-bold text-lg mb-3">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.88,
    rotateX: 15,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 16,
      mass: 0.9,
    }
  },
};

export default function FeaturedProducts() {
  const products = useMemo(() => getFeaturedProducts(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const measure = () => setCarouselWidth(el.scrollWidth - el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  return (
    <section ref={sectionRef} className="relative bg-white dark:bg-slate-900 py-16 lg:py-24 overflow-hidden">
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.06] rounded-full blur-[150px]"
        style={{ y: bgY }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[120px]"
        style={{ y: bgY }}
      />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.span>
              Populair
            </motion.span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              <TextReveal text="Toppers uit de collectie" delay={0.1} />
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-1 w-40 rounded-full mt-3 origin-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-aurora" style={{ backgroundSize: '200% 100%' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </motion.div>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-base lg:text-lg">Premium games en consoles die je niet wilt missen</p>
          </div>
          <MagneticButton strength={0.15}>
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors group"
            >
              Bekijk alles
              <motion.svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </motion.svg>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Countdown timer banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 rounded-2xl bg-gradient-to-r from-[#050810] via-[#0a1628] to-[#050810] border border-slate-700/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm sm:text-base">Weekdeal eindigt over</p>
              <p className="text-slate-400 text-xs">Gratis verzending op alle weekdeals</p>
            </div>
          </div>
          <CountdownTimer />
        </motion.div>

        <motion.div
          ref={carouselRef}
          className="flex gap-4 sm:hidden cursor-grab active:cursor-grabbing overflow-hidden"
          drag="x"
          dragConstraints={{ right: 0, left: -carouselWidth }}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        >
          {products.map((product) => (
            <motion.div key={product.sku} className="min-w-[280px] flex-shrink-0">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
          {products.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === 0 ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ perspective: '1200px' }}
        >
          {products.map((product) => (
            <motion.div key={product.sku} variants={cardVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="sm:hidden mt-8 text-center"
        >
          <Link href="/shop">
            <Button size="lg" className="w-full">
              Bekijk alle producten
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
