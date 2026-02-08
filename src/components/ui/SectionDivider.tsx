'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface SectionDividerProps {
  variant?: 'light' | 'dark';
}

export default function SectionDivider({ variant = 'light' }: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scaleX = useTransform(scrollYProgress, [0, 0.5], [0.3, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="py-2 flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ scaleX, opacity }}
        className={`h-[1px] w-full max-w-xs mx-auto ${
          variant === 'dark'
            ? 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'
        }`}
      />
    </div>
  );
}
