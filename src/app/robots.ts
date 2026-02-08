import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/afrekenen/', '/winkelwagen/'],
    },
    sitemap: 'https://gameshopenter.nl/sitemap.xml',
  };
}
