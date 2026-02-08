#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'public', 'images', 'products');
const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'products.json');

function dl(url) {
  try {
    const buf = execSync(`curl -sL --max-time 20 -H "User-Agent: GameshopBot/1.0" "${url}"`, { maxBuffer: 50 * 1024 * 1024 });
    return buf;
  } catch { return null; }
}

async function convert(buf, outFile) {
  const outPath = path.join(OUT, outFile);
  await sharp(buf)
    .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(outPath);
  return fs.statSync(outPath).size;
}

const wiki = (file) => `https://en.wikipedia.org/wiki/Special:FilePath/${file}`;

const targets = [
  // New 3DS XL
  { sku: 'CON-014', file: 'con-014-new-nintendo-3ds-xl-blauw.webp', urls: [
    wiki('New_Nintendo_3DS_XL.png'),
  ]},
  { sku: 'CON-015', file: 'con-015-new-nintendo-3ds-xl-zwart.webp', urls: [
    wiki('New-Nintendo-3DS-XL-Black.jpg'),
    wiki('New_Nintendo_3DS_XL.png'),
  ]},
  // DS Lite
  { sku: 'CON-016', file: 'con-016-nintendo-ds-lite-zwart.webp', urls: [
    wiki('Nintendo-DS-Lite-Black-Open.jpg'),
    wiki('Nintendo_DS_Lite_black_open.jpg'),
  ]},
  { sku: 'CON-017', file: 'con-017-nintendo-ds-lite-wit.webp', urls: [
    wiki('Nintendo-DS-Lite-w-stylus.png'),
    wiki('Nintendo_DS_Lite.png'),
  ]},
  { sku: 'CON-018', file: 'con-018-nintendo-ds-lite-grijs.webp', urls: [
    wiki('Nintendo-DS-Lite-Silver-Open.jpg'),
    wiki('Nintendo-DS-Lite-w-stylus.png'),
  ]},
  // GBA SP
  { sku: 'CON-024', file: 'con-024-game-boy-advance-sp-blauw.webp', urls: [
    wiki('Game-Boy-Advance-SP-Mk1-Blue.jpg'),
    wiki('GBA_SP_AGS-101.png'),
  ]},
  { sku: 'CON-025', file: 'con-025-game-boy-advance-sp-roze.webp', urls: [
    wiki('Game-Boy-Advance-SP-Pink.jpg'),
    wiki('Game-Boy-Advance-SP-Mk1-Blue.jpg'),
  ]},
  { sku: 'CON-026', file: 'con-026-game-boy-advance-sp-grijs.webp', urls: [
    wiki('Game-Boy-Advance-SP-Mk1-Blue.jpg'),
    wiki('GBA_SP_AGS-101.png'),
  ]},
  { sku: 'CON-027', file: 'con-027-game-boy-advance-sp-zwart.webp', urls: [
    wiki('Game-Boy-Advance-SP-Mk2-Black.jpg'),
    wiki('GBA_SP_AGS-101.png'),
  ]},
  // Game Boy Color
  { sku: 'CON-028', file: 'con-028-game-boy-color-geel.webp', urls: [
    wiki('Game-Boy-Color-Yellow.jpg'),
    wiki('Nintendo-Game-Boy-Color-FL.jpg'),
  ]},
  { sku: 'CON-029', file: 'con-029-game-boy-color-blauw.webp', urls: [
    wiki('Nintendo-Game-Boy-Color-FL.jpg'),
    wiki('Game-Boy-Color-Teal.jpg'),
  ]},
  { sku: 'CON-030', file: 'con-030-game-boy-color-donkerblauw.webp', urls: [
    wiki('Game-Boy-Color-Purple.jpg'),
    wiki('Nintendo-Game-Boy-Color-FL.jpg'),
  ]},
  { sku: 'CON-031', file: 'con-031-game-boy-color-doorzichtig.webp', urls: [
    wiki('Game-Boy-Color-Purple.jpg'),
    wiki('Nintendo-Game-Boy-Color-FL.jpg'),
  ]},
  { sku: 'CON-032', file: 'con-032-game-boy-color-rood.webp', urls: [
    wiki('Game-Boy-Color-Berry.png'),
    wiki('Nintendo-Game-Boy-Color-FL.jpg'),
  ]},
];

async function main() {
  let ok = 0, fail = 0;
  const success = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    process.stdout.write(`[${i+1}/${targets.length}] ${t.sku}...`);
    let done = false;
    for (const url of t.urls) {
      const buf = dl(url);
      if (!buf || buf.length < 5000) continue;
      try {
        const meta = await sharp(buf).metadata();
        if (!meta.width || meta.width < 50) continue;
        const size = await convert(buf, t.file);
        console.log(` OK (${(size/1024).toFixed(1)}KB)`);
        success.push(t);
        ok++;
        done = true;
        break;
      } catch { continue; }
    }
    if (!done) { console.log(' MISLUKT'); fail++; }
  }

  if (success.length) {
    const products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    for (const t of success) {
      const p = products.find(x => x.sku === t.sku);
      if (p) p.image = `/images/products/${t.file}`;
    }
    fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2) + '\n');
    console.log(`\nproducts.json bijgewerkt: ${success.length} producten`);
  }
  console.log(`Klaar: ${ok} OK, ${fail} mislukt`);
}

main().catch(console.error);
