import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Winkelwagen',
  description: 'Bekijk je winkelwagen bij Gameshop Enter. Veilig afrekenen met iDEAL, PayPal of creditcard. Gratis verzending boven 100 euro.',
  robots: { index: false, follow: false },
};

export default function WinkelwagenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
