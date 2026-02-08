#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, '..', '.cover-art-temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const games = [
  { sku: 'sw-126', name: 'Link\'s Awakening', color: '#2E5090' },
  { sku: 'sw-117', name: 'Witcher 3', color: '#1a1a1a' },
  { sku: 'sw-099', name: 'Skyrim', color: '#4a3728' },
  { sku: 'sw-088', name: 'Pokemon Pikachu', color: '#FFD700' },
  { sku: 'sw-078', name: 'Pokemon Eevee', color: '#8B4513' },
  { sku: 'sw-028', name: 'Final Fantasy X', color: '#003366' },
  { sku: 'sw-023', name: 'Doom Eternal', color: '#FF0000' },
  { sku: 'sw-021', name: 'Donkey Kong', color: '#FF6600' },
  { sku: 'con-003', name: 'Switch Lite Blue', color: '#4A90E2' },
  { sku: 'con-004', name: 'Switch Lite Yellow', color: '#FFDC00' },
];

(async () => {
  console.log('🎨 Generating test cover art images...\n');
  
  for (const game of games) {
    try {
      const filename = `${game.sku}-${game.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filepath = path.join(tempDir, filename);
      
      const svg = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="${game.color}"/>
        <text x="250" y="200" font-size="48" fill="white" text-anchor="middle" font-weight="bold">${game.sku}</text>
        <text x="250" y="280" font-size="32" fill="white" text-anchor="middle">${game.name}</text>
        <text x="250" y="450" font-size="16" fill="rgba(255,255,255,0.5)" text-anchor="middle">Test Cover</text>
      </svg>`;
      
      await sharp(Buffer.from(svg))
        .png()
        .toFile(filepath);
      
      const stats = fs.statSync(filepath);
      console.log(`✅ ${filename.substring(0,40)} (${(stats.size/1024).toFixed(1)}KB)`);
    } catch (err) {
      console.log(`❌ ${game.sku}: ${err.message}`);
    }
  }
  
  console.log('\n✅ Test images created');
  console.log(`📁 Location: ${tempDir}`);
  console.log(`📊 Total: ${games.length} images\n`);
})();
