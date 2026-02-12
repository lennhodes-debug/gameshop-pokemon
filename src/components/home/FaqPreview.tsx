'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const glowOpacity = useSpring(
    useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.6, 0]),
    { stiffness: 100, damping: 25 }
  );
  const iconRotate = useTransform(scrollYProgress, [0.2, 0.6], [0, 360]);

  return (
    <section ref={sectionRef} className="relative bg-[#f8fafc] dark:bg-slate-900 py-16 lg:py-24 overflow-hidden">
      {/* Subtle background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-400 blur-[180px] pointer-events-none"
        style={{ opacity: glowOpacity }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <motion.svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ rotate: iconRotate }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </motion.svg>
            FAQ
          </motion.span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Veelgestelde vragen
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100 }}
            className="h-[3px] w-16 bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full mx-auto mb-4 origin-center"
          />
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Heb je een vraag? Wellicht vind je het antwoord hier
          </p>
        </motion.div>

        {/* FAQ container with glow border on scroll */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative"
        >
          {/* Glow behind container */}
          <motion.div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400/20 via-emerald-400/20 to-emerald-400/20 blur-xl pointer-events-none"
            style={{ opacity: glowOpacity }}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 lg:p-8 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-500 group">
            {/* Animated corner accents on hover */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-transparent group-hover:border-emerald-400/40 rounded-tl-2xl transition-all duration-500 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-transparent group-hover:border-emerald-400/40 rounded-br-2xl transition-all duration-500 pointer-events-none" />
            <Accordion items={faqItems} staggerVariant={fadeUp} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Link href="/faq">
            <Button variant="outline" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group">
              Bekijk alle vragen
              <motion.svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                animate={{ x: [0, 4, 0] }}
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
