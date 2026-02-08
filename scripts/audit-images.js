#!/usr/bin/env node
const products = require('../src/data/products.json');
const fs = require('fs');
const path = require('path');

const total = products.length;
const withImage = products.filter(p => p.image && p.image.trim() !== '');
const withoutImage = products.filter(p => !p.image || (typeof p.image === 'string' && p.image.trim() === ''));

const missingFiles = [];
const existingFiles = [];
const smallFiles = [];

for (const p of withImage) {
  const filePath = path.join(__dirname, '..', 'public', p.image);
  if (!fs.existsSync(filePath)) {
    missingFiles.push({ sku: p.sku, name: p.name, image: p.image });
  } else {
    const stats = fs.statSync(filePath);
    if (stats.size < 5000) {
      smallFiles.push({ sku: p.sku, name: p.name, image: p.image, size: stats.size });
    }
    existingFiles.push(p.sku);
  }
}

// Check for orphan files (on disk but not in products.json)
const allFiles = fs.readdirSync(path.join(__dirname, '..', 'public', 'images', 'products'));
const referencedFiles = new Set(withImage.map(p => path.basename(p.image)));
const orphanFiles = allFiles.filter(f => !referencedFiles.has(f));

console.log('=== IMAGE AUDIT ===');
console.log('Totaal producten:', total);
console.log('Met image pad:', withImage.length);
console.log('Zonder image (null/empty):', withoutImage.length);
console.log('Image pad maar bestand mist:', missingFiles.length);
console.log('Bestanden op disk:', allFiles.length);
console.log('Wees-bestanden (niet gerefereerd):', orphanFiles.length);
console.log('Te kleine bestanden (<5KB):', smallFiles.length);

if (withoutImage.length > 0) {
  console.log('\n=== PRODUCTEN ZONDER IMAGE ===');
  withoutImage.forEach(p => console.log(`  ${p.sku} - ${p.name} [image: ${JSON.stringify(p.image)}]`));
}

if (missingFiles.length > 0) {
  console.log('\n=== IMAGE PAD MAAR BESTAND MIST ===');
  missingFiles.forEach(p => console.log(`  ${p.sku} - ${p.name} -> ${p.image}`));
}

if (smallFiles.length > 0) {
  console.log('\n=== TE KLEINE BESTANDEN (<5KB) ===');
  smallFiles.forEach(p => console.log(`  ${p.sku} - ${p.name} -> ${p.image} (${p.size} bytes)`));
}

if (orphanFiles.length > 0) {
  console.log('\n=== WEES-BESTANDEN (niet in products.json) ===');
  orphanFiles.forEach(f => console.log(`  ${f}`));
}

// Platform breakdown
const platforms = {};
for (const p of products) {
  const plat = p.platform || (p.isConsole ? 'Console' : 'Onbekend');
  if (!platforms[plat]) platforms[plat] = { total: 0, withImage: 0, missing: 0, small: 0 };
  platforms[plat].total++;
  if (p.image && p.image.trim() !== '') {
    const filePath = path.join(__dirname, '..', 'public', p.image);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size < 5000) platforms[plat].small++;
      else platforms[plat].withImage++;
    } else {
      platforms[plat].missing++;
    }
  }
}

console.log('\n=== PER PLATFORM ===');
for (const [plat, data] of Object.entries(platforms).sort((a, b) => a[0].localeCompare(b[0]))) {
  const ok = data.withImage;
  const pct = Math.round((ok / data.total) * 100);
  console.log(`  ${plat}: ${ok}/${data.total} OK (${pct}%) | mist: ${data.missing} | te klein: ${data.small}`);
}
