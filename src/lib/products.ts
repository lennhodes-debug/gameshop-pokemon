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
  // Mix of premium and interesting items
  const premium = products.filter(p => p.isPremium).slice(0, 4);
  const consoles = products.filter(p => p.isConsole).slice(0, 2);
  const others = products.filter(p => !p.isPremium && !p.isConsole && p.price > 30).slice(0, 2);
  return [...premium, ...consoles, ...others].slice(0, 8);
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
