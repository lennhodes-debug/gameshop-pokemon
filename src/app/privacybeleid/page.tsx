import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacybeleid',
};

export default function PrivacybeleidPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Privacybeleid</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed mb-6">
            Gameshop Enter respecteert de privacy van haar klanten en bezoekers. Wij verwerken persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Welke gegevens verzamelen wij?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Wij verzamelen alleen de gegevens die nodig zijn voor het verwerken van je bestelling: naam, e-mailadres, afleveradres en betaalgegevens. Betaalgegevens worden verwerkt door onze betaalprovider Mollie en worden niet door ons opgeslagen.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Waarvoor gebruiken wij je gegevens?</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
            <li>Het verwerken en verzenden van je bestelling</li>
            <li>Het afhandelen van betalingen</li>
            <li>Communicatie over je bestelling</li>
            <li>Het afhandelen van retouren en klachten</li>
          </ul>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Voor vragen over ons privacybeleid kun je contact opnemen via{' '}
            <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700">gameshopenter@gmail.com</a>.
          </p>
          <p className="text-slate-500 text-sm mt-8">KvK: 93642474</p>
        </div>
      </div>
    </div>
  );
}
