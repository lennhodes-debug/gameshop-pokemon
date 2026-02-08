'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  blur?: boolean;
  scale?: boolean;
  className?: string;
  once?: boolean;
  staggerChildren?: number;
}

const getVariants = (
  direction: Direction,
  distance: number,
  blur: boolean,
  scale: boolean
): Variants => {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const sign = direction === 'down' || direction === 'right' ? -1 : 1;

  return {
    hidden: {
      opacity: 0,
      [axis]: sign * distance,
      ...(blur && { filter: 'blur(12px)' }),
      ...(scale && { scale: 0.95 }),
    },
    visible: {
      opacity: 1,
      [axis]: 0,
      ...(blur && { filter: 'blur(0px)' }),
      ...(scale && { scale: 1 }),
    },
  };
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 40,
  blur = false,
  scale = false,
  className,
  once = true,
  staggerChildren,
}: ScrollRevealProps) {
  const variants = getVariants(direction, distance, blur, scale);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as const,
        ...(staggerChildren && {
          staggerChildren,
        }),
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Child component for use inside stagger containers
export function ScrollRevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
