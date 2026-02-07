const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const NINTENDO_DIR = path.join(__dirname, '..', 'public', 'images', 'nintendo');

async function analyzeAndOptimize() {
  console.log('=== AFBEELDINGEN ANALYSE & OPTIMALISATIE ===\n');

  // Analyze product images
  const productFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.webp'));
  console.log(`Product afbeeldingen: ${productFiles.length}`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let optimizedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < productFiles.length; i++) {
    const file = productFiles[i];
    const filePath = path.join(PRODUCTS_DIR, file);

    try {
      const originalSize = fs.statSync(filePath).size;
      totalOriginal += originalSize;

      const metadata = await sharp(filePath).metadata();

      // Already 500x500 WebP - just re-compress with optimal settings
      const optimized = await sharp(filePath)
        .resize(500, 500, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .webp({
          quality: 82,        // Slight quality reduction for better compression
          effort: 6,          // Max compression effort
          smartSubsample: true,
          nearLossless: false,
        })
        .toBuffer();

      const newSize = optimized.length;
      totalOptimized += newSize;

      // Only write if we actually saved space (at least 5%)
      if (newSize < originalSize * 0.95) {
        fs.writeFileSync(filePath, optimized);
        optimizedCount++;
        if ((i + 1) % 100 === 0) {
          console.log(`  [${i + 1}/${productFiles.length}] ${file}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${(((originalSize - newSize) / originalSize) * 100).toFixed(1)}% bespaard)`);
        }
      } else {
        totalOptimized -= newSize;
        totalOptimized += originalSize; // Keep original size in total
        skippedCount++;
      }
    } catch (err) {
      errors.push(`${file}: ${err.message}`);
    }
  }

  console.log(`\n--- Product afbeeldingen resultaat ---`);
  console.log(`Totaal: ${productFiles.length}`);
  console.log(`Geoptimaliseerd: ${optimizedCount}`);
  console.log(`Overgeslagen (al optimaal): ${skippedCount}`);
  console.log(`Fouten: ${errors.length}`);
  console.log(`Origineel totaal: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Na optimalisatie: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Bespaard: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB (${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%)`);

  if (errors.length > 0) {
    console.log('\nFouten:');
    errors.forEach(e => console.log(`  ${e}`));
  }

  // Now optimize console images
  console.log('\n\n=== CONSOLE AFBEELDINGEN ===\n');
  const nintendoFiles = fs.readdirSync(NINTENDO_DIR).filter(f => f.endsWith('.webp'));
  console.log(`Console afbeeldingen: ${nintendoFiles.length}`);

  let conOriginal = 0;
  let conOptimized = 0;

  for (const file of nintendoFiles) {
    const filePath = path.join(NINTENDO_DIR, file);
    const originalSize = fs.statSync(filePath).size;
    conOriginal += originalSize;

    try {
      const metadata = await sharp(filePath).metadata();

      // Resize to max 800px wide (they don't need to be huge for cards)
      // Keep transparent backgrounds
      const optimized = await sharp(filePath)
        .resize(800, 600, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
          effort: 6,
          smartSubsample: true,
        })
        .toBuffer();

      const newSize = optimized.length;
      conOptimized += newSize;

      if (newSize < originalSize * 0.95) {
        fs.writeFileSync(filePath, optimized);
        console.log(`  ${file}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${(((originalSize - newSize) / originalSize) * 100).toFixed(1)}% bespaard)`);
      } else {
        conOptimized -= newSize;
        conOptimized += originalSize;
        console.log(`  ${file}: ${(originalSize / 1024).toFixed(1)}KB (al optimaal)`);
      }
    } catch (err) {
      console.log(`  ${file}: FOUT - ${err.message}`);
      conOptimized += originalSize;
    }
  }

  console.log(`\n--- Console afbeeldingen resultaat ---`);
  console.log(`Origineel: ${(conOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Na optimalisatie: ${(conOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Bespaard: ${((conOriginal - conOptimized) / 1024 / 1024).toFixed(2)} MB`);

  // Grand total
  const grandOriginal = totalOriginal + conOriginal;
  const grandOptimized = totalOptimized + conOptimized;
  console.log(`\n\n=== TOTAAL ===`);
  console.log(`Origineel: ${(grandOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Na optimalisatie: ${(grandOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Totaal bespaard: ${((grandOriginal - grandOptimized) / 1024 / 1024).toFixed(2)} MB (${(((grandOriginal - grandOptimized) / grandOriginal) * 100).toFixed(1)}%)`);
}

analyzeAndOptimize().catch(console.error);
