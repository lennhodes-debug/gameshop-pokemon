'use client';

import { motion } from 'framer-motion';

export default function PrivacybeleidPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <div className="relative bg-[#050810] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">Privacybeleid</motion.h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
          <p className="text-slate-600 leading-relaxed text-lg">
            Gameshop Enter respecteert de privacy van haar klanten en bezoekers. Wij verwerken persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).
          </p>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Welke gegevens verzamelen wij?</h2>
            <p className="text-slate-600 leading-relaxed">
              Wij verzamelen alleen de gegevens die nodig zijn voor het verwerken van je bestelling: naam, e-mailadres, afleveradres en betaalgegevens. Betaalgegevens worden verwerkt door onze betaalprovider Mollie en worden niet door ons opgeslagen.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Waarvoor gebruiken wij je gegevens?</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Het verwerken en verzenden van je bestelling</li>
              <li>Het afhandelen van betalingen</li>
              <li>Communicatie over je bestelling</li>
              <li>Het afhandelen van retouren en klachten</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              Voor vragen over ons privacybeleid kun je contact opnemen via{' '}
              <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-medium">gameshopenter@gmail.com</a>.
            </p>
          </div>
          <p className="text-slate-400 text-sm">KvK: 93642474</p>
        </motion.div>
      </div>
    </div>
  );
}
