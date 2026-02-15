'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// STAGGER CONTAINER - For coordinated animations
export function StaggerContainer({
  children,
  staggerChildren = 0.05,
  delayChildren = 0.1,
  className = '',
}: {
  children: ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// FADE IN ITEM
export function FadeInItem({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay, duration: 0.3 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// SCALE IN ITEM
export function ScaleInItem({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { delay, duration: 0.4 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// SLIDE IN FROM LEFT
export function SlideInFromLeft({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { delay, duration: 0.4 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// BOUNCE EFFECT
export function BounceItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// GLOW EFFECT
export function GlowEffect({
  children,
  color = 'emerald',
  className = '',
}: {
  children: ReactNode;
  color?: 'emerald' | 'blue' | 'purple' | 'orange';
  className?: string;
}) {
  const colorMap = {
    emerald: 'shadow-emerald-500/50',
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    orange: 'shadow-orange-500/50',
  };

  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0px rgba(0,0,0,0)`,
          `0 0 20px rgba(0,0,0,0.1)`,
          `0 0 0px rgba(0,0,0,0)`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
      className={`${colorMap[color]} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ROTATE ITEM
export function RotateItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
