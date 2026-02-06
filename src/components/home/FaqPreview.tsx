import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';

const faqItems = [
  {
    question: 'Zijn alle producten origineel en getest?',
    answer: 'Ja, alle producten die wij verkopen zijn 100% origineel. Elk product wordt persoonlijk getest op werking voordat het wordt aangeboden. Wij verkopen geen reproducties of namaakproducten.',
  },
  {
    question: 'Hoe worden bestellingen verzonden?',
    answer: 'Alle bestellingen worden zorgvuldig verpakt en verzonden via PostNL. De verzendkosten bedragen 3,95 euro. Bij bestellingen boven de 100 euro is de verzending gratis.',
  },
  {
    question: 'Kan ik mijn bestelling afhalen?',
    answer: 'Nee, Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.',
  },
  {
    question: 'Wat is het retourbeleid?',
    answer: 'Je hebt 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren. Het product dient in dezelfde staat te zijn als bij ontvangst.',
  },
  {
    question: 'Welke betaalmethoden accepteren jullie?',
    answer: 'Wij accepteren iDEAL, creditcard, PayPal, Bancontact en Apple Pay. Alle betalingen worden veilig verwerkt via Mollie.',
  },
];

export default function FaqPreview() {
  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Veelgestelde vragen
          </h2>
          <p className="text-lg text-slate-500">
            Heb je een vraag? Wellicht vind je het antwoord hier
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <Accordion items={faqItems} />
        </div>

        <div className="text-center mt-8">
          <Link href="/faq">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Bekijk alle veelgestelde vragen
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
