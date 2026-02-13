'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getProductBySku, Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';

export default function RecentlyViewed({ currentSku }: { currentSku: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('gameshop-recent') || '[]');
      const skus = stored.filter((s) => s !== currentSku).slice(0, 8);
      if (skus.length === 0) return;

      const found = skus
        .map((sku) => getProductBySku(sku))
        .filter((p): p is Product => !!p);
      setProducts(found);
    } catch { /* ignore */ }
  }, [currentSku]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 lg:mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6"
      >
        Eerder bekeken
      </motion.h2>

      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
        {products.map((product, index) => {
          const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
          return (
            <motion.div
              key={product.sku}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 snap-start"
            >
              <Link href={`/shop/${product.sku}`} className="group block w-[160px]">
                <div className={`relative aspect-square rounded-xl overflow-hidden ${product.image ? 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700' : `bg-gradient-to-br ${colors.from} ${colors.to}`} mb-2`}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="160px"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-white/20 text-2xl font-black">
                      {PLATFORM_LABELS[product.platform] || product.platform}
                    </span>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold">
                    {product.platform}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {product.name}
                </h3>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
