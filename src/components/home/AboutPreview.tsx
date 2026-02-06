import Link from 'next/link';
import Button from '@/components/ui/Button';

const stats = [
  { value: '1386+', label: 'Tevreden klanten' },
  { value: '5.0', label: 'Marktplaats score' },
  { value: '100%', label: 'Originele producten' },
  { value: '14', label: 'Dagen bedenktijd' },
];

export default function AboutPreview() {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Al sinds 2019 de Nintendo specialist
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Gameshop Enter is opgericht met een passie voor Nintendo. Wij bieden
              uitsluitend originele games en consoles aan, persoonlijk getest op
              werking. Met meer dan 1386 tevreden klanten en een perfecte 5.0 score
              op Marktplaats staan wij garant voor kwaliteit en betrouwbaarheid.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              Ons assortiment omvat alles van klassieke NES en Super Nintendo titels
              tot de nieuwste Nintendo Switch games. Elke bestelling wordt zorgvuldig
              verpakt en snel verzonden via PostNL.
            </p>
            <Link href="/over-ons">
              <Button variant="outline">
                Meer over ons
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
