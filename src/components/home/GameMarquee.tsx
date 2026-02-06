'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { getAllProducts } from '@/lib/products';

export default function GameMarquee() {
  const products = getAllProducts();
  const row1 = products.slice(0, 20).map((p) => p.name);
  const row2 = products.slice(20, 40).map((p) => p.name);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-5%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-5%', '0%']);

  return (
    <section ref={sectionRef} className="relative bg-white py-10 overflow-hidden">
      {/* Top/bottom fade edges */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10" />
      {/* Left/right fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="space-y-4">
        {/* Row 1 - left to right with parallax */}
        <motion.div className="relative overflow-hidden" style={{ x: x1 }}>
          <div className="flex animate-marquee whitespace-nowrap">
            {[...row1, ...row1].map((name, i) => (
              <span key={i} className="flex items-center flex-shrink-0">
                <span className="mx-3 text-slate-200 text-lg font-bold tracking-tight select-none hover:text-emerald-300 transition-colors duration-300 cursor-default">
                  {name}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/30 flex-shrink-0" />
              </span>
            ))}
          </div>
        </motion.div>
        {/* Row 2 - right to left with parallax */}
        <motion.div className="relative overflow-hidden" style={{ x: x2 }}>
          <div className="flex animate-marquee-reverse whitespace-nowrap">
            {[...row2, ...row2].map((name, i) => (
              <span key={i} className="flex items-center flex-shrink-0">
                <span className="mx-3 text-slate-100 text-lg font-bold tracking-tight select-none hover:text-teal-300 transition-colors duration-300 cursor-default">
                  {name}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300/20 flex-shrink-0" />
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
