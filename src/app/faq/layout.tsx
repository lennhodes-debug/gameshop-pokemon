import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veelgestelde vragen',
  description: 'Antwoorden op veelgestelde vragen over Gameshop Enter. Informatie over verzending, retourneren, betaalmethoden en de conditie van onze games en consoles.',
  keywords: ['FAQ Gameshop Enter', 'veelgestelde vragen Nintendo games', 'verzending games', 'retourbeleid'],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
