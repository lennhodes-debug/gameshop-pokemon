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
    answer: 'Je hebt 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren. Het product dient in dezelfde staat te worden geretourneerd als bij ontvangst. Neem contact met ons op via e-mail of WhatsApp om een retourzending aan te melden.',
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
    answer: 'Je kunt ons bereiken via e-mail op gameshopenter@gmail.com of via WhatsApp/telefoon op 06-41126067. Wij streven ernaar om binnen 24 uur te reageren op alle berichten. Je kunt ook het contactformulier op onze contactpagina gebruiken.',
  },
];

export default function FaqPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <div className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h1 className="text-3xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">Veelgestelde vragen</h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              Antwoorden op de meest gestelde vragen over onze producten en service
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8"
        >
          <Accordion items={faqItems} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 mb-4">
            Staat je vraag er niet bij? Neem dan gerust contact met ons op.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              gameshopenter@gmail.com
            </a>
            <span className="hidden sm:block text-slate-300">|</span>
            <a href="tel:0641126067" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              06-41126067
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
