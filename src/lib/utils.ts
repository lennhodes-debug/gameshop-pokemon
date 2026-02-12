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
  '3DS-009': 'electric',  // Detective Pikachu
  '3DS-010': 'dark',      // Y — Yveltal
  '3DS-011': 'steel',     // Sun — Solgaleo
  // Wii — Pokémon games
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

// Franchise thema's — kleurschema's voor niet-Pokémon games
export const FRANCHISE_THEME_MAP: Record<string, string> = {
  // Nintendo DS — niet-Pokémon games
  'DS-023': 'mystery',    // Another Code: Two Memories
  'DS-024': 'rpg',        // Dragon Quest IX
  'DS-025': 'puzzle',     // Tetris Party Deluxe
  'DS-026': 'platformer', // Rayman DS
  'DS-027': 'mario',      // Mario & Luigi: Partners in Time
  'DS-028': 'rpg',        // Final Fantasy Crystal Chronicles
  'DS-029': 'party',      // Rayman Raving Rabbids
  'DS-030': 'mario',      // Mario Party DS
  'DS-031': 'puzzle',     // Tetris DS
  'DS-032': 'yoshi',      // Yoshi Touch & Go
  'DS-033': 'sports',     // Mario & Sonic Olympic Games
  'DS-034': 'mario',      // Mario vs. DK: Mini-Land Mayhem
  'DS-035': 'racing',     // Mario Kart DS
  'DS-036': 'zelda',      // Zelda: Phantom Hourglass
  'DS-037': 'mario',      // New Super Mario Bros
  'DS-038': 'metroid',    // Metroid Prime Hunters
  'DS-039': 'mario',      // Super Mario 64 DS
  'DS-040': 'layton',     // Professor Layton
  'DS-041': 'mario',      // Mario & Luigi: Bowser's Inside Story
  'DS-042': 'mario',      // Mario Party DS (CIB)
  'DS-043': 'peach',      // Super Princess Peach
  'DS-044': 'mario',      // New Super Mario Bros
  'DS-045': 'kingdom',    // Kingdom Hearts 358/2 Days
  'DS-046': 'layton',     // Professor Layton: Doos van Pandora
  'DS-047': 'layton',     // Professor Layton: Verloren Toekomst
  'DS-048': 'racing',     // Mario Kart DS
  'DS-049': 'rpg',        // Children of Mana
  'DS-050': 'fighter',    // Dragon Ball Z
  'DS-051': 'sports',     // Mario & Sonic Winter Games
  'DS-052': 'mario',      // Super Mario 64 DS
  'DS-053': 'yoshi',      // Yoshi's Island DS
  'DS-054': 'zelda',      // Zelda: Spirit Tracks
  'DS-055': 'sports',     // Mario & Sonic Olympic Games
  'DS-056': 'rpg',        // Spectrobes
  'DS-057': 'action',     // Bomberman
  'DS-058': 'gta',        // GTA: Chinatown Wars

  // Nintendo 3DS — niet-Pokémon games
  '3DS-012': 'rpg',       // Miitopia
  '3DS-013': 'cooking',   // Cooking Mama 4
  '3DS-014': 'animalcrossing', // Animal Crossing: New Leaf
  '3DS-015': 'animalcrossing', // Animal Crossing: Happy Home Designer
  '3DS-016': 'donkeykong', // DK Country Returns 3D
  '3DS-017': 'kirby',     // Kirby: Planet Robobot
  '3DS-018': 'wario',     // WarioWare Gold
  '3DS-019': 'luigi',     // Luigi's Mansion
  '3DS-020': 'yoshi',     // Yoshi's New Island
  '3DS-021': 'sports',    // Mario & Sonic Rio 2016
  '3DS-022': 'fighter',   // Tekken 3D
  '3DS-023': 'zelda',     // Zelda: Tri Force Heroes
  '3DS-024': 'mario',     // Super Mario Maker 3DS
  '3DS-025': 'sports',    // Mario Tennis Open
  '3DS-026': 'racing',    // Mario Kart 7
  '3DS-027': 'sports',    // Mario & Sonic London 2012
  '3DS-028': 'zelda',     // Zelda: A Link Between Worlds
  '3DS-029': 'fireemblem', // Fire Emblem Echoes
  '3DS-030': 'luigi',     // Luigi's Mansion 2
  '3DS-031': 'mario',     // Paper Mario: Sticker Star
  '3DS-032': 'party',     // Mario Party: Top 100
  '3DS-033': 'party',     // Mario Party: Star Rush
  '3DS-034': 'party',     // Mario Party: Island Tour
  '3DS-035': 'mario',     // New Super Mario Bros 2
  '3DS-036': 'monster',   // Monster Hunter Generations
  '3DS-037': 'party',     // Mario Party: Island Tour
  '3DS-038': 'fighter',   // Street Fighter IV 3D
  '3DS-039': 'racing',    // Mario Kart 7
  '3DS-040': 'sports',    // Inazuma Eleven 3
  '3DS-041': 'mario',     // New Super Mario Bros 2
  '3DS-042': 'action',    // Kid Icarus: Uprising
  '3DS-043': 'sports',    // Inazuma Eleven GO: Shadow
  '3DS-044': 'zelda',     // Zelda: A Link Between Worlds
  '3DS-045': 'smash',     // Super Smash Bros
  '3DS-046': 'mario',     // Super Mario 3D Land
  '3DS-047': 'sports',    // Inazuma Eleven 3: Team Ogre
  '3DS-048': 'fireemblem', // Fire Emblem Fates: Conquest
  '3DS-049': 'layton',    // Professor Layton: Masker der Wonderen
  '3DS-050': 'action',    // LEGO City Undercover

  // Wii games (alleen games met eigen fotografie)
  'WII-004': 'mario',      // Super Mario Galaxy 2
  'WII-007': 'mario',      // New Super Mario Bros. Wii
  'WII-008': 'donkeykong', // Donkey Kong Country Returns
  'WII-009': 'sports',     // Wii Sports
  'WII-011': 'party',      // Mario Party 8
  'WII-019': 'sports',     // Mario Strikers Charged Football
  'WII-031': 'sonic',      // Sonic and the Secret Rings
  'WII-032': 'sonic',      // Sonic Unleashed
  'WII-033': 'mario',      // New Super Mario Bros. Wii (Selects)
  'WII-034': 'party',      // Wii Party
  'WII-035': 'wario',      // Wario Land: The Shake Dimension

  // Wii U games (alleen games met eigen fotografie)
  'WIIU-001': 'racing',     // Mario Kart 8
  'WIIU-004': 'splatoon',   // Splatoon
  'WIIU-006': 'zelda',      // Zelda: Wind Waker HD
  'WIIU-007': 'zelda',      // Zelda: Twilight Princess HD
  'WIIU-008': 'mario',      // New Super Mario Bros. U
  'WIIU-013': 'party',      // Mario Party 10
  'WIIU-016': 'puzzle',     // Captain Toad: Treasure Tracker
  'WIIU-018': 'mario',      // Paper Mario: Color Splash
  'WIIU-021': 'party',      // Wii Party U
  'WIIU-022': 'fighter',    // Pokkén Tournament
  'WIIU-023': 'sports',     // Mario & Sonic Sochi 2014
  'WIIU-024': 'lego',       // LEGO Jurassic World
  'WIIU-025': 'dance',      // Just Dance 2014
  'WIIU-026': 'party',      // Nintendo Land
  'WIIU-027': 'minecraft',  // Minecraft Wii U Edition
  'WIIU-028': 'sonic',      // Sonic Lost World
  'WIIU-029': 'zelda',      // Zelda: Wind Waker HD (Selects)
  'WIIU-030': 'action',     // Skylanders Imaginators
  'WIIU-031': 'lego',       // LEGO Batman 3: Beyond Gotham
  'WIIU-032': 'dance',      // Just Dance 2017
  'WIIU-033': 'sports',     // Mario & Sonic Rio 2016
  'WIIU-034': 'lego',       // LEGO Dimensions
};

