'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString('nl-NL')}{suffix}</span>;
}

const timeline = [
  {
    year: '2019',
    title: 'Het begin',
    description: 'Op mijn 15e begon ik met het verzamelen en verhandelen van Pokemon- en Nintendo-kaarten. Wat begon als een hobby op Marktplaats groeide al snel uit tot iets groters.',
  },
  {
    year: '2020',
    title: 'Van kaarten naar games',
    description: 'Mijn passie verschoof van kaarten naar Pokemon-games voor Nintendo. Ik begon met het inkopen, testen en doorverkopen van originele Nintendo-games, met de nadruk op kwaliteit en originaliteit.',
  },
  {
    year: '2021',
    title: 'Gameshop Enter groeit',
    description: 'Het assortiment breidde zich uit naar de volledige Nintendo-sector: van NES en Super Nintendo tot Game Boy, GameCube, Wii en Nintendo Switch. Consoles kwamen erbij.',
  },
  {
    year: '2023',
    title: 'Studie en ondernemen',
    description: 'Naast het runnen van Gameshop Enter startte ik met de studie Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Theorie en praktijk komen samen.',
  },
  {
    year: '2024',
    title: '3000+ tevreden klanten',
    description: 'Een enorme mijlpaal: meer dan 3000 tevreden klanten en 1360+ positieve reviews op Marktplaats met een perfecte 5.0 score. Het assortiment groeide naar meer dan 346 producten over 12 platforms.',
  },
  {
    year: 'Nu',
    title: 'De Nintendo specialist',
    description: 'Gameshop Enter is uitgegroeid tot de Nintendo specialist van Nederland. Met meer dan 3000 tevreden klanten, 1360+ reviews, een perfecte score, en een passie die alleen maar sterker wordt.',
  },
];

const values = [
  {
    title: 'Originaliteit',
    description: 'Uitsluitend 100% originele Nintendo producten. Geen reproducties, geen namaak. Elk product is persoonlijk gecontroleerd.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Transparantie',
    description: 'Elke productpagina vermeldt duidelijk de conditie en compleetheid. Je weet precies wat je koopt.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Kwaliteit',
    description: 'Elk product wordt persoonlijk getest op werking. Zorgvuldig verpakt en snel verzonden via PostNL.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Passie',
    description: 'Opgericht vanuit een persoonlijke liefde voor Nintendo. Dat merk je in alles wat we doen.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

const stats = [
  { value: 3000, suffix: '+', label: 'Tevreden klanten' },
  { value: 1360, suffix: '+', label: 'Reviews' },
  { value: 5, suffix: '.0', label: 'Marktplaats score' },
  { value: 346, suffix: '+', label: 'Producten' },
  { value: 12, suffix: '', label: 'Nintendo platforms' },
  { value: 6, suffix: '+', label: 'Jaar ervaring' },
];

export default function OverOnsPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <div className="relative bg-[#050810] py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.08),transparent_50%)]" />
        {/* Floating hexagons */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="absolute top-10 right-[15%] opacity-[0.03]">
          <svg width="150" height="150" viewBox="0 0 120 120" fill="none"><path d="M60 5 L108 30 L108 90 L60 115 L12 90 L12 30 Z" stroke="white" strokeWidth="0.5" /></svg>
        </motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} className="absolute bottom-10 left-[10%] opacity-[0.03]">
          <svg width="100" height="100" viewBox="0 0 120 120" fill="none"><path d="M60 5 L108 30 L108 90 L60 115 L12 90 L12 30 Z" stroke="#10b981" strokeWidth="1" /></svg>
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Ons verhaal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6">
              Van kaarten op mijn 15e<br />
              <span className="gradient-text">tot Nintendo specialist</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Gameshop Enter is opgericht door Lenn Hodes vanuit een persoonlijke passie voor Nintendo. Dit is ons verhaal.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <section className="relative bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-2xl lg:text-3xl font-extrabold gradient-text">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
            Hoi, ik ben Lenn
          </h2>
          <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
            <p>
              Mijn naam is Lenn Hodes, oprichter van Gameshop Enter. Toen ik 15 was, begon ik met het verzamelen en verhandelen van Pokemon- en Nintendo-kaarten. Het was een hobby die al snel uitgroeide tot een serieuze onderneming.
            </p>
            <p>
              Van kaarten verschoof mijn focus naar originele Pokemon-games voor Nintendo-consoles. Ik ontdekte dat er een enorme markt was voor goed geteste, originele Nintendo-producten. Zo werd Gameshop Enter geboren: een plek waar gamers en verzamelaars terecht kunnen voor gegarandeerd originele Nintendo-games en consoles.
            </p>
            <p>
              Vandaag de dag bestrijkt Gameshop Enter de volledige Nintendo-sector. Van klassieke NES- en Super Nintendo-titels tot de nieuwste Nintendo Switch-games, en van Game Boy tot GameCube-consoles. Elk product wordt door mij persoonlijk getest op werking en zorgvuldig verpakt voor verzending.
            </p>
            <p>
              Naast het runnen van Gameshop Enter studeer ik Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Mijn studie en mijn bedrijf versterken elkaar: de theorie die ik leer, pas ik direct toe in de praktijk.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="relative bg-[#050810] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Tijdlijn
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
              Onze reis
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-teal-500/20 to-transparent lg:-translate-x-px" />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`relative flex items-start gap-8 lg:gap-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 lg:left-1/2 -translate-x-1/2 mt-1.5">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 ring-4 ring-[#050810]" />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ml-12 lg:ml-0 ${i % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'}`}>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
                      {item.year}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{item.description}</p>
                  </div>

                  {/* Spacer for other side */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-4">
            Missie
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
            Mijn missie
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Ik geloof dat retro gaming meer is dan nostalgie. Het is een manier om tijdloze klassiekers te bewaren en te delen met de volgende generatie gamers. Mijn missie is om elke Nintendo-liefhebber toegang te geven tot originele, geteste producten tegen eerlijke prijzen, met de persoonlijke service die je verdient.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Onze kernwaarden</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-emerald-200/50 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600 mb-5">
                  {value.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{value.title}</h3>
                <p className="text-slate-500 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business details */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 lg:p-12"
        >
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Bedrijfsgegevens</h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
            {[
              ['Bedrijfsnaam', 'Gameshop Enter'],
              ['Eigenaar', 'Lenn Hodes'],
              ['KvK-nummer', '93642474'],
              ['Actief sinds', '2019'],
              ['Specialisatie', 'Originele Nintendo games en consoles'],
              ['Platforms', '12 Nintendo platforms'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</dt>
                <dd className="text-slate-900 font-medium">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">E-mail</dt>
              <dd><a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-medium">gameshopenter@gmail.com</a></dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Telefoon / WhatsApp</dt>
              <dd><a href="tel:0641126067" className="text-emerald-600 hover:text-emerald-700 font-medium">06-41126067</a></dd>
            </div>
          </div>

          <div className="mt-10 p-5 bg-amber-50 border border-amber-200/60 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-amber-800 font-medium">
                Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#050810] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              Klaar om te shoppen?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
              Ontdek ons complete assortiment van meer dan 346 originele Nintendo producten
            </p>
            <Link href="/shop">
              <Button size="lg">
                Bekijk alle producten
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
