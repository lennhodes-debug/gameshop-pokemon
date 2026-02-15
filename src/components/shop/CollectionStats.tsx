'use client';

import { motion } from 'framer-motion';

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface CollectionStatsProps {
  stats: StatItem[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function CollectionStats({ stats }: CollectionStatsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-xl hover:shadow-emerald-500/10"
        >
          {/* Gradient background on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5"
            style={{
              backgroundImage: `linear-gradient(135deg, ${stat.color}, transparent)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              className="text-4xl mb-3"
            >
              {stat.icon}
            </motion.div>

            {/* Value */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-3xl font-black text-slate-900 dark:text-white mb-1"
            >
              {stat.value}
            </motion.div>

            {/* Label */}
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {stat.label}
            </p>
          </div>

          {/* Bottom accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent origin-left"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
