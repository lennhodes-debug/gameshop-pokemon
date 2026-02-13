'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

// ============================================================================
// DATA — Pokemon generaties die we verkopen
// ============================================================================

interface Generation {
  id: string;
  gen: string;
  year: string;
  title: string;
  platform: string;
  platformFilter: string;
  description: string;
  games: string[];
  accentFrom: string;
  accentTo: string;
  accentRgb: string;
}

const generations: Generation[] = [
  {
    id: 'gen1',
    gen: 'Generatie I',
    year: '1996',
    title: 'Red, Blue & Yellow',
    platform: 'Game Boy / Color',
    platformFilter: 'Game+Boy+%2F+Color',
    description:
      'Waar het allemaal begon. De eerste 151 Pokemon veroverden de wereld en maakten van de Game Boy een must-have. Het simpele concept — vang ze allemaal — werd een cultureel fenomeen dat tot op de dag van vandaag voortleeft.',
    games: ['Pokemon Red', 'Pokemon Blue', 'Pokemon Yellow'],
    accentFrom: 'from-red-500',
    accentTo: 'to-blue-500',
    accentRgb: '239, 68, 68',
  },
  {
    id: 'gen2',
    gen: 'Generatie II',
    year: '1999',
    title: 'Gold, Silver & Crystal',
    platform: 'Game Boy / Color',
    platformFilter: 'Game+Boy+%2F+Color',
    description:
      'De Johto-regio bracht 100 nieuwe Pokemon, een dag-nacht cyclus en de mogelijkheid om terug te reizen naar Kanto. Velen beschouwen Gold & Silver als het hoogtepunt van de klassieke Pokemon-ervaring.',
    games: ['Pokemon Gold', 'Pokemon Silver', 'Pokemon Crystal'],
    accentFrom: 'from-amber-400',
    accentTo: 'to-slate-400',
    accentRgb: '245, 158, 11',
  },
  {
    id: 'gen3',
    gen: 'Generatie III',
    year: '2002',
    title: 'Ruby, Sapphire & Emerald',
    platform: 'Game Boy Advance',
    platformFilter: 'Game+Boy+Advance',
    description:
      'De sprong naar de GBA bracht prachtige kleurengraphics, Abilities en dubbele gevechten. De Hoenn-regio met zijn tropische eilanden en legendarische weergoden is een favoriet onder fans. Emerald wordt gezien als de ultieme versie.',
    games: ['Pokemon Ruby', 'Pokemon Sapphire', 'Pokemon Emerald', 'Pokemon FireRed', 'Pokemon LeafGreen'],
    accentFrom: 'from-emerald-500',
    accentTo: 'to-rose-500',
    accentRgb: '16, 185, 129',
  },
  {
    id: 'gen4',
    gen: 'Generatie IV',
    year: '2006',
    title: 'Diamond, Pearl & Platinum',
    platform: 'Nintendo DS',
    platformFilter: 'Nintendo+DS',
    description:
      'De Nintendo DS bracht Pokemon naar twee schermen met touchscreen-bediening. De Sinnoh-regio introduceerde online battles en trades via Wi-Fi. HeartGold & SoulSilver worden vaak de beste Pokemon-remakes ooit genoemd.',
    games: ['Pokemon Diamond', 'Pokemon Pearl', 'Pokemon Platinum', 'Pokemon HeartGold', 'Pokemon SoulSilver'],
    accentFrom: 'from-sky-400',
    accentTo: 'to-indigo-500',
    accentRgb: '56, 189, 248',
  },
  {
    id: 'gen5',
    gen: 'Generatie V',
    year: '2010',
    title: 'Black, White & Sequels',
    platform: 'Nintendo DS',
    platformFilter: 'Nintendo+DS',
    description:
      'De meest ambitieuze DS-generatie met 156 compleet nieuwe Pokemon, geanimeerde sprites en het eerste echte vervolg in de serie. Black 2 & White 2 bewezen dat Game Freak nog steeds kon verrassen.',
    games: ['Pokemon Black', 'Pokemon White', 'Pokemon Black 2', 'Pokemon White 2'],
    accentFrom: 'from-slate-700',
    accentTo: 'to-white',
    accentRgb: '148, 163, 184',
  },
];

// ============================================================================
// GENERATIE KAART COMPONENT
// ============================================================================

