import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retourbeleid',
};

export default function RetourbeleidPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Retourbeleid</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-900 mb-4">14 dagen bedenktijd</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Bij Gameshop Enter heb je 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren zonder opgave van reden.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Voorwaarden voor retournering</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
            <li>Het product dient in dezelfde staat te worden geretourneerd als bij ontvangst</li>
            <li>Meld je retourzending vooraf aan via e-mail of WhatsApp</li>
            <li>De retourzending dient binnen 14 dagen na de melding te worden verzonden</li>
            <li>De kosten voor het retourneren zijn voor rekening van de koper</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Hoe retourneren?</h2>
          <ol className="list-decimal pl-6 text-slate-600 space-y-2 mb-6">
            <li>Neem contact op via <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700">gameshopenter@gmail.com</a> of WhatsApp (06-41126067)</li>
            <li>Vermeld je bestelnummer en het product dat je wilt retourneren</li>
            <li>Verpak het product zorgvuldig en verzend het naar het opgegeven adres</li>
            <li>Na ontvangst en controle wordt het aankoopbedrag binnen 14 dagen teruggestort</li>
          </ol>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Terugbetaling</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Na ontvangst en controle van het geretourneerde product wordt het aankoopbedrag (exclusief verzendkosten) binnen 14 dagen teruggestort via de oorspronkelijke betaalmethode.
          </p>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm text-slate-700">
              Vragen over het retourbeleid? Neem contact op via{' '}
              <a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700">gameshopenter@gmail.com</a>{' '}
              of bel/WhatsApp naar 06-41126067.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
