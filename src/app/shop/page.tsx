'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getAllProducts, getAllPlatforms, getAllGenres, getAllConditions, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice, FREE_SHIPPING_THRESHOLD, PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';
import SearchBar from '@/components/shop/SearchBar';
import Filters from '@/components/shop/Filters';
import ProductGrid from '@/components/shop/ProductGrid';
import QuickView from '@/components/shop/QuickView';
import Image from 'next/image';
import { Product } from '@/lib/products';

const ITEMS_PER_PAGE = 24;

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [completeness, setCompleteness] = useState(searchParams.get('completeness') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name-asc');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const { getTotal, getItemCount } = useCart();
  const cartTotal = getTotal();
  const cartCount = getItemCount();
  const freeShippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

  // Debounce zoekfunctie
  useEffect(() => {
    if (search !== debouncedSearch) setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync filters naar URL (gedebounced om excessive history entries te voorkomen)
  const urlSyncTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(urlSyncTimer.current);
    urlSyncTimer.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (platform) params.set('platform', platform);
      if (genre) params.set('genre', genre);
      if (condition) params.set('condition', condition);
      if (category) params.set('category', category);
      if (completeness) params.set('completeness', completeness);
      if (priceMin) params.set('priceMin', priceMin);
      if (priceMax) params.set('priceMax', priceMax);
      if (sortBy && sortBy !== 'name-asc') params.set('sort', sortBy);
      if (page > 1) params.set('page', String(page));
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    }, 150);
    return () => clearTimeout(urlSyncTimer.current);
  }, [debouncedSearch, platform, genre, condition, category, completeness, priceMin, priceMax, sortBy, page, router, pathname]);

  const allProducts = useMemo(() => getAllProducts(), []);
  const platforms = useMemo(() => getAllPlatforms().map((p) => p.name), []);
  const genres = useMemo(() => getAllGenres(), []);
  const conditions = useMemo(() => getAllConditions(), []);

  // Eerder bekeken producten laden
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('gameshop-recent') || '[]');
      if (stored.length === 0) return;
      const found = stored.slice(0, 6).map(sku => allProducts.find(p => p.sku === sku)).filter((p): p is Product => !!p);
      setRecentlyViewed(found);
    } catch { /* ignore */ }
  }, [allProducts]);

  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ['start start', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, platform, genre, condition, category, completeness, priceMin, priceMax, sortBy]);

  const filtered = useMemo(() => {
    let results = [...allProducts];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
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
    if (category === 'sale') results = results.filter((p) => isOnSale(p));

    if (completeness === 'cib') results = results.filter((p) => p.completeness.toLowerCase().includes('compleet'));
    if (completeness === 'los') results = results.filter((p) => p.completeness.toLowerCase().includes('los'));

    if (priceMin) results = results.filter((p) => p.price >= Number(priceMin));
    if (priceMax) results = results.filter((p) => p.price <= Number(priceMax));

    if (sortBy === 'newest') {
      const skuNum = new Map<string, number>();
      for (const p of results) {
        skuNum.set(p.sku, parseInt(p.sku.replace(/^[A-Za-z0-9]+-/, ''), 10) || 0);
      }
      results.sort((a, b) => skuNum.get(b.sku)! - skuNum.get(a.sku)!);
    } else if (sortBy === 'discount-desc') {
      results.sort((a, b) => getSalePercentage(b) - getSalePercentage(a));
    } else {
      results.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc': return getEffectivePrice(a) - getEffectivePrice(b);
          case 'price-desc': return getEffectivePrice(b) - getEffectivePrice(a);
          case 'name-desc': return b.name.localeCompare(a.name);
          default: return a.name.localeCompare(b.name);
        }
      });
    }

    return results;
  }, [allProducts, debouncedSearch, platform, genre, condition, category, completeness, priceMin, priceMax, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilterCount = [platform, genre, condition, category, completeness, priceMin, priceMax].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setPlatform('');
    setGenre('');
    setCondition('');
    setCategory('');
    setCompleteness('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('name-asc');
    setPage(1);
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
        {/* Gratis verzending progressiebalk */}
        <AnimatePresence>
          {cartCount > 0 && cartTotal < FREE_SHIPPING_THRESHOLD && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    Nog {formatPrice(remainingForFreeShipping)} voor gratis verzending
                  </span>
                  <Link href="/winkelwagen" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                    Bekijk wagen
                  </Link>
                </div>
                <div className="h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            resultCount={debouncedSearch ? filtered.length : undefined}
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

          {/* Prijs range filter */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex-shrink-0">Prijs</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">&euro;</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  aria-label="Minimum prijs"
                  className="w-24 pl-7 pr-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="text-slate-300 dark:text-slate-600">—</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">&euro;</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  aria-label="Maximum prijs"
                  className="w-24 pl-7 pr-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active filters strip met chips */}
        <AnimatePresence>
          {(activeFilterCount > 0 || debouncedSearch) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap items-center gap-2 overflow-hidden"
            >
              <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 mr-1" role="status" aria-live="polite">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filtered.length}</span> resultaten
              </span>

              {([
                { active: !!debouncedSearch, label: `\u201C${debouncedSearch}\u201D`, cls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30', onClear: () => setSearch('') },
                { active: !!platform, label: platform, cls: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30', onClear: () => setPlatform('') },
                { active: !!genre, label: genre, cls: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30', onClear: () => setGenre('') },
                { active: !!condition, label: condition, cls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30', onClear: () => setCondition('') },
                { active: !!category, label: category === 'games' ? 'Games' : category === 'consoles' ? 'Consoles' : category === 'sale' ? 'Aanbiedingen' : category, cls: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30', onClear: () => setCategory('') },
                { active: !!completeness, label: completeness === 'cib' ? 'Compleet (CIB)' : 'Los', cls: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30', onClear: () => setCompleteness('') },
                { active: !!(priceMin || priceMax), label: priceMin && priceMax ? `€${priceMin} – €${priceMax}` : priceMin ? `Vanaf €${priceMin}` : `Tot €${priceMax}`, cls: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30', onClear: () => { setPriceMin(''); setPriceMax(''); } },
              ] as const).filter((c) => c.active).map((chip, i) => (
                <button key={i} onClick={chip.onClear} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${chip.cls}`}>
                  {chip.label}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              ))}

              {activeFilterCount > 1 && (
                <>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
                  >
                    Alles wissen
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products */}
        <div id="shop-grid" className="mt-8 scroll-mt-24">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-700 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                      <div className="h-5 w-1/3 rounded bg-slate-100 dark:bg-slate-700 animate-pulse mt-3" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-20 w-20 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6"
                >
                  <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Geen producten gevonden</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                  {debouncedSearch
                    ? `Geen resultaten voor "${debouncedSearch}". Probeer een andere zoekterm.`
                    : 'Pas je filters aan om producten te vinden.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all mb-10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Filters wissen
                </button>

                {/* Suggesties per platform */}
                <div className="max-w-lg mx-auto">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Populaire platforms</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {platforms.slice(0, 6).map((p) => (
                      <button
                        key={p}
                        onClick={() => { clearFilters(); setPlatform(p); }}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 font-medium hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${page}-${platform}-${genre}-${condition}-${category}-${completeness}-${sortBy}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <ProductGrid products={paginatedProducts} onQuickView={setQuickViewProduct} searchQuery={debouncedSearch || undefined} />
              </motion.div>
            )}
          </AnimatePresence>
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
                onClick={() => { setPage(Math.max(1, page - 1)); document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                disabled={page === 1}
                aria-label="Vorige pagina"
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
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= (typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2))
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-0.5 sm:px-1.5 text-slate-300 dark:text-slate-600 text-sm">...</span>
                      )}
                      <motion.button
                        onClick={() => { setPage(p); document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-sm font-bold transition-all duration-300 ${
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
                onClick={() => { setPage(Math.min(totalPages, page + 1)); document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                disabled={page === totalPages}
                aria-label="Volgende pagina"
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

      {/* Eerder bekeken */}
      {recentlyViewed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        >
          <div className="flex items-center gap-3 mb-5">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Eerder bekeken</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentlyViewed.map((product) => {
              const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
              return (
                <Link key={product.sku} href={`/shop/${product.sku}`} className="group">
                  <div className={`aspect-square rounded-xl overflow-hidden mb-2 ${product.image ? 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700' : `bg-gradient-to-br ${colors.from} ${colors.to}`} transition-all duration-300 group-hover:border-emerald-200 dark:group-hover:border-emerald-800 group-hover:shadow-md`}>
                    {product.image ? (
                      <Image src={product.image} alt={product.name} width={200} height={200} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-bold">
                        {PLATFORM_LABELS[product.platform] || product.platform}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{product.name}</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{formatPrice(getEffectivePrice(product))}</p>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick View Modal */}
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
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
