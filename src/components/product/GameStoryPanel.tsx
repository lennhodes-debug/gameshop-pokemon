'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface GameStoryPanelProps {
  story: {
    title: string;
    year: number;
    platform: string;
    developer: string;
    story: string;
    culturalImpact: string;
    funFacts: string[];
  };
}

export default function GameStoryPanel({ story }: GameStoryPanelProps) {
  const [expandedFact, setExpandedFact] = useState<number | null>(null);

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-b border-amber-700/30 px-6 py-4">
        <h3 className="text-2xl font-bold text-white mb-2">{story.title}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <div>📅 {story.year}</div>
          <div>🎮 {story.platform}</div>
          <div>👨‍💻 {story.developer}</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Story */}
        <div>
          <h4 className="text-lg font-bold text-amber-300 mb-2">📖 Het Verhaal</h4>
          <p className="text-slate-300 leading-relaxed">{story.story}</p>
        </div>

        {/* Cultural Impact */}
        <div>
          <h4 className="text-lg font-bold text-amber-300 mb-2">🌍 Culturele Impact</h4>
          <p className="text-slate-300 leading-relaxed">{story.culturalImpact}</p>
        </div>

        {/* Fun Facts */}
        <div>
          <h4 className="text-lg font-bold text-amber-300 mb-3">✨ Leuke Feiten</h4>
          <div className="space-y-2">
            {story.funFacts.map((fact, idx) => (
              <motion.button
                key={idx}
                className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-amber-400/50 transition-all duration-300"
                onClick={() => setExpandedFact(expandedFact === idx ? null : idx)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-slate-300 text-sm">{fact}</span>
                  <span className="ml-2 text-amber-300 text-lg flex-shrink-0">
                    {expandedFact === idx ? '−' : '+'}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Collector's Note */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-200 text-sm italic">
            💎 Dit spel is niet alleen entertainment - het is een stukje gaming geschiedenis. De originele PAL/EUR versie is zelden en waardevol voor collectors.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
