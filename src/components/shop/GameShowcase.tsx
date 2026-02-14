'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { getAllProducts } from '@/lib/products';
import { getGameTheme } from '@/lib/utils';

function MarqueeRow({
  images,
  direction = 'left',
  speed = 35,
  size = 'md',
}: {
  images: { src: string; alt: string; accent: string }[];
  direction?: 'left' | 'right';
  speed?: number;
  size?: 'sm' | 'md';
}) {
  const doubled = [...images, ...images];
  const dim = size === 'sm' ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-20 w-20 sm:h-24 sm:w-24';
  const animClass = direction === 'left' ? 'animate-marquee-showcase' : 'animate-marquee-showcase-reverse';

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex gap-4 sm:gap-5 ${animClass}`}
        style={{ animationDuration: `${speed}s`, width: 'max-content' }}
      >
        {doubled.map((img, i) => (
          <div
            key={`${img.alt}-${i}`}
            className={`${dim} flex-shrink-0 rounded-xl overflow-hidden relative`}
            style={{
              background: `linear-gradient(145deg, ${img.accent}12, ${img.accent}06)`,
              border: `1px solid ${img.accent}10`,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={size === 'sm' ? '80px' : '96px'}
              className="object-contain p-2.5"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GameShowcase() {
  const { row1, row2, row3 } = useMemo(() => {
    const allWithImages = getAllProducts().filter((p) => !!p.image);
    const shuffled = [...allWithImages].sort((a, b) => {
      const ha = a.sku.split('').reduce((s, c) => s + c.charCodeAt(0) * 31, 0);
      const hb = b.sku.split('').reduce((s, c) => s + c.charCodeAt(0) * 31, 0);
      return ha - hb;
    });
    const mapped = shuffled.map((p) => {
      const theme = getGameTheme(p.sku, p.genre);
      return { src: p.image!, alt: p.name, accent: theme?.bg[0] || '#10b981' };
    });
    const third = Math.ceil(mapped.length / 3);
    return {
      row1: mapped.slice(0, third),
      row2: mapped.slice(third, third * 2),
      row3: mapped.slice(third * 2),
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Three rows, spread across the full height with blur */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 sm:gap-5 opacity-[0.18]" style={{ filter: 'blur(0.5px)' }}>
        <MarqueeRow images={row1} direction="left" speed={65} size="md" />
        <MarqueeRow images={row2} direction="right" speed={75} size="sm" />
        <MarqueeRow images={row3} direction="left" speed={55} size="md" />
      </div>

      {/* Strong center vignette so text stays readable */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(5,8,16,0.85), transparent 100%)',
        }}
      />

      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-32 sm:w-48 bg-gradient-to-r from-[#050810] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 sm:w-48 bg-gradient-to-l from-[#050810] to-transparent z-10" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050810] to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050810] to-transparent z-10" />
    </div>
  );
}
