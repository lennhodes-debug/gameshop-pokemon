'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const contactMethods = [
  {
    icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
    label: 'E-mail',
    value: 'gameshopenter@gmail.com',
    href: 'mailto:gameshopenter@gmail.com',
    response: 'Reactie binnen 24 uur',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: 'M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
    label: 'Contactformulier',
    value: 'Stuur een bericht',
    href: '#contactform',
    response: 'Reactie binnen 24 uur',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/20',
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero header */}
      <div className="relative bg-[#050810] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.08),transparent_50%)]" />

        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[15%] w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] rotate-12"
        />
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[20%] left-[10%] w-14 h-14 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.06]"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } } }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Contact
            </motion.span>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } } }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-5"
            >
              Neem{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                contact
              </span>{' '}
              op
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } } }}
              className="text-lg lg:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed"
            >
              Heb je een vraag, opmerking of hulp nodig? Wij staan voor je klaar en reageren binnen 24 uur.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Contact methods cards */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {contactMethods.map((method, i) => (
            <motion.a
              key={method.label}
              href={method.href}
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] as const }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
              whileTap={{ scale: 0.98 }}
              className={`group bg-white rounded-2xl border border-slate-100 p-6 shadow-lg ${method.glow} hover:shadow-xl transition-all duration-300 text-center`}
            >
              <motion.div
                className={`inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br ${method.gradient} items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={method.icon} />
                </svg>
              </motion.div>
              <h3 className="font-bold text-slate-900 mb-1">{method.label}</h3>
              <p className="text-emerald-600 font-semibold text-sm mb-2 group-hover:text-emerald-700 transition-colors">{method.value}</p>
              <p className="text-xs text-slate-400">{method.response}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left column: info */}
          <motion.div
            initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Wij helpen je graag
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Of je nu een vraag hebt over een product, je bestelling wilt opvolgen, of gewoon advies wilt over welke game of console het beste bij je past - we staan klaar om te helpen.
            </p>

            {/* Openingstijden */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Openingstijden</h3>
              {[
                { dag: 'Maandag t/m vrijdag', tijd: '09:00 — 17:00', actief: true },
                { dag: 'Zaterdag', tijd: '10:00 — 14:00', actief: true },
                { dag: 'Zondag', tijd: 'Gesloten', actief: false },
              ].map((item) => (
                <div key={item.dag} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600 font-medium">{item.dag}</span>
                  <span className={`text-xs font-medium ${item.actief ? 'text-emerald-600' : 'text-slate-400'}`}>{item.tijd}</span>
                </div>
              ))}
              <p className="text-xs text-slate-400">Reactie op e-mails binnen 24 uur op werkdagen</p>
            </div>

            {/* Business details mini */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Bedrijfsgegevens</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bedrijf</span>
                  <span className="text-slate-700 font-medium">Gameshop Enter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Eigenaar</span>
                  <span className="text-slate-700 font-medium">Lenn Hodes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">KvK</span>
                  <span className="text-slate-700 font-medium">93642474</span>
                </div>
              </div>
            </div>

            {/* Bereikbaarheid */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Bereikbaarheid</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ma - Vr</span>
                  <span className="text-slate-700 font-medium">09:00 - 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Za - Zo</span>
                  <span className="text-slate-700 font-medium">10:00 - 18:00</span>
                </div>
              </div>
            </div>

            {/* Snelle vragen */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Snelle antwoorden</h3>
              {[
                { q: 'Kan ik mijn bestelling afhalen?', a: 'Nee, wij zijn een online webshop. Alle bestellingen worden verzonden via PostNL.' },
                { q: 'Hoe lang duurt de levering?', a: 'Bestellingen worden binnen 1-3 werkdagen bezorgd via PostNL.' },
                { q: 'Kan ik games bij jullie verkopen?', a: 'Ja! Bekijk onze inkooppagina voor prijzen en stuur ons een e-mail.' },
              ].map((item) => (
                <div key={item.q} className="p-3 rounded-xl bg-white border border-slate-100">
                  <p className="text-xs font-semibold text-slate-700">{item.q}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-amber-50 border border-amber-200/60 rounded-xl">
              <div className="flex items-start gap-2.5">
                <svg className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right column: form */}
          <motion.div
            initial={{ opacity: 0, x: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-3"
            id="contactform"
          >
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Stuur een bericht</h2>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-5"
                  >
                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Bericht verzonden!</h3>
                  <p className="text-slate-500 mb-6">Bedankt voor je bericht. Wij reageren zo snel mogelijk, meestal binnen 24 uur.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    Nog een bericht sturen
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Naam</label>
                      <input
                        id="name"
                        type="text"
                        required
                        className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                        placeholder="Je naam"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
                      <input
                        id="email"
                        type="email"
                        required
                        className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                        placeholder="je@email.nl"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">Onderwerp</label>
                    <select
                      id="subject"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none"
                    >
                      <option value="">Selecteer een onderwerp</option>
                      <option value="bestelling">Vraag over een bestelling</option>
                      <option value="product">Vraag over een product</option>
                      <option value="retour">Retourzending</option>
                      <option value="advies">Advies over een game of console</option>
                      <option value="overig">Overig</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">Bericht</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all resize-none"
                      placeholder="Typ je bericht..."
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Versturen
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
