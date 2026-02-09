'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

type TransitionVariant =
  | 'trust-to-products'
  | 'products-to-eras'
  | 'eras-to-series'
  | 'series-to-value'
  | 'value-to-showcase'
  | 'showcase-to-platforms'
  | 'light'
  | 'dark';

interface SectionDividerProps {
  variant?: TransitionVariant;
  label?: string;
}

const VARIANT_CONFIG: Record<string, { icon: string; label: string; colors: string }> = {
  'trust-to-products': {
    icon: '⭐',
    label: 'Onze toppers',
    colors: 'from-amber-400/40 via-emerald-400/60 to-amber-400/40',
  },
  'products-to-eras': {
    icon: '🕰️',
    label: 'Reis door de tijd',
    colors: 'from-emerald-400/40 via-teal-400/60 to-emerald-400/40',
  },
  'eras-to-series': {
    icon: '🗡️',
    label: 'Legendaire franchises',
    colors: 'from-teal-400/40 via-purple-400/60 to-teal-400/40',
  },
  'series-to-value': {
    icon: '💎',
    label: 'Collector waarde',
    colors: 'from-purple-400/40 via-amber-400/60 to-purple-400/40',
  },
  'value-to-showcase': {
    icon: '🎮',
    label: 'Ontdek ze allemaal',
    colors: 'from-amber-400/40 via-cyan-400/60 to-amber-400/40',
  },
  'showcase-to-platforms': {
    icon: '🎯',
    label: 'Kies je platform',
    colors: 'from-cyan-400/40 via-emerald-400/60 to-cyan-400/40',
  },
};

function NarrativeTransition({ icon, label, colors, scrollYProgress }: {
  icon: string;
  label: string;
  colors: string;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const lineScale = useSpring(
    useTransform(scrollYProgress, [0.1, 0.5], [0, 1]),
    { stiffness: 100, damping: 25 }
  );
  const contentOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [0, 1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [20, 0, 0, -20]);
  const iconScale = useSpring(
    useTransform(scrollYProgress, [0.2, 0.4], [0.5, 1]),
    { stiffness: 200, damping: 20 }
  );
  const iconRotate = useTransform(scrollYProgress, [0.2, 0.5], [-180, 0]);

  const dot1Opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.5, 0.7], [0, 0.8, 0.8, 0]);
  const dot2Opacity = useTransform(scrollYProgress, [0.15, 0.35, 0.55, 0.7], [0, 0.8, 0.8, 0]);
  const dot3Opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.7], [0, 0.8, 0.8, 0]);
  const dot1X = useTransform(scrollYProgress, [0.1, 0.6], ['-50%', '150%']);
  const dot2X = useTransform(scrollYProgress, [0.2, 0.7], ['-50%', '150%']);
  const dot3X = useTransform(scrollYProgress, [0.15, 0.65], ['-50%', '150%']);

  return (
    <>
      {/* Animated gradient line */}
      <div className="relative w-full max-w-lg mx-auto h-[2px]">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${colors} rounded-full`}
          style={{ scaleX: lineScale, opacity: contentOpacity }}
        />
        {/* Traveling dots */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
          style={{ left: dot1X, opacity: dot1Opacity }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-400"
          style={{ left: dot2X, opacity: dot2Opacity }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400"
          style={{ left: dot3X, opacity: dot3Opacity }}
        />
      </div>

      {/* Icon + label */}
      <motion.div
        className="flex items-center gap-3 mt-4"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.span
          className="text-2xl"
          style={{ scale: iconScale, rotate: iconRotate }}
        >
          {icon}
        </motion.span>
        <span className="text-sm font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">
          {label}
        </span>
      </motion.div>
    </>
  );
}

function SimpleDivider({ variant, scrollYProgress }: {
  variant: 'light' | 'dark';
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const scaleX = useTransform(scrollYProgress, [0, 0.5], [0.3, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ scaleX, opacity }}
      className={`h-[1px] w-full max-w-xs mx-auto ${
        variant === 'dark'
          ? 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent'
          : 'bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent'
      }`}
    />
  );
}

export default function SectionDivider({ variant = 'light', label }: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const config = VARIANT_CONFIG[variant];
  const isNarrative = !!config;

  return (
    <div ref={ref} className={`${isNarrative ? 'relative py-12' : 'py-2'} flex flex-col items-center justify-center overflow-hidden`}>
      {config ? (
        <NarrativeTransition
          icon={config.icon}
          label={label || config.label}
          colors={config.colors}
          scrollYProgress={scrollYProgress}
        />
      ) : (
        <SimpleDivider
          variant={variant as 'light' | 'dark'}
          scrollYProgress={scrollYProgress}
        />
      )}
    </div>
  );
}
