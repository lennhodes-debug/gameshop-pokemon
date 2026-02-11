import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/ui/BackToTop';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/components/cart/CartProvider';
import { WishlistProvider } from '@/components/wishlist/WishlistProvider';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const siteUrl = 'https://gameshopenter.nl';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gameshop Enter - Dé Pokémon Games Specialist van Nederland',
    template: '%s | Gameshop Enter',
  },
  description:
    'Gameshop Enter is dé Pokémon games specialist van Nederland. 100% originele Pokémon games voor DS, GBA, 3DS en Game Boy, persoonlijk getest. 3000+ tevreden klanten en 1360+ reviews met een 5.0 score.',
  keywords: [
    'Pokémon games kopen',
    'Nintendo DS Pokémon',
    'Game Boy Advance Pokémon',
    'Nintendo 3DS Pokémon',
    'Game Boy Pokémon',
    'retro Pokémon games',
    'tweedehands Pokémon games',
    'originele Pokémon cartridges',
    'Pokémon games Nederland',
    'games verkopen',
    'Nintendo games inkoop',
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
    title: 'Gameshop Enter - Dé Pokémon Games Specialist van Nederland',
    description:
      'Dé Pokémon specialist van Nederland. Originele Pokémon games, persoonlijk getest met eigen foto\'s. 3000+ tevreden klanten, 5.0 score.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gameshop Enter - Pokémon Games Specialist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gameshop Enter - Dé Pokémon Games Specialist van Nederland',
    description:
      'Dé Pokémon specialist van Nederland. Originele Pokémon games, persoonlijk getest met eigen foto\'s.',
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
    <html lang="nl" className={`scroll-smooth ${jakarta.variable}`}>
      <body className="bg-[#f8fafc] text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Gameshop Enter',
              description: 'Dé Pokémon games specialist van Nederland. 100% originele Pokémon games voor DS, GBA, 3DS en Game Boy, persoonlijk getest.',
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
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <Header />
              <main id="main-content" className="min-h-screen">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <Footer />
              <BackToTop />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
