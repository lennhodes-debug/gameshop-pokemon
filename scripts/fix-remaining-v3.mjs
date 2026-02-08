#!/usr/bin/env node
/**
 * Fix remaining cover art issues:
 * - Direct File: overrides for known covers
 * - Alternative article names for failed games
 * - Fix wrong picks
 * - Fix wrong duplicates
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

function curlJson(url) {
  const cmd = `curl -sL --max-time 15 "${url}"`;
  try {
    return JSON.parse(execSync(cmd, { encoding: 'utf8', timeout: 20000 }));
  } catch (e) { return null; }
}

function curlBinary(url) {
  return execSync(`curl -sL --max-time 30 "${url}"`, { maxBuffer: 50*1024*1024, timeout: 35000 });
}

function getImageInfo(fileTitle, wiki = 'en.wikipedia.org') {
  const url = `https://${wiki}/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const data = curlJson(url);
  if (!data) return null;
  const pages = Object.values(data.query.pages);
  return pages[0]?.imageinfo?.[0] || null;
}

async function downloadImage(fileTitle, slugs, wiki = 'en.wikipedia.org') {
  const info = getImageInfo(fileTitle, wiki) || getImageInfo(fileTitle, 'commons.wikimedia.org');
  if (!info || info.mime === 'image/svg+xml') return false;

  try {
    const buffer = curlBinary(info.url);
    const outputPath = path.join(PRODUCTS_DIR, `${slugs[0]}.webp`);
    await sharp(buffer)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    if (stat.size < 8000) return false;

    for (let i = 1; i < slugs.length; i++) {
      fs.copyFileSync(outputPath, path.join(PRODUCTS_DIR, `${slugs[i]}.webp`));
    }
    return true;
  } catch(e) { return false; }
}

// Direct file overrides - tried and known correct cover art file names
const FIXES = {
  // === Wrong picks - override with correct files ===
  'GC-008': { files: ['File:Lmbox.jpg'] }, // Luigi's Mansion - correct box art
  'GC-023': { files: ['File:Resident Evil 4 cover.jpg', 'File:RE4 cover art.jpg'] },
  'SW-050': { files: ['File:Xenoblade Chronicles 3 cover art.jpg'] },
  'SW-079': { files: ['File:Undertale cover.jpg', 'File:Undertale.jpg'] },
  'GBA-004': { files: ['File:Pokemon FRLG EN boxart.png', 'File:PokémonFireRedLeafGreen.jpg'] }, // Fix: was showing LeafGreen

  // === Broken/suspect images ===
  'SW-046': { files: ['File:Pikmin 3 Deluxe cover.jpg', 'File:Pikmin 3 box artwork.png'] },
  'CON-003': { commons: 'Nintendo Switch grey console', pick: ['grey', 'gray'] },
  'SW-107': { files: ['File:Starlink Battle for Atlas.jpg'] },
  'N64-009': { files: ['File:GoldenEye007box.jpg', 'File:GoldenEye 007 box art.jpg'] },
  'WII-014': { files: ['File:Xenoblade Chronicles NA box art.jpg', 'File:Xenoblade Chronicles cover.jpg'] },
  'CON-005': { commons: 'Nintendo Switch Lite yellow', pick: ['yellow'] },
  'CON-007': { commons: 'Nintendo Switch Lite grey gray', pick: ['grey', 'gray'] },

  // === Failed games - try alternative article names/files ===
  'SW-015': { files: ['File:The Legend of Zelda Skyward Sword HD cover.jpg', 'File:Skyward Sword HD.jpg'] },
  'SW-017': { files: ['File:Hyrule Warriors Definitive Edition cover.jpg'] },
  'SW-019': { files: ['File:MarioKart8Deluxe.jpg', 'File:Mario Kart 8 Deluxe.jpg', 'File:Mario Kart 8 cover.jpg'] },
  'SW-021': { files: ['File:New Super Mario Bros U Deluxe.jpg'] },
  'SW-022': { files: ['File:Super Mario 3D World + Bowser Fury.jpg', 'File:SM3DW+BF Box NA.png'] },
  'SW-025': { files: ['File:Super Mario RPG 2023 cover.jpg'] },
  'SW-030': { files: ['File:Mario Golf Super Rush cover.jpg'] },
  'SW-031': { files: ['File:Mario Strikers Battle League cover.jpg'] },
  'SW-037': { files: ['File:Kirby and the Forgotten Land.jpg', 'File:Kirby Forgotten Land cover.jpg'] },
  'SW-039': { files: ['File:Kirbys Return to Dream Land Deluxe.jpg'] },
  'SW-048': { files: ['File:Xenoblade Chronicles Definitive Edition.jpg'] },
  'SW-068': { files: ['File:Dark Souls cover.jpg', 'File:DarkSoulsRemastered.jpg'] },
  'SW-081': { files: ['File:Ori and the Blind Forest cover.jpg', 'File:Ori and the Blind Forest.jpg'] },
  'SW-097': { files: ['File:Overcooked All You Can Eat cover.jpg'] },
  'SW-106': { files: ['File:Collection of Mana.jpg'] },
  'SW-108': { files: ['File:Borderlands Legendary Collection.jpg'] },
  'SW-109': { files: ['File:Naruto Storm Trilogy.jpg'] },
  'SW-113': { files: ['File:Pikmin 1+2 cover.jpg'] },

  '3DS-011': { files: ['File:Pokemon Omega Ruby box art.png', 'File:Pokémon Omega Ruby.jpg'] },
  '3DS-023': { files: ['File:DKC Returns 3D cover.jpg', 'File:Donkey Kong Country Returns 3D.jpg'] },

  'GB-001': { files: ['File:PokemonRed.png', 'File:Pokemon red box.png'] },
  'GB-002': { files: ['File:PokemonBlue.png', 'File:Pokemon blue box.png'] },
  'GB-003': { files: ['File:PokemonYellow.png', 'File:Pokemon Yellow box.png'] },
  'GB-012': { files: ['File:Legend of Zelda Oracle of Ages box.jpg', 'File:The Legend of Zelda Oracle of Ages Game Cover.JPG'] },
  'GB-013': { files: ['File:Legend of Zelda Oracle of Seasons box.jpg', 'File:The Legend of Zelda Oracle of Seasons Game Cover.JPG'] },
  'GB-016': { files: ['File:Donkey Kong GB cover.jpg', 'File:Donkey Kong 94 box art.jpg'] },
  'GB-019': { files: ['File:Donkey Kong Country GBC cover.jpg'] },
  'GB-021': { files: ['File:Tom and Jerry Game Boy.jpg'] },

  'GBA-007': { files: ['File:Zelda ALTTP Four Swords GBA cover.jpg', 'File:The Legend of Zelda A Link to the Past & Four Swords.jpg'] },
  'GBA-015': { files: ['File:Advance Wars 2 box art.jpg', 'File:AW2 box art.jpg'] },
  'GBA-022': { files: ['File:Harvest Moon FoMT cover.jpg', 'File:Harvest Moon Friends of Mineral Town cover.jpg'] },
  'GBA-023': { files: ['File:Yoshis Island SMA3 cover.jpg'] },

  'GC-015': { files: ['File:Metroid Prime cover.jpg', 'File:MetroidPrime.jpg'] },
  'GC-020': { files: ['File:Kirby Air Ride cover.jpg', 'File:KirbyAirRide.jpg'] },
  'GC-024': { files: ['File:Eternal Darkness cover.jpg', 'File:EternalDarkness.jpg'] },

  'N64-006': { files: ['File:Pokemon Stadium boxcover.jpg', 'File:PokemonStadiumBox.jpg'] },
  'N64-013': { files: ['File:Conkers Bad Fur Day Cover.png', 'File:ConkerBFDBox.jpg'] },

  'SNES-005': { files: ['File:Yoshis Island SFC box art.jpg', 'File:Super Mario World 2 Yoshis Island box art.jpg'] },
  'SNES-007': { files: ['File:DKC2 box art.jpg', 'File:Donkey Kong Country 2 box art.jpg'] },
  'SNES-008': { files: ['File:DKC3 box art.jpg', 'File:Donkey Kong Country 3 box art.jpg'] },
  'SNES-010': { files: ['File:Street Fighter II Turbo box art.jpg'] },
  'SNES-016': { files: ['File:TMNT IV Turtles in Time cover.jpg', 'File:Turtles in Time box art.png'] },

  'NES-011': { files: ['File:Punch-Out!! box art.jpg', 'File:PunchOutBox.jpg'] },
  'NES-014': { files: ['File:Donkey Kong NES Cover.png', 'File:DonkeyKongNES.png'] },
  'NES-015': { files: ['File:Ninja Gaiden NES box art.jpg'] },

  'WII-014': { files: ['File:Xenoblade box artwork.png', 'File:Xenoblade Chronicles cover.jpg'] },
  'WIIU-002': { files: ['File:Wind Waker HD box art.png', 'File:The Legend of Zelda The Wind Waker HD.jpg'] },
  'WIIU-003': { files: ['File:Twilight Princess HD cover.jpg'] },
  'WIIU-007': { files: ['File:Splatoon NA box art.png', 'File:Splatoon Box.jpg'] },

  // === Cross-platform duplicates (need different versions) ===
  // These share the same image but should have different covers for Switch vs Wii U
  'WIIU-001': { files: ['File:The Legend of Zelda Breath of the Wild Wii U box art.jpg'] },
  // sw-040 DKC Tropical Freeze (Switch) vs wiiu-008 (Wii U) - both use Switch cover, try to fix Wii U
  'WIIU-008': { files: ['File:Donkey Kong Country Tropical Freeze Wii U cover.jpg'] },
};

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf8'));
  const skus = Object.keys(FIXES);
  console.log(`Fixing ${skus.length} products...`);

  let success = 0, failed = 0;
  const failures = [];

  for (const sku of skus) {
    const fix = FIXES[sku];
    const prod = products.find(p => p.sku === sku);
    if (!prod) continue;

    const slugs = [prod.slug];
    const altSlug = prod.slug.replace(/pokmon/g, 'pok-mon');
    if (altSlug !== prod.slug) slugs.push(altSlug);

    process.stdout.write(`[${sku}] ${prod.name}... `);

    let ok = false;

    // Try direct file overrides
    if (fix.files) {
      for (const file of fix.files) {
        ok = await downloadImage(file, slugs);
        if (ok) {
          console.log(`OK (${file.replace('File:', '').slice(0, 50)})`);
          break;
        }
      }
    }

    // Try Commons search
    if (!ok && fix.commons) {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(fix.commons)}&srlimit=10&format=json`;
      const data = curlJson(searchUrl);
      const results = (data?.query?.search || []).map(s => s.title).filter(t => {
        const l = t.toLowerCase();
        return (l.endsWith('.jpg') || l.endsWith('.png') || l.endsWith('.jpeg') || l.endsWith('.webp'));
      });

      for (const file of results.slice(0, 5)) {
        const fn = file.toLowerCase();
        // Check pick terms
        if (fix.pick && !fix.pick.some(p => fn.includes(p.toLowerCase()))) continue;

        ok = await downloadImage(file, slugs, 'commons.wikimedia.org');
        if (ok) {
          console.log(`OK (commons: ${file.replace('File:', '').slice(0, 50)})`);
          break;
        }
      }
    }

    if (!ok) {
      console.log('FAIL');
      failed++;
      failures.push(sku + ' ' + prod.name);
    } else {
      success++;
    }

    await delay(200);
  }

  console.log(`\n=== Results: ${success} OK, ${failed} FAILED out of ${skus.length} ===`);
  if (failures.length > 0) {
    console.log('\nStill failing:');
    failures.forEach(f => console.log('  ' + f));
  }
}

main().catch(console.error);
