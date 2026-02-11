import { MetadataRoute } from 'next';
import { getAllProducts, getAllPlatforms } from '@/lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gameshopenter.nl';
  const products = getAllProducts();
  const platforms = getAllPlatforms();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2025-01-15'), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date('2025-01-15'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/inkoop`, lastModified: new Date('2025-01-15'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/nintendo`, lastModified: new Date('2025-01-15'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/over-ons`, lastModified: new Date('2025-01-15'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date('2025-01-15'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date('2025-01-15'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/verlanglijst`, lastModified: new Date('2025-01-15'), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/retourbeleid`, lastModified: new Date('2025-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacybeleid`, lastModified: new Date('2025-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/algemene-voorwaarden`, lastModified: new Date('2025-01-01'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Platform categoriepagina's voor betere indexering
  const platformPages: MetadataRoute.Sitemap = platforms.map((platform) => ({
    url: `${baseUrl}/shop?platform=${encodeURIComponent(platform.name)}`,
    lastModified: new Date('2025-01-15'),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/shop/${product.sku}`,
    lastModified: new Date('2025-01-15'),
    changeFrequency: 'weekly' as const,
    priority: product.isPremium ? 0.8 : 0.7,
  }));

  return [...staticPages, ...platformPages, ...productPages];
}
