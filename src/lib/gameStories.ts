/**
 * Game Development History Database
 *
 * Contains fascinating stories about iconic games
 * Used in Phase 3: Product Stories
 */

export const GAME_STORIES: Record<string, {
  title: string;
  year: number;
  platform: string;
  developer: string;
  story: string;
  culturalImpact: string;
  funFacts: string[];
}> = {
  'SW-126': {
    title: "The Legend of Zelda: Link's Awakening",
    year: 1993,
    platform: 'Game Boy',
    developer: 'Nintendo R&D1',
    story: 'Link wakes up on a mysterious island with no memory of how he got there. This was the first Zelda game to feature a complete story with a definitive ending, breaking from the traditional open-ended adventure formula.',
    culturalImpact: 'Revolutionized portable gaming storytelling. Proved that handheld games could deliver narrative depth equal to console experiences.',
    funFacts: [
      'The only Zelda game with a proper ending where Link actually leaves',
      'Features characters from Super Mario Bros - a fun Nintendo crossover',
      'Took 12 months to develop on Game Boy hardware',
      'Spawned countless remakes and the 2019 Switch remake'
    ]
  },
  'SW-078': {
    title: 'Pokémon Let\'s Go Eevee',
    year: 2018,
    platform: 'Nintendo Switch',
    developer: 'Game Freak',
    story: 'A reimagining of the original Pokémon Red & Blue, Let\'s Go brought the Kanto region to modern consoles with motion controls and cooperative gameplay. Your trusty Eevee rides on your shoulder throughout the journey.',
    culturalImpact: 'Introduced motion capture mechanics to the series. Proved Pokémon could work seamlessly on home consoles while maintaining portability with Switch.',
    funFacts: [
      'Uses motion controls instead of traditional battles for catching Pokémon',
      'Can transfer Pokémon from Pokémon GO mobile game',
      'Features updated graphics while maintaining faithful to original Kanto region',
      'Sold over 10 million copies in its first year'
    ]
  },
  'N64-027': {
    title: 'The Legend of Zelda: Ocarina of Time',
    year: 1998,
    platform: 'Nintendo 64',
    developer: 'Nintendo EAD',
    story: 'Widely regarded as one of the greatest games ever made. Link travels through time, solving puzzles and fighting monsters to save Hyrule from Ganon\'s evil reign.',
    culturalImpact: 'Set the standard for 3D adventure games. Pioneered Z-targeting system still used today. Changed how we think about large-scale game worlds.',
    funFacts: [
      'Spent 5+ years in development',
      'First Nintendo 64 game to require Expansion Pak',
      'Has been ported to nearly every Nintendo platform since',
      'Often ranked #1 game of all time in retrospective rankings'
    ]
  },
  'GB-021': {
    title: "Link's Awakening (Original)",
    year: 1993,
    platform: 'Game Boy',
    developer: 'Nintendo R&D1',
    story: 'The original Game Boy masterpiece. An entirely self-contained adventure that proved the series could succeed beyond Hyrule.',
    culturalImpact: 'Became the best-selling Zelda game at the time. Redefined what was possible on handheld hardware.',
    funFacts: [
      'Was originally planned as a Super Mario Land 2 spinoff',
      'First Zelda game to feature a dark, dreamlike tone',
      'Created entirely on Game Boy hardware',
      'Sold over 6 million copies on original Game Boy'
    ]
  },
  'SNES-015': {
    title: 'Final Fantasy V',
    year: 1992,
    platform: 'Super Nintendo',
    developer: 'Square',
    story: 'An epic tale of elemental crystals, airships, and interdimensional conflict. Features the legendary Job System allowing unprecedented character customization.',
    culturalImpact: 'Revolutionized JRPG character development. The Job System became a template for countless games. Proved JRPGs could compete globally.',
    funFacts: [
      'Was actually released in Japan as "Final Fantasy V" but in Europe as "Final Fantasy: Mystic Quest"',
      'Features one of gaming\'s greatest villains: Gilgamesh',
      'The Job System offers nearly infinite character build combinations',
      'Developed using state-of-the-art SNES Mode 7 graphics technology'
    ]
  }
};

/**
 * Get story for a product
 */
export function getGameStory(sku: string) {
  const key = Object.keys(GAME_STORIES).find(k => k === sku);
  return key ? GAME_STORIES[key as keyof typeof GAME_STORIES] : null;
}

/**
 * Get all stories for a series
 */
export function getSeriesStories(seriesName: string) {
  return Object.entries(GAME_STORIES)
    .filter(([_, story]) => story.title.includes(seriesName))
    .map(([sku, story]) => ({ sku, ...story }));
}
