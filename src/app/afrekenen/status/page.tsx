'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="pt-16 lg:pt-20 min-h-screen bg-[#050810] flex items-center justify-center"><div className="h-12 w-12 border-3 border-white/30 border-t-white rounded-full animate-spin" /></div>}>
      <StatusContent />
    </Suspense>
  );
}

function StatusContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [status, setStatus] = useState<string>('loading');
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderNumber) {
      setStatus('error');
      setError('Geen bestelnummer gevonden');
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/mollie/status?order=${orderNumber}`);
        const data = await res.json();

        if (data.error) {
          setStatus('pending');
          return;
        }

        setStatus(data.status);

        if (data.status === 'paid' || data.status === 'authorized') {
          clearCart();
        }
      } catch {
        setStatus('pending');
      }
    };

    checkStatus();
    // Poll elke 3 seconden voor status updates
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [orderNumber, clearCart]);

  const statusConfig: Record<string, { icon: string; title: string; description: string; color: string }> = {
    loading: {
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Betaling controleren...',
      description: 'Even geduld, we controleren je betaling bij Mollie.',
      color: 'from-blue-500 to-cyan-500',
    },
    paid: {
      icon: 'M4.5 12.75l6 6 9-13.5',
      title: 'Betaling geslaagd!',
      description: 'Je bestelling is ontvangen en betaald. Je ontvangt een bevestigingsmail.',
      color: 'from-emerald-500 to-teal-500',
    },
    authorized: {
      icon: 'M4.5 12.75l6 6 9-13.5',
      title: 'Betaling goedgekeurd!',
      description: 'Je bestelling wordt verwerkt. Je ontvangt een bevestigingsmail.',
      color: 'from-emerald-500 to-teal-500',
    },
    pending: {
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Betaling wordt verwerkt',
      description: 'Je betaling wordt nog verwerkt. Dit kan even duren.',
      color: 'from-amber-500 to-orange-500',
    },
    canceled: {
      icon: 'M6 18L18 6M6 6l12 12',
      title: 'Betaling geannuleerd',
      description: 'Je betaling is geannuleerd. Je kunt opnieuw bestellen.',
      color: 'from-red-500 to-rose-500',
    },
    expired: {
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Betaling verlopen',
      description: 'De betalingslink is verlopen. Probeer het opnieuw.',
      color: 'from-slate-500 to-slate-600',
    },
    failed: {
      icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
      title: 'Betaling mislukt',
      description: 'Er ging iets mis met je betaling. Probeer het opnieuw of kies een andere betaalmethode.',
      color: 'from-red-500 to-rose-500',
    },
    error: {
      icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
      title: 'Er ging iets mis',
      description: error || 'Neem contact met ons op als dit probleem aanhoudt.',
      color: 'from-red-500 to-rose-500',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const isPaid = status === 'paid' || status === 'authorized';

  return (
    <div className="pt-16 lg:pt-20">
      <div className="relative bg-[#050810] min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative text-center px-4 max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className={`h-24 w-24 mx-auto rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-8 shadow-2xl`}
          >
            {status === 'loading' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-12 w-12 border-3 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
              </svg>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight"
          >
            {config.title}
          </motion.h1>

          {orderNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] mb-4"
            >
              <span className="text-slate-400 text-sm">Bestelnummer:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{orderNumber}</span>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed"
          >
            {config.description}
          </motion.p>

          {isPaid && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-slate-500 text-sm mb-10"
            >
              Vragen? Mail ons op{' '}
              <a href="mailto:gameshopenter@gmail.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                gameshopenter@gmail.com
              </a>
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-shadow"
              >
                Terug naar home
              </motion.span>
            </Link>
            {!isPaid && (
              <Link href="/winkelwagen">
                <motion.span
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold hover:bg-white/[0.1] transition-all"
                >
                  Opnieuw proberen
                </motion.span>
              </Link>
            )}
            {isPaid && (
              <Link href="/shop">
                <motion.span
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold hover:bg-white/[0.1] transition-all"
                >
                  Verder winkelen
                </motion.span>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
