import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/ui/BackToTop';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/components/cart/CartProvider';
import { WishlistProvider } from '@/components/wishlist/WishlistProvider';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ScrollProgress from '@/components/layout/ScrollProgress';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 antialiased" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              '@id': 'https://gameshopenter.nl/#store',
              name: 'Gameshop Enter',
              description: 'Dé Pokémon games specialist van Nederland. 100% originele Pokémon games voor DS, GBA, 3DS en Game Boy, persoonlijk getest.',
              url: 'https://gameshopenter.nl',
              logo: {
                '@type': 'ImageObject',
                url: 'https://gameshopenter.nl/images/logo.png',
                width: 512,
                height: 512,
              },
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
                worstRating: '1',
              },
              priceRange: '€5 - €300',
              currenciesAccepted: 'EUR',
              paymentAccepted: 'iDEAL, Creditcard, PayPal, Bancontact, Apple Pay',
              areaServed: {
                '@type': 'Country',
                name: 'NL',
              },
              sameAs: [
                'https://www.instagram.com/gameshopenter/',
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Pokémon Games',
                itemListElement: [
                  { '@type': 'OfferCatalog', name: 'Game Boy Advance Pokémon Games' },
                  { '@type': 'OfferCatalog', name: 'Nintendo DS Pokémon Games' },
                  { '@type': 'OfferCatalog', name: 'Nintendo 3DS Pokémon Games' },
                  { '@type': 'OfferCatalog', name: 'Game Boy Pokémon Games' },
                ],
              },
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'NL',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 14,
                returnMethod: 'https://schema.org/ReturnByMail',
                returnFees: 'https://schema.org/FreeReturn',
                returnPolicySeasonalOverride: [],
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: '4.95',
                  currency: 'EUR',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'NL',
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
                  transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
                },
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://gameshopenter.nl/shop?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <a href="#main-content" className="skip-to-main">Ga naar inhoud</a>
        <ScrollProgress />
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
