#!/usr/bin/env node

/**
 * Fix Remaining Cover Arts
 *
 * Uses Wikipedia page images API (not just infobox) to find cover art.
 * Also tries LibRetro thumbnail database as fallback.
 * Handles the 30 products that failed the infobox approach.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/products.json');
const IMAGES_DIR = path.join(process.cwd(), 'public/images/products');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));

// Map product name -> { article, coverTerms[] }
// coverTerms helps pick the right image from article's image list
const FIXES = {
  'Zelda: Skyward Sword HD': {
    article: 'The Legend of Zelda: Skyward Sword HD',
    coverTerms: ['skyward', 'sword', 'hd', 'cover', 'box'],
  },
  'Mario Kart 8 Deluxe': {
    article: 'Mario Kart 8 Deluxe',
    coverTerms: ['deluxe', 'cover', 'box'],
  },
  'New Super Mario Bros. U Deluxe': {
    article: 'New Super Mario Bros. U Deluxe',
    coverTerms: ['deluxe', 'cover', 'box'],
  },
  "Super Mario 3D World + Bowser's Fury": {
    article: "Super Mario 3D World + Bowser's Fury",
    coverTerms: ['fury', 'cover', 'box', '3d_world'],
  },
  'Super Mario RPG': {
    article: 'Super Mario RPG (2023 video game)',
    coverTerms: ['rpg', '2023', 'cover', 'box'],
  },
  'Pikmin 3 Deluxe': {
    article: 'Pikmin 3 Deluxe',
    coverTerms: ['pikmin', 'deluxe', 'cover', 'box'],
  },
  'Xenoblade Chronicles: Definitive Edition': {
    article: 'Xenoblade Chronicles: Definitive Edition',
    coverTerms: ['xenoblade', 'definitive', 'cover', 'box'],
  },
  'Undertale': {
    article: 'Undertale',
    coverTerms: ['undertale', 'cover', 'box', 'switch'],
    // Undertale's infobox has SVG logo, need to find actual box art from images
  },
  'Overcooked! All You Can Eat': {
    article: 'Overcooked! All You Can Eat',
    coverTerms: ['overcooked', 'cover', 'box', 'eat'],
  },
  'Collection of Mana': {
    article: 'Collection of Mana',
    coverTerms: ['collection', 'mana', 'cover', 'box'],
  },
  'Borderlands Legendary Collection': {
    article: 'Borderlands Legendary Collection',
    coverTerms: ['borderlands', 'legendary', 'cover'],
  },
  'Naruto Storm Trilogy': {
    article: 'Naruto Shippuden: Ultimate Ninja Storm Trilogy',
    coverTerms: ['naruto', 'storm', 'trilogy', 'cover'],
  },
  'Pikmin 1+2': {
    article: 'Pikmin 1+2',
    coverTerms: ['pikmin', 'cover', 'box'],
  },
  "Luigi's Mansion 2": {
    article: "Luigi's Mansion: Dark Moon",
    coverTerms: ['luigi', 'mansion', 'dark', 'moon', 'cover', 'box'],
  },
  'DK Country Returns 3D': {
    article: 'Donkey Kong Country Returns 3D',
    coverTerms: ['donkey', 'kong', 'returns', '3d', 'cover', 'box'],
  },
  'Pokémon Red': {
    article: 'Pokémon Red and Blue',
    coverTerms: ['red', 'cover', 'box'],
    excludeTerms: ['blue'],
  },
  'Pokémon Blue': {
    article: 'Pokémon Red and Blue',
    coverTerms: ['blue', 'cover', 'box'],
    excludeTerms: ['red'],
  },
  'Pokémon Yellow': {
    article: 'Pokémon Yellow',
    coverTerms: ['yellow', 'cover', 'box'],
  },
  'Pokémon Silver': {
    article: 'Pokémon Gold and Silver',
    coverTerms: ['silver', 'cover', 'box'],
    excludeTerms: ['gold'],
  },
  'Donkey Kong': {
    article: 'Donkey Kong (1994 video game)',
    coverTerms: ['donkey', 'kong', '1994', 'cover', 'box', 'game_boy'],
  },
  'Zelda: ALttP / Four Swords': {
    article: 'The Legend of Zelda: A Link to the Past & Four Swords',
    coverTerms: ['link', 'past', 'four', 'swords', 'cover', 'box', 'gba'],
  },
  'GoldenEye 007': {
    article: 'GoldenEye 007 (1997 video game)',
    coverTerms: ['goldeneye', 'cover', 'box'],
  },
  'Banjo-Kazooie': {
    article: 'Banjo-Kazooie',
    coverTerms: ['banjo', 'kazooie', 'cover', 'box'],
    excludeTerms: ['logo', '.svg'],
  },
  'Donkey Kong Country 2': {
    article: "Donkey Kong Country 2: Diddy's Kong Quest",
    coverTerms: ['country_2', 'diddy', 'cover', 'box'],
  },
  'Donkey Kong Country 3': {
    article: "Donkey Kong Country 3: Dixie Kong's Double Trouble!",
    coverTerms: ['country_3', 'dixie', 'cover', 'box'],
  },
  'DK Country Returns': {
    article: 'Donkey Kong Country Returns',
    coverTerms: ['donkey', 'kong', 'returns', 'cover', 'box'],
    excludeTerms: ['3d'],
  },
  'Metroid Prime 3': {
    article: 'Metroid Prime 3: Corruption',
    coverTerms: ['metroid', 'prime', '3', 'corruption', 'cover', 'box'],
  },
  'Zelda: Wind Waker HD': {
    article: 'The Legend of Zelda: The Wind Waker HD',
    coverTerms: ['wind', 'waker', 'hd', 'cover', 'box'],
  },
  'Zelda: Twilight Princess HD': {
    article: 'The Legend of Zelda: Twilight Princess HD',
    coverTerms: ['twilight', 'princess', 'hd', 'cover', 'box'],
  },
  'Splatoon': {
    article: 'Splatoon',
    coverTerms: ['splatoon', 'cover', 'box'],
    excludeTerms: ['logo', '.svg', 'splatoon_2', 'splatoon_3'],
  },
};

// LibRetro platform mapping
const LIBRETRO_PLATFORMS = {
  'Nintendo Switch': 'Nintendo - Switch',
  'Nintendo 3DS': 'Nintendo - Nintendo 3DS',
  'Nintendo DS': 'Nintendo - Nintendo DS',
  'Game Boy': 'Nintendo - Game Boy',
  'Game Boy Color': 'Nintendo - Game Boy Color',
  'Game Boy Advance': 'Nintendo - Game Boy Advance',
  'Nintendo 64': 'Nintendo - Nintendo 64',
  'GameCube': 'Nintendo - GameCube',
  'Super Nintendo': 'Nintendo - Super Nintendo Entertainment System',
  'NES': 'Nintendo - Nintendo Entertainment System',
  'Wii': 'Nintendo - Wii',
  'Wii U': 'Nintendo - Wii U',
};

// LibRetro game name mapping (product name -> libretro name)
const LIBRETRO_NAMES = {
  'Zelda: Skyward Sword HD': 'The Legend of Zelda - Skyward Sword HD',
  'Mario Kart 8 Deluxe': 'Mario Kart 8 Deluxe',
  "Super Mario 3D World + Bowser's Fury": "Super Mario 3D World + Bowser's Fury",
  'Super Mario RPG': 'Super Mario RPG',
  'Pikmin 3 Deluxe': 'Pikmin 3 Deluxe',
  'Xenoblade Chronicles: Definitive Edition': 'Xenoblade Chronicles - Definitive Edition',
  'Undertale': 'Undertale',
  'Pokémon Red': 'Pokemon Red Version',
  'Pokémon Blue': 'Pokemon Blue Version',
  'Pokémon Yellow': 'Pokemon Yellow Version - Special Pikachu Edition',
  'Pokémon Silver': 'Pokemon - Silver Version',
  'GoldenEye 007': 'GoldenEye 007',
  'Banjo-Kazooie': 'Banjo-Kazooie',
  'Donkey Kong Country 2': "Donkey Kong Country 2 - Diddy's Kong Quest",
  'Donkey Kong Country 3': "Donkey Kong Country 3 - Dixie Kong's Double Trouble!",
  'DK Country Returns': 'Donkey Kong Country Returns',
  'Metroid Prime 3': 'Metroid Prime 3 - Corruption',
  'Splatoon': 'Splatoon',
  "Luigi's Mansion 2": "Luigi's Mansion - Dark Moon",
  'DK Country Returns 3D': 'Donkey Kong Country Returns 3D',
};

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

function curlJSON(url) {
  try {
    const safeUrl = url.replace(/'/g, '%27');
    const result = execSync(
      `curl -sL -H 'User-Agent: GameShopBot/2.0 (gameshopenter@gmail.com)' '${safeUrl}'`,
      { maxBuffer: 10 * 1024 * 1024, timeout: 15000 }
    ).toString();
    return JSON.parse(result);
  } catch (e) {
    return null;
  }
}

function curlHead(url) {
  try {
    const result = execSync(
      `curl -sI -o /dev/null -w '%{http_code}' '${url}'`,
      { timeout: 10000 }
    ).toString().trim();
    return result === '200';
  } catch {
    return false;
  }
}

// Get all images from a Wikipedia article
function getArticleImages(articleTitle) {
  const encoded = encodeURIComponent(articleTitle.replace(/ /g, '_'));
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=images&imlimit=50&format=json`;
  const data = curlJSON(url);
  if (!data || !data.query) return [];
  const pages = data.query.pages;
  for (const pid of Object.keys(pages)) {
    if (pid === '-1') continue;
    return (pages[pid].images || []).map(i => i.title.replace(/^File:/, ''));
  }
  return [];
}

// Get URL for a Wikipedia image file
function getImageUrl(filename) {
  const encoded = encodeURIComponent('File:' + filename);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url&format=json`;
  const data = curlJSON(url);
  if (!data || !data.query) return null;
  const pages = data.query.pages;
  for (const pid of Object.keys(pages)) {
    if (pid === '-1') continue;
    const page = pages[pid];
    if (page.imageinfo && page.imageinfo[0]) return page.imageinfo[0].url;
  }
  return null;
}

// Pick the best cover image from a list
function pickBestCover(images, coverTerms, excludeTerms = []) {
  const excluded = ['star_full', 'star_half', 'star_empty', 'commons-logo', 'wikidata',
    'ambox', 'question_book', 'text-x', 'folder', 'padlock', 'crystal_clear',
    'red_pencil', 'nuvola', 'gnome', 'disambig', 'audio', 'speaker',
    'flag_of', 'map', 'location', 'wiki', 'icon', 'edit-clear',
    'information_icon', 'magnify', 'yes_check', 'x_mark', 'increase', 'decrease',
    'steady', 'symbol_', 'wikiquote', 'template', 'question_mark',
    ...excludeTerms.map(t => t.toLowerCase())];

  const candidates = images.filter(f => {
    const lower = f.toLowerCase();
    // Skip SVGs - they're logos, not box art
    if (lower.endsWith('.svg')) return false;
    return !excluded.some(ex => lower.includes(ex));
  });

  if (candidates.length === 0) return null;

  let bestScore = -1;
  let bestImage = null;

  for (const img of candidates) {
    const imgLower = img.toLowerCase().replace(/[_-]/g, ' ');
    let score = 0;

    for (const term of coverTerms) {
      if (imgLower.includes(term.toLowerCase())) score += 3;
    }

    // Strong bonus for cover/box keywords
    if (imgLower.includes('cover')) score += 8;
    if (imgLower.includes('box')) score += 8;
    if (imgLower.includes('boxart')) score += 10;
    if (imgLower.includes('art')) score += 4;

    // Bonus for image format
    if (imgLower.endsWith('.png') || imgLower.endsWith('.jpg') || imgLower.endsWith('.jpeg')) score += 2;

    // Penalty for screenshots, logos
    if (imgLower.includes('screenshot')) score -= 10;
    if (imgLower.includes('logo')) score -= 5;
    if (imgLower.includes('gameplay')) score -= 10;

    if (score > bestScore) {
      bestScore = score;
      bestImage = img;
    }
  }

  return bestImage;
}

// Try LibRetro thumbnails
function tryLibRetro(productName, platform) {
  const libretroPlatform = LIBRETRO_PLATFORMS[platform];
  const libretroName = LIBRETRO_NAMES[productName];

  if (!libretroPlatform || !libretroName) return null;

  const encodedPlatform = encodeURIComponent(libretroPlatform);
  const encodedName = encodeURIComponent(libretroName);
  const url = `https://thumbnails.libretro.com/${encodedPlatform}/Named_Boxarts/${encodedName}.png`;

  if (curlHead(url)) return url;
  return null;
}

async function downloadAndProcess(imageUrl, outputPath) {
  try {
    const tmpPath = outputPath + '.tmp';
    execSync(
      `curl -sL -H 'User-Agent: GameShopBot/2.0' -o '${tmpPath}' '${imageUrl}'`,
      { timeout: 30000 }
    );

    if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size < 1000) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      return false;
    }

    await sharp(tmpPath)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 85 })
      .toFile(outputPath);

    fs.unlinkSync(tmpPath);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const failures = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts/fix-cover-failures.json'), 'utf-8'));
  console.log(`Fixing ${failures.length} remaining cover arts...\n`);

  let succeeded = 0;
  let failed = 0;
  const stillFailed = [];

  for (let i = 0; i < failures.length; i++) {
    const failure = failures[i];
    const product = products.find(p => p.sku === failure.sku);
    if (!product) {
      console.log(`[${i+1}/${failures.length}] SKIP ${failure.name} - product not found`);
      failed++;
      continue;
    }

    const fix = FIXES[product.name];
    const outputPath = path.join(IMAGES_DIR, `${product.slug}.webp`);
    let imageUrl = null;

    // Strategy 1: Wikipedia page images with smart picking
    if (fix) {
      console.log(`  Trying Wikipedia article: ${fix.article}`);
      const allImages = getArticleImages(fix.article);
      if (allImages.length > 0) {
        const bestImage = pickBestCover(allImages, fix.coverTerms, fix.excludeTerms);
        if (bestImage) {
          imageUrl = getImageUrl(bestImage);
          if (imageUrl) {
            console.log(`  Found: ${bestImage}`);
          }
        }
      }
      sleep(300);
    }

    // Strategy 2: LibRetro thumbnails
    if (!imageUrl) {
      console.log(`  Trying LibRetro thumbnails...`);
      imageUrl = tryLibRetro(product.name, product.platform);
      if (imageUrl) console.log(`  Found on LibRetro`);
      sleep(200);
    }

    // Strategy 3: Wikipedia search for the game name + "video game"
    if (!imageUrl) {
      console.log(`  Trying Wikipedia search...`);
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(product.name + ' video game')}&srlimit=3&format=json`;
      const searchData = curlJSON(searchUrl);
      if (searchData?.query?.search) {
        for (const result of searchData.query.search.slice(0, 2)) {
          const imgs = getArticleImages(result.title);
          const best = pickBestCover(imgs, [product.name.toLowerCase().split(' ')[0], 'cover', 'box'], []);
          if (best) {
            imageUrl = getImageUrl(best);
            if (imageUrl) {
              console.log(`  Found via search: ${result.title} -> ${best}`);
              break;
            }
          }
          sleep(200);
        }
      }
    }

    if (!imageUrl) {
      failed++;
      stillFailed.push(failure);
      console.log(`[${i+1}/${failures.length}] FAIL ${product.name}`);
      continue;
    }

    const ok = await downloadAndProcess(imageUrl, outputPath);
    if (ok) {
      succeeded++;
      console.log(`[${i+1}/${failures.length}] OK ${product.name}`);

      // Also copy to alternate slug if needed
      if (product.slug.includes('pokmon')) {
        const altSlug = product.slug.replace(/pokmon/g, 'pok-mon');
        const altPath = path.join(IMAGES_DIR, `${altSlug}.webp`);
        try { fs.copyFileSync(outputPath, altPath); } catch {}
      }
    } else {
      failed++;
      stillFailed.push(failure);
      console.log(`[${i+1}/${failures.length}] FAIL ${product.name} - download failed`);
    }

    sleep(400);
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Still failed: ${failed}`);

  if (stillFailed.length > 0) {
    console.log(`\nStill failing:`);
    for (const f of stillFailed) {
      console.log(`  ${f.sku}: ${f.name}`);
    }
    fs.writeFileSync(
      path.join(process.cwd(), 'scripts/fix-cover-failures.json'),
      JSON.stringify(stillFailed, null, 2)
    );
  } else {
    // All fixed! Clear the failures file
    fs.writeFileSync(
      path.join(process.cwd(), 'scripts/fix-cover-failures.json'),
      '[]'
    );
  }

  // Re-run convert-excel to update products.json
  console.log('\nUpdating products.json...');
  try {
    execSync('node scripts/convert-excel.js', { cwd: process.cwd(), stdio: 'inherit' });
    console.log('Done!');
  } catch (e) {
    console.error('Failed to update products.json');
  }
}

main().catch(console.error);
