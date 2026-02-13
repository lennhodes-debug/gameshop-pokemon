'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';

const categories = [
  { value: '', label: 'Alles' },
  { value: 'producten', label: 'Producten' },
  { value: 'verzending', label: 'Verzending' },
  { value: 'betaling', label: 'Betaling & Retour' },
  { value: 'inkoop', label: 'Inkoop' },
];

const faqItems = [
  {
    question: 'Zijn alle producten origineel en getest?',
    answer: 'Ja, alle producten die wij verkopen zijn 100% origineel. Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden in onze webshop. Wij verkopen geen reproducties of namaakproducten. Op elke productpagina vermelden wij duidelijk de conditie en compleetheid.',
    category: 'producten',
  },
  {
    question: 'Hoe weet ik of een Pokémon cartridge echt is?',
    answer: 'Alle Pokémon cartridges die wij verkopen zijn 100% authentiek. Wij controleren elk exemplaar op de officiële Nintendo-kenmerken: het correcte label, de juiste kleur van de cartridge, het serienummer op de achterkant en het Nintendo-logo in de behuizing. Van elke cartridge maken wij voor- en achterkant foto\'s zodat je zelf kunt meekijken. Bij twijfel kun je altijd contact met ons opnemen.',
    category: 'producten',
  },
  {
    question: 'Waarom is een Compleet in Doos (CIB) exemplaar duurder?',
    answer: 'Een CIB-exemplaar bevat de originele doos, handleiding en cartridge — precies zoals het ooit in de winkel lag. Omdat dozen en handleidingen vaak weggegooid werden, zijn complete exemplaren veel zeldzamer. Vooral bij oudere Pokémon games zoals HeartGold, SoulSilver en Platinum kan het prijsverschil aanzienlijk zijn. De doos en handleiding zijn collector\'s items op zich.',
    category: 'producten',
  },
  {
    question: 'Welke Pokémon generaties verkopen jullie?',
    answer: 'Wij verkopen games uit meerdere Pokémon generaties: Gen III (Ruby, Sapphire, Emerald, FireRed, LeafGreen) voor GBA, Gen IV (Diamond, Pearl, Platinum, HeartGold, SoulSilver) voor DS, Gen V (Black, White, Black 2, White 2) voor DS, en Gen VI en VII (X, Omega Ruby, Alpha Sapphire, Moon) voor 3DS. Daarnaast hebben wij diverse spin-offs zoals Mystery Dungeon, Ranger en Conquest.',
    category: 'producten',
  },
  {
    question: 'Wat is het verschil tussen een EUR en USA versie?',
    answer: 'EUR (PAL) versies zijn de Europese releases met vaak meertalige handleidingen en een licht ander label-ontwerp. USA (NTSC) versies komen uit Noord-Amerika. Voor DS en 3DS games maakt het in de praktijk weinig uit: beide werken op Europese systemen. GBA cartridges zijn regio-vrij. Wij vermelden bij elk product duidelijk welke versie het betreft.',
    category: 'producten',
  },
  {
    question: 'Wat betekenen de conditie-aanduidingen?',
    answer: 'Wij hanteren twee condities: "Zo goed als nieuw" betekent dat het product in uitstekende staat verkeert, bijna nieuw, met minimale tot geen gebruikssporen. "Gebruikt" betekent dat het product tweedehands is en gebruikssporen kan vertonen, maar volledig functioneel is getest. Bij elke conditie vermelden wij ook de compleetheid, zoals "Compleet in doos (CIB)" of "Losse cartridge".',
    category: 'producten',
  },
  {
    question: 'Hoe worden bestellingen verzonden?',
    answer: 'Alle bestellingen worden zorgvuldig verpakt en verzonden via PostNL. De standaard verzendkosten bedragen €4,95 (brievenbuspakket, 1-3 items). Bij grotere bestellingen gelden aangepaste tarieven. Bij bestellingen boven de €100 is de verzending gratis. Je ontvangt een track-and-trace code zodra je bestelling is verzonden.',
    category: 'verzending',
  },
  {
    question: 'Hoe lang duurt de levering?',
    answer: 'Bestellingen worden binnen 1-2 werkdagen verzonden via PostNL. De levering duurt doorgaans 1-3 werkdagen na verzending. Je ontvangt een track-and-trace code zodra je bestelling is verzonden, zodat je je pakket kunt volgen.',
    category: 'verzending',
  },
  {
    question: 'Kan ik mijn bestelling afhalen?',
    answer: 'Nee, Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.',
    category: 'verzending',
  },
  {
    question: 'Worden producten ook naar België verzonden?',
    answer: 'Op dit moment verzenden wij uitsluitend binnen Nederland via PostNL. Verzending naar België is momenteel niet beschikbaar, maar we hopen dit in de toekomst aan te bieden.',
    category: 'verzending',
  },
  {
    question: 'Welke betaalmethoden accepteren jullie?',
    answer: 'Wij accepteren iDEAL. Alle betalingen worden veilig verwerkt via Mollie. Je betaalgegevens worden nooit door ons opgeslagen.',
    category: 'betaling',
  },
  {
    question: 'Wat is het retourbeleid?',
    answer: 'Je hebt 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren. Het product dient in dezelfde staat te worden geretourneerd als bij ontvangst. Neem contact met ons op via e-mail om een retourzending aan te melden.',
    category: 'betaling',
  },
  {
    question: 'Wat als mijn product niet werkt?',
    answer: 'Alle producten worden persoonlijk getest op werking voordat ze worden verzonden. Mocht er toch een probleem zijn, neem dan binnen 14 dagen contact met ons op via gameshopenter@gmail.com. Wij zorgen voor een passende oplossing, zoals een vervanging of terugbetaling.',
    category: 'betaling',
  },
  {
    question: 'Kan ik mijn games aan jullie verkopen?',
    answer: 'Ja! Via onze inkooppagina kun je de inkoopprijs van je games bekijken. Selecteer de games die je wilt verkopen, bekijk het geschatte totaalbedrag en stuur ons een e-mail met je aanbod. Wij betalen binnen 2 werkdagen na ontvangst van de games.',
    category: 'inkoop',
  },
  {
    question: 'Worden er ook consoles verkocht?',
    answer: 'Wij zijn gespecialiseerd in originele Nintendo games voor meerdere platforms: Game Boy, Game Boy Advance, Nintendo DS, Nintendo 3DS, Wii en Wii U. Consoles bieden wij momenteel niet aan, maar we raden aan om bij Marktplaats of andere retro-winkels te kijken voor de bijpassende hardware.',
    category: 'producten',
  },
  {
    question: 'Voor welke platforms verkopen jullie games?',
    answer: 'Wij verkopen originele Nintendo games voor Game Boy, Game Boy Advance (GBA), Nintendo DS, Nintendo 3DS, Wii en Wii U. Van Pok\u00e9mon en Zelda tot Mario en Animal Crossing \u2014 ons assortiment omvat 140+ titels.',
    category: 'producten',
  },
  {
    question: 'Hoe weet ik of een product compleet is?',
    answer: 'Bij elk product vermelden wij duidelijk de compleetheid. "Compleet in doos (CIB)" betekent dat de game inclusief doos en handleiding wordt geleverd. "Losse cartridge" of "Los" betekent dat alleen de game zelf wordt geleverd, zonder doos of handleiding.',
    category: 'producten',
  },
  {
    question: 'Kan de interne batterij van een cartridge leeg zijn?',
    answer: 'GBA-games zoals Emerald, Ruby en Sapphire hebben een interne batterij voor de klok-functie. Als deze leeg is, werken tijdgebonden events (bessen groeien, getijden) niet meer, maar de game en je saves werken nog gewoon. Wij vermelden de batterijstatus waar mogelijk. DS en 3DS games hebben geen interne batterij.',
    category: 'producten',
  },
  {
    question: 'Hoe kan ik contact opnemen?',
    answer: 'Je kunt ons bereiken via e-mail op gameshopenter@gmail.com of via het contactformulier op onze contactpagina. Wij streven ernaar om binnen 24 uur te reageren op alle berichten.',
    category: 'betaling',
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

export default function FaqPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const filteredItems = useMemo(() => {
    let items = faqItems;

    if (activeCategory) {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      );
    }

    return items;
  }, [search, activeCategory]);

  const activeCategoryLabel = categories.find((c) => c.value === activeCategory)?.label || 'Alles';

  return (
    <div className="pt-16 lg:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="relative bg-[#050810] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h1 className="text-4xl lg:text-[64px] font-light text-white tracking-[-0.03em] leading-[0.95] mb-4">
              Veelgestelde vragen
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              Antwoorden op de meest gestelde vragen over onze producten en service
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Categorie filter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="mb-4"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.value
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-slate-500 pl-1">
            <span className="font-semibold text-emerald-600">{filteredItems.length}</span>{' '}
            {filteredItems.length === 1 ? 'vraag' : 'vragen'} in {activeCategoryLabel.toLowerCase()}
          </p>
        </motion.div>

        {/* Zoekbalk */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek in veelgestelde vragen..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {search && (
            <p className="mt-2 text-xs text-slate-500 pl-1">
              <span className="font-semibold text-emerald-600">{filteredItems.length}</span>{' '}
              {filteredItems.length === 1 ? 'resultaat' : 'resultaten'} gevonden
            </p>
          )}
        </motion.div>

        {/* FAQ lijst */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8"
        >
          {filteredItems.length > 0 ? (
            <Accordion items={filteredItems} />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm mb-2">
                {search ? (
                  <>Geen vragen gevonden voor &ldquo;{search}&rdquo;</>
                ) : (
                  <>Geen vragen in deze categorie</>
                )}
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory(''); }}
                className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Filters wissen
              </button>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] rounded-2xl p-8 text-center border border-white/[0.06]"
        >
          <h3 className="text-xl font-semibold text-white mb-2">Staat je vraag er niet bij?</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Neem gerust contact met ons op. Wij reageren binnen 24 uur.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:gameshopenter@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-shadow"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              E-mail sturen
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.1] transition-all"
            >
              Contactformulier
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
