#!/usr/bin/env node

/**
 * Fetch PAL prices from PriceCharting for all products
 * Calculates 40% trade-in (inkoop) price based on "used" (loose) market value
 *
 * Uses VGPC.chart_data JSON embedded in each page
 * Price types: used (loose), cib (complete in box), new (sealed)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/products.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));

const TRADE_IN_PERCENTAGE = 0.40;

// Platform → PriceCharting PAL platform slug
const PLATFORM_MAP = {
  'Nintendo Switch': 'pal-nintendo-switch',
  'Nintendo 3DS': 'pal-nintendo-3ds',
  'GameCube': 'pal-gamecube',
  'Nintendo 64': 'pal-nintendo-64',
  'Game Boy Advance': 'pal-gameboy-advance',
  'Nintendo DS': 'pal-nintendo-ds',
  'Super Nintendo': 'pal-super-nintendo',
  'Wii': 'pal-wii',
  'NES': 'pal-nes',
  'Game Boy': 'pal-gameboy',
  'Wii U': 'pal-wii-u',
  'Game Boy Color': 'pal-gameboy-color',
};

// Manual PriceCharting slug overrides
const SLUG_OVERRIDES = {
  // === SWITCH GAMES ===
  'SW-012': 'legend-of-zelda-breath-of-the-wild',
  'SW-013': 'legend-of-zelda-tears-of-the-kingdom',
  'SW-014': 'legend-of-zelda-links-awakening',
  'SW-015': 'legend-of-zelda-skyward-sword-hd',
  'SW-016': 'hyrule-warriors-age-of-calamity',
  'SW-017': 'hyrule-warriors-definitive-edition',
  'SW-022': 'super-mario-3d-world-+-bowsers-fury',
  'SW-023': 'super-mario-3d-all-stars',
  'SW-027': 'mario-+-rabbids-kingdom-battle',
  'SW-028': 'mario-+-rabbids-sparks-of-hope',
  'SW-034': 'luigis-mansion-3',
  'SW-037': 'kirby-and-the-forgotten-land',
  'SW-039': 'kirbys-return-to-dream-land-deluxe',
  'SW-048': 'xenoblade-chronicles-definitive-edition',
  'SW-054': 'yoshis-crafted-world',
  'SW-060': 'clubhouse-games-51-worldwide-classics',
  'SW-061': 'warioware-get-it-together',
  'SW-062': 'dragon-quest-xi-s-echoes-of-an-elusive-age-definitive-edition',
  'SW-069': 'witcher-3-wild-hunt-complete-edition',
  'SW-070': 'elder-scrolls-v-skyrim',
  'SW-083': 'crash-bandicoot-n-sane-trilogy',
  'SW-091': 'grand-theft-auto-the-trilogy-the-definitive-edition',
  'SW-092': 'crash-team-racing-nitro-fueled',
  'SW-093': 'lego-star-wars-the-skywalker-saga',
  'SW-097': 'overcooked-all-you-can-eat',
  'SW-100': 'rocket-league-collectors-edition',
  'SW-102': 'ni-no-kuni-wrath-of-the-white-witch',
  'SW-103': 'tales-of-vesperia-definitive-edition',
  'SW-105': 'final-fantasy-x-x-2-hd-remaster',
  'SW-108': 'borderlands-legendary-collection',
  'SW-109': 'naruto-shippuden-ultimate-ninja-storm-trilogy',
  'SW-110': 'cars-3-driven-to-win',
  'SW-111': 'dragon-quest-builders-2',
  'SW-112': 'mario-and-sonic-at-the-olympic-games-tokyo-2020',
  'SW-113': 'pikmin-1-+-2',
  'SW-115': 'cadence-of-hyrule',

  // === 3DS GAMES ===
  '3DS-001': 'legend-of-zelda-majoras-mask-3d',
  '3DS-002': 'legend-of-zelda-ocarina-of-time-3d',
  '3DS-003': 'legend-of-zelda-a-link-between-worlds',
  '3DS-014': 'super-smash-bros-for-nintendo-3ds',
  '3DS-016': 'luigis-mansion-dark-moon',
  '3DS-023': 'donkey-kong-country-returns-3d',

  // === DS GAMES ===
  'DS-013': 'mario-and-luigi-bowsers-inside-story',
  'DS-014': 'legend-of-zelda-phantom-hourglass',
  'DS-015': 'legend-of-zelda-spirit-tracks',
  'DS-016': 'professor-layton-and-the-curious-village',
  'DS-020': 'castlevania-dawn-of-sorrow',

  // === GAME BOY ===
  'GB-009': 'super-mario-land-2-6-golden-coins',
  'GB-010': 'legend-of-zelda-links-awakening',
  'GB-011': 'legend-of-zelda-links-awakening-dx',
  'GB-012': 'legend-of-zelda-oracle-of-ages',
  'GB-013': 'legend-of-zelda-oracle-of-seasons',
  'GB-014': 'kirbys-dream-land',
  'GB-019': 'donkey-kong-country',
  'GB-020': 'pokemon-trading-card-game',
  'GB-025': 'metroid-ii-return-of-samus',

  // === GBA GAMES ===
  'GBA-006': 'legend-of-zelda-minish-cap',
  'GBA-007': 'legend-of-zelda-a-link-to-the-past',
  'GBA-008': 'mario-kart-super-circuit',
  'GBA-009': 'mario-and-luigi-superstar-saga',
  'GBA-020': 'kirby-and-the-amazing-mirror',
  'GBA-022': 'harvest-moon-friends-of-mineral-town',
  'GBA-023': 'yoshis-island-super-mario-advance-3',
  'GBA-025': 'mega-man-battle-network',

  // === GAMECUBE ===
  'GC-003': 'legend-of-zelda-wind-waker',
  'GC-004': 'legend-of-zelda-twilight-princess',
  'GC-005': 'super-smash-bros-melee',
  'GC-006': 'mario-kart-double-dash',
  'GC-008': 'luigis-mansion',
  'GC-009': 'paper-mario-thousand-year-door',
  'GC-024': 'eternal-darkness-sanitys-requiem',
  'GC-022': 'sonic-adventure-2-battle',

  // === N64 ===
  'N64-002': 'legend-of-zelda-ocarina-of-time',
  'N64-003': 'legend-of-zelda-majoras-mask',
  'N64-009': 'goldeneye-007',
  'N64-013': 'conkers-bad-fur-day',
  'N64-019': 'star-fox-64',
  'N64-020': 'kirby-64-the-crystal-shards',
  'N64-025': 'mystical-ninja-starring-goemon',

  // === SNES ===
  'SNES-001': 'legend-of-zelda-a-link-to-the-past',
  'SNES-005': 'super-mario-world-2-yoshis-island',
  'SNES-010': 'street-fighter-ii-turbo',
  'SNES-013': 'kirby-super-star',
  'SNES-016': 'teenage-mutant-ninja-turtles-iv-turtles-in-time',
  'SNES-017': 'contra-iii-the-alien-wars',

  // === NES ===
  'NES-004': 'legend-of-zelda',
  'NES-005': 'zelda-ii-the-adventure-of-link',
  'NES-007': 'kirbys-adventure',
  'NES-011': 'mike-tysons-punch-out',
  'NES-015': 'ninja-gaiden',

  // === WII ===
  'WII-005': 'legend-of-zelda-twilight-princess',
  'WII-006': 'legend-of-zelda-skyward-sword',
  'WII-012': 'pokepark-wii-pikachus-adventure',
  'WII-013': 'donkey-kong-country-returns',
  'WII-016': 'kirbys-return-to-dream-land',
  'WII-017': 'metroid-prime-3-corruption',
  'WII-018': 'metroid-other-m',

  // === WII U ===
  'WIIU-001': 'legend-of-zelda-breath-of-the-wild',
  'WIIU-002': 'legend-of-zelda-wind-waker-hd',
  'WIIU-003': 'legend-of-zelda-twilight-princess-hd',
  'WIIU-004': 'mario-kart-8',
  'WIIU-005': 'super-smash-bros-for-wii-u',
  'WIIU-008': 'donkey-kong-country-tropical-freeze',
  'WIIU-012': 'yoshis-woolly-world',

  // === CONSOLES ===
  'CON-001': 'nintendo-switch-oled-white',
  'CON-002': 'nintendo-switch-oled-neon',
  'CON-003': 'nintendo-switch-v2',
  'CON-004': 'nintendo-switch-v2-neon',
  'CON-005': 'nintendo-switch-lite-yellow',
  'CON-006': 'nintendo-switch-lite-turquoise',
  'CON-007': 'nintendo-switch-lite-gray',
  'CON-008': 'new-nintendo-2ds-xl',
  'CON-009': 'new-nintendo-3ds-xl',
  'CON-010': 'nintendo-ds-lite',
  'CON-011': 'nintendo-dsi',
  'CON-012': 'gameboy-advance-sp',
  'CON-013': 'gameboy-color-teal',
  'CON-014': 'gameboy-system',
  'CON-015': 'black-gamecube-system',
  'CON-016': 'purple-gamecube-system',
  'CON-017': 'nintendo-64-system',
  'CON-018': 'super-nintendo-system',
  'CON-019': 'nes-console',
  'CON-020': 'white-wii-console',
  'CON-021': 'wii-u-console-deluxe-black-32gb',
};

// Console platform override
const CONSOLE_PLATFORM_MAP = {
  'CON-001': 'pal-nintendo-switch',
  'CON-002': 'pal-nintendo-switch',
  'CON-003': 'pal-nintendo-switch',
  'CON-004': 'pal-nintendo-switch',
  'CON-005': 'pal-nintendo-switch',
  'CON-006': 'pal-nintendo-switch',
  'CON-007': 'pal-nintendo-switch',
  'CON-008': 'pal-nintendo-3ds',
  'CON-009': 'pal-nintendo-3ds',
  'CON-010': 'pal-nintendo-ds',
  'CON-011': 'pal-nintendo-ds',
  'CON-012': 'pal-gameboy-advance',
  'CON-013': 'pal-gameboy-color',
  'CON-014': 'pal-gameboy',
  'CON-015': 'pal-gamecube',
  'CON-016': 'pal-gamecube',
  'CON-017': 'pal-nintendo-64',
  'CON-018': 'pal-super-nintendo',
  'CON-019': 'pal-nes',
  'CON-020': 'pal-wii',
  'CON-021': 'pal-wii-u',
};

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/é/g, 'e')
    .replace(/ü/g, 'u')
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/\+/g, '+')
    .replace(/[:.!?,()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getPriceChartingUrl(product) {
  const platformSlug = product.isConsole
    ? CONSOLE_PLATFORM_MAP[product.sku] || PLATFORM_MAP[product.platform]
    : PLATFORM_MAP[product.platform];

  if (!platformSlug) return null;

  const gameSlug = SLUG_OVERRIDES[product.sku] || slugifyName(product.name);
  return `https://www.pricecharting.com/game/${platformSlug}/${gameSlug}`;
}

function fetchPage(url) {
  try {
    const result = execSync(
      `curl -sL -o - -w "\\n---HTTP_CODE:%{http_code}---" --max-time 15 -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`,
      { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 }
    );
    const httpCodeMatch = result.match(/---HTTP_CODE:(\d+)---/);
    const httpCode = httpCodeMatch ? parseInt(httpCodeMatch[1]) : 0;
    const body = result.replace(/\n---HTTP_CODE:\d+---$/, '');
    return { body, httpCode };
  } catch (e) {
    return { body: '', httpCode: 0 };
  }
}

function extractPrices(html) {
  // Extract VGPC.chart_data JSON from the HTML
  const match = html.match(/VGPC\.chart_data\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return null;

  try {
    const chartData = JSON.parse(match[1]);
    const prices = {};

    // Extract latest non-zero price from each series
    for (const [type, dataPoints] of Object.entries(chartData)) {
      if (!Array.isArray(dataPoints) || dataPoints.length === 0) continue;

      // Get the last non-zero value (scan backwards)
      for (let i = dataPoints.length - 1; i >= 0; i--) {
        if (dataPoints[i][1] > 0) {
          prices[type] = dataPoints[i][1]; // Value is in cents
          break;
        }
      }
    }

    return prices;
  } catch (e) {
    return null;
  }
}

function roundToNearest50Cents(cents) {
  // Round to nearest 50 cents (e.g., 1168 → 1150, 1190 → 1200)
  return Math.round(cents / 50) * 50;
}

function formatEuro(cents) {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

async function main() {
  console.log(`\n=== PriceCharting Price Fetcher ===`);
  console.log(`Products: ${products.length}`);
  console.log(`Trade-in: ${TRADE_IN_PERCENTAGE * 100}% of PriceCharting loose price\n`);

  const results = { success: 0, failed: 0, noPrice: 0, errors: [] };
  const priceData = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    process.stdout.write(`[${i + 1}/${products.length}] ${product.sku} - ${product.name}`);

    const url = getPriceChartingUrl(product);
    if (!url) {
      console.log(` → SKIP: No URL`);
      results.failed++;
      results.errors.push({ sku: product.sku, name: product.name, reason: 'No URL mapping' });
      priceData.push({ sku: product.sku, pcUsed: null, pcCib: null, pcNew: null, inkoopPrijs: null });
      continue;
    }

    const { body, httpCode } = fetchPage(url);

    if (httpCode !== 200 || !body) {
      console.log(` → FAIL: HTTP ${httpCode}`);
      results.failed++;
      results.errors.push({ sku: product.sku, name: product.name, url, reason: `HTTP ${httpCode}` });
      priceData.push({ sku: product.sku, pcUsed: null, pcCib: null, pcNew: null, inkoopPrijs: null });
      sleep(300);
      continue;
    }

    const prices = extractPrices(body);

    if (!prices || (!prices.used && !prices.cib)) {
      console.log(` → NO PRICE`);
      results.noPrice++;
      results.errors.push({ sku: product.sku, name: product.name, url, reason: 'No price data' });
      priceData.push({ sku: product.sku, pcUsed: null, pcCib: null, pcNew: null, inkoopPrijs: null });
      sleep(300);
      continue;
    }

    // Use "used" (loose) price as base for trade-in, fall back to CIB
    const basePrice = prices.used || prices.cib || 0;
    const tradeInRaw = Math.round(basePrice * TRADE_IN_PERCENTAGE);
    const tradeIn = roundToNearest50Cents(tradeInRaw);

    const entry = {
      sku: product.sku,
      pcUsed: prices.used || null,
      pcCib: prices.cib || null,
      pcNew: prices.new || null,
      inkoopPrijs: tradeIn,
    };
    priceData.push(entry);

    console.log(` → Loose: ${formatEuro(prices.used || 0)} | CIB: ${formatEuro(prices.cib || 0)} | Inkoop: ${formatEuro(tradeIn)}`);
    results.success++;

    // Rate limit: 500ms between requests
    sleep(500);
  }

  // Save raw price data for reference
  const priceDataPath = path.join(process.cwd(), 'price-data.json');
  fs.writeFileSync(priceDataPath, JSON.stringify(priceData, null, 2));
  console.log(`\nPrice data saved to: ${priceDataPath}`);

  // Update products.json with inkoopPrijs
  const updatedProducts = products.map(p => {
    const pd = priceData.find(d => d.sku === p.sku);
    if (pd && pd.inkoopPrijs !== null && pd.inkoopPrijs > 0) {
      return {
        ...p,
        inkoopPrijs: pd.inkoopPrijs / 100, // Store as euros (e.g., 11.50)
        pcUsedPrice: pd.pcUsed ? pd.pcUsed / 100 : null,
      };
    }
    return { ...p, inkoopPrijs: null, pcUsedPrice: null };
  });

  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(updatedProducts, null, 2));
  console.log(`Products updated with inkoopPrijs in: ${PRODUCTS_PATH}`);

  // Summary
  console.log(`\n=== RESULTS ===`);
  console.log(`Success:  ${results.success}`);
  console.log(`Failed:   ${results.failed}`);
  console.log(`No price: ${results.noPrice}`);
  console.log(`Total:    ${products.length}`);

  if (results.errors.length > 0) {
    const failPath = path.join(process.cwd(), 'price-fetch-failures.json');
    fs.writeFileSync(failPath, JSON.stringify(results.errors, null, 2));
    console.log(`\nFailures saved to: ${failPath}`);
  }

  // Print some stats
  const withPrices = priceData.filter(d => d.inkoopPrijs > 0);
  const avgInkoop = withPrices.reduce((s, d) => s + d.inkoopPrijs, 0) / withPrices.length;
  const maxInkoop = Math.max(...withPrices.map(d => d.inkoopPrijs));
  const minInkoop = Math.min(...withPrices.map(d => d.inkoopPrijs));
  console.log(`\n=== INKOOP STATS ===`);
  console.log(`Products with inkoop price: ${withPrices.length}`);
  console.log(`Average inkoop: ${formatEuro(Math.round(avgInkoop))}`);
  console.log(`Highest inkoop: ${formatEuro(maxInkoop)}`);
  console.log(`Lowest inkoop:  ${formatEuro(minInkoop)}`);
}

main().catch(console.error);
