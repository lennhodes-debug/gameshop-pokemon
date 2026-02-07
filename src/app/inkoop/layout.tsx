import { Metadata } from 'next';

const siteUrl = 'https://gameshopenter.nl';

export const metadata: Metadata = {
  title: 'Games Verkopen | Inkoop - Gameshop Enter',
  description: 'Verkoop je Nintendo games en consoles aan Gameshop Enter. Bekijk onze inkoopprijzen per game. Eerlijke prijzen, snelle afhandeling via PostNL.',
  keywords: ['games verkopen', 'nintendo inkoop', 'games inkopen', 'tweedehands games verkopen', 'gameshop enter inkoop'],
  openGraph: {
    title: 'Games Verkopen | Inkoop - Gameshop Enter',
    description: 'Verkoop je Nintendo games en consoles aan Gameshop Enter. Eerlijke inkoopprijzen, snelle afhandeling.',
    url: `${siteUrl}/inkoop`,
  },
  alternates: {
    canonical: `${siteUrl}/inkoop`,
  },
};

export default function InkoopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
