'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface PremiumToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: ReactNode;
  onClose: () => void;
  autoClose?: number;
}

const toastConfig = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: '✓',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-200',
    messageColor: 'text-green-700 dark:text-green-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: '!',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-200',
    messageColor: 'text-red-700 dark:text-red-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'ℹ',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-200',
    messageColor: 'text-blue-700 dark:text-blue-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '⚠',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-900 dark:text-amber-200',
    messageColor: 'text-amber-700 dark:text-amber-300',
  },
};

export function PremiumToast({
  id,
  type,
  title,
  message,
  onClose,
  autoClose = 4000,
}: PremiumToastProps) {
  const config = toastConfig[type];

  // Auto close after duration
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`${config.bg} ${config.border} border rounded-xl p-4 shadow-lg backdrop-blur-sm flex gap-3 max-w-sm`}
    >
      {/* Icon */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`${config.iconBg} ${config.iconColor} h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold`}
      >
        {config.icon}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${config.titleColor}`}>{title}</p>
        {message && <p className={`text-xs mt-1 ${config.messageColor}`}>{message}</p>}
      </div>

      {/* Close button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: autoClose / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'amber' : 'blue'}-500 origin-left`}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
}

// Toast Container
export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: PremiumToastProps[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <PremiumToast {...toast} onClose={() => onRemove(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
