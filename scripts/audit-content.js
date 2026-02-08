const products = require('../src/data/products.json');
const fs = require('fs');
const path = require('path');

console.log('=== VOLLEDIGE PRODUCT AUDIT ===\n');
console.log(`Totaal producten: ${products.length}\n`);

// 1. Check beschrijvingen
const noDesc = products.filter(p => !p.description || p.description.trim().length < 20);
console.log(`--- KORTE/ONTBREKENDE BESCHRIJVINGEN (${noDesc.length}) ---`);
noDesc.forEach(p => console.log(`  ${p.sku} ${p.name}: "${(p.description || '').substring(0, 50)}..."`));

// 2. Check prijzen
const zeroPrijs = products.filter(p => !p.price || p.price <= 0);
const duurPrijs = products.filter(p => p.price > 500);
console.log(`\n--- PRIJS PROBLEMEN ---`);
console.log(`Prijs = 0 of ontbreekt: ${zeroPrijs.length}`);
zeroPrijs.forEach(p => console.log(`  ${p.sku} ${p.name}: ${p.price}`));
console.log(`Prijs > 500 euro: ${duurPrijs.length}`);
duurPrijs.forEach(p => console.log(`  ${p.sku} ${p.name}: ${p.price}`));

// 3. Check isPremium consistency
const wrongPremium = products.filter(p => (p.price >= 50 && !p.isPremium) || (p.price < 50 && p.isPremium));
console.log(`\n--- isPREMIUM INCONSISTENTIE (${wrongPremium.length}) ---`);
wrongPremium.forEach(p => console.log(`  ${p.sku} ${p.name}: prijs=${p.price} isPremium=${p.isPremium}`));

// 4. Check afbeeldingen
const noImage = products.filter(p => !p.image);
const missingFile = products.filter(p => {
  if (!p.image) return false;
  return !fs.existsSync(path.join(__dirname, '..', 'public', p.image));
});
console.log(`\n--- AFBEELDING PROBLEMEN ---`);
console.log(`Geen image veld: ${noImage.length}`);
noImage.forEach(p => console.log(`  ${p.sku} ${p.name}`));
console.log(`Bestand ontbreekt: ${missingFile.length}`);
missingFile.forEach(p => console.log(`  ${p.sku} ${p.name}: ${p.image}`));

// 5. Check image filename matches SKU
const wrongFilename = products.filter(p => {
  if (!p.image) return false;
  const filename = path.basename(p.image).toLowerCase();
  const skuPrefix = p.sku.toLowerCase();
  return !filename.startsWith(skuPrefix);
});
console.log(`\n--- BESTANDSNAAM MISMATCH (image begint niet met SKU) (${wrongFilename.length}) ---`);
wrongFilename.forEach(p => console.log(`  ${p.sku} ${p.name} → ${p.image}`));

// 6. Check slug consistency
const wrongSlug = products.filter(p => !p.slug || !p.slug.toLowerCase().startsWith(p.sku.toLowerCase()));
console.log(`\n--- SLUG INCONSISTENTIE (${wrongSlug.length}) ---`);
wrongSlug.slice(0, 10).forEach(p => console.log(`  ${p.sku} slug=${p.slug}`));

// 7. Check platform values
const platformCounts = {};
products.forEach(p => { platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1; });
console.log(`\n--- PLATFORMS ---`);
Object.entries(platformCounts).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 8. Check genre values
const genreCounts = {};
products.forEach(p => { genreCounts[p.genre] = (genreCounts[p.genre] || 0) + 1; });
console.log(`\n--- GENRES ---`);
Object.entries(genreCounts).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 9. Check condition values
const condCounts = {};
products.forEach(p => { condCounts[p.condition] = (condCounts[p.condition] || 0) + 1; });
console.log(`\n--- CONDITIES ---`);
Object.entries(condCounts).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 10. Check completeness values
const compCounts = {};
products.forEach(p => { compCounts[p.completeness] = (compCounts[p.completeness] || 0) + 1; });
console.log(`\n--- COMPLEETHEID ---`);
Object.entries(compCounts).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 11. Check category consistency
const catCounts = {};
products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
console.log(`\n--- CATEGORIEEN ---`);
Object.entries(catCounts).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 12. Check for duplicate SKUs
const skuMap = {};
products.forEach(p => {
  if (skuMap[p.sku]) skuMap[p.sku].push(p.name);
  else skuMap[p.sku] = [p.name];
});
const dupes = Object.entries(skuMap).filter(([k,v]) => v.length > 1);
console.log(`\n--- DUPLICATE SKU's (${dupes.length}) ---`);
dupes.forEach(([k,v]) => console.log(`  ${k}: ${v.join(', ')}`));

// 13. Check for duplicate names
const nameMap = {};
products.forEach(p => {
  const key = `${p.name}|${p.platform}`;
  if (nameMap[key]) nameMap[key].push(p.sku);
  else nameMap[key] = [p.sku];
});
const nameDupes = Object.entries(nameMap).filter(([k,v]) => v.length > 1);
console.log(`\n--- DUPLICATE NAMEN (zelfde naam+platform) (${nameDupes.length}) ---`);
nameDupes.forEach(([k,v]) => console.log(`  ${k}: ${v.join(', ')}`));

// 14. Check image filename vs product name similarity
console.log(`\n--- MOGELIJKE FOTO/NAAM MISMATCH (steekproef) ---`);
const suspicious = [];
products.forEach(p => {
  if (!p.image) return;
  const filename = path.basename(p.image, '.webp').toLowerCase();
  // Remove SKU prefix
  const parts = filename.replace(/^[a-z]+-\d+-/, '');
  const nameLower = p.name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  const fileLower = parts.replace(/-/g, '').substring(0, 15);

  // Check if first 6 chars of name appear in filename
  const nameStart = nameLower.substring(0, 6);
  if (nameStart.length >= 4 && !fileLower.includes(nameStart) && !nameStart.includes(fileLower.substring(0, 4))) {
    suspicious.push({ sku: p.sku, name: p.name, image: p.image, nameStart, fileLower });
  }
});
console.log(`Verdacht (${suspicious.length} van ${products.length}):`);
suspicious.forEach(s => console.log(`  ${s.sku} "${s.name}" → ${path.basename(s.image)}`));

console.log('\n=== AUDIT COMPLEET ===');
