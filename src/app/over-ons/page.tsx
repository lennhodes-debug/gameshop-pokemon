import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over ons',
  description: 'Leer meer over Gameshop Enter - de Nintendo specialist van Nederland sinds 2019.',
};

const values = [
  {
    title: 'Originaliteit',
    description: 'Wij verkopen uitsluitend 100% originele Nintendo producten. Geen reproducties, geen namaak.',
  },
  {
    title: 'Transparantie',
    description: 'Elke productpagina vermeldt duidelijk de conditie, compleetheid en exacte staat van het product.',
  },
  {
    title: 'Kwaliteit',
    description: 'Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden in onze webshop.',
  },
  {
    title: 'Service',
    description: 'Snelle verzending, zorgvuldige verpakking en persoonlijk contact bij vragen of problemen.',
  },
];

export default function OverOnsPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">Over Gameshop Enter</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            De Nintendo specialist van Nederland, actief sinds 2019
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Story */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Ons verhaal</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Gameshop Enter is in 2019 opgericht vanuit een persoonlijke passie voor Nintendo. Wat begon als een hobby
            is uitgegroeid tot een volwaardige online webshop met meer dan 346 producten en meer dan 1386 tevreden
            klanten.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Wij geloven dat retro gaming meer is dan nostalgie. Het is een manier om tijdloze klassiekers te bewaren
            en te delen. Van de Nintendo Entertainment System tot de nieuwste Nintendo Switch — wij bieden een
            zorgvuldig samengesteld assortiment van originele games en consoles.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Met een perfecte 5.0 score op Marktplaats na meer dan 1386 beoordelingen staan wij garant voor kwaliteit,
            betrouwbaarheid en uitstekende service. Elk product wordt persoonlijk getest op werking en zorgvuldig
            verpakt voor verzending.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-bold text-slate-900 mb-8 mt-16">Onze kernwaarden</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Business details */}
        <div className="mt-16 bg-slate-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Bedrijfsgegevens</h2>
          <dl className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-slate-900 sm:w-48">Bedrijfsnaam</dt>
              <dd className="text-slate-600">Gameshop Enter</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-slate-900 sm:w-48">Eigenaar</dt>
              <dd className="text-slate-600">Lenn</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-slate-900 sm:w-48">KvK-nummer</dt>
              <dd className="text-slate-600">93642474</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-slate-900 sm:w-48">E-mail</dt>
              <dd className="text-slate-600">
                <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700">
                  gameshopenter@gmail.com
                </a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-slate-900 sm:w-48">Telefoon</dt>
              <dd className="text-slate-600">
                <a href="tel:0641126067" className="text-emerald-600 hover:text-emerald-700">06-41126067</a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-slate-900 sm:w-48">Website</dt>
              <dd className="text-slate-600">gameshopenter.nl</dd>
            </div>
          </dl>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800 font-medium">
              Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
