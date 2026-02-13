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

function MarqueeRow({
  products,
  baseVelocity = -1.5,
}: {
  products: Product[];
  baseVelocity?: number;
}) {
  const items = products.filter((p) => p.image);

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
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
    width += setSize * 20;
    setSingleSetWidth(width);
  }, [items.length]);

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
        directionFactor.current * Math.abs(velocity) * (delta / 1000) * 20;
    }

    baseX.set(baseX.get() + moveBy);
  });

  const x = useTransform(baseX, (v) => {
    if (singleSetWidth === 0) return 0;
    return wrap(-singleSetWidth, 0, v);
  });

  return (
    <div className="flex overflow-hidden">
      <motion.div
        ref={containerRef}
        className="flex gap-5 shrink-0"
        style={{ x }}
      >
        {Array.from({ length: 4 }, (_, copyIndex) =>
          items.map((product) => (
            <Link
              key={`${copyIndex}-${product.sku}`}
              href={`/shop/${product.sku}`}
              className="relative w-40 h-40 sm:w-52 sm:h-52 shrink-0 rounded-2xl overflow-hidden group/card bg-white/[0.04] transition-all duration-500"
              style={{
                boxShadow: 'none',
              }}
            >
              <Image
                src={product.image!}
                alt={product.name}
                width={208}
                height={208}
                className="object-contain w-full h-full p-4 sm:p-5 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/card:scale-105"
                loading="lazy"
              />
              {/* Subtle name on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                <span className="text-white/80 text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1">
                  {product.name}
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
  const half = Math.ceil(allProducts.length / 2);
  const row1 = allProducts.slice(0, Math.min(half, 18));
  const row2 = allProducts.slice(half, Math.min(allProducts.length, half + 18));

  return (
    <section className="relative py-20 lg:py-28 bg-[#050810] overflow-hidden border-t border-white/[0.06]">
      <div className="relative">
        <div className="text-center mb-12 lg:mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-white/25 text-xs font-medium uppercase tracking-[0.3em] mb-4">
              Collectie
            </p>
            <h2 className="text-3xl lg:text-[52px] font-light text-white tracking-[-0.03em] leading-[1.05]">
              Alle games
            </h2>
          </motion.div>
        </div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#050810] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#050810] to-transparent z-10" />

        <div className="space-y-5">
          <MarqueeRow products={row1} baseVelocity={-1.2} />
          <MarqueeRow products={row2} baseVelocity={1} />
        </div>
      </div>
    </section>
  );
}
