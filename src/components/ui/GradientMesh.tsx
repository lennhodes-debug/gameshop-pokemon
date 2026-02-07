'use client';

import { motion } from 'framer-motion';

interface GradientMeshProps {
  className?: string;
  variant?: 'hero' | 'section' | 'subtle';
}

export default function GradientMesh({ className = '', variant = 'hero' }: GradientMeshProps) {
  const configs = {
    hero: {
      orbs: [
        { color: 'bg-emerald-500/[0.12]', size: 'w-[800px] h-[800px]', blur: 'blur-[150px]', pos: 'top-0 right-0', anim: { x: [0, 80, -40, 0], y: [0, -60, 40, 0] }, dur: 22 },
        { color: 'bg-cyan-500/[0.08]', size: 'w-[600px] h-[600px]', blur: 'blur-[120px]', pos: 'bottom-0 left-0', anim: { x: [0, -60, 50, 0], y: [0, 50, -40, 0] }, dur: 28 },
        { color: 'bg-teal-500/[0.06]', size: 'w-[700px] h-[700px]', blur: 'blur-[140px]', pos: 'top-1/2 left-1/2', anim: { x: [0, 40, -60, 0], y: [0, -30, 50, 0], scale: [1, 1.2, 0.9, 1] }, dur: 25 },
        { color: 'bg-emerald-400/[0.04]', size: 'w-[500px] h-[500px]', blur: 'blur-[100px]', pos: 'top-1/4 left-1/3', anim: { x: [0, -30, 60, 0], y: [0, 40, -50, 0] }, dur: 30 },
      ],
    },
    section: {
      orbs: [
        { color: 'bg-emerald-500/[0.06]', size: 'w-[500px] h-[500px]', blur: 'blur-[120px]', pos: 'top-0 right-1/4', anim: { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }, dur: 20 },
        { color: 'bg-cyan-500/[0.04]', size: 'w-[400px] h-[400px]', blur: 'blur-[100px]', pos: 'bottom-0 left-1/4', anim: { x: [0, -30, 20, 0], y: [0, 20, -20, 0] }, dur: 25 },
      ],
    },
    subtle: {
      orbs: [
        { color: 'bg-emerald-500/[0.03]', size: 'w-[400px] h-[400px]', blur: 'blur-[100px]', pos: 'top-1/2 right-1/4', anim: { x: [0, 20, -10, 0], y: [0, -15, 10, 0] }, dur: 30 },
      ],
    },
  };

  const { orbs } = configs[variant];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          animate={orb.anim}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'linear' }}
          className={`absolute ${orb.pos} ${orb.size} rounded-full ${orb.color} ${orb.blur}`}
        />
      ))}
    </div>
  );
}
