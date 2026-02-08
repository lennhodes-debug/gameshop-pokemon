#!/usr/bin/env node
/**
 * Cover Art Manager — Gameshop Enter
 * Primaire bron: PriceCharting PAL covers
 * Fallback: Google Image Search
 *
 * Gebruik:
 *   node scripts/download-cover.js --check              # Toon ontbrekende/kapotte covers
 *   node scripts/download-cover.js --fix                 # Download alle ontbrekende covers
 *   node scripts/download-cover.js --fix SW-164          # Download cover voor 1 product
 *   node scripts/download-cover.js --verify SW-001       # Verifieer 1 cover
 *   node scripts/download-cover.js --batch CON-019 CON-020  # Download meerdere
 *   node scripts/download-cover.js --redownload          # Herdownload ALLE game covers
 *   node scripts/download-cover.js --redownload nes      # Herdownload per platform
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const PRODUCTS_JSON = path.join(__dirname, '..', 'src', 'data', 'products.json');
const CONCURRENCY = 3;

// PriceCharting PAL platform slugs
const PC_PLATFORM = {
  'NES': 'pal-nes',
  'Super Nintendo': 'pal-super-nintendo',
  'Nintendo 64': 'pal-nintendo-64',
  'Game Boy': 'pal-gameboy',
  'Game Boy Color': 'pal-gameboy-color',
  'Game Boy Advance': 'pal-gameboy-advance',
  'GameCube': 'pal-gamecube',
  'Nintendo DS': 'pal-nintendo-ds',
  'Nintendo 3DS': 'pal-nintendo-3ds',
  'Wii': 'pal-wii',
  'Wii U': 'pal-wii-u',
  'Nintendo Switch': 'pal-nintendo-switch',
};

// ===== HELPERS =====

function slugify(name) {
  return name.toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[áàâ]/g, 'a').replace(/[íìî]/g, 'i')
    .replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 60);
}

function pcSlugify(name) {
  return name.toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[áàâ]/g, 'a').replace(/[íìî]/g, 'i')
    .replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[:.'!?&,]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function filename(sku, name) {
  return `${sku.toLowerCase()}-${slugify(name)}.webp`;
}

function dl(url, timeout = 8) {
  try {
    const buf = execSync(
      `curl -sL -m ${timeout} -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}"`,
      { maxBuffer: 20 * 1024 * 1024, timeout: (timeout + 2) * 1000 }
    );
    return buf;
  } catch {
    return null;
  }
}

// ===== PRICECHARTING =====

function searchPriceCharting(product) {
  const pcPlatform = PC_PLATFORM[product.platform];
  if (!pcPlatform) return [];

  // Bouw PriceCharting slug van game naam
  const baseName = product.name
    .replace(/\s*-\s*(Zwart|Wit|Blauw|Rood|Geel|Grijs|Paars|Groen|Roze|Oranje|Donkerblauw|Doorzichtig|Neon)$/i, '');
  const pcSlug = pcSlugify(baseName);
  const url = `https://www.pricecharting.com/game/${pcPlatform}/${pcSlug}`;

  try {
    const buf = execSync(
      `curl -sL -m 12 -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}"`,
      { maxBuffer: 5 * 1024 * 1024, timeout: 15000 }
    );
    const html = buf.toString('utf8');

    // Check of pagina bestaat (niet redirect naar search)
    if (html.includes('class="search-results"') || html.includes('No Products Found')) {
      return [];
    }

    // Extract 1600.jpg image URLs (hoogste resolutie, twee hash formaten)
    const re = /https:\/\/storage\.googleapis\.com\/images\.pricecharting\.com\/[^\s"'<>]+\/1600\.jpg/g;
    const urls = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!urls.includes(m[0])) urls.push(m[0]);
    }
    return urls;
  } catch {
    return [];
  }
}

// ===== GOOGLE FALLBACK =====

function searchGoogle(query) {
  const BLOCKED = new Set([
    'google.com', 'gstatic.com', 'googleapis.com', 'googleusercontent.com',
    'bing.com', 'facebook.com', 'twitter.com', 'pinterest.com',
    'reddit.com', 'youtube.com', 'tiktok.com', 'aliexpress.com',
    'amazon.co.jp', 'amazon.com', 'play-asia.com', 'suruga-ya.com',
    'mercari.com', 'rakuten.co.jp', 'yahoo.co.jp'
  ]);
  const PRIORITY = ['amazon.de', 'amazon.nl', 'bol.com', 'nintendo.nl',
    'amazon.co.uk', 'ebayimg', 'mobygames', 'coverproject', 'gamefaqs',
    'nintendo', 'igdb', 'rawg', 'giantbomb', 'wikimedia'];

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=isz:m`;
  try {
    const buf = execSync(
      `curl -sL -m 10 -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -H "Accept: text/html" "${url}"`,
      { maxBuffer: 5 * 1024 * 1024, timeout: 15000 }
    );
    const html = buf.toString('utf8');
    const urls = [];
    const re = /https?:\/\/[^"'\\&\s]+\.(?:jpg|jpeg|png|webp)/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const u = m[0];
      let blocked = false;
      for (const d of BLOCKED) if (u.includes(d)) { blocked = true; break; }
      if (!blocked && !urls.includes(u)) urls.push(u);
    }
    urls.sort((a, b) => {
      let pa = PRIORITY.length, pb = PRIORITY.length;
      for (let i = 0; i < PRIORITY.length; i++) {
        if (a.includes(PRIORITY[i])) { pa = i; break; }
      }
      for (let i = 0; i < PRIORITY.length; i++) {
        if (b.includes(PRIORITY[i])) { pb = i; break; }
      }
      return pa - pb;
    });
    return urls;
  } catch {
    return [];
  }
}

// ===== IMAGE DOWNLOAD & PROCESSING =====

async function tryDownloadImage(urls) {
  for (const url of urls.slice(0, 15)) {
    try {
      const buf = dl(url);
      if (!buf || buf.length < 5000) continue;
      const meta = await sharp(buf).metadata();
      if (!meta.width || meta.width < 50) continue;
      return buf;
    } catch { continue; }
  }
  return null;
}

async function processImage(buf, outputPath) {
  await sharp(buf)
    .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(outputPath);
  const stat = fs.statSync(outputPath);
  if (stat.size < 2000) { fs.unlinkSync(outputPath); throw new Error('Te klein'); }
  return stat.size;
}

// ===== PRODUCT ANALYSE =====

function loadProducts() {
  return JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
}

function findProblems(products) {
  const problems = [];
  for (const p of products) {
    if (!p.image) {
      problems.push({ sku: p.sku, name: p.name, platform: p.platform, issue: 'geen-image', isConsole: p.isConsole });
      continue;
    }
    const filePath = path.join(__dirname, '..', 'public', p.image);
    if (!fs.existsSync(filePath)) {
      problems.push({ sku: p.sku, name: p.name, platform: p.platform, issue: 'bestand-ontbreekt', isConsole: p.isConsole });
      continue;
    }
    const stat = fs.statSync(filePath);
    if (stat.size < 3000) {
      problems.push({ sku: p.sku, name: p.name, platform: p.platform, issue: 'te-klein', size: stat.size, isConsole: p.isConsole });
    }
  }
  return problems;
}

// ===== DOWNLOAD LOGICA =====

function buildGoogleQuery(product) {
  const name = product.name.replace(/\s*-\s*(Zwart|Wit|Blauw|Rood|Geel|Grijs|Paars|Groen|Roze|Oranje|Donkerblauw|Doorzichtig|Neon)$/i, '');
  const color = product.name.match(/-\s*(Zwart|Wit|Blauw|Rood|Geel|Grijs|Paars|Groen|Roze|Oranje|Donkerblauw|Doorzichtig|Neon)$/i)?.[1] || '';

  if (product.isConsole) {
    return `${name} ${color} console product photo white background`.trim();
  }
  if (product.sku.startsWith('ACC-')) {
    return `${name} Nintendo accessory product photo white background`;
  }
  const platform = product.platform.replace('Nintendo ', '');
  return `${product.name} ${platform} PAL Europe PEGI box art front cover`;
}

async function downloadCover(product) {
  const fn = filename(product.sku, product.name);
  const outPath = path.join(PRODUCTS_DIR, fn);

  // Stap 1: Probeer PriceCharting (beste bron voor PAL covers)
  if (!product.isConsole && !product.sku.startsWith('ACC-')) {
    const pcUrls = searchPriceCharting(product);
    if (pcUrls.length) {
      // Eerste image = voorkant box art
      const buf = await tryDownloadImage(pcUrls.slice(0, 3));
      if (buf) {
        try {
          const size = await processImage(buf, outPath);
          return { sku: product.sku, ok: true, file: fn, size, path: `/images/products/${fn}`, source: 'pricecharting' };
        } catch {}
      }
    }
  }

  // Stap 2: Fallback naar Google Image Search
  const query = buildGoogleQuery(product);
  const googleUrls = searchGoogle(query);
  if (googleUrls.length) {
    const buf = await tryDownloadImage(googleUrls);
    if (buf) {
      try {
        const size = await processImage(buf, outPath);
        return { sku: product.sku, ok: true, file: fn, size, path: `/images/products/${fn}`, source: 'google' };
      } catch (e) {
        return { sku: product.sku, ok: false, reason: e.message };
      }
    }
  }

  return { sku: product.sku, ok: false, reason: 'geen geldige afbeelding (PC+Google)' };
}

// Parallel batch met concurrency limiet
async function batchDownload(products, concurrency = CONCURRENCY) {
  const results = [];
  let idx = 0;
  let pcCount = 0, googleCount = 0;

  async function worker() {
    while (idx < products.length) {
      const i = idx++;
      const p = products[i];
      process.stdout.write(`[${i + 1}/${products.length}] ${p.sku} "${p.name}"...`);
      const result = await downloadCover(p);
      if (result.ok) {
        if (result.source === 'pricecharting') pcCount++;
        else googleCount++;
        console.log(` OK (${(result.size / 1024).toFixed(1)}KB) [${result.source}]`);
      } else {
        console.log(` MISLUKT: ${result.reason}`);
      }
      results.push(result);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, products.length) }, () => worker()));
  console.log(`\nBronnen: PriceCharting ${pcCount}, Google ${googleCount}`);
  return results;
}

function updateProductsJson(results) {
  const ok = results.filter(r => r.ok);
  if (!ok.length) return 0;

  const products = loadProducts();
  let updated = 0;
  for (const r of ok) {
    const p = products.find(prod => prod.sku === r.sku);
    if (p) { p.image = r.path; updated++; }
  }
  if (updated) fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2) + '\n');
  return updated;
}

// ===== PLATFORM FILTER =====

const PLATFORM_MAP = {
  'nes': 'NES', 'snes': 'Super Nintendo', 'n64': 'Nintendo 64',
  'gb': 'Game Boy', 'gbc': 'Game Boy Color', 'gba': 'Game Boy Advance',
  'gc': 'GameCube', 'ds': 'Nintendo DS', '3ds': 'Nintendo 3DS',
  'wii': 'Wii', 'wiiu': 'Wii U', 'switch': 'Nintendo Switch',
};

const SKU_PREFIX_MAP = {
  'nes': 'NES-', 'snes': 'SNES-', 'n64': 'N64-',
  'gb': 'GB-', 'gba': 'GBA-', 'gc': 'GC-',
  'ds': 'DS-', '3ds': '3DS-', 'wii': 'WII-',
  'wiiu': 'WIIU-', 'switch': 'SW-',
};

// ===== CLI =====

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === '--check') {
    const products = loadProducts();
    const problems = findProblems(products);
    if (!problems.length) { console.log('Alle 846 producten hebben geldige covers!'); return; }
    console.log(`\n${problems.length} problemen gevonden:\n`);
    for (const p of problems) console.log(`  ${p.issue.padEnd(18)} ${p.sku.padEnd(10)} ${p.name}`);
    console.log(`\nGebruik --fix om ontbrekende covers automatisch te downloaden.`);
    return;
  }

  if (cmd === '--verify') {
    const sku = args[1];
    if (!sku) { console.log('Gebruik: --verify SKU'); return; }
    const products = loadProducts();
    const p = products.find(x => x.sku === sku);
    if (!p) { console.log(`${sku} niet gevonden`); return; }
    if (!p.image) { console.log(`${sku}: geen afbeelding ingesteld`); return; }
    const fp = path.join(__dirname, '..', 'public', p.image);
    if (!fs.existsSync(fp)) { console.log(`${sku}: bestand ontbreekt`); return; }
    const meta = await sharp(fp).metadata();
    const stat = fs.statSync(fp);
    console.log(`${sku} "${p.name}"\n  ${p.image}\n  ${(stat.size/1024).toFixed(1)}KB  ${meta.width}x${meta.height}  ${meta.format}`);
    console.log(`  Status: ${meta.width === 500 && meta.height === 500 && stat.size > 3000 ? 'OK' : 'PROBLEEM'}`);
    return;
  }

  if (cmd === '--redownload') {
    const platformKey = args[1];
    const products = loadProducts();

    let toFix;
    if (platformKey) {
      const prefix = SKU_PREFIX_MAP[platformKey.toLowerCase()];
      const platform = PLATFORM_MAP[platformKey.toLowerCase()];
      if (!prefix && !platform) {
        console.log(`Onbekend platform: ${platformKey}`);
        console.log(`Beschikbaar: ${Object.keys(PLATFORM_MAP).join(', ')}`);
        return;
      }
      toFix = products.filter(p => {
        if (p.isConsole || p.sku.startsWith('ACC-') || p.sku.startsWith('CON-')) return false;
        if (prefix && p.sku.startsWith(prefix)) return true;
        if (platform && p.platform === platform) return true;
        return false;
      });
    } else {
      toFix = products.filter(p => !p.isConsole && !p.sku.startsWith('ACC-') && !p.sku.startsWith('CON-'));
    }

    if (!toFix.length) { console.log('Geen producten gevonden'); return; }
    console.log(`${toFix.length} covers herdownloaden${platformKey ? ` (${platformKey})` : ''} (${CONCURRENCY} parallel)\n`);

    const results = await batchDownload(toFix);
    const ok = results.filter(r => r.ok);
    const fail = results.filter(r => !r.ok);

    if (ok.length) {
      const updated = updateProductsJson(results);
      console.log(`${ok.length} gedownload, ${updated} producten bijgewerkt in products.json`);
    }
    if (fail.length) {
      console.log(`${fail.length} mislukt:`);
      fail.forEach(f => console.log(`  ${f.sku}: ${f.reason}`));
    }
    return;
  }

  if (cmd === '--fix') {
    const products = loadProducts();
    const targetSku = args[1];

    let toFix;
    if (targetSku) {
      const p = products.find(x => x.sku === targetSku);
      if (!p) { console.log(`${targetSku} niet gevonden`); return; }
      toFix = [p];
    } else {
      const problems = findProblems(products);
      toFix = problems.map(prob => products.find(p => p.sku === prob.sku)).filter(Boolean);
    }

    if (!toFix.length) { console.log('Niets te fixen!'); return; }
    console.log(`${toFix.length} covers te downloaden (${CONCURRENCY} parallel)\n`);

    const results = await batchDownload(toFix);
    const ok = results.filter(r => r.ok);
    const fail = results.filter(r => !r.ok);

    if (ok.length) {
      const updated = updateProductsJson(results);
      console.log(`${ok.length} gedownload, ${updated} producten bijgewerkt in products.json`);
    }
    if (fail.length) {
      console.log(`${fail.length} mislukt:`);
      fail.forEach(f => console.log(`  ${f.sku}: ${f.reason}`));
    }
    return;
  }

  if (cmd === '--batch') {
    const skus = args.slice(1);
    if (!skus.length) { console.log('Gebruik: --batch SKU1 SKU2 ...'); return; }
    const products = loadProducts();
    const toFix = skus.map(s => products.find(p => p.sku === s)).filter(Boolean);
    if (!toFix.length) { console.log('Geen geldige SKUs'); return; }

    const results = await batchDownload(toFix);
    updateProductsJson(results);
    return;
  }

  if (args.length >= 1 && /^[A-Z0-9]+-\d+$/.test(args[0])) {
    const products = loadProducts();
    const p = products.find(x => x.sku === args[0]);
    if (!p) { console.log(`${args[0]} niet gevonden`); return; }
    const result = await downloadCover(p);
    if (result.ok) {
      updateProductsJson([result]);
      console.log(`OK: ${result.file} (${(result.size/1024).toFixed(1)}KB) [${result.source}]`);
    } else {
      console.log(`Mislukt: ${result.reason}`);
    }
    return;
  }

  console.log(`Cover Art Manager — Gameshop Enter
  Primaire bron: PriceCharting PAL | Fallback: Google Images

Gebruik:
  --check              Toon ontbrekende/kapotte covers
  --fix                Download alle ontbrekende covers
  --fix SKU            Download cover voor 1 product
  --batch SKU1 SKU2    Download meerdere covers
  --verify SKU         Verifieer 1 cover
  --redownload         Herdownload ALLE game covers (PriceCharting + Google)
  --redownload nes     Herdownload per platform
  SKU                  Download cover voor 1 product`);
}

main().catch(console.error);
