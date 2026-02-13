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
      {/* Gradient divider boven de sectie */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-8 lg:mb-12 origin-center"
      />

      {/* Badge pill */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4"
      >
        Vergelijkbaar
      </motion.span>

      {/* Heading met animatie */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight mb-2"
      >
        Gerelateerde producten
      </motion.h2>

      {/* Subtitel */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-sm text-slate-500 mb-4"
      >
        Andere games die je misschien ook leuk vindt
      </motion.p>

      {/* Geanimeerde gradient lijn */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-8 origin-left"
      />

      {/* Mobile: draggable carousel */}
      <div className="sm:hidden relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none" />
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

      {/* Desktop: grid met staggered entrance */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.sku}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: index * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
