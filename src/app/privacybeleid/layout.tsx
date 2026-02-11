import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Het privacybeleid van Gameshop Enter. Lees hoe wij omgaan met je persoonsgegevens en welke rechten je hebt.',
  alternates: { canonical: 'https://gameshopenter.nl/privacybeleid' },
};

export default function PrivacybeleidLayout({ children }: { children: React.ReactNode }) {
  return children;
}
