'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InkoopPage() {
  const [form, setForm] = useState({
    naam: '',
    email: '',
    telefoon: '',
    beschrijving: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateMailto = () => {
    const subject = encodeURIComponent('Inkoop aanvraag — Games verkopen');
    const body = encodeURIComponent(
      `Hallo Gameshop Enter,\n\nIk wil graag games/consoles verkopen.\n\nNaam: ${form.naam}\nE-mail: ${form.email}\nTelefoon: ${form.telefoon || 'Niet opgegeven'}\n\nBeschrijving:\n${form.beschrijving}\n\n(Foto's worden als bijlage meegestuurd)\n\nMet vriendelijke groet,\n${form.naam}`
    );
    return `mailto:gameshopenter@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = generateMailto();
    setSubmitted(true);
  };

  return (
    <div className="pt-16 lg:pt-20">
      {/* Hero */}
      <div className="relative bg-[#050810] py-14 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.08),transparent_50%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Snel & eerlijk
            </span>

            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Games{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Verkopen
              </span>
            </h1>
            <p className="text-slate-400 text-base lg:text-lg max-w-xl mx-auto mb-8">
              Stuur foto&apos;s van je Nintendo games en consoles, dan doen wij je een eerlijk bod. Simpel en snel.
            </p>

            {/* 3 Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {[
                { step: '1', title: "Maak foto's", desc: "Maak duidelijke foto's van je games of consoles", icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z' },
                { step: '2', title: 'Stuur ze op', desc: 'Vul het formulier in en stuur je foto\'s via e-mail', icon: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5' },
                { step: '3', title: 'Ontvang je bod', desc: 'Wij reageren binnen 24 uur met een eerlijk bod', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + parseInt(item.step) * 0.1 }}
                  className="flex flex-col items-center gap-2 bg-white/[0.04] rounded-xl px-4 py-5 border border-white/[0.06]"
                >
                  <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white mb-1 shadow-lg shadow-emerald-500/20">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </span>
                  <h3 className="text-white font-bold text-sm">{item.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form + Info */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
                    className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/25"
                  >
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </motion.div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Je e-mail app is geopend!</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 max-w-sm mx-auto">
                    Vergeet niet je foto&apos;s als bijlage toe te voegen voordat je de e-mail verstuurt. We reageren binnen 24 uur met een bod.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    Nieuw formulier invullen
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                    Wat wil je verkopen?
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Vul het formulier in en stuur foto&apos;s mee via e-mail. Wij doen je een eerlijk bod.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Naam *</label>
                        <input
                          type="text"
                          required
                          value={form.naam}
                          onChange={(e) => updateField('naam', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm dark:bg-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-slate-500"
                          placeholder="Je naam"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">E-mail *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm dark:bg-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-slate-500"
                          placeholder="je@email.nl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Telefoon <span className="text-slate-400 font-normal">(optioneel)</span></label>
                      <input
                        type="tel"
                        value={form.telefoon}
                        onChange={(e) => updateField('telefoon', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm dark:bg-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-slate-500"
                        placeholder="06-12345678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Welke games/consoles wil je verkopen? *</label>
                      <textarea
                        required
                        value={form.beschrijving}
                        onChange={(e) => updateField('beschrijving', e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm resize-none dark:bg-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-slate-500"
                        placeholder="Beschrijf hier welke games en/of consoles je wilt verkopen. Vermeld ook de staat (nieuw, gebruikt, beschadigd) en of je de originele doos en handleiding nog hebt."
                      />
                    </div>

                    {/* Photo instruction */}
                    <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl px-4 py-3 border border-amber-200/60 dark:border-amber-800/40">
                      <div className="flex items-start gap-2.5">
                        <svg className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          <span className="font-semibold text-slate-700 dark:text-white">Tip:</span> Na het verzenden opent je e-mail app. Voeg daar je foto&apos;s toe als bijlage. Duidelijke foto&apos;s helpen ons een beter bod te doen!
                        </p>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-shadow flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      Verstuur via e-mail
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2 space-y-5"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4">Waarom bij ons verkopen?</h3>
              <div className="space-y-4">
                {[
                  { title: 'Eerlijke prijzen', desc: 'Onze biedingen zijn gebaseerd op de actuele marktwaarde', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
                  { title: 'Snelle afhandeling', desc: 'Reactie binnen 24 uur, betaling binnen 2 werkdagen', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
                  { title: 'Alle Nintendo platforms', desc: 'Van NES tot Switch, wij kopen het allemaal in', icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z' },
                  { title: 'Gratis verzending', desc: 'Stuur je pakket gratis op via PostNL', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Direct contact */}
            <div className="bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-white font-bold text-sm mb-2">Liever direct contact?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Stuur je foto&apos;s en beschrijving direct naar ons e-mailadres. We reageren binnen 24 uur.
              </p>
              <a
                href="mailto:gameshopenter@gmail.com?subject=Inkoop%20aanvraag"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                gameshopenter@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
