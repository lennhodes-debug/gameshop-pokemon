import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over ons - De Nintendo Specialist',
  description: 'Leer meer over Gameshop Enter, de Nintendo specialist van Nederland. Opgericht door Lenn Hodes met een passie voor Nintendo. 3000+ tevreden klanten, 5.0 score op Marktplaats.',
  keywords: ['Gameshop Enter', 'Nintendo specialist', 'Lenn Hodes', 'over ons', 'retro games Nederland'],
  openGraph: {
    title: 'Over ons - De Nintendo Specialist | Gameshop Enter',
    description: 'Opgericht door Lenn Hodes met een passie voor Nintendo. 3000+ tevreden klanten, 5.0 score.',
    url: 'https://gameshopenter.nl/over-ons',
  },
  alternates: {
    canonical: 'https://gameshopenter.nl/over-ons',
  },
};

export default function OverOnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
