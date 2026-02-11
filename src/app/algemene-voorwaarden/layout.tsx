import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden',
  description: 'De algemene voorwaarden van Gameshop Enter. Lees de voorwaarden voor bestellingen, verzending, betaling en retournering van Pokémon games.',
  alternates: { canonical: 'https://gameshopenter.nl/algemene-voorwaarden' },
  openGraph: {
    title: 'Algemene Voorwaarden - Gameshop Enter',
    description: 'Voorwaarden voor bestellingen, verzending en retournering bij Gameshop Enter.',
    url: 'https://gameshopenter.nl/algemene-voorwaarden',
    siteName: 'Gameshop Enter',
    locale: 'nl_NL',
    type: 'website',
  },
};

export default function AlgemeneVoorwaardenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
