/**
 * Fix the remaining 12 failed images with corrected file titles
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const OUTPUT_DIR = './public/images/products';
const THUMB_SIZE = 500;

function curlJSON(url) {
  try {
    const result = execSync(`curl -sL --max-time 15 "${url}"`, { encoding: 'utf-8', timeout: 20000 });
    return JSON.parse(result);
  } catch { return null; }
}

function curlBinary(url, outPath) {
  try {
    execSync(`curl -sL --max-time 30 -o "${outPath}" "${url}"`, { timeout: 35000 });
    return fs.existsSync(outPath) && fs.statSync(outPath).size > 500;
  } catch { return false; }
}

function wikiImageUrl(fileTitle) {
  const encoded = encodeURIComponent(fileTitle);
  const data = curlJSON(`https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_SIZE}&format=json`);
  if (!data?.query?.pages) return null;
  const pages = Object.values(data.query.pages);
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (info) return info.thumburl || info.url;
  }
  return null;
}

async function downloadAndProcess(imgUrl, outputPath) {
  const tmpPath = outputPath + '.tmp';
  if (!curlBinary(imgUrl, tmpPath)) return false;
  try {
    await sharp(tmpPath)
      .resize(THUMB_SIZE, THUMB_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 85 })
      .toFile(outputPath);
    fs.unlinkSync(tmpPath);
    return true;
  } catch (err) {
    try { fs.unlinkSync(tmpPath); } catch {}
    console.error(`  Error: ${err.message}`);
    return false;
  }
}

const FIXES = {
  'sw-061-warioware-get-it-together': 'File:WarioWare Get it Together icon.png',
  'sw-097-overcooked-all-you-can-eat': 'File:Overcooked cover art.jpg',
  'sw-108-borderlands-legendary-collection': 'File:Borderlandscover.jpg',
  'sw-109-naruto-storm-trilogy': 'File:Naruto Shippuden Ultimate Ninja Storm cover.jpg',
  'sw-110-cars-3-vol-gas-voor-de-winst': 'File:Cars 3 Driven to Win.jpg',
  '3ds-007-pokmon-moon': 'File:Pokemon Sun Boxart.jpg', // combined Sun/Moon - only one on wiki
  '3ds-011-pokmon-omega-ruby': 'File:AlphaSapphire.jpg', // ORAS combined
  '3ds-017-kirby-triple-deluxe': 'File:Kirbytstest.jpg',
  'gb-012-zelda-oracle-of-ages': 'File:The Legend of Zelda Oracle of Seasons and Oracle of Ages Game Cover.png',
  'gb-013-zelda-oracle-of-seasons': 'File:The Legend of Zelda Oracle of Seasons and Oracle of Ages Game Cover.png',
  'gba-007-zelda-alttp-four-swords': 'File:The Legend of Zelda A Link to the Past & Four Swords Game Cover.jpg',
  'wiiu-008-dk-country-tropical-freeze': 'File:Donkey Kong Country Tropical Freeze screenshot.png', // only option on wiki
};

async function main() {
  console.log(`Fixing ${Object.keys(FIXES).length} remaining images...\n`);
  let fixed = 0, failed = 0;

  for (const [slug, fileTitle] of Object.entries(FIXES)) {
    const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);
    if (fs.existsSync(outputPath)) {
      console.log(`  ○ ${slug} (exists)`);
      continue;
    }

    const imgUrl = wikiImageUrl(fileTitle);
    if (imgUrl) {
      const ok = await downloadAndProcess(imgUrl, outputPath);
      if (ok) {
        fixed++;
        console.log(`  ✓ ${slug}`);
        continue;
      }
    }
    failed++;
    console.log(`  ✗ ${slug}`);
    execSync('sleep 0.3');
  }

  console.log(`\nFixed: ${fixed}, Failed: ${failed}`);

  // Count total
  const total = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp')).length;
  console.log(`Total images: ${total}/346`);

  // Update products.json
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'));
  const updated = products.map(p => ({
    ...p,
    image: fs.existsSync(path.join(OUTPUT_DIR, `${p.slug}.webp`)) ? `/images/products/${p.slug}.webp` : null
  }));
  fs.writeFileSync('./src/data/products.json', JSON.stringify(updated, null, 2));
  console.log('products.json updated.');
}

main().catch(console.error);
