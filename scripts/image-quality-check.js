#!/usr/bin/env node
const products = require('../src/data/products.json');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'public', 'images', 'products');

// Group by file size ranges to find suspicious images
const sizeGroups = {
  tiny: [],      // < 5KB - likely broken
  small: [],     // 5-15KB - suspicious
  medium: [],    // 15-50KB - could be low quality
  good: [],      // 50KB+ - likely fine
};

const duplicateSizes = {};

for (const p of products) {
  if (!p.image) continue;
  const filePath = path.join(__dirname, '..', 'public', p.image);
  if (!fs.existsSync(filePath)) continue;

  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);

  const entry = { sku: p.sku, name: p.name, platform: p.platform, size: sizeKB, image: p.image };

  if (stats.size < 5000) sizeGroups.tiny.push(entry);
  else if (stats.size < 15000) sizeGroups.small.push(entry);
  else if (stats.size < 50000) sizeGroups.medium.push(entry);
  else sizeGroups.good.push(entry);

  // Track exact duplicate sizes (might indicate duplicate/placeholder images)
  const key = stats.size.toString();
  if (!duplicateSizes[key]) duplicateSizes[key] = [];
  duplicateSizes[key].push(entry);
}

console.log('=== IMAGE KWALITEIT ANALYSE ===');
console.log(`Tiny (<5KB):   ${sizeGroups.tiny.length} - waarschijnlijk gebroken`);
console.log(`Small (5-15KB): ${sizeGroups.small.length} - verdacht`);
console.log(`Medium (15-50KB): ${sizeGroups.medium.length} - mogelijk lage kwaliteit`);
console.log(`Good (50KB+):  ${sizeGroups.good.length} - waarschijnlijk prima`);

if (sizeGroups.tiny.length > 0) {
  console.log('\n=== TINY (<5KB) - WAARSCHIJNLIJK GEBROKEN ===');
  sizeGroups.tiny.forEach(e => console.log(`  ${e.sku} - ${e.name} (${e.sizeKB}KB)`));
}

if (sizeGroups.small.length > 0) {
  console.log('\n=== SMALL (5-15KB) - VERDACHT ===');
  sizeGroups.small.sort((a, b) => a.size - b.size);
  sizeGroups.small.forEach(e => console.log(`  ${e.sku} - ${e.name} [${e.platform}] (${e.size}KB)`));
}

// Find groups of exact same file size (possible duplicates/placeholders)
const dupes = Object.entries(duplicateSizes)
  .filter(([_, items]) => items.length >= 3)
  .sort((a, b) => b[1].length - a[1].length);

if (dupes.length > 0) {
  console.log('\n=== MOGELIJKE DUPLICATEN (zelfde bestandsgrootte, 3+ keer) ===');
  for (const [size, items] of dupes.slice(0, 10)) {
    console.log(`\n  Grootte: ${Math.round(parseInt(size)/1024)}KB (${items.length}x):`);
    items.forEach(e => console.log(`    ${e.sku} - ${e.name}`));
  }
}

// Size distribution per platform
console.log('\n=== GEMIDDELDE GROOTTE PER PLATFORM ===');
const platStats = {};
for (const p of products) {
  if (!p.image) continue;
  const filePath = path.join(__dirname, '..', 'public', p.image);
  if (!fs.existsSync(filePath)) continue;
  const stats = fs.statSync(filePath);
  const plat = p.platform;
  if (!platStats[plat]) platStats[plat] = { total: 0, count: 0, min: Infinity, max: 0 };
  platStats[plat].total += stats.size;
  platStats[plat].count++;
  platStats[plat].min = Math.min(platStats[plat].min, stats.size);
  platStats[plat].max = Math.max(platStats[plat].max, stats.size);
}

for (const [plat, data] of Object.entries(platStats).sort((a, b) => a[0].localeCompare(b[0]))) {
  const avg = Math.round(data.total / data.count / 1024);
  const min = Math.round(data.min / 1024);
  const max = Math.round(data.max / 1024);
  console.log(`  ${plat}: gem ${avg}KB | min ${min}KB | max ${max}KB | ${data.count} afbeeldingen`);
}
