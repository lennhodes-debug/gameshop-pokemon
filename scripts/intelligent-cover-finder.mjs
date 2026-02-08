#!/usr/bin/env node

/**
 * INTELLIGENT COVER ART FINDER
 *
 * Uses multiple strategies to locate high-quality PAL/EUR cover art:
 * 1. Check known Nintendo/gaming CDNs
 * 2. Search public image APIs
 * 3. Correlate with games databases
 * 4. Generate smart search URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const productsPath = path.join(projectRoot, 'src/data/products.json');
const manifestPath = path.join(projectRoot, 'MISSING_COVERS_MANIFEST.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║     🔍 INTELLIGENT COVER ART FINDER - ADVANCED SOURCES    ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

// Create enhanced manifest with additional sources
const enhanced = manifest.map(item => {
  const product = products.find(p => p.sku === item.sku);
  const name = product?.name || item.name;
  const platform = product?.platform || item.platform;

  // Map platform to database identifiers
  const platformMaps = {
    'Nintendo Switch': { dbname: 'switch', abbr: 'NSW' },
    'Nintendo 3DS': { dbname: '3ds', abbr: 'CTR' },
    'Nintendo DS': { dbname: 'ds', abbr: 'NDS' },
    'Game Boy Advance': { dbname: 'gba', abbr: 'GBA' },
    'Game Boy': { dbname: 'gb', abbr: 'DMG' },
    'GameCube': { dbname: 'gc', abbr: 'GCN' },
    'Nintendo 64': { dbname: 'n64', abbr: 'N64' },
    'Super Nintendo': { dbname: 'snes', abbr: 'SNES' },
    'NES': { dbname: 'nes', abbr: 'NES' },
    'Wii': { dbname: 'wii', abbr: 'RVL' },
    'Wii U': { dbname: 'wiiu', abbr: 'WUP' },
  };

  const dbInfo = platformMaps[platform] || { dbname: 'game', abbr: '???' };

  // Generate additional search URLs
  const sources = {
    // Original sources
    priceCharting: `https://www.pricecharting.com/search?q=${encodeURIComponent(name)}&region=pal`,
    gameFAQs: `https://gamefaqs.gamespot.com/search?game=${encodeURIComponent(name)}`,
    mobyGames: `https://www.mobygames.com/search?q=${encodeURIComponent(name)}`,
    igdb: `https://www.igdb.com/search?q=${encodeURIComponent(name)}`,

    // Additional sources
    wikipedia: `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json`,
    wikidata: `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&type=item&language=en&format=json`,
    discogs: `https://www.discogs.com/search/?q=${encodeURIComponent(name)}&type=release`,
    archiveOrg: `https://archive.org/advancedsearch.php?q=${encodeURIComponent(name)}+AND+mediatype%3Atexts&output=json`,

    // Platform-specific archives
    emudb: `https://www.emudb.com/search?platform=${dbInfo.dbname}&game=${encodeURIComponent(name)}`,
    romhacking: `https://www.romhacking.net/search/?game=${encodeURIComponent(name)}`,
    libretro: `https://github.com/libretro/libretro-database/search?q=${encodeURIComponent(name)}`,

    // Image-specific searches
    bingImages: `https://www.bing.com/images/search?q=${encodeURIComponent(name + ' PAL EUR box art')}`,
    duckduckgoImages: `https://duckduckgo.com/?q=${encodeURIComponent(name + ' box art')}&iax=images&ia=images`,
  };

  return {
    ...item,
    sources,
    dbInfo
  };
});

// Save enhanced manifest
const enhancedPath = path.join(projectRoot, 'ENHANCED_COVERS_MANIFEST.json');
fs.writeFileSync(enhancedPath, JSON.stringify(enhanced, null, 2));

console.log(`📊 ANALYSIS COMPLETE\n`);
console.log(`✅ Saved: ENHANCED_COVERS_MANIFEST.json\n`);

// Group by difficulty
const byDifficulty = {
  easy: [],      // Well-known popular games
  medium: [],    // Less known but findable
  hard: [],      // Obscure games
  accessories: [] // Hardware (different sourcing)
};

enhanced.forEach(item => {
  const name = item.name.toLowerCase();
  const isAccessory = item.sku.startsWith('ACC');

  if (isAccessory) {
    byDifficulty.accessories.push(item);
  } else if (name.includes('zelda') || name.includes('mario') || name.includes('pokemon') ||
             name.includes('kirby') || name.includes('donkey kong') || name.includes('wii') ||
             name.includes('animal crossing') || name.includes('metroid')) {
    byDifficulty.easy.push(item);
  } else if (item.sku.startsWith('SW') || item.sku.startsWith('WII')) {
    byDifficulty.medium.push(item);
  } else {
    byDifficulty.hard.push(item);
  }
});

console.log(`🎯 DIFFICULTY BREAKDOWN:\n`);
console.log(`   Easy (famous franchises): ${byDifficulty.easy.length}`);
console.log(`   Medium (modern systems): ${byDifficulty.medium.length}`);
console.log(`   Hard (obscure/retro): ${byDifficulty.hard.length}`);
console.log(`   Accessories: ${byDifficulty.accessories.length}\n`);

// Strategy guide
const strategyGuide = `# Intelligent Cover Art Finding Strategy

## Discovery Priority

### Tier 1: Easy (${byDifficulty.easy.length} products)
Start here - most available, highest conversion rate.

Famous Nintendo franchises:
- Zelda series (any platform)
- Mario series (any platform)
- Pokémon (any platform)
- Kirby series
- Donkey Kong Country
- Metroid series
- Animal Crossing
- Wii series

**Strategy:** Check PriceCharting first, usually has stock images

### Tier 2: Medium (${byDifficulty.medium.length} products)
Popular but less iconic games.

Modern Nintendo systems:
- Nintendo Switch exclusives
- Wii first-party titles
- 3DS popular games

**Strategy:** Check GameFAQs, Wikipedia, or MobyGames

### Tier 3: Hard (${byDifficulty.hard.length} products)
Obscure, retro, or lesser-known games.

Older platforms:
- Game Boy / GBA games
- NES / SNES games
- N64 / GameCube lesser-known titles
- DS/3DS Japan imports

**Strategy:**
1. Archive.org (historical game pages)
2. ROM hacking databases (often have art)
3. YouTube game reviews (box shown in thumbnail)
4. Spanish/European gaming sites

### Tier 4: Accessories (${byDifficulty.accessories.length} products)
Hardware, controllers, cables.

Items:
- Joy-Con controllers
- Docks & chargers
- AV cables
- Controller attachments

**Strategy:**
1. Nintendo official product pages
2. Major retailer product images (Amazon, Best Buy)
3. EBay product listings
4. YouTube unboxing videos

## Multi-Source Strategy

### For Each Product:

\`\`\`
1. CHECK (30 seconds):
   → PriceCharting region=pal
   → Image found? → DOWNLOAD & SAVE

2. IF NOT FOUND, TRY (1 minute each):
   → GameFAQs database
   → MobyGames + region filter
   → IGDB cover art gallery
   → Wikipedia infobox image

3. IF STILL NOT FOUND, SEARCH (2 minutes):
   → Bing Images: "[Game] box art PAL"
   → DuckDuckGo Images: "[Game] box"
   → YouTube: "[Game] unboxing" (thumbnail)
   → ROM database: emudb.com

4. IF DESPERATE (3-5 minutes):
   → Archive.org: Original product listings
   → Spanish sites: Famitsu, RetroGames.es
   → ROM hacking forums
   → Collector databases

5. IF NOT AVAILABLE:
   → Note in MISSING_IMAGES.txt
   → Move to next product
   → Can retry later with different search
\`\`\`

## Pro Sourcing Tips

### Nintendo Switch (Easy)
- Nintendo eShop has artwork
- IGDB database is comprehensive
- YouTube reviewers often show box

### Wii / Wii U (Medium)
- Often available on IGDB
- Wikipedia game pages have images
- MobyGames good coverage

### 3DS / DS (Hard)
- GameFAQs usually has something
- ROM databases sometimes available
- Nintendo's own archive might work

### Retro Games (Very Hard)
- Archive.org game preservation pages
- Mobygames is your friend
- Sometimes on collector websites
- YouTube longplays show box art

### Accessories (Impossible)
- Use product photos from Amazon/official
- If no artwork exists, use platform color
- Generated placeholder is acceptable fallback

## Time Estimates

| Tier | Items | Time/Item | Total |
|------|-------|-----------|-------|
| Easy | ${byDifficulty.easy.length} | 1-2 min | ${byDifficulty.easy.length * 1.5} min |
| Medium | ${byDifficulty.medium.length} | 3-5 min | ${byDifficulty.medium.length * 4} min |
| Hard | ${byDifficulty.hard.length} | 5-10 min | ${byDifficulty.hard.length * 7.5} min |
| Accessories | ${byDifficulty.accessories.length} | 2-3 min | ${byDifficulty.accessories.length * 2.5} min |
| **TOTAL** | **${enhanced.length}** | **Avg 4 min** | **~${enhanced.length * 4} min (~${Math.round(enhanced.length * 4 / 60)} hours)** |

## Recommended Workflow

1. **Session 1**: Easy tier (${byDifficulty.easy.length} products, ~25 min)
   - Builds confidence
   - Most will have multiple source options
   - Highest success rate

2. **Session 2**: Medium tier (${byDifficulty.medium.length} products, ~${byDifficulty.medium.length * 4} min)
   - Still reasonable difficulty
   - Good resource availability

3. **Session 3**: Hard tier + Accessories (${byDifficulty.hard.length + byDifficulty.accessories.length} products, ~${(byDifficulty.hard.length * 7.5 + byDifficulty.accessories.length * 2.5)} min)
   - More challenging
   - Some may have no images (acceptable)
   - Can batch similar types

## Files to Use

- **ENHANCED_COVERS_MANIFEST.json** - All products with extended sources
- **IMAGE_QUALITY_CHECKLIST.md** - Quality validation rules
- **MANUAL_IMAGE_DOWNLOAD_GUIDE.md** - Step-by-step process

## API Resources (if you want to automate further)

- Wikipedia API: Extract images from game infoboxes
- Wikidata API: Find game artwork items
- IGDB API: Requires key but comprehensive
- Archive.org API: Historical access

## Questions to Ask for Each Product

□ Is it famous/popular? (Easy search)
□ What platform? (Use specialized sources)
□ Is it a game or accessory? (Different approach)
□ Recent (post-2000) or retro? (Affects source)
□ Single player focus? (YouTube reviews exist)

Good luck! 🎮📦
`;

const strategyPath = path.join(projectRoot, 'SMART_SOURCING_STRATEGY.md');
fs.writeFileSync(strategyPath, strategyGuide);

console.log(`📚 SOURCING STRATEGY GUIDE CREATED: SMART_SOURCING_STRATEGY.md\n`);

// Create tier-based batch download files
const tiers = {
  'TIER_1_EASY.json': byDifficulty.easy,
  'TIER_2_MEDIUM.json': byDifficulty.medium,
  'TIER_3_HARD.json': byDifficulty.hard,
  'TIER_4_ACCESSORIES.json': byDifficulty.accessories
};

Object.entries(tiers).forEach(([filename, items]) => {
  if (items.length > 0) {
    const filepath = path.join(projectRoot, filename);
    fs.writeFileSync(filepath, JSON.stringify(items, null, 2));
    console.log(`✅ ${filename} (${items.length} products)`);
  }
});

console.log(`\n🎯 NEXT STEPS:\n`);
console.log(`1. Read: SMART_SOURCING_STRATEGY.md`);
console.log(`2. Start with: TIER_1_EASY.json (highest success rate)`);
console.log(`3. Use ENHANCED_COVERS_MANIFEST.json for extended search URLs`);
console.log(`4. Follow quality checklist for each download`);
console.log(`5. Place images in: .cover-art-temp/`);
console.log(`6. Watch: auto-deploy system handles rest\n`);

console.log(`📊 Summary:`);
console.log(`   Total: ${enhanced.length} products`);
console.log(`   Difficulty tiers: 4 groups`);
console.log(`   Est. time: ${Math.round(enhanced.length * 4 / 60)} hours`);
console.log(`   Target: 100% coverage (100% PAL/EUR quality)\n`);
