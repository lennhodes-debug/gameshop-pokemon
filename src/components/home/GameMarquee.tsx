'use client';

import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion';
import { useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts } from '@/lib/products';

export default function GameMarquee() {
  const { productsWithImages, row1, row2 } = useMemo(() => {
    const all = getAllProducts().filter(p => p.image);
    return { productsWithImages: all, row1: all.slice(0, 24), row2: all.slice(24, 48) };
  }, []);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-8%', '0%']);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const skewX = useSpring(
    useTransform(scrollVelocity, [-2000, 0, 2000], [2, 0, -2]),
    { stiffness: 100, damping: 30 }
  );

  return (
    <section ref={sectionRef} className="relative bg-white dark:bg-slate-900 py-12 lg:py-16 overflow-hidden">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {productsWithImages.length}+ games met cover art
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ontdek de collectie
          </h2>
        </motion.div>
      </div>

      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 lg:w-48 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 lg:w-48 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 z-10 pointer-events-none" />

      <div className="space-y-5">
        {/* Row 1 - scrolling left */}
        <motion.div className="relative overflow-hidden" style={{ x: x1, skewX }}>
          <div className="flex animate-marquee whitespace-nowrap gap-4">
            {[...row1, ...row1].map((product, i) => (
              <Link
                key={`${product.sku}-${i}`}
                href={`/shop/${product.sku}`}
                className="flex-shrink-0"
              >
                <div className="group relative w-24 h-32 lg:w-28 lg:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm card-3d-tilt">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="112px"
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out" />
                  {/* Colored shadow on hover */}
                  <div className="absolute -inset-1 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-xl transition-all duration-500 -z-10" />
                  {/* Name overlay on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[10px] text-white font-semibold leading-tight line-clamp-2 whitespace-normal">
                      {product.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Row 2 - scrolling right */}
        <motion.div className="relative overflow-hidden" style={{ x: x2, skewX }}>
          <div className="flex animate-marquee-reverse whitespace-nowrap gap-4">
            {[...row2, ...row2].map((product, i) => (
              <Link
                key={`${product.sku}-${i}`}
                href={`/shop/${product.sku}`}
                className="flex-shrink-0"
              >
                <div className="group relative w-24 h-32 lg:w-28 lg:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm card-3d-tilt">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="112px"
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out" />
                  {/* Colored shadow on hover */}
                  <div className="absolute -inset-1 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-xl transition-all duration-500 -z-10" />
                  {/* Name overlay on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[10px] text-white font-semibold leading-tight line-clamp-2 whitespace-normal">
                      {product.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
