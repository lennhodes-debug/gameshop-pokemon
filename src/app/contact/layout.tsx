import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met Gameshop Enter via WhatsApp, e-mail of telefoon. Snelle reactie gegarandeerd. Vragen over games, bestellingen of retourneren? Wij helpen je graag!',
  keywords: ['contact Gameshop Enter', 'Nintendo games klantenservice', 'WhatsApp games bestellen'],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
