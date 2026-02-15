'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-[0.98]',
          variant === 'primary' &&
            'bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white btn-glow hover:-translate-y-0.5',
          variant === 'secondary' &&
            'bg-navy-700 dark:bg-slate-800 text-white dark:text-slate-100 hover:bg-navy-600 dark:hover:bg-slate-700',
          variant === 'outline' &&
            'border-2 border-emerald-500/30 dark:border-emerald-400/30 text-emerald-400 dark:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:border-emerald-500/50 dark:hover:border-emerald-400/50',
          variant === 'ghost' &&
            'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5 dark:hover:bg-white/10',
          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'md' && 'px-6 py-3 text-sm',
          size === 'lg' && 'px-8 py-4 text-base',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
