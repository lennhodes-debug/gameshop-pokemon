import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import { CartProvider } from '@/components/cart/CartProvider';

export const metadata: Metadata = {
  title: {
    default: 'Gameshop Enter - De Nintendo Specialist van Nederland',
    template: '%s | Gameshop Enter',
  },
  description:
    'Gameshop Enter is de online Nintendo specialist van Nederland. 100% originele games en consoles, persoonlijk getest. Meer dan 1386 tevreden klanten met een 5.0 score.',
  keywords: [
    'Nintendo',
    'games',
    'consoles',
    'Switch',
    'GameCube',
    'N64',
    'retro games',
    'origineel',
    'Nederland',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 antialiased">
        <ScrollProgress />
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
