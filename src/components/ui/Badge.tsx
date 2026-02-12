'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'console' | 'condition' | 'completeness' | 'new' | 'sale' | 'free-shipping' | 'popular';
  className?: string;
}

const VARIANT_ICONS: Partial<Record<NonNullable<BadgeProps['variant']>, string>> = {
  premium: '\u2726',
  completeness: '\u25A0',
  console: '\u25B6',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const icon = VARIANT_ICONS[variant];

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold animate-badge-in cursor-default',
        variant === 'default' && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
        variant === 'premium' && 'relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-shadow duration-300',
        variant === 'console' && 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
        variant === 'condition' && 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
        variant === 'completeness' && 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800',
        variant === 'new' && 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        variant === 'sale' && 'relative overflow-hidden bg-gradient-to-r from-red-500 to-orange-500 text-white',
        variant === 'free-shipping' && 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        variant === 'popular' && 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        className
      )}
    >
      {variant === 'sale' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer rounded-full" />
      )}
      {variant === 'premium' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer rounded-full" />
      )}
      <span className="relative flex items-center gap-1">
        {icon && <span className="leading-none">{icon}</span>}
        {children}
      </span>
    </motion.span>
  );
}
