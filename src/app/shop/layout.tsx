import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop - Alle Nintendo Games & Consoles',
  description: 'Bekijk ons complete assortiment van 346+ originele Nintendo games en consoles. Van Switch tot Game Boy, alles persoonlijk getest. Veilig bestellen bij Gameshop Enter.',
  keywords: ['Nintendo games kopen', 'Switch games', 'retro games', 'Game Boy', 'N64', 'GameCube', 'originele Nintendo games', 'tweedehands Nintendo', 'retro consoles kopen'],
  openGraph: {
    title: 'Shop - Alle Nintendo Games & Consoles | Gameshop Enter',
    description: '346+ originele Nintendo games en consoles. Van Switch tot Game Boy, alles persoonlijk getest.',
    url: 'https://gameshopenter.nl/shop',
  },
  alternates: {
    canonical: 'https://gameshopenter.nl/shop',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
