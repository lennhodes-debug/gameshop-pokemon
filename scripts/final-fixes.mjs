/**
 * Final fixes for remaining incorrect images
 * Delete wrong ones and re-download from correct Wikipedia files where available
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const OUTPUT_DIR = './public/images/products';
const THUMB_SIZE = 500;

function curlJSON(url) {
  try { return JSON.parse(execSync(`curl -sL --max-time 15 "${url}"`, {encoding:'utf-8',timeout:20000})); } catch { return null; }
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
    return false;
  }
}

// Images to RE-DOWNLOAD (correct Wikipedia file exists)
const REDOWNLOAD = {
  // Pokémon Sword/Shield - combined cover (only option, better than screenshot)
  'sw-003-pokmon-sword': 'File:Pokémon Sword and Shield.jpg',
  'sw-004-pokmon-shield': 'File:Pokémon Sword and Shield.jpg',
  // Super Mario Odyssey - correct cover art
  'sw-018-super-mario-odyssey': 'File:Super Mario Odyssey.jpg',
  // Luigi's Mansion 3
  'sw-034-luigis-mansion-3': "File:Luigi's Mansion 3.jpg",
  // Mario Kart 64
  'n64-004-mario-kart-64': 'File:Mario Kart 64.jpg',
  // N64 console
  'con-017-nintendo-64-grijs': 'File:N64-Console-Set.jpg',
  // Wii U console
  'con-021-nintendo-wii-u-32gb': 'File:Wii U Console and Gamepad.png',
};

// Images to DELETE (no correct source available on Wikipedia - better to show gradient)
const DELETE = [
  'sw-022-super-mario-3d-world-bowsers-fury', // Shows Wii U version
  'sw-025-super-mario-rpg', // Shows SNES version
  'sw-048-xenoblade-chronicles-definitive-edition', // Shows Xenoblade X
  'gb-001-pokmon-red', // Shows Pokemon Stadium
  'gb-003-pokmon-yellow', // Shows Pokemon Stadium
  'gb-004-pokmon-gold', // Shows Pokemon TCG
  'gb-010-zelda-links-awakening', // Shows Switch version
  'gba-008-mario-kart-super-circuit', // Shows gameplay screenshot
  'n64-009-goldeneye-007', // Shows Wii remake
  'snes-009-super-metroid', // Shows NES Metroid
];

async function main() {
  console.log('=== Final image fixes ===\n');

  // Step 1: Delete wrong images
  console.log('Deleting incorrect images:');
  for (const slug of DELETE) {
    const filePath = path.join(OUTPUT_DIR, `${slug}.webp`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  🗑 ${slug}`);
    }
  }

  // Step 2: Re-download correct images
  console.log('\nRe-downloading with correct files:');
  for (const [slug, fileTitle] of Object.entries(REDOWNLOAD)) {
    const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);
    // Delete existing wrong version first
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    const imgUrl = wikiImageUrl(fileTitle);
    if (imgUrl) {
      const ok = await downloadAndProcess(imgUrl, outputPath);
      console.log(`  ${ok ? '✓' : '✗'} ${slug}`);
    } else {
      console.log(`  ✗ ${slug} (URL not found)`);
    }
    execSync('sleep 0.3');
  }

  // Step 3: Count and update
  const total = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp')).length;
  console.log(`\nTotal images: ${total}/346`);
  console.log(`Removed: ${DELETE.length} (will show gradient fallback)`);

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
