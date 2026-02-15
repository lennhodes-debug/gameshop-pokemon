'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/products';
import PremiumProductCard from './PremiumProductCard';

interface OptimizedProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function OptimizedProductGrid({
  products,
  onQuickView,
  isLoading = false,
}: OptimizedProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="aspect-square rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
          No products found
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
    >
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.sku}
            variants={itemVariants}
            layout
          >
            <PremiumProductCard
              product={product}
              onQuickView={onQuickView}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
