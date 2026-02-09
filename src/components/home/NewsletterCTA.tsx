'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    // Simulatie: in productie wordt dit een API call naar een e-mail service
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />

      {/* Animated orbs */}
      <motion.div
        style={{ y: orbY }}
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-[80px]"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-30, 30]) }}
        className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-cyan-400/20 blur-[60px]"
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] left-[10%] w-16 h-16 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/10 rotate-12"
      />
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[30%] right-[12%] w-12 h-12 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/10"
      />
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[25%] left-[25%] w-10 h-10 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 -rotate-6"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
            className="inline-flex h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center mb-8"
          >
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </motion.div>

          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Mis geen enkele aanwinst
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-lg mx-auto">
            Ontvang exclusieve kortingscodes, word als eerste ge&iuml;nformeerd over zeldzame aanwinsten en krijg early access bij nieuwe drops
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.2 }}
                className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-left"
              >
                <span className="text-white font-bold block">Je staat op de lijst!</span>
                <span className="text-white/60 text-sm">Je ontvangt als eerste updates over nieuwe aanwinsten.</span>
              </motion.div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Jouw e-mailadres"
                  aria-label="E-mailadres voor nieuwsbrief"
                  required
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all disabled:opacity-60"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={isSubmitting ? {} : { scale: 1.03, y: -1 }}
                whileTap={isSubmitting ? {} : { scale: 0.97 }}
                className="px-8 py-4 rounded-2xl bg-white text-emerald-700 font-bold text-sm shadow-xl shadow-black/10 hover:shadow-2xl transition-shadow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                    Aanmelden...
                  </>
                ) : 'Aanmelden'}
              </motion.button>
            </form>
          )}

          <p className="text-white/40 text-xs mt-6">
            Geen spam, alleen relevante updates. Je kunt je altijd afmelden.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
