import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Afrekenen',
  description: 'Rond je bestelling af bij Gameshop Enter. Veilig betalen met iDEAL, creditcard, PayPal of Bancontact.',
  robots: { index: false, follow: false },
};

export default function AfrekenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
