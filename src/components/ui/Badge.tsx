import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'console' | 'condition' | 'completeness';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variant === 'default' && 'bg-slate-100 text-slate-700',
        variant === 'premium' && 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
        variant === 'console' && 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
        variant === 'condition' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        variant === 'completeness' && 'bg-sky-50 text-sky-700 border border-sky-200',
        className
      )}
    >
      {children}
    </span>
  );
}
