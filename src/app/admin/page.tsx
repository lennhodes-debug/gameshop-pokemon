'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllProducts, Product } from '@/lib/products';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
  subscribers: number;
  outOfStock: number;
  lowStock: number;
  usedDiscounts: number;
  totalDiscounts: number;
}

interface DashboardOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; sku: string; qty: number; price: number }[];
  address: string;
  status: string;
  paidAt: string;
  discountCode?: string;
}

interface TopProduct {
  name: string;
  sku: string;
  qty: number;
  revenue: number;
}

interface LowStockItem {
  sku: string;
  stock: number;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  const gradients: Record<string, string> = {
    green: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-indigo-500',
    orange: 'from-orange-500 to-amber-500',
    purple: 'from-purple-500 to-violet-500',
  };
  return (
    <div className={`bg-gradient-to-br ${gradients[color] || gradients.green} rounded-2xl p-4 text-white`}>
      <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1">{value}</p>
      {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">{icon}</div>
      <div>
        <p className="text-lg font-extrabold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [products] = useState<Product[]>(() => getAllProducts());
  const [stock, setStock] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'dashboard' | 'voorraad' | 'verzending'>('dashboard');

  // Dashboard state
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [dashOrders, setDashOrders] = useState<DashboardOrder[]>([]);
  const [dashTopProducts, setDashTopProducts] = useState<TopProduct[]>([]);
  const [dashLowStock, setDashLowStock] = useState<LowStockItem[]>([]);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState('');

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

  const getAuth = useCallback(() => localStorage.getItem('admin-auth') || password, [password]);

  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stock');
      const data = await res.json();
      setStock(data);
    } catch { /* */ }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setDashLoading(true);
    setDashError('');
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${getAuth()}` },
      });
      if (!res.ok) throw new Error('Dashboard laden mislukt');
      const data = await res.json();
      setDashStats(data.stats);
      setDashOrders(data.recentOrders || []);
      setDashTopProducts(data.topProducts || []);
      setDashLowStock(data.lowStockProducts || []);
    } catch (err: unknown) {
      setDashError(err instanceof Error ? err.message : 'Fout bij laden');
    }
    setDashLoading(false);
  }, [getAuth]);

  useEffect(() => {
    if (authenticated) {
      fetchStock();
      fetchDashboard();
    }
  }, [authenticated, fetchStock, fetchDashboard]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin-auth', password);
    setAuthenticated(true);
  };

  const updateStock = async (sku: string, action: 'increment' | 'decrement') => {
    setLoading(sku);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuth()}`,
        },
        body: JSON.stringify({ sku, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setStock(prev => ({ ...prev, [sku]: data.stock }));
      }
    } catch { /* */ }
    setLoading(null);
  };

  const handleShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setShipLoading(true);
    setShipError('');
    setShipResult(null);

    try {
      const res = await fetch('/api/admin/shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuth()}`,
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
          <p className="text-slate-400 text-sm">Statistieken, voorraad & verzendingen</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 lg:top-20 z-10 bg-white border-b border-slate-200 px-4">
        <div className="max-w-3xl mx-auto flex gap-1 overflow-x-auto">
          {([
            { id: 'dashboard' as const, label: 'Dashboard' },
            { id: 'voorraad' as const, label: 'Voorraad', count: products.length },
            { id: 'verzending' as const, label: 'Verzending' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {'count' in t && t.count && <span className="ml-1.5 text-xs text-slate-400">({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ============ DASHBOARD TAB ============ */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {dashLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {dashError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {dashError}
                <button onClick={fetchDashboard} className="ml-3 underline font-medium">Opnieuw proberen</button>
              </div>
            )}

            {dashStats && !dashLoading && (
              <>
                {/* Omzet KPIs */}
                <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Omzet & Bestellingen</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label="Vandaag"
                      value={formatEuro(dashStats.todayRevenue)}
                      sub={`${dashStats.todayOrders} bestelling${dashStats.todayOrders !== 1 ? 'en' : ''}`}
                      color="green"
                    />
                    <StatCard
                      label="Deze week"
                      value={formatEuro(dashStats.weekRevenue)}
                      sub={`${dashStats.weekOrders} bestelling${dashStats.weekOrders !== 1 ? 'en' : ''}`}
                      color="blue"
                    />
                    <StatCard
                      label="Deze maand"
                      value={formatEuro(dashStats.monthRevenue)}
                      sub={`${dashStats.monthOrders} bestelling${dashStats.monthOrders !== 1 ? 'en' : ''}`}
                      color="orange"
                    />
                    <StatCard
                      label="Totaal"
                      value={formatEuro(dashStats.totalRevenue)}
                      sub={`${dashStats.totalOrders} bestelling${dashStats.totalOrders !== 1 ? 'en' : ''}`}
                      color="purple"
                    />
                  </div>
                </div>

                {/* Quick stats */}
                <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Snelle overzichten</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat icon="&#x2709;" label="Nieuwsbrief abonnees" value={dashStats.subscribers} />
                    <MiniStat icon="&#x1F3F7;" label="Kortingscodes gebruikt" value={`${dashStats.usedDiscounts}/${dashStats.totalDiscounts}`} />
                    <MiniStat icon="&#x274C;" label="Uitverkocht" value={dashStats.outOfStock} />
                    <MiniStat icon="&#x26A0;" label="Bijna op" value={dashStats.lowStock} />
                  </div>
                </div>

                {/* Recente bestellingen */}
                {dashOrders.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Recente Bestellingen</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                      {dashOrders.slice(0, 10).map(order => (
                        <div key={order.orderNumber} className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{order.orderNumber}</span>
                                <span className="text-xs text-slate-400">{formatDate(order.paidAt)}</span>
                              </div>
                              <p className="text-sm font-semibold text-slate-900 mt-1">{order.customerName}</p>
                              <p className="text-xs text-slate-500 truncate">{order.items.map(i => `${i.qty}x ${i.name}`).join(', ') || 'Geen items'}</p>
                              {order.discountCode && (
                                <span className="inline-block text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md mt-1">Code: {order.discountCode}</span>
                              )}
                            </div>
                            <span className="text-sm font-extrabold text-slate-900 flex-shrink-0">{formatEuro(order.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top producten */}
                {dashTopProducts.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Top Producten</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                      {dashTopProducts.map((p, i) => (
                        <div key={p.sku} className="p-3 flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' :
                            i === 1 ? 'bg-slate-200 text-slate-600' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-50 text-slate-400'
                          }`}>
                            #{i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.sku}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-slate-900">{p.qty}x</p>
                            <p className="text-xs text-emerald-600">{formatEuro(p.revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lage voorraad alert */}
                {dashLowStock.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Lage Voorraad</h2>
                    <div className="bg-white rounded-2xl border border-orange-200 divide-y divide-orange-100 overflow-hidden">
                      {dashLowStock.map(item => (
                        <div key={item.sku} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.sku}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                              {item.stock === 0 ? 'Uitverkocht' : `${item.stock} over`}
                            </span>
                            <button
                              onClick={() => { setTab('voorraad'); setSearch(item.sku); }}
                              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              Aanvullen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ververs knop */}
                <button
                  onClick={fetchDashboard}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Dashboard verversen
                </button>
              </>
            )}
          </div>
        )}

        {/* ============ VOORRAAD TAB ============ */}
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

        {/* ============ VERZENDING TAB ============ */}
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
