'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/products';
import ProductCard from '@/components/shop/ProductCard';

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
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

  if (products.length === 0) return null;

  return (
    <section className="mt-16 lg:mt-24">
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-16 lg:mb-24" />
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3"
      >
        Gerelateerde producten
      </motion.h2>
      <div className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-8" />

      {/* Mobile: draggable carousel */}
      <div className="sm:hidden relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#050810] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#050810] to-transparent z-10 pointer-events-none" />
        <motion.div
          ref={carouselRef}
          className="flex gap-4 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ right: 0, left: -Math.max(0, carouselWidth) }}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        >
          {products.map((product) => (
            <motion.div key={product.sku} className="min-w-[260px] flex-shrink-0">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.sku}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
