#!/usr/bin/env node
/**
 * Cover Art Manager — Gameshop Enter
 *
 * Gebruik:
 *   node scripts/download-cover.js --check              # Toon ontbrekende/kapotte covers
 *   node scripts/download-cover.js --fix                 # Download alle ontbrekende covers automatisch
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
const CONCURRENCY = 5;

const BLOCKED = new Set([
  'google.com', 'gstatic.com', 'googleapis.com', 'googleusercontent.com',
  'bing.com', 'facebook.com', 'twitter.com', 'pinterest.com',
  'reddit.com', 'youtube.com', 'tiktok.com', 'aliexpress.com',
  'amazon.co.jp', 'amazon.com', 'play-asia.com', 'suruga-ya.com',
  'mercari.com', 'rakuten.co.jp', 'yahoo.co.jp'
]);

const PRIORITY = ['amazon.de', 'amazon.nl', 'bol.com', 'nintendo.nl', 'nintendo.de',
  'amazon.co.uk', 'ebayimg', 'mobygames', 'coverproject', 'gamefaqs',
  'nintendo', 'igdb', 'rawg', 'giantbomb', 'wikimedia'];

// ===== HELPERS =====

function slugify(name) {
  return name.toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[áàâ]/g, 'a').replace(/[íìî]/g, 'i')
    .replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 60);
}

function filename(sku, name) {
  return `${sku.toLowerCase()}-${slugify(name)}.webp`;
}

function isBlocked(url) {
  for (const d of BLOCKED) if (url.includes(d)) return true;
  return false;
}

function getPriority(url) {
  for (let i = 0; i < PRIORITY.length; i++) if (url.includes(PRIORITY[i])) return i;
  return PRIORITY.length;
}

function dl(url, timeout = 8) {
  try {
    const buf = execSync(
      `curl -sL -m ${timeout} -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -H "Accept: image/*" "${url}"`,
      { maxBuffer: 20 * 1024 * 1024, timeout: (timeout + 2) * 1000 }
    );
    return buf;
  } catch {
    return null;
  }
}

function searchGoogle(query) {
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
      if (!isBlocked(u) && !urls.includes(u)) urls.push(u);
    }
    urls.sort((a, b) => getPriority(a) - getPriority(b));
    return urls;
  } catch {
    return [];
  }
}

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

function buildQuery(product) {
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
  const query = buildQuery(product);
  const urls = searchGoogle(query);
  if (!urls.length) return { sku: product.sku, ok: false, reason: 'geen URLs gevonden' };

  const buf = await tryDownloadImage(urls);
  if (!buf) return { sku: product.sku, ok: false, reason: 'geen geldige afbeelding' };

  const fn = filename(product.sku, product.name);
  const outPath = path.join(PRODUCTS_DIR, fn);
  try {
    const size = await processImage(buf, outPath);
    return { sku: product.sku, ok: true, file: fn, size, path: `/images/products/${fn}` };
  } catch (e) {
    return { sku: product.sku, ok: false, reason: e.message };
  }
}

// Parallel batch met concurrency limiet
async function batchDownload(products, concurrency = CONCURRENCY) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < products.length) {
      const i = idx++;
      const p = products[i];
      process.stdout.write(`[${i + 1}/${products.length}] ${p.sku} "${p.name}"...`);
      const result = await downloadCover(p);
      if (result.ok) {
        console.log(` OK (${(result.size / 1024).toFixed(1)}KB)`);
      } else {
        console.log(` MISLUKT: ${result.reason}`);
      }
      results.push(result);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, products.length) }, () => worker()));
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
      console.log(`\n${ok.length} gedownload, ${updated} producten bijgewerkt in products.json`);
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
      console.log(`\n${ok.length} gedownload, ${updated} producten bijgewerkt in products.json`);
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

  // Enkele SKU met naam
  if (args.length >= 1 && /^[A-Z]+-\d+$/.test(args[0])) {
    const products = loadProducts();
    const p = products.find(x => x.sku === args[0]);
    if (!p) { console.log(`${args[0]} niet gevonden`); return; }
    const result = await downloadCover(p);
    if (result.ok) {
      updateProductsJson([result]);
      console.log(`OK: ${result.file} (${(result.size/1024).toFixed(1)}KB)`);
    } else {
      console.log(`Mislukt: ${result.reason}`);
    }
    return;
  }

  console.log(`Cover Art Manager — Gameshop Enter

Gebruik:
  --check              Toon ontbrekende/kapotte covers
  --fix                Download alle ontbrekende covers (parallel)
  --fix SKU            Download cover voor 1 product
  --batch SKU1 SKU2    Download meerdere covers
  --verify SKU         Verifieer 1 cover
  --redownload         Herdownload ALLE game covers
  --redownload nes     Herdownload per platform (nes/snes/n64/gb/gba/gc/ds/3ds/wii/wiiu/switch)
  SKU                  Download cover voor 1 product`);
}

main().catch(console.error);
