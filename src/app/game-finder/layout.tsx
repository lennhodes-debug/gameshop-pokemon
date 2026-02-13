import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Finder - Ontdek jouw perfecte game',
  description:
    'Weet je niet welke game je wilt? Onze Game Finder helpt je kiezen! Kies steeds tussen twee games tot je jouw perfecte match vindt.',
};

export default function GameFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
