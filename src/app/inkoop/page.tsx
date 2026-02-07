'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getAllProducts, getAllPlatforms } from '@/lib/products';

const ITEMS_PER_PAGE = 50;

export default function InkoopPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [page, setPage] = useState(1);

  const allProducts = getAllProducts();
  const platforms = getAllPlatforms().map((p) => p.name);

  const filtered = useMemo(() => {
    let results = allProducts.filter((p) => p.inkoopPrijs && p.inkoopPrijs > 0);

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (platform) results = results.filter((p) => p.platform === platform);
    if (category === 'games') results = results.filter((p) => !p.isConsole);
    if (category === 'consoles') results = results.filter((p) => p.isConsole);

    results.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return (a.inkoopPrijs || 0) - (b.inkoopPrijs || 0);
        case 'price-desc': return (b.inkoopPrijs || 0) - (a.inkoopPrijs || 0);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return a.name.localeCompare(b.name);
      }
    });

    return results;
  }, [allProducts, search, platform, category, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearch('');
    setPlatform('');
    setCategory('');
    setSortBy('name-asc');
    setPage(1);
  };

  return (
    <div className="pt-16 lg:pt-20">
      {/* Hero */}
      <div className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)]" />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 right-[20%] w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px]"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {filtered.length} producten met inkoopprijs
            </motion.span>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-3">
              Games{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Verkopen
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mb-6">
              Verkoop je Nintendo games en consoles aan Gameshop Enter. Eerlijke prijzen gebaseerd op actuele marktwaarde.
            </p>
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"
          >
            {[
              { step: '1', title: 'Zoek je game', desc: 'Vind je game in de lijst en bekijk de inkoopprijs' },
              { step: '2', title: 'Stuur een bericht', desc: 'Mail ons via gameshopenter@gmail.com met je aanbod' },
              { step: '3', title: 'Verstuur & ontvang', desc: 'Stuur je games op via PostNL en ontvang je geld' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Hoe werken onze inkoopprijzen?</h3>
              <p className="text-slate-600 text-sm mt-1">
                Onze inkoopprijzen zijn gebaseerd op de actuele marktwaarde (PriceCharting). De genoemde prijzen gelden voor games in{' '}
                <span className="font-semibold">goede staat</span>. Bij beschadigingen of ontbrekende onderdelen kan de prijs lager uitvallen.
                Neem contact op via{' '}
                <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                  gameshopenter@gmail.com
                </a>
                {' '}voor een persoonlijk bod.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Zoek op game, platform of SKU..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-800 placeholder:text-slate-400 transition-all bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Platform */}
            <select
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
            >
              <option value="">Alle platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
            >
              <option value="">Games & Consoles</option>
              <option value="games">Alleen games</option>
              <option value="consoles">Alleen consoles</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
            >
              <option value="name-asc">Naam A-Z</option>
              <option value="name-desc">Naam Z-A</option>
              <option value="price-desc">Prijs hoog-laag</option>
              <option value="price-asc">Prijs laag-hoog</option>
            </select>

            {(search || platform || category) && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Wissen
              </button>
            )}

            <span className="ml-auto text-sm text-slate-500">
              <span className="font-semibold text-emerald-600">{filtered.length}</span> resultaten
            </span>
          </div>
        </motion.div>

        {/* Price table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm"
        >
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_160px_160px_160px] bg-slate-50 border-b border-slate-200 px-6 py-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Platform</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Marktwaarde</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Wij bieden</span>
          </div>

          {/* Table body */}
          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {paginated.map((product, idx) => (
                <motion.div
                  key={product.sku}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.01 }}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_160px_160px_160px] items-center px-4 sm:px-6 py-3 hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Product info */}
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-emerald-700 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400 sm:hidden">{product.platform}</p>
                    </div>
                  </div>

                  {/* Platform */}
                  <div className="hidden sm:flex justify-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {product.platform}
                    </span>
                  </div>

                  {/* Market value */}
                  <div className="hidden sm:flex justify-center">
                    {product.pcUsedPrice ? (
                      <span className="text-sm text-slate-500">
                        &euro;{product.pcUsedPrice.toFixed(2).replace('.', ',')}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>

                  {/* Trade-in price */}
                  <div className="flex sm:justify-center items-center gap-2 mt-2 sm:mt-0">
                    <span className="sm:hidden text-xs text-slate-400">Inkoopprijs:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                      &euro;{(product.inkoopPrijs || 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {paginated.length === 0 && (
            <div className="px-6 py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-slate-500 font-medium">Geen resultaten gevonden</p>
              <p className="text-slate-400 text-sm mt-1">Probeer een andere zoekterm of filter</p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Vorige
            </button>
            <span className="px-4 text-sm text-slate-500">
              Pagina <span className="font-semibold text-slate-700">{page}</span> van <span className="font-semibold text-slate-700">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Volgende
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-[#0a1628] to-[#0d1f3c] rounded-2xl p-8 text-center border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-3">
            Game niet in de lijst?
          </h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Heb je een game die niet in onze lijst staat? Stuur ons een bericht en we maken je een persoonlijk bod.
          </p>
          <a
            href="mailto:gameshopenter@gmail.com?subject=Inkoop%20aanvraag"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Mail je aanbod
          </a>
        </motion.div>
      </div>
    </div>
  );
}
