'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const values = [
  {
    title: 'Originaliteit',
    description: 'Wij verkopen uitsluitend 100% originele Nintendo producten. Geen reproducties, geen namaak.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Transparantie',
    description: 'Elke productpagina vermeldt duidelijk de conditie, compleetheid en exacte staat van het product.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Kwaliteit',
    description: 'Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden in onze webshop.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Service',
    description: 'Snelle verzending, zorgvuldige verpakking en persoonlijk contact bij vragen of problemen.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

export default function OverOnsPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <div className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Sinds 2019
            </span>
            <h1 className="text-3xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
              Over Gameshop Enter
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              De Nintendo specialist van Nederland, actief sinds 2019
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">Ons verhaal</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
            <p>
              Gameshop Enter is in 2019 opgericht vanuit een persoonlijke passie voor Nintendo. Wat begon als een hobby
              is uitgegroeid tot een volwaardige online webshop met meer dan 346 producten en meer dan 1386 tevreden
              klanten.
            </p>
            <p>
              Wij geloven dat retro gaming meer is dan nostalgie. Het is een manier om tijdloze klassiekers te bewaren
              en te delen. Van de Nintendo Entertainment System tot de nieuwste Nintendo Switch — wij bieden een
              zorgvuldig samengesteld assortiment van originele games en consoles.
            </p>
            <p>
              Met een perfecte 5.0 score op Marktplaats na meer dan 1386 beoordelingen staan wij garant voor kwaliteit,
              betrouwbaarheid en uitstekende service. Elk product wordt persoonlijk getest op werking en zorgvuldig
              verpakt voor verzending.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Onze kernwaarden</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg hover:border-emerald-200/40 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600 mb-4">
                  {value.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Business details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-slate-50 rounded-2xl p-8 lg:p-10"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Bedrijfsgegevens</h2>
          <dl className="space-y-5">
            {[
              ['Bedrijfsnaam', 'Gameshop Enter'],
              ['Eigenaar', 'Lenn'],
              ['KvK-nummer', '93642474'],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="font-semibold text-slate-900 sm:w-48 text-sm">{label}</dt>
                <dd className="text-slate-600">{value}</dd>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-semibold text-slate-900 sm:w-48 text-sm">E-mail</dt>
              <dd><a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-medium">gameshopenter@gmail.com</a></dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-semibold text-slate-900 sm:w-48 text-sm">Telefoon</dt>
              <dd><a href="tel:0641126067" className="text-emerald-600 hover:text-emerald-700 font-medium">06-41126067</a></dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-semibold text-slate-900 sm:w-48 text-sm">Website</dt>
              <dd className="text-slate-600">gameshopenter.nl</dd>
            </div>
          </dl>
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800 font-medium">
              Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
