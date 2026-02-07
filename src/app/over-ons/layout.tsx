import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over ons',
  description: 'Leer meer over Gameshop Enter, de Nintendo specialist van Nederland. Opgericht door Lenn Hodes met een passie voor Nintendo. 3000+ tevreden klanten, 5.0 score op Marktplaats.',
  keywords: ['Gameshop Enter', 'Nintendo specialist', 'Lenn Hodes', 'over ons', 'retro games Nederland'],
};

export default function OverOnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
