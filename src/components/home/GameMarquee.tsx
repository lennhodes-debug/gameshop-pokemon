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

/**
 * VelocityMarqueeRow
 *
 * Rij van game-thumbnails die continu scrolt met een basesnelheid.
 * De scroll-velocity van de pagina wordt gebruikt om de marquee
 * te versnellen: snel scrollen = snellere marquee.
 *
 * baseVelocity < 0 = naar links, > 0 = naar rechts.
 */
function VelocityMarqueeRow({
  products,
  baseVelocity = -2,
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

  // Breedte van een enkel item-blok (w-28=112px op mobile, w-32=128px op sm+) + 16px gap
  // We gebruiken een ref om de werkelijke breedte van het eerste setje items te meten
  const containerRef = useRef<HTMLDivElement>(null);
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  const measureWidth = useCallback(() => {
    if (!containerRef.current) return;
    // De container bevat 4x items (we meten de eerste set)
    // Elke child is een link element
    const children = containerRef.current.children;
    const setSize = items.length;
    if (setSize === 0 || children.length < setSize) return;

    let width = 0;
    for (let i = 0; i < setSize; i++) {
      const child = children[i] as HTMLElement;
      width += child.offsetWidth;
    }
    // Voeg gaps toe: (setSize) gaps van 16px (gap-4)
    width += setSize * 16;
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

    // Basesnelheid (pixels per frame)
    const baseSpeed = prefersReducedMotion ? 0.3 : 1;
    let moveBy =
      directionFactor.current * baseVelocity * (delta / 1000) * 50 * baseSpeed;

    if (!prefersReducedMotion) {
      // Voeg scroll-velocity gebaseerde versnelling toe
      const velocity = velocityFactor.get();

      // Flip richting als de gebruiker de andere kant op scrollt
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

  // Wrap de x waarde zodat de marquee naadloos herhaalt
  const x = useTransform(baseX, (v) => {
    if (singleSetWidth === 0) return 0;
    return wrap(-singleSetWidth, 0, v);
  });

  // We renderen 4 kopien van de items zodat er altijd genoeg zichtbaar zijn
  // (ook bij brede schermen en snelle scroll)
  return (
    <div className="flex overflow-hidden">
      <motion.div
        ref={containerRef}
        className="flex gap-4 shrink-0"
        style={{ x }}
      >
        {Array.from({ length: 4 }, (_, copyIndex) =>
          items.map((product) => (
            <Link
              key={`${copyIndex}-${product.sku}`}
              href={`/shop/${product.sku}`}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 group/card hover:scale-105 transition-transform duration-300"
            >
              <Image
                src={product.image!}
                alt={product.name}
                width={128}
                height={128}
                className="object-contain w-full h-full p-1"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                {product.name}
              </span>
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
  const row1 = allProducts.slice(0, half);
  const row2 = allProducts.slice(half);

  return (
    <section className="relative py-16 sm:py-20 bg-[#050810] overflow-hidden">
      {/* Achtergrond */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

      <div className="relative">
        {/* Titel */}
        <div className="text-center mb-10 px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Ontdek ons{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              assortiment
            </span>
          </h2>
          <p className="text-sm text-white/40">Alle games in onze collectie</p>
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#050810] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#050810] to-transparent z-10" />

        {/* Rij 1: naar links (negatieve velocity) */}
        <div className="mb-4">
          <VelocityMarqueeRow products={row1} baseVelocity={-2} />
        </div>

        {/* Rij 2: naar rechts (positieve velocity) */}
        <div>
          <VelocityMarqueeRow products={row2} baseVelocity={1.5} />
        </div>
      </div>
    </section>
  );
}
