#!/usr/bin/env node
/**
 * Update products.json met nieuwe image paths op basis van photo-mapping.json
 * Voegt image, backImage, cibImage en cibBackImage velden toe.
 */

const fs = require('fs');
const path = require('path');

const MAPPING_FILE = path.join(__dirname, 'photo-mapping.json');
const PRODUCTS_FILE = path.join(__dirname, '..', 'src', 'data', 'products.json');

const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// Build lookup: SKU → { image, backImage, cibImage, cibBackImage }
const skuImages = {};
for (const entry of mapping) {
  if (!entry.sku || !entry.outputName) continue;
  if (!skuImages[entry.sku]) skuImages[entry.sku] = {};

  const imgPath = `/images/products/${entry.outputName}`;
  const name = entry.outputName;

  if (name.includes('-cib-back.')) {
    skuImages[entry.sku].cibBackImage = imgPath;
  } else if (name.includes('-cib.')) {
    skuImages[entry.sku].cibImage = imgPath;
  } else if (name.includes('-back.')) {
    skuImages[entry.sku].backImage = imgPath;
  } else {
    skuImages[entry.sku].image = imgPath;
  }
}

let updated = 0;
for (const product of products) {
  const images = skuImages[product.sku];
  if (!images) continue;

  let changed = false;

  if (images.image && product.image !== images.image) {
    product.image = images.image;
    changed = true;
  }
  if (images.backImage) {
    product.backImage = images.backImage;
    changed = true;
  }
  if (images.cibImage) {
    product.cibImage = images.cibImage;
    changed = true;
  }
  if (images.cibBackImage) {
    product.cibBackImage = images.cibBackImage;
    changed = true;
  }

  if (changed) updated++;
}

fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2) + '\n');
console.log(`${updated} producten bijgewerkt van ${Object.keys(skuImages).length} in mapping`);
