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
    answer: 'Wij accepteren iDEAL. Alle betalingen worden veilig verwerkt via Mollie.',
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
    <section className="relative bg-[#f8fafc] py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] mb-4">
            FAQ
          </p>
          <h2 className="text-3xl lg:text-[52px] font-semibold text-slate-900 mb-3 tracking-[-0.02em] leading-[1.1]">
            Veelgestelde vragen
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto font-normal">
            Heb je een vraag? Wellicht vind je het antwoord hier
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-600">Top 5 vragen</span>
                <Link href="/faq" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Alle {'>'}20 vragen
                </Link>
              </div>
              <Accordion items={faqItems} staggerVariant={fadeUp} />
            </div>
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
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:border-slate-300 hover:text-slate-900 transition-all group"
          >
            Bekijk alle vragen
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
