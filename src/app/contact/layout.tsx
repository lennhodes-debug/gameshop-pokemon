import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met Gameshop Enter via e-mail. Snelle reactie gegarandeerd. Vragen over games, bestellingen of retourneren? Wij helpen je graag!',
  keywords: ['contact Gameshop Enter', 'Nintendo games klantenservice', 'e-mail games bestellen', 'klantenservice retro games'],
  openGraph: {
    title: 'Contact | Gameshop Enter',
    description: 'Neem contact op met Gameshop Enter. Snelle reactie gegarandeerd, binnen 24 uur.',
    url: 'https://gameshopenter.nl/contact',
  },
  alternates: {
    canonical: 'https://gameshopenter.nl/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
