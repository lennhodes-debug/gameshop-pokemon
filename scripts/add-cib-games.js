/**
 * Voeg CIB velden toe aan bestaande games + nieuwe DS games.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(file, 'utf8'));

// === CIB upgrades voor bestaande producten ===
const cibUpgrades = {
  'DS-001': { cibPrice: 80, cibImage: '/images/products/ds-001-pokemon-platinum-cib.webp', cibBackImage: '/images/products/ds-001-pokemon-platinum-cib-back.webp' },
  'DS-002': { cibPrice: 90, cibImage: '/images/products/ds-002-pokemon-soulsilver-cib.webp', cibBackImage: '/images/products/ds-002-pokemon-soulsilver-cib-back.webp' },
  'DS-003': { cibPrice: 95, cibImage: '/images/products/ds-003-pokemon-heartgold-cib.webp', cibBackImage: '/images/products/ds-003-pokemon-heartgold-cib-back.webp' },
  'DS-004': { cibPrice: 45, cibImage: '/images/products/ds-004-pokemon-pearl-cib.webp', cibBackImage: '/images/products/ds-004-pokemon-pearl-cib-back.webp' },
  'DS-006': { cibPrice: 55, cibImage: '/images/products/ds-006-pokemon-white-cib.webp', cibBackImage: '/images/products/ds-006-pokemon-white-cib-back.webp' },
  'DS-008': { cibPrice: 30, cibImage: '/images/products/ds-008-pokemon-ranger-shadows-of-almia-cib.webp', cibBackImage: '/images/products/ds-008-pokemon-ranger-shadows-of-almia-cib-back.webp' },
  'DS-009': { cibPrice: 40, cibImage: '/images/products/ds-009-pokemon-mystery-dungeon-explorers-of-time-cib.webp', cibBackImage: '/images/products/ds-009-pokemon-mystery-dungeon-explorers-of-time-cib-back.webp' },
};

let upgraded = 0;
for (const p of products) {
  if (cibUpgrades[p.sku]) {
    Object.assign(p, cibUpgrades[p.sku]);
    upgraded++;
  }
}

// === Nieuwe games toevoegen ===
const newGames = [
  {
    sku: 'DS-010', slug: 'ds-010-pokemon-diamond-eur', name: 'Pokémon Diamond (EUR)',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 40,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Diamond voor de Nintendo DS — ontdek de Sinnoh-regio en vang de legendarische Dialga. Met meer dan 100 nieuwe Pokémon, underground mining en Wi-Fi battles. Europese versie (PAL/EUR). Compleet in doos met handleiding.',
    weight: 0.08, isConsole: false, isPremium: false,
    image: '/images/products/ds-010-pokemon-diamond-eur.webp',
    backImage: '/images/products/ds-010-pokemon-diamond-eur-back.webp',
  },
  {
    sku: 'DS-011', slug: 'ds-011-pokemon-md-blue-rescue-team', name: 'Pokémon Mystery Dungeon: Blue Rescue Team',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 30,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Mystery Dungeon: Blue Rescue Team voor de Nintendo DS — word een Pokémon en red andere Pokémon in willekeurig gegenereerde dungeons. De DS-versie van het eerste Mystery Dungeon-avontuur. Europese versie (PAL/EUR). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: false,
    image: '/images/products/ds-011-pokemon-md-blue-rescue-team.webp',
    backImage: '/images/products/ds-011-pokemon-md-blue-rescue-team-back.webp',
  },
  {
    sku: 'DS-012', slug: 'ds-012-pokemon-md-explorers-of-sky', name: 'Pokémon Mystery Dungeon: Explorers of Sky',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 65,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Mystery Dungeon: Explorers of Sky voor de Nintendo DS — de ultieme versie met nieuwe speciale episodes, extra Pokémon starters en de Spinda Café. Een must-have voor Mystery Dungeon fans. Europese versie (PAL/EUR). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: true,
    image: '/images/products/ds-012-pokemon-md-explorers-of-sky.webp',
    backImage: '/images/products/ds-012-pokemon-md-explorers-of-sky-back.webp',
  },
  {
    sku: 'DS-013', slug: 'ds-013-pokemon-ranger', name: 'Pokémon Ranger',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'Avontuur', price: 20,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Ranger voor de Nintendo DS — word een Pokémon Ranger en gebruik de Capture Styler om wilde Pokémon te vangen en te bevrienden. Bescherm de natuur in de Fiore-regio. Europese versie (PAL/EUR). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: false,
    image: '/images/products/ds-013-pokemon-ranger.webp',
    backImage: '/images/products/ds-013-pokemon-ranger-back.webp',
  },
  {
    sku: 'DS-014', slug: 'ds-014-pokemon-md-explorers-of-darkness', name: 'Pokémon Mystery Dungeon: Explorers of Darkness',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 25,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Mystery Dungeon: Explorers of Darkness voor de Nintendo DS — verken mysterieuze dungeons als Pokémon, red de wereld van de duisternis en ontdek de geheimen van tijd. Europese versie (PAL/EUR). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: false,
    image: '/images/products/ds-014-pokemon-md-explorers-of-darkness.webp',
    backImage: '/images/products/ds-014-pokemon-md-explorers-of-darkness-back.webp',
  },
  {
    sku: 'DS-015', slug: 'ds-015-pokemon-conquest', name: 'Pokémon Conquest',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'Strategie', price: 55,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Conquest voor de Nintendo DS — een unieke crossover tussen Pokémon en Nobunaga\'s Ambition. Verover koninkrijken met je Pokémon in tactische gevechten in het feodale Ransei. Amerikaanse versie (NTSC). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: true,
    image: '/images/products/ds-015-pokemon-conquest.webp',
    backImage: '/images/products/ds-015-pokemon-conquest-back.webp',
  },
  {
    sku: 'DS-016', slug: 'ds-016-pokemon-black-2', name: 'Pokémon Black 2',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 55,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Black Version 2 voor de Nintendo DS — het vervolg op Pokémon Black met nieuwe gebieden in de Unova-regio, nieuwe vormen van legendarische Pokémon en de Pokémon World Tournament. Europese versie (PAL/EUR). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: true,
    image: '/images/products/ds-016-pokemon-black-2.webp',
    backImage: '/images/products/ds-016-pokemon-black-2-back.webp',
  },
  {
    sku: 'DS-017', slug: 'ds-017-pokemon-white-2', name: 'Pokémon White 2',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 55,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon White Version 2 voor de Nintendo DS — het vervolg op Pokémon White met Pokéstar Studios, nieuwe routes en de White Treehollow. Europese versie (PAL/EUR). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: true,
    image: '/images/products/ds-017-pokemon-white-2.webp',
    backImage: '/images/products/ds-017-pokemon-white-2-back.webp',
  },
  {
    sku: 'DS-018', slug: 'ds-018-pokemon-diamond-usa', name: 'Pokémon Diamond (USA)',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 35,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Diamond voor de Nintendo DS — ontdek de Sinnoh-regio en vang Dialga. Amerikaanse versie (NTSC). Compleet in doos met handleiding.',
    weight: 0.08, isConsole: false, isPremium: false,
    image: '/images/products/ds-018-pokemon-diamond-usa.webp',
    backImage: '/images/products/ds-018-pokemon-diamond-usa-back.webp',
  },
  {
    sku: 'DS-019', slug: 'ds-019-pokemon-platinum-usa', name: 'Pokémon Platinum (USA)',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 70,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Platinum voor de Nintendo DS — de ultieme Sinnoh-ervaring met de Distortion World en Battle Frontier. Amerikaanse versie (NTSC). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: true,
    image: '/images/products/ds-019-pokemon-platinum-usa.webp',
    backImage: '/images/products/ds-019-pokemon-platinum-usa-back.webp',
  },
  {
    sku: 'DS-020', slug: 'ds-020-pokemon-pearl-usa', name: 'Pokémon Pearl (USA)',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 35,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon Pearl voor de Nintendo DS — vang de legendarische Palkia in de Sinnoh-regio. Amerikaanse versie (NTSC). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: false,
    image: '/images/products/ds-020-pokemon-pearl-usa.webp',
    backImage: '/images/products/ds-020-pokemon-pearl-usa-back.webp',
  },
  {
    sku: 'DS-021', slug: 'ds-021-pokemon-heartgold-usa', name: 'Pokémon HeartGold (USA)',
    platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 85,
    condition: 'Gebruikt', completeness: 'Compleet in doos (CIB)', type: 'simple',
    description: 'Pokémon HeartGold voor de Nintendo DS — herbeleef de Johto-regio met verbeterde graphics, Pokéwalker compatibiliteit en de mogelijkheid om je Pokémon achter je aan te laten lopen. Amerikaanse versie (NTSC). Compleet in doos.',
    weight: 0.08, isConsole: false, isPremium: true,
    image: '/images/products/ds-021-pokemon-heartgold-usa.webp',
    backImage: '/images/products/ds-021-pokemon-heartgold-usa-back.webp',
  },
];

products.push(...newGames);
fs.writeFileSync(file, JSON.stringify(products, null, 2) + '\n');
console.log(`${upgraded} bestaande games geüpgraded met CIB velden`);
console.log(`${newGames.length} nieuwe games toegevoegd`);
console.log(`Totaal: ${products.length} producten`);
