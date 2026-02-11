import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nintendo & Pokemon — Van Game Boy tot DS | Gameshop Enter',
  description:
    'De geschiedenis van Pokemon op Nintendo handhelds: van Gen I op de Game Boy tot Gen V op de DS. Ontdek onze collectie van 34 authentieke Pokemon games.',
  alternates: { canonical: 'https://gameshopenter.nl/nintendo' },
  openGraph: {
    title: 'Nintendo & Pokemon — Van Game Boy tot DS | Gameshop Enter',
    description:
      'Van de eerste 151 Pokemon tot Black & White 2. Ontdek de Pokemon-generaties die wij verkopen.',
  },
};

export default function NintendoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
