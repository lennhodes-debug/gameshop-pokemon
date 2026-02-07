export function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const PLATFORM_COLORS: Record<string, { from: string; to: string }> = {
  'Nintendo Switch': { from: 'from-red-500', to: 'to-red-700' },
  'GameCube': { from: 'from-indigo-500', to: 'to-blue-700' },
  'Nintendo 64': { from: 'from-green-500', to: 'to-emerald-700' },
  'Game Boy Advance': { from: 'from-blue-500', to: 'to-indigo-700' },
  'Super Nintendo': { from: 'from-gray-500', to: 'to-gray-700' },
  'Nintendo 3DS': { from: 'from-sky-500', to: 'to-blue-700' },
  'NES': { from: 'from-gray-600', to: 'to-gray-800' },
  'Nintendo DS': { from: 'from-slate-500', to: 'to-slate-700' },
  'Game Boy': { from: 'from-lime-500', to: 'to-green-700' },
  'Wii': { from: 'from-cyan-400', to: 'to-sky-600' },
  'Wii U': { from: 'from-blue-500', to: 'to-blue-700' },
  'Game Boy Color': { from: 'from-yellow-400', to: 'to-amber-600' },
};

export const PLATFORM_LABELS: Record<string, string> = {
  'Nintendo Switch': 'Switch',
  'GameCube': 'GameCube',
  'Nintendo 64': 'N64',
  'Game Boy Advance': 'GBA',
  'Super Nintendo': 'SNES',
  'Nintendo 3DS': '3DS',
  'NES': 'NES',
  'Nintendo DS': 'DS',
  'Game Boy': 'Game Boy',
  'Wii': 'Wii',
  'Wii U': 'Wii U',
  'Game Boy Color': 'GBC',
};

export const SHIPPING_COST = 3.95;
export const FREE_SHIPPING_THRESHOLD = 100;
