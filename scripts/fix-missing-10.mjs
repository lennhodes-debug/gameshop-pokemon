import { execSync } from 'child_process';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/user/gameshop/public/images/products';

// Each game with sku, Wikipedia article, keywords, and optional direct fallback file
const GAMES = [
  {
    sku: 'SW-022',
    article: 'Super_Mario_3D_World',
    keywords: ['Bowser', '3D_World', '3D World'],
    description: 'Super Mario 3D World + Bowser\'s Fury',
  },
  {
    sku: 'SW-025',
    article: 'Super_Mario_RPG',
    keywords: ['Super_Mario_RPG', 'Super Mario RPG', 'Mariorpgcover', 'rpgcover'],
    fallbackFile: 'Mariorpgcover.png',
    description: 'Super Mario RPG (2023 Switch remake)',
  },
  {
    sku: 'SW-048',
    article: 'Xenoblade_Chronicles_(video_game)',
    keywords: ['Xenoblade'],
    fallbackFile: 'Xenoblade box artwork.png',
    description: 'Xenoblade Chronicles: Definitive Edition',
  },
  {
    sku: 'GB-001',
    article: 'Pok%C3%A9mon_Red_and_Blue',
    keywords: ['Red', 'cover'],
    description: 'Pokémon Red',
  },
  {
    sku: 'GB-003',
    article: 'Pok%C3%A9mon_Yellow',
    keywords: ['Yellow'],
    // No Yellow-specific box art exists on Wikipedia; use logo from Commons
    fallbackFile: 'Pokémon Yellow Logo.png',
    fallbackIsCommons: true,
    description: 'Pokémon Yellow',
  },
  {
    sku: 'GB-004',
    article: 'Pok%C3%A9mon_Gold_and_Silver',
    keywords: ['Gold'],
    description: 'Pokémon Gold',
  },
  {
    sku: 'GB-010',
    article: "The_Legend_of_Zelda:_Link%27s_Awakening",
    keywords: ['Link', 'Awakening'],
    description: "Zelda: Link's Awakening",
  },
  {
    sku: 'GBA-008',
    article: 'Mario_Kart:_Super_Circuit',
    keywords: ['Super_Circuit', 'Super Circuit'],
    description: 'Mario Kart: Super Circuit',
  },
  {
    sku: 'N64-009',
    article: 'GoldenEye_007_(1997_video_game)',
    keywords: ['GoldenEye'],
    description: 'GoldenEye 007',
  },
  {
    sku: 'SNES-009',
    article: 'Super_Metroid',
    keywords: ['Super_Metroid', 'Super Metroid', 'Smetroid', 'metroid'],
    description: 'Super Metroid',
  },
];

