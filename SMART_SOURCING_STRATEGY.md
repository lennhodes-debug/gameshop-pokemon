# Intelligent Cover Art Finding Strategy

## Discovery Priority

### Tier 1: Easy (11 products)
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

### Tier 2: Medium (2 products)
Popular but less iconic games.

Modern Nintendo systems:
- Nintendo Switch exclusives
- Wii first-party titles
- 3DS popular games

**Strategy:** Check GameFAQs, Wikipedia, or MobyGames

### Tier 3: Hard (33 products)
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

### Tier 4: Accessories (36 products)
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

```
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
```

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
| Easy | 11 | 1-2 min | 16.5 min |
| Medium | 2 | 3-5 min | 8 min |
| Hard | 33 | 5-10 min | 247.5 min |
| Accessories | 36 | 2-3 min | 90 min |
| **TOTAL** | **82** | **Avg 4 min** | **~328 min (~5 hours)** |

## Recommended Workflow

1. **Session 1**: Easy tier (11 products, ~25 min)
   - Builds confidence
   - Most will have multiple source options
   - Highest success rate

2. **Session 2**: Medium tier (2 products, ~8 min)
   - Still reasonable difficulty
   - Good resource availability

3. **Session 3**: Hard tier + Accessories (69 products, ~337.5 min)
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
