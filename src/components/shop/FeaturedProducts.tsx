'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProducts, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import ProductCard from './ProductCard';
import { Product } from '@/lib/products';

interface FeaturedProductsProps {
  onQuickView?: (product: Product) => void;
}

export default function FeaturedProducts({ onQuickView }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<'deals' | 'new'>('deals');

  const { deals, newest } = useMemo(() => {
    const allProducts = getAllProducts();

    // Best deals - sorted by discount percentage
    const dealsProducts = allProducts
      .filter((p) => isOnSale(p))
      .sort((a, b) => getSalePercentage(b) - getSalePercentage(a))
      .slice(0, 8);

    // Newest - by SKU number (higher = newer)
    const newestProducts = [...allProducts]
      .sort((a, b) => {
        const aNum = parseInt(a.sku.split('-').pop() || '0', 10) || 0;
        const bNum = parseInt(b.sku.split('-').pop() || '0', 10) || 0;
        return bNum - aNum;
      })
      .slice(0, 8);

    return { deals: dealsProducts, newest: newestProducts };
  }, []);

  const displayProducts = activeTab === 'deals' ? deals : newest;
  const hasDeals = deals.length > 0;

  if (!hasDeals && newest.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
          {activeTab === 'deals' ? '🔥 Hete Deals' : '✨ Nieuwste Toevoegingen'}
        </h2>

        {/* Tab selector */}
        <div className="flex gap-2">
          {hasDeals && (
            <motion.button
              onClick={() => setActiveTab('deals')}
              className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'deals'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔥 Deals ({deals.length})
              {activeTab === 'deals' && (
                <motion.div
                  layoutId="featured-tab"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )}

          {newest.length > 0 && (
            <motion.button
              onClick={() => setActiveTab('new')}
              className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'new'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ Nieuw ({newest.length})
              {activeTab === 'new' && (
                <motion.div
                  layoutId="featured-tab"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Product carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {displayProducts.length > 0 ? (
            displayProducts.map((product, index) => (
              <motion.div
                key={product.sku}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <ProductCard product={product} onQuickView={onQuickView} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeTab === 'deals' ? 'Geen aanbiedingen beschikbaar' : 'Geen nieuwe producten'}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"
      />
    </motion.div>
  );
}
