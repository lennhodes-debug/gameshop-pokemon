const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products', 'new');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');

// Mapping: game-XXX → SKU + bestandsnaam
const GAMES = [
  { src: 'game-001', sku: 'gba-001', name: 'pokemon-emerald', hasBack: true },
  { src: 'game-002', sku: 'gba-002', name: 'pokemon-firered-eur', hasBack: true },
  { src: 'game-003', sku: 'gb-001', name: 'pokemon-crystal', hasBack: false }, // back is mismatched DS cart
  { src: 'game-005', sku: 'gba-003', name: 'pokemon-firered-usa', hasBack: true },
  { src: 'game-006', sku: 'gba-004', name: 'pokemon-leafgreen', hasBack: true },
  { src: 'game-008', sku: 'gba-005', name: 'pokemon-sapphire', hasBack: true },
  { src: 'game-009', sku: 'ds-001', name: 'pokemon-soulsilver', hasBack: true },
  { src: 'game-011', sku: 'gb-002', name: 'pokemon-red', hasBack: false },
  { src: 'game-013', sku: '3ds-001', name: 'pokemon-x', hasBack: true },
  { src: 'game-014', sku: '3ds-002', name: 'pokemon-omega-ruby', hasBack: true },
  { src: 'game-016', sku: 'ds-002', name: 'pokemon-white', hasBack: false },
  { src: 'game-018', sku: 'ds-003', name: 'pokemon-black', hasBack: true },
  { src: 'game-020', sku: 'ds-004', name: 'pokemon-pearl', hasBack: true },
];

async function processImage(inputPath, outputPath) {
  await sharp(inputPath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(500, 500, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 },
      withoutEnlargement: false,
    })
    .webp({ quality: 90 })
    .toFile(outputPath);
}

async function main() {
  let processed = 0;

  for (const game of GAMES) {
    // Front
    const frontIn = path.join(INPUT_DIR, `${game.src}-front.webp`);
    const frontOut = path.join(OUTPUT_DIR, `${game.sku}-${game.name}.webp`);

    if (fs.existsSync(frontIn)) {
      await processImage(frontIn, frontOut);
      processed++;
      console.log(`OK: ${game.sku}-${game.name}.webp`);
    } else {
      console.log(`SKIP: ${frontIn} niet gevonden`);
    }

    // Back
    if (game.hasBack) {
      const backIn = path.join(INPUT_DIR, `${game.src}-back.webp`);
      const backOut = path.join(OUTPUT_DIR, `${game.sku}-${game.name}-back.webp`);

      if (fs.existsSync(backIn)) {
        await processImage(backIn, backOut);
        processed++;
        console.log(`OK: ${game.sku}-${game.name}-back.webp`);
      }
    }
  }

  console.log(`\nKlaar! ${processed} foto's verwerkt.`);
}

main().catch(console.error);
