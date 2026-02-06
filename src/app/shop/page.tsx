'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllProducts, getAllPlatforms, getAllGenres, getAllConditions, Product } from '@/lib/products';
import SearchBar from '@/components/shop/SearchBar';
import Filters from '@/components/shop/Filters';
import ProductGrid from '@/components/shop/ProductGrid';

const ITEMS_PER_PAGE = 24;

function ShopContent() {
  const searchParams = useSearchParams();
  const initialPlatform = searchParams.get('platform') || '';

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

    if (platform) results = results.filter((p) => p.platform === platform);
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
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <div className="relative bg-[#050810] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">Shop</h1>
          <p className="text-slate-400">
            {filtered.length} {filtered.length === 1 ? 'product' : 'producten'} gevonden
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Search */}
        <SearchBar value={search} onChange={setSearch} className="mb-6" />

        {/* Filters */}
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

        {activeFilterCount > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-500">{activeFilterCount} filter(s) actief</span>
            <button onClick={clearFilters} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Alles wissen
            </button>
          </div>
        )}

        {/* Products */}
        <div className="mt-8">
          <ProductGrid products={paginatedProducts} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Vorige
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-2 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Volgende
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 lg:pt-24">
        <div className="relative bg-[#050810] py-12 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">Shop</h1>
            <p className="text-slate-400">Laden...</p>
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
