'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedPriceProps {
  price: number;
  className?: string;
}

function formatPriceString(price: number): string {
  return price.toFixed(2).replace('.', ',');
}

function RollingDigit({ digit, delay }: { digit: string; delay: number }) {
  const isNumber = /\d/.test(digit);

  if (!isNumber) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay * 0.5 }}
      >
        {digit}
      </motion.span>
    );
  }

  return (
    <span className="inline-block overflow-hidden h-[1em] relative" style={{ width: '0.6em' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            delay,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function AnimatedPrice({ price, className = '' }: AnimatedPriceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const priceStr = formatPriceString(price);
  const chars = `€${priceStr}`.split('');

  return (
    <span ref={ref} className={`inline-flex items-baseline ${className}`}>
      {isVisible ? (
        chars.map((char, i) => {
          // Euro sign appears first, then digits with staggered delay
          // Decimal part rolls faster
          const isDecimal = i > chars.indexOf(',');
          const baseDelay = i === 0 ? 0 : 0.05 * i;
          const delay = isDecimal ? baseDelay * 0.5 : baseDelay;

          return <RollingDigit key={`${i}-${char}`} digit={char} delay={delay} />;
        })
      ) : (
        <span className="invisible">{`€${priceStr}`}</span>
      )}
    </span>
  );
}
