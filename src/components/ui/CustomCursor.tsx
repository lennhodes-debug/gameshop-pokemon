'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  const trailX = useSpring(cursorX, { damping: 40, stiffness: 150, mass: 0.8 });
  const trailY = useSpring(cursorY, { damping: 40, stiffness: 150, mass: 0.8 });

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const noReducedMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsDesktop(isFinePointer && noReducedMotion);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    let rafId: number | null = null;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      // Throttle pointer check via rAF
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const el = document.elementFromPoint(cursorX.get(), cursorY.get());
          if (el) {
            setIsPointer(
              el.tagName === 'A' ||
              el.tagName === 'BUTTON' ||
              el.closest('a') !== null ||
              el.closest('button') !== null
            );
          }
          rafId = null;
        });
      }
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);
    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isDesktop, cursorX, cursorY]);

  if (!isDesktop || prefersReducedMotion) return null;

  return (
    <>
      {/* Main cursor dot — puur decoratief overlay, default cursor blijft intact */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.6 : isPointer ? 1.8 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      >
        <div className="w-4 h-4 rounded-full bg-white" />
      </motion.div>

      {/* Trailing ring */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.8 : isPointer ? 1.5 : 1,
          opacity: isVisible ? 0.4 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-10 h-10 rounded-full border border-emerald-400/60" />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isPointer ? 2 : 1,
          opacity: isVisible ? 0.15 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-20 h-20 rounded-full bg-emerald-400 blur-xl" />
      </motion.div>
    </>
  );
}
