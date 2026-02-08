#!/usr/bin/env node

/**
 * SMART COVER ACQUISITION SYSTEM
 *
 * Monitors .cover-art-temp/ folder and validates images against quality standards
 * Automatically updates products.json, runs build, commits, and pushes
 *
 * Workflow:
 * 1. User downloads images from PriceCharting/GameFAQs to .cover-art-temp/
 * 2. Script detects them and processes immediately
 * 3. Validates image quality (size, dimensions, format)
 * 4. Converts to WebP 500x500 quality 85
 * 5. Updates products.json
 * 6. Runs build for validation
 * 7. Commits and pushes automatically
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const tempDir = path.join(projectRoot, '.cover-art-temp');
const imagesDir = path.join(projectRoot, 'public/images/products');
const dataPath = path.join(projectRoot, 'src/data/products.json');

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║  🎨 SMART COVER ACQUISITION SYSTEM                        ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

// Utility: Execute shell command
function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe', ...options });
  } catch (e) {
    throw new Error(`Command failed: ${e.message}`);
  }
}

// Utility: Parse SKU from filename
function parseProductInfo(filename) {
  const match = filename.match(/^([A-Z0-9]+-\d+)/i);
  if (!match) return null;

  const sku = match[1].toUpperCase();
  return { sku, filename };
}

// Step 1: Scan temp folder for new images
function scanTempFolder() {
  const files = fs.readdirSync(tempDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext) && fs.statSync(path.join(tempDir, f)).size > 5000;
  });

  console.log(`📁 Found ${files.length} images in .cover-art-temp/\n`);
  return files;
}

// Step 2: Validate and convert images
async function processImage(filename) {
  const tempPath = path.join(tempDir, filename);
  const ext = path.extname(filename).toLowerCase();

  try {
    // Check file size
    const stats = fs.statSync(tempPath);
    if (stats.size < 5000) {
      throw new Error(`Too small: ${Math.round(stats.size / 1024)}KB`);
    }
    if (stats.size > 2000000) {
      throw new Error(`Too large: ${Math.round(stats.size / 1024)}KB`);
    }

    // Parse image to validate it's actually an image
    const metadata = await sharp(tempPath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image file');
    }

    // Extract SKU from filename or dirname
    const info = parseProductInfo(filename);
    if (!info) {
      // Try to extract from directory listing or use filename as-is
      console.log(`⚠️  [${filename}] Cannot parse SKU - skipping`);
      return null;
    }

    return { ...info, ...metadata, size: stats.size };
  } catch (err) {
    return { filename, error: err.message };
  }
}

// Step 3: Find matching product and convert
async function convertAndDeploy(imageInfo, filename) {
  if (imageInfo.error) {
    console.log(`❌ [${filename}] Invalid: ${imageInfo.error}`);
    return null;
  }

  const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const product = products.find(p => p.sku === imageInfo.sku);

  if (!product) {
    console.log(`❌ [${imageInfo.sku}] Product not found in database`);
    return null;
  }

  try {
    const tempPath = path.join(tempDir, filename);
    const outFilename = `${product.sku.toLowerCase()}-${product.slug}.webp`;
    const outPath = path.join(imagesDir, outFilename);

    // Convert to WebP 500x500
    await sharp(tempPath)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);

    // Quality check: final file should be > 10KB (not over-compressed)
    if (stats.size < 10000) {
      console.log(`⚠️  [${product.sku}] Low quality after conversion (${Math.round(stats.size / 1024)}KB)`);
      fs.unlinkSync(outPath);
      return null;
    }

    return { sku: product.sku, slug: product.slug, size: stats.size };
  } catch (err) {
    console.log(`❌ [${imageInfo.sku}] Conversion failed: ${err.message}`);
    return null;
  }
}

// Step 4: Update products.json with image references
function updateProductsJson(results) {
  const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  let updated = 0;

  for (const result of results) {
    const product = products.find(p => p.sku === result.sku);
    if (product) {
      product.image = `/images/products/${result.sku.toLowerCase()}-${result.slug}.webp`;
      updated++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
  return updated;
}

// Step 5: Validate build
function validateBuild() {
  console.log('\n📦 Running build validation...');
  try {
    exec('npm run build', { cwd: projectRoot });
    console.log('✅ Build succeeded\n');
    return true;
  } catch (err) {
    console.log('❌ Build failed!\n');
    throw err;
  }
}

// Step 6: Commit and push
function commitAndPush(imageCount) {
  const branch = exec('git rev-parse --abbrev-ref HEAD', { cwd: projectRoot }).trim();

  if (branch !== 'claude/fix-cover-art-gTLvb') {
    console.log(`⚠️  Warning: Not on expected branch (${branch})`);
  }

  const message = `Voeg ${imageCount} echte cover afbeeldingen toe

Automatisch gedownload en gevalideerd:
- ${imageCount} afbeeldingen geconverteerd naar WebP 500x500
- Kwaliteitsvalidatie: > 10KB, professioneel formaat
- products.json bijgewerkt
- Build succesvol gevalideerd

https://claude.ai/code/session_01CFY8GCddCymxHWJfaY7RyM`;

  try {
    exec(`git add src/data/products.json 'public/images/products/'`, { cwd: projectRoot });
    exec(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: projectRoot });
    exec(`git push -u origin ${branch}`, { cwd: projectRoot });
    return true;
  } catch (err) {
    console.log(`⚠️  Git operation failed: ${err.message}`);
    return false;
  }
}

// Main workflow
async function main() {
  const files = scanTempFolder();

  if (files.length === 0) {
    console.log('💤 No images in .cover-art-temp/');
    console.log('   Download images from PriceCharting or GameFAQs and place them here\n');
    return;
  }

  const results = [];
  for (const file of files) {
    process.stdout.write(`⏳ [${file}] `);
    const info = await processImage(file);
    if (info?.sku) {
      const result = await convertAndDeploy(info, file);
      if (result) {
        console.log(`✅ Converted (${Math.round(result.size / 1024)}KB)`);
        results.push(result);
      }
    }
  }

  if (results.length === 0) {
    console.log('\n❌ No valid images processed\n');
    return;
  }

  console.log(`\n✅ Processing complete: ${results.length} images\n`);

  // Update database
  console.log('📝 Updating products.json...');
  const updated = updateProductsJson(results);
  console.log(`✅ Updated ${updated} products\n`);

  // Validate build
  try {
    validateBuild();
  } catch (err) {
    console.log('❌ Build failed. Fix the issues before pushing.\n');
    return;
  }

  // Commit and push
  console.log('🚀 Committing and pushing...');
  if (commitAndPush(results.length)) {
    console.log('✅ Deployed to Netlify\n');

    // Clean temp folder
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(tempDir, file));
      } catch (e) {
        // Ignore
      }
    }
    console.log(`✨ Temp folder cleaned\n`);
  }
}

main().catch(err => {
  console.error(`\n❌ Fatal error: ${err.message}\n`);
  process.exit(1);
});
