'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getAllProducts, getAllPlatforms, getAllGenres, getAllConditions, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import SearchBar from '@/components/shop/SearchBar';
import Filters from '@/components/shop/Filters';
import ProductGrid from '@/components/shop/ProductGrid';
import QuickView from '@/components/shop/QuickView';
import { Product } from '@/lib/products';

const ITEMS_PER_PAGE = 48;

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
  }, [search, debouncedSearch]);

  // Sync filters naar URL
  useEffect(() => {
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
  }, [debouncedSearch, platform, genre, condition, category, completeness, priceMin, priceMax, sortBy, page, router, pathname]);

  const allProducts = useMemo(() => getAllProducts(), []);
  const platforms = useMemo(() => getAllPlatforms().map((p) => p.name), []);
  const genres = useMemo(() => getAllGenres(), []);
  const conditions = useMemo(() => getAllConditions(), []);
  const hasConsoles = useMemo(() => allProducts.some((p) => p.isConsole), [allProducts]);
  const hasSaleItems = useMemo(() => allProducts.some((p) => isOnSale(p)), [allProducts]);

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
      const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const q = normalize(debouncedSearch);
      results = results.filter(
        (p) =>
          normalize(p.name).includes(q) ||
          normalize(p.platform).includes(q) ||
          normalize(p.genre).includes(q) ||
          normalize(p.description).includes(q) ||
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
      results.sort((a, b) => (skuNum.get(b.sku) ?? 0) - (skuNum.get(a.sku) ?? 0));
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
      {/* Cinematic hero header */}
      <div ref={headerRef} className="relative bg-[#050810] py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.06),transparent_50%)]" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-8"
            >
              <span className="text-emerald-400/60 text-xs font-semibold uppercase tracking-[0.25em]">
                {allProducts.length} producten
              </span>
              <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-emerald-400/30 to-transparent" />
            </motion.div>

            <h1 className="text-4xl lg:text-7xl font-semibold text-white tracking-tight mb-5">
              Onze{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-300">
                Collectie
              </span>
            </h1>
            <p className="text-white/30 text-base lg:text-lg font-light max-w-lg mb-6">
              Originele Nintendo games — persoonlijk getest, met eigen productfoto&apos;s
            </p>

            <div className="flex items-center gap-6 text-white/20 text-xs">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Eigen foto&apos;s
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                100% origineel
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Gratis vanaf &euro;100
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f8fafc] to-transparent" />
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
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    Nog {formatPrice(remainingForFreeShipping)} voor gratis verzending
                  </span>
                  <Link href="/winkelwagen" className="text-xs text-emerald-600 font-medium hover:underline">
                    Bekijk wagen
                  </Link>
                </div>
                <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                    className="h-full bg-emerald-500 rounded-full"
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
            hasConsoles={hasConsoles}
            hasSaleItems={hasSaleItems}
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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex-shrink-0">Prijs</span>
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
                  className="w-24 pl-7 pr-2 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="text-slate-300">—</span>
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
                  className="w-24 pl-7 pr-2 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              <span className="text-sm text-slate-500 flex-shrink-0 mr-1" role="status" aria-live="polite">
                <span className="font-semibold text-emerald-600">{filtered.length}</span> resultaten
              </span>

              {([
                { active: !!debouncedSearch, label: `\u201C${debouncedSearch}\u201D`, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100', onClear: () => setSearch('') },
                { active: !!platform, label: platform, cls: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', onClear: () => setPlatform('') },
                { active: !!genre, label: genre, cls: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100', onClear: () => setGenre('') },
                { active: !!condition, label: condition, cls: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100', onClear: () => setCondition('') },
                { active: !!category, label: category === 'games' ? 'Games' : category === 'consoles' ? 'Consoles' : category === 'sale' ? 'Aanbiedingen' : category, cls: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100', onClear: () => setCategory('') },
                { active: !!completeness, label: completeness === 'cib' ? 'Compleet (CIB)' : 'Los', cls: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100', onClear: () => setCompleteness('') },
                { active: !!(priceMin || priceMax), label: priceMin && priceMax ? `€${priceMin} – €${priceMax}` : priceMin ? `Vanaf €${priceMin}` : `Tot €${priceMax}`, cls: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100', onClear: () => { setPriceMin(''); setPriceMax(''); } },
              ] as const).filter((c) => c.active).map((chip, i) => (
                <button key={i} onClick={chip.onClear} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${chip.cls}`}>
                  {chip.label}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              ))}

              {activeFilterCount > 1 && (
                <>
                  <div className="h-4 w-px bg-slate-200" />
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

        {/* Resultaten info balk */}
        {!isSearching && filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-1 py-2">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-600">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'producten'}
              {totalPages > 1 && (
                <span className="text-slate-300"> &middot; pagina {page}/{totalPages}</span>
              )}
            </p>
            {filtered.length > ITEMS_PER_PAGE && (
              <p className="text-[11px] text-slate-300 hidden sm:block tabular-nums">
                {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} van {filtered.length}
              </p>
            )}
          </div>
        )}

        {/* Products */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div className="h-56 bg-gradient-to-b from-slate-50 to-slate-100/50 animate-pulse" />
                    <div className="p-4 bg-white space-y-2.5">
                      <div className="h-2.5 w-16 rounded-full bg-slate-100 animate-pulse" />
                      <div className="h-3 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                      <div className="h-2.5 w-1/2 rounded-full bg-slate-50 animate-pulse" />
                      <div className="flex items-center justify-between pt-3">
                        <div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" />
                        <div className="h-9 w-24 rounded-xl bg-slate-100 animate-pulse" />
                      </div>
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
                className="text-center py-24"
              >
                <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                  <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Geen producten gevonden</h3>
                <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
                  {debouncedSearch
                    ? `Geen resultaten voor \u201C${debouncedSearch}\u201D`
                    : 'Pas je filters aan om producten te vinden.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-lg transition-all mb-10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Filters wissen
                </button>

                {/* Suggesties per platform */}
                <div className="max-w-lg mx-auto">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Populaire platforms</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {platforms.slice(0, 6).map((p) => (
                      <button
                        key={p}
                        onClick={() => { clearFilters(); setPlatform(p); }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 font-medium hover:border-slate-300 hover:text-slate-900 transition-all"
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
            className="mt-16 flex flex-col items-center gap-5"
          >
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 1}
                aria-label="Vorige pagina"
                className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className="flex items-center gap-0.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-slate-300 text-xs">...</span>
                      )}
                      <button
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          p === page
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>

              <button
                onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === totalPages}
                aria-label="Volgende pagina"
                className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            <p className="text-[11px] text-slate-300 tabular-nums">
              Pagina {page} van {totalPages}
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 lg:pt-20">
        <div className="relative bg-[#050810] py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-3 w-24 rounded-full bg-white/5 animate-pulse mb-8" />
            <div className="h-12 w-72 rounded-lg bg-white/5 animate-pulse mb-5" />
            <div className="h-4 w-96 rounded-full bg-white/[0.03] animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