function curlGet(url) {
  try {
    const result = execSync(
      `curl -s -L --max-time 30 '${url}'`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    return result;
  } catch (err) {
    console.error(`  curl failed for ${url}: ${err.message}`);
    return null;
  }
}

function curlGetBinary(url, outputPath) {
  try {
    execSync(
      `curl -s -L --max-time 60 -o '${outputPath}' '${url}'`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    return fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0;
  } catch (err) {
    console.error(`  curl binary download failed: ${err.message}`);
    return false;
  }
}

function getImagesFromArticle(article) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${article}&prop=images&format=json&imlimit=50&redirects=1`;
  const response = curlGet(url);
  if (!response) return [];

  try {
    const data = JSON.parse(response);
    const pages = data.query?.pages;
    if (!pages) return [];

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') {
      console.error(`  Article not found`);
      return [];
    }
    const images = pages[pageId]?.images || [];
    return images.map(img => img.title.replace('File:', ''));
  } catch (err) {
    console.error(`  Failed to parse image list: ${err.message}`);
    return [];
  }
}

function getImageUrl(filename, isCommons = false) {
  const encodedFilename = encodeURIComponent(filename);
  const apiBase = isCommons
    ? 'https://commons.wikimedia.org/w/api.php'
    : 'https://en.wikipedia.org/w/api.php';
  const url = `${apiBase}?action=query&titles=File:${encodedFilename}&prop=imageinfo&iiprop=url&format=json`;
  const response = curlGet(url);
  if (!response) return null;

  try {
    const data = JSON.parse(response);
    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    return pages[pageId]?.imageinfo?.[0]?.url || null;
  } catch (err) {
    console.error(`  Failed to parse image URL: ${err.message}`);
    return null;
  }
}

function filterImages(filenames, keywords) {
  const boxArtTerms = ['box', 'art', 'cover', 'logo', 'pack', 'boxart'];

  // Filter out non-game images (SVGs, flags, icons, wiki furniture)
  const validFiles = filenames.filter(fn => {
    const fnLower = fn.toLowerCase();
    if (fnLower.endsWith('.svg') || fnLower.includes('flag') || fnLower.includes('icon') ||
        fnLower.includes('symbol') || fnLower.includes('category') ||
        fnLower.includes('commons-logo') || fnLower.includes('wikiproject') ||
        fnLower.includes('edit-ltr') || fnLower.includes('wpvg') ||
        fnLower.includes('cscr-') || fnLower.includes('redirect') ||
        fnLower.includes('wikiquote') || fnLower.includes('trifuerza') ||
        fnLower.includes('star empty') || fnLower.includes('star full') ||
        fnLower.includes('star half') || fnLower.includes('semi-protection') ||
        fnLower.includes('ec1835') || fnLower.includes('dragon-') ||
        fnLower.includes('earth-moon') || fnLower.includes('iphone')) {
      return false;
    }
    return true;
  });

  // Find files matching keywords
  const keywordMatches = validFiles.filter(fn => {
    const fnLower = fn.toLowerCase();
    return keywords.some(kw => fnLower.includes(kw.toLowerCase()));
  });

  if (keywordMatches.length === 0) return null;

  // Prefer box art / cover art matches
  const boxArtMatches = keywordMatches.filter(fn => {
    const fnLower = fn.toLowerCase();
    return boxArtTerms.some(term => fnLower.includes(term));
  });

  if (boxArtMatches.length > 0) return boxArtMatches[0];

  return keywordMatches[0];
}

async function processImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(500, 500, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 85 })
    .toFile(outputPath);
}

async function processGame(game) {
  const outputPath = path.join(OUTPUT_DIR, `${game.sku}.webp`);

  if (fs.existsSync(outputPath)) {
    console.log(`\n[${game.sku}] ${game.description} - ALREADY EXISTS, skipping`);
    return true;
  }

  console.log(`\n[${game.sku}] ${game.description}`);
  console.log(`  Fetching image list from: ${game.article}`);

  const images = getImagesFromArticle(game.article);
  let selectedImage = null;
  let isCommons = false;

  if (images.length > 0) {
    console.log(`  Found ${images.length} images on article page`);
    selectedImage = filterImages(images, game.keywords);
  } else {
    console.log(`  No images found on article page`);
  }

  // Use fallback if no match found
  if (!selectedImage && game.fallbackFile) {
    console.log(`  Using fallback file: ${game.fallbackFile}`);
    selectedImage = game.fallbackFile;
    isCommons = game.fallbackIsCommons || false;
  }

  if (!selectedImage) {
    console.error(`  No matching image found with keywords: ${game.keywords.join(', ')}`);
    if (images.length > 0) {
      console.error(`  Available: ${images.join(', ')}`);
    }
    return false;
  }

  console.log(`  Selected image: ${selectedImage}`);

  const imageUrl = getImageUrl(selectedImage, isCommons);
  if (!imageUrl) {
    // Try the other wiki if first attempt failed
    const altUrl = getImageUrl(selectedImage, !isCommons);
    if (!altUrl) {
      console.error(`  Could not get URL for image: ${selectedImage}`);
      return false;
    }
    console.log(`  Found on ${!isCommons ? 'Commons' : 'en.wiki'}: ${altUrl}`);
    var finalUrl = altUrl;
  } else {
    var finalUrl = imageUrl;
  }

  console.log(`  Image URL: ${finalUrl}`);

  const tmpPath = path.join(OUTPUT_DIR, `${game.sku}_tmp`);

  const downloaded = curlGetBinary(finalUrl, tmpPath);
  if (!downloaded) {
    console.error(`  Failed to download image`);
    return false;
  }

  const fileSize = fs.statSync(tmpPath).size;
  console.log(`  Downloaded: ${fileSize} bytes`);

  try {
    await processImage(tmpPath, outputPath);
    fs.unlinkSync(tmpPath);
    const finalSize = fs.statSync(outputPath).size;
    console.log(`  Saved: ${outputPath} (${finalSize} bytes)`);
    return true;
  } catch (err) {
    console.error(`  Sharp processing failed: ${err.message}`);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    return false;
  }
}

async function main() {
  console.log('=== Downloading cover art for 10 missing games ===');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0;
  let failed = 0;
  const failures = [];

  for (const game of GAMES) {
    const ok = await processGame(game);
    if (ok) {
      success++;
    } else {
      failed++;
      failures.push(game.sku);
    }
  }

  console.log(`\n=== Done: ${success} succeeded, ${failed} failed ===`);
  if (failures.length > 0) {
    console.log(`Failed SKUs: ${failures.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
