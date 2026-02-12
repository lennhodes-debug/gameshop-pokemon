import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/ui/BackToTop';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/components/cart/CartProvider';
import { WishlistProvider } from '@/components/wishlist/WishlistProvider';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ScrollProgress from '@/components/layout/ScrollProgress';
import SocialProofToast from '@/components/ui/SocialProofToast';
import ExitIntentModal from '@/components/ui/ExitIntentModal';
import { cn } from '@/lib/utils';

const jakarta = localFont({
  src: '../fonts/plus-jakarta-sans-latin-wght-normal.woff2',
  display: 'swap',
  variable: '--font-jakarta',
  weight: '300 800',
});

const siteUrl = 'https://gameshopenter.nl';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gameshop Enter - Dé Nintendo Games Specialist van Nederland',
    template: '%s | Gameshop Enter',
  },
  description:
    'Gameshop Enter is dé Nintendo games specialist van Nederland. 100% originele Nintendo games voor DS, 3DS, GBA, Game Boy, Wii en Wii U, persoonlijk getest. 3000+ tevreden klanten en 1360+ reviews met een 5.0 score.',
  keywords: [
    'Nintendo games kopen',
    'Nintendo DS games',
    'Game Boy Advance games',
    'Nintendo 3DS games',
    'Game Boy games',
    'Wii games kopen',
    'Wii U games kopen',
    'retro Nintendo games',
    'tweedehands Nintendo games',
    'originele Nintendo cartridges',
    'Nintendo games Nederland',
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
    title: 'Gameshop Enter - Dé Nintendo Games Specialist van Nederland',
    description:
      'Dé Nintendo specialist van Nederland. Originele Nintendo games voor DS, 3DS, GBA, Game Boy, Wii en Wii U, persoonlijk getest met eigen foto\'s. 3000+ tevreden klanten, 5.0 score.',
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gameshop Enter - Nintendo Games Specialist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gameshop Enter - Dé Nintendo Games Specialist van Nederland',
    description:
      'Dé Nintendo specialist van Nederland. Originele Nintendo games, persoonlijk getest met eigen foto\'s.',
    images: ['/images/og-image.svg'],
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
    <html lang="nl" className={cn(jakarta.className, "scroll-smooth")}>
      <body className="bg-[#f8fafc] text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              '@id': 'https://gameshopenter.nl/#store',
              name: 'Gameshop Enter',
              description: 'Dé Nintendo games specialist van Nederland. 100% originele Nintendo games voor DS, 3DS, GBA, Game Boy, Wii en Wii U, persoonlijk getest.',
              url: 'https://gameshopenter.nl',
              logo: {
                '@type': 'ImageObject',
                url: 'https://gameshopenter.nl/images/logo.svg',
                width: 512,
                height: 512,
              },
              image: 'https://gameshopenter.nl/images/og-image.svg',
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
                name: 'Nintendo Games',
                itemListElement: [
                  { '@type': 'OfferCatalog', name: 'Game Boy Advance Games' },
                  { '@type': 'OfferCatalog', name: 'Nintendo DS Games' },
                  { '@type': 'OfferCatalog', name: 'Nintendo 3DS Games' },
                  { '@type': 'OfferCatalog', name: 'Game Boy Games' },
                  { '@type': 'OfferCatalog', name: 'Wii Games' },
                  { '@type': 'OfferCatalog', name: 'Wii U Games' },
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
              <SocialProofToast />
              <ExitIntentModal />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
