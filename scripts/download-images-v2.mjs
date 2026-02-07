/**
 * Download official box art for all products - V2 (strict cover art selection)
 *
 * Improvements over V1:
 * - STRICT filename matching: only accept images with game name words in filename
 * - Cover art priority: bonus for "cover", "box", "boxart" in filename
 * - Aspect ratio check: reject screenshots (wider than 1.8:1 original)
 * - Manual overrides for known problematic games
 * - Paired game handling (Pokémon versions)
 * - Never falls back to random images
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'));
const OUTPUT_DIR = './public/images/products';
const THUMB_SIZE = 500;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ---- Manual override mappings ----
// product slug -> exact Wikipedia File: title
const MANUAL_OVERRIDES = {
  // Pokémon paired games - need individual covers
  'sw-001-pokmon-brilliant-diamond': 'File:Pokemon Brilliant Diamond Cover Art.png',
  'sw-002-pokmon-shining-pearl': 'File:Pokemon Shining Pearl Cover Art.png',
  'sw-003-pokmon-sword': 'File:Pokemon Sword Cover Art.jpg',
  'sw-004-pokmon-shield': 'File:Pokemon Shield Cover Art.jpg',
  'sw-005-pokmon-scarlet': 'File:Pok%C3%A9mon_Scarlet_box_art.png',
  'sw-006-pokmon-violet': 'File:Pok%C3%A9mon_Violet_box_art.png',
  'sw-007-pokmon-lets-go-pikachu': 'File:Pokemon Lets Go Pikachu cover art.png',
  'sw-008-pokmon-lets-go-eevee': 'File:Pokemon Lets Go Eevee cover art.png',
  'sw-011-new-pokmon-snap': 'File:New Pokemon Snap cover.jpg',
  'sw-034-luigis-mansion-3': "File:Luigi's Mansion 3 cover art.jpg",
  'sw-035-super-smash-bros-ultimate': 'File:Super Smash Bros. Ultimate.jpg',
  'sw-037-kirby-en-de-vergeten-wereld': 'File:Kirby and the Forgotten Land cover.jpg',
  'sw-041-splatoon-2': 'File:Splatoon 2 NA box art.jpg',
  'sw-042-splatoon-3': 'File:Splatoon 3 box art.png',
  'sw-046-pikmin-3-deluxe': 'File:Pikmin 3 Deluxe cover.png',
  'sw-047-pikmin-4': 'File:Pikmin 4 cover art.jpg',
  'sw-048-xenoblade-chronicles-definitive-edition': 'File:Xenoblade Chronicles Definitive Edition.png',
  'sw-067-monster-hunter-rise': 'File:Monster Hunter Rise cover art.jpg',
  'sw-083-crash-bandicoot-n-sane-trilogy': 'File:Crash Bandicoot N. Sane Trilogy cover art.jpg',
  'sw-022-super-mario-3d-world-bowsers-fury': "File:Super Mario 3D World + Bowser's Fury box art.png",
  'sw-025-super-mario-rpg': 'File:Super Mario RPG 2023 cover.jpg',
  'sw-017-hyrule-warriors-definitive-edition': 'File:Hyrule Warriors Definitive Edition box art.png',
  'sw-021-new-super-mario-bros-u-deluxe': 'File:New Super Mario Bros. U Deluxe.jpg',
  'sw-040-donkey-kong-country-tropical-freeze': 'File:DK Tropical Freeze Switch cover.jpg',
  'sw-058-ring-fit-adventure': 'File:Ring Fit Adventure.jpg',
  'sw-091-gta-the-trilogy': 'File:Grand Theft Auto The Trilogy - The Definitive Edition cover.png',
  'sw-049-xenoblade-chronicles-2': 'File:Xenoblade Chronicles 2 cover art.png',
  'sw-050-xenoblade-chronicles-3': 'File:Xenoblade Chronicles 3 cover art.png',
  'sw-014-zelda-links-awakening': "File:The Legend of Zelda Link's Awakening (2019 video game).png",
  'sw-112-mario-sonic-olympische-spelen': 'File:Mario & Sonic at the Olympic Games Tokyo 2020.jpg',

  // Pokémon DS
  'ds-001-pokmon-black': 'File:Pokemon black box art.png',
  'ds-002-pokmon-white': 'File:Pokemon white box art.png',
  'ds-003-pokmon-black-2': 'File:Pokemon Black 2 cover.png',
  'ds-004-pokmon-white-2': 'File:Pokemon White 2 cover.png',
  'ds-005-pokmon-soulsilver': 'File:Pokemon SoulSilver cover.png',
  'ds-006-pokmon-heartgold': 'File:Pokemon HeartGold cover.png',
  'ds-007-pokmon-platinum': 'File:Pokemon Platinum cover.png',
  'ds-008-pokmon-diamond': 'File:Pokemon diamond cover.png',
  'ds-009-pokmon-pearl': 'File:Pokemon Pearl cover.png',

  // Pokémon 3DS
  '3ds-004-pokmon-x': 'File:Pokemon X cover.png',
  '3ds-005-pokmon-y': 'File:Pokemon Y cover.png',
  '3ds-006-pokmon-sun': 'File:Pokemon Sun cover art.png',
  '3ds-007-pokmon-moon': 'File:Pokemon Moon cover art.png',
  '3ds-008-pokmon-ultra-sun': 'File:Pokemon Ultra Sun cover art.png',
  '3ds-009-pokmon-ultra-moon': 'File:Pokemon Ultra Moon cover art.png',
  '3ds-010-pokmon-alpha-sapphire': 'File:Pokemon Alpha Sapphire cover.png',
  '3ds-011-pokmon-omega-ruby': 'File:Pokemon Omega Ruby cover.png',

  // Pokémon Game Boy
  'gb-001-pokmon-red': 'File:PokemonRedBox.png',
  'gb-002-pokmon-blue': 'File:PokemonBlueBox.png',
  'gb-003-pokmon-yellow': 'File:PokemonYellowBox.png',
  'gb-004-pokmon-gold': 'File:Pokemon Gold box art.png',
  'gb-005-pokmon-silver': 'File:Pokemon Silver box art.png',
  'gb-006-pokmon-crystal': 'File:Pokemon Crystal box art.png',

  // Pokémon GBA
  'gba-001-pokmon-ruby': 'File:Pokemon Ruby box art.png',
  'gba-002-pokmon-sapphire': 'File:Pokemon Sapphire box art.png',
  'gba-003-pokmon-emerald': 'File:Pokemon Emerald box art.png',
  'gba-004-pokmon-firered': 'File:Pokemon FireRed box art.png',
  'gba-005-pokmon-leafgreen': 'File:Pokemon LeafGreen box art.png',

  // Retro games with wrong version
  'gc-005-super-smash-bros-melee': 'File:Super Smash Bros Melee box art.png',
  'snes-009-super-metroid': 'File:Super Metroid box art.jpg',
  'snes-001-zelda-a-link-to-the-past': "File:The Legend of Zelda A Link to the Past SNES Game Cover.jpg",
  'n64-009-goldeneye-007': 'File:GoldenEye007box.jpg',
  'n64-004-mario-kart-64': 'File:Mario Kart 64 box art.jpg',
  'gba-008-mario-kart-super-circuit': 'File:Mario Kart Super Circuit Box Art.jpg',
  'gba-006-zelda-the-minish-cap': 'File:The Legend of Zelda The Minish Cap Game Cover.JPG',
  'gb-010-zelda-links-awakening': "File:Links Awakening box.jpg",
  'wii-008-wii-sports': 'File:Wii Sports Europe.jpg',

  // Consoles - specific colors/models
  'con-003-nintendo-switch-v2-grijs': 'File:Nintendo Switch Console.png',
  'con-005-nintendo-switch-lite-geel': 'File:Nintendo Switch Lite Yellow.png',
  'con-008-new-nintendo-2ds-xl': 'File:New Nintendo 2DS XL.png',
  'con-015-gamecube-zwart': 'File:Nintendo GameCube Black.png',
  'con-017-nintendo-64-grijs': 'File:Nintendo-64-Console.png',
  'con-019-nes': 'File:NES-Console-Set.png',
  'con-020-nintendo-wii-wit': 'File:Wii console.png',
  'con-021-nintendo-wii-u-32gb': 'File:Wii U Console and Gamepad.png',
};

// ---- Utility ----

function curlJSON(url) {
  try {
    const result = execSync(`curl -sL --max-time 15 "${url}"`, { encoding: 'utf-8', timeout: 20000 });
    return JSON.parse(result);
  } catch { return null; }
}

function curlBinary(url, outPath) {
  try {
    execSync(`curl -sL --max-time 30 -o "${outPath}" "${url}"`, { timeout: 35000 });
    return fs.existsSync(outPath) && fs.statSync(outPath).size > 500;
  } catch { return false; }
}

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

function normalizeForMatch(str) {
  return str.toLowerCase()
    .replace(/[éèê]/g, 'e')
    .replace(/[áàâ]/g, 'a')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòô]/g, 'o')
    .replace(/[úùû]/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- Wikipedia API helpers ----

function wikiSearch(query) {
  const encoded = encodeURIComponent(query);
  const data = curlJSON(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srlimit=5&format=json`);
  return data?.query?.search?.map(s => s.title) || [];
}

function wikiPageImages(title) {
  const encoded = encodeURIComponent(title);
  const data = curlJSON(`https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=images&imlimit=50&format=json`);
  if (!data?.query?.pages) return [];
  const pages = Object.values(data.query.pages);
  return pages.flatMap(p => (p.images || []).map(i => i.title));
}

function wikiImageUrl(fileTitle) {
  const encoded = encodeURIComponent(fileTitle);
  const data = curlJSON(`https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_SIZE}&format=json`);
  if (!data?.query?.pages) return null;
  const pages = Object.values(data.query.pages);
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (info) return info.thumburl || info.url;
  }
  return null;
}

// ---- Strict image selection ----

const EXCLUDED_PATTERNS = [
  'star_full', 'star_half', 'star_empty', 'commons-logo', 'wikidata',
  'edit-clear', 'ambox', 'question_book', 'text-x', 'folder_hexagonal',
  'padlock', 'crystal_clear', 'red_pencil', 'nuvola', 'gnome', 'disambig',
  'audio', 'speaker', 'headphones', 'flag_of', 'location', 'wiki',
  'icon', '.svg', 'wpvg', 'portal', 'open_access', 'lock-', 'symbol_of',
  'internet_archive', 'logo', 'olympic_rings', 'pencil_icon', 'increase',
  'decrease', 'steady', 'red_pog', 'blue_pog', 'green_pog', 'circle_arrows',
  'information_icon', 'merge-', 'split-', 'generic', 'sf_-_', 'science_fiction',
];

function scoreImage(fileTitle, productName, platform) {
  const fileLower = normalizeForMatch(fileTitle);
  const nameLower = normalizeForMatch(productName);
  const nameWords = nameLower.split(' ').filter(w => w.length > 2);

  // Immediately reject excluded patterns
  for (const ex of EXCLUDED_PATTERNS) {
    if (fileTitle.toLowerCase().includes(ex)) return -100;
  }

  // Must be a raster image
  if (!fileTitle.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i)) return -100;

  let score = 0;

  // Count matching words from product name in filename
  let matchedWords = 0;
  for (const word of nameWords) {
    if (fileLower.includes(word)) {
      matchedWords++;
      score += 3;
    }
  }

  // REQUIRE at least 2 matching words (or 1 for short names)
  const minRequired = nameWords.length <= 2 ? 1 : 2;
  if (matchedWords < minRequired) return -50;

  // Big bonus for "cover", "box", "boxart", "packaging"
  if (fileLower.includes('cover') || fileLower.includes('box')) score += 15;
  if (fileLower.includes('boxart') || fileLower.includes('packaging')) score += 15;

  // Bonus for containing the platform name
  const platLower = normalizeForMatch(platform);
  if (fileLower.includes(platLower)) score += 5;

  // Penalty for containing words suggesting it's a screenshot
  if (fileLower.includes('screenshot') || fileLower.includes('gameplay')) score -= 20;

  // Penalty for containing a different platform name (wrong version)
  const otherPlatforms = ['playstation', 'ps2', 'ps3', 'ps4', 'xbox', 'sega'];
  for (const p of otherPlatforms) {
    if (fileLower.includes(p)) score -= 10;
  }

  return score;
}

function pickBestImage(fileTitles, productName, platform) {
  let bestScore = 4; // Minimum threshold - must score above this
  let bestImage = null;

  for (const file of fileTitles) {
    const score = scoreImage(file, productName, platform);
    if (score > bestScore) {
      bestScore = score;
      bestImage = file;
    }
  }

  return bestImage;
}

// ---- Image processing with aspect ratio check ----

async function downloadAndProcess(imgUrl, outputPath) {
  const tmpPath = outputPath + '.tmp';

  if (!curlBinary(imgUrl, tmpPath)) return false;

  try {
    // Check original dimensions BEFORE processing
    const meta = await sharp(tmpPath).metadata();
    const ratio = meta.width / meta.height;

    // Reject likely screenshots (very wide)
    if (ratio > 1.8) {
      fs.unlinkSync(tmpPath);
      return false;
    }

    // Process: resize to 500x500, white background, webp
    await sharp(tmpPath)
      .resize(THUMB_SIZE, THUMB_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 85 })
      .toFile(outputPath);

    fs.unlinkSync(tmpPath);
    return true;
  } catch (err) {
    try { fs.unlinkSync(tmpPath); } catch {}
    return false;
  }
}

// ---- Search queries for Wikipedia ----

function buildSearchQueries(product) {
  const { name, platform, isConsole } = product;
  const queries = [];

  if (isConsole) {
    const base = name.replace(/ - .*$/, '').trim();
    queries.push(`${base} console`);
    queries.push(base);
  } else {
    // Try exact game name with "video game" qualifier
    if (name.startsWith('Zelda:')) {
      const full = name.replace('Zelda:', 'The Legend of Zelda:');
      queries.push(`${full} video game`);
      queries.push(full);
    }
    queries.push(`${name} video game`);
    queries.push(`${name} ${platform}`);
    queries.push(name);
    if (name.includes('Pokémon')) {
      queries.push(name.replace('Pokémon', 'Pokemon') + ' video game');
    }
  }

  return queries;
}

// ---- Main download logic ----

async function downloadOneProduct(product) {
  const outputPath = path.join(OUTPUT_DIR, `${product.slug}.webp`);

  if (fs.existsSync(outputPath)) return 'exists';

  // 1. Try manual override first
  if (MANUAL_OVERRIDES[product.slug]) {
    const fileTitle = MANUAL_OVERRIDES[product.slug];
    const imgUrl = wikiImageUrl(fileTitle);
    if (imgUrl) {
      const ok = await downloadAndProcess(imgUrl, outputPath);
      if (ok) return 'override';
    }
    // If override fails, fall through to regular search
  }

  // 2. Regular Wikipedia search with strict filtering
  const queries = buildSearchQueries(product);

  for (const query of queries) {
    const titles = wikiSearch(query);

    for (const title of titles.slice(0, 3)) {
      const images = wikiPageImages(title);
      if (images.length === 0) continue;

      const bestImage = pickBestImage(images, product.name, product.platform);
      if (!bestImage) continue;

      const imgUrl = wikiImageUrl(bestImage);
      if (!imgUrl) continue;

      const ok = await downloadAndProcess(imgUrl, outputPath);
      if (ok) return 'downloaded';
    }

    sleep(200);
  }

  return 'failed';
}

// ---- Main ----

async function main() {
  console.log(`Downloading box art for ${products.length} products (V2 - strict mode)...\n`);

  const results = { override: 0, downloaded: 0, exists: 0, failed: 0, failedList: [] };

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const status = await downloadOneProduct(product);

    if (status === 'override') {
      results.override++;
      console.log(`[${i + 1}/${products.length}] ★ ${product.name} (override)`);
    } else if (status === 'downloaded') {
      results.downloaded++;
      console.log(`[${i + 1}/${products.length}] ✓ ${product.name}`);
    } else if (status === 'exists') {
      results.exists++;
      console.log(`[${i + 1}/${products.length}] ○ ${product.name} (exists)`);
    } else {
      results.failed++;
      results.failedList.push(product);
      console.log(`[${i + 1}/${products.length}] ✗ ${product.name}`);
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Override: ${results.override}`);
  console.log(`Downloaded: ${results.downloaded}`);
  console.log(`Already existed: ${results.exists}`);
  console.log(`Failed: ${results.failed}`);

  if (results.failedList.length > 0) {
    fs.writeFileSync('./scripts/failed-images.json', JSON.stringify(
      results.failedList.map(p => ({ name: p.name, slug: p.slug, platform: p.platform })),
      null, 2
    ));
    console.log('\nFailed products:');
    results.failedList.forEach(f => console.log(`  - ${f.name} (${f.platform})`));
    console.log('Failed list saved to scripts/failed-images.json');
  }

  // Update products.json with image paths
  const updated = products.map(p => ({
    ...p,
    image: fs.existsSync(path.join(OUTPUT_DIR, `${p.slug}.webp`)) ? `/images/products/${p.slug}.webp` : null
  }));
  fs.writeFileSync('./src/data/products.json', JSON.stringify(updated, null, 2));
  console.log('\nproducts.json updated with image paths.');
}

main().catch(console.error);
