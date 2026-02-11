import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veelgestelde vragen',
  description: 'Antwoorden op veelgestelde vragen over Gameshop Enter. Informatie over verzending, retourneren, betaalmethoden en de conditie van onze games en consoles.',
  keywords: ['FAQ Gameshop Enter', 'veelgestelde vragen Nintendo games', 'verzending games', 'retourbeleid'],
  openGraph: {
    title: 'Veelgestelde vragen | Gameshop Enter',
    description: 'Antwoorden op veelgestelde vragen over verzending, retourneren, betaalmethoden en meer.',
    url: 'https://gameshopenter.nl/faq',
  },
  alternates: {
    canonical: 'https://gameshopenter.nl/faq',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
