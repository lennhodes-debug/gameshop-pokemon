'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  wrap,
} from 'framer-motion';
import { getAllProducts, Product } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

function VelocityMarqueeRow({
  products,
  baseVelocity = -2,
  size = 'md',
}: {
  products: Product[];
  baseVelocity?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const items = products.filter((p) => p.image);

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], {
    clamp: false,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  const measureWidth = useCallback(() => {
    if (!containerRef.current) return;
    const children = containerRef.current.children;
    const setSize = items.length;
    if (setSize === 0 || children.length < setSize) return;

    let width = 0;
    for (let i = 0; i < setSize; i++) {
      const child = children[i] as HTMLElement;
      width += child.offsetWidth;
    }
    const gap = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
    width += setSize * gap;
    setSingleSetWidth(width);
  }, [items.length, size]);

  useEffect(() => {
    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, [measureWidth]);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    if (singleSetWidth === 0) return;

    const baseSpeed = prefersReducedMotion ? 0.3 : 1;
    let moveBy =
      directionFactor.current * baseVelocity * (delta / 1000) * 50 * baseSpeed;

    if (!prefersReducedMotion) {
      const velocity = velocityFactor.get();
      if (velocity < 0) {
        directionFactor.current = -1;
      } else if (velocity > 0) {
        directionFactor.current = 1;
      }
      moveBy +=
        directionFactor.current * Math.abs(velocity) * (delta / 1000) * 30;
    }

    baseX.set(baseX.get() + moveBy);
  });

  const x = useTransform(baseX, (v) => {
    if (singleSetWidth === 0) return 0;
    return wrap(-singleSetWidth, 0, v);
  });

  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24 rounded-lg',
    md: 'w-28 h-28 sm:w-36 sm:h-36 rounded-xl',
    lg: 'w-36 h-36 sm:w-44 sm:h-44 rounded-2xl',
  };
  const gapClasses = { sm: 'gap-3', md: 'gap-4', lg: 'gap-5' };
  const imgSizes = { sm: 96, md: 144, lg: 176 };

  return (
    <div className="flex overflow-hidden">
      <motion.div
        ref={containerRef}
        className={`flex ${gapClasses[size]} shrink-0`}
        style={{ x }}
      >
        {Array.from({ length: 4 }, (_, copyIndex) =>
          items.map((product) => (
            <Link
              key={`${copyIndex}-${product.sku}`}
              href={`/shop/${product.sku}`}
              className={`relative ${sizeClasses[size]} overflow-hidden shrink-0 border border-white/[0.08] group/card transition-all duration-300 hover:border-emerald-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]`}
            >
              <Image
                src={product.image!}
                alt={product.name}
                width={imgSizes[size]}
                height={imgSizes[size]}
                className="object-contain w-full h-full p-1 transition-transform duration-500 group-hover/card:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                <span className="text-white text-[9px] sm:text-[10px] font-bold leading-tight line-clamp-2 mb-0.5">
                  {product.name}
                </span>
                <span className="text-emerald-400 text-[9px] font-bold">
                  {formatPrice(product.price)}
                </span>
              </div>
            </Link>
          ))
        )}
      </motion.div>
    </div>
  );
}

export default function GameMarquee() {
  const allProducts = getAllProducts().filter((p) => p.image);
  const third = Math.ceil(allProducts.length / 3);
  const row1 = allProducts.slice(0, Math.min(third, 16));
  const row2 = allProducts.slice(third, Math.min(third * 2, third + 16));
  const row3 = allProducts.slice(third * 2, Math.min(allProducts.length, third * 2 + 16));

  return (
    <section className="relative py-16 sm:py-24 bg-[#050810] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

      <div className="relative">
        <div className="text-center mb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Collectie
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Al onze{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                games
              </span>
            </h2>
            <p className="text-sm lg:text-base text-slate-400 max-w-md mx-auto">
              Scroll sneller om de collectie te versnellen
            </p>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#050810] via-[#050810]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#050810] via-[#050810]/80 to-transparent z-10" />

        <div className="mb-3 opacity-40" style={{ filter: 'blur(1px)' }}>
          <VelocityMarqueeRow products={row3} baseVelocity={-3} size="sm" />
        </div>

        <div className="mb-3 opacity-70" style={{ filter: 'blur(0.3px)' }}>
          <VelocityMarqueeRow products={row2} baseVelocity={2} size="md" />
        </div>

        <div>
          <VelocityMarqueeRow products={row1} baseVelocity={-1.5} size="lg" />
        </div>
      </div>
    </section>
  );
}
