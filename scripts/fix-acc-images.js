const fs = require('fs');
const path = require('path');
const products = require('../src/data/products.json');

// Fix accessoire image referenties
const fixes = {
  'ACC-004': '/images/products/acc-004-nintendo-dsi-dsi-xl-oplader.webp',
  'ACC-005': '/images/products/acc-005-nintendo-ds-lite-oplader.webp',
  'ACC-006': '/images/products/acc-006-game-boy-advance-sp-oplader.webp',
};

let fixed = 0;
products.forEach(p => {
  if (fixes[p.sku]) {
    const oldImg = p.image;
    p.image = fixes[p.sku];
    console.log(`${p.sku} "${p.name}": ${path.basename(oldImg)} → ${path.basename(p.image)}`);
    fixed++;
  }
});

console.log(`\n${fixed} accessoire referenties gefixed`);

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'products.json'),
  JSON.stringify(products, null, 2) + '\n'
);
console.log('products.json opgeslagen');
