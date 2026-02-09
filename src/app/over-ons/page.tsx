'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString('nl-NL')}{suffix}</span>;
}

const timeline = [
  {
    year: '2018',
    title: 'De eerste stappen',
    description: 'Op mijn 14e begon ik met het verkopen van verzamelkaarten op Marktplaats. Pokemon-kaarten, Nintendo-kaarten - alles wat ik kon vinden. Wat begon als zakgeld verdienen, werd al snel een echte passie voor ondernemen.',
    icon: '🃏',
    color: 'from-purple-500 to-violet-500',
  },
  {
    year: '2019',
    title: 'Leren door vallen en opstaan',
    description: 'Ik waagde me aan het verkopen van iPhones en PlayStation 5 consoles. Helaas werd ik meerdere keren opgelicht. Een harde les, maar het leerde me alles over vertrouwen, kwaliteitscontrole en het belang van eerlijk zakendoen.',
    icon: '📱',
    color: 'from-slate-500 to-slate-600',
  },
  {
    year: '2020',
    title: 'De overstap naar Pokemon games',
    description: 'Na de tegenslagen besloot ik terug te gaan naar mijn passie: Nintendo. Ik begon met het inkopen, testen en doorverkopen van originele Pokemon-games. De focus op kwaliteit en originaliteit maakte het verschil.',
    icon: '🎮',
    color: 'from-amber-500 to-orange-500',
  },
  {
    year: '2022',
    title: 'Gameshop Enter is geboren',
    description: 'Van Pokemon-games groeide mijn assortiment naar de volledige Nintendo-sector. NES, Super Nintendo, Game Boy, GameCube, Wii, Nintendo Switch - het werd tijd voor een echte naam. Gameshop Enter was geboren.',
    icon: '🚀',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    year: '2023',
    title: 'Studie en ondernemen',
    description: 'Ik startte met de studie Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Theorie en praktijk versterken elkaar: wat ik leer, pas ik direct toe bij Gameshop Enter.',
    icon: '📚',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    year: '2024',
    title: '3000+ tevreden klanten',
    description: 'Een enorme mijlpaal: meer dan 3000 tevreden klanten en 1360+ reviews op Marktplaats met een perfecte 5.0 score. Het assortiment groeide naar 820+ producten over 12 Nintendo platforms.',
    icon: '⭐',
    color: 'from-amber-400 to-yellow-500',
  },
  {
    year: '2025',
    title: 'Meer dan 820 producten online',
    description: 'Het assortiment groeide explosief naar 820+ producten over 12 Nintendo platforms. De nieuwe webshop ging live met professionele cover art, uitgebreide beschrijvingen en een volledig inkoopsysteem voor klanten die hun games willen verkopen.',
    icon: '🌐',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    year: 'Nu',
    title: 'De Nintendo specialist van Nederland',
    description: 'Gameshop Enter is uitgegroeid tot dé Nintendo specialist. Van retro klassiekers tot de nieuwste Switch-games - elke dag werk ik eraan om de beste ervaring te bieden aan elke Nintendo-liefhebber.',
    icon: '👑',
    color: 'from-emerald-400 to-cyan-400',
  },
];

const values = [
  {
    title: 'Originaliteit',
    description: 'Uitsluitend 100% originele Nintendo producten. Geen reproducties, geen namaak. Elk product is persoonlijk gecontroleerd.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Transparantie',
    description: 'Elke productpagina vermeldt duidelijk de conditie en compleetheid. Je weet precies wat je koopt.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Kwaliteit',
    description: 'Elk product wordt persoonlijk getest op werking. Zorgvuldig verpakt en snel verzonden via PostNL.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Passie',
    description: 'Opgericht vanuit een persoonlijke liefde voor Nintendo. Dat merk je in alles wat we doen - van de selectie tot de service.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    gradient: 'from-rose-500 to-pink-500',
  },
];

const stats = [
  { value: 3000, suffix: '+', label: 'Tevreden klanten' },
  { value: 1360, suffix: '+', label: 'Reviews' },
  { value: 5, suffix: '.0', label: 'Marktplaats score' },
  { value: 820, suffix: '+', label: 'Producten' },
  { value: 12, suffix: '', label: 'Nintendo platforms' },
  { value: 7, suffix: '+', label: 'Jaar ervaring' },
];

