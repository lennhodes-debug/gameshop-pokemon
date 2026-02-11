import { Metadata } from 'next';

const siteUrl = 'https://gameshopenter.nl';

export const metadata: Metadata = {
  title: 'Pokémon Games Verkopen — Eerlijk Bod Binnen 24 Uur',
  description:
    'Verkoop je Pokémon games bij Gameshop Enter. Eerlijke prijzen gebaseerd op marktwaarde, reactie binnen 24 uur en gratis verzending. DS, GBA, 3DS en Game Boy games inkoop.',
  keywords: [
    'Pokémon games verkopen',
    'Nintendo games inkoop',
    'Pokémon games inruilen',
    'tweedehands Pokémon games verkopen',
    'Game Boy games verkopen',
    'Nintendo DS games verkopen',
    'GBA games verkopen',
    'Pokémon cartridge verkopen',
    'games inkoop Nederland',
    'retro games verkopen',
  ],
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: `${siteUrl}/inkoop`,
    siteName: 'Gameshop Enter',
    title: 'Pokémon Games Verkopen | Gameshop Enter',
    description:
      'Verkoop je Pokémon games bij Gameshop Enter. Eerlijke prijzen, reactie binnen 24 uur, gratis verzending. DS, GBA, 3DS en Game Boy.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gameshop Enter - Pokémon Games Verkopen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokémon Games Verkopen | Gameshop Enter',
    description:
      'Verkoop je Pokémon games bij Gameshop Enter. Eerlijke prijzen, reactie binnen 24 uur.',
  },
  alternates: {
    canonical: `${siteUrl}/inkoop`,
  },
};

export default function InkoopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: siteUrl,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Games Verkopen',
                  item: `${siteUrl}/inkoop`,
                },
              ],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'Pok\u00e9mon games verkopen bij Gameshop Enter',
              description:
                'Verkoop je Pok\u00e9mon games in drie eenvoudige stappen. Eerlijk bod binnen 24 uur, gratis verzending.',
              totalTime: 'PT5M',
              estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: 'EUR',
                value: '0',
              },
              step: [
                {
                  '@type': 'HowToStep',
                  position: 1,
                  name: "Maak foto's",
                  text: "Maak duidelijke foto's van de voorkant, achterkant en eventuele doos van je Pok\u00e9mon games.",
                },
                {
                  '@type': 'HowToStep',
                  position: 2,
                  name: 'Stuur ze op',
                  text: "Vul het inkoopformulier in met je contactgegevens en beschrijving, en stuur je foto's mee via e-mail naar gameshopenter@gmail.com.",
                },
                {
                  '@type': 'HowToStep',
                  position: 3,
                  name: 'Ontvang je bod',
                  text: 'Wij reageren binnen 24 uur met een eerlijk bod gebaseerd op de actuele marktwaarde. Betaling binnen 2 werkdagen na akkoord.',
                },
              ],
            },
          ]),
        }}
      />
      {children}
    </>
  );
}
