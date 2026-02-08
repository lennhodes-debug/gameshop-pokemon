#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.json');
const imagesDir = path.join(__dirname, '../public/images/products');

console.log('Bezig met analyseren van producten en afbeeldingen...');

// Lees products.json
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
console.log(`✓ ${products.length} producten geladen`);

// Lees alle afbeelding files
const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp'));
console.log(`✓ ${imageFiles.length} image files gevonden`);

// Build index van SKU's in imageFiles
const imageBySku = {};
imageFiles.forEach(file => {
  // Format: "sw-001-zelda-breath-of-the-wild.webp"
  const parts = file.split('-');
  if (parts.length < 2) return;

  // SKU is altijd prefix-NNN (bijv "sw-001", "con-045")
  let sku = null;
  if (parts[0].match(/^[a-z]+$/)) {
    // First part is platform code (sw, 3ds, con, etc)
    if (parts[1].match(/^\d{3}$/)) {
      // Second part is 3-digit number
      sku = (parts[0] + '-' + parts[1]).toUpperCase();
    }
  }

  if (!sku) return;

  if (!imageBySku[sku]) {
    imageBySku[sku] = [];
  }
  imageBySku[sku].push(file);
});

console.log(`✓ ${Object.keys(imageBySku).length} unieke SKU's in afbeeldingen gevonden`);

const audit = {
  timestamp: new Date().toISOString(),
  summary: {
    totalProducts: products.length,
    totalImages: imageFiles.length,
    skusWithImages: Object.keys(imageBySku).length,
    productsWithoutImages: 0,
    productsWithWrongImage: 0,
    duplicateImagesPerSku: 0,
    unusedImages: 0,
  },
  products: [],
  unusedImages: [],
  duplicates: [],
  errors: [],
};

// Analyse elke product
products.forEach((product) => {
  const sku = product.sku.toUpperCase();
  const hasImage = !!product.image;
  const skuImages = imageBySku[sku] || [];

  const productAudit = {
    sku: product.sku,
    name: product.name,
    platform: product.platform,
    currentImage: product.image,
    availableImages: skuImages,
    imageCount: skuImages.length,
    issues: [],
  };

  // Check 1: Geen afbeelding in product
  if (!hasImage) {
    productAudit.issues.push('GEEN_IMAGE_IN_JSON');
    audit.summary.productsWithoutImages++;
  }

  // Check 2: Is de image path correct?
  if (hasImage && skuImages.length > 0) {
    const imageName = product.image.split('/').pop();
    const imageExists = skuImages.includes(imageName);

    if (!imageExists) {
      productAudit.issues.push('VERKEERDE_IMAGE_IN_JSON');
      productAudit.suggestedImage = skuImages[0]; // Eerste beschikbare
      audit.summary.productsWithWrongImage++;
    } else {
      productAudit.imageStatus = 'CORRECT';
    }
  }

  // Check 3: Meerdere images per SKU = duplicaten
  if (skuImages.length > 1) {
    productAudit.issues.push('MEERDERE_IMAGES_BESCHIKBAAR');
    audit.summary.duplicateImagesPerSku++;
    productAudit.duplicateInfo = {
      count: skuImages.length,
      files: skuImages,
      recommendation: `Behoud ${skuImages[0]} en verwijder de rest`,
    };
  }

  // Check 4: Image in JSON maar niet in directory
  if (hasImage && skuImages.length === 0) {
    productAudit.issues.push('IMAGE_ONTBREEKT_IN_DIRECTORY');
    audit.summary.errors++;
  }

  audit.products.push(productAudit);
});

// Detecteer ongebruikte afbeeldingen
const usedImages = new Set();
products.forEach((product) => {
  if (product.image) {
    const imageName = product.image.split('/').pop();
    usedImages.add(imageName);
  }
});

imageFiles.forEach((file) => {
  if (!usedImages.has(file)) {
    audit.unusedImages.push(file);
    audit.summary.unusedImages++;
  }
});

// Geef een overzicht van duplicaten
Object.entries(imageBySku).forEach(([sku, files]) => {
  if (files.length > 1) {
    audit.duplicates.push({
      sku,
      imageCount: files.length,
      files,
      recommendation: `Kies 1 juiste image en verwijder ${files.length - 1} kopieën`,
    });
  }
});

// Update summary
audit.summary.totalDuplicateImages = audit.duplicates.reduce((sum, d) => sum + (d.imageCount - 1), 0);

// Schrijf audit report
const reportPath = path.join(__dirname, '../audit-images-report.json');
fs.writeFileSync(reportPath, JSON.stringify(audit, null, 2), 'utf8');

console.log('\n=== AUDIT RAPPORT ===');
console.log(`Rapport opgeslagen: ${reportPath}`);
console.log(`\nSamenvattingen:`);
console.log(`  Totaal producten: ${audit.summary.totalProducts}`);
console.log(`  Totaal images: ${audit.summary.totalImages}`);
console.log(`  SKU's met images: ${audit.summary.skusWithImages}`);
console.log(`  Producten ZONDER image: ${audit.summary.productsWithoutImages}`);
console.log(`  Producten met VERKEERDE image: ${audit.summary.productsWithWrongImage}`);
console.log(`  SKU's met meerdere images: ${audit.summary.duplicateImagesPerSku}`);
console.log(`  Totaal overbodige duplicate images: ${audit.summary.totalDuplicateImages}`);
console.log(`  Ongebruikte images (niet in JSON): ${audit.summary.unusedImages}`);
console.log(`  Fouten/problemen: ${audit.summary.errors}`);

// Statistieken producten per status
const statsByStatus = {
  correct: audit.products.filter(p => p.imageStatus === 'CORRECT').length,
  without: audit.products.filter(p => p.issues.includes('GEEN_IMAGE_IN_JSON')).length,
  wrong: audit.products.filter(p => p.issues.includes('VERKEERDE_IMAGE_IN_JSON')).length,
  missing: audit.products.filter(p => p.issues.includes('IMAGE_ONTBREEKT_IN_DIRECTORY')).length,
};

console.log(`\nProduct status:`);
console.log(`  ✓ Correcte images: ${statsByStatus.correct}`);
console.log(`  ✗ Zonder image: ${statsByStatus.without}`);
console.log(`  ⚠ Verkeerde image: ${statsByStatus.wrong}`);
console.log(`  ⚠ Image ontbreekt: ${statsByStatus.missing}`);

console.log(`\nGEBRUIK: Bekijk /home/user/gameshop/audit-images-report.json`);
