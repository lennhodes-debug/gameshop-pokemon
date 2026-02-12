import { getAllProducts, getProductBySku, getRelatedProducts, getEffectivePrice } from '@/lib/products';
import ProductDetail from '@/components/product/ProductDetail';
import RelatedProducts from '@/components/product/RelatedProducts';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';

const siteUrl = 'https://gameshopenter.nl';

interface Props {
  params: Promise<{ sku: string }>;
}

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    sku: product.sku,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const product = getProductBySku(sku);
  if (!product) return { title: 'Product niet gevonden' };

  const description = product.description ||
    `${product.name} voor ${product.platform} - ${product.condition} - ${product.completeness}. ${formatPrice(product.price)} bij Gameshop Enter.`;
  const productUrl = `${siteUrl}/shop/${product.sku}`;
  const imageUrl = product.image ? `${siteUrl}${product.image}` : `${siteUrl}/images/og-image.svg`;

  return {
    title: `${product.name} - ${product.platform}`,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: 'article',
      url: productUrl,
      title: `${product.name} - ${product.platform} kopen | Gameshop Enter`,
      description,
      siteName: 'Gameshop Enter',
      locale: 'nl_NL',
      images: [
        {
          url: imageUrl,
          width: 600,
          height: 600,
          alt: `${product.name} - ${product.platform} bij Gameshop Enter`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${product.platform}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;
  const product = getProductBySku(sku);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product, 4);

  const effectivePrice = getEffectivePrice(product);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} voor ${product.platform}. ${product.condition}, ${product.completeness}. Origineel en getest door Gameshop Enter.`,
    image: product.image ? `${siteUrl}${product.image}` : undefined,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Nintendo',
    },
    category: `${product.platform} ${product.category}`,
    itemCondition: product.condition === 'Nieuw'
      ? 'https://schema.org/NewCondition'
      : 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/shop/${product.sku}`,
      priceCurrency: 'EUR',
      price: effectivePrice.toFixed(2),
      priceValidUntil: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Gameshop Enter',
        url: siteUrl,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'NL',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: effectivePrice >= FREE_SHIPPING_THRESHOLD ? '0.00' : '4.95',
          currency: 'EUR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'NL',
        },
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${siteUrl}/shop` },
      { '@type': 'ListItem', position: 3, name: product.platform, item: `${siteUrl}/shop?platform=${encodeURIComponent(product.platform)}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${siteUrl}/shop/${product.sku}` },
    ],
  };

  return (
    <div className="pt-20 lg:pt-24 bg-[#050810]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-[#050810] text-slate-100 min-h-screen">
        <ProductDetail product={product} />
        <RelatedProducts products={related} />
        <RecentlyViewed currentSku={product.sku} />
      </div>
    </div>
  );
}
