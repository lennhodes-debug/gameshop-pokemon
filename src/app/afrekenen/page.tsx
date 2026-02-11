'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiBurst from '@/components/ui/ConfettiBurst';
import { useCart, getCartItemPrice, getCartItemImage } from '@/components/cart/CartProvider';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface FormData {
  voornaam: string;
  achternaam: string;
  email: string;
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
  { id: 'applepay', label: 'Apple Pay', description: 'Betalen via Apple Pay' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function AfrekenPage() {
  const { items, getTotal, clearCart, discountCode, discountAmount, discountDescription, applyDiscount, removeDiscount } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState<FormData>(() => {
    const defaultForm: FormData = { voornaam: '', achternaam: '', email: '', straat: '', huisnummer: '', postcode: '', plaats: '', opmerkingen: '', betaalmethode: 'ideal' };
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gameshop-checkout');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed === 'object' && parsed !== null) {
            const safe: FormData = { ...defaultForm };
            for (const key of Object.keys(defaultForm) as (keyof FormData)[]) {
              if (key in parsed && typeof parsed[key] === 'string') {
                safe[key] = parsed[key] as string;
              }
            }
            safe.betaalmethode = safe.betaalmethode || 'ideal';
            safe.opmerkingen = '';
            return safe;
          }
        }
      } catch {
        localStorage.removeItem('gameshop-checkout');
      }
    }
    return defaultForm;
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  // Bewaar adresgegevens in localStorage (niet opmerkingen)
  useEffect(() => {
    const { opmerkingen, ...toSave } = form;
    localStorage.setItem('gameshop-checkout', JSON.stringify(toSave));
  }, [form]);

  const validations: Partial<Record<keyof FormData, { test: (v: string) => boolean; message: string }>> = {
    voornaam: { test: (v) => v.trim().length > 0, message: 'Voornaam is verplicht' },
    achternaam: { test: (v) => v.trim().length > 0, message: 'Achternaam is verplicht' },
    email: { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Voer een geldig e-mailadres in' },
    straat: { test: (v) => v.trim().length > 0, message: 'Straat is verplicht' },
    huisnummer: { test: (v) => v.trim().length > 0, message: 'Huisnummer is verplicht' },
    postcode: { test: (v) => /^\d{4}\s?[A-Za-z]{2}$/.test(v), message: 'Formaat: 1234 AB' },
    plaats: { test: (v) => v.trim().length > 0, message: 'Plaats is verplicht' },
  };

  const getFieldError = (field: keyof FormData): string | null => {
    if (!touched[field]) return null;
    const rule = validations[field];
    if (!rule) return null;
    return rule.test(form[field]) ? null : rule.message;
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const [confetti, setConfetti] = useState<{ x: number; y: number } | null>(null);
  const [orderNumber] = useState(() => `GE-${Date.now().toString(36).toUpperCase()}`);

  const subtotal = getTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  // Form completion progress
  const progress = useMemo(() => {
    const requiredFields: (keyof FormData)[] = ['voornaam', 'achternaam', 'email', 'straat', 'huisnummer', 'postcode', 'plaats'];
    let filled = 0;
    for (const f of requiredFields) {
      const rule = validations[f];
      if (rule && rule.test(form[f])) filled++;
    }
    return Math.round((filled / requiredFields.length) * 100);
  }, [form, validations]);

  const updateField = (field: keyof FormData, value: string) => {
    if (field === 'postcode') {
      const clean = value.replace(/\s/g, '').toUpperCase();
      if (clean.length >= 4 && /^\d{4}/.test(clean)) {
        const digits = clean.slice(0, 4);
        const letters = clean.slice(4, 6).replace(/[^A-Z]/g, '');
        value = letters ? `${digits} ${letters}` : digits;
      }
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valideer alle velden voor submit
    const allTouched: Partial<Record<keyof FormData, boolean>> = {};
    const requiredFields: (keyof FormData)[] = ['voornaam', 'achternaam', 'email', 'straat', 'huisnummer', 'postcode', 'plaats'];
    let hasErrors = false;

    for (const field of requiredFields) {
      allTouched[field] = true;
      const rule = validations[field];
      if (rule && !rule.test(form[field])) {
        hasErrors = true;
      }
    }
    setTouched((prev) => ({ ...prev, ...allTouched }));

    if (hasErrors) {
      // Scroll naar eerste veld met fout
      setTimeout(() => {
        const firstError = document.querySelector('.text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      addToast('Vul alle verplichte velden correct in', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate Mollie payment processing (in production, this calls backend API -> Mollie)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setIsProcessing(false);
    setConfetti({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    clearCart();
    addToast('Bestelling succesvol geplaatst!', 'success');
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
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="text-center py-12">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="h-20 w-20 mx-auto rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-lg"
            >
              <svg className="h-10 w-10 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Je winkelwagen is leeg</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Voeg eerst producten toe aan je winkelwagen</p>
            <Link href="/shop">
              <motion.span whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-shadow">
                Naar de shop
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
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
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative text-center px-4">
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
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Bedankt voor je bestelling!
            </motion.h1>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, type: 'spring' }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] mb-4">
              <span className="text-slate-400 text-sm">Bestelnummer:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{orderNumber}</span>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-slate-400 text-lg max-w-lg mx-auto mb-4 leading-relaxed">
              Je betaling is ontvangen en je bestelling wordt verwerkt. Je ontvangt een bevestiging per e-mail met de track-and-trace code zodra je pakket is verzonden.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-slate-500 text-sm mb-10">
              Vragen over je bestelling? Mail ons op{' '}
              <a href="mailto:gameshopenter@gmail.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">gameshopenter@gmail.com</a>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <motion.span whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-shadow">
                  Terug naar home
                </motion.span>
              </Link>
              <Link href="/shop">
                <motion.span whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold hover:bg-white/[0.1] hover:border-white/[0.15] transition-all">
                  Verder winkelen
                </motion.span>
              </Link>
            </motion.div>
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
          <motion.div animate={{ x: [0, 20, -10, 0], y: [0, -15, 5, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-10 right-[15%] w-48 h-48 rounded-full bg-emerald-500/5 blur-[60px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <Link href="/winkelwagen" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-4 transition-colors group">
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        {/* Stappen indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-0">
            {[
              { num: 1, label: 'Gegevens', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
              { num: 2, label: 'Betalen', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
              { num: 3, label: 'Bevestiging', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    i === 0
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={i === 0 ? 2 : 1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </div>
                  <span className={`text-xs font-semibold mt-1.5 ${
                    i === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>{step.label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 rounded-full ${
                    i === 0
                      ? 'bg-gradient-to-r from-emerald-400 to-slate-200 dark:to-slate-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Formulier voortgang</span>
            <span className={`text-xs font-bold ${progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {progress}%{progress === 100 && ' — Klaar om af te rekenen!'}
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        <form id="checkout-form" onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal info */}
              <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.5 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">1</span>
                  Persoonlijke gegevens
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {([
                    { field: 'voornaam' as const, label: 'Voornaam', placeholder: 'Jan', colSpan: false, autoComplete: 'given-name' },
                    { field: 'achternaam' as const, label: 'Achternaam', placeholder: 'de Vries', colSpan: false, autoComplete: 'family-name' },
                    { field: 'email' as const, label: 'E-mailadres', placeholder: 'jan@voorbeeld.nl', colSpan: true, type: 'email', autoComplete: 'email' },
                  ]).map(({ field, label, placeholder, colSpan, type, autoComplete }) => {
                    const error = getFieldError(field);
                    return (
                      <div key={field} className={colSpan ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{label} *</label>
                        <input
                          type={type || 'text'}
                          required
                          autoComplete={autoComplete}
                          value={form[field]}
                          onChange={(e) => updateField(field, e.target.value)}
                          onBlur={() => handleBlur(field)}
                          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${error ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 hover:border-slate-300 dark:hover:border-slate-500'} dark:bg-slate-700 dark:text-white`}
                          placeholder={placeholder}
                        />
                        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Address */}
              <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.5 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">2</span>
                  Bezorgadres
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {([
                    { field: 'straat' as const, label: 'Straat', placeholder: 'Kerkstraat', colSpan: 'sm:col-span-2', autoComplete: 'street-address' },
                    { field: 'huisnummer' as const, label: 'Huisnummer', placeholder: '12a', colSpan: '', autoComplete: 'address-line2' },
                    { field: 'postcode' as const, label: 'Postcode', placeholder: '1234 AB', colSpan: '', autoComplete: 'postal-code' },
                    { field: 'plaats' as const, label: 'Plaats', placeholder: 'Amsterdam', colSpan: 'sm:col-span-2', autoComplete: 'address-level2' },
                  ]).map(({ field, label, placeholder, colSpan, autoComplete }) => {
                    const error = getFieldError(field);
                    return (
                      <div key={field} className={colSpan}>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{label} *</label>
                        <input
                          type="text"
                          required
                          autoComplete={autoComplete}
                          value={form[field]}
                          onChange={(e) => updateField(field, e.target.value)}
                          onBlur={() => handleBlur(field)}
                          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${error ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 hover:border-slate-300 dark:hover:border-slate-500'} dark:bg-slate-700 dark:text-white`}
                          placeholder={placeholder}
                        />
                        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Payment method */}
              <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.5 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">3</span>
                  Betaalmethode
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-5 ml-11">Veilig betalen via Mollie</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {betaalmethoden.map((methode) => (
                    <label
                      key={methode.id}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        form.betaalmethode === methode.id
                          ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm shadow-emerald-500/10'
                          : 'border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <input type="radio" name="betaalmethode" value={methode.id} checked={form.betaalmethode === methode.id} onChange={(e) => updateField('betaalmethode', e.target.value)} className="sr-only" />
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${form.betaalmethode === methode.id ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-500'}`}>
                        {form.betaalmethode === methode.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }} className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{methode.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{methode.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.5 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-lg mb-4">Opmerkingen</h2>
                <textarea value={form.opmerkingen} onChange={(e) => updateField('opmerkingen', e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm resize-none hover:border-slate-300 dark:hover:border-slate-500 dark:bg-slate-700 dark:text-white" placeholder="Heb je speciale wensen of opmerkingen? (optioneel)" />
              </motion.div>
            </div>

            {/* Right: Order summary */}
            <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.5 }} className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 sticky top-28 shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-6 tracking-tight">Je bestelling</h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                  {items.map((item, index) => {
                    const colors = PLATFORM_COLORS[item.product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
                    const img = getCartItemImage(item);
                    const price = getCartItemPrice(item);
                    const key = item.variant ? `${item.product.sku}:${item.variant}` : item.product.sku;
                    return (
                      <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${img ? 'bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                          {img ? (
                            <Image src={img} alt={item.product.name} width={48} height={48} className="object-contain p-1" />
                          ) : (
                            <span className="text-white/30 text-[8px] font-bold">{PLATFORM_LABELS[item.product.platform]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.product.name}
                            {item.variant === 'cib' && <span className="ml-1 text-amber-600 dark:text-amber-400">(CIB)</span>}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex-shrink-0">{formatPrice(price * item.quantity)}</span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="space-y-3 text-sm border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Subtotaal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Verzending (PostNL)</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                  </div>

                  {/* Kortingscode */}
                  {discountCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{discountCode}</span>
                        <span className="text-[10px] text-emerald-500">{discountDescription}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600">-{formatPrice(discountAmount)}</span>
                        <button onClick={removeDiscount} className="text-slate-400 hover:text-red-500 transition-colors" aria-label="Kortingscode verwijderen">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Kortingscode"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && couponInput.trim()) {
                              e.preventDefault();
                              const result = applyDiscount(couponInput);
                              setCouponMessage({ text: result.message, success: result.success });
                              if (result.success) setCouponInput('');
                              setTimeout(() => setCouponMessage(null), 4000);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!couponInput.trim()) return;
                            const result = applyDiscount(couponInput);
                            setCouponMessage({ text: result.message, success: result.success });
                            if (result.success) setCouponInput('');
                            setTimeout(() => setCouponMessage(null), 4000);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all"
                        >
                          Toepassen
                        </button>
                      </div>
                      {couponMessage && (
                        <p className={`text-xs mt-1.5 font-medium ${couponMessage.success ? 'text-emerald-600' : 'text-red-500'}`}>
                          {couponMessage.text}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-slate-900 dark:text-white">Totaal</span>
                      <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-extrabold text-slate-900 dark:text-white text-2xl">{formatPrice(total)}</motion.span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Inclusief BTW</p>
                  </div>
                </div>

                {/* Geschatte levertijd */}
                <div className="mt-4 flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Verwachte levering</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(() => {
                        const now = new Date();
                        const isBefore17 = now.getHours() < 17;
                        const minDays = isBefore17 ? 1 : 2;
                        const maxDays = minDays + 2;
                        const min = new Date(now);
                        min.setDate(min.getDate() + minDays);
                        const max = new Date(now);
                        max.setDate(max.getDate() + maxDays);
                        const fmt = (d: Date) => d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
                        return `${fmt(min)} - ${fmt(max)}`;
                      })()}
                    </p>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isProcessing}
                  whileHover={isProcessing ? {} : { scale: 1.02, y: -1 }}
                  whileTap={isProcessing ? {} : { scale: 0.98 }}
                  className={`w-full mt-6 px-6 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35'}`}
                >
                  {isProcessing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-5 w-5 border-2 border-slate-400 dark:border-slate-500 border-t-transparent rounded-full" />
                      Betaling verwerken...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Veilig afrekenen — {formatPrice(total)}
                    </>
                  )}
                </motion.button>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Beveiligd door Mollie</span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                  {['iDEAL', 'Visa', 'MC', 'PayPal', 'Bancontact'].map((m) => (
                    <span key={m} className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-[9px] text-slate-500 dark:text-slate-400 font-semibold">{m}</span>
                  ))}
                </div>

                {new Date().getHours() < 17 && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Bestel voor 17:00, morgen in huis</span>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  {['100% originele producten', 'Persoonlijk getest op werking', 'Verzending via PostNL (1-3 werkdagen)', '14 dagen bedenktijd'].map((text, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <svg className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
      {/* Mobiele sticky totaalbalk */}
      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{items.reduce((s, i) => s + i.quantity, 0)} items</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatPrice(total)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className={`flex-1 max-w-[200px] px-5 py-3 rounded-xl font-bold text-sm text-center shadow-lg ${isProcessing ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 shadow-none' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25'}`}
          >
            {isProcessing ? 'Verwerken...' : 'Afrekenen'}
          </button>
        </div>
      </div>

      {confetti && <ConfettiBurst x={confetti.x} y={confetti.y} onComplete={() => setConfetti(null)} />}
    </div>
  );
}
