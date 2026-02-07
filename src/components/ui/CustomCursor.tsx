'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  const trailX = useSpring(cursorX, { damping: 40, stiffness: 150, mass: 0.8 });
  const trailY = useSpring(cursorY, { damping: 40, stiffness: 150, mass: 0.8 });

  useEffect(() => {
    // Only enable on desktop
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      const moveCursor = (e: MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        setIsVisible(true);
      };

      const checkPointer = () => {
        const el = document.elementFromPoint(cursorX.get(), cursorY.get());
        if (el) {
          const style = window.getComputedStyle(el);
          setIsPointer(
            style.cursor === 'pointer' ||
            el.tagName === 'A' ||
            el.tagName === 'BUTTON' ||
            el.closest('a') !== null ||
            el.closest('button') !== null
          );
        }
      };

      const handleDown = () => setIsClicking(true);
      const handleUp = () => setIsClicking(false);
      const handleLeave = () => setIsVisible(false);
      const handleEnter = () => setIsVisible(true);

      window.addEventListener('mousemove', moveCursor, { passive: true });
      window.addEventListener('mousemove', checkPointer, { passive: true });
      window.addEventListener('mousedown', handleDown);
      window.addEventListener('mouseup', handleUp);
      document.addEventListener('mouseleave', handleLeave);
      document.addEventListener('mouseenter', handleEnter);

      return () => {
        window.removeEventListener('mousemove', moveCursor);
        window.removeEventListener('mousemove', checkPointer);
        window.removeEventListener('mousedown', handleDown);
        window.removeEventListener('mouseup', handleUp);
        document.removeEventListener('mouseleave', handleLeave);
        document.removeEventListener('mouseenter', handleEnter);
      };
    }
  }, [cursorX, cursorY]);

  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
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

      {/* Hide default cursor globally */}
      <style jsx global>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
