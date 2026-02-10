import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import SmoothScroll from '@/components/layout/SmoothScroll';
import PageTransition from '@/components/ui/PageTransition';
import BackToTop from '@/components/ui/BackToTop';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/components/cart/CartProvider';
import FloatingActions from '@/components/ui/FloatingActions';
import SettingsPanel from '@/components/ui/SettingsPanel';
import ComboOverlay from '@/components/cart/ComboOverlay';
import { WishlistProvider } from '@/components/wishlist/WishlistProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const siteUrl = 'https://gameshopenter.nl';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gameshop Enter - De Nintendo Specialist van Nederland',
    template: '%s | Gameshop Enter',
  },
  description:
    'Gameshop Enter is de online Nintendo specialist van Nederland. 100% originele games en consoles, persoonlijk getest. Meer dan 3000 tevreden klanten en 1360+ reviews met een 5.0 score.',
  keywords: [
    'Nintendo games kopen',
    'retro games Nederland',
    'Nintendo Switch games',
    'GameCube games',
    'Nintendo 64 games',
    'Super Nintendo games',
    'Game Boy games',
    'originele Nintendo consoles',
    'tweedehands games',
    'retro gaming Nederland',
    'games verkopen',
    'Nintendo games inkoop',
    'NES games',
    'Wii games',
    'Nintendo DS games',
    'Pokémon games kopen',
  ],
  authors: [{ name: 'Gameshop Enter' }],
  creator: 'Gameshop Enter',
  publisher: 'Gameshop Enter',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: siteUrl,
    siteName: 'Gameshop Enter',
    title: 'Gameshop Enter - De Nintendo Specialist van Nederland',
    description:
      'De online Nintendo specialist van Nederland. 846+ originele games & consoles, persoonlijk getest. 3000+ tevreden klanten, 5.0 score.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gameshop Enter - Nintendo Specialist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gameshop Enter - De Nintendo Specialist van Nederland',
    description:
      'De online Nintendo specialist van Nederland. 846+ originele games & consoles, persoonlijk getest.',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`scroll-smooth ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('gameshop-theme');if(t==='dark'){document.documentElement.classList.add('dark')}else if(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body className="bg-[#f8fafc] dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Gameshop Enter',
              description: 'De online Nintendo specialist van Nederland. 100% originele games en consoles, persoonlijk getest.',
              url: 'https://gameshopenter.nl',
              logo: 'https://gameshopenter.nl/images/logo.png',
              image: 'https://gameshopenter.nl/images/og-image.png',
              email: 'gameshopenter@gmail.com',
              founder: {
                '@type': 'Person',
                name: 'Lenn Hodes',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5.0',
                reviewCount: '1360',
                bestRating: '5',
              },
              priceRange: '€',
              currenciesAccepted: 'EUR',
              paymentAccepted: 'iDEAL, Creditcard, PayPal, Bancontact, Apple Pay',
              areaServed: {
                '@type': 'Country',
                name: 'NL',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://gameshopenter.nl/shop?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <a href="#main-content" className="skip-to-main">Ga naar inhoud</a>
        <ScrollProgress />
        <ThemeProvider>
        <SmoothScroll>
          <CartProvider>
          <ComboOverlay />
          <WishlistProvider>
            <ToastProvider>
              <Header />
              <main id="main-content" className="min-h-screen">
                <ErrorBoundary>
                  <PageTransition>{children}</PageTransition>
                </ErrorBoundary>
              </main>
              <Footer />
              <BackToTop />
              <FloatingActions />
              <SettingsPanel />
            </ToastProvider>
          </WishlistProvider>
          </CartProvider>
        </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
