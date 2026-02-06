/**
 * Download official box art for all products using Wikipedia MediaWiki API
 * Uses curl for HTTP (Node.js DNS doesn't work in this env) and sharp for processing
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'));
const OUTPUT_DIR = './public/images/products';
const THUMB_SIZE = 500;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

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

// ---- Wikipedia search strategies ----

function buildSearchQueries(product) {
  const { name, platform, isConsole } = product;
  const queries = [];

  if (isConsole) {
    const base = name.replace(/ - .*$/, '').trim();
    queries.push(`${base} console`);
    queries.push(base);
  } else {
    // Full name with "video game" qualifier
    queries.push(`${name} video game`);
    // Name with platform
    queries.push(`${name} ${platform}`);
    // Just name
    queries.push(name);
    // Special: Zelda games have "The Legend of Zelda" prefix on Wikipedia
    if (name.startsWith('Zelda:')) {
      queries.push(name.replace('Zelda:', 'The Legend of Zelda:'));
    }
    // Special: Pokémon -> Pokemon (ASCII)
    if (name.includes('Pokémon')) {
      queries.push(name.replace('Pokémon', 'Pokemon') + ' video game');
    }
  }
  return queries;
}

// Get the first Wikipedia page title from a search
function wikiSearch(query) {
  const encoded = encodeURIComponent(query);
  const data = curlJSON(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srlimit=5&format=json`);
  return data?.query?.search?.map(s => s.title) || [];
}

// Get all image file names on a Wikipedia page
function wikiPageImages(title) {
  const encoded = encodeURIComponent(title);
  const data = curlJSON(`https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=images&imlimit=50&format=json`);
  if (!data?.query?.pages) return [];
  const pages = Object.values(data.query.pages);
  return pages.flatMap(p => (p.images || []).map(i => i.title));
}

// Get the thumbnail URL for a wiki File: title
function wikiImageUrl(fileTitle) {
  const encoded = encodeURIComponent(fileTitle);
  const data = curlJSON(`https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_SIZE}&format=json`);
  if (!data?.query?.pages) return null;
  const pages = Object.values(data.query.pages);
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (info) {
      return info.thumburl || info.url;
    }
  }
  return null;
}

// Pick the best image from a list of File: titles for a given product
function pickBestImage(fileTitles, productName) {
  // Filter out non-relevant images (icons, logos, star ratings, maps, etc.)
  const excluded = ['star_full', 'star_half', 'star_empty', 'commons-logo', 'wikidata', 'edit-clear',
    'ambox', 'question_book', 'text-x', 'folder_hexagonal', 'padlock', 'crystal_clear',
    'red_pencil', 'nuvola', 'gnome', 'disambig', 'audio', 'speaker', 'headphones',
    'flag_of', 'map', 'location', 'wiki', 'icon', '.svg'];

  const candidates = fileTitles.filter(f => {
    const lower = f.toLowerCase();
    return !excluded.some(ex => lower.includes(ex));
  });

  if (candidates.length === 0) return null;

  // Normalize the product name for matching
  const normalizedName = productName.toLowerCase()
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/);

  // Score each candidate - prefer images whose name matches the product name
  let bestScore = -1;
  let bestImage = candidates[0]; // Fallback: first non-excluded image

  for (const file of candidates) {
    const fileLower = file.toLowerCase().replace(/[_-]/g, ' ');
    let score = 0;

    // Count how many words from the product name appear in the filename
    for (const word of normalizedName) {
      if (word.length > 2 && fileLower.includes(word)) score += 2;
    }

    // Bonus for containing "cover", "box", or "art"
    if (fileLower.includes('cover') || fileLower.includes('box')) score += 3;
    // Bonus for being a .png or .jpg (not .svg)
    if (fileLower.endsWith('.png') || fileLower.endsWith('.jpg') || fileLower.endsWith('.jpeg')) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestImage = file;
    }
  }

  return bestImage;
}

// ---- Image processing ----

async function processImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(THUMB_SIZE, THUMB_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 85 })
      .toFile(outputPath);
    return true;
  } catch (err) {
    console.error(`  Sharp error: ${err.message}`);
    return false;
  }
}

// ---- Main ----

async function downloadOneProduct(product, index) {
  const outputPath = path.join(OUTPUT_DIR, `${product.slug}.webp`);

  if (fs.existsSync(outputPath)) {
    return 'exists';
  }

  const queries = buildSearchQueries(product);

  for (const query of queries) {
    // Search Wikipedia
    const titles = wikiSearch(query);

    for (const title of titles.slice(0, 2)) {
      // Get page images
      const images = wikiPageImages(title);
      if (images.length === 0) continue;

      // Pick the best image
      const bestImage = pickBestImage(images, product.name);
      if (!bestImage) continue;

      // Get the image URL
      const imgUrl = wikiImageUrl(bestImage);
      if (!imgUrl) continue;

      // Download to temp file
      const tmpPath = `/tmp/gshop_${product.slug}.tmp`;
      if (curlBinary(imgUrl, tmpPath)) {
        // Process with sharp (white bg, resize, webp)
        const ok = await processImage(tmpPath, outputPath);
        try { fs.unlinkSync(tmpPath); } catch {}
        if (ok) return 'downloaded';
      }
    }

    sleep(200);
  }

  return 'failed';
}

async function main() {
  console.log(`Downloading box art for ${products.length} products...\n`);

  const results = { downloaded: 0, exists: 0, failed: 0, failedList: [] };

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const status = await downloadOneProduct(product, i);

    if (status === 'downloaded') {
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
  console.log(`Downloaded: ${results.downloaded}`);
  console.log(`Already existed: ${results.exists}`);
  console.log(`Failed: ${results.failed}`);

  if (results.failedList.length > 0) {
    fs.writeFileSync('./scripts/failed-images.json', JSON.stringify(
      results.failedList.map(p => ({ name: p.name, slug: p.slug, platform: p.platform })),
      null, 2
    ));
    console.log('Failed list saved to scripts/failed-images.json');
  }

  // Update products.json with image paths
  const updated = products.map(p => ({
    ...p,
    image: fs.existsSync(path.join(OUTPUT_DIR, `${p.slug}.webp`)) ? `/images/products/${p.slug}.webp` : null
  }));
  fs.writeFileSync('./src/data/products.json', JSON.stringify(updated, null, 2));
  console.log('products.json updated with image paths.');
}

main().catch(console.error);