export const FRANCHISE_THEME_COLORS: Record<string, PokemonTypeInfo> = {
  mario:          { name: 'mario',          bg: ['#E52521', '#C41E1C'], glow: '229,37,33',    particle: '#FF4040', label: 'Mario' },
  zelda:          { name: 'zelda',          bg: ['#B89B3E', '#7A6B2A'], glow: '184,155,62',   particle: '#D4B44A', label: 'Zelda' },
  luigi:          { name: 'luigi',          bg: ['#3FAF3D', '#2E8B2C'], glow: '63,175,61',    particle: '#50D84E', label: 'Luigi' },
  yoshi:          { name: 'yoshi',          bg: ['#7BC242', '#5CA032'], glow: '123,194,66',    particle: '#90D856', label: 'Yoshi' },
  kirby:          { name: 'kirby',          bg: ['#FF69B4', '#D14D8F'], glow: '255,105,180',   particle: '#FF8AC8', label: 'Kirby' },
  donkeykong:     { name: 'donkeykong',     bg: ['#D97706', '#A35B05'], glow: '217,119,6',     particle: '#F09020', label: 'DK' },
  peach:          { name: 'peach',          bg: ['#F472B6', '#DB2777'], glow: '244,114,182',   particle: '#F9A8D4', label: 'Peach' },
  wario:          { name: 'wario',          bg: ['#EAB308', '#CA8A04'], glow: '234,179,8',     particle: '#FCD34D', label: 'Wario' },
  racing:         { name: 'racing',         bg: ['#2563EB', '#1D4ED8'], glow: '37,99,235',     particle: '#60A5FA', label: 'Race' },
  sports:         { name: 'sports',         bg: ['#16A34A', '#15803D'], glow: '22,163,74',     particle: '#4ADE80', label: 'Sport' },
  party:          { name: 'party',          bg: ['#A855F7', '#7E22CE'], glow: '168,85,247',    particle: '#C084FC', label: 'Party' },
  puzzle:         { name: 'puzzle',         bg: ['#06B6D4', '#0891B2'], glow: '6,182,212',     particle: '#22D3EE', label: 'Puzzel' },
  rpg:            { name: 'rpg',            bg: ['#7C3AED', '#5B21B6'], glow: '124,58,237',    particle: '#A78BFA', label: 'RPG' },
  fighter:        { name: 'fighter',        bg: ['#DC2626', '#991B1B'], glow: '220,38,38',     particle: '#F87171', label: 'Vecht' },
  platformer:     { name: 'platformer',     bg: ['#F59E0B', '#D97706'], glow: '245,158,11',    particle: '#FCD34D', label: 'Platform' },
  action:         { name: 'action',         bg: ['#EA580C', '#C2410C'], glow: '234,88,12',     particle: '#FB923C', label: 'Actie' },
  layton:         { name: 'layton',         bg: ['#92400E', '#78350F'], glow: '146,64,14',     particle: '#B45309', label: 'Layton' },
  mystery:        { name: 'mystery',        bg: ['#475569', '#334155'], glow: '71,85,105',     particle: '#94A3B8', label: 'Mystery' },
  metroid:        { name: 'metroid',        bg: ['#DC2626', '#7F1D1D'], glow: '220,38,38',     particle: '#EF4444', label: 'Metroid' },
  gta:            { name: 'gta',            bg: ['#1E293B', '#0F172A'], glow: '30,41,59',      particle: '#475569', label: 'GTA' },
  kingdom:        { name: 'kingdom',        bg: ['#1E40AF', '#1E3A8A'], glow: '30,64,175',     particle: '#3B82F6', label: 'Kingdom Hearts' },
  animalcrossing: { name: 'animalcrossing', bg: ['#78C850', '#5EA83A'], glow: '120,200,80',    particle: '#A0E870', label: 'Animal Crossing' },
  fireemblem:     { name: 'fireemblem',     bg: ['#1E40AF', '#7F1D1D'], glow: '30,64,175',     particle: '#3B82F6', label: 'Fire Emblem' },
  cooking:        { name: 'cooking',        bg: ['#F97316', '#EA580C'], glow: '249,115,22',    particle: '#FB923C', label: 'Cooking' },
  monster:        { name: 'monster',        bg: ['#854D0E', '#713F12'], glow: '133,77,14',     particle: '#A16207', label: 'Monster Hunter' },
  smash:          { name: 'smash',          bg: ['#EF4444', '#1D4ED8'], glow: '239,68,68',     particle: '#F87171', label: 'Smash Bros' },
  sonic:          { name: 'sonic',          bg: ['#1E90FF', '#0050C0'], glow: '30,144,255',    particle: '#60B0FF', label: 'Sonic' },
  splatoon:       { name: 'splatoon',       bg: ['#E84B0A', '#5D1A8C'], glow: '232,75,10',     particle: '#FF6B2B', label: 'Splatoon' },
  lego:           { name: 'lego',           bg: ['#FFD700', '#E5A100'], glow: '255,215,0',     particle: '#FFE44D', label: 'LEGO' },
  dance:          { name: 'dance',          bg: ['#FF1493', '#8B008B'], glow: '255,20,147',    particle: '#FF69B4', label: 'Dance' },
  minecraft:      { name: 'minecraft',      bg: ['#5D8C3E', '#3B5E28'], glow: '93,140,62',     particle: '#7CBA4C', label: 'Minecraft' },
  pikmin:         { name: 'pikmin',         bg: ['#D4523E', '#2E8B57'], glow: '212,82,62',     particle: '#E87060', label: 'Pikmin' },
};

