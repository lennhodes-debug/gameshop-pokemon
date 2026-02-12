'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [canTrigger, setCanTrigger] = useState(false);

  // Wacht 5 seconden na page load voordat modal kan triggeren
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanTrigger(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  }, [email]);

  // Detecteer mouseleave op bovenkant viewport
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY < 0 &&
        canTrigger &&
        !sessionStorage.getItem('gameshop-exit-shown')
      ) {
        sessionStorage.setItem('gameshop-exit-shown', 'true');
        setIsVisible(true);
      }
    };

    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canTrigger]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient lijn bovenkant */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            {/* Sluit knop */}
            <button
              onClick={handleClose}
              aria-label="Sluiten"
              className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-4"
                >
                  <div className="inline-flex h-14 w-14 rounded-full bg-emerald-100 items-center justify-center mb-4">
                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                    Bedankt!
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Check je inbox voor de kortingscode.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                      Wacht even!
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Schrijf je in voor onze nieuwsbrief en ontvang 10% korting op je eerste bestelling
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="je@email.nl"
                      required
                      aria-label="E-mailadres"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow"
                    >
                      Ja, ik wil 10% korting!
                    </motion.button>
                  </form>

                  <div className="text-center mt-4">
                    <button
                      onClick={handleClose}
                      className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                    >
                      Nee bedankt
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
