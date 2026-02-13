'use client';

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
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium cursor-default',
        variant === 'default' && 'bg-slate-100 text-slate-500',
        variant === 'premium' && 'bg-amber-50 text-amber-600',
        variant === 'console' && 'bg-blue-50 text-blue-600',
        variant === 'condition' && 'bg-slate-50 text-slate-500',
        variant === 'completeness' && 'bg-slate-50 text-slate-500',
        variant === 'new' && 'bg-emerald-50 text-emerald-600',
        variant === 'sale' && 'bg-red-50 text-red-600',
        variant === 'free-shipping' && 'bg-emerald-50 text-emerald-600',
        variant === 'popular' && 'bg-amber-50 text-amber-600',
        className
      )}
    >
      {children}
    </span>
  );
}
