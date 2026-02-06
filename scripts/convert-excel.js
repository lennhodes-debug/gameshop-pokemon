const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '..', 'data', 'gameshop_enter_compleet.xlsx');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'products.json');

const workbook = XLSX.readFile(inputPath);

// Sheet 1: WooCommerce Import (games)
const gamesSheet = workbook.Sheets[workbook.SheetNames[0]];
const gamesRaw = XLSX.utils.sheet_to_json(gamesSheet);

// Sheet 2: Consoles
const consolesSheet = workbook.Sheets[workbook.SheetNames[1]];
const consolesRaw = XLSX.utils.sheet_to_json(consolesSheet);

function cleanPrice(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

function cleanWeight(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(',', '.');
    return parseFloat(cleaned) || 0.1;
  }
  return 0.1;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Map games
const games = gamesRaw.map((row) => {
  const sku = String(row['SKU'] || row['sku'] || '').trim();
  const name = String(row['Naam'] || row['Name'] || row['naam'] || '').trim();
  const platform = String(row['Platform'] || row['platform'] || '').trim();
  const category = String(row['Categorie'] || row['categorie'] || row['Category'] || 'Games').trim();
  const genre = String(row['Genre'] || row['genre'] || '').trim();
  const price = cleanPrice(row['Prijs (€)'] || row['Prijs'] || row['prijs'] || row['Price'] || 0);
  const condition = String(row['Conditie'] || row['conditie'] || row['Condition'] || '').trim();
  const completeness = String(row['Compleetheid'] || row['compleetheid'] || row['Completeness'] || '').trim();
  const type = String(row['Type'] || row['type'] || 'Game').trim();
  const description = String(row['Korte beschrijving'] || row['Beschrijving'] || row['beschrijving'] || row['Description'] || '').trim();
  const weight = cleanWeight(row['Gewicht (kg)'] || row['Gewicht'] || row['gewicht'] || 0.1);

  return {
    sku,
    slug: slugify(sku + '-' + name),
    name,
    platform,
    category: category || 'Games',
    genre: genre || 'Overig',
    price,
    condition,
    completeness,
    type: type || 'Game',
    description,
    weight,
    isConsole: false,
    isPremium: price >= 100,
  };
}).filter(p => p.name && p.sku);

// Map consoles
const consoles = consolesRaw.map((row) => {
  const sku = String(row['SKU'] || row['sku'] || '').trim();
  const name = String(row['Naam'] || row['Name'] || row['naam'] || '').trim();
  const platform = String(row['Platform'] || row['platform'] || '').trim();
  const category = String(row['Categorie'] || row['categorie'] || row['Category'] || 'Consoles').trim();
  const price = cleanPrice(row['Prijs (€)'] || row['Prijs'] || row['prijs'] || row['Price'] || 0);
  const condition = String(row['Conditie'] || row['conditie'] || row['Condition'] || '').trim();
  const completeness = String(row['Compleetheid'] || row['compleetheid'] || row['Completeness'] || '').trim();
  const description = String(row['Beschrijving'] || row['beschrijving'] || row['Description'] || row['Korte beschrijving'] || '').trim();
  const weight = cleanWeight(row['Gewicht (kg)'] || row['Gewicht'] || row['gewicht'] || 0.5);

  return {
    sku,
    slug: slugify(sku + '-' + name),
    name,
    platform,
    category: category || 'Consoles',
    genre: 'Console',
    price,
    condition,
    completeness,
    type: 'Console',
    description,
    weight,
    isConsole: true,
    isPremium: price >= 100,
  };
}).filter(p => p.name && p.sku);

const allProducts = [...games, ...consoles];

// Add image paths for products that have downloaded box art
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'products');
let imageCount = 0;
const productsWithImages = allProducts.map(p => {
  const imgFile = `${p.slug}.webp`;
  const imgPath = path.join(imagesDir, imgFile);
  if (fs.existsSync(imgPath)) {
    imageCount++;
    return { ...p, image: `/images/products/${imgFile}` };
  }
  return { ...p, image: null };
});

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(productsWithImages, null, 2), 'utf8');

console.log(`Converted ${games.length} games + ${consoles.length} consoles = ${allProducts.length} products (${imageCount} with images)`);
console.log(`Output: ${outputPath}`);
