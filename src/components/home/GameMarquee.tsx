'use client';

import { getAllProducts } from '@/lib/products';

export default function GameMarquee() {
  const products = getAllProducts();
  const row1 = products.slice(0, 20).map((p) => p.name);
  const row2 = products.slice(20, 40).map((p) => p.name);

  return (
    <section className="bg-white py-10 overflow-hidden">
      <div className="space-y-4">
        {/* Row 1 - left to right */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...row1, ...row1].map((name, i) => (
              <span
                key={i}
                className="mx-4 text-slate-200 text-lg font-bold tracking-tight flex-shrink-0 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
        {/* Row 2 - right to left */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-reverse whitespace-nowrap">
            {[...row2, ...row2].map((name, i) => (
              <span
                key={i}
                className="mx-4 text-slate-100 text-lg font-bold tracking-tight flex-shrink-0 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
