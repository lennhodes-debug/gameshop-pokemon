'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderLocation {
  orderNumber: string;
  customerName: string;
  postcode: string;
  plaats: string;
  status: string;
}

export default function AdminMapPage() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderLocation[]>([]);
  const [mapUrl, setMapUrl] = useState('');
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/orders/list', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setAuthenticated(true);
        setError('');
        generateMapUrl(data.orders);
      } else {
        setError('Ongeldig API-sleutel');
      }
    } catch (err) {
      setError('Fout bij verbinding');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMapUrl = (orderList: OrderLocation[]) => {
    // Maak een URL voor Google Maps Static API die alle locaties toont
    // Dit is een basic implementatie - in production zou je een interactieve kaart willen
    const locations = orderList
      .filter((order) => order.plaats && order.postcode)
      .map((order) => `${order.plaats}, ${order.postcode}`)
      .slice(0, 5); // Limit to 5 locations for readability

    if (locations.length > 0) {
      // Dit toont de eerste locatie als startpunt
      const mapString = `https://maps.google.com/maps/search/${encodeURIComponent(locations[0])}`;
      setMapUrl(mapString);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Admin Kaart</h1>
            <p className="text-slate-500 text-sm mb-6">
              Voer je API-sleutel in om bestellingen op de kaart te zien
            </p>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 mb-2">
                  API-sleutel
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Voer je API-sleutel in"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Bezig...' : 'Inloggen'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Bestellingen Kaart</h1>
              <p className="text-slate-500 mt-1">
                Visualiseer verzendlocaties ({orders.length} bestellingen)
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/bestellingen"
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Naar Bestellingen
              </Link>
              <button
                onClick={() => setAuthenticated(false)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Afmelden
              </button>
            </div>
          </div>
        </div>

        {/* Map Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Verzendlocaties</h2>
          <p className="text-slate-600 text-sm mb-4">
            Hieronder zie je een overzicht van alle verzendlocaties. Je kunt op een plaats klikken
            om naar Google Maps te gaan.
          </p>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Geen bestellingen met adresgegevens gevonden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <a
                  key={order.orderNumber}
                  href={`https://maps.google.com/maps/search/${encodeURIComponent(`${order.plaats}, ${order.postcode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                >
                  <p className="text-xs font-mono text-slate-500 group-hover:text-emerald-600 mb-1">
                    {order.orderNumber}
                  </p>
                  <p className="font-medium text-slate-900 group-hover:text-emerald-600 text-sm mb-2">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {order.plaats}, {order.postcode}
                  </p>
                  <p
                    className={`text-xs font-semibold mt-2 ${
                      order.status === 'processing'
                        ? 'text-yellow-600'
                        : order.status === 'shipped'
                          ? 'text-blue-600'
                          : order.status === 'delivered'
                            ? 'text-green-600'
                            : 'text-slate-600'
                    }`}
                  >
                    {order.status === 'processing'
                      ? 'Verwerken'
                      : order.status === 'shipped'
                        ? 'Verzonden'
                        : order.status === 'delivered'
                          ? 'Bezorgd'
                          : order.status}
                  </p>
                  <span className="text-xs text-emerald-600 group-hover:underline mt-2 block">
                    Op Google Maps openen →
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Map Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">Totaal bestellingen</p>
            <p className="text-3xl font-semibold text-slate-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">Unieke plaatsen</p>
            <p className="text-3xl font-semibold text-slate-900">
              {new Set(orders.map((o) => o.plaats)).size}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">Verzonden</p>
            <p className="text-3xl font-semibold text-slate-900">
              {orders.filter((o) => o.status === 'shipped').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
