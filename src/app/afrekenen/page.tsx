'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface FormData {
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  opmerkingen: string;
  betaalmethode: string;
}

const betaalmethoden = [
  { id: 'ideal', label: 'iDEAL', description: 'Direct betalen via je bank' },
  { id: 'creditcard', label: 'Creditcard', description: 'Visa, Mastercard, American Express' },
  { id: 'paypal', label: 'PayPal', description: 'Betalen via PayPal account' },
  { id: 'bancontact', label: 'Bancontact', description: 'Belgisch betaalnetwerk' },
];

export default function AfrekenPage() {
  const { items, getTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    voornaam: '',
    achternaam: '',
    email: '',
    telefoon: '',
    straat: '',
    huisnummer: '',
    postcode: '',
    plaats: '',
    opmerkingen: '',
    betaalmethode: 'ideal',
  });

  const subtotal = getTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build WhatsApp message
    const itemLines = items
      .map((item) => `• ${item.product.name} (${item.product.platform}) x${item.quantity} — ${formatPrice(item.product.price * item.quantity)}`)
      .join('\n');

    const message = [
      `*Nieuwe bestelling — Gameshop Enter*`,
      ``,
      `*Klantgegevens:*`,
      `Naam: ${form.voornaam} ${form.achternaam}`,
      `Email: ${form.email}`,
      `Telefoon: ${form.telefoon}`,
      `Adres: ${form.straat} ${form.huisnummer}, ${form.postcode} ${form.plaats}`,
      ``,
      `*Producten:*`,
      itemLines,
      ``,
      `Subtotaal: ${formatPrice(subtotal)}`,
      `Verzending: ${shipping === 0 ? 'Gratis' : formatPrice(shipping)}`,
      `*Totaal: ${formatPrice(total)}*`,
      ``,
      `Betaalmethode: ${betaalmethoden.find((b) => b.id === form.betaalmethode)?.label}`,
      form.opmerkingen ? `\nOpmerkingen: ${form.opmerkingen}` : '',
    ].join('\n');

    const whatsappUrl = `https://wa.me/31641126067?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
    clearCart();
    addToast('Bestelling verstuurd! Je wordt doorgestuurd naar WhatsApp.', 'success');
  };

  if (items.length === 0 && !submitted) {
    return (
      <div className="pt-16 lg:pt-20">
        <div className="relative bg-[#050810] py-14 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
              Af<span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">rekenen</span>
            </h1>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Je winkelwagen is leeg</h2>
            <p className="text-slate-500 mb-8">Voeg eerst producten toe aan je winkelwagen</p>
            <Link href="/shop">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25">
                Naar de shop
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="pt-16 lg:pt-20">
        <div className="relative bg-[#050810] min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_60%)]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative text-center px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/30"
            >
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </motion.div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Bedankt voor je bestelling!
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto mb-4 leading-relaxed">
              Je bestelling is verstuurd via WhatsApp. We nemen zo snel mogelijk contact met je op om de betaling en verzending af te ronden.
            </p>
            <p className="text-slate-500 text-sm mb-10">
              Heb je het WhatsApp-venster gesloten? Stuur dan een berichtje naar{' '}
              <a href="https://wa.me/31641126067" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                06-41126067
              </a>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25">
                  Terug naar home
                </motion.span>
              </Link>
              <Link href="/shop">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold hover:bg-white/[0.1] transition-all">
                  Verder winkelen
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20">
      {/* Header */}
      <div className="relative bg-[#050810] py-14 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_50%)]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/winkelwagen" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-4 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Terug naar winkelwagen
            </Link>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
              Af<span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">rekenen</span>
            </h1>
            <p className="text-slate-400">Vul je gegevens in om de bestelling af te ronden</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h2 className="font-extrabold text-slate-900 text-lg mb-6 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">1</span>
                  Persoonlijke gegevens
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Voornaam *</label>
                    <input
                      type="text"
                      required
                      value={form.voornaam}
                      onChange={(e) => updateField('voornaam', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="Jan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Achternaam *</label>
                    <input
                      type="text"
                      required
                      value={form.achternaam}
                      onChange={(e) => updateField('achternaam', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="de Vries"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mailadres *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="jan@voorbeeld.nl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefoonnummer *</label>
                    <input
                      type="tel"
                      required
                      value={form.telefoon}
                      onChange={(e) => updateField('telefoon', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="06-12345678"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h2 className="font-extrabold text-slate-900 text-lg mb-6 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">2</span>
                  Bezorgadres
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Straat *</label>
                    <input
                      type="text"
                      required
                      value={form.straat}
                      onChange={(e) => updateField('straat', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="Kerkstraat"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Huisnummer *</label>
                    <input
                      type="text"
                      required
                      value={form.huisnummer}
                      onChange={(e) => updateField('huisnummer', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="12a"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Postcode *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{4}\s?[a-zA-Z]{2}"
                      value={form.postcode}
                      onChange={(e) => updateField('postcode', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="1234 AB"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Plaats *</label>
                    <input
                      type="text"
                      required
                      value={form.plaats}
                      onChange={(e) => updateField('plaats', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                      placeholder="Amsterdam"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h2 className="font-extrabold text-slate-900 text-lg mb-6 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">3</span>
                  Betaalmethode
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {betaalmethoden.map((methode) => (
                    <label
                      key={methode.id}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.betaalmethode === methode.id
                          ? 'border-emerald-400 bg-emerald-50/50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="betaalmethode"
                        value={methode.id}
                        checked={form.betaalmethode === methode.id}
                        onChange={(e) => updateField('betaalmethode', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        form.betaalmethode === methode.id ? 'border-emerald-500' : 'border-slate-300'
                      }`}>
                        {form.betaalmethode === methode.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{methode.label}</p>
                        <p className="text-xs text-slate-500">{methode.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h2 className="font-extrabold text-slate-900 text-lg mb-4">Opmerkingen</h2>
                <textarea
                  value={form.opmerkingen}
                  onChange={(e) => updateField('opmerkingen', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm resize-none"
                  placeholder="Heb je speciale wensen of opmerkingen? (optioneel)"
                />
              </motion.div>
            </div>

            {/* Right: Order summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-28 shadow-sm">
                <h3 className="font-extrabold text-slate-900 text-lg mb-6 tracking-tight">Je bestelling</h3>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const colors = PLATFORM_COLORS[item.product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
                    return (
                      <div key={item.product.sku} className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${item.product.image ? 'bg-slate-50 border border-slate-100' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                          {item.product.image ? (
                            <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="object-contain p-1" />
                          ) : (
                            <span className="text-white/30 text-[8px] font-bold">{PLATFORM_LABELS[item.product.platform]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                          <p className="text-[10px] text-slate-500">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotaal</span>
                    <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verzending</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-slate-900">Totaal</span>
                      <span className="font-extrabold text-slate-900 text-2xl">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Bestelling plaatsen via WhatsApp
                </motion.button>

                {/* Info */}
                <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed">
                  Je bestelling wordt verstuurd via WhatsApp. Lenn neemt persoonlijk contact met je op voor de betaling en verzending.
                </p>

                {/* Trust signals */}
                <div className="mt-5 space-y-2">
                  {[
                    '100% originele producten',
                    'Persoonlijk getest op werking',
                    'Verzending via PostNL (1-3 werkdagen)',
                    '14 dagen bedenktijd',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-500">
                      <svg className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