function GenerationCard({ gen, index }: { gen: Generation; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(${gen.accentRgb}, 0.6), rgba(${gen.accentRgb}, 0.2))`,
        }}
      />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-1"
              style={{ color: `rgba(${gen.accentRgb}, 0.7)` }}
            >
              {gen.gen} — {gen.year}
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              {gen.title}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-white/[0.04] px-3 py-1 rounded-full">
            {gen.platform}
          </span>
        </div>

        {/* Beschrijving */}
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          {gen.description}
        </p>

        {/* Games lijst */}
        <div className="flex flex-wrap gap-2 mb-6">
          {gen.games.map((game) => (
            <span
              key={game}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border"
              style={{
                borderColor: `rgba(${gen.accentRgb}, 0.15)`,
                backgroundColor: `rgba(${gen.accentRgb}, 0.05)`,
                color: `rgba(${gen.accentRgb}, 0.8)`,
              }}
            >
              {game}
            </span>
          ))}
        </div>

        {/* Shop link */}
        <Link href={`/shop?platform=${gen.platformFilter}`}>
          <motion.span
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: `rgba(${gen.accentRgb}, 0.8)` }}
          >
            Bekijk {gen.platform} games
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}

// ============================================================================
// HOOFD PAGINA COMPONENT
// ============================================================================

export default function NintendoPage() {
  const introRef = useRef<HTMLDivElement>(null);
  const introInView = useInView(introRef, { once: true });
  const genRef = useRef<HTMLDivElement>(null);
  const genInView = useInView(genRef, { once: true, margin: '-10%' });

  return (
    <div className="pt-16 lg:pt-20">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Nintendo & Pokemon — Van Game Boy tot DS',
            description:
              'De geschiedenis van Pokemon op Nintendo handhelds: van Gen I op de Game Boy tot Gen V op de DS.',
            publisher: {
              '@type': 'Organization',
              name: 'Gameshop Enter',
              url: 'https://gameshopenter.nl',
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative bg-[#050810] overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.04),transparent_50%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-20 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto mb-8"
          />

          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-amber-400/80 text-[11px] font-semibold uppercase tracking-[0.25em] mb-6"
          >
            Gotta catch &apos;em all
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-white tracking-tight mb-6 leading-[1.1]"
          >
            Nintendo{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-red-400 to-blue-400">
              &amp; Pokemon
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Van de eerste 151 Pokemon op de Game Boy tot de vijfde generatie op de DS
            — ontdek de geschiedenis van de grootste game-franchise aller tijden.
          </motion.p>
        </div>
      </section>

      {/* Nintendo intro */}
      <section ref={introRef} className="relative bg-[#050810] overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={introInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-6">
              Nintendo — pionier in gaming
            </h2>
            <div className="space-y-4 text-slate-400 text-[15px] leading-relaxed">
              <p>
                Opgericht in 1889 als fabrikant van hanafuda speelkaarten, groeide Nintendo uit tot
                het meest invloedrijke gamebedrijf ter wereld. Met de Game Boy (1989) en Nintendo DS (2004)
                revolutioneerde het bedrijf mobiel gamen.
              </p>
              <p>
                Maar geen enkele franchise heeft zoveel impact gehad als Pokemon. Sinds de lancering
                in 1996 zijn er meer dan 480 miljoen Pokemon-games verkocht wereldwijd — en het
                avontuur gaat door.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </section>

      {/* Generatie overzicht */}
      <section ref={genRef} className="relative bg-[#050810] overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.04),transparent_50%)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={genInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-500/50 block mb-4">
              Vijf generaties
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              De Pokemon die wij verkopen
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
              Wij zijn gespecialiseerd in Pokemon games voor Game Boy, GBA, DS en 3DS.
              Van de originele Red &amp; Blue tot Black 2 &amp; White 2.
            </p>
          </motion.div>

          <div className="space-y-6">
            {generations.map((gen, i) => (
              <GenerationCard key={gen.id} gen={gen} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#050810] overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_55%)]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-6"
          >
            Ontdek onze{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              collectie
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-slate-400 text-base mb-10 max-w-lg mx-auto"
          >
            34 authentieke Pokemon games, allemaal getest en met eigen fotografie.
            Compleet in doos of los — jij kiest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/shop">
              <motion.span
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 transition-all"
              >
                Bekijk alle Pokemon games
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.span>
            </Link>
            <Link href="/inkoop">
              <motion.span
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white font-semibold hover:bg-white/[0.08] transition-all"
              >
                Pokemon games verkopen
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
