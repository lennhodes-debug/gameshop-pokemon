/**
 * Game Series Detection and Management
 *
 * Maps products to their series and provides series-related utilities
 */

export const GAME_SERIES: Record<string, { name: string; games: string[]; emoji: string }> = {
  zelda: {
    name: 'The Legend of Zelda',
    emoji: '🗡️',
    games: ['Zelda', 'Link', 'Ocarina of Time', 'Twilight Princess', 'Wind Waker', "Link's Awakening", "A Link to the Past", "Link's Recital"]
  },
  mario: {
    name: 'Super Mario',
    emoji: '🍄',
    games: ['Mario', 'Super Mario', 'New Super', 'Galaxy', 'Odyssey', 'Paper Mario']
  },
  pokemon: {
    name: 'Pokémon',
    emoji: '⚡',
    games: ['Pokemon', 'Pokémon', 'Pika', 'Let\'s Go', 'Sword', 'Shield', 'Scarlet', 'Violet']
  },
  kirby: {
    name: 'Kirby',
    emoji: '👾',
    games: ['Kirby', 'Dream Land', 'Epic Yarn']
  },
  fireemblem: {
    name: 'Fire Emblem',
    emoji: '⚔️',
    games: ['Fire Emblem', 'Awakening', 'Fates', 'Three Houses', 'Engage']
  },
  finalfantasy: {
    name: 'Final Fantasy',
    emoji: '✨',
    games: ['Final Fantasy', 'FF ']
  },
  donkeykong: {
    name: 'Donkey Kong',
    emoji: '🦍',
    games: ['Donkey Kong', 'DK Country']
  },
  metroid: {
    name: 'Metroid',
    emoji: '🔫',
    games: ['Metroid', 'Samus']
  },
  castlevania: {
    name: 'Castlevania',
    emoji: '🧛',
    games: ['Castlevania']
  },
  megaman: {
    name: 'Mega Man',
    emoji: '🤖',
    games: ['Mega Man', 'Megaman']
  }
};

/**
 * Detect which series a game belongs to
 */
export function detectSeries(gameName: string): { seriesKey: string; seriesData: typeof GAME_SERIES[keyof typeof GAME_SERIES] } | null {
  const lowerName = gameName.toLowerCase();

  for (const [key, series] of Object.entries(GAME_SERIES)) {
    for (const gameKeyword of series.games) {
      if (lowerName.includes(gameKeyword.toLowerCase())) {
        return { seriesKey: key, seriesData: series };
      }
    }
  }

  return null;
}

/**
 * Get all games in a series from product list
 */
export function getSeriesGames(seriesKey: string, products: any[]): any[] {
  const seriesData = GAME_SERIES[seriesKey];
  if (!seriesData) return [];

  return products.filter(p => {
    const detected = detectSeries(p.name);
    return detected?.seriesKey === seriesKey;
  });
}

/**
 * Get position in series
 */
export function getSeriesPosition(
  gameName: string,
  seriesKey: string,
  products: any[]
): number {
  const seriesGames = getSeriesGames(seriesKey, products);
  const gameIndex = seriesGames.findIndex(g => g.name === gameName);
  return gameIndex + 1;
}

/**
 * Check if series is complete in cart
 */
export function isSeriesComplete(
  seriesKey: string,
  cartItems: string[],
  products: any[]
): boolean {
  const seriesGames = getSeriesGames(seriesKey, products);
  if (seriesGames.length === 0) return false;

  return seriesGames.every(game =>
    cartItems.includes(game.sku)
  );
}

/**
 * Get series completion percentage
 */
export function getSeriesCompletion(
  seriesKey: string,
  cartItems: string[],
  products: any[]
): number {
  const seriesGames = getSeriesGames(seriesKey, products);
  if (seriesGames.length === 0) return 0;

  const collected = seriesGames.filter(game =>
    cartItems.includes(game.sku)
  ).length;

  return Math.round((collected / seriesGames.length) * 100);
}

/**
 * Get series recommendation (missing games)
 */
export function getSeriesRecommendations(
  seriesKey: string,
  cartItems: string[],
  products: any[]
): any[] {
  const seriesGames = getSeriesGames(seriesKey, products);
  return seriesGames.filter(game => !cartItems.includes(game.sku));
}
