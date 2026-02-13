'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const reviews = [
  { name: 'Thomas V.', text: 'Pokemon Violet in perfecte staat ontvangen, compleet met doos. Super snelle levering en precies zoals beschreven!', product: 'Pokemon Violet', date: '12 jan 2025' },
  { name: 'Lisa M.', text: 'Al 3x Pokemon games besteld bij Gameshop Enter. Altijd betrouwbaar, goed verpakt en originele cartridges.', product: 'Pokemon SoulSilver', date: '28 dec 2024' },
  { name: 'Kevin D.', text: 'Pokemon Emerald met werkende batterij ontvangen. Savefile was gewist, dus kon meteen een nieuw avontuur starten. Topkwaliteit!', product: 'Pokemon Emerald', date: '15 nov 2024' },
  { name: 'Emma B.', text: 'HeartGold compleet in doos met alle inserts. Had ik nergens anders zo goedkoop kunnen vinden. Fantastische webshop!', product: 'Pokemon HeartGold', date: '3 feb 2025' },
  { name: 'Jeroen K.', text: 'Pokemon Red voor mijn Game Boy besteld. Batterij werkt nog en save is intact. Nostalgisch en betrouwbaar!', product: 'Pokemon Red', date: '22 okt 2024' },
  { name: 'Sophie W.', text: 'Pokemon Platinum CIB ontvangen, alles in nette staat. De beschrijving klopte precies. Zeker een aanrader!', product: 'Pokemon Platinum', date: '9 jan 2025' },
  { name: 'Nienke R.', text: 'Binnen 2 dagen Pokemon Pearl in huis. Keurig in bubbeltjesfolie verpakt. Save was gewist, helemaal klaar om te spelen!', product: 'Pokemon Pearl', date: '17 dec 2024' },
  { name: 'Daan L.', text: 'Pokemon Black 2 gevonden die ik nergens anders kon krijgen voor een eerlijke prijs. Compleet met doos en handleiding!', product: 'Pokemon Black 2', date: '5 nov 2024' },
  { name: 'Fleur H.', text: 'Voor mijn zoon Pokemon Legends Arceus besteld. Hij was door het dolle heen! Game werkt perfect, snelle levering.', product: 'Pokemon Legends Arceus', date: '30 jan 2025' },
  { name: 'Anouk de V.', text: 'Vraag gesteld over de conditie van Pokemon Diamond en binnen een uur eerlijk antwoord gekregen. Klantenservice is top!', product: 'Pokemon Diamond', date: '14 dec 2024' },
  { name: 'Rick P.', text: 'Drie DS Pokemon games tegelijk besteld. Allemaal origineel, allemaal werkend. Mijn collectie groeit dankzij Gameshop Enter!', product: 'Pokemon White', date: '8 jan 2025' },
  { name: 'Mark J.', text: 'Pokemon FireRed in topconditie. Label ziet er nog als nieuw uit. Perfecte toevoeging aan mijn GBA collectie.', product: 'Pokemon FireRed', date: '21 nov 2024' },
];

const starPath = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function ReviewCard({ review }: { review: typeof reviews[0] }) {
  return (
    <div className="flex-shrink-0 w-[320px]">
      <blockquote className="relative rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 h-full hover:border-emerald-500/20 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden">
        {/* Top accent lijn */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Quote mark */}
        <div className="absolute top-3 right-4 text-4xl text-white/[0.06] font-serif select-none" aria-hidden="true">
          &ldquo;
        </div>

        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d={starPath} />
            </svg>
          ))}
        </div>

        <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-4">
          &ldquo;{review.text}&rdquo;
        </p>

        <footer>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {review.name[0]}
              </div>
              <cite className="text-white/50 text-xs font-medium not-italic">{review.name}</cite>
            </div>
            <span className="text-emerald-400/40 text-xs font-medium">{review.product}</span>
          </div>
          <time className="block text-white/25 text-[11px] mt-1.5">{review.date}</time>
        </footer>
      </blockquote>
    </div>
  );
}

export default function ReviewsStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-10%', '0%']);

  return (
    <section ref={sectionRef} className="relative bg-[#050810] py-16 lg:py-20 overflow-hidden">
      {/* Subtiele achtergrond */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d={starPath} />
                </svg>
              ))}
            </div>
            <span className="text-white font-bold text-lg">5.0</span>
            <span className="text-slate-400 text-sm">op Marktplaats</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
            1.360+ tevreden klanten
          </h2>
          <p className="text-slate-400">Lees wat onze klanten zeggen</p>
        </motion.div>
      </div>

      {/* Separator */}
      <div className="max-w-xs mx-auto h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-10" />

      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 lg:w-48 bg-gradient-to-r from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 lg:w-48 bg-gradient-to-l from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />

      <div className="space-y-4">
        {/* Rij 1 — scroll-linked parallax */}
        <motion.div className="flex gap-4" style={{ x: x1 }}>
          <div className="flex animate-marquee-slow gap-4">
            {[...reviews.slice(0, 6), ...reviews.slice(0, 6)].map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </motion.div>

        {/* Rij 2 — tegenovergestelde richting */}
        <motion.div className="flex gap-4" style={{ x: x2 }}>
          <div className="flex animate-marquee-reverse-slow gap-4">
            {[...reviews.slice(6), ...reviews.slice(6)].map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Marktplaats link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-center">
        <p className="text-slate-500 text-sm">
          Bekijk al onze{' '}
          <a
            href="https://www.marktplaats.nl/u/gameshop-enter/100074714/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            1.360+ reviews op Marktplaats
          </a>
        </p>
      </div>
    </section>
  );
}
