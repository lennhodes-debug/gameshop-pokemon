'use client';

import { motion } from 'framer-motion';
import Accordion from '@/components/ui/Accordion';

const faqItems = [
  {
    question: 'Zijn alle producten origineel en getest?',
    answer: 'Ja, alle producten die wij verkopen zijn 100% origineel. Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden in onze webshop. Wij verkopen geen reproducties of namaakproducten. Op elke productpagina vermelden wij duidelijk de conditie en compleetheid.',
  },
  {
    question: 'Hoe worden bestellingen verzonden?',
    answer: 'Alle bestellingen worden zorgvuldig verpakt en verzonden via PostNL. De standaard verzendkosten bedragen 3,95 euro. Bij bestellingen met een totaalbedrag boven de 100 euro is de verzending gratis. Je ontvangt een track-and-trace code zodra je bestelling is verzonden.',
  },
  {
    question: 'Kan ik mijn bestelling afhalen?',
    answer: 'Nee, Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL. Wij hebben geen fysieke winkel of afhaalpunt.',
  },
  {
    question: 'Wat betekenen de conditie-aanduidingen?',
    answer: 'Wij hanteren drie condities: "Nieuw" betekent dat het product nog in de originele verzegelde verpakking zit. "Zo goed als nieuw" betekent dat het product in uitstekende staat verkeert met minimale gebruikssporen. "Gebruikt" betekent dat het product gebruikssporen vertoont maar volledig functioneel is. Bij elke conditie vermelden wij ook de compleetheid, zoals "Compleet in doos (CIB)" of "Losse cartridge".',
  },
  {
    question: 'Wat is het retourbeleid?',
    answer: 'Je hebt 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren. Het product dient in dezelfde staat te worden geretourneerd als bij ontvangst. Neem contact met ons op via e-mail om een retourzending aan te melden.',
  },
  {
    question: 'Welke betaalmethoden accepteren jullie?',
    answer: 'Wij accepteren iDEAL, creditcard, PayPal, Bancontact en Apple Pay. Alle betalingen worden veilig verwerkt via Mollie. Je betaalgegevens worden nooit door ons opgeslagen.',
  },
  {
    question: 'Worden er ook consoles verkocht?',
    answer: 'Ja, naast games bieden wij ook originele Nintendo consoles aan. Ons assortiment omvat onder andere de Nintendo Switch, GameCube, Nintendo 64, Super Nintendo, NES, Game Boy en meer. Alle consoles zijn persoonlijk getest op werking.',
  },
  {
    question: 'Hoe kan ik contact opnemen?',
    answer: 'Je kunt ons bereiken via e-mail op gameshopenter@gmail.com. Wij streven ernaar om binnen 24 uur te reageren op alle berichten. Je kunt ook het contactformulier op onze contactpagina gebruiken.',
  },
  {
    question: 'Kan ik mijn games aan jullie verkopen?',
    answer: 'Ja! Via onze inkooppagina kun je de inkoopprijs van je games bekijken. Selecteer de games die je wilt verkopen, bekijk het geschatte totaalbedrag en stuur ons een e-mail met je aanbod. Wij betalen binnen 2 werkdagen na ontvangst van de games.',
  },
  {
    question: 'Hoe lang duurt de levering?',
    answer: 'Bestellingen worden binnen 1-2 werkdagen verzonden via PostNL. De levering duurt doorgaans 1-3 werkdagen na verzending. Je ontvangt een track-and-trace code zodra je bestelling is verzonden, zodat je je pakket kunt volgen.',
  },
  {
    question: 'Wat als mijn product niet werkt?',
    answer: 'Alle producten worden persoonlijk getest op werking voordat ze worden verzonden. Mocht er toch een probleem zijn, neem dan binnen 14 dagen contact met ons op via gameshopenter@gmail.com. Wij zorgen voor een passende oplossing, zoals een vervanging of terugbetaling.',
  },
  {
    question: 'Hoeveel platforms bieden jullie aan?',
    answer: 'Wij bieden producten aan voor 12 Nintendo platforms: Switch, Nintendo 3DS, Nintendo DS, Game Boy, Game Boy Color, Game Boy Advance, Nintendo 64, Super Nintendo, NES, GameCube, Wii en Wii U.',
  },
  {
    question: 'Hoe weet ik of een product compleet is?',
    answer: 'Bij elk product vermelden wij duidelijk de compleetheid. "Compleet in doos (CIB)" betekent dat de game inclusief doos en handleiding wordt geleverd. "Losse cartridge" of "Los" betekent dat alleen de game zelf wordt geleverd, zonder doos of handleiding.',
  },
  {
    question: 'Worden producten ook naar België verzonden?',
    answer: 'Op dit moment verzenden wij uitsluitend binnen Nederland via PostNL. Verzending naar België is momenteel niet beschikbaar, maar we hopen dit in de toekomst aan te bieden.',
  },
  {
    question: 'Verkopen jullie ook accessoires?',
    answer: 'Ja, naast games en consoles bieden wij ook originele Nintendo accessoires aan, zoals controllers, kabels, geheugenkaarten en meer. Bekijk ons volledige aanbod in de shop onder de categorie Accessoires.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const heroStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const heroChild = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function FaqPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.06),transparent_50%)]" />

        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] right-[12%] w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] rotate-12"
        />
        <motion.div
          animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[25%] left-[8%] w-10 h-10 rounded-full bg-emerald-500/[0.03] border border-emerald-500/[0.05]"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={heroChild} className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              FAQ
            </motion.span>
            <motion.h1 variants={heroChild} className="text-3xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">Veelgestelde vragen</motion.h1>
            <motion.p variants={heroChild} className="text-lg text-slate-400 max-w-2xl">
              Antwoorden op de meest gestelde vragen over onze producten en service
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 lg:p-8"
        >
          <Accordion items={faqItems} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Staat je vraag er niet bij? Neem dan gerust contact met ons op.
          </p>
          <motion.a
            href="mailto:gameshopenter@gmail.com"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-sm transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            gameshopenter@gmail.com
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
