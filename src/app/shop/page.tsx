'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getAllProducts, getAllPlatforms, getAllGenres, getAllConditions, isOnSale, getSalePercentage, getEffectivePrice } from '@/lib/products';
import { useCart } from '@/components/cart/CartProvider';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import SearchBar from '@/components/shop/SearchBar';
import Filters from '@/components/shop/Filters';
import ProductGrid from '@/components/shop/ProductGrid';
import QuickView from '@/components/shop/QuickView';
import FilterSummary from '@/components/shop/FilterSummary';
import EmptyState from '@/components/shop/EmptyState';
import Pagination from '@/components/shop/Pagination';
import CategoryShowcase from '@/components/shop/CategoryShowcase';
import GenreShowcase from '@/components/shop/GenreShowcase';
import SortAndView from '@/components/shop/SortAndView';
import FeaturedProducts from '@/components/shop/FeaturedProducts';
import ScrollToTop from '@/components/shop/ScrollToTop';
import ViewToggle from '@/components/shop/ViewToggle';
import BreadcrumbNav from '@/components/shop/BreadcrumbNav';
import EnhancedShopHeader from '@/components/shop/EnhancedShopHeader';
import PremiumProductCard from '@/components/shop/PremiumProductCard';
import OptimizedProductGrid from '@/components/shop/OptimizedProductGrid';
import PremiumFilters from '@/components/shop/PremiumFilters';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { getTotal, getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
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
      {/* Premium Enhanced Header */}
      <EnhancedShopHeader
        title="Nintendo Retro Games"
        subtitle="Ontdek ons assortiment van originele Pokémon games — met professionele foto's"
        productCount={allProducts.length}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav
          items={[
            { label: 'Shop', href: '/shop' },
            ...(platform ? [{ label: platform, href: `/shop?platform=${encodeURIComponent(platform)}` }] : []),
            ...(genre ? [{ label: genre, href: `/shop?genre=${encodeURIComponent(genre)}`, isActive: true }] : []),
            ...(category && !platform && !genre ? [{ label: category === 'games' ? 'Games' : category === 'consoles' ? 'Consoles' : 'Aanbiedingen', href: `/shop?category=${category}`, isActive: true }] : []),
          ]}
        />

        {/* Urgentie banner */}
        {new Date().getHours() < 17 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Bestel voor 17:00, morgen in huis</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">Verzending via PostNL, altijd met track & trace</p>
            </div>
          </motion.div>
        )}

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

        {/* Category/Platform Showcase - Premium section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <CategoryShowcase
            onPlatformSelect={setPlatform}
            selectedPlatform={platform}
          />
        </motion.div>

        {/* Genre Showcase - Browse by genre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <GenreShowcase
            onGenreSelect={setGenre}
            selectedGenre={genre}
          />
        </motion.div>

        {/* Featured Products - Only show when no active filters/search */}
        {!debouncedSearch && !platform && !genre && !condition && !category && !completeness && !priceMin && !priceMax && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <FeaturedProducts onQuickView={setQuickViewProduct} />
          </motion.div>
        )}

        {/* Premium Filter Summary */}
        <AnimatePresence>
          {(activeFilterCount > 0 || debouncedSearch) && (
            <FilterSummary
              filters={[
                ...(debouncedSearch ? [{ label: `"${debouncedSearch}"`, value: debouncedSearch, type: 'search' as const }] : []),
                ...(platform ? [{ label: platform, value: platform, type: 'platform' as const }] : []),
                ...(genre ? [{ label: genre, value: genre, type: 'genre' as const }] : []),
                ...(condition ? [{ label: condition, value: condition, type: 'condition' as const }] : []),
                ...(category ? [{ label: category === 'games' ? 'Games' : category === 'consoles' ? 'Consoles' : category === 'sale' ? 'Aanbiedingen' : category, value: category, type: 'category' as const }] : []),
                ...(completeness ? [{ label: completeness === 'cib' ? 'Compleet (CIB)' : 'Los', value: completeness, type: 'completeness' as const }] : []),
                ...((priceMin || priceMax) ? [{ label: priceMin && priceMax ? `€${priceMin} – €${priceMax}` : priceMin ? `Vanaf €${priceMin}` : `Tot €${priceMax}`, value: `${priceMin}-${priceMax}`, type: 'price' as const }] : []),
              ]}
              onRemoveFilter={(type, value) => {
                switch (type) {
                  case 'search': setSearch(''); break;
                  case 'platform': setPlatform(''); break;
                  case 'genre': setGenre(''); break;
                  case 'condition': setCondition(''); break;
                  case 'category': setCategory(''); break;
                  case 'completeness': setCompleteness(''); break;
                  case 'price': setPriceMin(''); setPriceMax(''); break;
                }
              }}
              onClearAll={clearFilters}
              resultCount={filtered.length}
            />
          )}
        </AnimatePresence>

        {/* Enhanced Results Section with Sort and View Toggle */}
        {!isSearching && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 flex items-center justify-between gap-4 flex-wrap"
          >
            <SortAndView
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={filtered.length}
            />
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </motion.div>
        )}

        {/* Products */}
        <div className="mt-8">
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                      <div className="h-5 w-1/3 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                    </div>
                  </motion.div>
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

                {/* Verlanglijst suggestie */}
                {wishlistItems.length > 0 && (
                  <div className="mb-8">
                    <Link
                      href="/verlanglijst"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/50 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      Bekijk je verlanglijst ({wishlistItems.length})
                    </Link>
                  </div>
                )}

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
                <OptimizedProductGrid products={paginatedProducts} onQuickView={setQuickViewProduct} isLoading={isSearching} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>

      {/* Quick View Modal */}
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Scroll to Top Button */}
      <ScrollToTop />
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
