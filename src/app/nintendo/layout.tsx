import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nintendo Games — Van Game Boy tot Wii U | Gameshop Enter',
  description:
    'Originele Nintendo games van Game Boy tot Wii U. Ontdek onze collectie van 140+ authentieke Nintendo games, persoonlijk getest.',
  alternates: { canonical: 'https://gameshopenter.nl/nintendo' },
  openGraph: {
    title: 'Nintendo Games — Van Game Boy tot Wii U | Gameshop Enter',
    description:
      'Van Game Boy tot Wii U. Ontdek 140+ originele Nintendo games bij Gameshop Enter.',
  },
};

export default function NintendoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
