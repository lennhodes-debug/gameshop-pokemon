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
  backImage?: string | null;
  inkoopPrijs?: number | null;
  pcUsedPrice?: number | null;
  inkoopFeatured?: boolean;
  salePrice?: number | null;
  cibPrice?: number;
  cibImage?: string;
  cibBackImage?: string;
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

// Seeded PRNG zodat featured producten consistent zijn per dag (geen hydration mismatch)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rand = seededRandom(seed);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getFeaturedProducts(): Product[] {
  const products = getAllProducts();
  const hasImage = (p: Product) => !!p.image;
  const premiumPool = shuffleArray(products.filter(p => p.isPremium && hasImage(p)));
  const premium = premiumPool.slice(0, 4);
  const usedSkus = new Set(premium.map(p => p.sku));
  const consolePool = shuffleArray(products.filter(p => p.isConsole && hasImage(p) && !usedSkus.has(p.sku)));
  const consoles = consolePool.slice(0, 2);
  consoles.forEach(p => usedSkus.add(p.sku));
  const othersPool = shuffleArray(products.filter(p => !usedSkus.has(p.sku) && hasImage(p) && p.price > 25));
  const others = othersPool.slice(0, 2);
  return [...premium, ...consoles, ...others].slice(0, 8);
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

export function isOnSale(product: Product): boolean {
  return typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price;
}

export function getSalePercentage(product: Product): number {
  if (!isOnSale(product)) return 0;
  return Math.round((1 - product.salePrice! / product.price) * 100);
}

export function getEffectivePrice(product: Product): number {
  return isOnSale(product) ? product.salePrice! : product.price;
}

export function getDealsProducts(): Product[] {
  return products.filter(isOnSale);
}

export function searchProducts(query: string, limit = 5): Product[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const scored: { product: Product; score: number }[] = [];
  for (const p of products) {
    let score = 0;
    if (p.name.toLowerCase().includes(q)) score += 10;
    if (p.name.toLowerCase().startsWith(q)) score += 5;
    if (p.platform.toLowerCase().includes(q)) score += 6;
    if (p.genre.toLowerCase().includes(q)) score += 4;
    if (p.sku.toLowerCase().includes(q)) score += 3;
    if (p.description?.toLowerCase().includes(q)) score += 1;
    if (score > 0) scored.push({ product: p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.product);
}
