'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

const buttonVariants = {
  primary: {
    base: 'bg-white text-slate-900 font-medium shadow-lg shadow-white/10',
    hover: 'hover:bg-white/95 hover:shadow-white/20',
    active: 'active:scale-[0.98]',
    focus:
      'focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
  },
  secondary: {
    base: 'bg-white/[0.08] text-white/80 font-medium backdrop-blur-sm',
    hover: 'hover:bg-white/[0.12] hover:text-white',
    active: 'active:scale-[0.98]',
    focus:
      'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
  },
  ghost: {
    base: 'bg-transparent text-slate-700 font-medium',
    hover: 'hover:bg-slate-100',
    active: 'active:scale-[0.98]',
    focus: 'focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
  },
  danger: {
    base: 'bg-red-600 text-white font-medium shadow-lg shadow-red-600/20',
    hover: 'hover:bg-red-700 hover:shadow-red-600/30',
    active: 'active:scale-[0.98]',
    focus: 'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
  },
  success: {
    base: 'bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-600/20',
    hover: 'hover:bg-emerald-700 hover:shadow-emerald-600/30',
    active: 'active:scale-[0.98]',
    focus: 'focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
  },
};

const sizeStyles = {
  xs: 'h-8 px-3 text-xs',
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
  xl: 'h-16 px-10 text-base',
};

const roundedStyles = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  rounded = 'lg',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  ...props
}: ButtonProps) {
  const variantStyles = buttonVariants[variant];
  const baseClasses = `
    ${variantStyles.base}
    ${variantStyles.hover}
    ${variantStyles.active}
    ${variantStyles.focus}
    ${sizeStyles[size]}
    ${roundedStyles[rounded]}
    ${fullWidth ? 'w-full' : ''}
    inline-flex items-center justify-center gap-2
    transition-all duration-300
    outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${loading ? 'opacity-75 cursor-wait' : ''}
  `;

  return (
    <motion.button
      className={`${baseClasses} ${className || ''}`}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      whileHover={!disabled && !loading ? { y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          />
          <span>Bezig...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="inline-flex">{icon}</span>}
        </>
      )}
    </motion.button>
  );
}
