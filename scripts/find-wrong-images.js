const products = require('../src/data/products.json');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function analyze() {
  console.log('=== FOTO-PRODUCT MISMATCH DETECTOR ===\n');

  const issues = [];

  // 1. Accessoires die console-afbeeldingen gebruiken
  console.log('--- ACCESSOIRES MET CONSOLE FOTOS ---');
  const accWithConImg = products.filter(p =>
    p.sku.startsWith('ACC-') && p.image && p.image.includes('/con-')
  );
  accWithConImg.forEach(p => {
    console.log(`  ${p.sku} "${p.name}" → ${path.basename(p.image)} (CONSOLE FOTO)`);
    issues.push({ sku: p.sku, name: p.name, image: p.image, issue: 'Accessoire gebruikt console foto' });
  });

  // 2. Producten die dezelfde afbeelding delen (maar NIET dezelfde naam)
  console.log('\n--- GEDEELDE AFBEELDINGEN (verschillende producten, zelfde foto) ---');
  const imageMap = {};
  products.forEach(p => {
    if (!p.image) return;
    const img = p.image;
    if (!imageMap[img]) imageMap[img] = [];
    imageMap[img].push(p);
  });

  Object.entries(imageMap)
    .filter(([img, prods]) => prods.length > 1)
    .forEach(([img, prods]) => {
      // Console kleurvarianten zijn ok (zelfde model, andere kleur)
      const isColorVariant = prods.every(p => p.sku.startsWith('CON-')) &&
        prods.every(p => {
          const baseName = p.name.replace(/\s*-\s*(Wit|Zwart|Blauw|Rood|Geel|Grijs|Roze|Paars|Groen|Neon|Donkerblauw|Doorzichtig|Berry|Atomic Purple|origineel).*$/i, '');
          return baseName === prods[0].name.replace(/\s*-\s*(Wit|Zwart|Blauw|Rood|Geel|Grijs|Roze|Paars|Groen|Neon|Donkerblauw|Doorzichtig|Berry|Atomic Purple|origineel).*$/i, '');
        });

      if (isColorVariant) {
        console.log(`  [OK kleurvariant] ${path.basename(img)}: ${prods.map(p => p.sku).join(', ')}`);
      } else {
        console.log(`  [PROBLEEM] ${path.basename(img)}:`);
        prods.forEach(p => console.log(`    ${p.sku} "${p.name}" (${p.category})`));
        prods.forEach(p => issues.push({
          sku: p.sku, name: p.name, image: p.image,
          issue: `Deelt foto met ${prods.filter(x => x.sku !== p.sku).map(x => x.sku).join(', ')}`
        }));
      }
    });

  // 3. Kleine afbeeldingen (mogelijk broken)
  console.log('\n--- KLEINE AFBEELDINGEN (< 3KB) ---');
  for (const p of products) {
    if (!p.image) continue;
    const filePath = path.join(__dirname, '..', 'public', p.image);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size < 3000) {
        console.log(`  ${p.sku} "${p.name}": ${(stat.size / 1024).toFixed(1)}KB → ${path.basename(p.image)}`);
        issues.push({ sku: p.sku, name: p.name, image: p.image, issue: `Zeer klein bestand: ${(stat.size / 1024).toFixed(1)}KB` });
      }
    } catch (e) {}
  }

  // 4. Games met "Game Boy" platform maar GBC prefix (inconsistentie)
  console.log('\n--- GBC PRODUCTEN MET GB FOTOS ---');
  const gbcWithGbImg = products.filter(p =>
    p.sku.startsWith('GBC-') && p.image && path.basename(p.image).startsWith('gb-')
  );
  gbcWithGbImg.forEach(p => {
    console.log(`  ${p.sku} "${p.name}" → ${path.basename(p.image)}`);
  });

  // 5. Check for very similar file sizes (possible duplicates)
  console.log('\n--- STATISTIEKEN ---');
  let totalSize = 0;
  let minSize = Infinity;
  let maxSize = 0;
  let minFile = '';
  let maxFile = '';

  for (const p of products) {
    if (!p.image) continue;
    const filePath = path.join(__dirname, '..', 'public', p.image);
    try {
      const size = fs.statSync(filePath).size;
      totalSize += size;
      if (size < minSize) { minSize = size; minFile = `${p.sku} ${path.basename(p.image)}`; }
      if (size > maxSize) { maxSize = size; maxFile = `${p.sku} ${path.basename(p.image)}`; }
    } catch (e) {}
  }

  console.log(`  Gemiddelde grootte: ${(totalSize / products.length / 1024).toFixed(1)}KB`);
  console.log(`  Kleinste: ${(minSize / 1024).toFixed(1)}KB (${minFile})`);
  console.log(`  Grootste: ${(maxSize / 1024).toFixed(1)}KB (${maxFile})`);

  // Summary
  console.log(`\n=== SAMENVATTING ===`);
  console.log(`Totaal problemen gevonden: ${issues.length}`);

  // Group by issue type
  const byType = {};
  issues.forEach(i => {
    const type = i.issue.split(':')[0];
    if (!byType[type]) byType[type] = [];
    byType[type].push(i);
  });
  Object.entries(byType).forEach(([type, items]) => {
    console.log(`  ${type}: ${items.length}`);
  });

  // Output JSON for further processing
  fs.writeFileSync(
    path.join(__dirname, '..', 'image-issues.json'),
    JSON.stringify(issues, null, 2)
  );
  console.log(`\nDetails opgeslagen in image-issues.json`);
}

analyze().catch(console.error);
