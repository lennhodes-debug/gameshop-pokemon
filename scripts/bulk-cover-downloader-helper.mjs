#!/usr/bin/env node

/**
 * BULK COVER ART DOWNLOADER HELPER
 *
 * Generates PriceCharting search URLs for all 92 missing products
 * Helps you download covers in bulk
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const productsPath = path.join(projectRoot, 'src/data/products.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Get all products missing images
const missingImages = products.filter(p => !p.image);

console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
console.log(`║         BULK COVER ART DOWNLOADER - 92 PRODUCTS              ║`);
console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

console.log(`📊 TOTAL MISSING: ${missingImages.length} products\n`);

// Group by platform
const byPlatform = {};
missingImages.forEach(p => {
  if (!byPlatform[p.platform]) {
    byPlatform[p.platform] = [];
  }
  byPlatform[p.platform].push(p);
});

// Generate search URLs
const searchUrls = missingImages.map((product, idx) => {
  const searchQuery = `${product.name} PAL EUR box art`;
  const encodedQuery = encodeURIComponent(searchQuery);
  const url = `https://www.pricecharting.com/search?q=${encodedQuery}&region=pal`;

  return {
    rank: idx + 1,
    sku: product.sku,
    name: product.name,
    platform: product.platform,
    searchUrl: url,
    fallbackUrl: `https://www.amazon.eu/s?k=${encodeURIComponent(product.name + ' PAL')}`,
  };
});

// Display by platform
console.log(`📱 BY PLATFORM:\n`);
Object.entries(byPlatform).forEach(([platform, prods]) => {
  console.log(`${platform}: ${prods.length} games`);
});

// Save to JSON for reference
const outputFile = path.join(projectRoot, 'BULK_DOWNLOAD_URLS.json');
fs.writeFileSync(outputFile, JSON.stringify(searchUrls, null, 2));
console.log(`\n✅ Saved to: BULK_DOWNLOAD_URLS.json\n`);

// Print first 10 URLs as example
console.log(`📌 FIRST 10 DOWNLOAD URLS:\n`);
searchUrls.slice(0, 10).forEach(item => {
  console.log(`${item.rank}. ${item.sku} - ${item.name}`);
  console.log(`   🔗 ${item.searchUrl}\n`);
});

console.log(`... and ${missingImages.length - 10} more\n`);

// Instructions
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\n📖 INSTRUCTIONS:\n`);
console.log(`1. Open BULK_DOWNLOAD_URLS.json`);
console.log(`2. For each product:`);
console.log(`   - Click the searchUrl link`);
console.log(`   - Verify: PAL/EUR region, professional quality`);
console.log(`   - Download highest resolution`);
console.log(`3. Save all to: .cover-art-temp/ folder`);
console.log(`4. Run: bash BATCH_CONVERT.sh`);
console.log(`5. Run: node scripts/auto-deploy-covers.mjs`);
console.log(`\n⏱️  Estimated time: 90 minutes (downloading)`);
console.log(`   Automation time: 30 minutes (conversion + deployment)\n`);
console.log(`🎯 Result: 846/846 images (100% complete) ✓\n`);

// Create downloadable HTML guide
const htmlGuide = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulk Cover Art Download Helper</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1e293b;
            margin-bottom: 10px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-box .number {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        .products-list {
            margin: 30px 0;
        }
        .product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 8px;
            hover: background: #f1f5f9;
        }
        .product-info {
            flex: 1;
        }
        .sku {
            font-weight: bold;
            color: #667eea;
        }
        .download-btn {
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            margin-left: 10px;
        }
        .download-btn:hover {
            background: #059669;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Bulk Cover Art Download Helper</h1>
        <p>Download alle 92 ontbrekende game covers in bulk</p>

        <div class="stats">
            <div class="stat-box">
                <div>Total Products</div>
                <div class="number">${missingImages.length}</div>
            </div>
            <div class="stat-box">
                <div>Platforms</div>
                <div class="number">${Object.keys(byPlatform).length}</div>
            </div>
            <div class="stat-box">
                <div>Est. Time</div>
                <div class="number">90 min</div>
            </div>
            <div class="stat-box">
                <div>Coverage</div>
                <div class="number">100%</div>
            </div>
        </div>

        <h2>📊 Products by Platform</h2>
        ${Object.entries(byPlatform).map(([platform, prods]) =>
          `<p><strong>${platform}:</strong> ${prods.length} games</p>`
        ).join('')}

        <h2>📌 Download Links (First 20)</h2>
        <div class="products-list">
            ${searchUrls.slice(0, 20).map(item => `
                <div class="product-item">
                    <div class="product-info">
                        <span class="sku">${item.sku}</span> - ${item.name}
                    </div>
                    <a href="${item.searchUrl}" target="_blank" class="download-btn">Search PriceCharting →</a>
                </div>
            `).join('')}
        </div>

        <p style="text-align: center; color: #64748b; margin-top: 40px;">
            For complete list, see: BULK_DOWNLOAD_URLS.json
        </p>
    </div>
</body>
</html>`;

const htmlPath = path.join(projectRoot, 'BULK_DOWNLOAD_HELPER.html');
fs.writeFileSync(htmlPath, htmlGuide);
console.log(`📄 Also created: BULK_DOWNLOAD_HELPER.html (open in browser)\n`);
