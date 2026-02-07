/**
 * Generate rich Dutch product descriptions for all products.
 * Updates products.json with proper descriptions based on product metadata.
 */
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Genre descriptions in Dutch
const GENRE_DESC = {
  'RPG': 'een episch rollenspel',
  'Avontuur': 'een meeslepend avontuur',
  'Actie': 'een spannend actiespel',
  'Platformer': 'een klassiek platformspel',
  'Race': 'een spectaculair racespel',
  'Strategie': 'een strategisch meesterwerk',
  'Sport': 'een dynamisch sportspel',
  'Party': 'een geweldig partyspel',
  'Vecht': 'een intens vechtspel',
  'Shooter': 'een actiegeladen shooter',
  'Puzzel': 'een briljant puzzelspel',
  'Simulatie': 'een leuke simulatie',
  'Fitness': 'een interactief fitnessspel',
  'Sandbox': 'een creatief sandbox-spel',
  'Muziek': 'een ritmisch muziekspel',
  'Ritme': 'een ritmisch avontuur',
  'Pinball': 'een vermakelijk flipperspel',
  'Kaartspel': 'een strategisch kaartspel',
  'Console': 'een console',
};

// Platform short names
const PLATFORM_SHORT = {
  'Nintendo Switch': 'Switch',
  'Nintendo 3DS': '3DS',
  'Nintendo DS': 'DS',
  'Game Boy': 'Game Boy',
  'Game Boy Color': 'Game Boy Color',
  'Game Boy Advance': 'GBA',
  'GameCube': 'GameCube',
  'Nintendo 64': 'N64',
  'Super Nintendo': 'SNES',
  'NES': 'NES',
  'Wii': 'Wii',
  'Wii U': 'Wii U',
};

// Condition descriptions
const CONDITION_DESC = {
  'Zo goed als nieuw': 'in zo goed als nieuwe staat',
  'Gebruikt': 'in nette gebruikte staat',
};

// Completeness descriptions
const COMPLETENESS_DESC = {
  'Compleet in doos (CIB)': 'compleet met doos en handleiding',
  'Compleet in doos': 'compleet in originele doos',
  'Losse cartridge': 'als losse cartridge',
  'Met oplader': 'inclusief oplader',
  'Los': 'los zonder accessoires',
  'Met kabels + controller': 'inclusief kabels en controller',
  'Met kabels + sensor bar': 'inclusief kabels en sensor bar',
  'Met GamePad + kabels': 'inclusief GamePad en kabels',
};

function generateDescription(product) {
  const { name, platform, genre, condition, completeness, isConsole, isPremium } = product;
  const platformShort = PLATFORM_SHORT[platform] || platform;
  const genreDesc = GENRE_DESC[genre] || 'een geweldig spel';
  const condDesc = CONDITION_DESC[condition] || 'in goede staat';
  const compDesc = COMPLETENESS_DESC[completeness] || '';

  if (isConsole) {
    const parts = [
      `${name} ${condDesc}`,
      compDesc ? `Geleverd ${compDesc}.` : '',
      'Persoonlijk getest op werking.',
      'Veilig en snel verzonden via PostNL.',
    ];
    return parts.filter(Boolean).join(' ');
  }

  // Game descriptions
  const parts = [];

  // Opening line with genre
  parts.push(`${name} voor de ${platformShort} — ${genreDesc} ${condDesc}.`);

  // Completeness info
  if (compDesc) {
    parts.push(`Wordt geleverd ${compDesc}.`);
  }

  // Quality assurance
  parts.push('100% origineel en persoonlijk getest op werking.');

  // Premium note
  if (isPremium) {
    parts.push('Gratis verzending!');
  }

  return parts.join(' ');
}

let updated = 0;
const updatedProducts = products.map(product => {
  const newDescription = generateDescription(product);
  if (newDescription !== product.description) {
    updated++;
  }
  return { ...product, description: newDescription };
});

fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8');

console.log(`Updated ${updated} of ${products.length} product descriptions.`);
console.log('Sample descriptions:');
updatedProducts.slice(0, 5).forEach(p => {
  console.log(`  [${p.sku}] ${p.description}`);
});
console.log('---');
updatedProducts.filter(p => p.isConsole).slice(0, 3).forEach(p => {
  console.log(`  [${p.sku}] ${p.description}`);
});
