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

// Pokemon type systeem — SKU → type mapping
export const POKEMON_TYPE_MAP: Record<string, string> = {
  'GBA-001': 'dragon',    // Emerald — Rayquaza
  'GBA-002': 'water',     // Sapphire EUR — Kyogre
  'GBA-003': 'water',     // Sapphire USA — Kyogre
  'GBA-004': 'fire',      // FireRed USA — Charizard
  'GBA-005': 'fire',      // FireRed EUR — Charizard
  'GBA-006': 'grass',     // LeafGreen USA — Venusaur
  'GBA-007': 'grass',     // LeafGreen EUR — Venusaur
  'GBA-008': 'fire',      // MD Red Rescue Team — Charizard
  'DS-001':  'ghost',     // Platinum — Giratina
  'DS-002':  'psychic',   // SoulSilver — Lugia
  'DS-003':  'fire',      // HeartGold — Ho-Oh
  'DS-004':  'water',     // Pearl — Palkia
  'DS-005':  'dragon',    // Black — Reshiram
  'DS-006':  'electric',  // White — Zekrom
  'DS-007':  'normal',    // Ranger Guardian Signs
  'DS-008':  'normal',    // Ranger Shadows of Almia
  'DS-009':  'steel',     // MD Explorers of Time — Dialga
  '3DS-001': 'fairy',     // X — Xerneas
  '3DS-002': 'ground',    // Omega Ruby — Groudon
  '3DS-003': 'water',     // Alpha Sapphire — Kyogre
  '3DS-004': 'ghost',     // Moon — Lunala
  '3DS-005': 'normal',    // Super Mystery Dungeon
  'GB-001':  'normal',    // Trading Card Game
};

export interface PokemonTypeInfo {
  name: string;
  bg: [string, string];
  glow: string;
  particle: string;
  label: string;
}

export const POKEMON_TYPE_COLORS: Record<string, PokemonTypeInfo> = {
  fire:     { name: 'fire',     bg: ['#F05030', '#C03020'], glow: '240,80,48',    particle: '#FF6B35', label: 'Vuur' },
  water:    { name: 'water',    bg: ['#3078F0', '#1050C0'], glow: '48,120,240',   particle: '#60A8FF', label: 'Water' },
  grass:    { name: 'grass',    bg: ['#48A830', '#207018'], glow: '72,168,48',    particle: '#78D860', label: 'Gras' },
  electric: { name: 'electric', bg: ['#F0C810', '#C09808'], glow: '240,200,16',   particle: '#FFE040', label: 'Elektrisch' },
  psychic:  { name: 'psychic',  bg: ['#C8A8D8', '#8868A8'], glow: '200,168,216',  particle: '#E0C0F0', label: 'Psychisch' },
  ghost:    { name: 'ghost',    bg: ['#584898', '#382868'], glow: '88,72,152',    particle: '#8870C0', label: 'Spook' },
  dragon:   { name: 'dragon',   bg: ['#38A868', '#206038'], glow: '56,168,104',   particle: '#50D888', label: 'Draak' },
  steel:    { name: 'steel',    bg: ['#A8A8C0', '#787890'], glow: '168,168,192',  particle: '#C0C0D8', label: 'Staal' },
  ground:   { name: 'ground',   bg: ['#D0A040', '#A07830'], glow: '208,160,64',   particle: '#E0C060', label: 'Grond' },
  fairy:    { name: 'fairy',    bg: ['#E898C0', '#C06890'], glow: '232,152,192',  particle: '#FFB0D8', label: 'Fee' },
  normal:   { name: 'normal',   bg: ['#909078', '#686850'], glow: '144,144,120',  particle: '#B0B098', label: 'Normaal' },
};

export function getPokemonType(sku: string): PokemonTypeInfo | null {
  const typeName = POKEMON_TYPE_MAP[sku];
  if (!typeName) return null;
  return POKEMON_TYPE_COLORS[typeName] || null;
}
