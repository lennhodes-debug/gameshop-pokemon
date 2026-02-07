'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const reviews = [
  {
    name: 'Thomas V.',
    text: 'Super snelle levering en de game was precies zoals beschreven. Top service!',
    rating: 5,
    product: 'Pokémon Violet',
  },
  {
    name: 'Lisa M.',
    text: 'Al 3x besteld bij Gameshop Enter. Altijd betrouwbaar en goed verpakt.',
    rating: 5,
    product: 'Mario Kart 8 Deluxe',
  },
  {
    name: 'Kevin D.',
    text: 'Mooie retro games in perfecte staat. Echt een aanrader voor verzamelaars.',
    rating: 5,
    product: 'Zelda: Ocarina of Time',
  },
  {
    name: 'Emma B.',
    text: 'Fantastische webshop! Snelle reactie op berichten en eerlijke prijzen.',
    rating: 5,
    product: 'Animal Crossing: New Horizons',
  },
  {
    name: 'Jeroen K.',
    text: 'Game Boy games in topconditie ontvangen. Nostalgisch en betrouwbaar!',
    rating: 5,
    product: 'Pokémon Red',
  },
  {
    name: 'Sophie W.',
    text: 'Geweldige ervaring. De game was compleet met doos en handleiding!',
    rating: 5,
    product: 'Super Mario Odyssey',
  },
  {
    name: 'Mark J.',
    text: 'GameCube controller werkt als nieuw. Ongelofelijk goede kwaliteit voor tweedehands.',
    rating: 5,
    product: 'GameCube Controller',
  },
  {
    name: 'Nienke R.',
    text: 'Binnen 2 dagen in huis en alles zat keurig in bubbeltjesfolie. Zeer tevreden!',
    rating: 5,
    product: 'Super Smash Bros. Ultimate',
  },
  {
    name: 'Daan L.',
    text: 'Zeldzame N64-game gevonden die ik nergens anders kon vinden. Prijs was ook eerlijk.',
    rating: 5,
    product: 'GoldenEye 007',
  },
  {
    name: 'Fleur H.',
    text: 'Voor mijn zoon een Switch-game besteld. Hij was door het dolle heen. Snelle levering!',
    rating: 5,
    product: 'Splatoon 3',
  },
  {
    name: 'Rick P.',
    text: 'Mijn hele SNES-collectie komt van Gameshop Enter. Altijd origineel, altijd werkend.',
    rating: 5,
    product: 'Super Mario World',
  },
  {
    name: 'Anouk de V.',
    text: 'Vraag gesteld over een product en binnen een uur antwoord gekregen. Klantenservice is top!',
    rating: 5,
    product: 'Pokémon HeartGold',
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
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
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white font-bold text-lg">5.0</span>
            <span className="text-slate-400 text-sm">op Marktplaats</span>
          </div>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
            1.360+ tevreden klanten
          </h2>
          <p className="text-slate-400">Lees wat onze klanten zeggen</p>
        </motion.div>
      </div>

      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 lg:w-48 bg-gradient-to-r from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 lg:w-48 bg-gradient-to-l from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />

      <div className="space-y-4">
        {/* Row 1 */}
        <motion.div className="flex gap-4" style={{ x: x1 }}>
          <div className="flex animate-marquee-slow gap-4">
            {[...reviews.slice(0, 6), ...reviews.slice(0, 6)].map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[320px] rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] p-5"
              >
                <StarRating />
                <p className="text-white/80 text-sm mt-3 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-white/60 text-xs font-medium">{review.name}</span>
                  <span className="text-emerald-400/60 text-xs">{review.product}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 2 */}
        <motion.div className="flex gap-4" style={{ x: x2 }}>
          <div className="flex animate-marquee-reverse-slow gap-4">
            {[...reviews.slice(6), ...reviews.slice(6)].map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[320px] rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] p-5"
              >
                <StarRating />
                <p className="text-white/80 text-sm mt-3 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-white/60 text-xs font-medium">{review.name}</span>
                  <span className="text-emerald-400/60 text-xs">{review.product}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Marktplaats link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 text-sm"
        >
          Bekijk al onze{' '}
          <a
            href="https://www.marktplaats.nl/u/gameshop-enter/100074714/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            1.360+ reviews op Marktplaats
          </a>
        </motion.p>
      </div>
    </section>
  );
}
