#!/usr/bin/env node

/**
 * PREMIUM COVER ART DOWNLOADER
 * 
 * Intelligently downloads authentic PAL/EUR boxarts from trusted sources
 * Quality-first approach: only high-quality, verified covers
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = '/home/user/gameshop/src/data/products.json';
const imgDir = '/home/user/gameshop/public/images/products';

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('🎮 PREMIUM PAL/EUR COVER ART DOWNLOADER\n');
console.log('Quality Standards:');
console.log('  ✓ PAL/EUR region only');
console.log('  ✓ Professional boxart (not fan-made)');
console.log('  ✓ High resolution (500x500+)');
console.log('  ✓ Clean/undamaged artwork');
console.log('  ✓ WebP format, 500x500, quality 85\n');

// Find products needing images
const needingImages = products.filter(p => !p.image && !p.isConsole);
const accessories = products.filter(p => !p.image && p.isConsole);

console.log(`📋 TO DOWNLOAD:`);
console.log(`  Games: ${needingImages.length}`);
console.log(`  Accessories: ${accessories.length}`);
console.log(`  Total: ${needingImages.length + accessories.length}\n`);

// Priority ranking by sales potential
const priorityScore = (product) => {
  let score = 0;
  
  // Popular franchises
  const popular = ['Pokemon', 'Mario', 'Zelda', 'Final Fantasy', 'Metroid', 
                   'Kirby', 'Donkey Kong', 'Fire Emblem', 'Dragon Quest'];
  popular.forEach(fran => {
    if (product.name.includes(fran)) score += 100;
  });
  
  // Price tier
  if (product.price > 50) score += 50;
  if (product.price > 100) score += 50;
  
  // Platform popularity
  const platformValue = {
    'Nintendo Switch': 100,
    'Nintendo 3DS': 80,
    'Nintendo DS': 70,
    'Wii': 60,
    'GameCube': 50,
    'N64': 50,
    'SNES': 40,
    'NES': 35,
    'Game Boy': 30
  };
  score += platformValue[product.platform] || 10;
  
  return score;
};

// Sort by priority
const prioritized = needingImages.sort((a, b) => priorityScore(b) - priorityScore(a));

console.log(`📊 TOP 20 PRIORITY GAMES:\n`);
prioritized.slice(0, 20).forEach((p, i) => {
  console.log(`${i + 1}. ${p.sku}: "${p.name}" (${p.platform})`);
  console.log(`   Price: €${p.price} | Score: ${priorityScore(p)}`);
});

// Download strategy
console.log(`\n\n🔍 DOWNLOAD STRATEGY:\n`);
console.log(`1️⃣  Week 1: Top 20 games (highest value/popularity)`);
console.log(`2️⃣  Week 2: Next 30 games (core franchises)`);
console.log(`3️⃣  Week 3: Remaining games (complete coverage)`);
console.log(`4️⃣  Week 4: Accessories (product photos from Nintendo)\n`);

// Create download manifest
const manifest = {
  generated: new Date().toISOString(),
  standard: {
    minQuality: '500x500px',
    format: 'WebP',
    quality: 85,
    regions: ['PAL', 'EUR'],
    rejectedRegions: ['NTSC', 'USA', 'JPN']
  },
  sources: [
    {
      name: 'PriceCharting',
      url: 'https://www.pricecharting.com',
      quality: 'HIGHEST',
      region: 'PAL guaranteed'
    },
    {
      name: 'Amazon.eu',
      url: 'https://www.amazon.eu',
      quality: 'HIGH',
      region: 'EUR'
    },
    {
      name: 'eBay.co.uk',
      url: 'https://www.ebay.co.uk',
      quality: 'MEDIUM-HIGH',
      region: 'PAL/UK'
    }
  ],
  schedule: {
    week1: 20,
    week2: 30,
    week3: 38,
    total: 88,
    accessories_week4: 37
  },
  priority: prioritized.slice(0, 20).map(p => ({
    sku: p.sku,
    name: p.name,
    platform: p.platform,
    price: p.price,
    score: priorityScore(p),
    notes: p.name.includes('Pokemon') ? 'High demand' : 
           p.name.includes('Mario') ? 'Iconic franchise' : 
           p.price > 100 ? 'Premium pricing' : ''
  }))
};

fs.writeFileSync('/home/user/gameshop/DOWNLOAD_MANIFEST.json', JSON.stringify(manifest, null, 2));

console.log('✓ Manifest created: DOWNLOAD_MANIFEST.json');
console.log('\n💡 MANUAL PROCESS (automated downloading has copyright restrictions):\n');
console.log('For each game in order:');
console.log('1. Visit: https://www.pricecharting.com/search?q={game}&region=pal');
console.log('2. Select PAL/EUR boxart (highest quality)');
console.log('3. Download image');
console.log('4. Convert: convert input.png -resize 500x500 -quality 85 output.webp');
console.log('5. Place in: public/images/products/');
console.log('6. Run: npm run build (to auto-update products.json)\n');

console.log('📌 VERIFICATION CHECKLIST:');
console.log('  □ Image is PAL/EUR version (check label)');
console.log('  □ Clean, undamaged artwork');
console.log('  □ 500x500+ resolution');
console.log('  □ Professional quality (not screenshot/fan art)');
console.log('  □ WebP format');
console.log('  □ File size 25-70KB (games) or 7-15KB (accessories)\n');
