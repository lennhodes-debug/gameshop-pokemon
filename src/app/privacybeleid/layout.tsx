import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacybeleid - Privacy & Gegevensbescherming',
  description: 'Het privacybeleid van Gameshop Enter. Lees hoe wij omgaan met je persoonsgegevens, welke data we verzamelen en welke rechten je hebt onder de AVG.',
  alternates: { canonical: 'https://gameshopenter.nl/privacybeleid' },
  openGraph: {
    title: 'Privacybeleid - Gameshop Enter',
    description: 'Hoe Gameshop Enter omgaat met je persoonsgegevens. AVG-compliant privacy beleid.',
    url: 'https://gameshopenter.nl/privacybeleid',
    siteName: 'Gameshop Enter',
    locale: 'nl_NL',
    type: 'website',
  },
};

export default function PrivacybeleidLayout({ children }: { children: React.ReactNode }) {
  return children;
}
