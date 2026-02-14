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
  // Duplicate for seamless loop
  const doubled = [...images, ...images];
  const h = size === 'sm' ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-24 w-24 sm:h-32 sm:w-32';
  const animClass = direction === 'left' ? 'animate-marquee-showcase' : 'animate-marquee-showcase-reverse';

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex gap-3 sm:gap-4 ${animClass}`}
        style={{
          animationDuration: `${speed}s`,
          width: 'max-content',
        }}
      >
        {doubled.map((img, i) => (
          <div
            key={`${img.alt}-${i}`}
            className={`${h} flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden relative group/card`}
            style={{
              background: `linear-gradient(135deg, ${img.accent}30, ${img.accent}15)`,
              border: `1px solid ${img.accent}25`,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={size === 'sm' ? '96px' : '128px'}
              className="object-contain p-2 sm:p-3 transition-transform duration-700 ease-out group-hover/card:scale-110"
              loading="lazy"
            />
            {/* Subtle glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl sm:rounded-2xl"
              style={{
                boxShadow: `inset 0 0 20px ${img.accent}20`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GameShowcase() {
  const { row1, row2 } = useMemo(() => {
    const allWithImages = getAllProducts().filter((p) => !!p.image);
    // Shuffle deterministically by sorting on SKU hash
    const shuffled = [...allWithImages].sort((a, b) => {
      const ha = a.sku.split('').reduce((s, c) => s + c.charCodeAt(0) * 31, 0);
      const hb = b.sku.split('').reduce((s, c) => s + c.charCodeAt(0) * 31, 0);
      return ha - hb;
    });
    const mapped = shuffled.map((p) => {
      const theme = getGameTheme(p.sku, p.genre);
      return {
        src: p.image!,
        alt: p.name,
        accent: theme?.bg[0] || '#10b981',
      };
    });
    const mid = Math.ceil(mapped.length / 2);
    return { row1: mapped.slice(0, mid), row2: mapped.slice(mid) };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Vertical centering with two rows */}
      <div className="absolute inset-0 flex flex-col justify-center gap-3 sm:gap-4 opacity-[0.35]">
        <MarqueeRow images={row1} direction="left" speed={50} size="md" />
        <MarqueeRow images={row2} direction="right" speed={60} size="sm" />
      </div>

      {/* Gradient overlays for fade effect on edges */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#050810] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#050810] to-transparent z-10" />
      {/* Top and bottom fade */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050810] to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050810] to-transparent z-10" />
    </div>
  );
}
