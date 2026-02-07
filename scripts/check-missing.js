const p = require('../src/data/products.json');
const fs = require('fs');
const path = require('path');

// Products without image field
const noImage = p.filter(x => !x.image);
console.log('Producten zonder afbeelding veld:', noImage.length);
noImage.forEach(x => console.log(' ', x.sku, x.name, x.platform));

// Products with image field but file missing
const missingFile = p.filter(x => {
  if (!x.image) return false;
  const filePath = path.join(__dirname, '..', 'public', x.image);
  return !fs.existsSync(filePath);
});
console.log('\nProducten met afbeelding veld maar bestand ontbreekt:', missingFile.length);
missingFile.forEach(x => console.log(' ', x.sku, x.name, x.image));
