import productsData from '@/data/products.json';

export interface Product {
  sku: string;
  slug: string;
  name: string;
  platform: string;
  category: string;
  genre: string;
  price: number;
  condition: string;
  completeness: string;
  type: string;
  description: string;
  weight: number;
  isConsole: boolean;
  isPremium: boolean;
  image?: string | null;
  inkoopPrijs?: number | null;
  pcUsedPrice?: number | null;
  inkoopFeatured?: boolean;
}

export function getAllProducts(): Product[] {
  return productsData as Product[];
}

export function getProductBySku(sku: string): Product | undefined {
  return getAllProducts().find((p) => p.sku === sku);
}

export function getProductsByPlatform(platform: string): Product[] {
  return getAllProducts().filter((p) => p.platform === platform);
}

export function getFeaturedProducts(): Product[] {
  const products = getAllProducts();
  // Prefer products with images for visual appeal
  const withImage = (p: Product) => !!p.image;
  const premium = products.filter(p => p.isPremium && withImage(p)).slice(0, 4);
  const premiumFallback = premium.length < 4
    ? products.filter(p => p.isPremium && !premium.includes(p)).slice(0, 4 - premium.length)
    : [];
  const consoles = products.filter(p => p.isConsole && withImage(p) && !premium.includes(p)).slice(0, 2);
  const consoleFallback = consoles.length < 2
    ? products.filter(p => p.isConsole && !premium.includes(p) && !consoles.includes(p)).slice(0, 2 - consoles.length)
    : [];
  const used = new Set([...premium, ...premiumFallback, ...consoles, ...consoleFallback].map(p => p.sku));
  const others = products.filter(p => !used.has(p.sku) && withImage(p) && p.price > 25).slice(0, 2);
  return [...premium, ...premiumFallback, ...consoles, ...consoleFallback, ...others].slice(0, 8);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const products = getAllProducts();
  // Same platform, different product, prefer items with images
  const samePlatform = products.filter(p =>
    p.sku !== product.sku && p.platform === product.platform
  );
  const withImage = samePlatform.filter(p => !!p.image);
  const withoutImage = samePlatform.filter(p => !p.image);
  const sorted = [...withImage, ...withoutImage];
  // Prefer same genre first
  const sameGenre = sorted.filter(p => p.genre === product.genre);
  const diffGenre = sorted.filter(p => p.genre !== product.genre);
  return [...sameGenre, ...diffGenre].slice(0, limit);
}

export function getAllPlatforms(): { name: string; count: number }[] {
  const products = getAllProducts();
  const platformMap = new Map<string, number>();
  products.forEach((p) => {
    platformMap.set(p.platform, (platformMap.get(p.platform) || 0) + 1);
  });
  return Array.from(platformMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllGenres(): string[] {
  const products = getAllProducts();
  const genres = new Set<string>();
  products.forEach((p) => {
    if (p.genre) genres.add(p.genre);
  });
  return Array.from(genres).sort();
}

export function getAllConditions(): string[] {
  const products = getAllProducts();
  const conditions = new Set<string>();
  products.forEach((p) => {
    if (p.condition) conditions.add(p.condition);
  });
  return Array.from(conditions).sort();
}
