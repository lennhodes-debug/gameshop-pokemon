'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getAllProducts, getAllPlatforms, getAllGenres, getAllConditions } from '@/lib/products';
import SearchBar from '@/components/shop/SearchBar';
import Filters from '@/components/shop/Filters';
import ProductGrid from '@/components/shop/ProductGrid';

const ITEMS_PER_PAGE = 24;

function ShopContent() {
  const searchParams = useSearchParams();
  const initialPlatform = searchParams.get('platform') || '';
  const headerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState(initialPlatform);
  const [genre, setGenre] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [completeness, setCompleteness] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [page, setPage] = useState(1);

  const allProducts = getAllProducts();
  const platforms = getAllPlatforms().map((p) => p.name);
  const genres = getAllGenres();
  const conditions = getAllConditions();

  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ['start start', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    setPage(1);
  }, [search, platform, genre, condition, category, completeness, sortBy]);

  const filtered = useMemo(() => {
    let results = [...allProducts];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          p.genre.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (platform) {
      if (platform === 'Game Boy (alle)') {
        results = results.filter((p) => p.platform.startsWith('Game Boy'));
      } else {
        results = results.filter((p) => p.platform === platform);
      }
    }
    if (genre) results = results.filter((p) => p.genre === genre);
    if (condition) results = results.filter((p) => p.condition === condition);

    if (category === 'games') results = results.filter((p) => !p.isConsole);
    if (category === 'consoles') results = results.filter((p) => p.isConsole);

    if (completeness === 'cib') results = results.filter((p) => p.completeness.toLowerCase().includes('compleet'));
    if (completeness === 'los') results = results.filter((p) => p.completeness.toLowerCase().includes('los'));

    results.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'newest': {
          const numA = parseInt(a.sku.replace(/^[A-Za-z]+-/, ''), 10) || 0;
          const numB = parseInt(b.sku.replace(/^[A-Za-z]+-/, ''), 10) || 0;
          return numB - numA;
        }
        default: return a.name.localeCompare(b.name);
      }
    });

    return results;
  }, [allProducts, search, platform, genre, condition, category, completeness, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilterCount = [platform, genre, condition, category, completeness].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setPlatform('');
    setGenre('');
    setCondition('');
    setCategory('');
    setCompleteness('');
    setSortBy('name-asc');
  };

  return (
    <div className="pt-16 lg:pt-20">
      {/* Animated hero header */}
      <div ref={headerRef} className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />
          {/* Floating grid pattern */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Floating orbs */}
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 10, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 right-[20%] w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px]"
          />
          <motion.div
            animate={{
              x: [0, -40, 20, 0],
              y: [0, 30, -15, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 left-[10%] w-48 h-48 rounded-full bg-cyan-500/10 blur-[60px]"
          />
        </div>

        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {allProducts.length} producten beschikbaar
            </motion.span>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-3">
              Onze{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Collectie
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Ontdek ons volledige assortiment van originele Nintendo games en consoles
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            resultCount={search ? filtered.length : undefined}
            className="mb-8"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Filters
            platforms={platforms}
            genres={genres}
            conditions={conditions}
            selectedPlatform={platform}
            selectedGenre={genre}
            selectedCondition={condition}
            selectedCategory={category}
            selectedCompleteness={completeness}
            sortBy={sortBy}
            onPlatformChange={setPlatform}
            onGenreChange={setGenre}
            onConditionChange={setCondition}
            onCategoryChange={setCategory}
            onCompletenessChange={setCompleteness}
            onSortChange={setSortBy}
          />
        </motion.div>

        {/* Active filters strip */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-3 overflow-hidden"
            >
              <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
                <span className="font-semibold text-emerald-600">{filtered.length}</span> resultaten
              </span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Filters wissen
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products */}
        <div className="mt-8">
          <ProductGrid products={paginatedProducts} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-14 flex flex-col items-center gap-4"
          >
            {/* Page info */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pagina <span className="font-semibold text-slate-700 dark:text-slate-200">{page}</span> van <span className="font-semibold text-slate-700 dark:text-slate-200">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </motion.button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1.5 text-slate-300 dark:text-slate-600 text-sm">...</span>
                      )}
                      <motion.button
                        onClick={() => setPage(p)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`h-10 w-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                          p === page
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </motion.button>
                    </span>
                  ))}
              </div>

              <motion.button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 lg:pt-20">
        <div className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-32 rounded bg-white/10 animate-pulse mb-4" />
            <div className="h-12 w-64 rounded bg-white/10 animate-pulse mb-3" />
            <div className="h-6 w-96 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
