'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  shape: 'circle' | 'star' | 'heart';
  rotation: number;
  rotationSpeed: number;
}

const NINTENDO_COLORS = ['#E60012', '#0070F3', '#00A651', '#FFD700', '#FF6B35', '#7B2FF7'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createParticle(id: number, originX: number, originY: number): Particle {
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(2, 8);
  const shapes: Particle['shape'][] = ['circle', 'star', 'heart'];
  return {
    id,
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - randomBetween(2, 5),
    color: NINTENDO_COLORS[Math.floor(Math.random() * NINTENDO_COLORS.length)],
    size: randomBetween(4, 8),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-15, 15),
  };
}

interface ConfettiBurstProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

export default function ConfettiBurst({ x, y, onComplete }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>(() =>
    Array.from({ length: 18 }, (_, i) => createParticle(i, x, y))
  );
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let frame: number;
    let elapsed = 0;
    const duration = 800;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min(time - lastTime, 32);
      lastTime = time;
      elapsed += dt;

      if (elapsed >= duration) {
        onComplete?.();
        return;
      }

      const progress = elapsed / duration;
      setOpacity(1 - progress);

      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15, // gravity
          vx: p.vx * 0.98, // friction
          rotation: p.rotation + p.rotationSpeed,
        }))
      );

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" style={{ opacity }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.shape === 'circle' && (
            <div className="w-full h-full rounded-full" style={{ backgroundColor: p.color }} />
          )}
          {p.shape === 'star' && (
            <svg viewBox="0 0 24 24" fill={p.color} className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {p.shape === 'heart' && (
            <svg viewBox="0 0 24 24" fill={p.color} className="w-full h-full">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
