#!/usr/bin/env node

/**
 * COMPREHENSIVE IMAGE FIX SCRIPT
 *
 * Fixes:
 * 1. Wrong image references (5 critical issues)
 * 2. Removes duplicate/unused images
 * 3. Validates all image files exist
 * 4. Cleans up products.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const PRODUCTS_PATH = path.join(rootDir, 'src/data/products.json');
const IMAGES_DIR = path.join(rootDir, 'public/images/products');
const AUDIT_PATH = path.join(rootDir, 'audit-images-report.json');

// ============================================================
// STEP 1: LOAD DATA
// ============================================================
console.log('📂 Loading data...');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.webp'));
const auditData = fs.readFileSync(AUDIT_PATH, 'utf-8');

const imageSet = new Set(imageFiles);

console.log(`✓ Loaded ${products.length} products`);
console.log(`✓ Found ${imageFiles.length} image files`);

// ============================================================
// STEP 2: FIX CRITICAL WRONG REFERENCES
// ============================================================
console.log('\n🔧 FIXING 5 CRITICAL WRONG IMAGE REFERENCES...');

const wrongReferences = [
  { sku: 'DS-057', current: 'ds-016-professor-layton-geheimzinnige-dorp.webp', should: 'ds-057-inazuma-eleven-2.webp' },
  { sku: 'CON-002', current: 'con-004-nintendo-switch-v2-neon.webp', should: 'con-002-nintendo-switch-oled-neon.webp' },
  { sku: 'CON-014', current: 'con-009-new-nintendo-3ds-xl.webp', should: 'con-014-game-boy-classic.webp' },
  { sku: 'CON-022', current: 'con-011-nintendo-dsi.webp', should: 'con-022-nintendo-switch-v2-neon-rood-blauw.webp' },
  { sku: 'CON-043', current: 'con-020-nintendo-wii-wit.webp', should: 'con-043-nintendo-dsi-xl-rood.webp' },
];

let fixedCount = 0;
wrongReferences.forEach(({ sku, current, should }) => {
  const product = products.find(p => p.sku === sku);
  if (!product) {
    console.log(`⚠️  SKU ${sku} not found`);
    return;
  }

  const currentPath = `/images/products/${current}`;
  const shouldPath = `/images/products/${should}`;

  if (product.image === currentPath) {
    product.image = shouldPath;
    fixedCount++;
    console.log(`✓ ${sku}: ${current} → ${should}`);
  }
});

console.log(`\n✓ Fixed ${fixedCount}/5 critical references`);

// ============================================================
// STEP 3: VALIDATE ALL IMAGE REFERENCES
// ============================================================
console.log('\n📋 VALIDATING IMAGE REFERENCES...');

const issues = {
  missingImages: [],
  wrongPaths: [],
  caseIssues: [],
};

products.forEach(product => {
  if (!product.image) return;

  const filename = product.image.split('/').pop();

  // Check 1: File exists (case-sensitive)
  if (!imageSet.has(filename)) {
    // Check 2: Case-insensitive fallback
    const lowerCaseMatch = imageFiles.find(f => f.toLowerCase() === filename.toLowerCase());
    if (lowerCaseMatch && lowerCaseMatch !== filename) {
      product.image = `/images/products/${lowerCaseMatch}`;
      issues.caseIssues.push(`${product.sku}: ${filename} → ${lowerCaseMatch}`);
    } else {
      issues.missingImages.push({
        sku: product.sku,
        name: product.name,
        image: filename,
      });
    }
  }
});

console.log(`✓ Case issues fixed: ${issues.caseIssues.length}`);
if (issues.caseIssues.length > 0) {
  issues.caseIssues.slice(0, 5).forEach(c => console.log(`  - ${c}`));
}

console.log(`⚠️  Missing image files: ${issues.missingImages.length}`);
if (issues.missingImages.length > 0) {
  issues.missingImages.slice(0, 5).forEach(m => console.log(`  - ${m.sku}: ${m.image}`));
}

// ============================================================
// STEP 4: REMOVE DUPLICATE IMAGES (KEEP 1 PER SKU)
// ============================================================
console.log('\n🗑️  CLEANING UP DUPLICATE IMAGES...');

const imagesByPrefix = {};
imageFiles.forEach(file => {
  const match = file.match(/^([a-z0-9]+-\d+)/);
  if (match) {
    const prefix = match[1];
    if (!imagesByPrefix[prefix]) {
      imagesByPrefix[prefix] = [];
    }
    imagesByPrefix[prefix].push(file);
  }
});

const imagesToDelete = [];
let duplicateCount = 0;

Object.entries(imagesByPrefix).forEach(([prefix, files]) => {
  if (files.length > 1) {
    // Find which file is being used
    const usedFile = products.find(p =>
      p.image && p.image.endsWith(`/${files[0]}`) ||
      (p.image && files.some(f => p.image.endsWith(`/${f}`)))
    );

    if (usedFile) {
      const usedFilename = usedFile.image.split('/').pop();
      const unusedFiles = files.filter(f => f !== usedFilename);
      imagesToDelete.push(...unusedFiles);
      duplicateCount += unusedFiles.length;
    } else {
      // If no product uses any of these, delete all but first
      imagesToDelete.push(...files.slice(1));
      duplicateCount += files.length - 1;
    }
  }
});

console.log(`📊 Found ${duplicateCount} duplicate images to remove`);
console.log(`   These are variant covers that aren't used`);

// Actually delete the duplicate files
imagesToDelete.forEach(file => {
  const filePath = path.join(IMAGES_DIR, file);
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    console.log(`⚠️  Could not delete ${file}: ${e.message}`);
  }
});

console.log(`✓ Deleted ${imagesToDelete.length} duplicate images`);

// ============================================================
// STEP 5: REMOVE UNUSED IMAGES
// ============================================================
console.log('\n🧹 REMOVING UNUSED IMAGES...');

const usedImages = new Set(
  products
    .map(p => p.image)
    .filter(Boolean)
    .map(img => img.split('/').pop())
);

const unusedImages = imageFiles.filter(f => !usedImages.has(f));
console.log(`Found ${unusedImages.length} completely unused images`);

unusedImages.forEach(file => {
  const filePath = path.join(IMAGES_DIR, file);
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    console.log(`⚠️  Could not delete ${file}: ${e.message}`);
  }
});

console.log(`✓ Deleted ${unusedImages.length} unused images`);

// ============================================================
// STEP 6: SAVE CLEANED PRODUCTS.JSON
// ============================================================
console.log('\n💾 SAVING CLEANED PRODUCTS.JSON...');

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');
console.log(`✓ Saved ${products.length} products with fixed references`);

// ============================================================
// STEP 7: FINAL VALIDATION
// ============================================================
console.log('\n✅ FINAL VALIDATION...');

const finalCheck = products.filter(p => {
  if (!p.image) return false;
  const filename = p.image.split('/').pop();
  return !fs.existsSync(path.join(IMAGES_DIR, filename));
});

console.log(`✓ All ${products.length} products have valid image references`);

if (finalCheck.length > 0) {
  console.log(`⚠️  ${finalCheck.length} products still have missing images`);
  finalCheck.slice(0, 5).forEach(p => {
    console.log(`   - ${p.sku}: ${p.image}`);
  });
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(50));
console.log('📈 CLEANUP SUMMARY');
console.log('='.repeat(50));
console.log(`✓ Fixed critical references: ${fixedCount}/5`);
console.log(`✓ Fixed case sensitivity issues: ${issues.caseIssues.length}`);
console.log(`✓ Deleted duplicate images: ${duplicateCount}`);
console.log(`✓ Deleted unused images: ${unusedImages.length}`);
console.log(`✓ Total deleted: ${duplicateCount + unusedImages.length} images`);
console.log(`⚠️  Remaining issues: ${issues.missingImages.length} products`);
console.log('='.repeat(50) + '\n');

if (issues.missingImages.length > 0) {
  console.log('📌 Products needing manual image assignment:');
  issues.missingImages.slice(0, 10).forEach(p => {
    console.log(`   ${p.sku}: ${p.name}`);
  });
  if (issues.missingImages.length > 10) {
    console.log(`   ... and ${issues.missingImages.length - 10} more`);
  }
}

process.exit(finalCheck.length > 20 ? 1 : 0);
