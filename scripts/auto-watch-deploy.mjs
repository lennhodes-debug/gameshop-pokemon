#!/usr/bin/env node

/**
 * AUTO-WATCH & AUTO-DEPLOY
 *
 * Continuously monitors .cover-art-temp/ folder
 * Automatically converts and deploys images as they arrive
 *
 * Usage: node scripts/auto-watch-deploy.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { watch } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const tempDir = path.join(projectRoot, '.cover-art-temp');
const imagesDir = path.join(projectRoot, 'public/images/products');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║       🎮 AUTO-WATCH & AUTO-DEPLOY SYSTEM STARTED           ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

console.log(`👀 Watching folder: ${tempDir}`);
console.log(`📁 Deploy folder: ${imagesDir}\n`);
console.log(`💡 Instructions:`);
console.log(`   1. Add PNG/JPG files to .cover-art-temp/`);
console.log(`   2. System automatically:`);
console.log(`      - Converts to WebP 500x500`);
console.log(`      - Updates products.json`);
console.log(`      - Commits changes`);
console.log(`      - Pushes to remote`);
console.log(`   3. Done! Images live on next Netlify build\n`);

console.log(`⏰ Waiting for images...\n`);

// Track processed files
const processed = new Set();
let debounceTimer = null;

// Monitor folder for new files
watch(tempDir, async (eventType, filename) => {
  if (!filename || !filename.match(/\.(png|jpg|jpeg)$/i)) {
    return;
  }

  const filePath = path.join(tempDir, filename);

  // Check if file exists and is not being written to
  if (!fs.existsSync(filePath)) {
    return;
  }

  // Skip if already processed
  if (processed.has(filename)) {
    return;
  }

  // Debounce: wait for file to finish writing
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;

      console.log(`\n✨ NEW IMAGE DETECTED: ${filename} (${sizeKB.toFixed(1)}KB)`);
      console.log(`🔄 Processing...\n`);

      // Mark as processed
      processed.add(filename);

      // Run auto-deploy for this specific file
      try {
        execSync(
          `node ${path.join(projectRoot, 'scripts/auto-deploy-covers.mjs')}`,
          { cwd: projectRoot, stdio: 'inherit' }
        );

        console.log(`\n✅ AUTO-DEPLOYED: ${filename}`);
        console.log(`📊 Current status: ${fs.readdirSync(imagesDir).length}/846 images\n`);
      } catch (err) {
        console.log(`\n❌ Deployment failed for: ${filename}`);
        console.log(`Error: ${err.message}\n`);
      }
    } catch (err) {
      console.log(`Error processing ${filename}: ${err.message}`);
    }
  }, 2000); // Wait 2 seconds for file to finish writing
});

// Keep process alive
process.on('SIGINT', () => {
  console.log(`\n\n👋 Watcher stopped. Goodbye!\n`);
  process.exit(0);
});

// Handle errors
process.on('error', (err) => {
  console.error('Watcher error:', err);
});

// Show status every 5 seconds
setInterval(() => {
  const tempFiles = fs.readdirSync(tempDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
  const deployedFiles = fs.readdirSync(imagesDir).filter(f => f.match(/\.webp$/i));

  if (tempFiles.length > 0) {
    console.log(`\n📦 Pending: ${tempFiles.length} | ✅ Deployed: ${deployedFiles.length}/846`);
  }
}, 5000);

console.log(`🟢 Ready. Add images to .cover-art-temp/ to begin...\n`);
