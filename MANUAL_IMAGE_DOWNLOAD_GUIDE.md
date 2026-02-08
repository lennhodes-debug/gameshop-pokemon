# Manual Cover Art Download Guide

## Why Manual?

Automated image scraping is complex due to:
- Website structure changes
- Copyright protections
- Rate limiting
- Regional restrictions

**Solution:** Minimal manual work with full automation handling.

## Quick Download Process

### For Each Product:

1. **Click the PriceCharting Link** from MISSING_COVERS_MANIFEST.json
2. **Find PAL/EUR Version**
   - Look for "PAL" or "EUR" label
   - Verify European/Dutch game version (NOT NTSC/USA)
3. **Download Image**
   - Right-click highest resolution image
   - Save As → .cover-art-temp/ folder
4. **Rename File** (important for auto-deployment)
   ```
   [SKU]-[game-slug].png
   ```
   Examples:
   - SW-042-zelda-botw.png
   - 3DS-015-pokemon-moon.png
   - CON-003-nintendo-switch.png

### Auto System Takes Over

Once files appear in `.cover-art-temp/`:
1. ✅ Auto-watch detects new image
2. ✅ Validates quality (size, format, dimensions)
3. ✅ Converts to WebP 500x500
4. ✅ Updates products.json
5. ✅ Runs build validation
6. ✅ Creates git commit
7. ✅ Pushes to remote

**Result:** Live on Netlify after deploy completes (~2 minutes)

## Best Sources (In Order)

### 1. PriceCharting (BEST - PAL specific)
- Go to: pricecharting.com/?region=pal
- Search for game name
- Click "PAL" version
- Click image to view larger
- Save original artwork image

### 2. GameFAQs (cover archives)
- Site: gamefaqs.gamespot.com
- Search game name
- Go to "Platform" section
- Click game title
- Image/media section has box art

### 3. MobyGames (by region)
- Site: mobygames.com
- Search game name
- Select correct platform
- View "Cover Art" section
- Filter by region if available

### 4. IGDB (professional)
- Site: igdb.com
- Search by game name + platform
- View cover art in gallery
- Download highest resolution

### 5. Internet Archive (backup)
- Site: archive.org
- Search product name
- Browse historical listings
- Sometimes has box art images

### 6. Nintendo Official
- Nintendo eShop pages sometimes have art
- Official Nintendo fan sites
- Press release images

## Quality Checklist for Each Download

- [ ] **Region**: PAL/EUR (NOT NTSC/USA)
- [ ] **Official**: Nintendo official artwork only
- [ ] **Clean**: No damage, grading, watermarks
- [ ] **Resolution**: 500px or larger (square)
- [ ] **File size**: 50KB-500KB (original)
- [ ] **Not a**: Screenshot, fan art, or photo

## Troubleshooting

### Image not found?
1. Try alternative platform version name
   - "Zelda: BOTW" vs "The Legend of Zelda: Breath of the Wild"
2. Try different search terms
   - "Nintendo Switch Mario Kart" vs just "Mario Kart"
3. Check multiple sources
4. Consult Wikipedia game pages

### Found but low quality?
- Skip for now, can revisit later
- Validation system will reject if unsuitable
- No rush - incomplete is better than wrong

### Naming issues?
- Use SKU from manifest
- Use URL-safe slug (hyphens, no spaces)
- Examples:
  - ✅ sw-042-zelda-botw.png
  - ❌ SW-042-Zelda: BOTW.png
  - ❌ sw-042 zelda botw.png

## Pro Tips

1. **Batch download**: Open 5-10 tabs, fill them all, download together
2. **Sort by priority**: Finish Switch/Wii games first (highest value)
3. **Take breaks**: 20 products per session is reasonable
4. **Trust validation**: If system rejects image, you'll see error in build output
5. **Iterate**: Find some, deploy, refine, find more

## Expected Timeline

- **Accessories** (20 images): 30 minutes
  - Most have no official cover art
  - Use product photos instead
  - Validate carefully

- **Popular Games** (30 images): 45 minutes
  - Easier to find
  - More search results

- **Obscure Games** (32 images): 75 minutes
  - Harder to find
  - May require fallback sources
  - Some may not have images available

**Total estimate: 150 minutes / 2.5 hours**

## Automation After Download

Don't do anything manually after download:
- ❌ Don't convert to WebP (system does this)
- ❌ Don't resize images (system does this)
- ❌ Don't create git commits (system does this)
- ❌ Don't push (system does this)

Just place images in .cover-art-temp/ and watch auto-deploy!

## Verification

After all images downloaded, check:

```bash
# Count files in temp folder
ls -1 .cover-art-temp/ | wc -l

# Should be around 82 (plus maybe test images)

# Watch auto-deploy progress
tail -f ~/.console.log
```

## Questions?

Check:
- IMAGE_QUALITY_CHECKLIST.md (quality standards)
- MISSING_COVERS_MANIFEST.json (complete product list with links)
- CLAUDE.md (project rules and tech setup)

Good luck! 🎮
