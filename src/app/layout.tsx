import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import SmoothScroll from '@/components/layout/SmoothScroll';
import PageTransition from '@/components/ui/PageTransition';
import BackToTop from '@/components/ui/BackToTop';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/components/cart/CartProvider';

export const metadata: Metadata = {
  title: {
    default: 'Gameshop Enter - De Nintendo Specialist van Nederland',
    template: '%s | Gameshop Enter',
  },
  description:
    'Gameshop Enter is de online Nintendo specialist van Nederland. 100% originele games en consoles, persoonlijk getest. Meer dan 3000 tevreden klanten en 1360+ reviews met een 5.0 score.',
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
        <SmoothScroll>
          <CartProvider>
            <ToastProvider>
              <Header />
              <main className="min-h-screen">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <BackToTop />
            </ToastProvider>
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
