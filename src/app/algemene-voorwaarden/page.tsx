export default function AlgemeneVoorwaardenPage() {
  return (
    <div className="pt-16 lg:pt-20">
      <div className="relative bg-[#050810] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="animate-fade-up text-4xl lg:text-[64px] font-light text-white tracking-[-0.03em] leading-[0.95]">Algemene voorwaarden</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="animate-fade-up space-y-8">
          <p className="text-slate-600 leading-relaxed text-lg">
            Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen en overeenkomsten van Gameshop Enter (KvK: 93642474).
          </p>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Artikel 1 - Identiteit</h2>
            <p className="text-slate-600 leading-relaxed">
              Gameshop Enter is een online webshop gespecialiseerd in originele Nintendo games. E-mail: gameshopenter@gmail.com. KvK: 93642474.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Artikel 2 - Prijzen en betaling</h2>
            <p className="text-slate-600 leading-relaxed">
              Alle prijzen zijn in euro en inclusief BTW. Betaling geschiedt via iDEAL, verwerkt door Mollie.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Artikel 3 - Verzending</h2>
            <p className="text-slate-600 leading-relaxed">
              Alle bestellingen worden verzonden via PostNL. De standaard verzendkosten bedragen 4,95 euro (brievenbuspakket). Bij bestellingen boven 100 euro is de verzending gratis. Gameshop Enter is een uitsluitend online webshop; afhalen is niet mogelijk.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Artikel 4 - Herroepingsrecht</h2>
            <p className="text-slate-600 leading-relaxed">
              Je hebt het recht om binnen 14 dagen na ontvangst van de game de overeenkomst te ontbinden. De game dient in dezelfde staat te worden geretourneerd als bij ontvangst.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Artikel 5 - Productconditie en authenticiteit</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Alle Nintendo games worden gecontroleerd op authenticiteit en werking voordat ze worden aangeboden. De conditie en compleetheid (CIB of los) worden altijd vermeld bij het product.
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Game Boy- en GBA-cartridges bevatten interne batterijen die door ouderdom kunnen leeglopen. Dit wordt waar mogelijk vermeld, maar valt buiten garantie bij tweedehands games.</li>
              <li>Save-bestanden op cartridges worden niet gegarandeerd. Games kunnen bij levering een bestaande save bevatten of gewist zijn.</li>
              <li>Wij verkopen uitsluitend originele, authentieke Nintendo games. Geen reproducties of namaak.</li>
            </ul>
          </div>
          <p className="text-slate-400 text-sm">
            Deze voorwaarden zijn voor het laatst bijgewerkt in 2025. Voor de volledige tekst of vragen kun je contact opnemen via gameshopenter@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
