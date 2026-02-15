'use client';

import { useRef, useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { getFeaturedProducts, getAllProducts, Product } from '@/lib/products';
import { formatPrice, getGameTheme, PLATFORM_LABELS, cn } from '@/lib/utils';

/* ─── BentoCard: 3D tilt + parallax image + themed glow ─── */
function BentoCard({
  product,
  index,
  isHero = false,
}: {
  product: Product;
  index: number;
  isHero?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Normalized mouse position (0-1) within the card
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  // 3D tilt via spring-driven rotation
  const cfg = { stiffness: 200, damping: 25 };
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), cfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), cfg);

  // Parallax shift for the product image (moves opposite to mouse)
  const imgX = useSpring(useTransform(mx, [0, 1], [14, -14]), cfg);
  const imgY = useSpring(useTransform(my, [0, 1], [14, -14]), cfg);

  const theme = getGameTheme(product.sku, product.genre);
  const glowRgb = theme?.glow || '16,185,129';
  const accent = theme?.bg[0] || '#10b981';

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width);
      my.set((e.clientY - rect.top) / rect.height);
    },
    [mx, my],
  );

  const handleLeave = useCallback(() => {
    setHovered(false);
    mx.set(0.5);
    my.set(0.5);
  }, [mx, my]);

  return (
    <motion.div
      ref={cardRef}
      className={cn('relative', isHero && 'sm:col-span-2 sm:row-span-2')}
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 15,
        delay: index * 0.1,
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{ perspective: 1000 }}
    >
      <Link href={`/shop/${product.sku}`} className="block h-full">
        <motion.div
          className="relative h-full rounded-2xl overflow-hidden"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: hovered
              ? `0 25px 60px -12px rgba(${glowRgb},0.2), 0 8px 24px -4px rgba(0,0,0,0.06)`
              : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
            transition: 'box-shadow 0.5s ease, border-color 0.5s ease',
            background: 'white',
            borderColor: hovered ? 'transparent' : undefined,
          }}
        >
          {/* Image area */}
          <div
            className={cn(
              'relative overflow-hidden',
              isHero ? 'h-full' : 'h-[240px] sm:h-[260px] lg:h-[280px]',
            )}
            style={{ background: '#fafbfc' }}
          >
            {product.image ? (
              <motion.div className="absolute inset-0" style={{ x: imgX, y: imgY }}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes={
                    isHero ? '(max-width: 640px) 100vw, 50vw' : '(max-width: 640px) 80vw, 25vw'
                  }
                  className={cn(
                    'object-contain transition-transform duration-700 ease-out',
                    isHero ? 'p-8 lg:p-14' : 'p-5 lg:p-6',
                    hovered ? 'scale-[1.08]' : 'scale-100',
                  )}
                  style={{
                    filter: hovered
                      ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.1))'
                      : 'drop-shadow(0 4px 12px rgba(0,0,0,0.06))',
                    transition: 'filter 0.5s ease',
                  }}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <span className="text-slate-400 font-medium text-lg">
                  {PLATFORM_LABELS[product.platform] || product.platform}
                </span>
              </div>
            )}

            {/* Soft vignette edges to eliminate harsh image borders */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 30px rgba(250,251,252,0.6)',
              }}
            />

            {/* Themed radial glow on hover */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{
                background: `radial-gradient(ellipse at 50% 70%, rgba(${glowRgb},0.07), transparent 70%)`,
                opacity: hovered ? 1 : 0,
              }}
            />
          </div>

          {/* Platform badge */}
          <div className="absolute top-3 left-3 z-20">
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.8)',
                color: '#94a3b8',
              }}
            >
              {PLATFORM_LABELS[product.platform] || product.platform}
            </span>
          </div>

          {/* Premium / Console badge */}
          {(product.isPremium || product.isConsole) && (
            <div className="absolute top-3 right-3 z-20">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-medium',
                  product.isPremium ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600',
                )}
              >
                {product.isPremium ? 'Premium' : 'Console'}
              </span>
            </div>
          )}

          {/* Info panel — fades up on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 transition-all duration-500"
            style={{
              background: hovered
                ? 'linear-gradient(to top, rgba(255,255,255,0.97), rgba(255,255,255,0.9) 70%, transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.85), rgba(255,255,255,0.3) 50%, transparent)',
              backdropFilter: hovered ? 'blur(12px)' : 'none',
            }}
          >
            <div className={cn('p-4', isHero && 'lg:p-6')}>
              <h3
                className={cn(
                  'font-medium leading-tight mb-1.5 line-clamp-2 transition-colors duration-300',
                  isHero ? 'text-base lg:text-xl' : 'text-sm',
                )}
                style={{ color: hovered ? accent : '#0f172a' }}
              >
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-semibold tracking-tight',
                    isHero ? 'text-xl lg:text-2xl' : 'text-lg',
                  )}
                  style={{ color: accent }}
                >
                  {formatPrice(product.price)}
                </span>
                <span
                  className={cn(
                    'font-medium transition-all duration-300',
                    isHero ? 'text-xs' : 'text-[10px]',
                    'text-slate-400',
                    hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2',
                  )}
                >
                  {product.condition}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─── Browse CTA Card ─── */
function BrowseCard({ productCount }: { productCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.5 }}
    >
      <Link href="/shop" className="block h-full">
        <div className="relative h-full min-h-[240px] sm:min-h-[260px] lg:min-h-[280px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 flex flex-col justify-between group hover:shadow-xl hover:shadow-emerald-500/15 transition-all duration-500">
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%">
              <filter id="bento-noise">
                <feTurbulence baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              </filter>
              <rect width="100%" height="100%" filter="url(#bento-noise)" />
            </svg>
          </div>

          <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-[0.2em] mb-3">
              Collectie
            </p>
            <h3 className="text-white text-2xl lg:text-3xl font-semibold leading-[1.1]">
              Bekijk alle
              <br />
              {productCount} producten
            </h3>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-white font-medium text-sm">
            Ontdek meer
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function FeaturedProducts() {
  const products = useMemo(() => getFeaturedProducts(), []);
  const totalProducts = useMemo(() => getAllProducts().length, []);

  // Section-level cursor spotlight
  const sMx = useMotionValue(0);
  const sMy = useMotionValue(0);
  const sectionSpotlight = useMotionTemplate`radial-gradient(800px circle at ${sMx}px ${sMy}px, rgba(16,185,129,0.025), transparent 70%)`;

  const handleSectionMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      sMx.set(e.clientX - rect.left);
      sMy.set(e.clientY - rect.top);
    },
    [sMx, sMy],
  );

  // Hero (2×2) + 3 side cards + 1 CTA = fills a 4-col × 2-row grid perfectly
  const heroProduct = products[0];
  const sideProducts = products.slice(1, 4);

  return (
    <section
      className="relative bg-white py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden"
      onMouseMove={handleSectionMove}
    >
      {/* Cursor spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: sectionSpotlight }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
        {/* Header — gestaffelde elementen */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-8 mb-10 sm:mb-14 md:mb-16 lg:mb-20">
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-400 text-[11px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4"
            >
              Uitgelicht
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-light text-slate-900 tracking-[-0.02em] md:tracking-[-0.03em] leading-[1.1]"
            >
              Toppers uit de collectie
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-400 mt-3 text-xs sm:text-sm max-w-md font-normal"
            >
              Handgeselecteerde games &mdash; elk exemplaar persoonlijk getest
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-500 transition-colors group"
            >
              Alles bekijken
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* ── Mobile: horizontal snap-scroll carousel ── */}
        <div
          className="flex gap-3 sm:hidden overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {products.map((p, i) => (
            <div key={p.sku} className="min-w-[280px] snap-start flex-shrink-0">
              <BentoCard product={p} index={i} />
            </div>
          ))}
        </div>

        {/* ── Desktop: Bento grid (hero 2×2 + 3 cards + CTA) ── */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {heroProduct && <BentoCard product={heroProduct} index={0} isHero />}
          {sideProducts.map((p, i) => (
            <BentoCard key={p.sku} product={p} index={i + 1} />
          ))}
          <BrowseCard productCount={totalProducts} />
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="sm:hidden mt-8 text-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 w-full"
          >
            Bekijk alle producten
          </Link>
        </motion.div>
      </div>

      {/* Gradient transitie naar donkere sectie */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#050810] pointer-events-none" />
    </section>
  );
}
