#!/usr/bin/env node
/**
 * Process uploaded product photos to 1200x1200 WebP quality 90
 * Usage: node scripts/process-photos.js
 *
 * Reads mapping from scripts/photo-mapping.json
 * Outputs processed images to public/images/products/
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MAPPING_FILE = path.join(__dirname, 'photo-mapping.json');
const IMAGES_DIR = path.join(__dirname, '..', 'images');
const WII_DIR = path.join(IMAGES_DIR, 'wii');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');

const SIZE = 1200;
const QUALITY = 90;

async function processImage(inputPath, outputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();

    await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF
      .resize(SIZE, SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    return { success: true, size: stats.size, original: `${metadata.width}x${metadata.height}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  if (!fs.existsSync(MAPPING_FILE)) {
    console.error('Mapping bestand niet gevonden:', MAPPING_FILE);
    console.error('Maak eerst scripts/photo-mapping.json aan.');
    process.exit(1);
  }

  const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const entry of mapping) {
    if (!entry.outputName) {
      skipped++;
      continue;
    }

    // Determine input path - check subfolder field or fallback to wii/
    let inputPath;
    if (entry.subfolder) {
      inputPath = path.join(IMAGES_DIR, entry.subfolder, entry.file);
    } else {
      inputPath = path.join(IMAGES_DIR, entry.file);
    }
    if (!fs.existsSync(inputPath)) {
      inputPath = path.join(WII_DIR, entry.file);
    }
    if (!fs.existsSync(inputPath)) {
      console.error(`NIET GEVONDEN: ${entry.file}`);
      failed++;
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, entry.outputName);

    const result = await processImage(inputPath, outputPath);

    if (result.success) {
      processed++;
      const sizeKB = Math.round(result.size / 1024);
      console.log(`OK: ${entry.file} → ${entry.outputName} (${result.original} → ${SIZE}x${SIZE}, ${sizeKB}KB)`);
    } else {
      failed++;
      console.error(`FOUT: ${entry.file} → ${result.error}`);
    }
  }

  console.log(`\nKlaar! ${processed} verwerkt, ${failed} mislukt, ${skipped} overgeslagen`);
}

main().catch(console.error);
