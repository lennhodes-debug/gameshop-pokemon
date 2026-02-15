'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getFeaturedProducts, Product, isOnSale, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS } from '@/lib/utils';

interface PremiumFeaturedSectionProps {
  onQuickView?: (product: Product) => void;
}

export default function PremiumFeaturedSection({ onQuickView }: PremiumFeaturedSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const products = useMemo(() => getFeaturedProducts(), []);

  // Animation variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.08,
      },
    }),
  };

  const badgeVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: 'spring' as const, stiffness: 150, damping: 12 },
    },
  } as any;

  const hoverVariants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -8 },
  };

  const getProductColor = (product: Product): { from: string; to: string } => {
    return PLATFORM_COLORS[product.platform] || { from: 'from-emerald-500', to: 'to-teal-500' };
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative mb-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Background gradient decoration */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/5 to-cyan-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Section header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
            ✨ Premium Selectie
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
            Onze meest exclusieve en gewilde Nintendo games en consoles
          </p>
          <motion.div
            className="h-1 w-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
        </motion.div>
      </div>

      {/* Product grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-5"
      >
        {products.map((product, index) => {
          const isHovered = hoveredIndex === index;
          const onSale = isOnSale(product);
          const effectivePrice = getEffectivePrice(product);
          const discount = onSale
            ? Math.round(((product.price - effectivePrice) / product.price) * 100)
            : 0;
          const colorData = getProductColor(product);

          return (
            <motion.div
              key={product.sku}
              custom={index}
              variants={itemVariants}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link href={`/shop/${product.sku}`}>
                <motion.div
                  variants={hoverVariants}
                  initial="initial"
                  animate={isHovered ? 'hover' : 'initial'}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="group relative h-full rounded-3xl overflow-hidden cursor-pointer"
                >
                  {/* Gradient border effect */}
                  <div
                    className={`absolute inset-0 rounded-3xl p-px bg-gradient-to-br ${colorData.from} ${colorData.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                  />

                  {/* Glass morphism card background */}
                  <div className="relative h-full rounded-3xl bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
                    {/* Animated glow on hover */}
                    <motion.div
                      className="absolute -inset-20 rounded-3xl opacity-0 group-hover:opacity-40 blur-3xl transition-opacity duration-500 -z-10"
                      style={{
                        background: `linear-gradient(135deg, rgb(16, 185, 129), rgb(13, 148, 136))`,
                      }}
                      animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Content wrapper */}
                    <div className="relative flex flex-col h-full">
                      {/* Image container with aspect ratio */}
                      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex-shrink-0">
                        {/* Image */}
                        {product.image ? (
                          <motion.div
                            className="relative w-full h-full"
                            animate={isHovered ? { scale: 1.12 } : { scale: 1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-4"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              priority={index < 2}
                            />
                          </motion.div>
                        ) : (
                          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${colorData.from} ${colorData.to}`}>
                            <span className="text-white/60 font-bold text-sm">No Image</span>
                          </div>
                        )}

                        {/* Platform badge with glassmorphism */}
                        <motion.div
                          className="absolute top-3 left-3 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 shadow-lg"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
                        >
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                            {product.platform}
                          </span>
                        </motion.div>

                        {/* Discount badge */}
                        {onSale && (
                          <motion.div
                            variants={badgeVariants}
                            initial="hidden"
                            animate="visible"
                            className={`absolute top-3 right-3 px-4 py-2 rounded-xl font-bold text-white text-sm shadow-xl bg-gradient-to-br from-red-500 to-orange-600`}
                          >
                            -{discount}%
                          </motion.div>
                        )}

                        {/* Premium badge */}
                        {product.isPremium && (
                          <motion.div
                            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-xs shadow-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.08 }}
                          >
                            ⭐ Premium
                          </motion.div>
                        )}

                        {/* Quick view button */}
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            onQuickView?.(product);
                          }}
                          className="absolute bottom-3 left-3 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg transition-all"
                          initial={{ opacity: 0, y: 10 }}
                          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          👁️ Quick View
                        </motion.button>
                      </div>

                      {/* Content section */}
                      <div className="flex flex-col flex-grow p-5 space-y-3">
                        {/* Title */}
                        <motion.h3
                          className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300"
                          animate={isHovered ? { y: -2 } : { y: 0 }}
                        >
                          {product.name}
                        </motion.h3>

                        {/* Metadata tags */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 backdrop-blur-sm">
                            {product.genre}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                            {product.completeness.split('(')[0].trim()}
                          </span>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Price section with separator */}
                        <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-3 space-y-2">
                          {onSale ? (
                            <motion.div className="space-y-1">
                              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Actieprijs
                              </p>
                              <div className="flex items-baseline gap-2">
                                <motion.p
                                  className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
                                  animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  {formatPrice(effectivePrice)}
                                </motion.p>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 line-through">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.p
                              className="text-3xl font-black text-slate-900 dark:text-white"
                              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            >
                              {formatPrice(product.price)}
                            </motion.p>
                          )}

                          {/* CTA button */}
                          <motion.button
                            className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 dark:hover:shadow-emerald-500/20 transform hover:scale-105"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            In winkelwagen
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Zie meer exclusieve producten in onze volledige shop
        </p>
        <Link href="/shop">
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Volledige Shop Verkennen
            <span className="text-lg">→</span>
          </motion.button>
        </Link>
      </motion.div>
    </motion.section>
  );
}
