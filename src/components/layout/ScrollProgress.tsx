'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  // Smooth spring-gebaseerde scroll progress
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Kleurverloop op basis van scroll positie: emerald -> teal -> cyan
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['#10b981', '#14b8a6', '#06b6d4']
  );

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left"
      style={{
        scaleX,
        backgroundColor,
      }}
    />
  );
}
