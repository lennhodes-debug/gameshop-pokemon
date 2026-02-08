'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right';
}

export default function ImageReveal({ children, className = '', direction = 'left' }: ImageRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clipFrom = direction === 'left' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
  const clipTo = 'inset(0 0% 0 0)';

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Shimmer placeholder */}
      {!isVisible && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}

      {/* Reveal container */}
      <motion.div
        initial={{ clipPath: clipFrom }}
        animate={isVisible ? { clipPath: clipTo } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>

      {/* Wipe glow line */}
      {isVisible && (
        <motion.div
          className="absolute top-0 bottom-0 w-[3px] z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.6), rgba(6,182,212,0.6), transparent)',
            filter: 'blur(2px)',
          }}
          initial={{ [direction === 'left' ? 'left' : 'right']: '0%' }}
          animate={{ [direction === 'left' ? 'left' : 'right']: '100%' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      )}
    </div>
  );
}
