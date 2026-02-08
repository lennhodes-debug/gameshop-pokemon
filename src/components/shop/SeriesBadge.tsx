'use client';

import { motion } from 'framer-motion';

interface SeriesBadgeProps {
  seriesName: string;
  position: number;
  totalInSeries: number;
  onClick?: () => void;
}

export default function SeriesBadge({ seriesName, position, totalInSeries, onClick }: SeriesBadgeProps) {
  const isComplete = position === totalInSeries;

  return (
    <motion.div
      className="group relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
    >
      {/* Badge Container */}
      <div className="relative inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-xs font-bold text-white shadow-md group-hover:shadow-lg transition-all duration-300">
        {/* Icon based on position */}
        <span className="mr-1.5">
          {isComplete ? '🏆' : position === 1 ? '🎮' : '📖'}
        </span>

        {/* Series info */}
        <span className="truncate max-w-[120px]">{seriesName}</span>

        {/* Counter */}
        <span className="ml-1.5 text-white/90 font-semibold">
          {position}/{totalInSeries}
        </span>
      </div>

      {/* Tooltip on hover */}
      <motion.div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0, y: 4 }}
        whileHover={{ opacity: 1, y: -4 }}
      >
        {isComplete ? '✅ Series complete!' : `${totalInSeries - position} more to collect`}
      </motion.div>

      {/* Glow effect when complete */}
      {isComplete && (
        <div className="absolute inset-0 rounded-full animate-pulse-glow" />
      )}
    </motion.div>
  );
}
