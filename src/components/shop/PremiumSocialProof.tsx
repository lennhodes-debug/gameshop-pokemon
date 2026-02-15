'use client';

import { motion } from 'framer-motion';

interface StatItem {
  icon: string;
  label: string;
  value: string;
  description: string;
}

const defaultStats: StatItem[] = [
  {
    icon: '🎮',
    label: 'Nintendo Games',
    value: '141+',
    description: 'Originele titels in voorraad',
  },
  {
    icon: '⭐',
    label: 'Klanttevredenheid',
    value: '4.9/5',
    description: 'Van duizenden reviews',
  },
  {
    icon: '🚀',
    label: 'Snelle Verzending',
    value: '24u',
    description: 'Dezelfde dag verzonden',
  },
  {
    icon: '💯',
    label: 'Garantie',
    value: '100%',
    description: 'Authenticiteit gegarandeerd',
  },
];

export default function PremiumSocialProof() {
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

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border-y border-emerald-200 dark:border-emerald-800"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {defaultStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20 dark:to-transparent opacity-0"
              />

              <div className="relative z-10">
                <motion.div whileHover={{ scale: 1.2 }} className="text-4xl mb-4">
                  {stat.icon}
                </motion.div>
                <motion.div className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2">
                  {stat.value}
                </motion.div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {stat.label}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-emerald-200 dark:border-emerald-800"
        >
          <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 mb-6">
            Vertrouwd door gaming enthusiasten
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {['🏆 Beste Keuze', '✅ Geverifieerd', '🔒 Veilig', '📦 Track & Trace'].map(
              (badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 flex items-center justify-center text-lg">
                    {badge.split(' ')[0]}
                  </div>
                  {badge.split(' ').slice(1).join(' ')}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
