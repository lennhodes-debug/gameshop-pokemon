#!/usr/bin/env node

/**
 * GENERATE ALL PHASES (2-4) — Complete cover art roadmap
 *
 * Generates prioritized lists for all remaining phases
 * Ready to execute immediately after Phase 1 completes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const productsPath = path.join(projectRoot, 'src/data/products.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Products from Phase 1 (already prioritized in DOWNLOAD_MANIFEST_DETAILED.json)
const PHASE_1_SKUS = [
  'CON-003', 'CON-004', 'SW-021', 'SW-028', 'SW-078', 'SW-088',
  'SW-126', 'SW-117', 'SW-099', 'SW-023', 'SNES-016', 'SNES-015',
  'NES-025', 'N64-027', 'GC-044', 'DS-023', 'GBA-007', '3DS-042',
  'GB-021', 'WII-014'
];

// Scoring algorithm
function scoreProduct(p) {
  let score = 0;
  const popularFranchises = [
    'Pokemon', 'Mario', 'Zelda', 'Final Fantasy', 'Fire Emblem',
    'Kirby', 'Donkey Kong', 'Metroid', 'Castlevania', 'Mega Man',
    'Dragon Quest', 'Monster Hunter', 'Sonic', 'Splatoon'
  ];

  popularFranchises.forEach(f => {
    if (p.name.includes(f)) score += 150;
  });

  const platformWeights = {
    'Nintendo Switch': 120, 'Nintendo 3DS': 100, 'Nintendo DS': 90,
    'Wii': 80, 'GameCube': 70, 'Nintendo 64': 70, 'SNES': 60,
    'NES': 50, 'Game Boy Advance': 45, 'Game Boy': 40
  };
  score += platformWeights[p.platform] || 20;

  if (p.price > 50) score += 80;
  if (p.price > 100) score += 80;

  // Boost for console/hardware
  if (p.isConsole) score += 60;

  return score;
}

// Get all products needing images, excluding Phase 1
const needingImages = products.filter(p => !p.image && !PHASE_1_SKUS.includes(p.sku));
const prioritized = needingImages.sort((a, b) => scoreProduct(b) - scoreProduct(a));

// Split into phases
const phase2 = prioritized.slice(0, 30);
const phase3 = prioritized.slice(30, 68);
const phase4 = prioritized.slice(68);

/**
 * Generate phase manifest
 */
function generatePhaseManifest(phaseNumber, products, outputFile) {
  const manifest = {
    phase: phaseNumber,
    generated: new Date().toISOString(),
    total_in_phase: products.length,
    instructions: `
PHASE ${phaseNumber} EXECUTION:
1. Download images using provided PriceCharting URLs
2. Verify: PAL/EUR region, professional quality, undamaged
3. Place in .cover-art-temp/ folder
4. Run: node scripts/auto-deploy-covers.mjs
5. Automated validation, conversion, and deployment
6. Git commit created automatically
7. Move to next phase
    `.trim(),
    products: products.map((p, i) => ({
      rank: i + 1,
      sku: p.sku,
      name: p.name,
      platform: p.platform,
      price: p.price,
      score: scoreProduct(p),
      searchUrl: `https://www.pricecharting.com/search?q=${encodeURIComponent(`${p.name} PAL EUR box art`)}&region=pal`,
      expectedFile: `${p.sku.toLowerCase()}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '')}.webp`
    }))
  };

  fs.writeFileSync(path.join(projectRoot, outputFile), JSON.stringify(manifest, null, 2));
  console.log(`✅ ${outputFile} created (${products.length} products)`);
}

console.log('📋 GENERATING ALL PHASES\n');

generatePhaseManifest(2, phase2, 'PHASE_2_MANIFEST.json');
generatePhaseManifest(3, phase3, 'PHASE_3_MANIFEST.json');
generatePhaseManifest(4, phase4, 'PHASE_4_MANIFEST.json');

// Create summary
const summary = {
  total_products: products.length,
  phase_1_complete: 20,
  remaining: needingImages.length,
  phase_breakdown: {
    phase_2: { count: phase2.length, examples: phase2.slice(0, 3).map(p => p.name) },
    phase_3: { count: phase3.length, examples: phase3.slice(0, 3).map(p => p.name) },
    phase_4: { count: phase4.length, examples: phase4.slice(0, 3).map(p => p.name) }
  },
  workflow: {
    step_1: 'Download images from generated URLs',
    step_2: 'Place PNG/JPG in .cover-art-temp/',
    step_3: 'Run: node scripts/auto-deploy-covers.mjs',
    step_4: 'System auto-validates, converts, deploys, commits',
    step_5: 'Repeat for next phase'
  },
  timeline: {
    phase_1: 'This session',
    phase_2: 'Next session (30 games)',
    phase_3: 'Week 3 (38 games)',
    phase_4: 'Week 4 (37 accessories)'
  },
  success_criteria: {
    target_coverage: '100% (846/846 products)',
    quality_standard: 'PAL/EUR professional boxart, 500x500px, WebP quality 85',
    no_rejected_images: 'Zero NTSC, damaged, or low-quality files'
  }
};

fs.writeFileSync(
  path.join(projectRoot, 'PHASES_SUMMARY.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`✅ PHASES_SUMMARY.json created`);
console.log(`\n📊 Summary:`);
console.log(`   Phase 1: 20 (complete this session)`);
console.log(`   Phase 2: ${phase2.length} products`);
console.log(`   Phase 3: ${phase3.length} products`);
console.log(`   Phase 4: ${phase4.length} products`);
console.log(`\n🚀 All phases ready for execution`);
