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
  const [formData, setFormData] = useState({ naam: '', email: '', onderwerp: '', bericht: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validations: Record<string, { test: (v: string) => boolean; message: string }> = {
    naam: { test: (v) => v.trim().length > 0, message: 'Naam is verplicht' },
    email: { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Voer een geldig e-mailadres in' },
    onderwerp: { test: (v) => v.length > 0, message: 'Selecteer een onderwerp' },
    bericht: { test: (v) => v.trim().length >= 10, message: 'Bericht moet minimaal 10 tekens bevatten' },
  };

  const getError = (field: string) => {
    if (!touched[field]) return null;
    const rule = validations[field];
    return rule && !rule.test(formData[field as keyof typeof formData]) ? rule.message : null;
  };

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const allTouched: Record<string, boolean> = {};
    let hasErrors = false;
    for (const field of Object.keys(validations)) {
      allTouched[field] = true;
      if (!validations[field].test(formData[field as keyof typeof formData])) hasErrors = true;
    }
    setTouched(prev => ({ ...prev, ...allTouched }));
    if (hasErrors) {
      setTimeout(() => {
        document.querySelector('.text-red-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    const formBody = new URLSearchParams({
      'form-name': 'contact',
      naam: formData.naam,
      email: formData.email,
      onderwerp: formData.onderwerp,
      bericht: formData.bericht,
    });

    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ naam: '', email: '', onderwerp: '', bericht: '' });
        setTouched({});
      } else {
        setSubmitError('Er ging iets mis bij het versturen. Probeer het opnieuw.');
      }
    } catch {
      setSubmitError('Kon geen verbinding maken. Stuur een e-mail naar gameshopenter@gmail.com.');
    }
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
              className={`group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-lg ${method.glow} hover:shadow-xl transition-all duration-300 text-center`}
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
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{method.label}</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{method.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{method.response}</p>
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
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              Wij helpen je graag
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
              Of je nu een vraag hebt over een product, je bestelling wilt opvolgen, of gewoon advies wilt over welke game of console het beste bij je past - we staan klaar om te helpen.
            </p>

            {/* Openingstijden */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Openingstijden</h3>
              {[
                { dag: 'Maandag t/m vrijdag', tijd: '09:00 — 17:00', actief: true },
                { dag: 'Zaterdag', tijd: '10:00 — 14:00', actief: true },
                { dag: 'Zondag', tijd: 'Gesloten', actief: false },
              ].map((item) => (
                <div key={item.dag} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${item.actief ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    {item.dag}
                  </span>
                  <span className={`text-xs font-medium ${item.actief ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{item.tijd}</span>
                </div>
              ))}
              <p className="text-xs text-slate-400">Reactie op e-mails binnen 24 uur op werkdagen</p>
            </div>

            {/* Business details mini */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Bedrijfsgegevens</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bedrijf</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Gameshop Enter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Eigenaar</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Lenn Hodes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">KvK</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">93642474</span>
                </div>
              </div>
            </div>

            {/* Snelle vragen */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Snelle antwoorden</h3>
              {[
                { q: 'Kan ik mijn bestelling afhalen?', a: 'Nee, wij zijn een online webshop. Alle bestellingen worden verzonden via PostNL.' },
                { q: 'Hoe lang duurt de levering?', a: 'Bestellingen worden binnen 1-3 werkdagen bezorgd via PostNL.' },
                { q: 'Kan ik games bij jullie verkopen?', a: 'Ja! Bekijk onze inkooppagina voor prijzen en stuur ons een e-mail.' },
              ].map((item) => (
                <div key={item.q} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.q}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-2.5">
                <svg className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
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
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              {/* Gradient top-border accent */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Stuur een bericht</h2>
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
                      className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center mb-5"
                    >
                      <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bericht verzonden!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Bedankt voor je bericht. Wij reageren zo snel mogelijk, meestal binnen 24 uur.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
                    >
                      Nog een bericht sturen
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} name="contact" className="space-y-5" noValidate>
                    <input type="hidden" name="form-name" value="contact" />
                    {submitError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{submitError}</p>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Naam *</label>
                        <input
                          id="name"
                          type="text"
                          value={formData.naam}
                          onChange={(e) => setFormData(prev => ({ ...prev, naam: e.target.value }))}
                          onBlur={() => handleBlur('naam')}
                          className={`block w-full rounded-xl border bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:outline-none transition-all ${getError('naam') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                          placeholder="Je naam"
                        />
                        {getError('naam') && <p className="text-xs text-red-500 mt-1 font-medium">{getError('naam')}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">E-mail *</label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          onBlur={() => handleBlur('email')}
                          className={`block w-full rounded-xl border bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:outline-none transition-all ${getError('email') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                          placeholder="je@email.nl"
                        />
                        {getError('email') && <p className="text-xs text-red-500 mt-1 font-medium">{getError('email')}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Onderwerp *</label>
                      <div className="relative">
                        <select
                          id="subject"
                          value={formData.onderwerp}
                          onChange={(e) => setFormData(prev => ({ ...prev, onderwerp: e.target.value }))}
                          onBlur={() => handleBlur('onderwerp')}
                          className={`block w-full rounded-xl border bg-white dark:bg-slate-700 px-4 py-3 pr-10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all appearance-none ${getError('onderwerp') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                        >
                          <option value="">Selecteer een onderwerp</option>
                          <option value="Vraag over een bestelling">Vraag over een bestelling</option>
                          <option value="Vraag over een product">Vraag over een product</option>
                          <option value="Retourzending">Retourzending</option>
                          <option value="Advies over een Pokémon game">Advies over een Pokémon game</option>
                          <option value="Overig">Overig</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                      </div>
                      {getError('onderwerp') && <p className="text-xs text-red-500 mt-1 font-medium">{getError('onderwerp')}</p>}
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Bericht *</label>
                      <textarea
                        id="message"
                        rows={5}
                        maxLength={500}
                        value={formData.bericht}
                        onChange={(e) => setFormData(prev => ({ ...prev, bericht: e.target.value }))}
                        onBlur={() => handleBlur('bericht')}
                        className={`block w-full rounded-xl border bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:outline-none transition-all resize-none ${getError('bericht') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                        placeholder="Typ je bericht... (minimaal 10 tekens)"
                      />
                      <div className="flex justify-between mt-1">
                        {getError('bericht') ? (
                          <p className="text-xs text-red-500 font-medium">{getError('bericht')}</p>
                        ) : (
                          <span />
                        )}
                        <span className={`text-xs ml-auto ${formData.bericht.length >= 10 ? 'text-slate-400' : 'text-slate-300'}`}>
                          {formData.bericht.length}/500
                        </span>
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Versturen
                      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </Button>
                  </form>
                )}

                {/* Social proof */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="flex text-amber-400">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                  <span>5.0 score op Marktplaats — 1360+ reviews</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
