/**
 * Fix remaining failed images with correct Wikipedia File: titles
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

// Mapping: slug -> Wikipedia File: title
const FIXES = {
  // Pokémon Switch
  'sw-002-pokmon-shining-pearl': 'File:Pokemon Brilliant Diamond Shining Pearl.png', // combined cover (only option)
  'sw-005-pokmon-scarlet': 'File:Pokémon Scarlet and Violet banner.png',
  'sw-006-pokmon-violet': 'File:Pokémon Scarlet and Violet banner.png',

  // Switch games
  'sw-036-arms': 'File:Arms (video game).jpg',
  'sw-037-kirby-en-de-vergeten-wereld': 'File:Kirby and The Forgotten Land Icon.jpg',
  'sw-041-splatoon-2': 'File:Splatoon 2.jpg',
  'sw-042-splatoon-3': 'File:Splatoon.3.jpg',
  'sw-061-warioware-get-it-together': 'File:WarioWare Get It Together.jpg',
  'sw-078-cuphead': 'File:Cuphead (artwork).png',
  'sw-079-undertale': 'File:Undertale cover.jpg',
  'sw-090-dragon-ball-fighterz': 'File:DBFZ cover art.jpg',
  'sw-097-overcooked-all-you-can-eat': 'File:Overcooked All You Can Eat cover art.png',
  'sw-108-borderlands-legendary-collection': 'File:Borderlands cover art.jpg',
  'sw-109-naruto-storm-trilogy': 'File:Naruto Shippuden Ultimate Ninja Storm 4 cover art.png',
  'sw-110-cars-3-vol-gas-voor-de-winst': 'File:Cars 3 Driven to Win cover art.jpg',

  // Pokémon 3DS
  '3ds-004-pokmon-x': 'File:Pokemon X and Y box art.jpg',
  '3ds-005-pokmon-y': 'File:Pokemon X and Y box art.jpg',
  '3ds-006-pokmon-sun': 'File:Pokemon Sun Boxart.jpg',
  '3ds-007-pokmon-moon': 'File:Pokemon Moon Boxart.jpg',
  '3ds-008-pokmon-ultra-sun': 'File:Pokemon Ultra Sun and Ultra Moon cover art.jpg',
  '3ds-009-pokmon-ultra-moon': 'File:Pokemon Ultra Sun and Ultra Moon cover art.jpg',
  '3ds-010-pokmon-alpha-sapphire': 'File:AlphaSapphire.jpg',
  '3ds-011-pokmon-omega-ruby': 'File:OmegaRuby.jpg',
  '3ds-017-kirby-triple-deluxe': 'File:Kirby Triple Deluxe box artwork.png',

  // Pokémon DS
  'ds-005-pokmon-soulsilver': 'File:PokemonHGSSBox.jpg',
  'ds-006-pokmon-heartgold': 'File:PokemonHGSSBox.jpg',
  'ds-009-pokmon-pearl': 'File:PokemonDiamondPearlBoxArt.jpg',
  'ds-016-professor-layton-geheimzinnige-dorp': 'File:Professor Layton and the Curious Village NA Boxart.JPG',

  // Game Boy
  'gb-012-zelda-oracle-of-ages': 'File:The Legend of Zelda Oracle of Ages and Oracle of Seasons Game Cover.jpg',
  'gb-013-zelda-oracle-of-seasons': 'File:The Legend of Zelda Oracle of Ages and Oracle of Seasons Game Cover.jpg',

  // GBA
  'gba-007-zelda-alttp-four-swords': 'File:The Legend of Zelda A Link to the Past and Four Swords Game Cover.jpg',

  // N64
  'n64-013-conkers-bad-fur-day': 'File:Conkersbfdbox.jpg',

  // SNES
  'snes-013-kirbys-fun-pak': 'File:Kirby Super Star Coverart.png',

  // Wii U
  'wiiu-007-splatoon': 'File:Splatoon.jpg',
  'wiiu-008-dk-country-tropical-freeze': 'File:Donkey Kong Country Tropical Freeze box art.jpg',
};

async function main() {
  const slugs = Object.keys(FIXES);
  console.log(`Fixing ${slugs.length} failed images...\n`);

  let fixed = 0, failed = 0;

  for (const slug of slugs) {
    const fileTitle = FIXES[slug];
    const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  ○ ${slug} (already exists)`);
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

    // Try alternative file title formats
    const altTitles = [
      fileTitle.replace(/ /g, '_'),
      fileTitle.replace(/File:/, 'File:').replace(/ /g, '%20'),
    ];

    let success = false;
    for (const alt of altTitles) {
      const altUrl = wikiImageUrl(alt);
      if (altUrl) {
        const ok = await downloadAndProcess(altUrl, outputPath);
        if (ok) {
          fixed++;
          console.log(`  ✓ ${slug} (alt)`);
          success = true;
          break;
        }
      }
    }

    if (!success) {
      failed++;
      console.log(`  ✗ ${slug} (${fileTitle})`);
    }

    execSync('sleep 0.3');
  }

  console.log(`\nFixed: ${fixed}, Failed: ${failed}`);

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
