#!/usr/bin/env node
/**
 * Comprehensive cover art downloader v2.
 * - Uses Wikipedia article images with strict scoring + blacklists
 * - Checks image dimensions via API before downloading
 * - Verifies output file size after download
 * - Has direct File: overrides for known problematic products
 * - Handles apostrophes correctly (double-quoted curl)
 * - Uses Commons search for consoles
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

function curlJson(url) {
  const cmd = `curl -sL --max-time 15 "${url}"`;
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 20000 });
    return JSON.parse(result);
  } catch (e) {
    return null;
  }
}

function curlBinary(url) {
  const cmd = `curl -sL --max-time 30 "${url}"`;
  return execSync(cmd, { maxBuffer: 50 * 1024 * 1024, timeout: 35000 });
}

// === BLACKLISTS ===
const FILENAME_BLACKLIST = [
  'blue ipod nano', 'ipod', 'nano.jpg',
  'commons-logo', 'wikipe', 'ojs_ui', 'wpvg', 'category',
  'question_book', 'ambox', 'edit-clear', 'text-x',
  'folder_hexagonal', 'disambig', 'wiktionary', 'wikiquote',
  'portal-puzzle', 'padlock', 'crystal_clear', 'nuvola',
];

// Stop words removed from article titles for keyword matching
const STOP_WORDS = new Set([
  'the', 'of', 'and', 'a', 'an', 'in', 'for', 'to', 'at',
  'video', 'game', 'games', 'edition', 'hd', 'deluxe', 'remastered',
  'nes', '1999', '2016', '2019', '2023', '1993', '1986', '1997',
]);

// Extract key identifying words from article title
function extractKeyWords(articleTitle) {
  return articleTitle
    .replace(/\(.*?\)/g, '') // remove parenthetical like "(video game)"
    .replace(/[''':!.,+&]/g, ' ')
    .replace(/é/g, 'e')
    .split(/[\s_-]+/)
    .map(w => w.toLowerCase().trim())
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
}

// === PRODUCT MAPPINGS ===
// Each product: { article, pick?, avoid?, directFiles?, commonsSearch? }
const PRODUCTS = {
  // === SWITCH GAMES ===
  'SW-001': { article: 'Pokémon Brilliant Diamond and Shining Pearl', pick: ['Brilliant_Diamond', 'Brilliant Diamond', 'Diamond'], avoid: ['Shining_Pearl', 'Pearl'] },
  'SW-002': { article: 'Pokémon Brilliant Diamond and Shining Pearl', pick: ['Shining_Pearl', 'Shining Pearl', 'Pearl'], avoid: ['Brilliant_Diamond', 'Diamond'] },
  'SW-003': { article: 'Pokémon Sword and Shield', pick: ['Sword'], avoid: ['Shield'] },
  'SW-004': { article: 'Pokémon Sword and Shield', pick: ['Shield'], avoid: ['Sword'] },
  'SW-005': { article: 'Pokémon Scarlet and Violet', pick: ['Scarlet'], avoid: ['Violet'] },
  'SW-006': { article: 'Pokémon Scarlet and Violet', pick: ['Violet'], avoid: ['Scarlet'] },
  'SW-007': { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", pick: ['Pikachu'], avoid: ['Eevee'] },
  'SW-008': { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", pick: ['Eevee'], avoid: ['Pikachu'] },
  'SW-009': { article: 'Pokémon Legends: Arceus' },
  'SW-010': { article: 'Pokémon Mystery Dungeon: Rescue Team DX' },
  'SW-011': { article: 'New Pokémon Snap' },
  'SW-012': { article: 'The Legend of Zelda: Breath of the Wild', pick: ['Switch', 'switch'] },
  'SW-013': { article: 'The Legend of Zelda: Tears of the Kingdom' },
  'SW-014': { article: "The Legend of Zelda: Link's Awakening (2019 video game)" },
  'SW-015': { article: 'The Legend of Zelda: Skyward Sword HD' },
  'SW-016': { article: 'Hyrule Warriors: Age of Calamity' },
  'SW-017': { article: 'Hyrule Warriors: Definitive Edition' },
  'SW-018': { article: 'Super Mario Odyssey' },
  'SW-019': { article: 'Mario Kart 8 Deluxe' },
  'SW-020': { article: 'Super Mario Bros. Wonder' },
  'SW-021': { article: 'New Super Mario Bros. U Deluxe' },
  'SW-022': { article: "Super Mario 3D World + Bowser's Fury" },
  'SW-023': { article: 'Super Mario 3D All-Stars' },
  'SW-024': { article: 'Super Mario Maker 2' },
  'SW-025': { article: 'Super Mario RPG (2023 video game)' },
  'SW-026': { article: 'Paper Mario: The Origami King' },
  'SW-027': { article: 'Mario + Rabbids Kingdom Battle' },
  'SW-028': { article: 'Mario + Rabbids Sparks of Hope' },
  'SW-029': { article: 'Mario Tennis Aces' },
  'SW-030': { article: 'Mario Golf: Super Rush' },
  'SW-031': { article: 'Mario Strikers: Battle League' },
  'SW-032': { article: 'Super Mario Party' },
  'SW-033': { article: 'Mario Party Superstars' },
  'SW-034': { article: "Luigi's Mansion 3" },
  'SW-035': { article: 'Super Smash Bros. Ultimate' },
  'SW-036': { article: 'Arms (video game)' },
  'SW-037': { article: 'Kirby and the Forgotten Land' },
  'SW-038': { article: 'Kirby Star Allies' },
  'SW-039': { article: "Kirby's Return to Dream Land Deluxe" },
  'SW-040': { article: 'Donkey Kong Country: Tropical Freeze', pick: ['Switch', 'switch', 'Deluxe'] },
  'SW-041': { article: 'Splatoon 2' },
  'SW-042': { article: 'Splatoon 3' },
  'SW-043': { article: 'Metroid Dread' },
  'SW-044': { article: 'Fire Emblem: Three Houses' },
  'SW-045': { article: 'Fire Emblem Engage' },
  'SW-046': { article: 'Pikmin 3 Deluxe' },
  'SW-047': { article: 'Pikmin 4' },
  'SW-048': { article: 'Xenoblade Chronicles: Definitive Edition' },
  'SW-049': { article: 'Xenoblade Chronicles 2' },
  'SW-050': { article: 'Xenoblade Chronicles 3' },
  'SW-051': { article: 'Bayonetta 2', pick: ['Switch', 'switch'] },
  'SW-052': { article: 'Bayonetta 3' },
  'SW-053': { article: 'Astral Chain' },
  'SW-054': { article: "Yoshi's Crafted World" },
  'SW-055': { article: 'Captain Toad: Treasure Tracker' },
  'SW-056': { article: 'Animal Crossing: New Horizons' },
  'SW-057': { article: 'Nintendo Switch Sports' },
  'SW-058': { article: 'Ring Fit Adventure' },
  'SW-059': { article: '1-2-Switch' },
  'SW-060': { article: 'Clubhouse Games: 51 Worldwide Classics' },
  'SW-061': { article: 'WarioWare: Get It Together!' },
  'SW-062': { article: 'Dragon Quest XI' },
  'SW-063': { article: 'Octopath Traveler' },
  'SW-064': { article: 'Octopath Traveler II' },
  'SW-065': { article: 'Triangle Strategy' },
  'SW-066': { article: 'Shin Megami Tensei V' },
  'SW-067': { article: 'Monster Hunter Rise' },
  'SW-068': { article: 'Dark Souls Remastered' },
  'SW-069': { article: 'The Witcher 3: Wild Hunt' },
  'SW-070': { article: 'The Elder Scrolls V: Skyrim' },
  'SW-071': { article: 'Hogwarts Legacy' },
  'SW-072': { article: 'Diablo III' },
  'SW-073': { article: 'Stardew Valley' },
  'SW-074': { article: 'Minecraft' },
  'SW-075': { article: 'Hades (video game)' },
  'SW-076': { article: 'Hollow Knight' },
  'SW-077': { article: 'Celeste (video game)' },
  'SW-078': { article: 'Cuphead' },
  'SW-079': { article: 'Undertale' },
  'SW-080': { article: 'Dead Cells' },
  'SW-081': { article: 'Ori and the Blind Forest' },
  'SW-082': { article: 'Ori and the Will of the Wisps' },
  'SW-083': { article: 'Crash Bandicoot N. Sane Trilogy' },
  'SW-084': { article: 'Spyro Reignited Trilogy' },
  'SW-085': { article: 'Sonic Frontiers' },
  'SW-086': { article: 'Rayman Legends' },
  'SW-087': { article: 'Doom (2016 video game)' },
  'SW-088': { article: 'Doom Eternal' },
  'SW-089': { article: 'Mortal Kombat 11' },
  'SW-090': { article: 'Dragon Ball FighterZ' },
  'SW-091': { article: 'Grand Theft Auto: The Trilogy – The Definitive Edition' },
  'SW-092': { article: 'Crash Team Racing Nitro-Fueled' },
  'SW-093': { article: 'Lego Star Wars: The Skywalker Saga' },
  'SW-094': { article: 'Lego Harry Potter: Years 1–4' },
  'SW-095': { article: 'Lego Marvel Super Heroes 2' },
  'SW-096': { article: 'Lego City Undercover' },
  'SW-097': { article: 'Overcooked! All You Can Eat' },
  'SW-098': { article: 'Just Dance 2023 Edition' },
  'SW-099': { article: 'Immortals Fenyx Rising' },
  'SW-100': { article: 'Rocket League' },
  'SW-101': { article: 'FIFA 18' },
  'SW-102': { article: 'Ni no Kuni: Wrath of the White Witch' },
  'SW-103': { article: 'Tales of Vesperia' },
  'SW-104': { article: 'Bravely Default II' },
  'SW-105': { article: 'Final Fantasy X/X-2 HD Remaster' },
  'SW-106': { article: 'Collection of Mana' },
  'SW-107': { article: 'Starlink: Battle for Atlas' },
  'SW-108': { article: 'Borderlands Legendary Collection' },
  'SW-109': { article: 'Naruto Shippuden: Ultimate Ninja Storm Trilogy' },
  'SW-110': { article: 'Cars 3: Driven to Win' },
  'SW-111': { article: 'Dragon Quest Builders 2' },
  'SW-112': { article: 'Mario & Sonic at the Olympic Games Tokyo 2020' },
  'SW-113': { article: 'Pikmin 1+2' },
  'SW-114': { article: 'Fire Emblem Warriors' },
  'SW-115': { article: 'Cadence of Hyrule' },

  // === 3DS GAMES ===
  '3DS-001': { article: "The Legend of Zelda: Majora's Mask 3D" },
  '3DS-002': { article: 'The Legend of Zelda: Ocarina of Time 3D' },
  '3DS-003': { article: 'The Legend of Zelda: A Link Between Worlds' },
  '3DS-004': { article: 'Pokémon X and Y', pick: ['X', 'PokemonXY', 'XY'], avoid: ['Y_box'] },
  '3DS-005': { article: 'Pokémon X and Y', pick: ['Y'], avoid: ['X_box'] },
  '3DS-006': { article: 'Pokémon Sun and Moon', pick: ['Sun'], avoid: ['Moon'] },
  '3DS-007': { article: 'Pokémon Sun and Moon', pick: ['Moon'], avoid: ['Sun'] },
  '3DS-008': { article: 'Pokémon Ultra Sun and Ultra Moon', pick: ['Ultra_Sun', 'Ultra Sun'], avoid: ['Ultra_Moon', 'Ultra Moon'] },
  '3DS-009': { article: 'Pokémon Ultra Sun and Ultra Moon', pick: ['Ultra_Moon', 'Ultra Moon'], avoid: ['Ultra_Sun', 'Ultra Sun'] },
  '3DS-010': { article: 'Pokémon Omega Ruby and Alpha Sapphire', pick: ['Alpha_Sapphire', 'Alpha Sapphire', 'Sapphire'], avoid: ['Omega_Ruby', 'Ruby'] },
  '3DS-011': { article: 'Pokémon Omega Ruby and Alpha Sapphire', pick: ['Omega_Ruby', 'Omega Ruby', 'Ruby'], avoid: ['Alpha_Sapphire', 'Sapphire'] },
  '3DS-012': { article: 'Super Mario 3D Land' },
  '3DS-013': { article: 'Mario Kart 7' },
  '3DS-014': { article: 'Super Smash Bros. for Nintendo 3DS and Wii U', pick: ['3DS', '3ds'] },
  '3DS-015': { article: 'Animal Crossing: New Leaf' },
  '3DS-016': { article: "Luigi's Mansion: Dark Moon" },
  '3DS-017': { article: 'Kirby: Triple Deluxe' },
  '3DS-018': { article: 'Fire Emblem Awakening' },
  '3DS-019': { article: 'Metroid: Samus Returns' },
  '3DS-020': { article: 'Detective Pikachu (video game)' },
  '3DS-021': { article: 'Kid Icarus: Uprising' },
  '3DS-022': { article: 'Star Fox 64 3D' },
  '3DS-023': { article: 'Donkey Kong Country Returns 3D' },
  '3DS-024': { article: 'Tomodachi Life' },
  '3DS-025': { article: 'New Super Mario Bros. 2' },

  // === DS GAMES ===
  'DS-001': { article: 'Pokémon Black and White', pick: ['Black'], avoid: ['White', 'White_'] },
  'DS-002': { article: 'Pokémon Black and White', pick: ['White'], avoid: ['Black', 'Black_'] },
  'DS-003': { article: 'Pokémon Black 2 and White 2', pick: ['Black_2', 'Black 2'], avoid: ['White_2', 'White 2'] },
  'DS-004': { article: 'Pokémon Black 2 and White 2', pick: ['White_2', 'White 2'], avoid: ['Black_2', 'Black 2'] },
  'DS-005': { article: 'Pokémon HeartGold and SoulSilver', pick: ['SoulSilver', 'Soul_Silver'], avoid: ['HeartGold', 'Heart_Gold'] },
  'DS-006': { article: 'Pokémon HeartGold and SoulSilver', pick: ['HeartGold', 'Heart_Gold'], avoid: ['SoulSilver', 'Soul_Silver'] },
  'DS-007': { article: 'Pokémon Platinum' },
  'DS-008': { article: 'Pokémon Diamond and Pearl', pick: ['Diamond'], avoid: ['Pearl'] },
  'DS-009': { article: 'Pokémon Diamond and Pearl', pick: ['Pearl'], avoid: ['Diamond'] },
  'DS-010': { article: 'Mario Kart DS' },
  'DS-011': { article: 'New Super Mario Bros.' },
  'DS-012': { article: 'Super Mario 64 DS' },
  'DS-013': { article: "Mario & Luigi: Bowser's Inside Story" },
  'DS-014': { article: 'The Legend of Zelda: Phantom Hourglass' },
  'DS-015': { article: 'The Legend of Zelda: Spirit Tracks' },
  'DS-016': { article: 'Professor Layton and the Curious Village' },
  'DS-017': { article: 'Animal Crossing: Wild World' },
  'DS-018': { article: 'Advance Wars: Dual Strike' },
  'DS-019': { article: 'Kirby Super Star Ultra' },
  'DS-020': { article: 'Castlevania: Dawn of Sorrow' },

  // === GAME BOY ===
  'GB-001': { article: 'Pokémon Red and Blue', pick: ['Red'], avoid: ['Blue'] },
  'GB-002': { article: 'Pokémon Red and Blue', pick: ['Blue'], avoid: ['Red'] },
  'GB-003': { article: 'Pokémon Yellow' },
  'GB-004': { article: 'Pokémon Gold and Silver', pick: ['Gold'], avoid: ['Silver'] },
  'GB-005': { article: 'Pokémon Gold and Silver', pick: ['Silver'], avoid: ['Gold'] },
  'GB-006': { article: 'Pokémon Crystal' },
  'GB-007': { article: 'Pokémon Pinball' },
  'GB-008': { article: 'Super Mario Land' },
  'GB-009': { article: 'Super Mario Land 2: 6 Golden Coins' },
  'GB-010': { article: "The Legend of Zelda: Link's Awakening" },
  'GB-011': { article: "The Legend of Zelda: Link's Awakening DX" },
  'GB-012': { article: 'The Legend of Zelda: Oracle of Ages' },
  'GB-013': { article: 'The Legend of Zelda: Oracle of Seasons' },
  'GB-014': { article: "Kirby's Dream Land" },
  'GB-015': { article: 'Tetris (Game Boy video game)' },
  'GB-016': { article: 'Donkey Kong (Game Boy)' },
  'GB-017': { article: 'Wario Land 3' },
  'GB-018': { article: 'DuckTales (video game)' },
  'GB-019': { article: 'Donkey Kong Country (Game Boy Color)' },
  'GB-020': { article: 'Pokémon Trading Card Game (video game)' },
  'GB-021': { article: 'Tom & Jerry (Game Boy)' },
  'GB-022': { article: 'The Blues Brothers (video game)' },
  'GB-023': { article: 'Super Hunchback' },
  'GB-024': { article: 'Mysterium (video game)' },
  'GB-025': { article: 'Metroid II: Return of Samus' },

  // === GBA ===
  'GBA-001': { article: 'Pokémon Ruby and Sapphire', pick: ['Ruby'], avoid: ['Sapphire'] },
  'GBA-002': { article: 'Pokémon Ruby and Sapphire', pick: ['Sapphire'], avoid: ['Ruby'] },
  'GBA-003': { article: 'Pokémon Emerald' },
  'GBA-004': { article: 'Pokémon FireRed and LeafGreen', pick: ['FireRed', 'Fire_Red', 'Fire Red'], avoid: ['LeafGreen', 'Leaf_Green', 'Leaf Green'] },
  'GBA-005': { article: 'Pokémon FireRed and LeafGreen', pick: ['LeafGreen', 'Leaf_Green', 'Leaf Green'], avoid: ['FireRed', 'Fire_Red', 'Fire Red'] },
  'GBA-006': { article: 'The Legend of Zelda: The Minish Cap' },
  'GBA-007': { article: 'The Legend of Zelda: A Link to the Past & Four Swords' },
  'GBA-008': { article: 'Mario Kart: Super Circuit' },
  'GBA-009': { article: 'Mario & Luigi: Superstar Saga' },
  'GBA-010': { article: 'Metroid Fusion' },
  'GBA-011': { article: 'Metroid: Zero Mission' },
  'GBA-012': { article: 'Golden Sun (video game)' },
  'GBA-013': { article: 'Golden Sun: The Lost Age' },
  'GBA-014': { article: 'Advance Wars' },
  'GBA-015': { article: 'Advance Wars 2: Black Hole Rising' },
  'GBA-016': { article: 'Fire Emblem: The Blazing Blade' },
  'GBA-017': { article: 'Fire Emblem: The Sacred Stones' },
  'GBA-018': { article: 'Castlevania: Aria of Sorrow' },
  'GBA-019': { article: 'Wario Land 4' },
  'GBA-020': { article: 'Kirby & the Amazing Mirror' },
  'GBA-021': { article: 'Final Fantasy Tactics Advance' },
  'GBA-022': { article: 'Harvest Moon: Friends of Mineral Town' },
  'GBA-023': { article: "Yoshi's Island: Super Mario Advance 3" },
  'GBA-024': { article: 'Sonic Advance' },
  'GBA-025': { article: 'Mega Man Battle Network (video game)' },

  // === GAMECUBE ===
  'GC-001': { article: 'Pokémon XD: Gale of Darkness' },
  'GC-002': { article: 'Pokémon Colosseum' },
  'GC-003': { article: 'The Legend of Zelda: The Wind Waker' },
  'GC-004': { article: 'The Legend of Zelda: Twilight Princess', pick: ['GameCube', 'gamecube', 'GCN', 'GC'] },
  'GC-005': { article: 'Super Smash Bros. Melee' },
  'GC-006': { article: 'Mario Kart: Double Dash' },
  'GC-007': { article: 'Super Mario Sunshine' },
  'GC-008': { article: "Luigi's Mansion" },
  'GC-009': { article: 'Paper Mario: The Thousand-Year Door' },
  'GC-010': { article: 'Mario Party 4' },
  'GC-011': { article: 'Mario Party 5' },
  'GC-012': { article: 'Mario Party 6' },
  'GC-013': { article: 'Mario Party 7' },
  'GC-014': { article: 'Fire Emblem: Path of Radiance' },
  'GC-015': { article: 'Metroid Prime (video game)' },
  'GC-016': { article: 'Metroid Prime 2: Echoes' },
  'GC-017': { article: 'Pikmin (video game)' },
  'GC-018': { article: 'Pikmin 2' },
  'GC-019': { article: 'F-Zero GX' },
  'GC-020': { article: 'Kirby Air Ride' },
  'GC-021': { article: 'Animal Crossing (video game)' },
  'GC-022': { article: 'Sonic Adventure 2' },
  'GC-023': { article: 'Resident Evil 4' },
  'GC-024': { article: "Eternal Darkness: Sanity's Requiem" },
  'GC-025': { article: 'Star Fox Adventures' },

  // === N64 ===
  'N64-001': { article: 'Super Mario 64' },
  'N64-002': { article: 'The Legend of Zelda: Ocarina of Time' },
  'N64-003': { article: "The Legend of Zelda: Majora's Mask" },
  'N64-004': { article: 'Mario Kart 64' },
  'N64-005': { article: 'Super Smash Bros. (video game)' },
  'N64-006': { article: 'Pokémon Stadium (1999 video game)' },
  'N64-007': { article: 'Pokémon Stadium 2' },
  'N64-008': { article: 'Pokémon Snap' },
  'N64-009': { article: 'GoldenEye 007 (1997 video game)' },
  'N64-010': { article: 'Donkey Kong 64' },
  'N64-011': { article: 'Banjo-Kazooie' },
  'N64-012': { article: 'Banjo-Tooie' },
  'N64-013': { article: "Conker's Bad Fur Day" },
  'N64-014': { article: 'Paper Mario (video game)' },
  'N64-015': { article: 'Mario Party (video game)' },
  'N64-016': { article: 'Mario Party 2' },
  'N64-017': { article: 'Mario Party 3' },
  'N64-018': { article: 'Diddy Kong Racing' },
  'N64-019': { article: 'Star Fox 64' },
  'N64-020': { article: 'Kirby 64: The Crystal Shards' },
  'N64-021': { article: 'F-Zero X' },
  'N64-022': { article: 'Perfect Dark' },
  'N64-023': { article: 'Wave Race 64' },
  'N64-024': { article: 'Harvest Moon 64' },
  'N64-025': { article: 'Goemon\'s Great Adventure' },

  // === SNES ===
  'SNES-001': { article: 'The Legend of Zelda: A Link to the Past' },
  'SNES-002': { article: 'Super Mario World' },
  'SNES-003': { article: 'Super Mario Kart' },
  'SNES-004': { article: 'Super Mario All-Stars' },
  'SNES-005': { article: "Super Mario World 2: Yoshi's Island" },
  'SNES-006': { article: 'Donkey Kong Country' },
  'SNES-007': { article: "Donkey Kong Country 2: Diddy's Kong Quest" },
  'SNES-008': { article: "Donkey Kong Country 3: Dixie Kong's Double Trouble!" },
  'SNES-009': { article: 'Super Metroid' },
  'SNES-010': { article: 'Street Fighter II Turbo: Hyper Fighting' },
  'SNES-011': { article: 'Mega Man X (video game)' },
  'SNES-012': { article: 'Super Castlevania IV' },
  'SNES-013': { article: 'Kirby Super Star' },
  'SNES-014': { article: 'F-Zero (video game)' },
  'SNES-015': { article: 'Star Fox (1993 video game)' },
  'SNES-016': { article: 'Teenage Mutant Ninja Turtles IV: Turtles in Time' },
  'SNES-017': { article: 'Contra III: The Alien Wars' },
  'SNES-018': { article: 'Terranigma' },
  'SNES-019': { article: 'Secret of Mana' },
  'SNES-020': { article: 'Chrono Trigger' },

  // === NES ===
  'NES-001': { article: 'Super Mario Bros.' },
  'NES-002': { article: 'Super Mario Bros. 2' },
  'NES-003': { article: 'Super Mario Bros. 3' },
  'NES-004': { article: 'The Legend of Zelda (video game)' },
  'NES-005': { article: 'Zelda II: The Adventure of Link' },
  'NES-006': { article: 'Metroid (video game)' },
  'NES-007': { article: "Kirby's Adventure" },
  'NES-008': { article: 'Mega Man 2' },
  'NES-009': { article: 'Castlevania (1986 video game)' },
  'NES-010': { article: 'Contra (video game)' },
  'NES-011': { article: 'Punch-Out!! (NES)' },
  'NES-012': { article: 'Duck Hunt' },
  'NES-013': { article: 'Tetris (NES video game)' },
  'NES-014': { article: 'Donkey Kong (video game)' },
  'NES-015': { article: 'Ninja Gaiden (NES video game)' },

  // === WII ===
  'WII-001': { article: 'Mario Kart Wii' },
  'WII-002': { article: 'Super Mario Galaxy' },
  'WII-003': { article: 'Super Mario Galaxy 2' },
  'WII-004': { article: 'New Super Mario Bros. Wii' },
  'WII-005': { article: 'The Legend of Zelda: Twilight Princess', pick: ['Wii', 'wii'] },
  'WII-006': { article: 'The Legend of Zelda: Skyward Sword' },
  'WII-007': { article: 'Super Smash Bros. Brawl' },
  'WII-008': { article: 'Wii Sports' },
  'WII-009': { article: 'Wii Sports Resort' },
  'WII-010': { article: 'Mario Party 8' },
  'WII-011': { article: 'Mario Party 9' },
  'WII-012': { article: "PokéPark Wii: Pikachu's Adventure" },
  'WII-013': { article: 'Donkey Kong Country Returns' },
  'WII-014': { article: 'Xenoblade Chronicles' },
  'WII-015': { article: 'Fire Emblem: Radiant Dawn' },
  'WII-016': { article: "Kirby's Return to Dream Land" },
  'WII-017': { article: 'Metroid Prime 3: Corruption' },
  'WII-018': { article: 'Metroid: Other M' },

  // === WII U ===
  'WIIU-001': { article: 'The Legend of Zelda: Breath of the Wild', pick: ['Wii_U', 'WiiU', 'Wii U'] },
  'WIIU-002': { article: 'The Legend of Zelda: The Wind Waker HD' },
  'WIIU-003': { article: 'The Legend of Zelda: Twilight Princess HD' },
  'WIIU-004': { article: 'Mario Kart 8' },
  'WIIU-005': { article: 'Super Smash Bros. for Nintendo 3DS and Wii U', pick: ['Wii_U', 'WiiU', 'Wii U'] },
  'WIIU-006': { article: 'Super Mario 3D World' },
  'WIIU-007': { article: 'Splatoon' },
  'WIIU-008': { article: 'Donkey Kong Country: Tropical Freeze', pick: ['Wii_U', 'WiiU', 'Wii U'] },
  'WIIU-009': { article: 'Pikmin 3' },
  'WIIU-010': { article: 'Bayonetta 2', pick: ['Wii_U', 'WiiU', 'Wii U'] },
  'WIIU-011': { article: 'Xenoblade Chronicles X' },
  'WIIU-012': { article: "Yoshi's Woolly World" },

  // === CONSOLES ===
  'CON-001': { commonsSearch: 'Nintendo Switch OLED white', pick: ['white', 'White'], avoid: ['neon', 'Neon', 'Zelda', 'Splatoon', 'red', 'blue'] },
  'CON-002': { commonsSearch: 'Nintendo Switch OLED neon', pick: ['neon', 'Neon', 'red', 'blue'], avoid: ['white', 'White', 'Zelda', 'Splatoon'] },
  'CON-003': { commonsSearch: 'Nintendo Switch console grey', pick: ['grey', 'Gray', 'gray'], avoid: ['neon', 'OLED', 'Lite'] },
  'CON-004': { commonsSearch: 'Nintendo Switch console neon', pick: ['neon', 'Neon', 'Red_Blue', 'red blue'], avoid: ['grey', 'Gray', 'OLED', 'Lite'] },
  'CON-005': { commonsSearch: 'Nintendo Switch Lite yellow', pick: ['yellow', 'Yellow'] },
  'CON-006': { commonsSearch: 'Nintendo Switch Lite turquoise', pick: ['turquoise', 'Turquoise', 'teal'] },
  'CON-007': { commonsSearch: 'Nintendo Switch Lite gray grey', pick: ['gray', 'grey', 'Gray', 'Grey'] },
  'CON-008': { commonsSearch: 'New Nintendo 2DS XL', pick: ['2DS', '2ds'] },
  'CON-009': { commonsSearch: 'New Nintendo 3DS XL', pick: ['3DS', '3ds', 'New'] },
  'CON-010': { commonsSearch: 'Nintendo DS Lite console', pick: ['DS_Lite', 'DS Lite', 'DSLite'] },
  'CON-011': { commonsSearch: 'Nintendo DSi console', pick: ['DSi'] },
  'CON-012': { commonsSearch: 'Game Boy Advance SP', pick: ['Advance_SP', 'SP', 'AGS'] },
  'CON-013': { commonsSearch: 'Game Boy Color console', directFiles: ['File:Nintendo-Game-Boy-Color-FL.jpg', 'File:Game-Boy-Color-Purple.jpg'] },
  'CON-014': { commonsSearch: 'Game Boy original console', directFiles: ['File:Game-Boy-FL.jpg', 'File:Nintendo-Game-Boy-FL.jpg'] },
  'CON-015': { commonsSearch: 'Nintendo GameCube black', directFiles: ['File:GameCube-Console-Set.png', 'File:Nintendo-GameCube-Console-FL.jpg'] },
  'CON-016': { commonsSearch: 'Nintendo GameCube purple indigo', directFiles: ['File:GameCube-Set.jpg', 'File:Gamecube-console.png'] },
  'CON-017': { commonsSearch: 'Nintendo 64 console grey', directFiles: ['File:N64-Console-Set.png', 'File:Nintendo-64-wController-L.jpg'] },
  'CON-018': { commonsSearch: 'Super Nintendo SNES console PAL', directFiles: ['File:PAL-SNES.png', 'File:Nintendo-Super-NES-Console-FL.jpg'] },
  'CON-019': { commonsSearch: 'Nintendo Entertainment System NES', directFiles: ['File:NES-Console-Set.png', 'File:NES-Console-Set.jpg'] },
  'CON-020': { commonsSearch: 'Nintendo Wii white console', directFiles: ['File:Wii-console.jpg', 'File:Wii console.png'] },
  'CON-021': { commonsSearch: 'Nintendo Wii U console', directFiles: ['File:Wii U Console and Gamepad.png', 'File:WiiU-console-and-gamepad.jpg'] },
};

// === SCORING FUNCTION ===
// Uses game-name matching: image MUST relate to the game to be considered
function scoreImage(filename, articleTitle, pick = [], avoid = []) {
  const fn = filename.toLowerCase().replace('file:', '');

  // Absolute blacklist
  for (const bl of FILENAME_BLACKLIST) {
    if (fn.includes(bl)) return -9999;
  }
  if (fn.endsWith('.svg')) return -9999;

  // Start at -100: image needs positive signals to be considered
  let score = -100;

  // === GAME NAME MATCHING (primary scoring) ===
  const keywords = extractKeyWords(articleTitle);
  // Also try camelCase/concatenated matching
  const fnNorm = fn.replace(/[_\-\s.]/g, '').replace(/é/g, 'e');
  const concatTitle = keywords.join('');

  let matchedWords = 0;
  for (const kw of keywords) {
    if (fn.includes(kw) || fnNorm.includes(kw)) matchedWords++;
  }

  // Score based on fraction of keywords matched
  if (keywords.length > 0) {
    const matchRatio = matchedWords / keywords.length;
    if (matchRatio >= 0.8) score += 200;      // Almost complete match
    else if (matchRatio >= 0.5) score += 150;  // Good match
    else if (matchRatio >= 0.3) score += 80;   // Partial match
    else if (matchedWords >= 2) score += 60;   // At least 2 words
    // 0-1 words: no bonus, stays at -100
  }

  // CamelCase/concat match bonus (e.g. "SuperMarioGalaxy.jpg" matches "super mario galaxy")
  if (fnNorm.includes(concatTitle) && concatTitle.length >= 6) score += 50;

  // === COVER ART KEYWORDS ===
  if (fn.includes('cover')) score += 150;
  if (fn.includes('boxart') || fn.includes('box_art') || fn.includes('box art')) score += 150;
  if (fn.includes('box') && !fn.includes('xbox')) score += 80;
  if (fn.includes('case')) score += 60;
  if (fn.includes('front')) score += 40;
  if (fn.includes('pack')) score += 30;

  // Regional preference
  if (fn.includes('pal') || fn.includes('europe')) score += 30;

  // === PENALTIES ===
  // Gameplay/screenshot terms
  const gameplayTerms = [
    'gameplay', 'screenshot', 'paraglide', 'mouthful', 'spirit',
    'on route', 'route 1', 'battle', 'raid', 'camp',
    'trainer', 'feature', 'nightime',
  ];
  for (const t of gameplayTerms) {
    if (fn.includes(t)) score -= 200;
  }

  // Event/venue/person terms
  const eventTerms = [
    'e3', 'gdc', 'pax', 'booth', 'expo', 'launch party',
    'comic', 'barcelona', 'convention', 'conference',
    'taipei', 'wirforce', 'espai videojocs',
    'fujifilm', 'instax', 'pre-release', 'pre release',
    'trial play',
  ];
  for (const t of eventTerms) {
    if (fn.includes(t)) score -= 300;
  }

  // Person names
  const personTerms = [
    'shigeru', 'miyamoto', 'koizumi', 'masuda', 'ohmori', 'konno',
    'tanabe', 'iwata', 'reggie', 'fils-aime', 'aonuma', 'sakurai',
    'ed sheeran', 'yoasobi', 'hideki', 'koji kondo', 'kensuke',
    'yoshiaki', 'tezuka', 'takashi',
  ];
  for (const name of personTerms) {
    if (fn.includes(name)) score -= 400;
  }

  // Technical/meta terms
  const techTerms = [
    'logo', 'icon', 'sprite', 'symbol', 'banner', 'map',
    'camera', 'hokkaidomap', 'paldea', 'region',
    'ds-lite', 'wii-wheel', 'poke-walker', 'eon ticket',
    'ehon', 'momotar', 'ec1835', 'brooklyn', 'manhattan',
    'españa', 'portugal', 'johto', 'nighttime',
  ];
  for (const t of techTerms) {
    if (fn.includes(t)) score -= 100;
  }

  // Flickr-style numbered photos
  if (/\(\d{5,}\)/.test(fn)) score -= 300;

  // === PICK/AVOID for paired games ===
  let hasPick = false, hasAvoid = false;
  for (const t of pick) {
    if (fn.includes(t.toLowerCase())) { score += 50; hasPick = true; }
  }
  for (const t of avoid) {
    if (fn.includes(t.toLowerCase())) { score -= 30; hasAvoid = true; }
  }
  if (hasPick && !hasAvoid) score += 80;

  return score;
}

// Get image info from Wikipedia (dimensions, URL, size)
function getImageInfo(fileTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const data = curlJson(url);
  if (!data) return null;
  const pages = Object.values(data.query.pages);
  return pages[0]?.imageinfo?.[0] || null;
}

// Get image info from Commons
function getCommonsImageInfo(fileTitle) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const data = curlJson(url);
  if (!data) return null;
  const pages = Object.values(data.query.pages);
  return pages[0]?.imageinfo?.[0] || null;
}

// Get article images from Wikipedia
function getArticleImages(article) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article)}&prop=images&imlimit=50&format=json`;
  const data = curlJson(url);
  if (!data) return [];
  const pages = Object.values(data.query.pages);
  return (pages[0]?.images || []).map(img => img.title).filter(t => {
    const l = t.toLowerCase();
    return l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.png') || l.endsWith('.webp');
  });
}

// Search Commons for console images
function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=15&format=json`;
  const data = curlJson(url);
  if (!data) return [];
  return (data.query?.search || []).map(s => s.title).filter(t => {
    const l = t.toLowerCase();
    return (l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.png') || l.endsWith('.webp')) && !l.endsWith('.svg');
  });
}

async function downloadCover(sku, config, slugs) {
  const pick = config.pick || [];
  const avoid = config.avoid || [];

  // Strategy 1: Direct file lookup
  if (config.directFiles) {
    for (const fileTitle of config.directFiles) {
      const info = getCommonsImageInfo(fileTitle) || getImageInfo(fileTitle);
      if (info && info.mime !== 'image/svg+xml' && info.width >= 100 && info.height >= 100) {
        try {
          const buffer = curlBinary(info.url);
          const outputPath = path.join(PRODUCTS_DIR, `${slugs[0]}.webp`);
          await sharp(buffer)
            .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .webp({ quality: 85 })
            .toFile(outputPath);

          const stat = fs.statSync(outputPath);
          if (stat.size > 10000) {
            for (let i = 1; i < slugs.length; i++) {
              fs.copyFileSync(outputPath, path.join(PRODUCTS_DIR, `${slugs[i]}.webp`));
            }
            return { ok: true, file: fileTitle, method: 'direct' };
          }
        } catch(e) { /* try next */ }
      }
    }
  }

  // Strategy 2: Article images with smart scoring
  if (config.article) {
    const images = getArticleImages(config.article);
    if (images.length > 0) {
      // Score and sort - require positive score (image must relate to the game)
      const scored = images
        .map(img => ({ filename: img, score: scoreImage(img, config.article, pick, avoid) }))
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score);

      // Try top candidates
      for (const candidate of scored.slice(0, 8)) {
        try {
          const info = getImageInfo(candidate.filename);
          if (!info) continue;
          if (info.mime === 'image/svg+xml') continue;
          if (info.width < 150 || info.height < 150) continue;
          // Prefer images that aren't too tiny (likely icons)
          if (info.width < 200 && info.height < 200 && info.size < 5000) continue;

          const buffer = curlBinary(info.url);
          const outputPath = path.join(PRODUCTS_DIR, `${slugs[0]}.webp`);
          await sharp(buffer)
            .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .webp({ quality: 85 })
            .toFile(outputPath);

          const stat = fs.statSync(outputPath);
          if (stat.size > 10000) {
            for (let i = 1; i < slugs.length; i++) {
              fs.copyFileSync(outputPath, path.join(PRODUCTS_DIR, `${slugs[i]}.webp`));
            }
            return { ok: true, file: candidate.filename, method: 'article', score: candidate.score };
          }
          // If file too small, try next candidate
        } catch(e) { /* try next */ }
      }
    }
  }

  // Strategy 3: Commons search (mainly for consoles)
  if (config.commonsSearch) {
    const files = searchCommons(config.commonsSearch);
    if (files.length > 0) {
      const scored = files
        .map(img => ({ filename: img, score: scoreImage(img, config.commonsSearch || '', pick, avoid) }))
        .sort((a, b) => b.score - a.score);

      for (const candidate of scored.slice(0, 5)) {
        try {
          const info = getCommonsImageInfo(candidate.filename);
          if (!info) continue;
          if (info.mime === 'image/svg+xml') continue;
          if (info.width < 100 || info.height < 100) continue;

          const buffer = curlBinary(info.url);
          const outputPath = path.join(PRODUCTS_DIR, `${slugs[0]}.webp`);
          await sharp(buffer)
            .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .webp({ quality: 85 })
            .toFile(outputPath);

          const stat = fs.statSync(outputPath);
          if (stat.size > 10000) {
            for (let i = 1; i < slugs.length; i++) {
              fs.copyFileSync(outputPath, path.join(PRODUCTS_DIR, `${slugs[i]}.webp`));
            }
            return { ok: true, file: candidate.filename, method: 'commons' };
          }
        } catch(e) { /* try next */ }
      }
    }
  }

  return { ok: false };
}

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf8'));
  const skus = Object.keys(PRODUCTS);
  console.log(`Processing ${skus.length} products...`);

  let success = 0, failed = 0, skipped = 0;
  const failures = [];
  const successes = [];

  for (const sku of skus) {
    const config = PRODUCTS[sku];
    const prod = products.find(p => p.sku === sku);
    if (!prod) {
      console.log(`[${sku}] Product not found in products.json, skipping`);
      skipped++;
      continue;
    }

    // Get all slugs for this product (handles pokmon/pok-mon duality)
    const slugs = [prod.slug];
    const altSlug = prod.slug.replace(/pokmon/g, 'pok-mon');
    if (altSlug !== prod.slug) slugs.push(altSlug);

    process.stdout.write(`[${sku}] ${prod.name}... `);

    try {
      const result = await downloadCover(sku, config, slugs);
      if (result.ok) {
        console.log(`OK (${result.method}: ${(result.file || '').replace('File:', '').slice(0, 50)})`);
        success++;
        successes.push({ sku, name: prod.name, file: result.file, method: result.method });
      } else {
        console.log('FAIL: No suitable image found');
        failed++;
        failures.push({ sku, name: prod.name, error: 'No suitable image found' });
      }
    } catch (error) {
      console.log(`FAIL: ${error.message}`);
      failed++;
      failures.push({ sku, name: prod.name, error: error.message });
    }

    await delay(150);
  }

  console.log(`\n=== Results: ${success} OK, ${failed} FAILED, ${skipped} SKIPPED out of ${skus.length} ===`);

  if (failures.length > 0) {
    console.log('\nFailed products:');
    failures.forEach(f => console.log(`  ${f.sku}: ${f.name} - ${f.error}`));
  }

  // Save failures for reference
  fs.writeFileSync(
    path.join(__dirname, 'cover-fix-v2-failures.json'),
    JSON.stringify(failures, null, 2)
  );

  // === VERIFICATION PASS ===
  console.log('\n=== VERIFICATION PASS ===');
  const crypto = await import('crypto');
  const imgDir = PRODUCTS_DIR;
  const allFiles = fs.readdirSync(imgDir).filter(f => f.endsWith('.webp'));

  // Check for tiny files
  const tiny = allFiles.filter(f => {
    const stat = fs.statSync(path.join(imgDir, f));
    return stat.size < 10000;
  });
  console.log(`Tiny files (<10KB): ${tiny.length}`);
  tiny.forEach(f => {
    const stat = fs.statSync(path.join(imgDir, f));
    console.log(`  ${stat.size}B  ${f}`);
  });

  // Check for duplicates across different SKUs
  const hashMap = {};
  allFiles.forEach(f => {
    const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(imgDir, f))).digest('hex');
    const sku = f.match(/^([a-z]+-\d+)/)?.[1];
    if (!hashMap[hash]) hashMap[hash] = [];
    hashMap[hash].push({ file: f, sku });
  });

  const dupeGroups = Object.values(hashMap).filter(group => {
    const uniqueSkus = [...new Set(group.map(g => g.sku))];
    return uniqueSkus.length > 1;
  });

  console.log(`\nDuplicate groups (different SKUs sharing same image): ${dupeGroups.length}`);
  dupeGroups.forEach(group => {
    const uniqueSkus = [...new Set(group.map(g => g.sku))];
    console.log(`  ${uniqueSkus.join(', ')}: ${group[0].file.slice(0, 60)}`);
  });
}

main().catch(console.error);
