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
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8"
      >
        Gerelateerde producten
      </motion.h2>

      {/* Mobile: draggable carousel */}
      <motion.div
        ref={carouselRef}
        className="flex gap-4 sm:hidden cursor-grab active:cursor-grabbing overflow-hidden"
        drag="x"
        dragConstraints={{ right: 0, left: -carouselWidth }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      >
        {products.map((product) => (
          <motion.div key={product.sku} className="min-w-[260px] flex-shrink-0">
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

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
