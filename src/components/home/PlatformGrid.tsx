import Link from 'next/link';
import { getAllPlatforms } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';

export default function PlatformGrid() {
  const platforms = getAllPlatforms();

  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Shop per platform
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Van klassieke retro consoles tot de nieuwste Nintendo Switch — ontdek ons complete assortiment
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 animate-stagger">
          {platforms.map((platform) => {
            const colors = PLATFORM_COLORS[platform.name] || { from: 'from-slate-500', to: 'to-slate-700' };
            const label = PLATFORM_LABELS[platform.name] || platform.name;

            return (
              <Link
                key={platform.name}
                href={`/shop?platform=${encodeURIComponent(platform.name)}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-24 bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center`}>
                  <span className="text-white/90 text-2xl font-bold">{label}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 text-sm">{platform.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{platform.count} producten</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
