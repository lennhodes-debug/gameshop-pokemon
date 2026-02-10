import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verlanglijst | Gameshop Enter',
  description: 'Bekijk je opgeslagen Nintendo games en consoles. Deel je verlanglijst of voeg alles toe aan je winkelwagen.',
};

export default function VerlanglijstLayout({ children }: { children: React.ReactNode }) {
  return children;
}
