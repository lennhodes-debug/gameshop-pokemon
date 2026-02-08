#!/usr/bin/env node
/**
 * Downloads cover art from Wikipedia API for all missing products.
 * Uses the REST API to get image URLs, then downloads and converts to WebP.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
const imgDir = path.join(__dirname, '..', 'public', 'images', 'products');
const tempDir = path.join(__dirname, '..', '.cover-art-temp');

// Wikipedia article names for each missing product
const WIKI_MAPPING = {
  // Games
  '3DS-065': 'Yo-Kai_Watch_2',
  'DS-023': 'Mario_%26_Sonic_at_the_Olympic_Games',
  'DS-057': 'Professor_Layton_and_the_Curious_Village',
  'DS-066': 'WarioWare:_Touched!',
  'GBA-010': 'Drill_Dozer',
  'GBA-012': 'Final_Fantasy_I_%26_II:_Dawn_of_Souls',
  'GBA-038': 'Mother_3',
  'GBA-060': 'Super_Mario_Advance_3:_Yoshi%27s_Island',
  'GBA-065': 'Super_Mario_Advance_3:_Yoshi%27s_Island',
  'GB-015': 'Game_%26_Watch_Gallery_3',
  'GB-019': 'Kirby%27s_Dream_Land',
  'GB-026': 'Metal_Gear:_Ghost_Babel',
  'GB-053': 'Tetris_DX',
  'GC-009': 'Eternal_Darkness:_Sanity%27s_Requiem',
  'GC-010': 'Eternal_Darkness:_Sanity%27s_Requiem',
  'GC-030': 'Naruto:_Clash_of_Ninja_2',
  'GC-042': 'Resident_Evil_4',
  'N64-023': 'Kirby_64:_The_Crystal_Shards',
  'N64-036': 'Pilotwings_64',
  'N64-048': 'Star_Fox_64',
  'SNES-013': 'EarthBound',
  'SNES-015': 'Final_Fantasy_V',
  'SNES-016': 'Final_Fantasy_VI',
  'SNES-028': 'Mortal_Kombat_3',
  'SNES-029': 'Mortal_Kombat_II',
  'SNES-038': 'SimCity_(SNES)',
  'SNES-052': 'Tetris_%26_Dr._Mario',
  'SNES-056': 'Top_Gear_(video_game)',
  'SNES-057': 'Teenage_Mutant_Ninja_Turtles:_Turtles_in_Time',
  'NES-006': 'Balloon_Fight',
  'NES-022': 'Duck_Hunt',
  'NES-025': 'Final_Fantasy_(video_game)',
  'NES-041': 'Ninja_Gaiden_II:_The_Dark_Sword_of_Chaos',
  'NES-047': 'StarTropics',
  'WII-018': 'Kirby%27s_Epic_Yarn',
  'WII-052': 'Wii_Fit',
  'WII-053': 'Wii_Fit_Plus',
  'WIIU-005': 'Axiom_Verge',
  'WIIU-009': 'Donkey_Kong_Country:_Tropical_Freeze',
  'WIIU-048': 'Wii_Fit_U',
  'WIIU-055': 'The_Legend_of_Zelda:_The_Wind_Waker_HD',
  'SW-021': 'Donkey_Kong_Country:_Tropical_Freeze',
  'SW-023': 'Doom_Eternal',
  'SW-028': 'Final_Fantasy_X/X-2_HD_Remaster',
  'SW-078': 'Pok%C3%A9mon:_Let%27s_Go,_Pikachu!_and_Let%27s_Go,_Eevee!',
  'SW-088': 'Pok%C3%A9mon:_Let%27s_Go,_Pikachu!_and_Let%27s_Go,_Eevee!',
  'SW-099': 'The_Elder_Scrolls_V:_Skyrim',
  'SW-117': 'The_Witcher_3:_Wild_Hunt',
  'SW-126': 'The_Legend_of_Zelda:_Link%27s_Awakening_(2019_video_game)',
  // Consoles
  'CON-014': 'New_Nintendo_3DS',
  'CON-020': 'Nintendo_DSi',
  'CON-022': 'Nintendo_DSi',
  'CON-023': 'Nintendo_DSi',
  'CON-043': 'Wii',
  // Accessories
  'ACC-001': 'Nintendo_Switch',
  'ACC-002': 'Nintendo_Switch',
  'ACC-003': 'Nintendo_3DS',
  'ACC-004': 'Nintendo_DSi',
  'ACC-005': 'Nintendo_DS_Lite',
  'ACC-006': 'Game_Boy_Advance_SP',
  'ACC-007': 'Wii',
  'ACC-008': 'Wii_U',
  'ACC-009': 'Wii_U_GamePad',
  'ACC-010': 'GameCube',
  'ACC-012': 'Super_Nintendo_Entertainment_System',
  'ACC-013': 'Nintendo_Entertainment_System',
  'ACC-014': 'Joy-Con',
  'ACC-015': 'Joy-Con',
  'ACC-016': 'Joy-Con',
  'ACC-017': 'Nintendo_Switch_Pro_Controller',
  'ACC-018': 'Wii_Remote',
  'ACC-019': 'Wii_Remote_Plus',
  'ACC-020': 'Nunchuk_(Wii)',
  'ACC-021': 'Classic_Controller',
  'ACC-022': 'Classic_Controller',
  'ACC-024': 'GameCube_controller',
  'ACC-025': 'WaveBird_Wireless_Controller',
  'ACC-026': 'Nintendo_64_controller',
  'ACC-027': 'Super_Nintendo_Entertainment_System',
  'ACC-028': 'Nintendo_Entertainment_System',
  'ACC-029': 'Wii',
  'ACC-030': 'Wii',
  'ACC-031': 'Wii',
  'ACC-032': 'GameCube',
  'ACC-033': 'Nintendo_64',
  'ACC-034': 'Super_Nintendo_Entertainment_System',
  'ACC-035': 'Nintendo_Entertainment_System',
  'ACC-036': 'Game_Boy',
  'ACC-037': 'Game_Boy_Advance',
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getWikiImageUrl(articleName) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${articleName}`;
    const result = execSync(
      `curl -s -L -H "User-Agent: GameShop/1.0" "${url}" 2>/dev/null`,
      { timeout: 15000, encoding: 'utf-8' }
    );
    const data = JSON.parse(result);
    if (data.originalimage && data.originalimage.source) {
      return data.originalimage.source;
    }
    if (data.thumbnail && data.thumbnail.source) {
      // Get higher res version
      return data.thumbnail.source.replace(/\/\d+px-/, '/500px-');
    }
    return null;
  } catch (e) {
    return null;
  }
}

function downloadImage(url, outputPath) {
  try {
    execSync(
      `curl -s -L -H "User-Agent: GameShop/1.0" -o "${outputPath}" "${url}" 2>/dev/null`,
      { timeout: 30000 }
    );
    const stats = fs.statSync(outputPath);
    if (stats.size < 1000) {
      fs.unlinkSync(outputPath);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function convertToWebp(inputPath, outputPath) {
  try {
    // Use sharp via node
    const result = execSync(
      `node -e "const sharp = require('sharp'); sharp('${inputPath}').resize(500, 500, {fit: 'cover'}).webp({quality: 85}).toFile('${outputPath}').then(() => console.log('OK')).catch(e => console.log('FAIL: ' + e.message))"`,
      { timeout: 30000, encoding: 'utf-8' }
    );
    return result.trim() === 'OK';
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('=== WIKIPEDIA COVER ART MASS DOWNLOADER ===\n');

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  const missing = products.filter(p => p.image === null || !p.image);

  console.log(`Missing products: ${missing.length}`);
  console.log(`Wikipedia mappings: ${Object.keys(WIKI_MAPPING).length}\n`);

  let downloaded = 0;
  let converted = 0;
  let failed = 0;
  const results = [];

  for (const product of missing) {
    const wikiArticle = WIKI_MAPPING[product.sku];
    if (!wikiArticle) {
      console.log(`SKIP ${product.sku}: No Wikipedia mapping`);
      failed++;
      continue;
    }

    // Get image URL from Wikipedia
    process.stdout.write(`${product.sku} ${product.name.substring(0, 30).padEnd(30)} `);
    const imageUrl = getWikiImageUrl(wikiArticle);

    if (!imageUrl) {
      console.log('NO IMAGE');
      failed++;
      continue;
    }

    // Download
    const ext = imageUrl.split('.').pop().split('?')[0].toLowerCase();
    const tempFile = path.join(tempDir, `${product.sku.toLowerCase()}-temp.${ext}`);
    const success = downloadImage(imageUrl, tempFile);

    if (!success) {
      console.log('DOWNLOAD FAILED');
      failed++;
      continue;
    }

    downloaded++;

    // Convert to WebP
    const slug = product.slug || product.sku.toLowerCase() + '-' + product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const webpFile = path.join(imgDir, `${slug}.webp`);
    const convertSuccess = convertToWebp(tempFile, webpFile);

    if (convertSuccess && fs.existsSync(webpFile)) {
      const size = fs.statSync(webpFile).size;
      console.log(`OK (${(size/1024).toFixed(1)}KB)`);
      converted++;

      // Update product reference
      product.image = `/images/products/${slug}.webp`;
      results.push({ sku: product.sku, name: product.name, image: product.image });
    } else {
      console.log('CONVERT FAILED');
      failed++;
    }

    // Clean temp file
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

    // Rate limit
    await sleep(200);
  }

  // Save updated products.json
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  console.log('\n=== RESULTS ===');
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Converted: ${converted}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total images now: ${products.filter(p => p.image).length}/${products.length}`);

  if (results.length > 0) {
    console.log('\nSuccessfully added:');
    results.forEach(r => console.log(`  ${r.sku}: ${r.name}`));
  }
}

main().catch(console.error);
