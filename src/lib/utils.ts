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
  'Game Boy / Color': { from: 'from-lime-500', to: 'to-green-700' },
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
  'Game Boy / Color': 'Game Boy',
  'Wii': 'Wii',
  'Wii U': 'Wii U',
  'Game Boy Color': 'GBC',
};

// Verzendkosten op basis van aantal items
export const SHIPPING_SMALL = 4.95;   // 1-3 items (brievenbuspakket)
export const SHIPPING_MEDIUM = 6.95;  // 4-7 items (pakket)
export const SHIPPING_LARGE = 7.95;   // 8+ items (groot pakket)
export const FREE_SHIPPING_THRESHOLD = 100;

// Legacy alias voor bestaande imports
export const SHIPPING_COST = SHIPPING_SMALL;

export function getShippingCost(itemCount: number, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (itemCount === 0) return 0;
  if (itemCount <= 3) return SHIPPING_SMALL;
  if (itemCount <= 7) return SHIPPING_MEDIUM;
  return SHIPPING_LARGE;
}

// Pokemon type systeem — SKU → type mapping (alle 42 Pokémon games)
export const POKEMON_TYPE_MAP: Record<string, string> = {
  // Game Boy / Color
  'GB-001':  'electric',  // Trading Card Game — Pikachu thema
  'GB-002':  'fire',      // Gold — Ho-Oh
  'GB-003':  'water',     // Blue — Blastoise
  'GB-004':  'electric',  // Yellow — Pikachu
  'GB-005':  'psychic',   // Silver — Lugia
  'GB-006':  'ice',       // Crystal — Suicune
  // Game Boy Advance
  'GBA-001': 'dragon',    // Emerald — Rayquaza
  'GBA-002': 'water',     // Sapphire EUR — Kyogre
  'GBA-003': 'water',     // Sapphire USA — Kyogre
  'GBA-004': 'fire',      // FireRed USA — Charizard
  'GBA-005': 'fire',      // FireRed EUR — Charizard
  'GBA-006': 'grass',     // LeafGreen USA — Venusaur
  'GBA-007': 'grass',     // LeafGreen EUR — Venusaur
  'GBA-008': 'fire',      // MD Red Rescue Team — Charizard
  // Nintendo DS
  'DS-001':  'ghost',     // Platinum — Giratina
  'DS-003':  'fire',      // HeartGold — Ho-Oh
  'DS-007':  'normal',    // Ranger Guardian Signs
  'DS-008':  'normal',    // Ranger Shadows of Almia
  'DS-009':  'steel',     // MD Explorers of Time — Dialga
  'DS-010':  'steel',     // Diamond EUR — Dialga
  'DS-011':  'water',     // MD Blue Rescue Team — Squirtle
  'DS-012':  'grass',     // MD Explorers of Sky — Shaymin
  'DS-013':  'normal',    // Ranger
  'DS-014':  'ghost',     // MD Explorers of Darkness
  'DS-015':  'fighting',  // Conquest — samurai thema
  'DS-016':  'dragon',    // Black 2 — Black Kyurem
  'DS-017':  'dragon',    // White 2 — White Kyurem
  'DS-018':  'steel',     // Diamond USA — Dialga
  'DS-019':  'ghost',     // Platinum USA — Giratina
  'DS-020':  'water',     // Pearl USA — Palkia
  'DS-021':  'fire',      // HeartGold USA — Ho-Oh
  'DS-022':  'electric',  // Dash — Pikachu
  // Nintendo 3DS
  '3DS-001': 'fairy',     // X — Xerneas
  '3DS-002': 'ground',    // Omega Ruby — Groudon
  '3DS-003': 'water',     // Alpha Sapphire — Kyogre
  '3DS-004': 'ghost',     // Moon — Lunala
  '3DS-005': 'fire',      // Super Mystery Dungeon
  '3DS-006': 'ice',       // Gates to Infinity — Kyurem
  '3DS-007': 'psychic',   // Ultra Sun — Necrozma Dusk Mane
  '3DS-008': 'ghost',     // Ultra Moon — Necrozma Dawn Wings
  '3DS-010': 'dark',      // Y — Yveltal
  '3DS-011': 'steel',     // Sun — Solgaleo
};

// Rotatie-correctie per product (graden, negatief = tegen klok in)
export const IMAGE_ROTATION: Record<string, number> = {
  'GBA-001': -6,   // Emerald
  'GBA-002': -6,   // Sapphire EUR
  'DS-001':  -12,  // Platinum
  'DS-003':  -3,   // HeartGold
  'DS-007':  -3,   // Ranger Guardian Signs
  'DS-008':  -5,   // Ranger Shadows of Almia
  'DS-009':  -2,   // MD Explorers of Time
  'DS-011':  -3,   // MD Blue Rescue Team
  'DS-013':  -3,   // Ranger
  'DS-014':  -3,   // MD Explorers of Darkness
  'DS-016':  -2,   // Black 2
  'DS-017':  -2,   // White 2
  'DS-018':  -3,   // Diamond USA
  'DS-019':  -5,   // Platinum USA
  'DS-021':  -5,   // HeartGold USA
  'DS-022':  -5,   // Dash
  '3DS-003': -3,   // Alpha Sapphire
  '3DS-004': -2,   // Moon
  '3DS-006': -5,   // Gates to Infinity
  '3DS-007': -3,   // Ultra Sun
  '3DS-008': -3,   // Ultra Moon
  '3DS-010': -3,   // Pokemon Y
  '3DS-011': -2,   // Pokemon Sun
  'GB-002':  -2,   // Gold
  'GB-003':  -2,   // Blue
  'GB-004':  -3,   // Yellow
  'GB-005':  -2,   // Silver
  'GB-006':  -2,   // Crystal
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
  ice:      { name: 'ice',      bg: ['#78D0E0', '#4898B0'], glow: '120,208,224',  particle: '#A0E8F0', label: 'IJs' },
  dark:     { name: 'dark',     bg: ['#504058', '#302030'], glow: '80,64,88',     particle: '#786078', label: 'Duister' },
  fighting: { name: 'fighting', bg: ['#C03028', '#802018'], glow: '192,48,40',    particle: '#E05048', label: 'Vecht' },
};

export function getPokemonType(sku: string): PokemonTypeInfo | null {
  const typeName = POKEMON_TYPE_MAP[sku];
  if (!typeName) return null;
  return POKEMON_TYPE_COLORS[typeName] || null;
}
