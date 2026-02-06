import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Algemene voorwaarden</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed mb-6">
            Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen en overeenkomsten van Gameshop Enter (KvK: 93642474).
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Artikel 1 - Identiteit</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Gameshop Enter is een online webshop gespecialiseerd in originele Nintendo games en consoles. E-mail: gameshopenter@gmail.com. Telefoon: 06-41126067. KvK: 93642474.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Artikel 2 - Prijzen en betaling</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Alle prijzen zijn in euro en inclusief BTW. Betaling geschiedt via iDEAL, creditcard, PayPal, Bancontact of Apple Pay, verwerkt door Mollie.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Artikel 3 - Verzending</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Alle bestellingen worden verzonden via PostNL. De standaard verzendkosten bedragen 3,95 euro. Bij bestellingen boven 100 euro is de verzending gratis. Gameshop Enter is een uitsluitend online webshop; afhalen is niet mogelijk.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Artikel 4 - Herroepingsrecht</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Je hebt het recht om binnen 14 dagen na ontvangst van het product de overeenkomst te ontbinden. Het product dient in dezelfde staat te worden geretourneerd als bij ontvangst.
          </p>
          <p className="text-slate-500 text-sm mt-8">
            Deze voorwaarden zijn voor het laatst bijgewerkt in 2024. Voor de volledige tekst of vragen kun je contact opnemen via gameshopenter@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
