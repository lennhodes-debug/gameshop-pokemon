'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';

const faqItems = [
  {
    question: 'Zijn alle producten origineel en getest?',
    answer: 'Ja, alle 846+ producten die wij verkopen zijn 100% origineel. Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden. Wij verkopen geen reproducties of namaakproducten.',
  },
  {
    question: 'Hoe worden bestellingen verzonden?',
    answer: 'Alle bestellingen worden zorgvuldig verpakt in bubbeltjesfolie en stevige dozen, en verzonden via PostNL. De verzendkosten bedragen €3,95. Bij bestellingen boven de €100 is de verzending gratis.',
  },
  {
    question: 'Kan ik mijn games bij jullie verkopen?',
    answer: 'Ja! Op onze inkooppagina kun je de inkoopprijzen bekijken voor al onze 846+ producten. Stuur ons een e-mail met welke games of consoles je wilt verkopen en wij maken een eerlijk bod.',
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

export default function FaqPreview() {
  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-4">
            FAQ
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Veelgestelde vragen
          </h2>
          <p className="text-lg text-slate-500">
            Heb je een vraag? Wellicht vind je het antwoord hier
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 gradient-border"
        >
          <Accordion items={faqItems} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link href="/faq">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Bekijk alle vragen
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
