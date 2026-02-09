'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';

const faqItems = [
  {
    question: 'Zijn alle producten origineel en getest?',
    answer: 'Ja, alle 790+ producten die wij verkopen zijn 100% origineel. Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden. Wij verkopen geen reproducties of namaakproducten.',
  },
  {
    question: 'Hoe worden bestellingen verzonden?',
    answer: 'Alle bestellingen worden zorgvuldig verpakt in bubbeltjesfolie en stevige dozen, en verzonden via PostNL. De verzendkosten bedragen €3,95. Bij bestellingen boven de €100 is de verzending gratis.',
  },
  {
    question: 'Kan ik mijn games bij jullie verkopen?',
    answer: 'Ja! Op onze inkooppagina kun je de inkoopprijzen bekijken voor al onze 790+ producten. Stuur ons een e-mail met welke games of consoles je wilt verkopen en wij maken een eerlijk bod.',
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

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 25, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function FaqPreview() {
  return (
    <section className="bg-[#f8fafc] dark:bg-slate-900 py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            FAQ
          </motion.span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Veelgestelde vragen
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-[3px] w-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full mx-auto mb-4 origin-center"
          />
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Heb je een vraag? Wellicht vind je het antwoord hier
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 lg:p-8 gradient-border"
        >
          <Accordion items={faqItems} staggerVariant={fadeUp} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Link href="/faq">
            <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group">
              Bekijk alle vragen
              <motion.svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </motion.svg>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
