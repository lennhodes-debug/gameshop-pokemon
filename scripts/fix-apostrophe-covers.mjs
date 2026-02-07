#!/usr/bin/env node
/**
 * Fix cover arts that failed due to apostrophes in article titles.
 * Uses double-quoted curl commands.
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
  // Use double quotes - need to escape them for shell
  const cmd = `curl -sL --max-time 15 "${url}"`;
  const result = execSync(cmd, { encoding: 'utf8', timeout: 20000 });
  return JSON.parse(result);
}

function curlBinary(url) {
  const cmd = `curl -sL --max-time 30 "${url}"`;
  return execSync(cmd, { maxBuffer: 50 * 1024 * 1024, timeout: 35000 });
}

function scoreImage(filename, pick = [], avoid = []) {
  const fn = filename.toLowerCase();
  let score = 0;
  if (fn.endsWith('.svg')) return -1000;
  if (fn.includes('logo') && !fn.includes('cover')) score -= 100;
  if (fn.includes('wikipe') || fn.includes('commons-logo') || fn.includes('ojs_ui') || fn.includes('wpvg') || fn.includes('category')) score -= 100;
  if (fn.includes('screenshot') || fn.includes('gameplay')) score -= 80;
  if (fn.includes('symbol') || fn.includes('sprite')) score -= 50;
  if (fn.includes('icon') && !fn.includes('cover')) score -= 50;
  if (fn.includes('photo') || fn.includes('at_e3') || fn.includes('at e3') || fn.includes('person') || fn.includes('portrait')) score -= 80;
  if (fn.includes('e3') && (fn.includes('booth') || fn.includes('show') || fn.includes('expo'))) score -= 80;
  if (fn.includes('cover')) score += 50;
  if (fn.includes('box')) score += 40;
  if (fn.includes('boxart')) score += 50;
  if (fn.includes('front')) score += 15;
  if (fn.includes('pack')) score += 20;
  if (fn.includes('pal') || fn.includes('europe') || fn.includes('eu')) score += 30;
  for (const t of pick) { if (fn.includes(t.toLowerCase())) score += 60; }
  for (const t of avoid) { if (fn.includes(t.toLowerCase())) score -= 200; }
  return score;
}

// All failed products that need retry
const FIXES = {
  'SW-007': { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", pick: ['Pikachu'], avoid: ['Eevee'] },
  'SW-008': { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", pick: ['Eevee'], avoid: ['Pikachu'] },
  'GB-003': { article: 'Pokémon Yellow' },
  'N64-006': { article: 'Pokémon Stadium (1999 video game)' },
  'WII-012': { article: "PokéPark Wii: Pikachu's Adventure" },
  'SW-014': { article: "The Legend of Zelda: Link's Awakening (2019 video game)" },
  'SW-015': { article: 'The Legend of Zelda: Skyward Sword HD' },
  'SW-017': { article: 'Hyrule Warriors: Definitive Edition' },
  'WIIU-002': { article: 'The Legend of Zelda: The Wind Waker HD' },
  'WIIU-003': { article: 'The Legend of Zelda: Twilight Princess HD' },
  'GB-010': { article: "The Legend of Zelda: Link's Awakening" },
  'GB-011': { article: "The Legend of Zelda: Link's Awakening DX" },
  'GB-012': { article: 'The Legend of Zelda: Oracle of Ages' },
  'GB-013': { article: 'The Legend of Zelda: Oracle of Seasons' },
  'GBA-007': { article: 'The Legend of Zelda: A Link to the Past & Four Swords' },
  'N64-003': { article: "The Legend of Zelda: Majora's Mask" },
  '3DS-001': { article: "The Legend of Zelda: Majora's Mask 3D" },
  'SW-019': { article: 'Mario Kart 8 Deluxe' },
  'GC-006': { article: 'Mario Kart: Double Dash!!' },
  'SW-021': { article: 'New Super Mario Bros. U Deluxe' },
  'SW-022': { article: "Super Mario 3D World + Bowser's Fury" },
  'SW-025': { article: 'Super Mario RPG (2023 video game)' },
  'SW-030': { article: 'Mario Golf: Super Rush' },
  'SW-034': { article: "Luigi's Mansion 3" },
  'DS-013': { article: "Mario & Luigi: Bowser's Inside Story" },
  'SNES-007': { article: "Donkey Kong Country 2: Diddy's Kong Quest" },
  'SNES-008': { article: "Donkey Kong Country 3: Dixie Kong's Double Trouble!" },
  'GB-019': { article: 'Donkey Kong Country (Game Boy Color)' },
  'GB-016': { article: 'Donkey Kong (Game Boy)' },
  'NES-014': { article: 'Donkey Kong (video game)' },
  '3DS-023': { article: 'Donkey Kong Country Returns 3D' },
  'SW-039': { article: "Kirby's Return to Dream Land Deluxe" },
  'WII-016': { article: "Kirby's Return to Dream Land" },
  'GB-014': { article: "Kirby's Dream Land" },
  'NES-007': { article: "Kirby's Adventure" },
  'GC-015': { article: 'Metroid Prime (video game)' },
  'SW-048': { article: 'Xenoblade Chronicles: Definitive Edition' },
  'WII-014': { article: 'Xenoblade Chronicles' },
  'SW-046': { article: 'Pikmin 3 Deluxe' },
  'SW-113': { article: 'Pikmin 1 + 2' },
  'SW-054': { article: "Yoshi's Crafted World" },
  'SW-068': { article: 'Dark Souls Remastered' },
  'SW-081': { article: 'Ori and the Blind Forest' },
  'SW-094': { article: 'Lego Harry Potter: Collection' },
  'SW-097': { article: 'Overcooked! All You Can Eat' },
  'SW-106': { article: 'Collection of Mana' },
  'SW-108': { article: 'Borderlands Legendary Collection' },
  'SW-109': { article: 'Naruto Shippuden: Ultimate Ninja Storm Trilogy' },
  '3DS-016': { article: "Luigi's Mansion: Dark Moon" },
  'GBA-023': { article: "Yoshi's Island: Super Mario Advance 3" },
  'GB-021': { article: 'Tom & Jerry (Game Boy)' },
  'GC-008': { article: "Luigi's Mansion" },
  'N64-009': { article: 'GoldenEye 007 (1997 video game)' },
  'N64-013': { article: "Conker's Bad Fur Day" },
  'SNES-005': { article: "Super Mario World 2: Yoshi's Island" },
  'SNES-010': { article: 'Street Fighter II Turbo: Hyper Fighting' },
  'SNES-016': { article: 'Teenage Mutant Ninja Turtles IV: Turtles in Time' },
  'NES-011': { article: 'Punch-Out!! (NES)' },
  'WIIU-012': { article: "Yoshi's Woolly World" },
  'CON-001': { article: 'Nintendo Switch (OLED model)', pick: ['White', 'white'] },
  'CON-002': { article: 'Nintendo Switch (OLED model)', pick: ['Neon', 'neon', 'Red_Blue'] },
  'CON-005': { article: 'Nintendo Switch Lite', pick: ['Yellow', 'yellow'] },
  'CON-006': { article: 'Nintendo Switch Lite', pick: ['Turquoise', 'turquoise', 'teal'] },
  'CON-007': { article: 'Nintendo Switch Lite', pick: ['Gray', 'gray', 'Grey', 'grey'] },
  'CON-010': { article: 'Nintendo DS Lite' },
};

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf8'));
  const skus = Object.keys(FIXES);
  console.log(`Retrying ${skus.length} failed products...`);
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

    try {
      const encodedTitle = encodeURIComponent(fix.article);
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedTitle}&prop=images&imlimit=50&format=json`;
      const data = curlJson(apiUrl);
      const pages = Object.values(data.query.pages);
      const images = (pages[0]?.images || []).map(img => img.title);
      const imageFiles = images.filter(img => {
        const ext = img.toLowerCase();
        return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.webp');
      });

      if (imageFiles.length === 0) throw new Error('No images found');

      const scored = imageFiles.map(img => ({ filename: img, score: scoreImage(img, fix.pick || [], fix.avoid || []) }))
        .sort((a, b) => b.score - a.score);

      let downloaded = false;
      for (const candidate of scored.slice(0, 5)) {
        if (candidate.score < -50) continue;
        try {
          const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate.filename)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
          const infoData = curlJson(infoUrl);
          const infoPages = Object.values(infoData.query.pages);
          const info = infoPages[0]?.imageinfo?.[0];
          if (!info || info.mime === 'image/svg+xml' || info.width < 150 || info.height < 150) continue;

          const buffer = curlBinary(info.url);
          const outputPath = path.join(PRODUCTS_DIR, `${slugs[0]}.webp`);
          await sharp(buffer)
            .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .webp({ quality: 85 })
            .toFile(outputPath);
          if (slugs.length > 1) fs.copyFileSync(outputPath, path.join(PRODUCTS_DIR, `${slugs[1]}.webp`));

          console.log(`OK (${candidate.filename.replace('File:', '').slice(0, 50)})`);
          success++;
          downloaded = true;
          break;
        } catch (e) { /* try next */ }
      }
      if (!downloaded) throw new Error('All candidates failed');
    } catch (error) {
      console.log(`FAIL: ${error.message}`);
      failures.push({ sku, name: prod.name, error: error.message });
      failed++;
    }
    await delay(200);
  }

  console.log(`\n=== Retry Results: ${success} OK, ${failed} FAILED out of ${skus.length} ===`);
  if (failures.length > 0) {
    failures.forEach(f => console.log(`  ${f.sku}: ${f.name}`));
  }
}

main().catch(console.error);
