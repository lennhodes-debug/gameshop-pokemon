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

const products: Product[] = productsData as Product[];
const skuIndex = new Map<string, Product>(products.map(p => [p.sku, p]));

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySku(sku: string): Product | undefined {
  return skuIndex.get(sku);
}

export function getProductsByPlatform(platform: string): Product[] {
  return getAllProducts().filter((p) => p.platform === platform);
}

export function getFeaturedProducts(): Product[] {
  const products = getAllProducts();
  const hasImage = (p: Product) => !!p.image;
  const premium = products.filter(p => p.isPremium && hasImage(p)).slice(0, 4);
  const premiumSkus = new Set(premium.map(p => p.sku));
  const premiumFallback = premium.length < 4
    ? products.filter(p => p.isPremium && !premiumSkus.has(p.sku)).slice(0, 4 - premium.length)
    : [];
  const usedSkus = new Set([...premium, ...premiumFallback].map(p => p.sku));
  const consoles = products.filter(p => p.isConsole && hasImage(p) && !usedSkus.has(p.sku)).slice(0, 2);
  const consoleFallback = consoles.length < 2
    ? products.filter(p => p.isConsole && !usedSkus.has(p.sku) && !consoles.some(c => c.sku === p.sku)).slice(0, 2 - consoles.length)
    : [];
  const allUsed = new Set([...Array.from(usedSkus), ...consoles.map(p => p.sku), ...consoleFallback.map(p => p.sku)]);
  const others = products.filter(p => !allUsed.has(p.sku) && hasImage(p) && p.price > 25).slice(0, 2);
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

// Module-level caches (computed once)
const _platformCache: { name: string; count: number }[] = (() => {
  const map = new Map<string, number>();
  products.forEach(p => map.set(p.platform, (map.get(p.platform) || 0) + 1));
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
})();

const _genreCache: string[] = (() => {
  const set = new Set<string>();
  products.forEach(p => { if (p.genre) set.add(p.genre); });
  return Array.from(set).sort();
})();

const _conditionCache: string[] = (() => {
  const set = new Set<string>();
  products.forEach(p => { if (p.condition) set.add(p.condition); });
  return Array.from(set).sort();
})();

export function getAllPlatforms(): { name: string; count: number }[] {
  return _platformCache;
}

export function getAllGenres(): string[] {
  return _genreCache;
}

export function getAllConditions(): string[] {
  return _conditionCache;
}
