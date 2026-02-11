import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retourbeleid - 14 Dagen Bedenktijd',
  description: 'Het retourbeleid van Gameshop Enter. 14 dagen bedenktijd op alle Pokémon games. Gratis retourneren, geen vragen. Lees hier hoe retourneren werkt.',
  alternates: { canonical: 'https://gameshopenter.nl/retourbeleid' },
  openGraph: {
    title: 'Retourbeleid - Gameshop Enter',
    description: '14 dagen bedenktijd op alle Pokémon games. Gratis retourneren bij Gameshop Enter.',
    url: 'https://gameshopenter.nl/retourbeleid',
    siteName: 'Gameshop Enter',
    locale: 'nl_NL',
    type: 'website',
  },
};

export default function RetourbeleidLayout({ children }: { children: React.ReactNode }) {
  return children;
}
