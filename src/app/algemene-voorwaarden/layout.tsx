import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'De algemene voorwaarden van Gameshop Enter. Lees de voorwaarden voor bestellingen, verzending en retournering.',
};

export default function AlgemeneVoorwaardenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
