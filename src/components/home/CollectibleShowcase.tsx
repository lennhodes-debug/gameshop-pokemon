'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface CollectibleItem {
  icon: string;
  title: string;
  description: string;
  value: string;
  color: string;
}

export default function CollectibleShowcase() {
  const collectibles: CollectibleItem[] = useMemo(() => [
    {
      icon: '📦',
      title: 'Compleet in Doos (CIB)',
      description: 'Originele verpakking met handleiding - het gouden standaard van collectors',
      value: '+40% waarde',
      color: 'from-amber-400 to-amber-600'
    },
    {
      icon: '🎮',
      title: 'Losse Cartridge',
      description: 'Pure gameplay - het hart van de collectie',
      value: 'Basis waarde',
      color: 'from-emerald-400 to-green-600'
    },
    {
      icon: '🌍',
      title: 'PAL/EUR Region',
      description: 'Europese versies - origineel Nederlands en zeldzaam',
      value: '+20% rarity',
      color: 'from-blue-400 to-indigo-600'
    },
    {
      icon: '✨',
      title: 'Pristine Condition',
      description: 'Zo goed als nieuw - geen krassen, geen slijtage',
      value: '+30% premium',
      color: 'from-purple-400 to-pink-600'
    }
  ], []);

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              Collector's Value
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Elke game heeft meer waarde als de voorwaarden optimaal zijn. Hier is hoe we waarderen.
          </p>
        </motion.div>

        {/* Collectible cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {collectibles.map((item, idx) => (
            <motion.div
              key={idx}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Card background */}
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

              {/* Card content */}
              <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700 group-hover:border-amber-400/50 rounded-lg p-6 transition-all duration-300 h-full">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-300 mb-4">{item.description}</p>
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold">
                      {item.value}
                    </div>
                  </div>
                </div>

                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why it matters */}
        <motion.div
          className="bg-gradient-to-r from-slate-800 to-slate-900 border border-amber-400/20 rounded-lg p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-3">Waarom dit uitmaakt</h3>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Dit zijn niet zomaar games - dit zijn stukjes Nintendo-erfgoed. Elke cassette, cartridge of disc vertegenwoordigt jaren van innovation en entertainment. We beschouwen elke aankoop als een investering in gaming geschiedenis.
          </p>
          <div className="mt-6 text-amber-300 font-semibold">
            🏆 100% authentieke PAL/EUR versies met verifiëerde provenance
          </div>
        </motion.div>
      </div>
    </section>
  );
}
