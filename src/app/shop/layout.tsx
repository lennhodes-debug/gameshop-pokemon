import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Bekijk ons complete assortiment van 346+ originele Nintendo games en consoles. Van Switch tot Game Boy, alles persoonlijk getest. Veilig bestellen bij Gameshop Enter.',
  keywords: ['Nintendo games kopen', 'Switch games', 'retro games', 'Game Boy', 'N64', 'GameCube', 'originele Nintendo games'],
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
