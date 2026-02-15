#!/usr/bin/env node
/**
 * Process console hardware photos to WebP with white backgrounds
 * Uses Sharp for image processing
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

const BASE = path.dirname(path.dirname(__filename));
const SRC_DIR = BASE;
const DST_DIR = path.join(BASE, 'public', 'images', 'consoles');

// Console photo mappings - map filename patterns to console names
const CONSOLE_MAPPING = {
  '00 40': { slug: 'ds', name: 'Nintendo DS' },
  '00 41': { slug: '3ds', name: 'Nintendo 3DS' },
  '00 43': { slug: 'wiiu', name: 'Wii U' },
  '00 47': { slug: 'wii', name: 'Nintendo Wii' },
  '00 50': { slug: 'gba', name: 'Game Boy Advance' },
  '00 51': { slug: 'gbc', name: 'Game Boy Color' },
};

async function processConsoleImage(srcPath, dstPath, size = 1200) {
  try {
    await sharp(srcPath)
      .rotate() // Auto-rotate based on EXIF
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 },
      })
      .webp({ quality: 85 })
      .toFile(dstPath);
    return true;
  } catch (error) {
    console.error(`ERROR processing ${srcPath}: ${error.message}`);
    return false;
  }
}

async function main() {
  // Create output directory
  if (!fs.existsSync(DST_DIR)) {
    fs.mkdirSync(DST_DIR, { recursive: true });
  }

  // Find all console photos
  const photoFiles = glob.sync(path.join(SRC_DIR, 'Foto 12-02-2026, *.jpg')).sort();

  console.log(`Found ${photoFiles.length} console photos\n`);

  const processed = {};

  for (const srcPath of photoFiles) {
    const filename = path.basename(srcPath);
    process.stdout.write(`Processing: ${filename}... `);

    // Extract time from filename (e.g., "00 40" from "Foto 12-02-2026, 00 40 14.jpg")
    const timePart = filename.match(/Foto 12-02-2026, (\d{2} \d{2})/);
    if (!timePart) {
      console.log('SKIPPED: Invalid filename format');
      continue;
    }

    const timeKey = timePart[1];
    const consoleInfo = CONSOLE_MAPPING[timeKey];

    if (!consoleInfo) {
      console.log(`SKIPPED: Unknown console time ${timeKey}`);
      continue;
    }

    const { slug: consoleSlug, name: consoleName } = consoleInfo;

    // Count photos per console
    if (!processed[consoleSlug]) {
      processed[consoleSlug] = { name: consoleName, count: 0, files: [] };
    }

    const photoNum = processed[consoleSlug].count;
    processed[consoleSlug].count++;

    // For first photo (main), save as console-name.webp
    // For additional photos, save as console-name-2.webp, etc.
    const dstFilename = photoNum === 0 ? `${consoleSlug}.webp` : `${consoleSlug}-${photoNum + 1}.webp`;
    const dstPath = path.join(DST_DIR, dstFilename);

    const success = await processConsoleImage(srcPath, dstPath);
    if (success) {
      processed[consoleSlug].files.push(dstFilename);
      console.log(`✓ ${dstFilename}`);
    } else {
      processed[consoleSlug].count--;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  for (const consoleSlug of Object.keys(processed).sort()) {
    const data = processed[consoleSlug];
    console.log(`${data.name.padEnd(25)} - ${data.count} photos`);
    for (const file of data.files) {
      console.log(`  • ${file}`);
    }
  }

  console.log('\n✓ Console image processing complete!');
  return Object.keys(processed).length > 0;
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
