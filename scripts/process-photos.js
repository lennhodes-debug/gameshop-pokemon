const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products', 'new');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const WHITE = { r: 255, g: 255, b: 255 };

// Per foto: rotatie-correctie (graden, positief = klok mee) + SKU mapping
const GAMES = [
  { src: 'game-001', sku: 'gba-001', name: 'pokemon-emerald', hasBack: true, rotate: -5 },
  { src: 'game-002', sku: 'gba-002', name: 'pokemon-firered-eur', hasBack: true, rotate: 2 },
  { src: 'game-003', sku: 'gb-001', name: 'pokemon-crystal', hasBack: false, rotate: 2 },
  { src: 'game-005', sku: 'gba-003', name: 'pokemon-firered-usa', hasBack: true, rotate: 1 },
  { src: 'game-006', sku: 'gba-004', name: 'pokemon-leafgreen', hasBack: true, rotate: 2 },
  { src: 'game-008', sku: 'gba-005', name: 'pokemon-sapphire', hasBack: true, rotate: 2 },
  { src: 'game-009', sku: 'ds-001', name: 'pokemon-soulsilver', hasBack: true, rotate: 5 },
  { src: 'game-011', sku: 'gb-002', name: 'pokemon-red', hasBack: false, rotate: 1 },
  { src: 'game-013', sku: '3ds-001', name: 'pokemon-x', hasBack: true, rotate: 2 },
  { src: 'game-014', sku: '3ds-002', name: 'pokemon-omega-ruby', hasBack: true, rotate: 3 },
  { src: 'game-016', sku: 'ds-002', name: 'pokemon-white', hasBack: false, rotate: 2 },
  { src: 'game-018', sku: 'ds-003', name: 'pokemon-black', hasBack: true, rotate: 3 },
  { src: 'game-020', sku: 'ds-004', name: 'pokemon-pearl', hasBack: true, rotate: 1 },
];

async function processImage(inputPath, outputPath, angle) {
  // Stap 1: Laden + transparantie plat op wit
  let pipeline = sharp(inputPath)
    .flatten({ background: WHITE });

  // Stap 2: Rechtzetten
  if (angle !== 0) {
    pipeline = pipeline.rotate(angle, { background: WHITE });
  }

  // Stap 3: Helderheid verhogen zodat grijze achtergrond wit wordt
  pipeline = pipeline.modulate({ brightness: 1.2 });

  // Stap 4: Automatisch bijsnijden tot product (grijze randen weg)
  pipeline = pipeline.trim({ threshold: 25 });

  // Stap 5: Terug naar 500x500 gecentreerd op wit
  pipeline = pipeline.resize(500, 500, {
    fit: 'contain',
    background: WHITE,
    withoutEnlargement: false,
  });

  await pipeline.webp({ quality: 90 }).toFile(outputPath);
}

async function main() {
  let processed = 0;

  for (const game of GAMES) {
    // Front
    const frontIn = path.join(INPUT_DIR, `${game.src}-front.webp`);
    const frontOut = path.join(OUTPUT_DIR, `${game.sku}-${game.name}.webp`);

    if (fs.existsSync(frontIn)) {
      try {
        await processImage(frontIn, frontOut, game.rotate);
        processed++;
        console.log(`OK: ${game.sku}-${game.name}.webp (${game.rotate > 0 ? '+' : ''}${game.rotate}°)`);
      } catch (err) {
        console.log(`FOUT: ${game.sku} front - ${err.message}`);
      }
    }

    // Back (zelfde rotatie als front)
    if (game.hasBack) {
      const backIn = path.join(INPUT_DIR, `${game.src}-back.webp`);
      const backOut = path.join(OUTPUT_DIR, `${game.sku}-${game.name}-back.webp`);

      if (fs.existsSync(backIn)) {
        try {
          await processImage(backIn, backOut, game.rotate);
          processed++;
          console.log(`OK: ${game.sku}-${game.name}-back.webp`);
        } catch (err) {
          console.log(`FOUT: ${game.sku} back - ${err.message}`);
        }
      }
    }
  }

  console.log(`\nKlaar! ${processed} foto's verwerkt.`);
}

main().catch(console.error);
