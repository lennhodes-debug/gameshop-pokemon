import type { Metadata } from 'next';

const siteUrl = 'https://gameshopenter.nl';

export const metadata: Metadata = {
  title: 'Nintendo & Pokémon — Van Game Boy tot DS',
  description:
    'Ontdek de geschiedenis van Pokémon op Nintendo handhelds: van Generatie I (Red, Blue, Yellow) op de Game Boy tot Generatie V (Black, White) op de DS. 34 authentieke Pokémon games bij Gameshop Enter.',
  keywords: [
    'Pokémon generaties',
    'Pokémon geschiedenis',
    'Nintendo Pokémon games',
    'Game Boy Pokémon',
    'GBA Pokémon',
    'Nintendo DS Pokémon',
    'Pokémon Red Blue Yellow',
    'Pokémon Gold Silver Crystal',
    'Pokémon Ruby Sapphire Emerald',
    'Pokémon Diamond Pearl Platinum',
    'Pokémon Black White',
    'Pokémon HeartGold SoulSilver',
    'retro Pokémon games kopen',
  ],
  alternates: { canonical: `${siteUrl}/nintendo` },
  openGraph: {
    type: 'article',
    locale: 'nl_NL',
    url: `${siteUrl}/nintendo`,
    siteName: 'Gameshop Enter',
    title: 'Nintendo & Pokémon — Van Game Boy tot DS | Gameshop Enter',
    description:
      'De geschiedenis van Pokémon op Nintendo handhelds: van Gen I op de Game Boy tot Gen V op de DS. 34 authentieke games, persoonlijk getest.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gameshop Enter - Nintendo & Pokémon Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nintendo & Pokémon — Van Game Boy tot DS',
    description:
      'De geschiedenis van Pokémon op Nintendo handhelds. 34 authentieke games bij Gameshop Enter.',
  },
};

export default function NintendoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
