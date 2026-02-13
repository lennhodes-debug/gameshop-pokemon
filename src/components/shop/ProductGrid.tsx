'use client';

import { motion } from 'framer-motion';
import { Product } from '@/lib/products';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  searchQuery?: string;
}

export default function ProductGrid({ products, onQuickView, searchQuery }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6"
        >
          <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Geen producten gevonden</h3>
        <p className="text-slate-500 text-sm">Probeer andere filters of zoektermen</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.sku}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{
            duration: 0.6,
            delay: Math.min((index % 4) * 0.06, 0.24),
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <ProductCard product={product} onQuickView={onQuickView} searchQuery={searchQuery} />
        </motion.div>
      ))}
    </div>
  );
}
