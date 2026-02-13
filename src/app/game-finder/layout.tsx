import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Finder - Ontdek jouw perfecte game | Gameshop Enter',
  description:
    'Weet je niet welke game je wilt? Beantwoord 4 vragen over je speelstijl en voorkeuren, en ontdek jouw perfecte game uit onze collectie.',
};

export default function GameFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
