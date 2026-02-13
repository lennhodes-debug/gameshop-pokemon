'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';

export default function CartCounter() {
  const { getItemCount } = useCart();
  const count = getItemCount();
  const prevCount = useRef(count);
  const [action, setAction] = useState<'add' | 'remove' | null>(null);

  useEffect(() => {
    if (count > prevCount.current) {
      setAction('add');
    } else if (count < prevCount.current) {
      setAction('remove');
    }
    prevCount.current = count;

    if (count !== 0) {
      const timer = setTimeout(() => setAction(null), 400);
      return () => clearTimeout(timer);
    }
  }, [count]);

  if (count === 0) return null;

  const isGold = count >= 5;
  const isRainbow = count >= 10;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={
          action === 'add'
            ? { scale: 1.6, opacity: 0 }
            : action === 'remove'
            ? { scale: 0.6, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className={`absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center rounded-full text-[10px] font-semibold text-white px-1 ${
          isRainbow
            ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 animate-gradient-x'
            : isGold
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30'
            : 'bg-emerald-500'
        }`}
      >
        {count}
      </motion.span>
    </AnimatePresence>
  );
}
