#!/usr/bin/env node

/**
 * Fix Cover Arts Script v2
 *
 * Uses Wikipedia infobox parsing to find the correct cover art image.
 * For paired games (e.g. Pokemon Sword/Shield), tries to find version-specific covers.
 * Forces re-download even if image exists to fix incorrect matches.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/products.json');
const IMAGES_DIR = path.join(process.cwd(), 'public/images/products');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));

// === ARTICLE MAP ===
// Maps product name -> Wikipedia article title
// For paired games, maps to the SPECIFIC version article or with hints for cover selection
const ARTICLE_MAP = {
  // --- Pokemon Switch ---
  'Pokémon Brilliant Diamond': { article: 'Pokémon Brilliant Diamond and Shining Pearl', coverHint: 'Brilliant_Diamond' },
  'Pokémon Shining Pearl': { article: 'Pokémon Brilliant Diamond and Shining Pearl', coverHint: 'Shining_Pearl' },
  'Pokémon Sword': { article: 'Pokémon Sword and Shield', coverHint: 'Sword' },
  'Pokémon Shield': { article: 'Pokémon Sword and Shield', coverHint: 'Shield' },
  'Pokémon Scarlet': { article: 'Pokémon Scarlet and Violet', coverHint: 'Scarlet' },
  'Pokémon Violet': { article: 'Pokémon Scarlet and Violet', coverHint: 'Violet' },
  "Pokémon Let's Go Pikachu": { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", coverHint: 'Pikachu' },
  "Pokémon Let's Go Eevee": { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", coverHint: 'Eevee' },
  'Pokémon Legends: Arceus': { article: 'Pokémon Legends: Arceus' },
  'Pokémon Mystery Dungeon: Rescue Team DX': { article: 'Pokémon Mystery Dungeon: Rescue Team DX' },
  'New Pokémon Snap': { article: 'New Pokémon Snap' },

  // --- Pokemon 3DS ---
  'Pokémon X': { article: 'Pokémon X and Y', coverHint: 'X' },
  'Pokémon Y': { article: 'Pokémon X and Y', coverHint: 'Y' },
  'Pokémon Sun': { article: 'Pokémon Sun and Moon', coverHint: 'Sun' },
  'Pokémon Moon': { article: 'Pokémon Sun and Moon', coverHint: 'Moon' },
  'Pokémon Ultra Sun': { article: 'Pokémon Ultra Sun and Ultra Moon', coverHint: 'Ultra_Sun' },
  'Pokémon Ultra Moon': { article: 'Pokémon Ultra Sun and Ultra Moon', coverHint: 'Ultra_Moon' },
  'Pokémon Alpha Sapphire': { article: 'Pokémon Omega Ruby and Alpha Sapphire', coverHint: 'Alpha_Sapphire' },
  'Pokémon Omega Ruby': { article: 'Pokémon Omega Ruby and Alpha Sapphire', coverHint: 'Omega_Ruby' },

  // --- Pokemon DS ---
  'Pokémon Black': { article: 'Pokémon Black and White', coverHint: 'Black' },
  'Pokémon White': { article: 'Pokémon Black and White', coverHint: 'White' },
  'Pokémon Black 2': { article: 'Pokémon Black 2 and White 2', coverHint: 'Black_2' },
  'Pokémon White 2': { article: 'Pokémon Black 2 and White 2', coverHint: 'White_2' },
  'Pokémon SoulSilver': { article: 'Pokémon HeartGold and SoulSilver', coverHint: 'SoulSilver' },
  'Pokémon HeartGold': { article: 'Pokémon HeartGold and SoulSilver', coverHint: 'HeartGold' },
  'Pokémon Platinum': { article: 'Pokémon Platinum' },
  'Pokémon Diamond': { article: 'Pokémon Diamond and Pearl', coverHint: 'Diamond' },
  'Pokémon Pearl': { article: 'Pokémon Diamond and Pearl', coverHint: 'Pearl' },

  // --- Pokemon GBA ---
  'Pokémon Ruby': { article: 'Pokémon Ruby and Sapphire', coverHint: 'Ruby' },
  'Pokémon Sapphire': { article: 'Pokémon Ruby and Sapphire', coverHint: 'Sapphire' },
  'Pokémon Emerald': { article: 'Pokémon Emerald' },
  'Pokémon FireRed': { article: 'Pokémon FireRed and LeafGreen', coverHint: 'FireRed' },
  'Pokémon LeafGreen': { article: 'Pokémon FireRed and LeafGreen', coverHint: 'LeafGreen' },

  // --- Pokemon GB ---
  'Pokémon Red': { article: 'Pokémon Red and Blue', coverHint: 'Red' },
  'Pokémon Blue': { article: 'Pokémon Red and Blue', coverHint: 'Blue' },
  'Pokémon Yellow': { article: 'Pokémon Yellow' },
  'Pokémon Gold': { article: 'Pokémon Gold and Silver', coverHint: 'Gold' },
  'Pokémon Silver': { article: 'Pokémon Gold and Silver', coverHint: 'Silver' },
  'Pokémon Crystal': { article: 'Pokémon Crystal' },
  'Pokémon Pinball': { article: 'Pokémon Pinball' },
  'Pokémon TCG': { article: 'Pokémon Trading Card Game (video game)' },

  // --- Pokemon N64 ---
  'Pokémon Stadium': { article: 'Pokémon Stadium' },
  'Pokémon Stadium 2': { article: 'Pokémon Stadium 2' },
  'Pokémon Snap': { article: 'Pokémon Snap' },
  'PokéPark Wii': { article: "PokéPark Wii: Pikachu's Adventure" },

  // --- Zelda ---
  'Zelda: Breath of the Wild': { article: 'The Legend of Zelda: Breath of the Wild' },
  'Zelda: Tears of the Kingdom': { article: 'The Legend of Zelda: Tears of the Kingdom' },
  "Zelda: Link's Awakening (2019)": { article: "The Legend of Zelda: Link's Awakening (2019 video game)" },
  'Zelda: Skyward Sword HD': { article: 'The Legend of Zelda: Skyward Sword HD' },
  'Zelda: Ocarina of Time': { article: 'The Legend of Zelda: Ocarina of Time' },
  "Zelda: Majora's Mask": { article: "The Legend of Zelda: Majora's Mask" },
  "Zelda: Majora's Mask 3D": { article: "The Legend of Zelda: Majora's Mask 3D" },
  'Zelda: Ocarina of Time 3D': { article: 'The Legend of Zelda: Ocarina of Time 3D' },
  "Zelda: Link's Awakening": { article: "The Legend of Zelda: Link's Awakening" },
  'Zelda: Oracle of Ages': { article: "The Legend of Zelda: Oracle of Seasons and Oracle of Ages", coverHint: 'Ages' },
  'Zelda: Oracle of Seasons': { article: "The Legend of Zelda: Oracle of Seasons and Oracle of Ages", coverHint: 'Seasons' },
  'Zelda: ALttP / Four Swords': { article: 'The Legend of Zelda: A Link to the Past & Four Swords' },
  'Zelda: The Minish Cap': { article: 'The Legend of Zelda: The Minish Cap' },
  'Zelda: The Wind Waker': { article: 'The Legend of Zelda: The Wind Waker' },
  'Zelda: Twilight Princess': { article: 'The Legend of Zelda: Twilight Princess' },
  'Zelda: Wind Waker HD': { article: 'The Legend of Zelda: The Wind Waker HD' },
  'Zelda: Twilight Princess HD': { article: 'The Legend of Zelda: Twilight Princess HD' },
  'Zelda: Skyward Sword': { article: 'The Legend of Zelda: Skyward Sword' },
  'Zelda: A Link Between Worlds': { article: 'The Legend of Zelda: A Link Between Worlds' },
  'Zelda: A Link to the Past': { article: 'The Legend of Zelda: A Link to the Past' },
  'Zelda': { article: 'The Legend of Zelda (video game)' },
  'Zelda II': { article: 'Zelda II: The Adventure of Link' },
  'Zelda: Phantom Hourglass': { article: 'The Legend of Zelda: Phantom Hourglass' },
  'Zelda: Spirit Tracks': { article: 'The Legend of Zelda: Spirit Tracks' },
  'Zelda: Breath of the Wild (Wii U)': { article: 'The Legend of Zelda: Breath of the Wild' },

  // --- Mario ---
  'Super Mario 3D World + Bowser\'s Fury': { article: "Super Mario 3D World + Bowser's Fury" },
  'Super Mario RPG': { article: 'Super Mario RPG (2023 video game)' },
  'Super Mario Odyssey': { article: 'Super Mario Odyssey' },
  'Super Mario Maker 2': { article: 'Super Mario Maker 2' },
  'Super Mario 3D All-Stars': { article: 'Super Mario 3D All-Stars' },
  'Super Mario 64': { article: 'Super Mario 64' },
  'Super Mario Sunshine': { article: 'Super Mario Sunshine' },
  'Super Mario Galaxy': { article: 'Super Mario Galaxy' },
  'Super Mario Galaxy 2': { article: 'Super Mario Galaxy 2' },
  'Super Mario World': { article: 'Super Mario World' },
  'Super Mario All-Stars': { article: 'Super Mario All-Stars' },
  'Super Mario Bros.': { article: 'Super Mario Bros.' },
  'Super Mario Bros. 2': { article: 'Super Mario Bros. 2' },
  'Super Mario Bros. 3': { article: 'Super Mario Bros. 3' },
  'Super Mario 3D Land': { article: 'Super Mario 3D Land' },
  'Super Mario 3D World': { article: 'Super Mario 3D World' },
  'Super Mario Land': { article: 'Super Mario Land' },
  'Super Mario Land 2': { article: 'Super Mario Land 2: 6 Golden Coins' },
  'Super Mario Maker': { article: 'Super Mario Maker' },
  'Super Mario RPG: Legend of the Seven Stars': { article: 'Super Mario RPG: Legend of the Seven Stars' },
  'New Super Mario Bros.': { article: 'New Super Mario Bros.' },
  'New Super Mario Bros. Wii': { article: 'New Super Mario Bros. Wii' },
  'New Super Mario Bros. U Deluxe': { article: 'New Super Mario Bros. U Deluxe' },
  'New Super Mario Bros. U': { article: 'New Super Mario Bros. U' },

  // --- Mario Kart ---
  'Mario Kart 8 Deluxe': { article: 'Mario Kart 8 Deluxe' },
  'Mario Kart 8': { article: 'Mario Kart 8' },
  'Mario Kart Wii': { article: 'Mario Kart Wii' },
  'Mario Kart 7': { article: 'Mario Kart 7' },
  'Mario Kart DS': { article: 'Mario Kart DS' },
  'Mario Kart 64': { article: 'Mario Kart 64' },
  'Mario Kart: Super Circuit': { article: 'Mario Kart: Super Circuit' },
  'Mario Kart: Double Dash!!': { article: 'Mario Kart: Double Dash!!' },
  'Super Mario Kart': { article: 'Super Mario Kart' },
  'Mario Kart Live: Home Circuit': { article: 'Mario Kart Live: Home Circuit' },

  // --- Donkey Kong (5 games had 1 image!) ---
  'Donkey Kong Country': { article: 'Donkey Kong Country' },
  'Donkey Kong Country 2': { article: "Donkey Kong Country 2: Diddy's Kong Quest" },
  'Donkey Kong Country 3': { article: "Donkey Kong Country 3: Dixie Kong's Double Trouble!" },
  'Donkey Kong (Game Boy)': { article: 'Donkey Kong (1994 video game)' },
  'DK Country: Tropical Freeze': { article: 'Donkey Kong Country: Tropical Freeze' },
  'Donkey Kong Country: Tropical Freeze': { article: 'Donkey Kong Country: Tropical Freeze' },
  'Donkey Kong Country Returns': { article: 'Donkey Kong Country Returns' },
  'DK Country Returns 3D': { article: 'Donkey Kong Country Returns 3D' },
  'Donkey Kong 64': { article: 'Donkey Kong 64' },
  'Donkey Kong Country (GBC)': { article: 'Donkey Kong Country (Game Boy Color)' },

  // --- Kirby ---
  "Kirby's Adventure": { article: "Kirby's Adventure" },
  "Kirby's Fun Pak": { article: 'Kirby Super Star' },
  "Kirby's Dream Land": { article: "Kirby's Dream Land" },
  "Kirby's Dream Land 2": { article: "Kirby's Dream Land 2" },
  'Kirby Triple Deluxe': { article: 'Kirby: Triple Deluxe' },
  'Kirby: Planet Robobot': { article: 'Kirby: Planet Robobot' },
  'Kirby en de Vergeten Wereld': { article: 'Kirby and the Forgotten Land' },
  'Kirby Star Allies': { article: 'Kirby Star Allies' },
  "Kirby's Epic Yarn": { article: "Kirby's Epic Yarn" },
  "Kirby's Adventure Wii": { article: "Kirby's Return to Dream Land" },
  'Kirby Air Ride': { article: 'Kirby Air Ride' },
  'Kirby & The Amazing Mirror': { article: 'Kirby & The Amazing Mirror' },
  'Kirby 64': { article: 'Kirby 64: The Crystal Shards' },
  'Kirby Super Star Ultra': { article: 'Kirby Super Star Ultra' },

  // --- Smash Bros ---
  'Super Smash Bros.': { article: 'Super Smash Bros. (video game)' },
  'Super Smash Bros. Melee': { article: 'Super Smash Bros. Melee' },
  'Super Smash Bros. Brawl': { article: 'Super Smash Bros. Brawl' },
  'Super Smash Bros. for 3DS': { article: 'Super Smash Bros. for Nintendo 3DS and Wii U', coverHint: '3DS' },
  'Super Smash Bros. for Wii U': { article: 'Super Smash Bros. for Nintendo 3DS and Wii U', coverHint: 'Wii_U' },
  'Super Smash Bros. Ultimate': { article: 'Super Smash Bros. Ultimate' },

  // --- Metroid ---
  'Metroid': { article: 'Metroid (video game)' },
  'Super Metroid': { article: 'Super Metroid' },
  'Metroid II: Return of Samus': { article: 'Metroid II: Return of Samus' },
  'Metroid Fusion': { article: 'Metroid Fusion' },
  'Metroid: Zero Mission': { article: 'Metroid: Zero Mission' },
  'Metroid Prime': { article: 'Metroid Prime' },
  'Metroid Prime 2: Echoes': { article: 'Metroid Prime 2: Echoes' },
  'Metroid Prime 3: Corruption': { article: 'Metroid Prime 3: Corruption' },
  'Metroid: Other M': { article: 'Metroid: Other M' },
  'Metroid: Samus Returns': { article: 'Metroid: Samus Returns' },
  'Metroid Dread': { article: 'Metroid Dread' },
  'Metroid Prime Remastered': { article: 'Metroid Prime Remastered' },

  // --- Luigi's Mansion ---
  "Luigi's Mansion": { article: "Luigi's Mansion" },
  "Luigi's Mansion (3DS)": { article: "Luigi's Mansion (2018 video game)" },
  "Luigi's Mansion: Dark Moon": { article: "Luigi's Mansion: Dark Moon" },
  "Luigi's Mansion 3": { article: "Luigi's Mansion 3" },

  // --- Splatoon ---
  'Splatoon': { article: 'Splatoon' },
  'Splatoon 2': { article: 'Splatoon 2' },
  'Splatoon 3': { article: 'Splatoon 3' },

  // --- Fire Emblem ---
  'Fire Emblem (GBA)': { article: 'Fire Emblem (video game)' },
  'Fire Emblem: The Sacred Stones': { article: 'Fire Emblem: The Sacred Stones' },
  'Fire Emblem: Path of Radiance': { article: 'Fire Emblem: Path of Radiance' },
  'Fire Emblem Awakening': { article: 'Fire Emblem Awakening' },
  'Fire Emblem Fates': { article: 'Fire Emblem Fates' },
  'Fire Emblem: Three Houses': { article: 'Fire Emblem: Three Houses' },
  'Fire Emblem Engage': { article: 'Fire Emblem Engage' },

  // --- Pikmin ---
  'Pikmin': { article: 'Pikmin (video game)' },
  'Pikmin 2': { article: 'Pikmin 2' },
  'Pikmin 3': { article: 'Pikmin 3' },
  'Pikmin 3 Deluxe': { article: 'Pikmin 3 Deluxe' },
  'Pikmin 4': { article: 'Pikmin 4' },
  'Pikmin 1+2': { article: 'Pikmin 1+2' },

  // --- Bayonetta ---
  'Bayonetta 2': { article: 'Bayonetta 2' },
  'Bayonetta 3': { article: 'Bayonetta 3' },

  // --- Xenoblade ---
  'Xenoblade Chronicles': { article: 'Xenoblade Chronicles' },
  'Xenoblade Chronicles: Definitive Edition': { article: 'Xenoblade Chronicles: Definitive Edition' },
  'Xenoblade Chronicles 2': { article: 'Xenoblade Chronicles 2' },
  'Xenoblade Chronicles 3': { article: 'Xenoblade Chronicles 3' },
  'Xenoblade Chronicles X': { article: 'Xenoblade Chronicles X' },

  // --- Star Fox ---
  'Star Fox': { article: 'Star Fox (1993 video game)' },
  'Star Fox 64': { article: 'Star Fox 64' },
  'Star Fox 64 3D': { article: 'Star Fox 64 3D' },
  'Star Fox Adventures': { article: 'Star Fox Adventures' },
  'Star Fox: Assault': { article: 'Star Fox: Assault' },
  'Star Fox Zero': { article: 'Star Fox Zero' },

  // --- Animal Crossing ---
  'Animal Crossing': { article: 'Animal Crossing (video game)' },
  'Animal Crossing: Wild World': { article: 'Animal Crossing: Wild World' },
  'Animal Crossing: New Leaf': { article: 'Animal Crossing: New Leaf' },
  'Animal Crossing: New Horizons': { article: 'Animal Crossing: New Horizons' },

  // --- Other Switch ---
  'Arms': { article: 'Arms (video game)' },
  'WarioWare: Get It Together!': { article: 'WarioWare: Get It Together!' },
  'Cuphead': { article: 'Cuphead' },
  'Undertale': { article: 'Undertale' },
  'Dragon Ball FighterZ': { article: 'Dragon Ball FighterZ' },
  'Overcooked! All You Can Eat': { article: 'Overcooked! All You Can Eat' },
  'Borderlands Legendary Collection': { article: 'Borderlands Legendary Collection' },
  'Naruto Storm Trilogy': { article: 'Naruto Shippuden: Ultimate Ninja Storm Trilogy' },
  'Cars 3: Vol Gas voor de Winst': { article: 'Cars 3: Driven to Win' },
  'Ring Fit Adventure': { article: 'Ring Fit Adventure' },
  'Nintendo Switch Sports': { article: 'Nintendo Switch Sports' },
  'Mario Strikers: Battle League': { article: 'Mario Strikers: Battle League' },
  'Astral Chain': { article: 'Astral Chain' },
  "Yoshi's Crafted World": { article: "Yoshi's Crafted World" },
  'Captain Toad: Treasure Tracker': { article: 'Captain Toad: Treasure Tracker' },
  'Miitopia': { article: 'Miitopia' },
  'Clubhouse Games: 51 Worldwide Classics': { article: 'Clubhouse Games: 51 Worldwide Classics' },
  'Super Mario Party': { article: 'Super Mario Party' },
  'Mario Party Superstars': { article: 'Mario Party Superstars' },
  'Paper Mario: The Origami King': { article: 'Paper Mario: The Origami King' },
  'Mario + Rabbids Kingdom Battle': { article: 'Mario + Rabbids Kingdom Battle' },
  'Mario + Rabbids Sparks of Hope': { article: 'Mario + Rabbids Sparks of Hope' },
  'Hyrule Warriors: Age of Calamity': { article: 'Hyrule Warriors: Age of Calamity' },
  'Collection of Mana': { article: 'Collection of Mana' },

  // --- N64 ---
  'GoldenEye 007': { article: 'GoldenEye 007 (1997 video game)' },
  'Banjo-Kazooie': { article: 'Banjo-Kazooie' },
  "Conker's Bad Fur Day": { article: "Conker's Bad Fur Day" },
  'F-Zero X': { article: 'F-Zero X' },
  'Paper Mario': { article: 'Paper Mario (video game)' },
  'Mario Party 2': { article: 'Mario Party 2' },
  'Mario Party 3': { article: 'Mario Party 3' },
  'Diddy Kong Racing': { article: 'Diddy Kong Racing' },
  'Mario Tennis': { article: 'Mario Tennis (Nintendo 64)' },
  'Mario Golf': { article: 'Mario Golf (Nintendo 64)' },

  // --- GameCube ---
  'Pokémon XD: Gale of Darkness': { article: 'Pokémon XD: Gale of Darkness' },
  'Pokémon Colosseum': { article: 'Pokémon Colosseum' },
  'F-Zero GX': { article: 'F-Zero GX' },
  'Paper Mario: The Thousand-Year Door': { article: 'Paper Mario: The Thousand-Year Door' },
  "Eternal Darkness": { article: "Eternal Darkness: Sanity's Requiem" },

  // --- Wii ---
  'Wii Sports': { article: 'Wii Sports' },
  'Wii Sports Resort': { article: 'Wii Sports Resort' },
  'Mario Party 8': { article: 'Mario Party 8' },
  'Mario Party 9': { article: 'Mario Party 9' },

  // --- Wii U ---
  'Hyrule Warriors': { article: 'Hyrule Warriors' },
  "Yoshi's Woolly World": { article: "Yoshi's Woolly World" },
  'Paper Mario: Color Splash': { article: 'Paper Mario: Color Splash' },
  'Mario Party 10': { article: 'Mario Party 10' },
  'NES Remix Pack': { article: 'NES Remix' },

  // --- NES ---
  'Mega Man 2': { article: 'Mega Man 2' },
  'Duck Hunt': { article: 'Duck Hunt' },
  'Punch-Out!!': { article: 'Punch-Out!! (NES)' },
  'Castlevania': { article: 'Castlevania (1986 video game)' },
  'Contra': { article: 'Contra (video game)' },

  // --- SNES ---
  'EarthBound': { article: 'EarthBound' },
  'Chrono Trigger': { article: 'Chrono Trigger' },
  'F-Zero': { article: 'F-Zero (video game)' },
  'Contra III': { article: 'Contra III: The Alien Wars' },
  'Secret of Mana': { article: 'Secret of Mana' },
  "Super Mario World 2: Yoshi's Island": { article: "Super Mario World 2: Yoshi's Island" },
  "Yoshi's Island (GBA)": { article: "Yoshi's Island: Super Mario Advance 3" },

  // --- GBA ---
  'Golden Sun': { article: 'Golden Sun (video game)' },
  'Golden Sun: The Lost Age': { article: 'Golden Sun: The Lost Age' },
  'Advance Wars': { article: 'Advance Wars' },
  'Advance Wars 2': { article: 'Advance Wars 2: Black Hole Rising' },
  'WarioWare, Inc.': { article: 'WarioWare, Inc.: Mega Microgames!' },
  'Castlevania: Aria of Sorrow': { article: 'Castlevania: Aria of Sorrow' },
  'Mario & Luigi: Superstar Saga': { article: 'Mario & Luigi: Superstar Saga' },
  'Super Mario Advance 4': { article: 'Super Mario Advance 4: Super Mario Bros. 3' },

  // --- DS ---
  'Mario & Luigi: Bowser\'s Inside Story': { article: "Mario & Luigi: Bowser's Inside Story" },
  'Mario & Luigi: Partners in Time': { article: 'Mario & Luigi: Partners in Time' },
  'Professor Layton: Geheimzinnige Dorp': { article: 'Professor Layton and the Curious Village' },
  'Professor Layton: Vergeten Toekomst': { article: 'Professor Layton and the Unwound Future' },
  'Brain Age': { article: 'Brain Age: Train Your Brain in Minutes a Day!' },
  'Nintendogs': { article: 'Nintendogs' },
  "Yoshi's Island DS": { article: "Yoshi's Island DS" },

  // --- 3DS ---
  "Luigi's Mansion: Dark Moon": { article: "Luigi's Mansion: Dark Moon" },
  "Luigi's Mansion (3DS)": { article: "Luigi's Mansion (2018 video game)" },
  'Kid Icarus: Uprising': { article: 'Kid Icarus: Uprising' },
  'Tomodachi Life': { article: 'Tomodachi Life' },
  'Professor Layton vs. Phoenix Wright': { article: 'Professor Layton vs. Phoenix Wright: Ace Attorney' },
};

// Set of SKUs/slugs that need fixing (identified from duplicate MD5 analysis)
const SLUGS_TO_FIX = new Set([
  // Pokemon paired games (all sharing images)
  'sw-001', 'sw-002', 'sw-003', 'sw-004', 'sw-005', 'sw-006', 'sw-007', 'sw-008',
  'sw-009', 'sw-010', 'sw-011',
  '3ds-004', '3ds-005', '3ds-006', '3ds-007', '3ds-008', '3ds-009', '3ds-010', '3ds-011',
  'ds-001', 'ds-002', 'ds-003', 'ds-004', 'ds-005', 'ds-006', 'ds-007', 'ds-008', 'ds-009',
  'gba-001', 'gba-002', 'gba-003', 'gba-004', 'gba-005',
  'gb-001', 'gb-002', 'gb-003', 'gb-004', 'gb-005', 'gb-006', 'gb-007', 'gb-020',
  'n64-006', 'n64-007', 'n64-008',

  // Zelda games (wrong/shared covers)
  'nes-004', 'nes-005',
  'n64-002', 'n64-003',
  '3ds-001', '3ds-002',
  'gb-010', 'gb-012', 'gb-013',
  'gba-007',
  'gc-003', 'gc-004',
  'wii-005', 'wii-006',
  'wiiu-002', 'wiiu-003',
  'sw-012', 'sw-013', 'sw-014', 'sw-015',

  // Donkey Kong (5 games = 1 image)
  'snes-006', 'snes-007', 'snes-008',
  'gb-016', 'gb-019',
  'n64-011',
  'wii-013',
  '3ds-023',
  'sw-029',
  'wiiu-008',

  // Mario (cross-platform duplicates)
  'sw-019', 'wiiu-004',
  'sw-021', 'ds-011',
  'sw-022', 'wiiu-006',
  'sw-025',
  'n64-001',

  // Kirby (wrong matches)
  'nes-007', 'wii-016',
  'snes-013',
  '3ds-017', '3ds-018',
  'sw-037', 'sw-038',

  // Smash Bros (cross-platform)
  'n64-005', 'wiiu-005',
  'gc-001',
  '3ds-012',

  // Luigi's Mansion (wrong duplicates)
  'gc-011',
  '3ds-015', '3ds-016',
  'sw-034',

  // Splatoon
  'wiiu-007',
  'sw-041', 'sw-042',

  // Metroid (cross-platform)
  'gc-015', 'wii-017',

  // Pikmin
  'gc-017', 'wiiu-009',
  'sw-046', 'sw-047',

  // Bayonetta
  'wiiu-010', 'sw-051', 'sw-052',

  // Xenoblade
  'sw-048', 'sw-049', 'sw-050',

  // Other missing/wrong
  'sw-036', 'sw-058', 'sw-078', 'sw-079', 'sw-090', 'sw-097',
  'sw-106', 'sw-108', 'sw-109', 'sw-110', 'sw-113',
  'n64-009', 'n64-013',
  'ds-016',
  'gba-006',
]);

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`);
}

function curlJSON(url) {
  try {
    const safeUrl = url.replace(/'/g, '%27');
    const result = execSync(
      `curl -sL -H 'User-Agent: GameShopBot/2.0 (gameshopenter@gmail.com)' '${safeUrl}'`,
      { maxBuffer: 10 * 1024 * 1024, timeout: 15000 }
    ).toString();
    return JSON.parse(result);
  } catch (e) {
    return null;
  }
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

    const patterns = [
      /\|\s*image\s*=\s*([^\n|{}]+)/i,
      /\|\s*image_cover\s*=\s*([^\n|{}]+)/i,
      /\|\s*cover\s*=\s*([^\n|{}]+)/i,
      /\|\s*boxart\s*=\s*([^\n|{}]+)/i,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        let filename = match[1].trim();
        filename = filename.replace(/^\[\[(File|Image):/, '').replace(/\]\].*$/, '');
        filename = filename.replace(/\|.*$/, '').trim();
        filename = filename.replace(/^(File|Image):/i, '').trim();

        if (filename && !filename.includes('{') && filename.length > 3) {
          return filename;
        }
      }
    }
  }
  return null;
}

// For paired games: get ALL images from the article and pick the right one based on coverHint
function getArticleImages(articleTitle) {
  const encoded = encodeURIComponent(articleTitle.replace(/ /g, '_'));
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=images&imlimit=50&format=json`;

  const data = curlJSON(url);
  if (!data || !data.query) return [];

  const pages = data.query.pages;
  for (const pid of Object.keys(pages)) {
    if (pid === '-1') continue;
    const page = pages[pid];
    return (page.images || []).map(i => i.title.replace(/^File:/, ''));
  }
  return [];
}

function pickImageForVersion(images, coverHint, productName) {
  if (!coverHint || images.length === 0) return null;

  const hintLower = coverHint.toLowerCase().replace(/_/g, ' ');
  const excluded = ['star_full', 'star_half', 'star_empty', 'commons-logo', 'wikidata',
    'ambox', 'question_book', 'text-x', 'folder', 'padlock', 'crystal_clear',
    'red_pencil', 'nuvola', 'gnome', 'disambig', 'audio', 'speaker',
    'flag_of', 'map', 'location', 'wiki', 'icon', '.svg', 'edit-clear',
    'information_icon', 'magnify', 'yes_check', 'x_mark', 'increase', 'decrease',
    'steady', 'symbol_', 'wikiquote', 'template'];

  const candidates = images.filter(f => {
    const lower = f.toLowerCase();
    return !excluded.some(ex => lower.includes(ex));
  });

  // Score candidates based on hint match
  let bestScore = -1;
  let bestImage = null;

  for (const img of candidates) {
    const imgLower = img.toLowerCase().replace(/[_-]/g, ' ');
    let score = 0;

    // Must contain hint keyword
    if (imgLower.includes(hintLower)) score += 10;

    // Bonus for cover/box/art keywords
    if (imgLower.includes('cover')) score += 5;
    if (imgLower.includes('box')) score += 5;
    if (imgLower.includes('art')) score += 3;

    // Bonus for being an image file
    if (imgLower.endsWith('.png') || imgLower.endsWith('.jpg') || imgLower.endsWith('.jpeg')) score += 2;

    // Must have the hint to be selected
    if (score > bestScore && score >= 10) {
      bestScore = score;
      bestImage = img;
    }
  }

  return bestImage;
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
  // Get products that need fixing
  const productsToFix = products.filter(p => {
    const skuPrefix = p.sku.toLowerCase();
    return SLUGS_TO_FIX.has(skuPrefix) && !p.isConsole;
  });

  console.log(`Fixing cover art for ${productsToFix.length} products...\n`);

  let succeeded = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < productsToFix.length; i++) {
    const product = productsToFix[i];
    const mapping = ARTICLE_MAP[product.name];

    if (!mapping) {
      // No mapping, try using product name directly
      const imageFile = getInfoboxImage(product.name);
      if (imageFile) {
        const imageUrl = getImageUrl(imageFile);
        if (imageUrl) {
          const outputPath = path.join(IMAGES_DIR, `${product.slug}.webp`);
          const ok = await downloadAndProcess(imageUrl, outputPath);
          if (ok) {
            succeeded++;
            console.log(`[${i+1}/${productsToFix.length}] OK ${product.name} (direct)`);
            sleep(300);
            continue;
          }
        }
      }
      failed++;
      failures.push({ sku: product.sku, name: product.name, reason: 'No article mapping' });
      console.log(`[${i+1}/${productsToFix.length}] FAIL ${product.name} - no mapping`);
      sleep(300);
      continue;
    }

    const articleTitle = typeof mapping === 'string' ? mapping : mapping.article;
    const coverHint = typeof mapping === 'object' ? mapping.coverHint : null;

    let imageFilename = null;

    // For paired games with coverHint, search all article images
    if (coverHint) {
      const allImages = getArticleImages(articleTitle);
      imageFilename = pickImageForVersion(allImages, coverHint, product.name);

      if (!imageFilename) {
        // Fallback: try infobox image
        imageFilename = getInfoboxImage(articleTitle);
      }
    } else {
      // Single game: use infobox image
      imageFilename = getInfoboxImage(articleTitle);
    }

    if (!imageFilename) {
      failed++;
      failures.push({ sku: product.sku, name: product.name, reason: 'No image found in article' });
      console.log(`[${i+1}/${productsToFix.length}] FAIL ${product.name} - no image in article`);
      sleep(300);
      continue;
    }

    const imageUrl = getImageUrl(imageFilename);
    if (!imageUrl) {
      failed++;
      failures.push({ sku: product.sku, name: product.name, reason: `URL not found for: ${imageFilename}` });
      console.log(`[${i+1}/${productsToFix.length}] FAIL ${product.name} - no URL`);
      sleep(300);
      continue;
    }

    const outputPath = path.join(IMAGES_DIR, `${product.slug}.webp`);
    const ok = await downloadAndProcess(imageUrl, outputPath);

    if (ok) {
      succeeded++;
      console.log(`[${i+1}/${productsToFix.length}] OK ${product.name}${coverHint ? ` (${coverHint})` : ''}`);

      // Also copy to alternate slug if needed (pokmon -> pok-mon)
      if (product.slug.includes('pokmon')) {
        const altSlug = product.slug.replace(/pokmon/g, 'pok-mon');
        const altPath = path.join(IMAGES_DIR, `${altSlug}.webp`);
        try { fs.copyFileSync(outputPath, altPath); } catch {}
      }
    } else {
      failed++;
      failures.push({ sku: product.sku, name: product.name, reason: 'Download failed' });
      console.log(`[${i+1}/${productsToFix.length}] FAIL ${product.name} - download failed`);
    }

    sleep(400);
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log(`\nFailed items:`);
    for (const f of failures) {
      console.log(`  ${f.sku}: ${f.name} - ${f.reason}`);
    }
    fs.writeFileSync(
      path.join(process.cwd(), 'scripts/fix-cover-failures.json'),
      JSON.stringify(failures, null, 2)
    );
  }

  // Re-run convert-excel to update products.json
  console.log('\nUpdating products.json...');
  try {
    execSync('node scripts/convert-excel.js', { cwd: process.cwd(), stdio: 'inherit' });
    console.log('Done!');
  } catch (e) {
    console.error('Failed to update products.json');
  }
}

main().catch(console.error);
