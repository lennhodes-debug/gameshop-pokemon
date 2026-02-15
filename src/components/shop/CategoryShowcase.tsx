'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
  textColor: string;
}

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory?: (id: string) => void;
  selectedCategory?: string;
}

const categoryIcons: Record<string, string> = {
  'Game Boy Advance': '🎮',
  'Nintendo DS': '📱',
  'Nintendo 3DS': '👾',
  'Game Boy': '🕹️',
  'Nintendo Switch': '🎯',
  'GameCube': '⚪',
  'N64': '🔷',
  'SNES': '⬜',
  'NES': '🔴',
  'Wii': '➿',
  'Wii U': '📦',
  'Consoles': '🖥️',
  'Accessories': '🎧',
};

export default function CategoryShowcase({
  categories,
  onSelectCategory,
  selectedCategory,
}: CategoryShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8"
    >
      <AnimatePresence>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const isHovered = hoveredId === category.id;

          return (
            <motion.button
              key={category.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectCategory?.(category.id)}
              className="relative"
              whileHover="hover"
            >
              {/* Background glow */}
              <motion.div
                className={`absolute inset-0 rounded-xl blur-xl ${category.color} opacity-0`}
                animate={{
                  opacity: isHovered || isSelected ? 0.3 : 0,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Card */}
              <motion.div
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${
                    isSelected
                      ? `${category.color} ${category.textColor} border-current`
                      : `bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100`
                  }
                `}
                animate={{
                  scale: isSelected ? 1.05 : 1,
                  borderColor: isHovered && !isSelected ? '#d1d5db' : undefined,
                }}
              >
                <motion.div
                  className="text-2xl mb-2 text-center"
                  animate={{
                    scale: isHovered || isSelected ? 1.2 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {categoryIcons[category.name] || '📦'}
                </motion.div>

                <div className="text-center">
                  <p className="text-xs sm:text-sm font-bold truncate">
                    {category.name}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected
                        ? 'opacity-90'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {category.count}
                  </p>
                </div>

                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute top-1 right-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
