#!/usr/bin/env node
/**
 * Combineert alle batch mapping files naar een enkele photo-mapping.json
 * met correcte outputName velden gebaseerd op product slugs.
 */

const fs = require('fs');
const path = require('path');

// Load all batch mappings
const batch1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch1-mapping.json'), 'utf8'));
const batch23 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch23-mapping.json'), 'utf8'));
const batch45 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch45-mapping.json'), 'utf8'));
const wii = JSON.parse(fs.readFileSync(path.join(__dirname, 'wii-mapping.json'), 'utf8'));

// Load products for SKU → slug lookup
const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf8'));

const skuToSlug = {};
for (const p of products) {
  skuToSlug[p.sku] = p.slug;
}

const result = [];

// Helper: determine if a product is a "CIB product" (slug ends with -cib)
function isCibProduct(sku) {
  const slug = skuToSlug[sku];
  return slug && slug.endsWith('-cib');
}

// Helper: add entry with outputName
function addEntry(entry, outputName, subfolder) {
  result.push({
    file: entry.file,
    outputName,
    sku: entry.sku,
    side: entry.side,
    subfolder: subfolder || null
  });
}

// ============================================================
// BATCH 1: Loose cartridge photos (Pokémon GBA/DS/3DS)
// These are the primary images for loose products
// ============================================================
for (const entry of batch1) {
  if (!entry.sku) continue; // Skip photos without SKU (SoulSilver USA, Black, White)
  const slug = skuToSlug[entry.sku];
  if (!slug) { console.error(`No slug for SKU ${entry.sku}`); continue; }

  if (entry.side === 'front') {
    addEntry(entry, `${slug}.webp`);
  } else if (entry.side === 'back') {
    addEntry(entry, `${slug}-back.webp`);
  }
}

// ============================================================
// BATCH 2: CIB photos (Pokémon DS boxed)
// For base Pokémon products → cibImage/cibBackImage
// For Diamond EUR (DS-010): has multiple shots, pick "Best" one
// ============================================================
const batch2CibPicked = {}; // Track best front photo per SKU for Diamond duplicates

for (const entry of batch23) {
  if (!entry.sku) continue;
  if (entry.side === 'n/a') continue; // Skip Bol.com screenshot
  const slug = skuToSlug[entry.sku];
  if (!slug) { console.error(`No slug for SKU ${entry.sku}`); continue; }

  const notes = entry.notes || '';

  // Determine if this is a CIB photo or loose photo
  const isCib = notes.includes('CIB') || notes.includes('case') || notes.includes('Back of case');
  const isLoose = notes.includes('Loose') || notes.includes('cartridge') || notes.includes('cart');
  const isBlurry = notes.includes('Blurry') || notes.includes('Alternate angle');

  // Skip blurry/duplicate shots for Diamond EUR
  if (isBlurry) continue;

  if (isCib) {
    // For DS-010 (Diamond EUR), there are multiple front shots - pick the "Best" one
    if (entry.sku === 'DS-010' && entry.side === 'front') {
      if (notes.includes('Best')) {
        batch2CibPicked['DS-010-front'] = entry;
      } else if (!batch2CibPicked['DS-010-front']) {
        batch2CibPicked['DS-010-front'] = entry;
      }
      continue; // Process later
    }

    // For Pokémon base products (not CIB products), CIB photos go to cibImage
    if (!isCibProduct(entry.sku)) {
      if (entry.side === 'front') {
        addEntry(entry, `${slug}-cib.webp`);
      } else if (entry.side === 'back') {
        addEntry(entry, `${slug}-cib-back.webp`);
      }
    } else {
      // For actual CIB products, these are the main image
      if (entry.side === 'front') {
        addEntry(entry, `${slug}.webp`);
      } else if (entry.side === 'back') {
        addEntry(entry, `${slug}-back.webp`);
      }
    }
  } else if (isLoose) {
    // Loose photos from batch 3 - check if we already have from batch 1
    const existsInBatch1 = batch1.some(b => b.sku === entry.sku && b.side === entry.side);
    if (!existsInBatch1) {
      // Use as main image (for products not covered in batch 1)
      if (entry.side === 'front') {
        addEntry(entry, `${slug}.webp`);
      } else if (entry.side === 'back') {
        addEntry(entry, `${slug}-back.webp`);
      }
    }
    // If batch 1 already has this, skip
  }
}

// Process picked Diamond EUR CIB photos
if (batch2CibPicked['DS-010-front']) {
  const entry = batch2CibPicked['DS-010-front'];
  const slug = skuToSlug['DS-010'];
  addEntry(entry, `${slug}-cib.webp`);
}

// ============================================================
// BATCH 4/5: Non-Pokémon DS/3DS games
// Front/back pairs for CIB products, front-only for loose
// ============================================================

// Track duplicates (some SKUs appear twice - e.g., 3DS-043, 3DS-039, DS-044)
const batch45Picked = {};

for (const entry of batch45) {
  if (!entry.sku) continue;
  const slug = skuToSlug[entry.sku];
  if (!slug) { console.error(`No slug for SKU ${entry.sku}`); continue; }

  const key = `${entry.sku}-${entry.side}`;
  // For duplicates, prefer the first occurrence (better photo usually)
  if (batch45Picked[key]) continue;
  batch45Picked[key] = true;

  if (entry.side === 'front') {
    addEntry(entry, `${slug}.webp`);
  } else if (entry.side === 'back') {
    addEntry(entry, `${slug}-back.webp`);
  }
}

// ============================================================
// WII: All Wii and Wii U disc cases (front/back pairs)
// ============================================================
const wiiPicked = {};

for (const entry of wii) {
  if (!entry.sku) continue;
  const slug = skuToSlug[entry.sku];
  if (!slug) { console.error(`No slug for SKU ${entry.sku}`); continue; }

  const key = `${entry.sku}-${entry.side}`;
  // For WIIU-021 (Wii Party U) with 2 copies, use the first
  if (wiiPicked[key]) continue;
  wiiPicked[key] = true;

  if (entry.side === 'front') {
    addEntry(entry, `${slug}.webp`, 'wii');
  } else if (entry.side === 'back') {
    addEntry(entry, `${slug}-back.webp`, 'wii');
  }
}

// Write output
const outputPath = path.join(__dirname, 'photo-mapping.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log(`Mapping aangemaakt: ${result.length} entries`);

// Stats
const skus = new Set(result.map(e => e.sku).filter(Boolean));
console.log(`Unieke producten: ${skus.size}`);
console.log(`Front images: ${result.filter(e => !e.outputName.includes('-back') && !e.outputName.includes('-cib')).length}`);
console.log(`Back images: ${result.filter(e => e.outputName.includes('-back') && !e.outputName.includes('-cib')).length}`);
console.log(`CIB front: ${result.filter(e => e.outputName.includes('-cib.') || e.outputName.includes('-cib-')).length - result.filter(e => e.outputName.includes('-cib-back')).length}`);
console.log(`CIB back: ${result.filter(e => e.outputName.includes('-cib-back')).length}`);
