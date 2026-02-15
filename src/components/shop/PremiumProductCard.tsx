'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, isOnSale, getEffectivePrice } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function PremiumProductCard({ product, onQuickView }: PremiumProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const onSale = isOnSale(product);
  const effectivePrice = getEffectivePrice(product);
  const discount = onSale ? Math.round(((product.price - effectivePrice) / product.price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/shop/${product.sku}`}>
        <div className="relative h-full rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/20">

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
            {/* Image */}
            {product.image ? (
              <>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className={`object-contain p-4 transition-transform duration-500 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 animate-pulse" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                <span className="text-white/60 font-bold text-sm">No Image</span>
              </div>
            )}

            {/* Platform badge */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-white dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {product.platform}
              </span>
            </div>

            {/* Discount badge */}
            {onSale && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm shadow-lg"
              >
                -{discount}%
              </motion.div>
            )}

            {/* Quick view button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.preventDefault();
                onQuickView?.(product);
              }}
              className="absolute bottom-3 right-3 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg"
            >
              👁️ Quick View
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col h-[calc(100%-256px)]">

            {/* Title */}
            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {product.name}
            </h3>

            {/* Metadata */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {product.genre}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {product.completeness}
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              {onSale ? (
                <div className="flex items-center gap-2 justify-between">
                  <div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(effectivePrice)}
                    </p>
                    <p className="text-xs text-slate-400 line-through">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    SALE
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
