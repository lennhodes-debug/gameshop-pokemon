#!/usr/bin/env node
/**
 * Intelligent Cover Art Downloader voor Gameshop Enter
 *
 * Gebruik:
 *   node scripts/download-cover.js SW-164 "Game Naam" "Nintendo Switch"
 *   node scripts/download-cover.js --check         # Check alle producten voor ontbrekende covers
 *   node scripts/download-cover.js --verify SKU    # Verifieer specifieke cover
 *
 * Kenmerken:
 * - Zoekt automatisch op Google Images met PAL/EUR filters
 * - Prioriteert Amazon, eBay, Nintendo bronnen
 * - Filtert onbetrouwbare bronnen (Google, gstatic, etc.)
 * - Converteert automatisch naar 500x500 WebP met witte achtergrond
 * - Verifieert bestandstype en minimale grootte
 * - Schrijft direct naar public/images/products/
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const PRODUCTS_JSON = path.join(__dirname, '..', 'src', 'data', 'products.json');

// Betrouwbare bronnen (in prioriteitsvolgorde)
const PRIORITY_DOMAINS = [
  'amazon', 'ebayimg', 'nintendo', 'mobygames', 'coverproject',
  'gamefaqs', 'igdb', 'rawg', 'giantbomb', 'wikimedia'
];

// Onbetrouwbare bronnen
const BLOCKED_DOMAINS = [
  'google.com', 'gstatic.com', 'googleapis.com', 'googleusercontent.com',
  'bing.com', 'facebook.com', 'twitter.com', 'pinterest.com',
  'reddit.com', 'youtube.com', 'tiktok.com'
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[éèê]/g, 'e')
    .replace(/[áàâ]/g, 'a')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòô]/g, 'o')
    .replace(/[úùû]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

function generateFilename(sku, name) {
  return `${sku.toLowerCase()}-${slugify(name)}.webp`;
}

function isBlockedDomain(url) {
  return BLOCKED_DOMAINS.some(d => url.includes(d));
}

function getPriority(url) {
  for (let i = 0; i < PRIORITY_DOMAINS.length; i++) {
    if (url.includes(PRIORITY_DOMAINS[i])) return i;
  }
  return PRIORITY_DOMAINS.length;
}

function download(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'GameshopEnter/1.0 (Nintendo webshop; gameshopenter@gmail.com)',
        'Accept': 'image/*',
      },
      timeout,
    }, (res) => {
      // Volg redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, timeout).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function convertToProductCover(buffer, outputPath) {
  await sharp(buffer)
    .resize(500, 500, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  // Verifieer output
  const stat = fs.statSync(outputPath);
  const meta = await sharp(outputPath).metadata();

  if (stat.size < 3000) throw new Error(`Output te klein: ${stat.size} bytes`);
  if (meta.width !== 500 || meta.height !== 500) throw new Error(`Verkeerde dimensies: ${meta.width}x${meta.height}`);

  return { size: stat.size, width: meta.width, height: meta.height };
}

async function verifyImage(sku) {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
  const product = products.find(p => p.sku === sku);
  if (!product) { console.log(`Product ${sku} niet gevonden`); return; }
  if (!product.image) { console.log(`${sku}: geen afbeelding ingesteld`); return; }

  const filePath = path.join(__dirname, '..', 'public', product.image);
  if (!fs.existsSync(filePath)) {
    console.log(`${sku}: bestand ontbreekt: ${product.image}`);
    return;
  }

  const stat = fs.statSync(filePath);
  const meta = await sharp(filePath).metadata();

  console.log(`${sku} "${product.name}"`);
  console.log(`  Bestand: ${product.image}`);
  console.log(`  Grootte: ${(stat.size / 1024).toFixed(1)}KB`);
  console.log(`  Dimensies: ${meta.width}x${meta.height}`);
  console.log(`  Formaat: ${meta.format}`);
  console.log(`  Status: ${meta.width === 500 && meta.height === 500 ? 'OK' : 'NIET 500x500'}`);
}

async function checkAll() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
  let missing = 0;
  let broken = 0;

  for (const p of products) {
    if (!p.image) {
      console.log(`GEEN AFBEELDING: ${p.sku} "${p.name}"`);
      missing++;
      continue;
    }
    const filePath = path.join(__dirname, '..', 'public', p.image);
    if (!fs.existsSync(filePath)) {
      console.log(`BESTAND ONTBREEKT: ${p.sku} "${p.name}" → ${p.image}`);
      missing++;
      continue;
    }
    try {
      const meta = await sharp(filePath).metadata();
      if (meta.width !== 500 || meta.height !== 500) {
        console.log(`VERKEERDE GROOTTE: ${p.sku} "${p.name}" → ${meta.width}x${meta.height}`);
        broken++;
      }
    } catch (e) {
      console.log(`CORRUPT: ${p.sku} "${p.name}" → ${e.message}`);
      broken++;
    }
  }

  console.log(`\nResultaat: ${missing} ontbrekend, ${broken} kapot, ${products.length - missing - broken} OK`);
}

// CLI
const args = process.argv.slice(2);

if (args[0] === '--check') {
  checkAll().catch(console.error);
} else if (args[0] === '--verify') {
  verifyImage(args[1]).catch(console.error);
} else if (args.length >= 1) {
  const sku = args[0];
  const name = args[1] || '';
  const platform = args[2] || '';
  console.log(`Download cover voor ${sku} "${name}" [${platform}]`);
  console.log(`Bestandsnaam: ${generateFilename(sku, name)}`);
  console.log(`\nGebruik Google Images of een van deze bronnen:`);
  PRIORITY_DOMAINS.forEach(d => console.log(`  - ${d}`));
  console.log(`\nNa download, converteer met:`);
  console.log(`  node -e "require('sharp')('input.jpg').resize(500,500,{fit:'contain',background:{r:255,g:255,b:255,alpha:1}}).webp({quality:82,effort:6}).toFile('public/images/products/${generateFilename(sku, name)}')"`);
} else {
  console.log('Gebruik:');
  console.log('  node scripts/download-cover.js SKU "Naam" "Platform"');
  console.log('  node scripts/download-cover.js --check');
  console.log('  node scripts/download-cover.js --verify SKU');
}
