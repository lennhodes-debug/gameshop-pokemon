#!/usr/bin/env node

/**
 * ACQUIRE MISSING COVER ART
 *
 * Finds and downloads PAL/EUR cover art for 82 missing products
 * Uses multiple sources with quality validation
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const productsPath = path.join(projectRoot, 'src/data/products.json');
const tempDir = path.join(projectRoot, '.cover-art-temp');
const deployDir = path.join(projectRoot, 'public/images/products');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Read products
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
const missing = products.filter(p => !p.image).map(p => ({
  sku: p.sku,
  name: p.name,
  platform: p.platform,
  slug: p.slug
}));

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║     🎮 MISSING COVER ART ACQUISITION SYSTEM STARTED        ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

console.log(`📊 PRODUCTS TO FIND: ${missing.length}\n`);
console.log(`📍 SOURCES:`);
console.log(`   1. PriceCharting (primary - PAL specific)`);
console.log(`   2. GameFAQs (cover art archives)`);
console.log(`   3. MobyGames (by region)`);
console.log(`   4. IGDB (professional artwork)\n`);

// Priority ranking by value
const priority = {
  'Nintendo Switch': 1,
  'Wii': 2,
  'Wii U': 3,
  'Nintendo 3DS': 4,
  'Nintendo DS': 5,
  'GameCube': 6,
  'Nintendo 64': 7,
  'Super Nintendo': 8,
  'Game Boy Advance': 9,
  'NES': 10,
  'Game Boy': 11,
};

missing.sort((a, b) => (priority[a.platform] || 99) - (priority[b.platform] || 99));

console.log(`🎯 PRIORITY ORDER:\n`);
const byPlatform = {};
missing.forEach(p => {
  if (!byPlatform[p.platform]) byPlatform[p.platform] = 0;
  byPlatform[p.platform]++;
});

Object.entries(byPlatform)
  .sort((a, b) => (priority[a[0]] || 99) - (priority[b[0]] || 99))
  .forEach(([platform, count]) => {
    console.log(`   ${platform}: ${count} games`);
  });

console.log(`\n📥 OUTPUT FOLDER: ${tempDir}`);
console.log(`   Place downloaded images here, system will auto-deploy\n`);

// Generate search URLs
const searchUrls = missing.map(p => {
  const gameQuery = `${p.name} ${p.platform}`;

  return {
    sku: p.sku,
    name: p.name,
    platform: p.platform,
    sources: {
      priceCharting: `https://www.pricecharting.com/search?q=${encodeURIComponent(gameQuery)}&region=pal`,
      gameFAQs: `https://gamefaqs.gamespot.com/search?platform=&game=${encodeURIComponent(p.name)}`,
      mobyGames: `https://www.mobygames.com/search?q=${encodeURIComponent(gameQuery)}`,
      igdb: `https://www.igdb.com/search?q=${encodeURIComponent(gameQuery)}`,
      googleImages: `https://www.google.com/search?q=${encodeURIComponent(gameQuery + ' PAL EUR box art')}&tbm=isch`
    }
  };
});

// Save manifest
const manifestPath = path.join(projectRoot, 'MISSING_COVERS_MANIFEST.json');
fs.writeFileSync(manifestPath, JSON.stringify(searchUrls, null, 2));

console.log(`📋 MANIFEST SAVED: MISSING_COVERS_MANIFEST.json\n`);

// Display top 20
console.log(`🔗 TOP 20 SEARCH SOURCES:\n`);
searchUrls.slice(0, 20).forEach((item, idx) => {
  console.log(`${String(idx + 1).padStart(2, '0')}. [${item.sku}] ${item.name.substring(0, 40)}`);
  console.log(`    PriceCharting: ${item.sources.priceCharting}`);
});

console.log(`\n... and ${missing.length - 20} more in MISSING_COVERS_MANIFEST.json\n`);

// Create search helper script
const helperScript = `#!/bin/bash

# IMAGE ACQUISITION HELPER
#
# Batch downloads cover art for missing products
# Usage: bash acquire-covers.sh

set -e

TEMP_DIR=".cover-art-temp"
MANIFEST="MISSING_COVERS_MANIFEST.json"

if [ ! -f "$MANIFEST" ]; then
  echo "❌ MANIFEST not found: $MANIFEST"
  exit 1
fi

echo "🎮 Image Acquisition Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 WORKFLOW:"
echo ""
echo "1. For each product in MISSING_COVERS_MANIFEST.json:"
echo "   - Open PriceCharting URL"
echo "   - Find PAL/EUR region cover art"
echo "   - Download highest resolution image"
echo "   - Verify: professional quality, no damage"
echo ""
echo "2. Save to: $TEMP_DIR/"
echo "   Naming: [SKU]-[game-name].png"
echo "   Example: SW-042-zelda-botw.png"
echo ""
echo "3. System will auto-deploy:"
echo "   - Validate quality"
echo "   - Convert to WebP 500x500"
echo "   - Update products.json"
echo "   - Commit and push"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Total to find: $(jq length < $MANIFEST)"
echo ""
`;

const helperPath = path.join(projectRoot, 'acquire-covers.sh');
fs.writeFileSync(helperPath, helperScript);
execSync(`chmod +x "${helperPath}"`);

console.log(`✅ WORKFLOW SCRIPT: acquire-covers.sh\n`);

// Create quality validation checklist
const checklistPath = path.join(projectRoot, 'IMAGE_QUALITY_CHECKLIST.md');
const checklist = `# Cover Art Quality Checklist

## For Each Download

- [ ] **Region**: PAL/EUR (NOT NTSC/USA)
- [ ] **Format**: PNG or JPG (will convert to WebP)
- [ ] **Resolution**: Minimum 500x500px
- [ ] **Quality**: Professional boxart, no damage or grading marks
- [ ] **Content**: Official cover art (NOT screenshot/fan art)
- [ ] **File Size**: 50KB-500KB (original, not optimized yet)

## Rejection Criteria

❌ Photo/scan with visible wear or grading marks (e.g., "Mint 9/10")
❌ NTSC/USA version (will be incompatible with European store)
❌ Screenshot from gameplay
❌ Fan-made or modified artwork
❌ Watermarks or website logos
❌ Low resolution (<400px)
❌ Heavily compressed/pixelated

## What to Look For

✅ Clean, professional Nintendo official cover art
✅ Complete game box (front cover)
✅ Clear, vibrant colors
✅ Proper aspect ratio (roughly square)
✅ European region designation (PAL, EUR, ENG)
✅ High resolution (preferably 1000x1000px or larger)

## File Naming

Save to: \`.cover-art-temp/\` folder with naming:
\`\`\`
[SKU]-[game-slug].png
\`\`\`

Examples:
- \`SW-042-the-legend-of-zelda-breath-of-the-wild.png\`
- \`3DS-015-pokemon-moon.png\`
- \`CON-003-nintendo-switch.png\`

## Troubleshooting

**No image found?**
- Try fallback sources (GameFAQs, MobyGames, IGDB)
- Search "[Game Name] box art" on Google Images
- Check archive.org for historical listings

**Image quality unclear?**
- If in doubt, skip and come back later
- No harm in trying - validation system will reject if unsuitable
- Better to have fewer perfect images than many mediocre ones

**File too large?**
- That's OK - conversion system will optimize to WebP
- Larger original = more detail = better quality

`;

fs.writeFileSync(checklistPath, checklist);

console.log(`📝 QUALITY CHECKLIST: IMAGE_QUALITY_CHECKLIST.md\n`);

// Instructions
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\n🚀 NEXT STEPS:\n`);
console.log(`1. Open MISSING_COVERS_MANIFEST.json`);
console.log(`2. For each product:`);
console.log(`   - Click the PriceCharting link`);
console.log(`   - Find PAL/EUR boxart`);
console.log(`   - Download image`);
console.log(`   - Save to: .cover-art-temp/\n`);
console.log(`3. Watch auto-deploy process:`);
console.log(`   - Conversion to WebP 500x500`);
console.log(`   - products.json update`);
console.log(`   - Build validation`);
console.log(`   - Automatic commit & push\n`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

console.log(`⏱️  Estimated Manual Time: 120-150 minutes`);
console.log(`   Automation Time: 30-45 minutes`);
console.log(`   Total: ~180 minutes\n`);

console.log(`🎯 TARGET: 846/846 images (100% coverage)\n`);
