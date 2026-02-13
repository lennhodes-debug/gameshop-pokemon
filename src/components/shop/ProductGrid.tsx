'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product, isOnSale, getEffectivePrice } from '@/lib/products';
import { formatPrice, PLATFORM_LABELS, getGameTheme } from '@/lib/utils';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  searchQuery?: string;
  viewMode?: 'grid' | 'list';
}

function ListRow({ product, index }: { product: Product; index: number }) {
  const theme = getGameTheme(product.sku, product.genre);
  const accent = theme?.bg[0] || '#10b981';
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const onSale = isOnSale(product);
  const effectivePrice = getEffectivePrice(product);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.03, 0.15),
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Link
        href={`/shop/${product.sku}`}
        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white hover:bg-white transition-all duration-300 group"
        style={{
          boxShadow: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Thumbnail */}
        <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-white">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={56}
              height={56}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[8px] text-slate-300 font-medium uppercase">
              {platformLabel}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-slate-800 truncate transition-colors duration-300 group-hover:text-slate-900">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: accent }}
            />
            {platformLabel}
            <span className="text-slate-300">&middot;</span>
            {product.condition}
          </p>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          {onSale ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tabular-nums" style={{ color: accent }}>
                {formatPrice(effectivePrice)}
              </span>
              <span className="text-[10px] text-slate-300 line-through tabular-nums">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-900 tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Arrow */}
        <svg
          className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-all duration-300 group-hover:translate-x-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
    </motion.div>
  );
}

export default function ProductGrid({ products, onQuickView, searchQuery, viewMode = 'grid' }: ProductGridProps) {
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

  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        {products.map((product, index) => (
          <ListRow key={product.sku} product={product} index={index} />
        ))}
      </div>
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
