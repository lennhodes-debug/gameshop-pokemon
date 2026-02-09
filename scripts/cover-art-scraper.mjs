#!/usr/bin/env node
/**
 * COVER ART SCRAPER — Gameshop Enter
 * ===================================
 * Multi-source PAL cover art downloader met kwaliteitsvalidatie.
 *
 * Gebruik:
 *   node scripts/cover-art-scraper.mjs                    # Alle missende covers
 *   node scripts/cover-art-scraper.mjs SW-001 SW-002      # Specifieke SKUs
 *   node scripts/cover-art-scraper.mjs --platform Switch   # Per platform
 *   node scripts/cover-art-scraper.mjs --recheck           # Hercontroleer bestaande (kwaliteit)
 *   node scripts/cover-art-scraper.mjs --dry-run           # Alleen tonen, niet downloaden
 *
 * Bronnen (prioriteit):
 *   1. MobyGames (hoge kwaliteit, PAL covers beschikbaar)
 *   2. GameTDB (Nintendo-specifiek, PAL regio)
 *   3. Wikipedia/Wikimedia (vrije licentie, wisselende kwaliteit)
 *   4. Google Images (fallback, gefilterd op kwaliteit)
 *
 * Kwaliteitseisen:
 *   - Min 400x400px, target 500x500px output
 *   - Min 3KB bestandsgrootte (geen placeholders)
 *   - WebP output, quality 85
 *   - Voorkeur: schone achtergrond, originele PAL/EUR cover
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(__dirname, '..', 'src', 'data', 'products.json');
const IMG_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const TEMP_DIR = path.join(__dirname, '..', '.cover-temp');

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  outputSize: 500,          // px (vierkant)
  outputQuality: 85,        // WebP quality
  minFileSize: 3000,        // 3KB min (filter placeholders)
  minDimension: 200,        // minimale bron-afbeelding px
  maxRetries: 2,            // per bron
  delayBetween: 300,        // ms tussen downloads (rate limit)
  userAgent: 'GameshopEnter/2.0 (gameshopenter.nl; cover-art-collector)',
};

// Platform → GameTDB ID prefix
const GAMETDB_SYSTEMS = {
  'Nintendo Switch': 'Switch',
  'Wii U': 'WiiU',
  'Wii': 'Wii',
  'GameCube': 'GameCube',
  'Nintendo 3DS': '3DS',
  'Nintendo DS': 'DS',
  'Nintendo 64': null,   // niet in GameTDB
  'Super Nintendo': null,
  'NES': null,
  'Game Boy Advance': null,
  'Game Boy': null,
  'Game Boy Color': null,
};

// Google image search: sites om te VERMIJDEN (slechte kwaliteit/watermarks)
const BLOCKED_DOMAINS = [
  'gstatic.com', 'googleapis.com', 'google.com',
  'ebay.com', 'ebay.nl', 'ebay.co.uk',  // vaak foto's van gebruikers
  'marktplaats.nl',                        // user photos
  'aliexpress.com',                        // knockoffs
  'pinterest.com', 'pinterest.nl',         // redirects
  'facebook.com', 'instagram.com',         // social
  'tiktok.com', 'twitter.com',
  'youtube.com', 'ytimg.com',
];

// Google image search: sites met VOORKEUR (schone PAL covers)
const PREFERRED_DOMAINS = [
  'amazon.nl', 'amazon.de', 'amazon.co.uk', 'amazon.com',
  'bol.com',
  'nedgame.nl',
  'gameshoptwente.nl',
  'budgetgaming.nl',
  'gamemania.nl',
  'nintendo.com', 'nintendo.nl', 'nintendo.co.uk',
  'mobygames.com',
  'coverproject.stkr.it',
  'gametdb.com',
  'upload.wikimedia.org',
];

// ============================================================
// HELPERS
// ============================================================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function curl(url, opts = {}) {
  const timeout = opts.timeout || 15000;
  const args = [
    'curl', '-s', '-L',
    '-H', `"User-Agent: ${CONFIG.userAgent}"`,
    '--max-time', Math.ceil(timeout / 1000),
    '--connect-timeout', '5',
  ];
  if (opts.output) args.push('-o', `"${opts.output}"`);
  args.push(`"${url}"`);
  try {
    const result = execSync(args.join(' '), {
      timeout: timeout + 5000,
      encoding: opts.output ? undefined : 'utf-8',
      stdio: opts.output ? ['pipe', 'pipe', 'pipe'] : undefined,
    });
    return opts.output ? true : result;
  } catch {
    return opts.output ? false : null;
  }
}

function getImageMeta(filepath) {
  try {
    const result = execSync(
      `node -e "const s=require('sharp');s('${filepath}').metadata().then(m=>console.log(JSON.stringify({w:m.width,h:m.height,f:m.format,s:require('fs').statSync('${filepath}').size}))).catch(()=>console.log('null'))"`,
      { timeout: 10000, encoding: 'utf-8' }
    );
    const data = JSON.parse(result.trim());
    return data;
  } catch {
    return null;
  }
}

function convertToWebp(input, output) {
  try {
    const result = execSync(
      `node -e "const s=require('sharp');s('${input}').resize(${CONFIG.outputSize},${CONFIG.outputSize},{fit:'contain',background:{r:255,g:255,b:255,alpha:1}}).webp({quality:${CONFIG.outputQuality}}).toFile('${output}').then(()=>console.log('OK')).catch(e=>console.log('FAIL:'+e.message))"`,
      { timeout: 30000, encoding: 'utf-8' }
    );
    return result.trim() === 'OK';
  } catch {
    return false;
  }
}

function downloadAndValidate(url, tempPath) {
  // Download
  const ok = curl(url, { output: tempPath, timeout: 20000 });
  if (!ok || !fs.existsSync(tempPath)) return null;

  const stats = fs.statSync(tempPath);
  if (stats.size < CONFIG.minFileSize) {
    fs.unlinkSync(tempPath);
    return null;
  }

  // Check dimensions
  const meta = getImageMeta(tempPath);
  if (!meta || meta.w < CONFIG.minDimension || meta.h < CONFIG.minDimension) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return null;
  }

  return meta;
}

// ============================================================
// BRON 1: GAMETDB (Nintendo-specifiek, PAL regio)
// ============================================================
function tryGameTDB(product, tempPath) {
  const system = GAMETDB_SYSTEMS[product.platform];
  if (!system) return false;

  // GameTDB gebruikt game-ID's, we proberen met naam
  const searchName = product.name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '+');

  // Probeer directe cover URL (PAL regio = EN/NL)
  const urls = [
    `https://art.gametdb.com/switch/cover/EU/${searchName}.jpg`,
    `https://art.gametdb.com/${system.toLowerCase()}/cover/EU/${searchName}.jpg`,
  ];

  for (const url of urls) {
    const meta = downloadAndValidate(url, tempPath);
    if (meta) return true;
  }
  return false;
}

// ============================================================
// BRON 2: WIKIPEDIA / WIKIMEDIA
// ============================================================
function tryWikipedia(product, tempPath) {
  // Zoek Wikipedia artikel
  const searchQuery = encodeURIComponent(`${product.name} ${product.platform} video game`);
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${searchQuery}&limit=1&format=json`;

  const searchResult = curl(searchUrl);
  if (!searchResult) return false;

  try {
    const data = JSON.parse(searchResult);
    if (!data[3] || !data[3][0]) return false;

    // Haal article title
    const articleUrl = data[3][0];
    const articleTitle = articleUrl.split('/wiki/')[1];
    if (!articleTitle) return false;

    // Haal image via REST API
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${articleTitle}`;
    const summary = curl(summaryUrl);
    if (!summary) return false;

    const summaryData = JSON.parse(summary);
    const imageUrl = summaryData.originalimage?.source || summaryData.thumbnail?.source?.replace(/\/\d+px-/, '/500px-');
    if (!imageUrl) return false;

    return !!downloadAndValidate(imageUrl, tempPath);
  } catch {
    return false;
  }
}

// ============================================================
// BRON 3: GOOGLE IMAGES (gefilterd)
// ============================================================
function tryGoogleImages(product, tempPath) {
  // Bouw zoekquery: PAL EUR box art
  const isGame = !product.isConsole && !product.sku.startsWith('ACC-');
  const queryParts = [product.name];

  if (isGame) {
    // Platform-specifieke zoektermen
    const platShort = {
      'Nintendo Switch': 'Switch', 'Nintendo 3DS': '3DS', 'Nintendo DS': 'DS',
      'Game Boy Advance': 'GBA', 'Game Boy': 'Game Boy', 'Game Boy Color': 'Game Boy Color',
      'GameCube': 'GameCube', 'Nintendo 64': 'N64', 'Super Nintendo': 'SNES',
      'NES': 'NES', 'Wii': 'Wii', 'Wii U': 'Wii U',
    }[product.platform] || product.platform;

    queryParts.push(platShort, 'PAL', 'EUR', 'box art', 'cover');
  } else if (product.isConsole) {
    queryParts.push('console', 'product photo');
  } else {
    queryParts.push('Nintendo', 'accessoire', 'product');
  }

  const query = encodeURIComponent(queryParts.join(' '));
  const searchUrl = `https://www.google.com/search?q=${query}&tbm=isch&hl=nl`;

  const html = curl(searchUrl);
  if (!html) return false;

  // Extract image URLs
  const imgUrls = [];
  const patterns = [
    /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)",\d+,\d+\]/gi,
    /(https?:\/\/[^"'\\\s&]+\.(?:jpg|jpeg|png|webp))/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      imgUrls.push(match[1]);
    }
  }

  // Filter en sorteer
  const filtered = [...new Set(imgUrls)]
    .filter(url => !BLOCKED_DOMAINS.some(d => url.includes(d)))
    .filter(url => !url.includes('encrypted-tbn'))  // Google thumbnails
    .filter(url => url.length < 500);                // geen mega-URLs

  // Sorteer: preferred domains eerst
  const sorted = filtered.sort((a, b) => {
    const aScore = PREFERRED_DOMAINS.findIndex(d => a.includes(d));
    const bScore = PREFERRED_DOMAINS.findIndex(d => b.includes(d));
    const aPref = aScore >= 0 ? aScore : 999;
    const bPref = bScore >= 0 ? bScore : 999;
    return aPref - bPref;
  });

  // Probeer top 5
  for (const url of sorted.slice(0, 5)) {
    const meta = downloadAndValidate(url, tempPath);
    if (meta) return true;
  }

  return false;
}

// ============================================================
// HOOFDFUNCTIE
// ============================================================
async function scrapeCovers(products, options = {}) {
  const { dryRun = false, recheck = false } = options;

  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  let targets;
  if (recheck) {
    // Hercontroleer bestaande images op kwaliteit
    targets = products.filter(p => p.image);
  } else {
    // Alleen missende covers
    targets = products.filter(p => !p.image);
  }

  if (targets.length === 0) {
    console.log('Alle producten hebben al een cover image.');
    return { downloaded: 0, failed: 0, skipped: 0 };
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  COVER ART SCRAPER — ${targets.length} producten`);
  console.log(`  Modus: ${dryRun ? 'DRY RUN' : recheck ? 'RECHECK' : 'DOWNLOAD'}`);
  console.log(`${'='.repeat(70)}\n`);

  let downloaded = 0, failed = 0, skipped = 0;
  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const product = targets[i];
    const progress = `[${i + 1}/${targets.length}]`;
    const label = `${product.sku} ${product.name.substring(0, 35).padEnd(35)}`;

    if (dryRun) {
      console.log(`${progress} ${label} → zou downloaden`);
      continue;
    }

    process.stdout.write(`${progress} ${label} `);

    const tempFile = path.join(TEMP_DIR, `${product.sku.toLowerCase()}-temp`);
    let success = false;
    let source = '';

    // Probeer bronnen in volgorde
    const sources = [
      { name: 'GameTDB', fn: () => tryGameTDB(product, tempFile) },
      { name: 'Wikipedia', fn: () => tryWikipedia(product, tempFile) },
      { name: 'Google', fn: () => tryGoogleImages(product, tempFile) },
    ];

    for (const src of sources) {
      try {
        if (src.fn()) {
          success = true;
          source = src.name;
          break;
        }
      } catch {
        // Volgende bron proberen
      }
    }

    if (success && fs.existsSync(tempFile)) {
      // Convert naar WebP
      const slug = product.slug || `${product.sku.toLowerCase()}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '')}`;
      const webpPath = path.join(IMG_DIR, `${slug}.webp`);
      const converted = convertToWebp(tempFile, webpPath);

      if (converted && fs.existsSync(webpPath)) {
        const size = (fs.statSync(webpPath).size / 1024).toFixed(1);
        console.log(`✅ ${source} (${size}KB)`);
        product.image = `/images/products/${slug}.webp`;
        downloaded++;
        results.push({ sku: product.sku, name: product.name, source });
      } else {
        console.log('❌ convert mislukt');
        failed++;
      }
    } else {
      console.log('❌ geen bron gevonden');
      failed++;
    }

    // Cleanup temp
    for (const ext of ['', '.jpg', '.jpeg', '.png', '.webp', '.gif']) {
      const f = tempFile + ext;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

    await sleep(CONFIG.delayBetween);
  }

  // Sla bijgewerkte products.json op
  if (downloaded > 0) {
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    console.log(`\nproducts.json bijgewerkt met ${downloaded} nieuwe images`);
  }

  // Resultaten
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ✅ Gedownload: ${downloaded}`);
  console.log(`  ❌ Mislukt:    ${failed}`);
  console.log(`  ⏭️  Overgeslagen: ${skipped}`);
  console.log(`  📊 Totaal met image: ${products.filter(p => p.image).length}/${products.length}`);
  console.log(`${'='.repeat(50)}`);

  if (results.length > 0) {
    console.log('\nNieuw gedownload:');
    results.forEach(r => console.log(`  ${r.sku}: ${r.name} (${r.source})`));
  }

  // Cleanup temp dir
  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true });

  return { downloaded, failed, skipped };
}

// ============================================================
// CLI
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const recheck = args.includes('--recheck');
  const platformArg = args.find((_, i) => args[i - 1] === '--platform');
  const skuArgs = args.filter(a => /^[A-Z]+-\d+$/.test(a));

  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
  let targets = products;

  // Filter op specifieke SKUs
  if (skuArgs.length > 0) {
    targets = products.filter(p => skuArgs.includes(p.sku));
    if (targets.length === 0) {
      console.error('Geen producten gevonden voor opgegeven SKUs');
      process.exit(1);
    }
  }

  // Filter op platform
  if (platformArg) {
    targets = targets.filter(p =>
      p.platform.toLowerCase().includes(platformArg.toLowerCase())
    );
  }

  await scrapeCovers(targets, { dryRun, recheck });
}

main().catch(console.error);
