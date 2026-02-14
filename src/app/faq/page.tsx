'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';

const categories = [
  { value: '', label: 'Alles', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
  { value: 'producten', label: 'Producten', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.466 3.2.836 4.748a48.354 48.354 0 009.57 0c.37-1.548.65-3.135.836-4.748a48.39 48.39 0 01-4.163.3.64.64 0 01-.657-.643v0z" /></svg> },
  { value: 'verzending', label: 'Verzending', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg> },
  { value: 'betaling', label: 'Betaling & Retour', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg> },
  { value: 'inkoop', label: 'Inkoop', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg> },
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

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { '': faqItems.length };
    for (const item of faqItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="pt-16 lg:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative bg-[#050810] py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.04),transparent_60%)]" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.05 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] backdrop-blur-sm mb-6"
            >
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              <span className="text-white/50 text-xs font-medium">{faqItems.length} veelgestelde vragen</span>
            </motion.div>

            <h1 className="text-4xl lg:text-[72px] font-light text-white tracking-[-0.03em] leading-[0.95] mb-5">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                Veelgestelde
              </motion.span>
              <motion.span
                className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                vragen
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg text-white/40 max-w-xl"
            >
              Antwoorden op de meest gestelde vragen over onze producten, verzending en service
            </motion.p>
          </motion.div>
        </div>

        {/* Gradient transitie */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent pointer-events-none" />
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Zoekbalk */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek in veelgestelde vragen..."
              className="w-full pl-11 pr-10 py-4 rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all shadow-sm"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Categorie filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  activeCategory === cat.value
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                    : 'bg-white border border-slate-200/80 text-slate-500 hover:border-slate-300 hover:text-slate-700 shadow-sm'
                }`}
              >
                {cat.icon}
                {cat.label}
                <span className={`ml-0.5 text-[10px] ${activeCategory === cat.value ? 'text-white/50' : 'text-slate-300'}`}>
                  {categoryCount[cat.value] || 0}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Resultaat indicator */}
        <AnimatePresence mode="wait">
          {(search || activeCategory) && (
            <motion.div
              key={`${search}-${activeCategory}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">{filteredItems.length}</span>{' '}
                  {filteredItems.length === 1 ? 'resultaat' : 'resultaten'}
                  {search && <> voor &ldquo;<span className="text-slate-600">{search}</span>&rdquo;</>}
                </p>
                {(search || activeCategory) && (
                  <button
                    onClick={() => { setSearch(''); setActiveCategory(''); }}
                    className="text-xs text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    Wis filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ lijst */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="p-5 lg:p-7">
              {filteredItems.length > 0 ? (
                <Accordion items={filteredItems} />
              ) : (
                <div className="text-center py-16">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm mb-1">
                    {search ? (
                      <>Geen vragen gevonden voor &ldquo;{search}&rdquo;</>
                    ) : (
                      <>Geen vragen in deze categorie</>
                    )}
                  </p>
                  <p className="text-slate-400 text-xs mb-4">Probeer een andere zoekterm of categorie</p>
                  <button
                    onClick={() => { setSearch(''); setActiveCategory(''); }}
                    className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                  >
                    Alle vragen tonen
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-14"
        >
          <div className="relative rounded-2xl overflow-hidden">
            {/* Achtergrond */}
            <div className="absolute inset-0 bg-[#050810]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.06),transparent_60%)]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative p-8 lg:p-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex h-12 w-12 rounded-2xl bg-white/[0.06] items-center justify-center mb-5"
              >
                <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </motion.div>

              <h3 className="text-xl lg:text-2xl font-light text-white tracking-[-0.02em] mb-2">
                Staat je vraag er niet bij?
              </h3>
              <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
                Neem gerust contact met ons op. Wij reageren binnen 24 uur.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="mailto:gameshopenter@gmail.com"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-slate-900 text-sm font-medium shadow-lg shadow-white/10 hover:shadow-white/20 hover:bg-white/95 transition-all duration-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  E-mail sturen
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/[0.08] text-white/80 text-sm font-medium hover:bg-white/[0.12] hover:text-white transition-all duration-300 backdrop-blur-sm"
                >
                  Contactformulier
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