// Genre-gebaseerde fallback kleuren voor games zonder specifieke franchise
export const GENRE_THEME_COLORS: Record<string, PokemonTypeInfo> = {
  'RPG':         { name: 'rpg',        bg: ['#7C3AED', '#5B21B6'], glow: '124,58,237',   particle: '#A78BFA', label: 'RPG' },
  'Avontuur':    { name: 'adventure',  bg: ['#059669', '#047857'], glow: '5,150,105',    particle: '#34D399', label: 'Avontuur' },
  'Platformer':  { name: 'platformer', bg: ['#F59E0B', '#D97706'], glow: '245,158,11',   particle: '#FCD34D', label: 'Platform' },
  'Actie':       { name: 'action',     bg: ['#EA580C', '#C2410C'], glow: '234,88,12',    particle: '#FB923C', label: 'Actie' },
  'Race':        { name: 'racing',     bg: ['#2563EB', '#1D4ED8'], glow: '37,99,235',    particle: '#60A5FA', label: 'Race' },
  'Vecht':       { name: 'fighter',    bg: ['#DC2626', '#991B1B'], glow: '220,38,38',    particle: '#F87171', label: 'Vecht' },
  'Party':       { name: 'party',      bg: ['#A855F7', '#7E22CE'], glow: '168,85,247',   particle: '#C084FC', label: 'Party' },
  'Shooter':     { name: 'shooter',    bg: ['#475569', '#334155'], glow: '71,85,105',    particle: '#94A3B8', label: 'Shooter' },
  'Sport':       { name: 'sports',     bg: ['#16A34A', '#15803D'], glow: '22,163,74',    particle: '#4ADE80', label: 'Sport' },
  'Strategie':   { name: 'strategy',   bg: ['#0891B2', '#0E7490'], glow: '8,145,178',    particle: '#22D3EE', label: 'Strategie' },
  'Simulatie':   { name: 'simulation', bg: ['#0EA5E9', '#0284C7'], glow: '14,165,233',   particle: '#38BDF8', label: 'Simulatie' },
  'Puzzel':      { name: 'puzzle',     bg: ['#06B6D4', '#0891B2'], glow: '6,182,212',    particle: '#22D3EE', label: 'Puzzel' },
  'Muziek':      { name: 'music',     bg: ['#FF1493', '#8B008B'], glow: '255,20,147',   particle: '#FF69B4', label: 'Muziek' },
  'Fitness':     { name: 'fitness',   bg: ['#10B981', '#059669'], glow: '16,185,129',   particle: '#34D399', label: 'Fitness' },
};

// Universele thema functie — werkt voor ALLE games (Pokémon + franchise + genre fallback)
export function getGameTheme(sku: string, genre?: string): PokemonTypeInfo | null {
  // Eerst check Pokémon types
  const pokemonType = POKEMON_TYPE_MAP[sku];
  if (pokemonType) return POKEMON_TYPE_COLORS[pokemonType] || null;

  // Dan check franchise thema's
  const franchise = FRANCHISE_THEME_MAP[sku];
  if (franchise) return FRANCHISE_THEME_COLORS[franchise] || null;

  // Tenslotte genre fallback
  if (genre && GENRE_THEME_COLORS[genre]) return GENRE_THEME_COLORS[genre];

  return null;
}
