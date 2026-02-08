'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GAME_SERIES } from '@/lib/series';

interface SeriesCompletionCardProps {
  seriesKey: string;
  totalGames: number;
  collectedCount: number;
  onViewSeries?: () => void;
}

export default function SeriesCompletionCard({
  seriesKey,
  totalGames,
  collectedCount,
  onViewSeries
}: SeriesCompletionCardProps) {
  const series = GAME_SERIES[seriesKey];
  if (!series) return null;

  const percentage = Math.round((collectedCount / totalGames) * 100);
  const isComplete = collectedCount === totalGames;
  const isStarted = collectedCount > 0;

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-amber-400/50 transition-all duration-300 p-4"
      whileHover={{ scale: 1.02, borderColor: 'rgba(251, 191, 36, 0.5)' }}
      onClick={onViewSeries}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{series.emoji}</span>
            <div>
              <h3 className="font-bold text-white text-sm">{series.name}</h3>
              <p className="text-xs text-slate-400">{collectedCount} of {totalGames} games</p>
            </div>
          </div>
          {isComplete && (
            <motion.div
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🏆
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mb-3">
          <motion.div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : isStarted
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : 'bg-slate-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-amber-300">{percentage}%</span>
            {isComplete && <span className="ml-1 text-green-400">COMPLETE!</span>}
          </div>

          {/* CTA */}
          <motion.button
            className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isComplete ? 'View' : 'Continue'}
          </motion.button>
        </div>

        {/* Missing games hint */}
        {isStarted && !isComplete && (
          <p className="mt-3 text-xs text-slate-400 italic">
            {totalGames - collectedCount} more to complete this series
          </p>
        )}
      </div>

      {/* Border animation on complete */}
      {isComplete && (
        <div className="absolute inset-0 rounded-lg border-2 border-transparent animate-pulse" style={{
          borderImage: 'linear-gradient(45deg, #fbbf24, #34d399, #fbbf24) 1',
          animation: 'pulse-glow 2s ease-in-out infinite'
        }} />
      )}
    </motion.div>
  );
}
