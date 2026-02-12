import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop - Alle Nintendo Games & Consoles',
  description: 'Bekijk ons complete assortiment van 118 originele Nintendo producten. Van DS tot Game Boy, alles persoonlijk getest. Veilig bestellen bij Gameshop Enter.',
  keywords: ['Nintendo games kopen', 'Switch games', 'retro games', 'Game Boy', 'N64', 'GameCube', 'originele Nintendo games', 'tweedehands Nintendo', 'retro consoles kopen'],
  openGraph: {
    title: 'Shop - Alle Nintendo Games & Consoles | Gameshop Enter',
    description: '118 originele Nintendo producten. Van DS tot Game Boy, alles persoonlijk getest.',
    url: 'https://gameshopenter.nl/shop',
  },
  alternates: {
    canonical: 'https://gameshopenter.nl/shop',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Nintendo Games & Consoles Shop',
            description: '118 originele Nintendo producten van DS tot Game Boy.',
            url: 'https://gameshopenter.nl/shop',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Gameshop Enter',
              url: 'https://gameshopenter.nl',
            },
            numberOfItems: 118,
            provider: {
              '@type': 'Organization',
              name: 'Gameshop Enter',
              url: 'https://gameshopenter.nl',
            },
          }),
        }}
      />
      {children}
    </>
  );
}
