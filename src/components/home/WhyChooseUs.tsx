'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const USP_ITEMS = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '100% Origineel',
    description: 'Elk product wordt gecontroleerd op originaliteit. Geen reproducties, geen namaak.',
    accent: '#10b981',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Persoonlijk Getest',
    description: 'Elke game wordt opgestart en getest. Save-functie, pins, alles gecheckt.',
    accent: '#0ea5e9',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    title: 'Eigen Fotografie',
    description: 'Geen stockfoto\'s. Wat je ziet is wat je krijgt — eigen foto\'s van elk product.',
    accent: '#8b5cf6',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: 'Zorgvuldig Verpakt',
    description: 'Bubbeltjesfolie, stevige dozen. Elk pakketje met dezelfde aandacht als voor een vriend.',
    accent: '#f59e0b',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-24 lg:py-36 overflow-hidden">
      {/* Achtergrond */}
      <div className="absolute inset-0 bg-[#050810]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Links: Console collage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-square max-w-[480px] mx-auto">
              {/* Grote achtergrond glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 blur-3xl" />

              {/* Console grid */}
              <div className="relative grid grid-cols-2 gap-4 p-4">
                {[
                  { src: '/images/nintendo/ds-console.webp', label: 'Nintendo DS', delay: 0 },
                  { src: '/images/nintendo/gba-console.webp', label: 'Game Boy Advance', delay: 0.1 },
                  { src: '/images/nintendo/3ds-console.webp', label: 'Nintendo 3DS', delay: 0.2 },
                  { src: '/images/nintendo/gbc-console.webp', label: 'Game Boy Color', delay: 0.3 },
                ].map((console, i) => (
                  <motion.div
                    key={console.label}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + console.delay, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(15,23,42,0.8), rgba(10,16,30,0.95))',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="aspect-square flex items-center justify-center p-6">
                      <Image
                        src={console.src}
                        alt={console.label}
                        width={200}
                        height={200}
                        className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
                      <span className="text-white/40 text-[10px] font-medium">{console.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Rechts: USP lijst */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-white/25 text-xs font-medium uppercase tracking-[0.2em] mb-5">
                Waarom Gameshop Enter
              </p>
              <h2 className="text-3xl lg:text-[44px] font-light text-white leading-[1.1] tracking-[-0.03em] mb-10">
                Kwaliteit die je{' '}
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                  kunt vertrouwen
                </span>
              </h2>
            </motion.div>

            <div className="space-y-6">
              {USP_ITEMS.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex gap-4 p-4 -mx-4 rounded-2xl hover:bg-white/[0.02] transition-colors duration-300"
                >
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: `rgba(${item.accent === '#10b981' ? '16,185,129' : item.accent === '#0ea5e9' ? '14,165,233' : item.accent === '#8b5cf6' ? '139,92,246' : '245,158,11'},0.1)`,
                      color: item.accent,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-base mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
