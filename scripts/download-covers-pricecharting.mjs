#!/usr/bin/env node

/**
 * Download PAL/European cover arts from PriceCharting
 *
 * For each product:
 * 1. Construct PriceCharting PAL URL
 * 2. Fetch the page HTML
 * 3. Extract the cover art image URL
 * 4. Download at high resolution
 * 5. Convert to WebP with sharp
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/products.json');
const IMAGES_DIR = path.join(process.cwd(), 'public/images/products');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));

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

// Manual PriceCharting slug overrides for games with non-standard names
// Format: "SKU" → "pricecharting-game-slug" (without platform prefix)
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
  'SW-037': 'kirby-and-the-forgotten-land', // Dutch name "Kirby en de Vergeten Wereld"
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
  'SW-110': 'cars-3-driven-to-win', // Dutch name
  'SW-111': 'dragon-quest-builders-2',
  'SW-112': 'mario-and-sonic-at-the-olympic-games-tokyo-2020', // Dutch name
  'SW-113': 'pikmin-1-+-2',
  'SW-115': 'cadence-of-hyrule',

  // === 3DS GAMES ===
  '3DS-001': 'legend-of-zelda-majoras-mask-3d',
  '3DS-002': 'legend-of-zelda-ocarina-of-time-3d',
  '3DS-003': 'legend-of-zelda-a-link-between-worlds',
  '3DS-014': 'super-smash-bros-for-nintendo-3ds',
  '3DS-016': 'luigis-mansion-dark-moon', // PAL name "Luigi's Mansion 2"
  '3DS-023': 'donkey-kong-country-returns-3d',

  // === DS GAMES ===
  'DS-013': 'mario-and-luigi-bowsers-inside-story',
  'DS-014': 'legend-of-zelda-phantom-hourglass',
  'DS-015': 'legend-of-zelda-spirit-tracks',
  'DS-016': 'professor-layton-and-the-curious-village', // Dutch name
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
  'SNES-013': 'kirby-super-star', // PAL name "Kirby's Fun Pak" but PC uses US name
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
  'WII-016': 'kirbys-return-to-dream-land', // PAL: "Kirby's Adventure Wii"
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

// Console platform override (consoles use the console's own platform, not the product platform)
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

  if (!platformSlug) {
    console.error(`  No platform mapping for: ${product.platform}`);
    return null;
  }

  const gameSlug = SLUG_OVERRIDES[product.sku] || slugifyName(product.name);
  return `https://www.pricecharting.com/game/${platformSlug}/${gameSlug}`;
}

function extractImageUrl(html) {
  // Extract all PriceCharting image URLs from the HTML
  const allUrls = html.match(/https:\/\/storage\.googleapis\.com\/images\.pricecharting\.com\/[^\s"'<>]+/g);
  if (!allUrls || allUrls.length === 0) return null;

  // Prefer 1600px version (highest quality)
  const fullRes = allUrls.find(u => u.endsWith('/1600.jpg'));
  if (fullRes) return fullRes;

  // Fall back to 240px
  const thumb = allUrls.find(u => u.endsWith('/240.jpg'));
  if (thumb) return thumb;

  // Return first found
  return allUrls[0];
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

function downloadImage(url, outputPath) {
  try {
    execSync(
      `curl -sL -o "${outputPath}" --max-time 20 -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`,
      { encoding: 'utf-8' }
    );
    const stat = fs.statSync(outputPath);
    return stat.size > 1000; // Must be at least 1KB
  } catch (e) {
    return false;
  }
}

async function convertToWebp(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 85 })
      .toFile(outputPath);
    return true;
  } catch (e) {
    console.error(`  Sharp error: ${e.message}`);
    return false;
  }
}

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

async function main() {
  console.log(`\n=== PriceCharting PAL Cover Art Downloader ===`);
  console.log(`Products: ${products.length}`);
  console.log(`Images dir: ${IMAGES_DIR}\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const tmpDir = path.join(process.cwd(), 'tmp-covers');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const results = { success: 0, failed: 0, skipped: 0, errors: [] };

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const slug = product.slug;
    const outputPath = path.join(IMAGES_DIR, `${slug}.webp`);

    console.log(`[${i + 1}/${products.length}] ${product.sku} - ${product.name} (${product.platform})`);

    const url = getPriceChartingUrl(product);
    if (!url) {
      console.log(`  SKIP: No URL mapping`);
      results.skipped++;
      results.errors.push({ sku: product.sku, name: product.name, reason: 'No URL mapping' });
      continue;
    }

    console.log(`  URL: ${url}`);

    // Fetch the page
    const { body, httpCode } = fetchPage(url);

    if (httpCode !== 200 || !body) {
      console.log(`  FAIL: HTTP ${httpCode}`);
      results.failed++;
      results.errors.push({ sku: product.sku, name: product.name, url, reason: `HTTP ${httpCode}` });
      sleep(300);
      continue;
    }

    // Extract image URL
    const imageUrl = extractImageUrl(body);
    if (!imageUrl) {
      console.log(`  FAIL: No image found on page`);
      results.failed++;
      results.errors.push({ sku: product.sku, name: product.name, url, reason: 'No image in HTML' });
      sleep(300);
      continue;
    }

    console.log(`  Image: ${imageUrl.substring(0, 80)}...`);

    // Download the image
    const tmpPath = path.join(tmpDir, `${slug}.jpg`);
    const downloaded = downloadImage(imageUrl, tmpPath);

    if (!downloaded) {
      console.log(`  FAIL: Download failed`);
      results.failed++;
      results.errors.push({ sku: product.sku, name: product.name, url, imageUrl, reason: 'Download failed' });
      sleep(300);
      continue;
    }

    // Convert to WebP
    const converted = await convertToWebp(tmpPath, outputPath);
    if (converted) {
      console.log(`  OK: Saved to ${slug}.webp`);
      results.success++;
    } else {
      console.log(`  FAIL: WebP conversion failed`);
      results.failed++;
      results.errors.push({ sku: product.sku, name: product.name, reason: 'WebP conversion failed' });
    }

    // Clean up tmp file
    try { fs.unlinkSync(tmpPath); } catch {}

    // Rate limit: 400ms between requests
    sleep(400);
  }

  // Also handle duplicate Pokemon slugs (pok-mon variants)
  console.log(`\n--- Handling Pokemon slug duplicates ---`);
  for (const product of products) {
    if (product.slug.includes('pokmon')) {
      const altSlug = product.slug.replace(/pokmon/g, 'pok-mon');
      const srcPath = path.join(IMAGES_DIR, `${product.slug}.webp`);
      const altPath = path.join(IMAGES_DIR, `${altSlug}.webp`);
      if (fs.existsSync(srcPath) && !fs.existsSync(altPath)) {
        fs.copyFileSync(srcPath, altPath);
        console.log(`  Copied: ${altSlug}.webp`);
      }
    }
  }

  // Summary
  console.log(`\n=== RESULTS ===`);
  console.log(`Success: ${results.success}`);
  console.log(`Failed:  ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Total:   ${products.length}`);

  if (results.errors.length > 0) {
    const failPath = path.join(process.cwd(), 'cover-download-failures.json');
    fs.writeFileSync(failPath, JSON.stringify(results.errors, null, 2));
    console.log(`\nFailures saved to: ${failPath}`);
  }

  // Cleanup tmp dir
  try { fs.rmdirSync(tmpDir); } catch {}
}

main().catch(console.error);