export default function OverOnsPage() {
  const timelineRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start end', 'end start'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <div className="relative bg-[#050810] py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.1),transparent_50%)]" />

        {/* Floating shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 right-[15%] opacity-[0.03]"
        >
          <svg width="150" height="150" viewBox="0 0 120 120" fill="none">
            <path d="M60 5 L108 30 L108 90 L60 115 L12 90 L12 30 Z" stroke="white" strokeWidth="0.5" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[30%] left-[8%] w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] rotate-12"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[25%] right-[8%] w-12 h-12 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.06]"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ons verhaal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6">
              Van kaarten op Marktplaats<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                tot Nintendo specialist
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Het eerlijke verhaal van Lenn Hodes: van tegenslagen en lessen tot de oprichting van Gameshop Enter.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <section className="relative bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal intro */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
            Hoi, ik ben Lenn
          </h2>
          <div className="space-y-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Mijn naam is Lenn Hodes, oprichter van Gameshop Enter. In 2018, toen ik 14 was, begon ik met het verkopen van verzamelkaarten op Marktplaats. Het was mijn eerste stap in het ondernemerschap - en het begin van een reis met pieken en dalen.
            </p>
            <p>
              Na de kaarten waagde ik me aan iPhones en PlayStation 5 consoles. Dat liep niet goed: ik werd meerdere keren opgelicht. Het waren harde lessen, maar ze hebben me gevormd tot de ondernemer die ik nu ben. Ik leerde het belang van <strong className="text-slate-900 dark:text-white">vertrouwen</strong>, <strong className="text-slate-900 dark:text-white">kwaliteitscontrole</strong> en <strong className="text-slate-900 dark:text-white">eerlijk zakendoen</strong>.
            </p>
            <p>
              Uiteindelijk keerde ik terug naar mijn echte passie: Nintendo. Ik begon met Pokemon-games en groeide van daaruit naar de volledige Nintendo-sector. Van klassieke NES- en Super Nintendo-titels tot de nieuwste Nintendo Switch-games, en van Game Boy tot GameCube-consoles. Elk product test ik persoonlijk op werking en verpak ik zorgvuldig.
            </p>
            <p>
              Naast Gameshop Enter studeer ik Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Wat ik leer, pas ik direct toe in de praktijk. Die combinatie maakt mij niet alleen een betere ondernemer, maar ook een betere partner voor mijn klanten.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section ref={timelineRef} className="relative bg-[#050810] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)]" />

        {/* Floating particles */}
        {[
          { t: '15%', l: '10%', d: 4 },
          { t: '30%', l: '85%', d: 5 },
          { t: '50%', l: '5%', d: 3.5 },
          { t: '70%', l: '90%', d: 4.5 },
          { t: '85%', l: '15%', d: 5.5 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
            style={{ top: p.t, left: p.l }}
            animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: p.d, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Tijdlijn
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
              Mijn reis
            </h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">
              Van de eerste kaart op Marktplaats tot Nintendo specialist - elk hoofdstuk heeft me gevormd.
            </p>
          </motion.div>

          <div className="relative">
            {/* Animated vertical line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-white/[0.06] lg:-translate-x-px" />
            <motion.div
              className="absolute left-6 lg:left-1/2 top-0 w-px bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 lg:-translate-x-px origin-top"
              style={{ height: lineHeight }}
            />

            <div className="space-y-16">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative flex items-start gap-8 lg:gap-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Dot with icon */}
                  <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      whileInView={{ scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-lg ring-4 ring-[#050810]`}
                    >
                      {item.icon}
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ml-20 lg:ml-0 ${i % 2 === 0 ? 'lg:pr-20 lg:text-right' : 'lg:pl-20'}`}>
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors duration-300"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-xs font-bold mb-3`}>
                        {item.year}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-sm">{item.description}</p>
                    </motion.div>
                  </div>

                  {/* Spacer for other side */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission - quote style */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 items-center justify-center text-white mb-8 shadow-lg shadow-emerald-500/25"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </motion.div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Missie
            </span>
            <blockquote className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-6 max-w-3xl mx-auto">
              &ldquo;Ik geloof dat retro gaming meer is dan nostalgie. Het is een manier om tijdloze klassiekers te bewaren en te delen met de volgende generatie gamers.&rdquo;
            </blockquote>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Mijn missie is om elke Nintendo-liefhebber toegang te geven tot originele, geteste producten tegen eerlijke prijzen, met de persoonlijke service die je verdient.
            </p>
            <div className="mt-6 text-sm text-slate-400 font-medium">
              — Lenn Hodes, oprichter Gameshop Enter
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-widest mb-4">
              Kernwaarden
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Waar wij voor staan
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl hover:border-emerald-200/50 dark:hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mb-5 shadow-lg`}>
                  {value.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{value.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business details */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8 lg:p-12"
        >
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">Bedrijfsgegevens</h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
            {[
              ['Bedrijfsnaam', 'Gameshop Enter'],
              ['Eigenaar', 'Lenn Hodes'],
              ['KvK-nummer', '93642474'],
              ['Actief sinds', '2018'],
              ['Specialisatie', 'Originele Nintendo games en consoles'],
              ['Platforms', '12 Nintendo platforms'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</dt>
                <dd className="text-slate-900 dark:text-white font-medium">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">E-mail</dt>
              <dd><a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">gameshopenter@gmail.com</a></dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Webshop</dt>
              <dd className="text-slate-900 dark:text-white font-medium">Uitsluitend online — geen afhalen</dd>
            </div>
          </div>

          <div className="mt-10 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-500/30 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#050810] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_60%)]" />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-[20%] w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/[0.04] rotate-12"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              Klaar om te shoppen?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
              Ontdek ons complete assortiment van meer dan 820 originele Nintendo producten
            </p>
            <Link href="/shop">
              <Button size="lg">
                Bekijk alle producten
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
