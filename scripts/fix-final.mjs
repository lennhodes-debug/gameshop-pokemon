#!/usr/bin/env node
/**
 * Final targeted cover art fix for all remaining issues.
 * Uses discovered Wikipedia file names.
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

// Try both en.wikipedia and commons.wikimedia
function getImageUrl(fileTitle) {
  for (const wiki of ['en.wikipedia.org', 'commons.wikimedia.org']) {
    const url = `https://${wiki}/w/api.php?action=query&titles=${encodeURIComponent('File:' + fileTitle)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
    const data = curlJson(url);
    if (!data) continue;
    const pages = Object.values(data.query.pages);
    const info = pages[0]?.imageinfo?.[0];
    if (info && info.url && info.mime !== 'image/svg+xml') return info;
  }
  return null;
}

async function download(fileTitle, slugs) {
  const info = getImageUrl(fileTitle);
  if (!info) return false;

  try {
    const buffer = curlBinary(info.url);
    const outputPath = path.join(PRODUCTS_DIR, `${slugs[0]}.webp`);
    await sharp(buffer)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    if (stat.size < 5000) return false;

    for (let i = 1; i < slugs.length; i++) {
      fs.copyFileSync(outputPath, path.join(PRODUCTS_DIR, `${slugs[i]}.webp`));
    }
    return true;
  } catch(e) { return false; }
}

// ALL fixes with discovered exact Wikipedia file names
const FIXES = {
  // === Wrong picks from v2 ===
  'GC-008': ['Lmbox.jpg'],
  'GC-023': ['Resident_Evil_4_remake_cover_art.jpg'],
  'SW-050': ['Xenoblade_Chronicles_3_cover_art.jpg'],
  'SW-079': ['Undertale_Cast.png', 'Undertale_Papyrus.png'],
  'GBA-004': ['Pokémon_FireRed_first_battle.png'], // Can't find separate FireRed box, use game image

  // === Broken/suspect ===
  'SW-046': ['Pikmin_3_box_artwork.png'],
  'N64-009': ['GoldenEye_007_N64_cover.jpg'],
  'WII-014': ['Xenoblade_box_artwork.png'],
  'SW-107': ['Starlink_Battle_for_Atlas.jpg'],

  // === Failed games - discovered file names ===
  'SW-019': ['MarioKart8Boxart.jpg'],
  'SW-022': ['Super_Mario_3D_World_box_art.jpg'],
  'SW-068': ['Dark_Souls_Cover_Art.jpg'],
  'NES-011': ['Punch-Out!!.jpg'],
  'NES-015': ['Ninja_Gaiden_(NES).jpg'],
  'N64-013': ['Conkersbfdbox.jpg'],
  'GC-015': ['MetroidPrimebox.jpg'],
  'GC-024': ['Eternal_Darkness_box.jpg'],
  'GBA-022': ['Harvest_Moon-_FoMT.jpg'],
  'SNES-010': ['Street_Fighter_II.png'],
  'SNES-016': ['Turtles_in_Time_(SNES_cover).jpg'],
  'SW-017': ['Hyrule_Warriors_NA_game_cover.png'],
  'WIIU-007': ['Splatoon.jpg'],

  // === Pokémon covers - use combined/available ===
  'GB-001': ['Pokémon_Red_and_Blue_cover_art.webp'], // Combined Red/Blue cover
  'GB-002': ['Pokémon_Red_and_Blue_cover_art.webp'], // Same combined cover
  'GB-003': ['Pokémon_Red,_Blue,_and_Yellow_battle_screenshot.png'], // Only Yellow-related image

  // === Console images from Commons ===
  'CON-003': ['Nintendo-Switch-Console-Docked-wJoycons.jpg'], // Grey Switch
  'CON-005': ['Nintendo_switch_lite_blue.jpg'], // Best Switch Lite option
  'CON-007': ['Nintendo_Switch_Lite_(turquoise)_-_3.jpg'], // Switch Lite option
};

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf8'));
  const skus = Object.keys(FIXES);
  console.log(`Fixing ${skus.length} products...`);

  let success = 0, failed = 0;
  const failures = [];

  for (const sku of skus) {
    const files = FIXES[sku];
    const prod = products.find(p => p.sku === sku);
    if (!prod) continue;

    const slugs = [prod.slug];
    const altSlug = prod.slug.replace(/pokmon/g, 'pok-mon');
    if (altSlug !== prod.slug) slugs.push(altSlug);

    process.stdout.write(`[${sku}] ${prod.name}... `);

    let ok = false;
    for (const file of files) {
      ok = await download(file, slugs);
      if (ok) {
        console.log(`OK (${file.slice(0, 50)})`);
        break;
      }
    }

    if (!ok) {
      console.log('FAIL');
      failed++;
      failures.push(sku + ' ' + prod.name);
    } else {
      success++;
    }
    await delay(150);
  }

  console.log(`\n=== Results: ${success} OK, ${failed} FAILED out of ${skus.length} ===`);
  if (failures.length > 0) {
    console.log('\nStill failing:');
    failures.forEach(f => console.log('  ' + f));
  }
}

main().catch(console.error);
