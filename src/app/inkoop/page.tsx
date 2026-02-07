'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getAllProducts } from '@/lib/products';

export default function InkoopPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelected = (sku: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  };

  const allProducts = getAllProducts();

  // Get products with inkoop prices
  const inkoopProducts = useMemo(() => {
    return allProducts.filter((p) => p.inkoopPrijs && p.inkoopPrijs > 0);
  }, [allProducts]);

  // Platform list from inkoop products only
  const platforms = useMemo(() => {
    const map = new Map<string, number>();
    inkoopProducts.forEach((p) => {
      map.set(p.platform, (map.get(p.platform) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [inkoopProducts]);

  const filtered = useMemo(() => {
    let results = inkoopProducts;

    // When searching, search ALL products with inkoop price
    // When not searching, only show featured (top 100 games + key consoles)
    if (!search) {
      results = results.filter((p) => p.inkoopFeatured);
    } else {
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
  }, [inkoopProducts, search, platform, category, sortBy]);

  const featuredCount = inkoopProducts.filter((p) => p.inkoopFeatured).length;

  const selectedProducts = useMemo(() => {
    return inkoopProducts.filter((p) => selected.has(p.sku));
  }, [inkoopProducts, selected]);

  const selectedTotal = selectedProducts.reduce((sum, p) => sum + (p.inkoopPrijs || 0), 0);

  const generateMailto = () => {
    const lines = selectedProducts.map((p) => `- ${p.name} (${p.platform}) — €${(p.inkoopPrijs || 0).toFixed(2).replace('.', ',')}`);
    const body = `Hallo Gameshop Enter,\n\nIk wil graag de volgende games/consoles verkopen:\n\n${lines.join('\n')}\n\nGeschat totaal: €${selectedTotal.toFixed(2).replace('.', ',')}\n\nMijn gegevens:\nNaam: \nAdres: \nTelefoon/email: \n\nMet vriendelijke groet`;
    return `mailto:gameshopenter@gmail.com?subject=${encodeURIComponent('Inkoop aanvraag — ' + selectedProducts.length + ' producten')}&body=${encodeURIComponent(body)}`;
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
              {featuredCount} populaire titels
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

          {/* How it works — 5 steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Zo werkt het
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: '1', title: 'Zoek je game', desc: 'Vind je game in de lijst hieronder' },
                { step: '2', title: 'Bekijk de prijs', desc: 'Selecteer games en zie direct het totaal' },
                { step: '3', title: 'Stuur een e-mail', desc: 'Klik op "Verstuur aanvraag" of mail naar gameshopenter@gmail.com' },
                { step: '4', title: 'Verzend het product', desc: 'Stuur je games naar ons op via PostNL' },
                { step: '5', title: 'Ontvang je geld', desc: 'Betaling binnen 2 werkdagen na ontvangst' },
              ].map((item) => (
                <div key={item.step} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-3 sm:gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Prominent email */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex flex-wrap items-center gap-3"
          >
            <a
              href="mailto:gameshopenter@gmail.com?subject=Inkoop%20aanvraag"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              gameshopenter@gmail.com
            </a>
            <span className="text-slate-500 text-xs">Reactie binnen 24 uur, ma t/m vr</span>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Info banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Hoe werken onze inkoopprijzen?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                Onze inkoopprijzen zijn gebaseerd op de actuele marktwaarde. De genoemde prijzen gelden voor games in{' '}
                <span className="font-semibold">goede staat</span>. Bij beschadigingen of ontbrekende onderdelen kan de prijs lager uitvallen.
                Neem contact op via{' '}
                <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold underline">
                  gameshopenter@gmail.com
                </a>{' '}
                voor een persoonlijk bod.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek je game op naam of platform..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 transition-all bg-white dark:bg-slate-800"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {search && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Zoekresultaten uit <span className="font-semibold text-emerald-600 dark:text-emerald-400">alle {inkoopProducts.length}</span> producten
            </p>
          )}

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
            >
              <option value="">Alle platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
            >
              <option value="">Games & Consoles</option>
              <option value="games">Alleen games</option>
              <option value="consoles">Alleen consoles</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
            >
              <option value="name-asc">Naam A-Z</option>
              <option value="name-desc">Naam Z-A</option>
              <option value="price-desc">Prijs hoog-laag</option>
              <option value="price-asc">Prijs laag-hoog</option>
            </select>

            {(search || platform || category) && (
              <button
                onClick={() => { setSearch(''); setPlatform(''); setCategory(''); setSortBy('name-asc'); }}
                className="text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Wissen
              </button>
            )}

            <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filtered.length}</span> resultaten
            </span>
          </div>
        </div>

        {/* Price table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[40px_1fr_150px_140px_140px] bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
            <span></span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Platform</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Marktwaarde</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Wij bieden</span>
          </div>

          {/* Table body */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, idx) => (
                <motion.div
                  key={product.sku}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.5) }}
                  className={`grid grid-cols-1 sm:grid-cols-[40px_1fr_150px_140px_140px] items-center px-4 sm:px-6 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer ${selected.has(product.sku) ? 'bg-emerald-50/60 dark:bg-emerald-900/30' : ''}`}
                  onClick={() => toggleSelected(product.sku)}
                >
                  {/* Checkbox */}
                  <div className="hidden sm:flex items-center">
                    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${selected.has(product.sku) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400'}`}>
                      {selected.has(product.sku) && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
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
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400 sm:hidden">{product.platform}</p>
                    </div>
                  </div>

                  {/* Platform */}
                  <div className="hidden sm:flex justify-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {product.platform}
                    </span>
                  </div>

                  {/* Market value */}
                  <div className="hidden sm:flex justify-center">
                    {product.pcUsedPrice ? (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        &euro;{product.pcUsedPrice.toFixed(2).replace('.', ',')}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>

                  {/* Trade-in price */}
                  <div className="flex sm:justify-center items-center gap-2 mt-2 sm:mt-0">
                    <span className="sm:hidden text-xs text-slate-400">Inkoopprijs:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold text-sm border border-emerald-100 dark:border-emerald-800">
                      &euro;{(product.inkoopPrijs || 0).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelected(product.sku); }}
                      className={`sm:hidden ml-auto px-3 py-1 rounded-lg text-xs font-bold transition-all ${selected.has(product.sku) ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-700 dark:hover:text-emerald-400'}`}
                    >
                      {selected.has(product.sku) ? 'Geselecteerd' : 'Selecteer'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Geen resultaten gevonden</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Probeer een andere zoekterm of neem contact op voor een persoonlijk bod</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0a1628] to-[#0d1f3c] rounded-2xl p-8 text-center border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-3">
            Game niet gevonden?
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
        </div>
      </div>

      {/* Sticky selection bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-t-2 border-emerald-200 dark:border-emerald-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">
                    {selected.size}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {selected.size === 1 ? 'product' : 'producten'} geselecteerd
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                <span className="text-lg font-extrabold text-emerald-600 hidden sm:block">
                  &euro;{selectedTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-emerald-600 sm:hidden">
                  &euro;{selectedTotal.toFixed(2).replace('.', ',')}
                </span>
                <button
                  onClick={() => setSelected(new Set())}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Wissen
                </button>
                <a
                  href={generateMailto()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Verstuur aanvraag
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
