'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getFeaturedProducts } from '@/lib/products';
import ProductCard from '@/components/shop/ProductCard';

export default function FeaturedProducts() {
  const products = useMemo(() => getFeaturedProducts(), []);
  const carouselRef = useRef<HTMLDivElement>(null);
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

  return (
    <section className="relative bg-white py-16 lg:py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-emerald-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Uitgelicht
            </p>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Toppers uit de collectie
            </h2>
            <p className="text-slate-400 mt-3 text-sm lg:text-base max-w-md">
              Handgeselecteerde games en consoles
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Alles bekijken
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </motion.div>

        {/* Mobile carousel */}
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

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="sm:hidden mt-8 text-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 w-full"
          >
            Bekijk alle producten
          </Link>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.sku}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
