'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

const reviews = [
  {
    name: 'Thomas V.',
    text: 'Pokemon Violet in perfecte staat ontvangen, compleet met doos. Super snelle levering en precies zoals beschreven!',
    rating: 5,
    product: 'Pokemon Violet',
    date: '12 jan 2025',
  },
  {
    name: 'Lisa M.',
    text: 'Al 3x Pokemon games besteld bij Gameshop Enter. Altijd betrouwbaar, goed verpakt en originele cartridges.',
    rating: 5,
    product: 'Pokemon SoulSilver',
    date: '28 dec 2024',
  },
  {
    name: 'Kevin D.',
    text: 'Pokemon Emerald met werkende batterij ontvangen. Savefile was gewist, dus kon meteen een nieuw avontuur starten. Topkwaliteit!',
    rating: 5,
    product: 'Pokemon Emerald',
    date: '15 nov 2024',
  },
  {
    name: 'Emma B.',
    text: 'HeartGold compleet in doos met alle inserts. Had ik nergens anders zo goedkoop kunnen vinden. Fantastische webshop!',
    rating: 5,
    product: 'Pokemon HeartGold',
    date: '3 feb 2025',
  },
  {
    name: 'Jeroen K.',
    text: 'Pokemon Red voor mijn Game Boy besteld. Batterij werkt nog en save is intact. Nostalgisch en betrouwbaar!',
    rating: 5,
    product: 'Pokemon Red',
    date: '22 okt 2024',
  },
  {
    name: 'Sophie W.',
    text: 'Pokemon Platinum CIB ontvangen, alles in nette staat. De beschrijving klopte precies. Zeker een aanrader!',
    rating: 5,
    product: 'Pokemon Platinum',
    date: '9 jan 2025',
  },
  {
    name: 'Nienke R.',
    text: 'Binnen 2 dagen Pokemon Pearl in huis. Keurig in bubbeltjesfolie verpakt. Save was gewist, helemaal klaar om te spelen!',
    rating: 5,
    product: 'Pokemon Pearl',
    date: '17 dec 2024',
  },
  {
    name: 'Daan L.',
    text: 'Pokemon Black 2 gevonden die ik nergens anders kon krijgen voor een eerlijke prijs. Compleet met doos en handleiding!',
    rating: 5,
    product: 'Pokemon Black 2',
    date: '5 nov 2024',
  },
  {
    name: 'Fleur H.',
    text: 'Voor mijn zoon Pokemon Legends Arceus besteld. Hij was door het dolle heen! Game werkt perfect, snelle levering.',
    rating: 5,
    product: 'Pokemon Legends Arceus',
    date: '30 jan 2025',
  },
  {
    name: 'Anouk de V.',
    text: 'Vraag gesteld over de conditie van Pokemon Diamond en binnen een uur eerlijk antwoord gekregen. Klantenservice is top!',
    rating: 5,
    product: 'Pokemon Diamond',
    date: '14 dec 2024',
  },
  {
    name: 'Rick P.',
    text: 'Drie DS Pokemon games tegelijk besteld. Allemaal origineel, allemaal werkend. Mijn collectie groeit dankzij Gameshop Enter!',
    rating: 5,
    product: 'Pokemon White',
    date: '8 jan 2025',
  },
  {
    name: 'Mark J.',
    text: 'Pokemon FireRed in topconditie. Label ziet er nog als nieuw uit. Perfecte toevoeging aan mijn GBA collectie.',
    rating: 5,
    product: 'Pokemon FireRed',
    date: '21 nov 2024',
  },
];

const starPath =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function AnimatedHeaderStars() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <motion.svg
          key={i}
          className="h-5 w-5 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{
            delay: 0.3 + i * 0.12,
            duration: 0.5,
            type: 'spring',
            stiffness: 260,
            damping: 15,
          }}
        >
          <path d={starPath} />
        </motion.svg>
      ))}
    </div>
  );
}

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d={starPath} />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <motion.div
      className="flex-shrink-0 w-[320px]"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <blockquote className="group/card relative rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] p-5 h-full hover:border-emerald-500/25 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden">
        {/* Hover glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/0 group-hover/card:bg-emerald-500/10 rounded-full blur-3xl transition-all duration-500 pointer-events-none" />
        {/* Quote mark */}
        <div className="absolute top-3 right-4 text-4xl text-white/[0.04] group-hover/card:text-emerald-500/15 font-serif transition-all duration-500 select-none" aria-hidden="true">
          &ldquo;
        </div>

        <div className="flex items-center justify-between mb-1">
          <StarRating />
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/70 font-medium">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Geverifieerd
          </span>
        </div>
        <p className="text-white/80 text-sm mt-2 leading-relaxed relative z-10 line-clamp-3">
          &ldquo;{review.text}&rdquo;
        </p>
        <footer className="mt-4 relative z-10">
          <div className="flex items-center justify-between">
            <cite className="text-white/60 text-xs font-medium not-italic">{review.name}</cite>
            <span className="text-emerald-400/60 text-xs group-hover/card:text-emerald-400 transition-colors duration-300">
              {review.product}
            </span>
          </div>
          <time className="block text-white/30 text-[10px] mt-1">{review.date}</time>
        </footer>
      </blockquote>
    </motion.div>
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
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.04),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Ambient glow achter titel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-amber-400/10 rounded-full blur-[60px] animate-ambient-glow pointer-events-none" />

          <div className="relative inline-flex items-center gap-3 mb-4">
            <AnimatedHeaderStars />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="text-white font-bold text-lg"
            >
              5.0
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-slate-400 text-sm"
            >
              op Marktplaats
            </motion.span>
          </div>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
            1.360+ tevreden klanten
          </h2>
          <p className="text-slate-400">Lees wat onze klanten zeggen</p>
        </motion.div>
      </div>

      {/* Decorative separator line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
        className="max-w-xs mx-auto h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-10"
      />

      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 lg:w-48 bg-gradient-to-r from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 lg:w-48 bg-gradient-to-l from-[#050810] via-[#050810]/80 to-transparent z-10 pointer-events-none" />

      <div className="space-y-4">
        {/* Row 1 */}
        <motion.div className="flex gap-4" style={{ x: x1 }}>
          <div className="flex animate-marquee-slow gap-4">
            {[...reviews.slice(0, 6), ...reviews.slice(0, 6)].map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </motion.div>

        {/* Row 2 */}
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
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
