'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { getAllProducts } from '@/lib/products';

export default function GameMarquee() {
  const products = getAllProducts();
  const productsWithImages = products.filter(p => p.image);
  const row1 = productsWithImages.slice(0, 15);
  const row2 = productsWithImages.slice(15, 30);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-5%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-5%', '0%']);

  return (
    <section ref={sectionRef} className="relative bg-white py-8 overflow-hidden">
      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-40 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute top-0 bottom-0 right-0 w-40 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="space-y-4">
        {/* Row 1 - cover art cards scrolling left */}
        <motion.div className="relative overflow-hidden" style={{ x: x1 }}>
          <div className="flex animate-marquee whitespace-nowrap gap-4">
            {[...row1, ...row1].map((product, i) => (
              <div
                key={`${product.sku}-${i}`}
                className="flex-shrink-0 group relative w-20 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 2 - cover art cards scrolling right */}
        <motion.div className="relative overflow-hidden" style={{ x: x2 }}>
          <div className="flex animate-marquee-reverse whitespace-nowrap gap-4">
            {[...row2, ...row2].map((product, i) => (
              <div
                key={`${product.sku}-${i}`}
                className="flex-shrink-0 group relative w-20 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
