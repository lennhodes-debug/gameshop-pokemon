'use client';

import { motion } from 'framer-motion';

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
      />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-6 w-1/4 rounded bg-slate-200 dark:bg-slate-700 mt-4"
        />
      </div>
    </div>
  );
}

// Filter Skeleton
export function FilterSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-700"
      />

      {/* Items */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"
        />
      ))}
    </div>
  );
}

// Header Skeleton
export function HeaderSkeleton() {
  return (
    <div className="space-y-4 mb-8">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-12 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-700"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        className="h-6 w-1/2 rounded bg-slate-200 dark:bg-slate-700"
      />
    </div>
  );
}

// Grid of product skeletons
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <ProductCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}
