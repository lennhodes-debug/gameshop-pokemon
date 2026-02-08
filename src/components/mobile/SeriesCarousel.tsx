'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useSwipeGesture } from '@/hooks/useGestureRecognition';
import type { SwipeEvent } from '@/hooks/useGestureRecognition';

interface SeriesCarouselProps {
  series: Array<{
    id: string;
    name: string;
    emoji: string;
    color: string;
    games: Array<{ sku: string; name: string }>;
  }>;
}

export default function SeriesCarousel({ series }: SeriesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleSwipe = useCallback((event: SwipeEvent) => {
    if (event.direction === 'left') {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % series.length);
    } else if (event.direction === 'right') {
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + series.length) % series.length);
    }
  }, [series.length]);

  const ref = useSwipeGesture(handleSwipe, {
    minDistance: 20,
    minVelocity: 0.5
  });

  const current = series[currentIndex];
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div
      ref={ref}
      className="relative w-full h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
        >
          {/* Series header */}
          <div className="text-5xl mb-4">{current.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">{current.name}</h2>
          <p className="text-slate-300 text-sm mb-6 text-center">
            {current.games.length} games in series
          </p>

          {/* Game list */}
          <div className="w-full max-h-40 overflow-y-auto space-y-2">
            {current.games.slice(0, 5).map((game) => (
              <motion.div
                key={game.sku}
                className="px-4 py-2 rounded bg-slate-700/50 text-slate-300 text-sm text-center hover:bg-slate-700 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {game.name}
              </motion.div>
            ))}
            {current.games.length > 5 && (
              <div className="px-4 py-2 text-slate-400 text-xs text-center italic">
                +{current.games.length - 5} more
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {series.map((_, idx) => (
          <motion.button
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-amber-400 w-6' : 'bg-slate-600 hover:bg-slate-500'
            }`}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <div className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
        ↔ Swipe
      </div>
    </div>
  );
}
