'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllPlatforms } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';

export default function PlatformGrid() {
  const platforms = getAllPlatforms();

  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4">
            12 Platforms
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Shop per platform
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Van klassieke retro consoles tot de nieuwste Nintendo Switch
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {platforms.map((platform, index) => {
            const colors = PLATFORM_COLORS[platform.name] || { from: 'from-slate-500', to: 'to-slate-700' };
            const label = PLATFORM_LABELS[platform.name] || platform.name;

            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={`/shop?platform=${encodeURIComponent(platform.name)}`}
                  className="group block relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className={`relative h-28 bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center overflow-hidden`}>
                    {/* Animated shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="text-white/90 text-2xl font-extrabold tracking-tight relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {label}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{platform.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{platform.count} producten</p>
                    </div>
                    <motion.div
                      className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
