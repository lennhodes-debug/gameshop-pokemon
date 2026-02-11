const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'C:\\Users\\Jorn\\AppData\\Local\\Temp\\dropbox-fotos';
const outputDir = path.join(__dirname, '..', 'public', 'images', 'products');
const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');

// 23 games geidentificeerd uit Dropbox foto's
const games = [
  // GBA (8)
  { front: 'IMG_2225', back: 'IMG_2226', sku: 'GBA-001', slug: 'gba-001-pokemon-emerald', name: 'Pok\u00e9mon Emerald', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 85, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Emerald voor de Game Boy Advance \u2014 de ultieme versie van de Hoenn-regio. Vang zowel Kyogre als Groudon, daag de Battle Frontier uit en ontdek exclusieve verhaallijnen. Losse cartridge, getest en werkend. Europese versie (PAL/EUR).', weight: 0.05 },
  { front: 'IMG_2201', back: 'IMG_2202', sku: 'GBA-002', slug: 'gba-002-pokemon-sapphire-eur', name: 'Pok\u00e9mon Sapphire (EUR)', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 40, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Sapphire voor de Game Boy Advance \u2014 verken de Hoenn-regio en vang het legendarische Kyogre. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.05 },
  { front: 'IMG_2217', back: 'IMG_2218', sku: 'GBA-003', slug: 'gba-003-pokemon-sapphire-usa', name: 'Pok\u00e9mon Sapphire (USA)', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 35, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Sapphire voor de Game Boy Advance \u2014 verken de Hoenn-regio en vang het legendarische Kyogre. Amerikaanse versie (NTSC/USA). Losse cartridge, getest en werkend.', weight: 0.05 },
  { front: 'IMG_2219', back: 'IMG_2220', sku: 'GBA-004', slug: 'gba-004-pokemon-firered-usa', name: 'Pok\u00e9mon FireRed (USA)', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 55, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon FireRed voor de Game Boy Advance \u2014 de remake van het originele Pok\u00e9mon Red. Herbeleef Kanto met verbeterde graphics. Amerikaanse versie (NTSC/USA). Losse cartridge, getest en werkend.', weight: 0.05 },
  { front: 'IMG_2221', back: 'IMG_2222', sku: 'GBA-005', slug: 'gba-005-pokemon-firered-eur', name: 'Pok\u00e9mon FireRed (EUR)', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 65, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon FireRed voor de Game Boy Advance \u2014 de remake van het originele Pok\u00e9mon Red. Herbeleef Kanto met verbeterde graphics. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.05 },
  { front: 'IMG_2211', back: 'IMG_2212', sku: 'GBA-006', slug: 'gba-006-pokemon-leafgreen-usa', name: 'Pok\u00e9mon LeafGreen (USA)', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 50, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon LeafGreen voor de Game Boy Advance \u2014 de remake van Pok\u00e9mon Green/Blue. Verken Kanto en de Sevii Islands. Amerikaanse versie (NTSC/USA). Losse cartridge, getest en werkend.', weight: 0.05 },
  { front: 'IMG_2223', back: 'IMG_2224', sku: 'GBA-007', slug: 'gba-007-pokemon-leafgreen-eur', name: 'Pok\u00e9mon LeafGreen (EUR)', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 60, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon LeafGreen voor de Game Boy Advance \u2014 de remake van Pok\u00e9mon Green/Blue. Verken Kanto en de Sevii Islands. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.05 },
  { front: 'IMG_2192', back: 'IMG_2193', sku: 'GBA-008', slug: 'gba-008-pokemon-mystery-dungeon-red-rescue-team', name: 'Pok\u00e9mon Mystery Dungeon: Red Rescue Team', platform: 'Game Boy Advance', category: 'Games > GBA', genre: 'RPG', price: 25, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Mystery Dungeon: Red Rescue Team voor de Game Boy Advance \u2014 word zelf een Pok\u00e9mon en red andere Pok\u00e9mon in willekeurig gegenereerde dungeons. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.05 },

  // DS (9)
  { front: 'IMG_2182', back: 'IMG_2183', sku: 'DS-001', slug: 'ds-001-pokemon-platinum', name: 'Pok\u00e9mon Platinum', platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 70, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Platinum voor de Nintendo DS \u2014 de uitgebreide versie van Diamond en Pearl in de Sinnoh-regio. Met het Distortion World, Battle Frontier en Giratina in Origin Forme. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2184', back: 'IMG_2185', sku: 'DS-002', slug: 'ds-002-pokemon-soulsilver', name: 'Pok\u00e9mon SoulSilver', platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 80, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon SoulSilver voor de Nintendo DS \u2014 de geliefde remake van Pok\u00e9mon Silver. Verken Johto en Kanto, je Pok\u00e9mon loopt achter je aan. Amerikaanse versie (NTSC/USA). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2209', back: 'IMG_2210', sku: 'DS-003', slug: 'ds-003-pokemon-heartgold', name: 'Pok\u00e9mon HeartGold', platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 90, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon HeartGold voor de Nintendo DS \u2014 de geliefde remake van Pok\u00e9mon Gold. Verken Johto en Kanto met verbeterde graphics. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2205', back: 'IMG_2206', sku: 'DS-004', slug: 'ds-004-pokemon-pearl', name: 'Pok\u00e9mon Pearl', platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 25, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Pearl voor de Nintendo DS \u2014 ontdek de Sinnoh-regio en vang Palkia. Amerikaanse versie (NTSC/USA). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2196', back: 'IMG_2197', sku: 'DS-005', slug: 'ds-005-pokemon-black', name: 'Pok\u00e9mon Black', platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 45, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Black voor de Nintendo DS \u2014 ontdek de Unova-regio met 156 nieuwe Pok\u00e9mon. Exclusief: Reshiram en Black City. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2203', back: 'IMG_2204', sku: 'DS-006', slug: 'ds-006-pokemon-white', name: 'Pok\u00e9mon White', platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 45, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon White voor de Nintendo DS \u2014 de tegenhanger van Black. Exclusief: Zekrom en White Forest. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2186', back: 'IMG_2187', sku: 'DS-007', slug: 'ds-007-pokemon-ranger-guardian-signs', name: 'Pok\u00e9mon Ranger: Guardian Signs', platform: 'Nintendo DS', category: 'Games > DS', genre: 'Avontuur', price: 20, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Ranger: Guardian Signs voor de Nintendo DS \u2014 teken Capture Styler cirkels om Pok\u00e9mon te vangen en los mysteries op in Oblivia. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2213', back: 'IMG_2214', sku: 'DS-008', slug: 'ds-008-pokemon-ranger-shadows-of-almia', name: 'Pok\u00e9mon Ranger: Shadows of Almia', platform: 'Nintendo DS', category: 'Games > DS', genre: 'Avontuur', price: 15, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Ranger: Shadows of Almia voor de Nintendo DS \u2014 word een Pok\u00e9mon Ranger en bescherm de Almia-regio. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2198', back: 'IMG_2199', sku: 'DS-009', slug: 'ds-009-pokemon-mystery-dungeon-explorers-of-time', name: 'Pok\u00e9mon Mystery Dungeon: Explorers of Time', platform: 'Nintendo DS', category: 'Games > DS', genre: 'RPG', price: 20, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Mystery Dungeon: Explorers of Time voor de Nintendo DS \u2014 reis door de tijd als Pok\u00e9mon in willekeurig gegenereerde dungeons. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },

  // 3DS (5)
  { front: 'IMG_2180', back: 'IMG_2181', sku: '3DS-001', slug: '3ds-001-pokemon-x', name: 'Pok\u00e9mon X', platform: 'Nintendo 3DS', category: 'Games > 3DS', genre: 'RPG', price: 30, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon X voor de Nintendo 3DS \u2014 de eerste volledig 3D Pok\u00e9mon game. Verken Kalos, ontdek Mega Evoluties en het Fairy-type. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2194', back: 'IMG_2195', sku: '3DS-002', slug: '3ds-002-pokemon-omega-ruby', name: 'Pok\u00e9mon Omega Ruby', platform: 'Nintendo 3DS', category: 'Games > 3DS', genre: 'RPG', price: 35, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Omega Ruby voor de Nintendo 3DS \u2014 de 3D-remake van Pok\u00e9mon Ruby. Herbeleef Hoenn met Mega Evoluties en Primal Reversion. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2207', back: 'IMG_2208', sku: '3DS-003', slug: '3ds-003-pokemon-alpha-sapphire', name: 'Pok\u00e9mon Alpha Sapphire', platform: 'Nintendo 3DS', category: 'Games > 3DS', genre: 'RPG', price: 35, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Alpha Sapphire voor de Nintendo 3DS \u2014 de 3D-remake van Pok\u00e9mon Sapphire. Herbeleef Hoenn met Mega Evoluties en Primal Reversion voor Kyogre. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2190', back: 'IMG_2191', sku: '3DS-004', slug: '3ds-004-pokemon-moon', name: 'Pok\u00e9mon Moon', platform: 'Nintendo 3DS', category: 'Games > 3DS', genre: 'RPG', price: 25, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Moon voor de Nintendo 3DS \u2014 verken de Alola-regio ge\u00efnspireerd door Hawa\u00ef. Met Alolan vormen, Z-Moves en het legendarische Lunala. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },
  { front: 'IMG_2188', back: 'IMG_2189', sku: '3DS-005', slug: '3ds-005-pokemon-super-mystery-dungeon', name: 'Pok\u00e9mon Super Mystery Dungeon', platform: 'Nintendo 3DS', category: 'Games > 3DS', genre: 'RPG', price: 25, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Super Mystery Dungeon voor de Nintendo 3DS \u2014 word een Pok\u00e9mon en verken dungeons met alle 720 Pok\u00e9mon. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.08 },

  // GB (1)
  { front: 'IMG_2215', back: 'IMG_2216', sku: 'GB-001', slug: 'gb-001-pokemon-trading-card-game', name: 'Pok\u00e9mon Trading Card Game', platform: 'Game Boy / Color', category: 'Games > Game Boy', genre: 'Strategie', price: 25, condition: 'Gebruikt', completeness: 'Losse cartridge', description: 'Pok\u00e9mon Trading Card Game voor de Game Boy Color \u2014 speel het Pok\u00e9mon kaartspel digitaal. Verzamel kaarten, bouw decks en versla de Grand Masters. Europese versie (PAL/EUR). Losse cartridge, getest en werkend.', weight: 0.05 },
];

async function processAll() {
  // 1. Convert photos to WebP 500x500
  let photoCount = 0;
  for (const game of games) {
    const skuLower = game.sku.toLowerCase();
    const namePart = game.slug.replace(skuLower + '-', '');

    // Front
    const frontSrc = path.join(inputDir, game.front + '.png');
    const frontDest = path.join(outputDir, game.slug + '.webp');
    await sharp(frontSrc)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 90 })
      .toFile(frontDest);
    photoCount++;

    // Back
    const backSrc = path.join(inputDir, game.back + '.png');
    const backDest = path.join(outputDir, game.slug + '-back.webp');
    await sharp(backSrc)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 90 })
      .toFile(backDest);
    photoCount++;

    console.log('OK:', game.sku, '-', game.name);
  }
  console.log('\n' + photoCount + ' foto\'s geconverteerd naar WebP');

  // 2. Update products.json - keep consoles + accessories, add only these games
  const existing = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const keepProducts = existing.filter(p => p.sku.startsWith('CON-') || p.sku.startsWith('ACC-'));

  const newProducts = games.map(g => ({
    sku: g.sku,
    slug: g.slug,
    name: g.name,
    platform: g.platform,
    category: g.category,
    genre: g.genre,
    price: g.price,
    condition: g.condition,
    completeness: g.completeness,
    type: 'simple',
    description: g.description,
    weight: g.weight,
    isConsole: false,
    isPremium: g.price >= 50,
    image: '/images/products/' + g.slug + '.webp',
    backImage: '/images/products/' + g.slug + '-back.webp',
    inkoopPrijs: Math.round(g.price * 0.4),
    inkoopFeatured: g.price >= 30
  }));

  const allProducts = [...keepProducts, ...newProducts];
  fs.writeFileSync(productsPath, JSON.stringify(allProducts, null, 2));

  console.log('\nProducts.json bijgewerkt:');
  console.log('  Consoles:', keepProducts.filter(p => p.sku.startsWith('CON-')).length);
  console.log('  Accessoires:', keepProducts.filter(p => p.sku.startsWith('ACC-')).length);
  console.log('  Games (nieuw):', newProducts.length);
  console.log('  Totaal:', allProducts.length);
}

processAll().catch(err => console.error('FOUT:', err));
