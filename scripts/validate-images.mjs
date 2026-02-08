#!/usr/bin/env node

/**
 * IMAGE VALIDATION SCRIPT
 *
 * Runs during build to ensure:
 * - All products have valid image references
 * - All referenced images exist
 * - No duplicate images per SKU
 * - Image filenames match slug naming convention
 *
 * This prevents deployment of broken image links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const PRODUCTS_PATH = path.join(rootDir, 'src/data/products.json');
const IMAGES_DIR = path.join(rootDir, 'public/images/products');

// ============================================================
// VALIDATION RULES
// ============================================================
const RULES = {
  imageRequired: true,
  imageFormatWebP: true,
  imagePathPattern: /^\/images\/products\/[a-z0-9]+-\d+-.+\.webp$/,
  skuImageMatch: true, // Image SKU must match product SKU
};

// ============================================================
// LOAD DATA
// ============================================================
console.log('🔍 IMAGE VALIDATION\n');

if (!fs.existsSync(PRODUCTS_PATH)) {
  console.error('❌ ERROR: products.json not found');
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.webp'));
const imageSet = new Set(imageFiles);

console.log(`📦 ${products.length} products loaded`);
console.log(`📸 ${imageFiles.length} image files found\n`);

// ============================================================
// VALIDATION
// ============================================================
const errors = [];
const warnings = [];
const stats = {
  total: products.length,
  valid: 0,
  missingImage: 0,
  invalidFormat: 0,
  imageNotFound: 0,
  skuMismatch: 0,
  duplicatePerSku: 0,
};

// Group images by SKU to detect duplicates
const imagesByPrefix = {};
imageFiles.forEach(file => {
  const match = file.match(/^([a-z0-9]+-\d+)/);
  if (match) {
    const prefix = match[1];
    if (!imagesByPrefix[prefix]) imagesByPrefix[prefix] = [];
    imagesByPrefix[prefix].push(file);
  }
});

// Check for duplicate images per SKU
Object.entries(imagesByPrefix).forEach(([prefix, files]) => {
  if (files.length > 1) {
    const product = products.find(p => p.sku === prefix.toUpperCase());
    if (product) {
      warnings.push(
        `⚠️  Duplicate images for ${prefix.toUpperCase()}: ${files.length} files ` +
        `(product uses: ${product.image.split('/').pop()})`
      );
      stats.duplicatePerSku++;
    }
  }
});

// Validate each product
products.forEach((product, idx) => {
  let hasError = false;

  // Rule 1: Image must exist
  if (!product.image) {
    errors.push(
      `${product.sku}: Missing image reference. Name: "${product.name}"`
    );
    stats.missingImage++;
    hasError = true;
  }

  if (!hasError && product.image) {
    // Rule 2: Must be .webp format
    if (!product.image.endsWith('.webp')) {
      errors.push(
        `${product.sku}: Invalid format. Expected .webp, got "${product.image}"`
      );
      stats.invalidFormat++;
      hasError = true;
    }

    // Rule 3: Must match path pattern
    if (!RULES.imagePathPattern.test(product.image)) {
      errors.push(
        `${product.sku}: Invalid path pattern "${product.image}". ` +
        `Expected /images/products/{sku}-{slug}.webp`
      );
      hasError = true;
    }

    // Rule 4: Image file must exist
    const filename = product.image.split('/').pop();
    if (!imageSet.has(filename)) {
      errors.push(
        `${product.sku}: Image file not found "${filename}"`
      );
      stats.imageNotFound++;
      hasError = true;
    }

    // Rule 5: SKU in path must match product SKU
    const pathSku = product.image.split('/').pop().split('-').slice(0, 2).join('-');
    const productSku = product.sku.toLowerCase();
    if (pathSku !== productSku) {
      errors.push(
        `${product.sku}: SKU mismatch in image path. ` +
        `Product "${productSku}" but image uses "${pathSku}"`
      );
      stats.skuMismatch++;
      hasError = true;
    }
  }

  if (!hasError) {
    stats.valid++;
  }
});

// ============================================================
// REPORT
// ============================================================
console.log('═'.repeat(60));
console.log('VALIDATION RESULTS');
console.log('═'.repeat(60));

console.log(`\n✓ Valid products:        ${stats.valid}/${stats.total}`);
console.log(`✗ Missing images:        ${stats.missingImage}`);
console.log(`✗ Invalid formats:       ${stats.invalidFormat}`);
console.log(`✗ Files not found:       ${stats.imageNotFound}`);
console.log(`✗ SKU mismatches:        ${stats.skuMismatch}`);
console.log(`⚠️  Duplicate images:      ${stats.duplicatePerSku}`);

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} ERRORS FOUND:\n`);
  errors.slice(0, 20).forEach(err => {
    console.log(`   ${err}`);
  });
  if (errors.length > 20) {
    console.log(`   ... and ${errors.length - 20} more\n`);
  }
}

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} WARNINGS:\n`);
  warnings.slice(0, 10).forEach(warn => {
    console.log(`   ${warn}`);
  });
  if (warnings.length > 10) {
    console.log(`   ... and ${warnings.length - 10} more\n`);
  }
}

console.log('═'.repeat(60) + '\n');

// ============================================================
// EXIT
// ============================================================
if (errors.length > 0) {
  console.error('❌ BUILD FAILED: Image validation errors detected');
  console.error('Fix the errors above before deploying\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.warn(`⚠️  BUILD OK: ${warnings.length} warnings (should be fixed)`);
  process.exit(0);
} else {
  console.log('✅ BUILD OK: All image validations passed!\n');
  process.exit(0);
}
