'use client';

import { motion } from 'framer-motion';

export default function RetourbeleidPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <div className="relative bg-[#050810] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">Retourbeleid</motion.h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">14 dagen bedenktijd</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              Bij Gameshop Enter heb je 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren zonder opgave van reden.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Voorwaarden voor retournering</h2>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
              <li>Het product dient in dezelfde staat te worden geretourneerd als bij ontvangst</li>
              <li>Meld je retourzending vooraf aan via e-mail</li>
              <li>De retourzending dient binnen 14 dagen na de melding te worden verzonden</li>
              <li>De kosten voor het retourneren zijn voor rekening van de koper</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Hoe retourneren?</h2>
            <ol className="list-decimal pl-6 text-slate-600 dark:text-slate-300 space-y-2">
              <li>Neem contact op via <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">gameshopenter@gmail.com</a></li>
              <li>Vermeld je bestelnummer en het product dat je wilt retourneren</li>
              <li>Verpak het product zorgvuldig en verzend het naar het opgegeven adres</li>
              <li>Na ontvangst en controle wordt het aankoopbedrag binnen 14 dagen teruggestort</li>
            </ol>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Terugbetaling</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Na ontvangst en controle van het geretourneerde product wordt het aankoopbedrag (exclusief verzendkosten) binnen 14 dagen teruggestort via de oorspronkelijke betaalmethode.
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Vragen over het retourbeleid? Neem contact op via{' '}
              <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">gameshopenter@gmail.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
