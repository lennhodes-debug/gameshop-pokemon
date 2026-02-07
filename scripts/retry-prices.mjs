#!/usr/bin/env node

/**
 * Retry price fetching for products that failed with PAL URLs
 * Falls back to non-PAL URLs and alternative slug patterns
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/products.json');
const FAILURES_PATH = path.join(process.cwd(), 'price-fetch-failures.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
const failures = JSON.parse(fs.readFileSync(FAILURES_PATH, 'utf-8'));

const TRADE_IN_PERCENTAGE = 0.40;

// Non-PAL platform slugs (fallback)
const NON_PAL_PLATFORM_MAP = {
  'Nintendo Switch': 'nintendo-switch',
  'Nintendo 3DS': 'nintendo-3ds',
  'GameCube': 'gamecube',
  'Nintendo 64': 'nintendo-64',
  'Game Boy Advance': 'gameboy-advance',
  'Nintendo DS': 'nintendo-ds',
  'Super Nintendo': 'super-nintendo',
  'Wii': 'wii',
  'NES': 'nes',
  'Game Boy': 'gameboy',
  'Wii U': 'wii-u',
  'Game Boy Color': 'gameboy-color',
};

// Alternative slugs for games that use different names on non-PAL PriceCharting
const ALT_SLUGS = {
  // Zelda uses short names on PriceCharting (non-PAL)
  'SW-012': ['zelda-breath-of-the-wild'],
  'SW-013': ['zelda-tears-of-the-kingdom'],
  'SW-014': ['zelda-links-awakening', 'legend-of-zelda-links-awakening'],
  'SW-015': ['zelda-skyward-sword-hd', 'legend-of-zelda-skyward-sword-hd'],
  'SW-022': ['super-mario-3d-world-bowsers-fury', 'super-mario-3d-world-+-bowsers-fury'],
  'SW-031': ['mario-strikers-battle-league', 'mario-strikers-battle-league-football'],
  'SW-034': ['luigis-mansion-3'],
  'SW-039': ['kirbys-return-to-dream-land-deluxe'],
  'SW-054': ['yoshis-crafted-world'],
  'SW-075': ['hades'],
  'SW-079': ['undertale'],
  'SW-081': ['ori-and-the-blind-forest-definitive-edition', 'ori-and-the-blind-forest'],
  'SW-088': ['doom-eternal'],
  'SW-091': ['grand-theft-auto-the-trilogy-the-definitive-edition', 'grand-theft-auto-trilogy'],
  'SW-098': ['just-dance-2023-edition', 'just-dance-2023'],
  'SW-100': ['rocket-league-collectors-edition', 'rocket-league'],
  'SW-107': ['starlink-battle-for-atlas-starter-pack', 'starlink-battle-for-atlas'],
  'SW-112': ['mario-and-sonic-at-the-olympic-games-tokyo-2020', 'mario-sonic-at-the-olympic-games-tokyo-2020'],
  'SW-115': ['cadence-of-hyrule', 'cadence-of-hyrule-crypt-of-the-necrodancer'],

  '3DS-001': ['zelda-majoras-mask-3d', 'legend-of-zelda-majoras-mask-3d'],
  '3DS-002': ['zelda-ocarina-of-time-3d', 'legend-of-zelda-ocarina-of-time-3d'],
  '3DS-003': ['zelda-a-link-between-worlds', 'legend-of-zelda-a-link-between-worlds'],
  '3DS-016': ['luigis-mansion-dark-moon', 'luigis-mansion-2'],

  'DS-003': ['pokemon-black-version-2', 'pokemon-black-2'],
  'DS-004': ['pokemon-white-version-2', 'pokemon-white-2'],
  'DS-005': ['pokemon-soulsilver', 'pokemon-soulsilver-version'],
  'DS-006': ['pokemon-heartgold', 'pokemon-heartgold-version'],
  'DS-013': ['mario-and-luigi-bowsers-inside-story', 'mario-luigi-bowsers-inside-story'],
  'DS-014': ['zelda-phantom-hourglass', 'legend-of-zelda-phantom-hourglass'],
  'DS-015': ['zelda-spirit-tracks', 'legend-of-zelda-spirit-tracks'],

  'GB-009': ['super-mario-land-2', 'super-mario-land-2-6-golden-coins'],
  'GB-010': ['zelda-links-awakening', 'legend-of-zelda-links-awakening'],
  'GB-011': ['zelda-links-awakening-dx', 'legend-of-zelda-links-awakening-dx'],
  'GB-012': ['zelda-oracle-of-ages', 'legend-of-zelda-oracle-of-ages'],
  'GB-013': ['zelda-oracle-of-seasons', 'legend-of-zelda-oracle-of-seasons'],
  'GB-014': ['kirbys-dream-land'],
  'GB-018': ['ducktales', 'duck-tales'],
  'GB-021': ['tom-and-jerry'],
  'GB-022': ['blues-brothers', 'the-blues-brothers'],
  'GB-024': ['mysterium'],

  'GBA-006': ['zelda-minish-cap', 'legend-of-zelda-minish-cap'],
  'GBA-007': ['zelda-a-link-to-the-past', 'legend-of-zelda-a-link-to-the-past-four-swords', 'legend-of-zelda-a-link-to-the-past'],
  'GBA-015': ['advance-wars-2-black-hole-rising', 'advance-wars-2'],
  'GBA-017': ['fire-emblem-the-sacred-stones', 'fire-emblem-sacred-stones'],
  'GBA-023': ['yoshis-island-super-mario-advance-3', 'super-mario-advance-3-yoshis-island'],

  'GC-003': ['zelda-wind-waker', 'legend-of-zelda-wind-waker'],
  'GC-004': ['zelda-twilight-princess', 'legend-of-zelda-twilight-princess'],
  'GC-008': ['luigis-mansion'],
  'GC-024': ['eternal-darkness-sanitys-requiem', 'eternal-darkness'],

  'N64-002': ['zelda-ocarina-of-time', 'legend-of-zelda-ocarina-of-time'],
  'N64-003': ['zelda-majoras-mask', 'legend-of-zelda-majoras-mask'],
  'N64-009': ['007-goldeneye', 'goldeneye-007'],
  'N64-013': ['conkers-bad-fur-day'],
  'N64-019': ['star-fox-64', 'lylat-wars'],
  'N64-024': ['harvest-moon-64'],

  'SNES-001': ['zelda-a-link-to-the-past', 'legend-of-zelda-a-link-to-the-past'],
  'SNES-005': ['yoshis-island', 'super-mario-world-2-yoshis-island'],
  'SNES-013': ['kirby-super-star', 'kirbys-fun-pak'],
  'SNES-015': ['star-fox', 'starwing'],
  'SNES-016': ['turtles-in-time', 'teenage-mutant-ninja-turtles-iv-turtles-in-time'],
  'SNES-017': ['contra-iii-the-alien-wars', 'super-probotector-alien-rebels'],
  'SNES-020': ['chrono-trigger'],

  'NES-007': ['kirbys-adventure'],
  'NES-010': ['contra', 'probotector'],
  'NES-011': ['punch-out', 'mike-tysons-punch-out'],
  'NES-015': ['ninja-gaiden'],

  'WII-005': ['zelda-twilight-princess', 'legend-of-zelda-twilight-princess'],
  'WII-006': ['zelda-skyward-sword', 'legend-of-zelda-skyward-sword'],
  'WII-012': ['pokepark-wii-pikachus-adventure', 'pokepark-wii'],
  'WII-016': ['kirbys-return-to-dream-land', 'kirbys-adventure-wii'],

  'WIIU-001': ['zelda-breath-of-the-wild', 'legend-of-zelda-breath-of-the-wild'],
  'WIIU-002': ['zelda-wind-waker-hd', 'legend-of-zelda-wind-waker-hd'],
  'WIIU-003': ['zelda-twilight-princess-hd', 'legend-of-zelda-twilight-princess-hd'],
  'WIIU-005': ['super-smash-bros-for-wii-u'],
  'WIIU-012': ['yoshis-woolly-world'],

  // Consoles
  'CON-001': ['nintendo-switch-oled-white', 'nintendo-switch-oled'],
  'CON-002': ['nintendo-switch-oled-neon-blue-red', 'nintendo-switch-oled-neon'],
  'CON-003': ['nintendo-switch-gray', 'nintendo-switch-v2', 'nintendo-switch-system'],
  'CON-004': ['nintendo-switch-neon', 'nintendo-switch-v2-neon'],
  'CON-007': ['nintendo-switch-lite-gray'],
  'CON-008': ['new-nintendo-2ds-xl'],
  'CON-009': ['new-nintendo-3ds-xl'],
  'CON-010': ['nintendo-ds-lite'],
  'CON-012': ['gameboy-advance-sp'],
  'CON-014': ['gameboy', 'gameboy-system', 'game-boy'],
  'CON-016': ['indigo-gamecube-system', 'purple-gamecube-system'],
  'CON-018': ['super-nintendo'],
  'CON-019': ['nes-console', 'nes'],
  'CON-020': ['wii-system-white', 'white-wii-console', 'wii-console'],
};

// Console platform mapping (non-PAL)
const CONSOLE_PLATFORM_MAP = {
  'CON-001': 'nintendo-switch', 'CON-002': 'nintendo-switch', 'CON-003': 'nintendo-switch',
  'CON-004': 'nintendo-switch', 'CON-005': 'nintendo-switch', 'CON-006': 'nintendo-switch',
  'CON-007': 'nintendo-switch', 'CON-008': 'nintendo-3ds', 'CON-009': 'nintendo-3ds',
  'CON-010': 'nintendo-ds', 'CON-011': 'nintendo-ds', 'CON-012': 'gameboy-advance',
  'CON-013': 'gameboy-color', 'CON-014': 'gameboy', 'CON-015': 'gamecube',
  'CON-016': 'gamecube', 'CON-017': 'nintendo-64', 'CON-018': 'super-nintendo',
  'CON-019': 'nes', 'CON-020': 'wii', 'CON-021': 'wii-u',
};

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
  const match = html.match(/VGPC\.chart_data\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return null;
  try {
    const chartData = JSON.parse(match[1]);
    const prices = {};
    for (const [type, dataPoints] of Object.entries(chartData)) {
      if (!Array.isArray(dataPoints) || dataPoints.length === 0) continue;
      for (let i = dataPoints.length - 1; i >= 0; i--) {
        if (dataPoints[i][1] > 0) {
          prices[type] = dataPoints[i][1];
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
  return Math.round(cents / 50) * 50;
}

function formatEuro(cents) {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

async function main() {
  console.log(`\n=== Retry Price Fetch (non-PAL fallback) ===`);
  console.log(`Products to retry: ${failures.length}\n`);

  let fixed = 0;
  let stillFailed = [];

  for (const fail of failures) {
    const product = products.find(p => p.sku === fail.sku);
    if (!product) continue;

    process.stdout.write(`[${fail.sku}] ${fail.name}`);

    // Get non-PAL platform
    const nonPalPlatform = product.isConsole
      ? CONSOLE_PLATFORM_MAP[product.sku]
      : NON_PAL_PLATFORM_MAP[product.platform];

    if (!nonPalPlatform) {
      console.log(` → SKIP: no platform`);
      stillFailed.push(fail);
      continue;
    }

    // Try alternative slugs
    const slugs = ALT_SLUGS[fail.sku] || [fail.url.split('/').pop()];
    let foundPrices = null;
    let foundUrl = null;

    for (const slug of slugs) {
      const url = `https://www.pricecharting.com/game/${nonPalPlatform}/${slug}`;
      const { body, httpCode } = fetchPage(url);

      if (httpCode === 200 && body) {
        const prices = extractPrices(body);
        if (prices && (prices.used || prices.cib)) {
          foundPrices = prices;
          foundUrl = url;
          break;
        }
      }
      sleep(400);
    }

    if (foundPrices) {
      const basePrice = foundPrices.used || foundPrices.cib || 0;
      const tradeIn = roundToNearest50Cents(Math.round(basePrice * TRADE_IN_PERCENTAGE));

      // Update product in memory
      product.inkoopPrijs = tradeIn / 100;
      product.pcUsedPrice = foundPrices.used ? foundPrices.used / 100 : null;

      console.log(` → OK: Loose: ${formatEuro(foundPrices.used || 0)} | Inkoop: ${formatEuro(tradeIn)}`);
      fixed++;
    } else {
      console.log(` → STILL FAILED`);
      stillFailed.push(fail);
    }

    sleep(500);
  }

  // Save updated products
  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));

  console.log(`\n=== RESULTS ===`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Still failed: ${stillFailed.length}`);

  if (stillFailed.length > 0) {
    console.log(`\nStill missing prices:`);
    for (const f of stillFailed) {
      console.log(`  ${f.sku} - ${f.name}`);
    }
    fs.writeFileSync(
      path.join(process.cwd(), 'price-still-missing.json'),
      JSON.stringify(stillFailed, null, 2)
    );
  }
}

main().catch(console.error);
