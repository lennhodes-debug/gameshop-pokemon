#!/usr/bin/env node

/**
 * OPTIMIZED TIER COVER ART DOWNLOADER
 *
 * Uses proven sources with proper fallbacks
 * Validates quality and handles retries
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const tempDir = path.join(projectRoot, '.cover-art-temp');

const tier = process.argv[2] || 'TIER_1_EASY';
const tierPath = path.join(projectRoot, `${tier}.json`);

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(tierPath)) {
  console.error(`❌ Tier not found: ${tierPath}`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(tierPath, 'utf-8'));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log(`║     🎮 COVER ART DOWNLOADER - ${tier.padEnd(30)} ║`);
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`📊 Products: ${products.length}`);
console.log(`📁 Output: ${tempDir}\n`);

// Download with timeout and retry
function downloadUrl(urlString, filepath, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const protocol = urlString.startsWith('https') ? https : http;

    const request = protocol.get(urlString, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, filepath, timeout)
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode < 200 || res.statusCode > 299) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      res.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);

        // Validate file size (>15KB for quality)
        if (stats.size > 15000) {
          resolve(stats.size);
        } else {
          fs.unlinkSync(filepath);
          reject(new Error(`Too small: ${Math.round(stats.size/1024)}KB`));
        }
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Test URL availability with HEAD request
async function urlExists(urlString, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = urlString.startsWith('https') ? https : http;
    const urlObj = new URL(urlString);

    const options = {
      method: 'HEAD',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const request = protocol.request(options, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });

    request.end();
  });
}

/**
 * Strategy 1: Wikipedia API (high quality, official images)
 */
async function tryWikipedia(product) {
  try {
    const query = encodeURIComponent(product.name);
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages|original&format=json&pithumbsize=1000`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);

      for (const page of pages) {
        // Try original image first
        if (page.original && page.original.source) {
          return page.original.source;
        }
        // Fallback to thumbnail
        if (page.thumbnail && page.thumbnail.source) {
          return page.thumbnail.source;
        }
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

/**
 * Strategy 2: Wikidata (structured data with image properties)
 */
async function tryWikidata(product) {
  try {
    // Search for the entity
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(product.name)}&language=en&format=json&limit=3`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.search && searchData.search.length > 0) {
      // Get entity data
      const entityId = searchData.search[0].id;
      const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=claims&format=json`;

      const entityRes = await fetch(entityUrl);
      const entityData = await entityRes.json();

      // Look for image property (P18)
      if (entityData.entities && entityData.entities[entityId]) {
        const claims = entityData.entities[entityId].claims;

        if (claims.P18 && claims.P18.length > 0) {
          const imageFile = claims.P18[0].mainsnak.datavalue.value;
          // Construct Wikimedia Commons URL
          const imageName = imageFile.replace(/ /g, '_');
          return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageName)}?width=1000`;
        }
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

/**
 * Strategy 3: Archive.org PROPER implementation
 */
async function tryArchiveOrg(product) {
  try {
    // Strategy 3A: Search software collection
    const softwareQuery = `${product.name} ${product.platform.split(' ')[1] || ''}`.trim();
    const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(softwareQuery)}+AND+mediatype%3Asoftware&fl=identifier,title&output=json&rows=5`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.response && data.response.docs && data.response.docs.length > 0) {
      // Test multiple results
      for (const doc of data.response.docs) {
        const identifier = doc.identifier;

        // Try common image patterns
        const imagePatterns = [
          `https://archive.org/download/${identifier}/${identifier}.jpg`,
          `https://archive.org/download/${identifier}/cover.jpg`,
          `https://archive.org/download/${identifier}/boxart.jpg`,
          `https://archive.org/download/${identifier}/front.jpg`,
          `https://archive.org/services/img/${identifier}`,
        ];

        for (const imgUrl of imagePatterns) {
          if (await urlExists(imgUrl)) {
            return imgUrl;
          }
        }
      }
    }

    // Strategy 3B: Search image collection
    const imageQuery = `${product.name} box art`;
    const imgSearchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(imageQuery)}+AND+mediatype%3Aimage&fl=identifier&output=json&rows=3`;

    const imgResponse = await fetch(imgSearchUrl);
    const imgData = await imgResponse.json();

    if (imgData.response && imgData.response.docs && imgData.response.docs.length > 0) {
      for (const doc of imgData.response.docs) {
        const identifier = doc.identifier;
        const imgUrl = `https://archive.org/services/img/${identifier}`;

        if (await urlExists(imgUrl)) {
          return imgUrl;
        }
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

/**
 * Strategy 4: GameFAQs patterns
 */
async function tryGameFAQs(product) {
  try {
    // GameFAQs box art URL patterns
    const platformMap = {
      'Wii': 'wii',
      'Wii U': 'wii-u',
      'Nintendo DS': 'ds',
      'Nintendo 64': 'n64',
      'Super Nintendo': 'snes',
      'Game Boy Advance': 'gameboy-advance',
      'Game Boy': 'gameboy',
    };

    const platform = platformMap[product.platform];
    if (!platform) return null;

    const gameName = product.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const boxartUrl = `https://gamefaqs.gamespot.com/a/box/${platform}/${gameName}.jpg`;

    if (await urlExists(boxartUrl)) {
      return boxartUrl;
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

/**
 * Main download function with retry logic
 */
async function downloadProduct(product) {
  const { sku, name } = product;
  const filename = `${sku.toLowerCase()}-${product.slug}.png`;
  const filepath = path.join(tempDir, filename);

  if (fs.existsSync(filepath)) {
    console.log(`⏭️  [${sku}] Already exists`);
    return true;
  }

  console.log(`🔍 [${sku}] ${name.substring(0, 50)}`);

  const strategies = [
    ['Wikipedia', tryWikipedia],
    ['Wikidata', tryWikidata],
    ['Archive.org', tryArchiveOrg],
    ['GameFAQs', tryGameFAQs],
  ];

  for (const [stratName, stratFunc] of strategies) {
    try {
      const imageUrl = await stratFunc(product);

      if (!imageUrl) {
        continue;
      }

      // Attempt download with retries
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const size = await downloadUrl(imageUrl, filepath);
          console.log(`   ✅ ${stratName} (${Math.round(size/1024)}KB)`);
          return true;
        } catch (err) {
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

          if (attempt < 2) {
            await new Promise(r => setTimeout(r, 500 * attempt));
          }
        }
      }
    } catch (e) {
      // Continue to next strategy
    }
  }

  console.log(`   ❌ No source found`);
  return false;
}

/**
 * Main execution
 */
async function main() {
  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    const success = await downloadProduct(product);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  const existingCount = fs.readdirSync(tempDir).filter(f => f.endsWith('.png')).length;

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                     RESULTS                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Downloaded: ${successCount}/${products.length}`);
  console.log(`❌ Failed: ${failCount}/${products.length}`);
  console.log(`📁 Files in temp: ${existingCount}\n`);
}

main().catch(err => {
  console.error(`\n❌ ERROR: ${err.message}`);
  process.exit(1);
});
