const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_DIR = 'C:\\Users\\Jorn\\Dropbox\\Camera-uploads';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const WHITE = { r: 255, g: 255, b: 255 };

// Alle 43 foto's gemapt naar SKU en bestandsnaam
// front = voorkant cartridge, back = achterkant
const PHOTOS = [
  // === BESTAANDE PRODUCTEN (foto update) ===
  // Pokémon X (3DS, EUR)
  { src: '2026-02-11 00.40.13.jpg', out: '3ds-001-pokemon-x.webp' },
  { src: '2026-02-11 00.40.16.jpg', out: '3ds-001-pokemon-x-back.webp' },
  // Pokémon Omega Ruby (3DS, EUR)
  { src: '2026-02-11 00.42.00.jpg', out: '3ds-002-pokemon-omega-ruby.webp' },
  { src: '2026-02-11 00.42.19.jpg', out: '3ds-002-pokemon-omega-ruby-back.webp' },
  // Pokémon SoulSilver (DS)
  { src: '2026-02-11 00.40.34.jpg', out: 'ds-001-pokemon-soulsilver.webp' },
  { src: '2026-02-11 00.40.40.jpg', out: 'ds-001-pokemon-soulsilver-back.webp' },
  // Pokémon White (DS, EUR)
  { src: '2026-02-11 00.43.04.jpg', out: 'ds-002-pokemon-white.webp' },
  // Pokémon Pearl (DS)
  { src: '2026-02-11 00.43.23.jpg', out: 'ds-004-pokemon-pearl.webp' },
  { src: '2026-02-11 00.43.29.jpg', out: 'ds-004-pokemon-pearl-back.webp' },
  // Pokémon Emerald (GBA, EUR)
  { src: '2026-02-11 00.45.45.jpg', out: 'gba-001-pokemon-emerald.webp' },
  { src: '2026-02-11 00.45.52.jpg', out: 'gba-001-pokemon-emerald-back.webp' },
  // Pokémon FireRed EUR (GBA)
  { src: '2026-02-11 00.45.11.jpg', out: 'gba-002-pokemon-firered-eur.webp' },
  { src: '2026-02-11 00.45.15.jpg', out: 'gba-002-pokemon-firered-eur-back.webp' },
  // Pokémon FireRed USA (GBA)
  { src: '2026-02-11 00.44.48.jpg', out: 'gba-003-pokemon-firered-usa.webp' },
  { src: '2026-02-11 00.44.53.jpg', out: 'gba-003-pokemon-firered-usa-back.webp' },
  // Pokémon LeafGreen (GBA) - USA versie vervangt bestaande
  { src: '2026-02-11 00.43.53.jpg', out: 'gba-004-pokemon-leafgreen.webp' },
  { src: '2026-02-11 00.43.57.jpg', out: 'gba-004-pokemon-leafgreen-back.webp' },
  // Pokémon Sapphire (GBA, EUR)
  { src: '2026-02-11 00.42.46.jpg', out: 'gba-005-pokemon-sapphire.webp' },
  { src: '2026-02-11 00.42.57.jpg', out: 'gba-005-pokemon-sapphire-back.webp' },

  // === NIEUWE PRODUCTEN ===
  // Pokémon Platinum (DS, EUR)
  { src: '2026-02-11 00.40.23.jpg', out: 'ds-005-pokemon-platinum.webp' },
  { src: '2026-02-11 00.40.29.jpg', out: 'ds-005-pokemon-platinum-back.webp' },
  // Pokémon Ranger: Guardian Signs (DS, EUR)
  { src: '2026-02-11 00.40.46.jpg', out: 'ds-006-pokemon-ranger-guardian-signs.webp' },
  { src: '2026-02-11 00.40.51.jpg', out: 'ds-006-pokemon-ranger-guardian-signs-back.webp' },
  // Pokémon Mystery Dungeon: Explorers of Time (DS, EUR)
  { src: '2026-02-11 00.42.26.jpg', out: 'ds-007-pokemon-mystery-dungeon-explorers-of-time.webp' },
  { src: '2026-02-11 00.42.31.jpg', out: 'ds-007-pokemon-mystery-dungeon-explorers-of-time-back.webp' },
  // Pokémon HeartGold (DS, EUR)
  { src: '2026-02-11 00.43.44.jpg', out: 'ds-008-pokemon-heartgold.webp' },
  { src: '2026-02-11 00.43.48.jpg', out: 'ds-008-pokemon-heartgold-back.webp' },
  // Pokémon Ranger: Shadows of Almia (DS, EUR)
  { src: '2026-02-11 00.44.01.jpg', out: 'ds-009-pokemon-ranger-shadows-of-almia.webp' },
  { src: '2026-02-11 00.44.08.jpg', out: 'ds-009-pokemon-ranger-shadows-of-almia-back.webp' },
  // Pokémon Super Mystery Dungeon (3DS, EUR)
  { src: '2026-02-11 00.41.28.jpg', out: '3ds-003-pokemon-super-mystery-dungeon.webp' },
  { src: '2026-02-11 00.41.36.jpg', out: '3ds-003-pokemon-super-mystery-dungeon-back.webp' },
  // Pokémon Moon (3DS, EUR) - geen achterkant
  { src: '2026-02-11 00.41.40.jpg', out: '3ds-004-pokemon-moon.webp' },
  // Pokémon Alpha Sapphire (3DS, EUR)
  { src: '2026-02-11 00.43.35.jpg', out: '3ds-005-pokemon-alpha-sapphire.webp' },
  { src: '2026-02-11 00.43.38.jpg', out: '3ds-005-pokemon-alpha-sapphire-back.webp' },
  // Pokémon Mystery Dungeon: Red Rescue Team (GBA, EUR)
  { src: '2026-02-11 00.41.50.jpg', out: 'gba-006-pokemon-mystery-dungeon-red-rescue-team.webp' },
  { src: '2026-02-11 00.41.53.jpg', out: 'gba-006-pokemon-mystery-dungeon-red-rescue-team-back.webp' },
  // Pokémon Trading Card Game (GB)
  { src: '2026-02-11 00.44.14.jpg', out: 'gb-003-pokemon-trading-card-game.webp' },
  { src: '2026-02-11 00.44.17.jpg', out: 'gb-003-pokemon-trading-card-game-back.webp' },
  // Pokémon Sapphire USA (GBA) - 2e exemplaar
  { src: '2026-02-11 00.44.32.jpg', out: 'gba-007-pokemon-sapphire-usa.webp' },
  { src: '2026-02-11 00.44.37.jpg', out: 'gba-007-pokemon-sapphire-usa-back.webp' },
  // Pokémon LeafGreen EUR (GBA) - 2e exemplaar
  { src: '2026-02-11 00.45.27.jpg', out: 'gba-008-pokemon-leafgreen-eur.webp' },
  { src: '2026-02-11 00.45.35.jpg', out: 'gba-008-pokemon-leafgreen-eur-back.webp' },
];

