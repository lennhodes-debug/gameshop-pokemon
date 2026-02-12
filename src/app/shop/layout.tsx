import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop - Alle Nintendo Games & Consoles',
  description: 'Bekijk ons complete assortiment van 150+ originele Nintendo producten. Van Game Boy tot Wii U, alles persoonlijk getest. Veilig bestellen bij Gameshop Enter.',
  keywords: ['Nintendo games kopen', 'Wii games kopen', 'Wii U games kopen', 'retro games', 'Game Boy', 'Nintendo DS', 'Nintendo 3DS', 'originele Nintendo games', 'tweedehands Nintendo'],
  openGraph: {
    title: 'Shop - Alle Nintendo Games & Consoles | Gameshop Enter',
    description: '150+ originele Nintendo producten. Van Game Boy tot Wii U, alles persoonlijk getest.',
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
            description: '150+ originele Nintendo producten van Game Boy tot Wii U.',
            url: 'https://gameshopenter.nl/shop',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Gameshop Enter',
              url: 'https://gameshopenter.nl',
            },
            numberOfItems: 151,
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
