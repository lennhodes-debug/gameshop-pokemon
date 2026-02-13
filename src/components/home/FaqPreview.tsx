'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Accordion from '@/components/ui/Accordion';

const faqItems = [
  {
    question: 'Zijn alle producten origineel en getest?',
    answer: 'Ja, alle 100+ producten die wij verkopen zijn 100% origineel. Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden. Wij verkopen geen reproducties of namaakproducten.',
  },
  {
    question: 'Hoe worden bestellingen verzonden?',
    answer: 'Alle bestellingen worden zorgvuldig verpakt in bubbeltjesfolie en stevige dozen, en verzonden via PostNL. De verzendkosten bedragen vanaf \u20AC4,95. Bij bestellingen boven de \u20AC100 is de verzending gratis.',
  },
  {
    question: 'Kan ik mijn games bij jullie verkopen?',
    answer: 'Ja! Op onze inkooppagina kun je de inkoopprijzen bekijken voor al onze 100+ producten. Stuur ons een e-mail met welke games of consoles je wilt verkopen en wij maken een eerlijk bod.',
  },
  {
    question: 'Wat is het retourbeleid?',
    answer: 'Je hebt 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren in dezelfde staat als bij ontvangst. Neem contact op via gameshopenter@gmail.com.',
  },
  {
    question: 'Welke betaalmethoden accepteren jullie?',
    answer: 'Wij accepteren iDEAL, creditcard, PayPal, Bancontact en Apple Pay. Alle betalingen worden veilig verwerkt via Mollie.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function FaqPreview() {
  return (
    <section className="relative bg-[#f8fafc] py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            FAQ
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Veelgestelde vragen
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-4" />
          <p className="text-lg text-slate-500">
            Heb je een vraag? Wellicht vind je het antwoord hier
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-600">Top 5 vragen</span>
              <Link href="/faq" className="text-xs text-slate-400 hover:text-emerald-500 transition-colors">
                Alle {'>'}20 vragen
              </Link>
            </div>
            <Accordion items={faqItems} staggerVariant={fadeUp} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center mt-8"
        >
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 hover:text-slate-900 transition-colors"
          >
            Bekijk alle vragen
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