async function processImage(inputPath, outputPath) {
  // Conservatieve verwerking: hele game behouden, geen agressieve trim
  let pipeline = sharp(inputPath)
    .flatten({ background: WHITE });

  // Lichte helderheid boost voor wittere achtergrond
  pipeline = pipeline.modulate({ brightness: 1.15 });

  // Zeer conservatieve trim — alleen echte witte randen, nooit in de game snijden
  // Hoge threshold = alleen bijna-pure-witte pixels worden weggesneden
  pipeline = pipeline.trim({ threshold: 50 });

  // Terug naar 500x500 gecentreerd op wit — contain houdt alles intact
  pipeline = pipeline.resize(500, 500, {
    fit: 'contain',
    background: WHITE,
    withoutEnlargement: false,
  });

  await pipeline.webp({ quality: 90 }).toFile(outputPath);
}

async function main() {
  let ok = 0;
  let fail = 0;

  // Verwerk 4 tegelijk voor snelheid
  const chunks = [];
  for (let i = 0; i < PHOTOS.length; i += 4) {
    chunks.push(PHOTOS.slice(i, i + 4));
  }

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (photo) => {
        const inputPath = path.join(INPUT_DIR, photo.src);
        const outputPath = path.join(OUTPUT_DIR, photo.out);

        if (!fs.existsSync(inputPath)) {
          console.log(`SKIP: ${photo.src} (niet gevonden)`);
          return;
        }

        await processImage(inputPath, outputPath);
        const stats = fs.statSync(outputPath);
        console.log(`OK: ${photo.out} (${Math.round(stats.size / 1024)}KB)`);
      })
    );

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') ok++;
      else {
        fail++;
        console.log(`FOUT: ${chunk[i].out} - ${r.reason?.message}`);
      }
    });
  }

  console.log(`\nKlaar! ${ok} OK, ${fail} fouten van ${PHOTOS.length} foto's.`);
}

main().catch(console.error);
