const fs = require('fs');
const path = require('path');
const products = require('../src/data/products.json');

// Producten zonder genre
const noGenre = products.filter(x => !x.genre || x.genre.trim() === '');
console.log(`Producten zonder genre: ${noGenre.length}\n`);
noGenre.forEach(p => console.log(`  ${p.sku} "${p.name}" cat=${p.category} platform=${p.platform}`));

// Genre toekennen op basis van categorie en naam
const genreMap = {
  // Consoles
  'Consoles': null, // Consoles hebben geen genre nodig, maar laten we "Console" gebruiken
  // Accessoires - genre op basis van type
};

// Accessoire genre bepalen op naam
function guessAccessoireGenre(name) {
  const n = name.toLowerCase();
  if (n.includes('controller') || n.includes('joy-con') || n.includes('remote') || n.includes('nunchuk') || n.includes('gamepad')) return 'Controller';
  if (n.includes('oplader') || n.includes('adapter') || n.includes('stroomadapter')) return 'Oplader';
  if (n.includes('kabel') || n.includes('av-kabel') || n.includes('hdmi')) return 'Kabel';
  if (n.includes('hoes') || n.includes('case') || n.includes('beschermhoes') || n.includes('screen protector')) return 'Bescherming';
  if (n.includes('geheugenkaart') || n.includes('memory')) return 'Opslag';
  if (n.includes('stylus')) return 'Stylus';
  if (n.includes('dock') || n.includes('stand')) return 'Dock';
  if (n.includes('headset') || n.includes('koptelefoon')) return 'Audio';
  if (n.includes('expansion') || n.includes('pak') || n.includes('rumble')) return 'Uitbreiding';
  return 'Accessoire';
}

// Console genre
function guessConsoleGenre(name) {
  return 'Console';
}

// Game genre raden (als backup)
function guessGameGenre(name) {
  const n = name.toLowerCase();
  if (n.includes('mario kart') || n.includes('race') || n.includes('gran turismo')) return 'Race';
  if (n.includes('zelda') || n.includes('metroid')) return 'Avontuur';
  if (n.includes('pokemon') || n.includes('pokémon') || n.includes('final fantasy') || n.includes('dragon quest')) return 'RPG';
  if (n.includes('mario') || n.includes('donkey kong') || n.includes('kirby') || n.includes('yoshi')) return 'Platformer';
  if (n.includes('smash') || n.includes('street fighter') || n.includes('mortal kombat')) return 'Vecht';
  if (n.includes('fifa') || n.includes('nba') || n.includes('tennis') || n.includes('golf')) return 'Sport';
  return 'Actie';
}

let fixed = 0;
products.forEach(p => {
  if (p.genre && p.genre.trim() !== '') return;

  if (p.category === 'Consoles') {
    p.genre = 'Console';
    fixed++;
  } else if (p.category === 'Accessoires') {
    p.genre = guessAccessoireGenre(p.name);
    fixed++;
  } else {
    p.genre = guessGameGenre(p.name);
    fixed++;
  }
  console.log(`  FIXED: ${p.sku} "${p.name}" → genre="${p.genre}"`);
});

console.log(`\nTotaal gefixed: ${fixed}`);

// Save
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'products.json'),
  JSON.stringify(products, null, 2) + '\n'
);
console.log('products.json opgeslagen');
