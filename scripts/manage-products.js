#!/usr/bin/env node
/**
 * Product Manager — Gameshop Enter
 * Eén tool voor alles: audit, images, genres, optimalisatie.
 *
 * Gebruik:
 *   node scripts/manage-products.js audit          # Volledige product audit
 *   node scripts/manage-products.js images          # Image check (dimensies, ontbrekend, klein)
 *   node scripts/manage-products.js normalize       # Normaliseer alle images naar 500x500
 *   node scripts/manage-products.js optimize        # Compressie optimalisatie
 *   node scripts/manage-products.js mismatches      # Detecteer foto-product mismatches
 *   node scripts/manage-products.js fix-genres      # Fix ontbrekende genres
 *   node scripts/manage-products.js fix-premium     # Fix isPremium inconsistenties
 *   node scripts/manage-products.js stats           # Snelle samenvatting
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODUCTS_JSON = path.join(ROOT, 'src', 'data', 'products.json');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'products');
const CON_DIR = path.join(ROOT, 'public', 'images', 'nintendo');

function load() { return JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8')); }
function save(data) { fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(data, null, 2) + '\n'); }

// ===== STATS =====
function stats() {
  const p = load();
  const platforms = {}, genres = {}, cats = {};
  let noImg = 0, noGenre = 0, premiumErr = 0;
  p.forEach(x => {
    platforms[x.platform] = (platforms[x.platform] || 0) + 1;
    genres[x.genre || '(leeg)'] = (genres[x.genre || '(leeg)'] || 0) + 1;
    cats[x.category] = (cats[x.category] || 0) + 1;
    if (!x.image) noImg++;
    if (!x.genre) noGenre++;
    if ((x.price >= 50 && !x.isPremium) || (x.price < 50 && x.isPremium)) premiumErr++;
  });
  console.log(`Producten: ${p.length}`);
  console.log(`Zonder afbeelding: ${noImg}`);
  console.log(`Zonder genre: ${noGenre}`);
  console.log(`isPremium fout: ${premiumErr}`);
  console.log(`\nPlatforms: ${Object.keys(platforms).length}`);
  Object.entries(platforms).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${v.toString().padStart(3)} ${k}`));
  console.log(`\nGenres: ${Object.keys(genres).length}`);
  Object.entries(genres).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${v.toString().padStart(3)} ${k}`));
}

// ===== AUDIT =====
function audit() {
  const p = load();
  let issues = 0;

  // Beschrijvingen
  const noDesc = p.filter(x => !x.description || x.description.trim().length < 20);
  if (noDesc.length) { console.log(`\nKorte beschrijvingen: ${noDesc.length}`); noDesc.forEach(x => console.log(`  ${x.sku} ${x.name}`)); issues += noDesc.length; }

  // Prijzen
  const badPrice = p.filter(x => !x.price || x.price <= 0);
  if (badPrice.length) { console.log(`\nPrijs 0/ontbreekt: ${badPrice.length}`); badPrice.forEach(x => console.log(`  ${x.sku} ${x.name}`)); issues += badPrice.length; }

  // isPremium
  const wrongPrem = p.filter(x => (x.price >= 50 && !x.isPremium) || (x.price < 50 && x.isPremium));
  if (wrongPrem.length) { console.log(`\nisPremium fout: ${wrongPrem.length}`); wrongPrem.forEach(x => console.log(`  ${x.sku} ${x.name}: prijs=${x.price} premium=${x.isPremium}`)); issues += wrongPrem.length; }

  // Afbeeldingen
  const noImg = p.filter(x => !x.image);
  const missingFile = p.filter(x => x.image && !fs.existsSync(path.join(ROOT, 'public', x.image)));
  if (noImg.length) { console.log(`\nGeen image veld: ${noImg.length}`); noImg.forEach(x => console.log(`  ${x.sku} ${x.name}`)); issues += noImg.length; }
  if (missingFile.length) { console.log(`\nBestand ontbreekt: ${missingFile.length}`); missingFile.forEach(x => console.log(`  ${x.sku} → ${x.image}`)); issues += missingFile.length; }

  // Genre
  const noGenre = p.filter(x => !x.genre || !x.genre.trim());
  if (noGenre.length) { console.log(`\nGeen genre: ${noGenre.length}`); noGenre.forEach(x => console.log(`  ${x.sku} ${x.name}`)); issues += noGenre.length; }

  // Dupes
  const skus = {};
  p.forEach(x => { skus[x.sku] = (skus[x.sku] || 0) + 1; });
  const dupes = Object.entries(skus).filter(([,v]) => v > 1);
  if (dupes.length) { console.log(`\nDuplicate SKUs: ${dupes.length}`); dupes.forEach(([k]) => console.log(`  ${k}`)); issues += dupes.length; }

  console.log(`\n${issues === 0 ? 'Geen problemen gevonden!' : issues + ' problemen gevonden.'}`);
}

// ===== IMAGES =====
async function images() {
  const p = load();
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp'));
  let bad = 0;

  console.log(`Bestanden in products/: ${files.length}`);
  console.log(`Producten met image: ${p.filter(x => x.image).length}\n`);

  for (const f of files) {
    try {
      const meta = await sharp(path.join(IMG_DIR, f)).metadata();
      const size = fs.statSync(path.join(IMG_DIR, f)).size;
      if (meta.width !== 500 || meta.height !== 500) {
        console.log(`  ${f}: ${meta.width}x${meta.height} (niet 500x500)`);
        bad++;
      } else if (size < 3000) {
        console.log(`  ${f}: ${(size/1024).toFixed(1)}KB (te klein)`);
        bad++;
      }
    } catch (e) { console.log(`  ${f}: CORRUPT - ${e.message}`); bad++; }
  }
  console.log(`\n${bad === 0 ? 'Alle images OK!' : bad + ' problemen.'}`);
}

// ===== NORMALIZE =====
async function normalize() {
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp'));
  let fixed = 0, ok = 0, err = 0;

  for (const f of files) {
    const fp = path.join(IMG_DIR, f);
    try {
      const meta = await sharp(fp).metadata();
      if (meta.width === 500 && meta.height === 500) { ok++; continue; }
      const tmp = fp + '.tmp';
      await sharp(fp)
        .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .webp({ quality: 82, effort: 6, smartSubsample: true })
        .toFile(tmp);
      fs.unlinkSync(fp);
      fs.renameSync(tmp, fp);
      fixed++;
    } catch (e) { console.log(`FOUT ${f}: ${e.message}`); err++; }
  }
  console.log(`Genormaliseerd: ${fixed}, OK: ${ok}, Fouten: ${err}`);
}

// ===== OPTIMIZE =====
async function optimize() {
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp'));
  let saved = 0, totalOrig = 0, totalNew = 0, optimized = 0;

  for (let i = 0; i < files.length; i++) {
    const fp = path.join(IMG_DIR, files[i]);
    const origSize = fs.statSync(fp).size;
    totalOrig += origSize;
    try {
      const buf = await sharp(fp)
        .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .webp({ quality: 82, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length < origSize * 0.95) {
        fs.writeFileSync(fp, buf);
        totalNew += buf.length;
        optimized++;
      } else {
        totalNew += origSize;
      }
    } catch { totalNew += origSize; }
    if ((i + 1) % 200 === 0) process.stdout.write(`  ${i + 1}/${files.length}...\n`);
  }

  // Console images
  if (fs.existsSync(CON_DIR)) {
    const conFiles = fs.readdirSync(CON_DIR).filter(f => f.endsWith('.webp'));
    for (const f of conFiles) {
      const fp = path.join(CON_DIR, f);
      const origSize = fs.statSync(fp).size;
      totalOrig += origSize;
      try {
        const buf = await sharp(fp).resize(800, 600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85, effort: 6 }).toBuffer();
        if (buf.length < origSize * 0.95) { fs.writeFileSync(fp, buf); totalNew += buf.length; optimized++; } else { totalNew += origSize; }
      } catch { totalNew += origSize; }
    }
  }

  const savedMB = ((totalOrig - totalNew) / 1024 / 1024).toFixed(2);
  console.log(`${optimized} geoptimaliseerd, ${savedMB}MB bespaard (${((totalOrig - totalNew) / totalOrig * 100).toFixed(1)}%)`);
}

// ===== MISMATCHES =====
function mismatches() {
  const p = load();
  let issues = 0;

  // Accessoires met console fotos
  const accCon = p.filter(x => x.sku.startsWith('ACC-') && x.image && x.image.includes('/con-'));
  if (accCon.length) { console.log('Accessoires met console foto:'); accCon.forEach(x => { console.log(`  ${x.sku} "${x.name}" → ${path.basename(x.image)}`); issues++; }); }

  // Gedeelde afbeeldingen
  const imgMap = {};
  p.forEach(x => { if (x.image) { (imgMap[x.image] = imgMap[x.image] || []).push(x); } });
  const shared = Object.entries(imgMap).filter(([,v]) => v.length > 1);
  if (shared.length) {
    console.log(`\nGedeelde afbeeldingen (${shared.length}):`);
    shared.forEach(([img, prods]) => {
      const base = prods[0].name.replace(/\s*-\s*(Wit|Zwart|Blauw|Rood|Geel|Grijs|Roze|Paars|Groen|Neon|Donkerblauw|Doorzichtig|Berry|Atomic Purple|origineel).*$/i, '');
      const allSameBase = prods.every(x => x.name.replace(/\s*-\s*(Wit|Zwart|Blauw|Rood|Geel|Grijs|Roze|Paars|Groen|Neon|Donkerblauw|Doorzichtig|Berry|Atomic Purple|origineel).*$/i, '') === base);
      const label = allSameBase && prods.every(x => x.sku.startsWith('CON-')) ? 'kleurvariant' : 'PROBLEEM';
      console.log(`  [${label}] ${path.basename(img)}: ${prods.map(x => x.sku).join(', ')}`);
      if (label === 'PROBLEEM') issues += prods.length;
    });
  }

  // Kleine bestanden
  const small = p.filter(x => {
    if (!x.image) return false;
    try { return fs.statSync(path.join(ROOT, 'public', x.image)).size < 3000; } catch { return false; }
  });
  if (small.length) { console.log(`\nTe kleine bestanden:`); small.forEach(x => console.log(`  ${x.sku} ${(fs.statSync(path.join(ROOT, 'public', x.image)).size/1024).toFixed(1)}KB`)); issues += small.length; }

  console.log(`\n${issues === 0 ? 'Geen mismatches!' : issues + ' problemen.'}`);
}

// ===== FIX GENRES =====
function fixGenres() {
  const p = load();
  let fixed = 0;
  p.forEach(x => {
    if (x.genre && x.genre.trim()) return;
    if (x.category === 'Consoles') x.genre = 'Console';
    else if (x.category === 'Accessoires') {
      const n = x.name.toLowerCase();
      if (n.includes('controller') || n.includes('joy-con') || n.includes('remote') || n.includes('nunchuk')) x.genre = 'Controller';
      else if (n.includes('oplader') || n.includes('adapter')) x.genre = 'Oplader';
      else if (n.includes('kabel')) x.genre = 'Kabel';
      else x.genre = 'Accessoire';
    } else x.genre = 'Actie';
    console.log(`  ${x.sku} → ${x.genre}`);
    fixed++;
  });
  if (fixed) { save(p); console.log(`${fixed} genres gefixed.`); }
  else console.log('Alle genres al ingevuld.');
}

// ===== FIX PREMIUM =====
function fixPremium() {
  const p = load();
  let fixed = 0;
  p.forEach(x => {
    const should = x.price >= 50;
    if (x.isPremium !== should) {
      x.isPremium = should;
      console.log(`  ${x.sku} prijs=${x.price} → isPremium=${should}`);
      fixed++;
    }
  });
  if (fixed) { save(p); console.log(`${fixed} producten gefixed.`); }
  else console.log('Alle isPremium correct.');
}

// ===== CLI =====
const cmd = process.argv[2];
const cmds = { stats, audit, images, normalize, optimize, mismatches, 'fix-genres': fixGenres, 'fix-premium': fixPremium };

if (cmds[cmd]) {
  Promise.resolve(cmds[cmd]()).catch(console.error);
} else {
  console.log(`Product Manager — Gameshop Enter

  audit          Volledige product audit
  images         Image check (dimensies, ontbrekend)
  normalize      Normaliseer alle images naar 500x500
  optimize       Compressie optimalisatie
  mismatches     Detecteer foto-product mismatches
  fix-genres     Fix ontbrekende genres
  fix-premium    Fix isPremium inconsistenties
  stats          Snelle samenvatting`);
}
