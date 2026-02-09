'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Vaste achtergrondlaag die subtiel van kleur verandert op basis van de
 * huidige scroll-positie. Elke sectie op de homepage heeft een eigen
 * kleurwereld die geleidelijk overvloeit in de volgende.
 */

interface ColorZone {
  start: number;   // scroll % waar deze zone begint
  end: number;     // scroll % waar deze zone eindigt
  color: string;   // achtergrond accent kleur (rgba)
  position: string; // radial-gradient positie
}

const ZONES: ColorZone[] = [
  // Hero — deep space blauw/paars
  { start: 0, end: 0.08, color: 'rgba(16, 185, 129, 0.04)', position: '50% 20%' },
  // TrustStrip + FeaturedProducts — warm emerald
  { start: 0.08, end: 0.18, color: 'rgba(16, 185, 129, 0.06)', position: '50% 40%' },
  // GamingEraTimeline — teal/blauw
  { start: 0.18, end: 0.28, color: 'rgba(6, 182, 212, 0.05)', position: '30% 50%' },
  // GameSeriesShowcase — paars/magenta
  { start: 0.28, end: 0.38, color: 'rgba(168, 85, 247, 0.04)', position: '70% 50%' },
  // CollectibleShowcase — amber/goud
  { start: 0.38, end: 0.48, color: 'rgba(245, 158, 11, 0.04)', position: '50% 50%' },
  // ConsoleMuseum — dynamisch (wordt door museum zelf gedaan)
  { start: 0.48, end: 0.62, color: 'rgba(16, 185, 129, 0.03)', position: '50% 50%' },
  // GameMarquee + PlatformGrid — emerald
  { start: 0.62, end: 0.75, color: 'rgba(16, 185, 129, 0.05)', position: '50% 60%' },
  // AboutPreview — diep emerald
  { start: 0.75, end: 0.85, color: 'rgba(16, 185, 129, 0.06)', position: '40% 70%' },
  // Reviews + FAQ + Newsletter — warm
  { start: 0.85, end: 1.0, color: 'rgba(6, 182, 212, 0.04)', position: '60% 80%' },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function parseRGBA(rgba: string): [number, number, number, number] {
  const m = rgba.match(/[\d.]+/g);
  if (!m || m.length < 4) return [0, 0, 0, 0];
  return [parseFloat(m[0]), parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
}

function lerpColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1, a1] = parseRGBA(c1);
  const [r2, g2, b2, a2] = parseRGBA(c2);
  return `rgba(${Math.round(lerp(r1, r2, t))}, ${Math.round(lerp(g1, g2, t))}, ${Math.round(lerp(b1, b2, t))}, ${lerp(a1, a2, t).toFixed(4)})`;
}

export default function ColorWorldBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.min(1, Math.max(0, scrollY / docHeight));

      // Vind huidige en volgende zone
      let currentZone = ZONES[0];
      let nextZone = ZONES[1] || ZONES[0];
      let localT = 0;

      for (let i = 0; i < ZONES.length; i++) {
        const zone = ZONES[i];
        if (progress >= zone.start && progress <= zone.end) {
          currentZone = zone;
          nextZone = ZONES[i + 1] || zone;
          const zoneRange = zone.end - zone.start;
          localT = zoneRange > 0 ? (progress - zone.start) / zoneRange : 0;
          break;
        }
      }

      // Interpoleer kleur naar volgende zone in de laatste 30%
      let color = currentZone.color;
      if (localT > 0.7 && nextZone !== currentZone) {
        const blendT = (localT - 0.7) / 0.3;
        color = lerpColor(currentZone.color, nextZone.color, blendT);
      }

      setStyle({
        background: `radial-gradient(ellipse at ${currentZone.position}, ${color} 0%, transparent 60%)`,
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initieel

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 transition-[background] duration-700 ease-out"
      style={style}
      aria-hidden="true"
    />
  );
}
