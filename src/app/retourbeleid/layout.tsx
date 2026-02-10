import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retourbeleid',
  description: 'Het retourbeleid van Gameshop Enter. 14 dagen bedenktijd op alle bestellingen. Lees hier hoe retourneren werkt.',
  alternates: { canonical: 'https://gameshopenter.nl/retourbeleid' },
};

export default function RetourbeleidLayout({ children }: { children: React.ReactNode }) {
  return children;
}
