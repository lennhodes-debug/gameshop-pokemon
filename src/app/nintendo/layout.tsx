import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Het Verhaal van Nintendo - 137 Jaar Innovatie',
  description:
    'Ontdek de volledige geschiedenis van Nintendo: van hanafuda kaarten in 1889 tot de Nintendo Switch. Een interactieve reis door 137 jaar gaming innovatie.',
  openGraph: {
    title: 'Het Verhaal van Nintendo - 137 Jaar Innovatie | Gameshop Enter',
    description:
      'Van speelkaarten tot de bestverkopende consoles ter wereld. Beleef de complete Nintendo tijdlijn in een meeslepende animatie.',
  },
};

export default function NintendoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
