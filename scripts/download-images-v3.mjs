#!/usr/bin/env node

/**
 * V3 Image Download Script - Infobox Parser Approach
 *
 * Instead of guessing filenames, this script:
 * 1. Fetches the actual wikitext of each game's Wikipedia article
 * 2. Parses the infobox to extract the exact cover art image filename
 * 3. Downloads that specific image
 *
 * This is much more reliable because the infobox image IS the cover art.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/products.json');
const IMAGES_DIR = path.join(process.cwd(), 'public/images/products');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));

// Manual Wikipedia article title mappings for games that need special handling
const ARTICLE_MAP = {
  // Switch
  'Pokémon Brilliant Diamond': 'Pokémon Brilliant Diamond and Shining Pearl',
  'Pokémon Shining Pearl': 'Pokémon Brilliant Diamond and Shining Pearl',
  'Pokémon Sword': 'Pokémon Sword and Shield',
  'Pokémon Shield': 'Pokémon Sword and Shield',
  'Pokémon Scarlet': 'Pokémon Scarlet and Violet',
  'Pokémon Violet': 'Pokémon Scarlet and Violet',
  "Pokémon Let's Go Pikachu": "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!",
  "Pokémon Let's Go Eevee": "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!",
  'Pokémon Legends: Arceus': 'Pokémon Legends: Arceus',
  'Pokémon Mystery Dungeon: Rescue Team DX': 'Pokémon Mystery Dungeon: Rescue Team DX',
  'New Pokémon Snap': 'New Pokémon Snap',
  'Super Smash Bros. Ultimate': 'Super Smash Bros. Ultimate',
  'The Legend of Zelda: Breath of the Wild': 'The Legend of Zelda: Breath of the Wild',
  'The Legend of Zelda: Tears of the Kingdom': 'The Legend of Zelda: Tears of the Kingdom',
  "The Legend of Zelda: Link's Awakening (2019)": "The Legend of Zelda: Link's Awakening (2019 video game)",
  'Super Mario Odyssey': 'Super Mario Odyssey',
  'Super Mario 3D World + Bowser\'s Fury': 'Super Mario 3D World + Bowser\'s Fury',
  'Super Mario RPG': 'Super Mario RPG (2023 video game)',
  'Mario Kart 8 Deluxe': 'Mario Kart 8 Deluxe',
  'Mario Kart Live: Home Circuit': 'Mario Kart Live: Home Circuit',
  'Animal Crossing: New Horizons': 'Animal Crossing: New Horizons',
  'Splatoon 2': 'Splatoon 2',
  'Splatoon 3': 'Splatoon 3',
  'Xenoblade Chronicles 2': 'Xenoblade Chronicles 2',
  'Xenoblade Chronicles 3': 'Xenoblade Chronicles 3',
  'Xenoblade Chronicles: Definitive Edition': 'Xenoblade Chronicles: Definitive Edition',
  'Fire Emblem: Three Houses': 'Fire Emblem: Three Houses',
  'Fire Emblem Engage': 'Fire Emblem Engage',
  'Metroid Dread': 'Metroid Dread',
  'Metroid Prime Remastered': 'Metroid Prime Remastered',
  "Luigi's Mansion 3": "Luigi's Mansion 3",
  'Donkey Kong Country: Tropical Freeze': 'Donkey Kong Country: Tropical Freeze',
  'Kirby and the Forgotten Land': 'Kirby and the Forgotten Land',
  'Kirby Star Allies': 'Kirby Star Allies',
  'Bayonetta 3': 'Bayonetta 3',
  'Bayonetta 2': 'Bayonetta 2',
  'Pikmin 3 Deluxe': 'Pikmin 3 Deluxe',
  'Pikmin 4': 'Pikmin 4',
  'Paper Mario: The Origami King': 'Paper Mario: The Origami King',
  'Mario + Rabbids Kingdom Battle': 'Mario + Rabbids Kingdom Battle',
  'Mario + Rabbids Sparks of Hope': 'Mario + Rabbids Sparks of Hope',
  'Hyrule Warriors: Age of Calamity': 'Hyrule Warriors: Age of Calamity',
  'Mario Strikers: Battle League': 'Mario Strikers: Battle League',
  'Nintendo Switch Sports': 'Nintendo Switch Sports',
  'Ring Fit Adventure': 'Ring Fit Adventure',
  'Super Mario Party': 'Super Mario Party',
  'Mario Party Superstars': 'Mario Party Superstars',
  'Yoshi\'s Crafted World': "Yoshi's Crafted World",
  'Astral Chain': 'Astral Chain',
  'Clubhouse Games: 51 Worldwide Classics': 'Clubhouse Games: 51 Worldwide Classics',
  'Captain Toad: Treasure Tracker': 'Captain Toad: Treasure Tracker',
  'Miitopia': 'Miitopia',
  'Naruto Shippuden: Ultimate Ninja Storm Trilogy': 'Naruto Shippūden: Ultimate Ninja Storm Trilogy',

  // 3DS
  'Pokémon X': 'Pokémon X and Y',
  'Pokémon Y': 'Pokémon X and Y',
  'Pokémon Sun': 'Pokémon Sun and Moon',
  'Pokémon Moon': 'Pokémon Sun and Moon',
  'Pokémon Ultra Sun': 'Pokémon Ultra Sun and Ultra Moon',
  'Pokémon Ultra Moon': 'Pokémon Ultra Sun and Ultra Moon',
  'Pokémon Alpha Sapphire': 'Pokémon Omega Ruby and Alpha Sapphire',
  'Pokémon Omega Ruby': 'Pokémon Omega Ruby and Alpha Sapphire',
  'Super Smash Bros. for 3DS': 'Super Smash Bros. for Nintendo 3DS and Wii U',
  'The Legend of Zelda: A Link Between Worlds': 'The Legend of Zelda: A Link Between Worlds',
  'The Legend of Zelda: Ocarina of Time 3D': 'The Legend of Zelda: Ocarina of Time 3D',
  "The Legend of Zelda: Majora's Mask 3D": "The Legend of Zelda: Majora's Mask 3D",
  'Super Mario 3D Land': 'Super Mario 3D Land',
  'Mario Kart 7': 'Mario Kart 7',
  'Animal Crossing: New Leaf': 'Animal Crossing: New Leaf',
  "Luigi's Mansion: Dark Moon": "Luigi's Mansion: Dark Moon",
  "Luigi's Mansion (3DS)": "Luigi's Mansion (2018 video game)",
  'Fire Emblem Awakening': 'Fire Emblem Awakening',
  'Fire Emblem Fates': 'Fire Emblem Fates',
  'Kid Icarus: Uprising': 'Kid Icarus: Uprising',
  'Star Fox 64 3D': 'Star Fox 64 3D',
  'Kirby: Triple Deluxe': 'Kirby: Triple Deluxe',
  'Kirby: Planet Robobot': 'Kirby: Planet Robobot',
  'Metroid: Samus Returns': 'Metroid: Samus Returns',
  'Professor Layton vs. Phoenix Wright': 'Professor Layton vs. Phoenix Wright: Ace Attorney',
  'Tomodachi Life': 'Tomodachi Life',
  'Captain Toad: Treasure Tracker (3DS)': 'Captain Toad: Treasure Tracker',

  // DS
  'Pokémon Black': 'Pokémon Black and White',
  'Pokémon White': 'Pokémon Black and White',
  'Pokémon Black 2': 'Pokémon Black 2 and White 2',
  'Pokémon White 2': 'Pokémon Black 2 and White 2',
  'Pokémon SoulSilver': 'Pokémon HeartGold and SoulSilver',
  'Pokémon HeartGold': 'Pokémon HeartGold and SoulSilver',
  'Pokémon Platinum': 'Pokémon Platinum',
  'Pokémon Diamond': 'Pokémon Diamond and Pearl',
  'Pokémon Pearl': 'Pokémon Diamond and Pearl',
  'Mario Kart DS': 'Mario Kart DS',
  'New Super Mario Bros.': 'New Super Mario Bros.',
  'Mario & Luigi: Bowser\'s Inside Story': "Mario & Luigi: Bowser's Inside Story",
  'Mario & Luigi: Partners in Time': 'Mario & Luigi: Partners in Time',
  'The Legend of Zelda: Phantom Hourglass': 'The Legend of Zelda: Phantom Hourglass',
  'The Legend of Zelda: Spirit Tracks': 'The Legend of Zelda: Spirit Tracks',
  'Animal Crossing: Wild World': 'Animal Crossing: Wild World',
  'Kirby Super Star Ultra': 'Kirby Super Star Ultra',
  'Yoshi\'s Island DS': "Yoshi's Island DS",
  'Professor Layton and the Curious Village': 'Professor Layton and the Curious Village',
  'Professor Layton and the Unwound Future': 'Professor Layton and the Unwound Future',
  'Brain Age': 'Brain Age: Train Your Brain in Minutes a Day!',
  'Nintendogs': 'Nintendogs',

  // Game Boy
  'Pokémon Red': 'Pokémon Red and Blue',
  'Pokémon Blue': 'Pokémon Red and Blue',
  'Pokémon Yellow': 'Pokémon Yellow',
  'Pokémon Gold': 'Pokémon Gold and Silver',
  'Pokémon Silver': 'Pokémon Gold and Silver',
  'Pokémon Crystal': 'Pokémon Crystal',
  'Pokémon Pinball': 'Pokémon Pinball',
  'Pokémon TCG': 'Pokémon Trading Card Game (video game)',
  "Zelda: Link's Awakening": "The Legend of Zelda: Link's Awakening",
  "Zelda: Oracle of Ages": "The Legend of Zelda: Oracle of Seasons and Oracle of Ages",
  "Zelda: Oracle of Seasons": "The Legend of Zelda: Oracle of Seasons and Oracle of Ages",
  'Super Mario Land': 'Super Mario Land',
  'Super Mario Land 2': 'Super Mario Land 2: 6 Golden Coins',
  "Wario Land: Super Mario Land 3": "Wario Land: Super Mario Land 3",
  'Donkey Kong (Game Boy)': 'Donkey Kong (1994 video game)',
  "Kirby's Dream Land": "Kirby's Dream Land",
  "Kirby's Dream Land 2": "Kirby's Dream Land 2",
  'Metroid II: Return of Samus': 'Metroid II: Return of Samus',
  'Tetris (Game Boy)': 'Tetris (Game Boy video game)',

  // GBA
  'Pokémon Ruby': 'Pokémon Ruby and Sapphire',
  'Pokémon Sapphire': 'Pokémon Ruby and Sapphire',
  'Pokémon Emerald': 'Pokémon Emerald',
  'Pokémon FireRed': 'Pokémon FireRed and LeafGreen',
  'Pokémon LeafGreen': 'Pokémon FireRed and LeafGreen',
  'The Legend of Zelda: The Minish Cap': 'The Legend of Zelda: The Minish Cap',
  'Mario Kart: Super Circuit': 'Mario Kart: Super Circuit',
  'Mario & Luigi: Superstar Saga': 'Mario & Luigi: Superstar Saga',
  'Super Mario Advance 4': 'Super Mario Advance 4: Super Mario Bros. 3',
  'Metroid Fusion': 'Metroid Fusion',
  'Metroid: Zero Mission': 'Metroid: Zero Mission',
  'Fire Emblem (GBA)': 'Fire Emblem (video game)',
  'Fire Emblem: The Sacred Stones': 'Fire Emblem: The Sacred Stones',
  'Kirby & The Amazing Mirror': 'Kirby & The Amazing Mirror',
  'Golden Sun': 'Golden Sun (video game)',
  'Golden Sun: The Lost Age': 'Golden Sun: The Lost Age',
  'Advance Wars': 'Advance Wars',
  'Advance Wars 2': 'Advance Wars 2: Black Hole Rising',
  'WarioWare, Inc.': 'WarioWare, Inc.: Mega Microgames!',
  'Castlevania: Aria of Sorrow': 'Castlevania: Aria of Sorrow',

  // N64
  'Super Mario 64': 'Super Mario 64',
  'The Legend of Zelda: Ocarina of Time': 'The Legend of Zelda: Ocarina of Time',
  "The Legend of Zelda: Majora's Mask": "The Legend of Zelda: Majora's Mask",
  'Mario Kart 64': 'Mario Kart 64',
  'Super Smash Bros.': 'Super Smash Bros. (video game)',
  'Pokémon Stadium': 'Pokémon Stadium',
  'Pokémon Stadium 2': 'Pokémon Stadium 2',
  'Pokémon Snap': 'Pokémon Snap',
  'GoldenEye 007': 'GoldenEye 007 (1997 video game)',
  'Star Fox 64': 'Star Fox 64',
  'Donkey Kong 64': 'Donkey Kong 64',
  'Banjo-Kazooie': 'Banjo-Kazooie',
  'Paper Mario': 'Paper Mario (video game)',
  'Kirby 64': 'Kirby 64: The Crystal Shards',
  'F-Zero X': 'F-Zero X',
  'Mario Party 2': 'Mario Party 2',
  'Mario Party 3': 'Mario Party 3',
  "Diddy Kong Racing": "Diddy Kong Racing",
  "Mario Tennis": "Mario Tennis (Nintendo 64)",
  "Mario Golf": "Mario Golf (Nintendo 64)",

  // SNES
  'Super Mario World': 'Super Mario World',
  'Super Mario All-Stars': 'Super Mario All-Stars',
  'The Legend of Zelda: A Link to the Past': 'The Legend of Zelda: A Link to the Past',
  'Super Metroid': 'Super Metroid',
  'Donkey Kong Country': 'Donkey Kong Country',
  'Donkey Kong Country 2': "Donkey Kong Country 2: Diddy's Kong Quest",
  'Donkey Kong Country 3': "Donkey Kong Country 3: Dixie Kong's Double Trouble!",
  'Super Mario Kart': 'Super Mario Kart',
  'Star Fox': 'Star Fox (1993 video game)',
  'Kirby Super Star': 'Kirby Super Star',
  "Super Mario World 2: Yoshi's Island": "Super Mario World 2: Yoshi's Island",
  'EarthBound': 'EarthBound',
  'Chrono Trigger': 'Chrono Trigger',
  'F-Zero': 'F-Zero (video game)',
  'Super Mario RPG: Legend of the Seven Stars': 'Super Mario RPG: Legend of the Seven Stars',

  // NES
  'Super Mario Bros.': 'Super Mario Bros.',
  'Super Mario Bros. 2': 'Super Mario Bros. 2',
  'Super Mario Bros. 3': 'Super Mario Bros. 3',
  'The Legend of Zelda': 'The Legend of Zelda (video game)',
  'Zelda II: The Adventure of Link': 'Zelda II: The Adventure of Link',
  'Metroid': 'Metroid (video game)',
  'Mega Man 2': 'Mega Man 2',
  "Kirby's Adventure": "Kirby's Adventure",
  'Duck Hunt': 'Duck Hunt',
  'Punch-Out!!': 'Punch-Out!! (NES)',
  'Castlevania': 'Castlevania (1986 video game)',
  'Contra': 'Contra (video game)',

  // GameCube
  'Pokémon XD: Gale of Darkness': 'Pokémon XD: Gale of Darkness',
  'Pokémon Colosseum': 'Pokémon Colosseum',
  'Super Smash Bros. Melee': 'Super Smash Bros. Melee',
  'The Legend of Zelda: The Wind Waker': 'The Legend of Zelda: The Wind Waker',
  'The Legend of Zelda: Twilight Princess': 'The Legend of Zelda: Twilight Princess',
  'Super Mario Sunshine': 'Super Mario Sunshine',
  'Mario Kart: Double Dash!!': 'Mario Kart: Double Dash!!',
  "Luigi's Mansion": "Luigi's Mansion",
  'Metroid Prime': 'Metroid Prime',
  'Metroid Prime 2: Echoes': 'Metroid Prime 2: Echoes',
  'Fire Emblem: Path of Radiance': 'Fire Emblem: Path of Radiance',
  'Pikmin': 'Pikmin (video game)',
  'Pikmin 2': 'Pikmin 2',
  'Star Fox Adventures': 'Star Fox Adventures',
  'Star Fox: Assault': 'Star Fox: Assault',
  'Kirby Air Ride': 'Kirby Air Ride',
  'Paper Mario: The Thousand-Year Door': 'Paper Mario: The Thousand-Year Door',
  'Animal Crossing': 'Animal Crossing (video game)',
  'F-Zero GX': 'F-Zero GX',
  'Mario Party 7': 'Mario Party 7',
  'Eternal Darkness': 'Eternal Darkness: Sanity\'s Requiem',

  // Wii
  'Super Smash Bros. Brawl': 'Super Smash Bros. Brawl',
  'The Legend of Zelda: Skyward Sword': 'The Legend of Zelda: Skyward Sword',
  'Super Mario Galaxy': 'Super Mario Galaxy',
  'Super Mario Galaxy 2': 'Super Mario Galaxy 2',
  'Mario Kart Wii': 'Mario Kart Wii',
  'New Super Mario Bros. Wii': 'New Super Mario Bros. Wii',
  'Donkey Kong Country Returns': 'Donkey Kong Country Returns',
  "Kirby's Return to Dream Land": "Kirby's Return to Dream Land",
  "Kirby's Epic Yarn": "Kirby's Epic Yarn",
  'Metroid Prime 3: Corruption': 'Metroid Prime 3: Corruption',
  'Metroid: Other M': 'Metroid: Other M',
  'Xenoblade Chronicles': 'Xenoblade Chronicles',
  'PokéPark Wii': 'PokéPark Wii: Pikachu\'s Adventure',
  'Wii Sports': 'Wii Sports',
  'Wii Sports Resort': 'Wii Sports Resort',
  'Mario Party 8': 'Mario Party 8',
  'Mario Party 9': 'Mario Party 9',

  // Wii U
  'Super Smash Bros. for Wii U': 'Super Smash Bros. for Nintendo 3DS and Wii U',
  'The Legend of Zelda: Breath of the Wild (Wii U)': 'The Legend of Zelda: Breath of the Wild',
  'The Legend of Zelda: The Wind Waker HD': 'The Legend of Zelda: The Wind Waker HD',
  'The Legend of Zelda: Twilight Princess HD': 'The Legend of Zelda: Twilight Princess HD',
  'Super Mario 3D World': 'Super Mario 3D World',
  'Mario Kart 8': 'Mario Kart 8',
  'New Super Mario Bros. U': 'New Super Mario Bros. U',
  'Splatoon': 'Splatoon',
  'Pikmin 3': 'Pikmin 3',
  'Donkey Kong Country: Tropical Freeze (Wii U)': 'Donkey Kong Country: Tropical Freeze',
  'Super Mario Maker': 'Super Mario Maker',
  'Bayonetta 2 (Wii U)': 'Bayonetta 2',
  'Xenoblade Chronicles X': 'Xenoblade Chronicles X',
  'Hyrule Warriors': 'Hyrule Warriors',
  'Mario Party 10': 'Mario Party 10',
  'Yoshi\'s Woolly World': "Yoshi's Woolly World",
  'Captain Toad: Treasure Tracker (Wii U)': 'Captain Toad: Treasure Tracker',
  'Paper Mario: Color Splash': 'Paper Mario: Color Splash',
  'Star Fox Zero': 'Star Fox Zero',
  'NES Remix Pack': 'NES Remix',
};

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

function curlJSON(url) {
  try {
    const result = execSync(
      `curl -sL -H 'User-Agent: GameShopBot/2.0 (gameshopenter@gmail.com)' '${url}'`,
      { maxBuffer: 10 * 1024 * 1024, timeout: 15000 }
    ).toString();
    return JSON.parse(result);
  } catch (e) {
    return null;
  }
}

function getArticleTitle(name) {
  // Check manual mapping first
  if (ARTICLE_MAP[name]) return ARTICLE_MAP[name];
  // Default: use the name as-is with spaces replaced by underscores
  return name;
}

function getInfoboxImage(articleTitle) {
  const encoded = encodeURIComponent(articleTitle.replace(/ /g, '_'));
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=revisions&rvprop=content&rvsection=0&rvslots=main&format=json`;

  const data = curlJSON(url);
  if (!data || !data.query) return null;

  const pages = data.query.pages;
  for (const pid of Object.keys(pages)) {
    if (pid === '-1') continue;
    const page = pages[pid];
    if (!page.revisions || !page.revisions[0]) continue;

    const content = page.revisions[0].slots?.main?.['*'] || '';

    // Parse infobox image parameter
    // Patterns: | image = Filename.ext, | image_cover = ..., | cover = ...
    const imagePatterns = [
      /\|\s*image\s*=\s*([^\n|{}]+)/i,
      /\|\s*image_cover\s*=\s*([^\n|{}]+)/i,
      /\|\s*cover\s*=\s*([^\n|{}]+)/i,
      /\|\s*boxart\s*=\s*([^\n|{}]+)/i,
    ];

    for (const pattern of imagePatterns) {
      const match = content.match(pattern);
      if (match) {
        let filename = match[1].trim();
        // Remove [[File: or [[Image: wrappers
        filename = filename.replace(/^\[\[(File|Image):/, '').replace(/\]\].*$/, '');
        // Remove any remaining markup
        filename = filename.replace(/\|.*$/, '').trim();
        // Remove File: or Image: prefix if present
        filename = filename.replace(/^(File|Image):/i, '').trim();

        if (filename && !filename.includes('{') && filename.length > 3) {
          return filename;
        }
      }
    }
  }
  return null;
}

function getImageUrl(filename) {
  const encoded = encodeURIComponent('File:' + filename);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url&format=json`;

  const data = curlJSON(url);
  if (!data || !data.query) return null;

  const pages = data.query.pages;
  for (const pid of Object.keys(pages)) {
    if (pid === '-1') continue;
    const page = pages[pid];
    if (page.imageinfo && page.imageinfo[0]) {
      return page.imageinfo[0].url;
    }
  }
  return null;
}

async function downloadAndProcess(imageUrl, outputPath) {
  try {
    const tmpPath = outputPath + '.tmp';
    execSync(
      `curl -sL -H 'User-Agent: GameShopBot/2.0' -o '${tmpPath}' '${imageUrl}'`,
      { timeout: 30000 }
    );

    if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size < 1000) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      return false;
    }

    // Process with sharp: 500x500 white background, webp
    await sharp(tmpPath)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 85 })
      .toFile(outputPath);

    fs.unlinkSync(tmpPath);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log(`Processing ${products.length} products...`);

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  const failures = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Skip consoles/accessories - only process games
    if (product.isConsole) {
      skipped++;
      continue;
    }

    const slug = `${product.sku.toLowerCase()}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
    const outputPath = path.join(IMAGES_DIR, `${slug}.webp`);

    // Get Wikipedia article title
    const articleTitle = getArticleTitle(product.name);

    // Get infobox image filename
    const imageFilename = getInfoboxImage(articleTitle);

    if (!imageFilename) {
      failed++;
      failures.push({ sku: product.sku, name: product.name, reason: 'No infobox image found' });
      console.log(`  [${i+1}/${products.length}] SKIP ${product.name} - no infobox image`);
      sleep(300);
      continue;
    }

    // Get the actual image URL
    const imageUrl = getImageUrl(imageFilename);

    if (!imageUrl) {
      failed++;
      failures.push({ sku: product.sku, name: product.name, reason: `Could not get URL for: ${imageFilename}` });
      console.log(`  [${i+1}/${products.length}] SKIP ${product.name} - no URL for ${imageFilename}`);
      sleep(300);
      continue;
    }

    // Download and process
    const ok = await downloadAndProcess(imageUrl, outputPath);

    if (ok) {
      succeeded++;
      console.log(`  [${i+1}/${products.length}] OK ${product.name}`);
    } else {
      failed++;
      failures.push({ sku: product.sku, name: product.name, reason: 'Download/process failed' });
      console.log(`  [${i+1}/${products.length}] FAIL ${product.name}`);
    }

    // Rate limit: 300ms between requests
    sleep(300);
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (consoles): ${skipped}`);

  if (failures.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) {
      console.log(`  ${f.sku}: ${f.name} - ${f.reason}`);
    }
  }
}

main().catch(console.error);
