'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, Product } from '@/lib/products';

function MarqueeRow({ products, reverse = false, speed = 'medium' }: { products: Product[]; reverse?: boolean; speed?: 'slow' | 'medium' | 'fast' }) {
  const animClass = reverse
    ? speed === 'slow' ? 'animate-marquee-reverse-slow' : speed === 'fast' ? 'animate-marquee-reverse-fast' : 'animate-marquee-reverse-medium'
    : speed === 'slow' ? 'animate-marquee-slow' : speed === 'fast' ? 'animate-marquee-fast' : 'animate-marquee-medium';

  const items = products.filter(p => p.image);

  return (
    <div className="flex overflow-hidden group">
      {[0, 1].map((copy) => (
        <div key={copy} className={`flex gap-4 shrink-0 ${animClass}`} aria-hidden={copy === 1}>
          {items.map((product) => (
            <Link
              key={`${copy}-${product.sku}`}
              href={`/shop/${product.sku}`}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 group/card hover:scale-105 transition-transform duration-300"
            >
              <Image
                src={product.image!}
                alt={product.name}
                width={128}
                height={128}
                className="object-contain w-full h-full p-1"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                {product.name}
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GameMarquee() {
  const allProducts = getAllProducts().filter(p => p.image);
  const half = Math.ceil(allProducts.length / 2);
  const row1 = allProducts.slice(0, half);
  const row2 = allProducts.slice(half);

  return (
    <section className="relative py-16 sm:py-20 bg-[#050810] overflow-hidden">
      {/* Achtergrond */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

      <div className="relative">
        {/* Titel */}
        <div className="text-center mb-10 px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Ontdek ons{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              assortiment
            </span>
          </h2>
          <p className="text-sm text-white/40">Alle games in onze collectie</p>
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#050810] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#050810] to-transparent z-10" />

        {/* Rij 1: rechts → links */}
        <div className="mb-4">
          <MarqueeRow products={row1} speed="medium" />
        </div>

        {/* Rij 2: links → rechts */}
        <div>
          <MarqueeRow products={row2} reverse speed="slow" />
        </div>
      </div>
    </section>
  );
}
