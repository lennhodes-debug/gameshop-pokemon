#!/usr/bin/env node
/**
 * Comprehensive cover art fix - uses curl (Node.js DNS broken in this env).
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
  const result = execSync(`curl -sL --max-time 15 '${url}'`, { encoding: 'utf8', timeout: 20000 });
  return JSON.parse(result);
}

function curlBinary(url) {
  return execSync(`curl -sL --max-time 30 '${url}'`, { maxBuffer: 50 * 1024 * 1024, timeout: 35000 });
}

const FIXES = {
  'SW-001': { article: 'Pokémon Brilliant Diamond and Shining Pearl', pick: ['Brilliant_Diamond', 'Brilliant'], avoid: ['Shining_Pearl', 'Shining'] },
  'SW-002': { article: 'Pokémon Brilliant Diamond and Shining Pearl', pick: ['Shining_Pearl', 'Shining'], avoid: ['Brilliant_Diamond', 'Brilliant'] },
  'SW-003': { article: 'Pokémon Sword and Shield', pick: ['Sword'], avoid: ['Shield'] },
  'SW-004': { article: 'Pokémon Sword and Shield', pick: ['Shield'], avoid: ['Sword'] },
  'SW-005': { article: 'Pokémon Scarlet and Violet', pick: ['Scarlet'], avoid: ['Violet'] },
  'SW-006': { article: 'Pokémon Scarlet and Violet', pick: ['Violet'], avoid: ['Scarlet'] },
  'SW-007': { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", pick: ['Pikachu'], avoid: ['Eevee'] },
  'SW-008': { article: "Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", pick: ['Eevee'], avoid: ['Pikachu'] },
  'SW-009': { article: 'Pokémon Legends: Arceus' },
  'SW-010': { article: 'Pokémon Mystery Dungeon: Rescue Team DX' },
  'SW-011': { article: 'New Pokémon Snap' },
  '3DS-004': { article: 'Pokémon X and Y', pick: ['Pokémon_X', 'Pokemon_X', '_X_'], avoid: ['Pokémon_Y', 'Pokemon_Y', '_Y_'] },
  '3DS-005': { article: 'Pokémon X and Y', pick: ['Pokémon_Y', 'Pokemon_Y', '_Y_'], avoid: ['Pokémon_X', 'Pokemon_X', '_X_'] },
  '3DS-006': { article: 'Pokémon Sun and Moon', pick: ['Sun'], avoid: ['Moon', 'Ultra'] },
  '3DS-007': { article: 'Pokémon Sun and Moon', pick: ['Moon'], avoid: ['Sun', 'Ultra'] },
  '3DS-008': { article: 'Pokémon Ultra Sun and Ultra Moon', pick: ['Ultra_Sun', 'Ultra.Sun'], avoid: ['Ultra_Moon', 'Ultra.Moon'] },
  '3DS-009': { article: 'Pokémon Ultra Sun and Ultra Moon', pick: ['Ultra_Moon', 'Ultra.Moon'], avoid: ['Ultra_Sun', 'Ultra.Sun'] },
  '3DS-010': { article: 'Pokémon Omega Ruby and Alpha Sapphire', pick: ['Alpha_Sapphire', 'Alpha.Sapphire'], avoid: ['Omega_Ruby', 'Omega.Ruby'] },
  '3DS-011': { article: 'Pokémon Omega Ruby and Alpha Sapphire', pick: ['Omega_Ruby', 'Omega.Ruby'], avoid: ['Alpha_Sapphire', 'Alpha.Sapphire'] },
  'DS-001': { article: 'Pokémon Black and White', pick: ['Black'], avoid: ['White', 'Black_2'] },
  'DS-002': { article: 'Pokémon Black and White', pick: ['White'], avoid: ['Black', 'White_2'] },
  'DS-003': { article: 'Pokémon Black 2 and White 2', pick: ['Black_2', 'Black.2'], avoid: ['White_2', 'White.2'] },
  'DS-004': { article: 'Pokémon Black 2 and White 2', pick: ['White_2', 'White.2'], avoid: ['Black_2', 'Black.2'] },
  'DS-005': { article: 'Pokémon HeartGold and SoulSilver', pick: ['SoulSilver', 'Soul_Silver'], avoid: ['HeartGold', 'Heart_Gold'] },
  'DS-006': { article: 'Pokémon HeartGold and SoulSilver', pick: ['HeartGold', 'Heart_Gold'], avoid: ['SoulSilver', 'Soul_Silver'] },
  'DS-007': { article: 'Pokémon Platinum' },
  'DS-008': { article: 'Pokémon Diamond and Pearl', pick: ['Diamond'], avoid: ['Pearl'] },
  'DS-009': { article: 'Pokémon Diamond and Pearl', pick: ['Pearl'], avoid: ['Diamond'] },
  'GB-001': { article: 'Pokémon Red, Blue, and Yellow', pick: ['Red'], avoid: ['Blue', 'Yellow', 'Green'] },
  'GB-002': { article: 'Pokémon Red, Blue, and Yellow', pick: ['Blue'], avoid: ['Red', 'Yellow', 'Green'] },
  'GB-003': { article: 'Pokémon Yellow' },
  'GB-004': { article: 'Pokémon Gold and Silver', pick: ['Gold'], avoid: ['Silver'] },
  'GB-005': { article: 'Pokémon Gold and Silver', pick: ['Silver'], avoid: ['Gold'] },
  'GB-006': { article: 'Pokémon Crystal' },
  'GB-007': { article: 'Pokémon Pinball' },
  'GB-020': { article: 'Pokémon Trading Card Game (video game)' },
  'GBA-001': { article: 'Pokémon Ruby and Sapphire', pick: ['Ruby'], avoid: ['Sapphire'] },
  'GBA-002': { article: 'Pokémon Ruby and Sapphire', pick: ['Sapphire'], avoid: ['Ruby'] },
  'GBA-003': { article: 'Pokémon Emerald' },
  'GBA-004': { article: 'Pokémon FireRed and LeafGreen', pick: ['FireRed', 'Fire_Red'], avoid: ['LeafGreen', 'Leaf_Green'] },
  'GBA-005': { article: 'Pokémon FireRed and LeafGreen', pick: ['LeafGreen', 'Leaf_Green'], avoid: ['FireRed', 'Fire_Red'] },
  'N64-006': { article: 'Pokémon Stadium (1999 video game)' },
  'N64-007': { article: 'Pokémon Stadium 2' },
  'N64-008': { article: 'Pokémon Snap' },
  'GC-001': { article: 'Pokémon XD: Gale of Darkness' },
  'GC-002': { article: 'Pokémon Colosseum' },
  'WII-012': { article: "PokéPark Wii: Pikachu's Adventure" },
  'SW-012': { article: 'The Legend of Zelda: Breath of the Wild', pick: ['Switch', 'cover', 'box'], avoid: ['Wii_U'] },
  'SW-013': { article: 'The Legend of Zelda: Tears of the Kingdom' },
  'SW-014': { article: "The Legend of Zelda: Link's Awakening (2019 video game)" },
  'SW-015': { article: 'The Legend of Zelda: Skyward Sword HD' },
  'SW-016': { article: 'Hyrule Warriors: Age of Calamity' },
  'SW-017': { article: 'Hyrule Warriors: Definitive Edition' },
  'SW-115': { article: 'Cadence of Hyrule' },
  'WIIU-001': { article: 'The Legend of Zelda: Breath of the Wild', pick: ['Wii_U', 'WiiU'], avoid: ['Switch'] },
  'WIIU-002': { article: 'The Legend of Zelda: The Wind Waker HD' },
  'WIIU-003': { article: 'The Legend of Zelda: Twilight Princess HD' },
  'GB-010': { article: "The Legend of Zelda: Link's Awakening" },
  'GB-011': { article: "The Legend of Zelda: Link's Awakening DX" },
  'GB-012': { article: 'The Legend of Zelda: Oracle of Ages' },
  'GB-013': { article: 'The Legend of Zelda: Oracle of Seasons' },
  'GBA-006': { article: 'The Legend of Zelda: The Minish Cap' },
  'GBA-007': { article: 'The Legend of Zelda: A Link to the Past & Four Swords' },
  'GC-003': { article: 'The Legend of Zelda: The Wind Waker' },
  'GC-004': { article: 'The Legend of Zelda: Twilight Princess', pick: ['GameCube', 'GCN'], avoid: ['Wii', 'HD'] },
  'WII-005': { article: 'The Legend of Zelda: Twilight Princess', pick: ['Wii'], avoid: ['GameCube', 'GCN', 'HD'] },
  'WII-006': { article: 'The Legend of Zelda: Skyward Sword' },
  'N64-002': { article: 'The Legend of Zelda: Ocarina of Time' },
  'N64-003': { article: "The Legend of Zelda: Majora's Mask" },
  'DS-014': { article: 'The Legend of Zelda: Phantom Hourglass' },
  'DS-015': { article: 'The Legend of Zelda: Spirit Tracks' },
  'NES-004': { article: 'The Legend of Zelda (video game)' },
  'NES-005': { article: 'Zelda II: The Adventure of Link' },
  'SNES-001': { article: 'The Legend of Zelda: A Link to the Past' },
  '3DS-001': { article: "The Legend of Zelda: Majora's Mask 3D" },
  '3DS-002': { article: 'The Legend of Zelda: Ocarina of Time 3D' },
  '3DS-003': { article: 'The Legend of Zelda: A Link Between Worlds' },
  'SW-019': { article: 'Mario Kart 8 Deluxe' },
  'WIIU-004': { article: 'Mario Kart 8' },
  '3DS-013': { article: 'Mario Kart 7' },
  'DS-010': { article: 'Mario Kart DS' },
  'GC-006': { article: 'Mario Kart: Double Dash!!' },
  'GBA-008': { article: 'Mario Kart: Super Circuit' },
  'WII-001': { article: 'Mario Kart Wii' },
  'N64-004': { article: 'Mario Kart 64' },
  'SNES-003': { article: 'Super Mario Kart' },
  'SW-018': { article: 'Super Mario Odyssey' },
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
  'SW-112': { article: 'Mario & Sonic at the Olympic Games Tokyo 2020' },
  'WIIU-006': { article: 'Super Mario 3D World' },
  '3DS-012': { article: 'Super Mario 3D Land' },
  '3DS-025': { article: 'New Super Mario Bros. 2' },
  'DS-011': { article: 'New Super Mario Bros.' },
  'DS-012': { article: 'Super Mario 64 DS' },
  'DS-013': { article: "Mario & Luigi: Bowser's Inside Story" },
  'WII-002': { article: 'Super Mario Galaxy' },
  'WII-003': { article: 'Super Mario Galaxy 2' },
  'WII-004': { article: 'New Super Mario Bros. Wii' },
  'N64-001': { article: 'Super Mario 64' },
  'GC-007': { article: 'Super Mario Sunshine' },
  'GC-009': { article: 'Paper Mario: The Thousand-Year Door' },
  'N64-014': { article: 'Paper Mario (video game)' },
  'GB-008': { article: 'Super Mario Land' },
  'GB-009': { article: 'Super Mario Land 2: 6 Golden Coins' },
  'GBA-009': { article: 'Mario & Luigi: Superstar Saga' },
  'SNES-002': { article: 'Super Mario World' },
  'SNES-004': { article: 'Super Mario All-Stars' },
  'NES-001': { article: 'Super Mario Bros.' },
  'NES-002': { article: 'Super Mario Bros. 2' },
  'NES-003': { article: 'Super Mario Bros. 3' },
  'SW-040': { article: 'Donkey Kong Country: Tropical Freeze', pick: ['Switch', 'Nintendo_Switch'], avoid: ['Wii_U'] },
  'WIIU-008': { article: 'Donkey Kong Country: Tropical Freeze', pick: ['Wii_U', 'WiiU'], avoid: ['Switch'] },
  'SNES-006': { article: 'Donkey Kong Country' },
  'SNES-007': { article: "Donkey Kong Country 2: Diddy's Kong Quest" },
  'SNES-008': { article: "Donkey Kong Country 3: Dixie Kong's Double Trouble!" },
  'GB-019': { article: 'Donkey Kong Country (Game Boy Color)' },
  'GB-016': { article: 'Donkey Kong (Game Boy)' },
  'N64-010': { article: 'Donkey Kong 64' },
  'N64-018': { article: 'Diddy Kong Racing' },
  'NES-014': { article: 'Donkey Kong (video game)' },
  '3DS-023': { article: 'Donkey Kong Country Returns 3D' },
  'WII-013': { article: 'Donkey Kong Country Returns' },
  'SW-037': { article: 'Kirby and the Forgotten Land' },
  'SW-038': { article: 'Kirby Star Allies' },
  'SW-039': { article: "Kirby's Return to Dream Land Deluxe" },
  'WII-016': { article: "Kirby's Return to Dream Land" },
  '3DS-017': { article: 'Kirby: Triple Deluxe' },
  'DS-019': { article: 'Kirby Super Star Ultra' },
  'GBA-020': { article: 'Kirby & the Amazing Mirror' },
  'GB-014': { article: "Kirby's Dream Land" },
  'N64-020': { article: 'Kirby 64: The Crystal Shards' },
  'GC-020': { article: 'Kirby Air Ride' },
  'SNES-013': { article: 'Kirby Super Star' },
  'NES-007': { article: "Kirby's Adventure" },
  'SW-035': { article: 'Super Smash Bros. Ultimate' },
  'N64-005': { article: 'Super Smash Bros. (video game)' },
  'WIIU-005': { article: 'Super Smash Bros. for Nintendo 3DS and Wii U', pick: ['Wii_U', 'WiiU'], avoid: ['3DS'] },
  '3DS-014': { article: 'Super Smash Bros. for Nintendo 3DS and Wii U', pick: ['3DS'], avoid: ['Wii_U'] },
  'GC-005': { article: 'Super Smash Bros. Melee' },
  'WII-007': { article: 'Super Smash Bros. Brawl' },
  'SW-043': { article: 'Metroid Dread' },
  'GC-015': { article: 'Metroid Prime (video game)' },
  'GC-016': { article: 'Metroid Prime 2: Echoes' },
  'WII-017': { article: 'Metroid Prime 3: Corruption' },
  'WII-018': { article: 'Metroid: Other M' },
  '3DS-019': { article: 'Metroid: Samus Returns' },
  'GBA-010': { article: 'Metroid Fusion' },
  'GBA-011': { article: 'Metroid: Zero Mission' },
  'SNES-009': { article: 'Super Metroid' },
  'NES-006': { article: 'Metroid (video game)' },
  'GB-025': { article: 'Metroid II: Return of Samus' },
  'SW-044': { article: 'Fire Emblem: Three Houses' },
  'SW-045': { article: 'Fire Emblem Engage' },
  'SW-114': { article: 'Fire Emblem Warriors' },
  '3DS-018': { article: 'Fire Emblem Awakening' },
  'GC-014': { article: 'Fire Emblem: Path of Radiance' },
  'WII-015': { article: 'Fire Emblem: Radiant Dawn' },
  'GBA-016': { article: 'Fire Emblem: The Blazing Blade' },
  'GBA-017': { article: 'Fire Emblem: The Sacred Stones' },
  'SW-048': { article: 'Xenoblade Chronicles: Definitive Edition' },
  'SW-049': { article: 'Xenoblade Chronicles 2' },
  'SW-050': { article: 'Xenoblade Chronicles 3' },
  'WII-014': { article: 'Xenoblade Chronicles' },
  'WIIU-011': { article: 'Xenoblade Chronicles X' },
  'SW-051': { article: 'Bayonetta 2', pick: ['Switch', 'Nintendo_Switch'], avoid: ['Wii_U'] },
  'SW-052': { article: 'Bayonetta 3' },
  'WIIU-010': { article: 'Bayonetta 2', pick: ['Wii_U', 'WiiU'], avoid: ['Switch'] },
  'SW-046': { article: 'Pikmin 3 Deluxe' },
  'SW-047': { article: 'Pikmin 4' },
  'SW-113': { article: 'Pikmin 1 + 2' },
  'GC-017': { article: 'Pikmin (video game)' },
  'GC-018': { article: 'Pikmin 2' },
  'WIIU-009': { article: 'Pikmin 3' },
  'SW-041': { article: 'Splatoon 2' },
  'SW-042': { article: 'Splatoon 3' },
  'WIIU-007': { article: 'Splatoon (video game)' },
  'SW-036': { article: 'Arms (video game)' },
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
  'SW-094': { article: 'Lego Harry Potter: Collection' },
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
  '3DS-015': { article: 'Animal Crossing: New Leaf' },
  '3DS-016': { article: "Luigi's Mansion: Dark Moon" },
  '3DS-020': { article: 'Detective Pikachu (video game)' },
  '3DS-021': { article: 'Kid Icarus: Uprising' },
  '3DS-022': { article: 'Star Fox 64 3D' },
  '3DS-024': { article: 'Tomodachi Life' },
  'DS-016': { article: 'Professor Layton and the Curious Village' },
  'DS-017': { article: 'Animal Crossing: Wild World' },
  'DS-018': { article: 'Advance Wars: Dual Strike' },
  'DS-020': { article: 'Castlevania: Dawn of Sorrow' },
  'GBA-012': { article: 'Golden Sun (video game)' },
  'GBA-013': { article: 'Golden Sun: The Lost Age' },
  'GBA-014': { article: 'Advance Wars' },
  'GBA-015': { article: 'Advance Wars 2: Black Hole Rising' },
  'GBA-018': { article: 'Castlevania: Aria of Sorrow' },
  'GBA-019': { article: 'Wario Land 4' },
  'GBA-021': { article: 'Final Fantasy Tactics Advance' },
  'GBA-022': { article: 'Harvest Moon: Friends of Mineral Town' },
  'GBA-023': { article: "Yoshi's Island: Super Mario Advance 3" },
  'GBA-024': { article: 'Sonic Advance' },
  'GBA-025': { article: 'Mega Man Battle Network (video game)' },
  'GB-008': { article: 'Super Mario Land' },
  'GB-009': { article: 'Super Mario Land 2: 6 Golden Coins' },
  'GB-015': { article: 'Tetris (Game Boy video game)' },
  'GB-017': { article: 'Wario Land 3' },
  'GB-018': { article: 'DuckTales (video game)' },
  'GB-021': { article: 'Tom & Jerry (Game Boy)' },
  'GB-022': { article: 'The Blues Brothers (video game)' },
  'GB-023': { article: 'Super Hunchback' },
  'GB-024': { article: 'Mysterium (video game)' },
  'GC-008': { article: "Luigi's Mansion" },
  'GC-010': { article: 'Mario Party 4' },
  'GC-011': { article: 'Mario Party 5' },
  'GC-012': { article: 'Mario Party 6' },
  'GC-013': { article: 'Mario Party 7' },
  'GC-019': { article: 'F-Zero GX' },
  'GC-021': { article: 'Animal Crossing (video game)' },
  'GC-022': { article: 'Sonic Adventure 2' },
  'GC-023': { article: 'Resident Evil 4' },
  'GC-024': { article: 'Eternal Darkness' },
  'GC-025': { article: 'Star Fox Adventures' },
  'N64-009': { article: 'GoldenEye 007 (1997 video game)' },
  'N64-011': { article: 'Banjo-Kazooie' },
  'N64-012': { article: 'Banjo-Tooie' },
  'N64-013': { article: "Conker's Bad Fur Day" },
  'N64-015': { article: 'Mario Party (video game)' },
  'N64-016': { article: 'Mario Party 2' },
  'N64-017': { article: 'Mario Party 3' },
  'N64-019': { article: 'Star Fox 64' },
  'N64-021': { article: 'F-Zero X' },
  'N64-022': { article: 'Perfect Dark' },
  'N64-023': { article: 'Wave Race 64' },
  'N64-024': { article: 'Harvest Moon 64' },
  'N64-025': { article: 'Mystical Ninja Starring Goemon' },
  'SNES-005': { article: "Super Mario World 2: Yoshi's Island" },
  'SNES-010': { article: 'Street Fighter II Turbo: Hyper Fighting' },
  'SNES-011': { article: 'Mega Man X (video game)' },
  'SNES-012': { article: 'Super Castlevania IV' },
  'SNES-014': { article: 'F-Zero (video game)' },
  'SNES-015': { article: 'Star Fox (1993 video game)' },
  'SNES-016': { article: 'Teenage Mutant Ninja Turtles IV: Turtles in Time' },
  'SNES-017': { article: 'Contra III: The Alien Wars' },
  'SNES-018': { article: 'Terranigma' },
  'SNES-019': { article: 'Secret of Mana' },
  'SNES-020': { article: 'Chrono Trigger' },
  'NES-008': { article: 'Mega Man 2' },
  'NES-009': { article: 'Castlevania (1986 video game)' },
  'NES-010': { article: 'Contra (video game)' },
  'NES-011': { article: 'Punch-Out!! (NES)' },
  'NES-012': { article: 'Duck Hunt' },
  'NES-013': { article: 'Tetris (NES video game)' },
  'NES-015': { article: 'Ninja Gaiden (NES video game)' },
  'WII-008': { article: 'Wii Sports' },
  'WII-009': { article: 'Wii Sports Resort' },
  'WII-010': { article: 'Mario Party 8' },
  'WII-011': { article: 'Mario Party 9' },
  'WIIU-012': { article: "Yoshi's Woolly World" },
  'CON-001': { article: 'Nintendo Switch (OLED model)', pick: ['White', 'white'] },
  'CON-002': { article: 'Nintendo Switch (OLED model)', pick: ['Neon', 'neon', 'Red_Blue'] },
  'CON-003': { article: 'Nintendo Switch', pick: ['Grey', 'gray', 'console'], avoid: ['Lite', 'OLED', 'logo'] },
  'CON-004': { article: 'Nintendo Switch', pick: ['Neon', 'neon', 'red', 'blue'], avoid: ['Lite', 'OLED', 'logo'] },
  'CON-005': { article: 'Nintendo Switch Lite', pick: ['Yellow', 'yellow'] },
  'CON-006': { article: 'Nintendo Switch Lite', pick: ['Turquoise', 'turquoise', 'teal'] },
  'CON-007': { article: 'Nintendo Switch Lite', pick: ['Gray', 'gray', 'Grey', 'grey'] },
  'CON-008': { article: 'New Nintendo 2DS XL' },
  'CON-009': { article: 'New Nintendo 3DS' },
  'CON-010': { article: 'Nintendo DS Lite' },
  'CON-011': { article: 'Nintendo DSi' },
  'CON-012': { article: 'Game Boy Advance SP' },
  'CON-013': { article: 'Game Boy Color' },
  'CON-014': { article: 'Game Boy' },
  'CON-015': { article: 'GameCube', pick: ['Black', 'black', 'Jet'] },
  'CON-016': { article: 'GameCube', pick: ['Indigo', 'indigo'] },
  'CON-017': { article: 'Nintendo 64' },
  'CON-018': { article: 'Super Nintendo Entertainment System' },
  'CON-019': { article: 'Nintendo Entertainment System' },
  'CON-020': { article: 'Wii', pick: ['console', 'Wii-Console', 'Wii_console'] },
  'CON-021': { article: 'Wii U' },
};

function scoreImage(filename, pick = [], avoid = []) {
  const fn = filename.toLowerCase();
  let score = 0;
  if (fn.endsWith('.svg')) return -1000;
  if (fn.includes('logo') && !fn.includes('cover')) score -= 100;
  if (fn.includes('icon') && !fn.includes('cover')) score -= 50;
  if (fn.includes('screenshot')) score -= 80;
  if (fn.includes('gameplay')) score -= 80;
  if (fn.includes('wikipe')) score -= 100;
  if (fn.includes('commons-logo')) score -= 100;
  if (fn.includes('symbol')) score -= 50;
  if (fn.includes('ojs_ui')) score -= 100;
  if (fn.includes('wpvg')) score -= 100;
  if (fn.includes('category')) score -= 100;
  if (fn.includes('sprite')) score -= 50;
  if (fn.includes('cover')) score += 50;
  if (fn.includes('box')) score += 40;
  if (fn.includes('boxart')) score += 50;
  if (fn.includes('pack')) score += 20;
  if (fn.includes('front')) score += 15;
  if (fn.includes('pal') || fn.includes('europe') || fn.includes('eu')) score += 30;
  for (const term of pick) { if (fn.includes(term.toLowerCase())) score += 60; }
  for (const term of avoid) { if (fn.includes(term.toLowerCase())) score -= 200; }
  return score;
}

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf8'));
  const skus = Object.keys(FIXES);
  console.log(`Processing ${skus.length} products...`);
  let success = 0, failed = 0;
  const failures = [];

  for (const sku of skus) {
    const fix = FIXES[sku];
    const prod = products.find(p => p.sku === sku);
    if (!prod) { continue; }
    const slugs = [prod.slug];
    const altSlug = prod.slug.replace(/pokmon/g, 'pok-mon');
    if (altSlug !== prod.slug) slugs.push(altSlug);

    process.stdout.write(`[${sku}] ${prod.name}... `);

    try {
      const encodedTitle = encodeURIComponent(fix.article);
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedTitle}&prop=images&imlimit=50&format=json`;
      const data = curlJson(apiUrl);
      const pages = Object.values(data.query.pages);
      const images = (pages[0]?.images || []).map(img => img.title);
      const imageFiles = images.filter(img => {
        const ext = img.toLowerCase();
        return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.webp');
      });

      if (imageFiles.length === 0) throw new Error('No images found');

      const scored = imageFiles.map(img => ({ filename: img, score: scoreImage(img, fix.pick || [], fix.avoid || []) }))
        .sort((a, b) => b.score - a.score);

      let downloaded = false;
      for (const candidate of scored.slice(0, 5)) {
        if (candidate.score < -50) continue;
        try {
          const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate.filename)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
          const infoData = curlJson(infoUrl);
          const infoPages = Object.values(infoData.query.pages);
          const info = infoPages[0]?.imageinfo?.[0];
          if (!info || info.mime === 'image/svg+xml' || info.width < 150 || info.height < 150) continue;

          const buffer = curlBinary(info.url);
          const outputPath = path.join(PRODUCTS_DIR, `${slugs[0]}.webp`);
          await sharp(buffer)
            .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .webp({ quality: 85 })
            .toFile(outputPath);
          if (slugs.length > 1) fs.copyFileSync(outputPath, path.join(PRODUCTS_DIR, `${slugs[1]}.webp`));

          console.log(`OK (${candidate.filename.replace('File:', '').slice(0, 50)})`);
          success++;
          downloaded = true;
          break;
        } catch (e) { /* try next */ }
      }
      if (!downloaded) throw new Error('All candidates failed');
    } catch (error) {
      console.log(`FAIL: ${error.message}`);
      failures.push({ sku, name: prod.name, error: error.message });
      failed++;
    }
    await delay(150);
  }

  console.log(`\n=== Results: ${success} OK, ${failed} FAILED out of ${skus.length} ===`);
  if (failures.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'cover-fix-failures.json'), JSON.stringify(failures, null, 2));
    console.log('Failures saved to cover-fix-failures.json');
  }
}

main().catch(console.error);
