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

export const PLATFORM_HEX: Record<string, { bg: string; accent: string; glow: string }> = {
  'Nintendo Switch': { bg: '#ef4444', accent: '#dc2626', glow: '239,68,68' },
  'GameCube': { bg: '#6366f1', accent: '#4f46e5', glow: '99,102,241' },
  'Nintendo 64': { bg: '#22c55e', accent: '#16a34a', glow: '34,197,94' },
  'Game Boy Advance': { bg: '#3b82f6', accent: '#4338ca', glow: '59,130,246' },
  'Super Nintendo': { bg: '#6b7280', accent: '#4b5563', glow: '107,114,128' },
  'Nintendo 3DS': { bg: '#0ea5e9', accent: '#2563eb', glow: '14,165,233' },
  'NES': { bg: '#4b5563', accent: '#374151', glow: '75,85,99' },
  'Nintendo DS': { bg: '#64748b', accent: '#475569', glow: '100,116,139' },
  'Game Boy': { bg: '#84cc16', accent: '#22c55e', glow: '132,204,22' },
  'Game Boy / Color': { bg: '#84cc16', accent: '#22c55e', glow: '132,204,22' },
  'Game Boy Color': { bg: '#eab308', accent: '#d97706', glow: '234,179,8' },
  'Wii': { bg: '#22d3ee', accent: '#0284c7', glow: '34,211,238' },
  'Wii U': { bg: '#3b82f6', accent: '#2563eb', glow: '59,130,246' },
};

export const SHIPPING_COST = 3.95;
export const FREE_SHIPPING_THRESHOLD = 100;
