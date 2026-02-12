import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'console' | 'condition' | 'completeness' | 'new' | 'sale' | 'free-shipping' | 'popular';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold animate-badge-in',
        variant === 'default' && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
        variant === 'premium' && 'relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
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
      {(variant === 'premium' || variant === 'sale') && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer rounded-full" />
      )}
      <span className="relative">{children}</span>
    </span>
  );
}
