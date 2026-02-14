'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllProducts, Product } from '@/lib/products';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [products] = useState<Product[]>(() => getAllProducts());
  const [stock, setStock] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'voorraad' | 'verzending'>('voorraad');

  // Verzending state
  const [orderNumber, setOrderNumber] = useState('');
  const [shipCustomer, setShipCustomer] = useState({ voornaam: '', achternaam: '', email: '', straat: '', huisnummer: '', postcode: '', plaats: '' });
  const [shipResult, setShipResult] = useState<{ trackingCode: string; trackingUrl: string; labelPdf: string } | null>(null);
  const [shipLoading, setShipLoading] = useState(false);
  const [shipError, setShipError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('admin-auth');
    if (saved) setAuthenticated(true);
  }, []);

  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stock');
      const data = await res.json();
      setStock(data);
    } catch {
      // Fallback: alles op 1
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchStock();
  }, [authenticated, fetchStock]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin-auth', password);
    setAuthenticated(true);
  };

  const updateStock = async (sku: string, action: 'increment' | 'decrement') => {
    setLoading(sku);
    const auth = localStorage.getItem('admin-auth') || password;
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        body: JSON.stringify({ sku, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setStock(prev => ({ ...prev, [sku]: data.stock }));
      }
    } catch {
      // Stilte
    }
    setLoading(null);
  };

  const handleShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setShipLoading(true);
    setShipError('');
    setShipResult(null);

    const auth = localStorage.getItem('admin-auth') || password;
    try {
      const res = await fetch('/api/admin/shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        body: JSON.stringify({
          orderNumber,
          customer: shipCustomer,
          items: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShipResult(data);
    } catch (err: unknown) {
      setShipError(err instanceof Error ? err.message : 'Verzending mislukt');
    }
    setShipLoading(false);
  };

  const platforms = useMemo(() => {
    const set = new Set(products.map(p => p.platform));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (platform && p.platform !== platform) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, search, platform]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Admin</h1>
          <p className="text-slate-500 text-sm mb-6">Voer je wachtwoord in</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-sm mb-4"
            placeholder="Wachtwoord"
            autoFocus
          />
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm">
            Inloggen
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Header */}
      <div className="bg-[#050810] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Voorraad beheren & verzendingen</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 lg:top-20 z-10 bg-white border-b border-slate-200 px-4">
        <div className="max-w-3xl mx-auto flex gap-1">
          {[
            { id: 'voorraad' as const, label: 'Voorraad', count: products.length },
            { id: 'verzending' as const, label: 'Verzending' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.count && <span className="ml-1.5 text-xs text-slate-400">({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {tab === 'voorraad' && (
          <>
            {/* Zoek + filter */}
            <div className="flex gap-2 mb-4">
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-sm"
                placeholder="Zoek op naam of SKU..."
              />
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-emerald-400 outline-none"
              >
                <option value="">Alle</option>
                {platforms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Resultaten teller */}
            <p className="text-xs text-slate-500 mb-3">{filtered.length} producten</p>

            {/* Product lijst */}
            <div className="space-y-2">
              {filtered.map(product => {
                const currentStock = stock[product.sku] ?? 1;
                const isLoading = loading === product.sku;
                return (
                  <div
                    key={product.sku}
                    className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${
                      currentStock === 0 ? 'border-red-200 bg-red-50/50' : 'border-slate-100'
                    }`}
                  >
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku} &middot; {product.platform}</p>
                    </div>

                    {/* Stock controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => updateStock(product.sku, 'decrement')}
                        disabled={isLoading || currentStock === 0}
                        className="h-10 w-10 rounded-lg bg-red-50 border border-red-200 text-red-600 font-bold text-lg flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className={`w-10 text-center font-bold text-lg ${currentStock === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                        {isLoading ? '...' : currentStock}
                      </span>
                      <button
                        onClick={() => updateStock(product.sku, 'increment')}
                        disabled={isLoading}
                        className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-lg flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'verzending' && (
          <div className="space-y-6">
            <form onSubmit={handleShipment} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-extrabold text-lg text-slate-900">Verzending aanmaken</h2>
              <p className="text-sm text-slate-500">Maak een PostNL zending aan en stuur automatisch track & trace naar de klant.</p>

              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="Bestelnummer (bijv. GE-M1234)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-sm"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Voornaam" value={shipCustomer.voornaam} onChange={e => setShipCustomer(prev => ({ ...prev, voornaam: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm" required />
                <input placeholder="Achternaam" value={shipCustomer.achternaam} onChange={e => setShipCustomer(prev => ({ ...prev, achternaam: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm" required />
              </div>

              <input placeholder="E-mail" type="email" value={shipCustomer.email} onChange={e => setShipCustomer(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm" required />

              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Straat" value={shipCustomer.straat} onChange={e => setShipCustomer(prev => ({ ...prev, straat: e.target.value }))} className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm" required />
                <input placeholder="Nr." value={shipCustomer.huisnummer} onChange={e => setShipCustomer(prev => ({ ...prev, huisnummer: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Postcode" value={shipCustomer.postcode} onChange={e => setShipCustomer(prev => ({ ...prev, postcode: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm" required />
                <input placeholder="Plaats" value={shipCustomer.plaats} onChange={e => setShipCustomer(prev => ({ ...prev, plaats: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm" required />
              </div>

              {shipError && <p className="text-sm text-red-500 font-medium">{shipError}</p>}

              <button
                type="submit"
                disabled={shipLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm disabled:opacity-50"
              >
                {shipLoading ? 'Verzending aanmaken...' : 'Verzendlabel aanmaken & e-mail versturen'}
              </button>
            </form>

            {shipResult && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                <h3 className="font-bold text-emerald-800 mb-3">Verzending aangemaakt!</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-emerald-600 font-medium">Track & Trace:</span> <span className="font-mono font-bold text-emerald-800">{shipResult.trackingCode}</span></p>
                  <a href={shipResult.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline block">Volg bij PostNL</a>
                  {shipResult.labelPdf && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:application/pdf;base64,${shipResult.labelPdf}`;
                        link.download = `verzendlabel-${orderNumber}.pdf`;
                        link.click();
                      }}
                      className="mt-3 w-full py-3 rounded-xl bg-white border border-emerald-300 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors"
                    >
                      Verzendlabel downloaden (PDF)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
