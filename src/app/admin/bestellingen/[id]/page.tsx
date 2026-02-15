'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  discountCode?: string;
  voornaam: string;
  achternaam: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  opmerkingen?: string;
  betaalmethode: string;
  createdAt: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingLabel?: string;
  trackingCode?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const [id, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);

        // Fetch order from API
        const token = localStorage.getItem('admin-token');
        const response = await fetch('/api/orders/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError('Niet geautoriseerd');
          setLoading(false);
          return;
        }

        const data = await response.json();
        const foundOrder = data.orders?.find((o: Order) => o.orderNumber === resolvedParams.id);

        if (!foundOrder) {
          setError('Bestelling niet gevonden');
          setLoading(false);
          return;
        }

        setOrder(foundOrder);
        setLoading(false);
      } catch (err) {
        setError('Fout bij laden bestelling');
        setLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-200 rounded-lg w-1/4" />
            <div className="h-96 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">Fout</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link
            href="/admin/bestellingen"
            className="inline-flex px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
          >
            Terug naar bestellingen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/bestellingen"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Terug naar bestellingen
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Bestelnummer
                </p>
                <h1 className="text-2xl font-semibold text-slate-900 font-mono">
                  {order.orderNumber}
                </h1>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}
              >
                {order.status === 'processing'
                  ? 'Verwerken'
                  : order.status === 'shipped'
                    ? 'Verzonden'
                    : order.status === 'delivered'
                      ? 'Bezorgd'
                      : 'Geannuleerd'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Besteld op{' '}
              {new Date(order.createdAt).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Producten</h2>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Aantal: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-slate-500">{formatPrice(item.price)} per stuk</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Bezorgadres</h2>
              <div className="text-sm text-slate-700 space-y-1">
                <p className="font-medium">{order.customerName}</p>
                <p>
                  {order.straat} {order.huisnummer}
                </p>
                <p>
                  {order.postcode} {order.plaats}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Samenvatting</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotaal</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Verzending</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Korting ({order.discountCode})</span>
                    <span className="font-semibold text-emerald-600">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Totaal</span>
                    <span className="font-semibold text-slate-900 text-lg">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Klantgegevens</h2>
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider">E-mailadres</p>
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {order.customerEmail}
                  </a>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider">Betaalmethode</p>
                  <p className="text-slate-900 font-medium">
                    {order.betaalmethode === 'ideal' ? 'iDEAL' : order.betaalmethode}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.opmerkingen && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Opmerkingen</h2>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.opmerkingen}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
