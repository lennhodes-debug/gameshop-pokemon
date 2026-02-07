'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getAllProducts } from '@/lib/products';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const products = getAllProducts().filter(p => p.image);
  const showcaseProducts = products.slice(0, 6);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const cardsY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden bg-[#030608]">
      {/* Gradient orbs - subtle */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40" style={{ y, opacity }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            {/* Trust badge */}
            <motion.div variants={fadeUp} className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-slate-400 text-xs font-medium">1386+ tevreden klanten</span>
                <span className="text-xs text-slate-600">|</span>
                <span className="text-emerald-400 text-xs font-semibold">5.0</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-2.5 w-2.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              De Nintendo{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                specialist
              </span>{' '}
              van Nederland
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base lg:text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
              Originele games & consoles, persoonlijk getest op werking. Van klassieke retro tot de nieuwste Switch titels.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Bekijk alle producten
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/over-ons"
                className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-white/[0.12] text-white text-sm font-semibold hover:bg-white/[0.05] transition-colors"
              >
                Over Gameshop Enter
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="flex gap-8 mt-12 pt-8 border-t border-white/[0.06]">
              {[
                { value: '346+', label: 'Producten' },
                { value: '12', label: 'Platforms' },
                { value: '100%', label: 'Origineel' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Floating product cards */}
          <motion.div
            className="relative hidden lg:block h-[480px]"
            style={{ y: cardsY }}
          >
            {showcaseProducts.map((product, i) => {
              const positions = [
                { top: '0%', left: '10%', rotate: -3, delay: 0.1 },
                { top: '5%', left: '55%', rotate: 2, delay: 0.2 },
                { top: '35%', left: '0%', rotate: 1, delay: 0.3 },
                { top: '38%', left: '48%', rotate: -2, delay: 0.4 },
                { top: '65%', left: '15%', rotate: 3, delay: 0.5 },
                { top: '62%', left: '58%', rotate: -1, delay: 0.6 },
              ];
              const pos = positions[i];

              return (
                <motion.div
                  key={product.sku}
                  className="absolute w-[180px]"
                  style={{ top: pos.top, left: pos.left }}
                  initial={{ opacity: 0, y: 40, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: pos.rotate }}
                  transition={{ duration: 0.8, delay: pos.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -8, rotate: 0, scale: 1.05, transition: { duration: 0.3 } }}
                >
                  <Link href={`/shop/${product.sku}`} className="block">
                    <div className="relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-3 hover:border-emerald-500/20 hover:bg-white/[0.06] transition-all duration-300">
                      <div className="relative h-32 rounded-xl overflow-hidden bg-white/[0.03] mb-2">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="180px"
                            className="object-contain p-2"
                          />
                        )}
                      </div>
                      <p className="text-white text-xs font-medium truncate">{product.name}</p>
                      <p className="text-emerald-400 text-xs font-bold mt-0.5">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(product.price)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
