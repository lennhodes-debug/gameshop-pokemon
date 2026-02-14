'use client';

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'newsletter', email }).toString(),
      });
      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        setError('Er ging iets mis. Probeer het opnieuw.');
      }
    } catch {
      setError('Geen verbinding. Controleer je internet en probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-28 lg:py-40 overflow-hidden">
      {/* Multi-layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top radial shine */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="inline-flex h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center mb-8"
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl lg:text-[52px] font-light text-white tracking-[-0.03em] leading-[1.05] mb-4"
          >
            Mis geen enkele aanwinst
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-white/75 mb-4 max-w-lg mx-auto"
          >
            Ontvang exclusieve kortingscodes, word als eerste ge&iuml;nformeerd over zeldzame aanwinsten en krijg early access bij nieuwe drops
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-white/50 text-sm mb-8 flex items-center justify-center gap-2"
          >
            <span className="flex -space-x-1.5">
              {['E', 'T', 'L', 'K'].map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.45 + i * 0.06 }}
                  className="h-6 w-6 rounded-full bg-white/[0.12] flex items-center justify-center text-[10px] font-medium text-white/70"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            <span>500+ gamers ontvangen al updates</span>
          </motion.p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-white/15 backdrop-blur-sm"
            >
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-white font-medium block">Je staat op de lijst!</span>
                <span className="text-white/60 text-sm">Je ontvangt als eerste updates over nieuwe aanwinsten.</span>
              </div>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              name="newsletter"
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <input type="hidden" name="form-name" value="newsletter" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                aria-label="E-mailadres voor nieuwsbrief"
                required
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm text-white placeholder:text-white/35 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/25 focus:bg-white/[0.12] transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative px-8 py-4 rounded-2xl bg-white text-slate-900 font-medium text-sm shadow-lg hover:shadow-xl hover:bg-white/95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
              >
                {/* Button shine sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    Aanmelden...
                  </>
                ) : (
                  'Aanmelden'
                )}
              </button>
            </motion.form>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-200 text-sm mt-4"
            >
              {error}
            </motion.p>
          )}

          <p className="text-white/35 text-xs mt-6">
            Geen spam, alleen relevante updates. Je kunt je altijd afmelden.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
