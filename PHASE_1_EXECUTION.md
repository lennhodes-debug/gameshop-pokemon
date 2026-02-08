# Phase 1 Execution Plan - Optimized Cover Art Replacement

**Status:** Ready to execute
**Target:** Replace top 20 priority game covers (highest sales value)
**Expected Result:** 754 + 20 = 774 images (82 remaining for Phases 2-4)
**Timeline:** This session

---

## Top 20 Priority List (Ranked by Sales Value + Franchise Popularity)

| # | SKU | Naam | Platform | Huidige Status | Score | Action |
|---|---|---|---|---|---|---|
| 1 | CON-003 | Nintendo Switch Lite - Lichtblauw | Console | MISSING | 280 | Official Nintendo photo |
| 2 | CON-004 | Nintendo Switch Lite - Lichtgeel | Console | MISSING | 280 | Official Nintendo photo |
| 3 | SW-021 | Donkey Kong Country: Tropical Freeze | Switch | MISSING | 270 | PriceCharting PAL |
| 4 | SW-028 | Final Fantasy X/X-2 Remaster | Switch | MISSING | 270 | PriceCharting PAL |
| 5 | SW-078 | Pokemon Let's Go Eevee | Switch | MISSING | 270 | PriceCharting PAL |
| 6 | SW-088 | Pokemon Let's Go Pikachu | Switch | MISSING | 270 | PriceCharting PAL |
| 7 | SW-126 | Zelda: Link's Awakening | Switch | MISSING | 270 | PriceCharting PAL |
| 8 | SW-117 | The Witcher 3 | Switch | MISSING | 250 | PriceCharting PAL |
| 9 | SW-099 | Skyrim | Switch | MISSING | 250 | PriceCharting PAL |
| 10 | SW-023 | Doom Eternal | Switch | MISSING | 250 | PriceCharting PAL |
| 11 | SNES-016 | Final Fantasy VI | SNES | MISSING | 240 | PriceCharting PAL |
| 12 | SNES-015 | Final Fantasy V | SNES | MISSING | 240 | PriceCharting PAL |
| 13 | NES-025 | Final Fantasy | NES | MISSING | 220 | PriceCharting PAL |
| 14 | N64-027 | Zelda: Ocarina of Time | N64 | MISSING | 220 | PriceCharting PAL |
| 15 | GC-044 | Metroid Prime | GameCube | MISSING | 210 | PriceCharting PAL |
| 16 | DS-023 | Mario & Sonic Olympic Games | DS | MISSING | 200 | PriceCharting PAL |
| 17 | GBA-007 | Final Fantasy VI Advance | GBA | MISSING | 190 | PriceCharting PAL |
| 18 | 3DS-042 | Pokemon Sun/Moon | 3DS | MISSING | 190 | PriceCharting PAL |
| 19 | GB-021 | Link's Awakening | Game Boy | MISSING | 190 | PriceCharting PAL |
| 20 | WII-014 | Zelda: Twilight Princess | Wii | MISSING | 190 | PriceCharting PAL |

---

## Step-by-Step Execution (Optimized Workflow)

### STEP 1: Create Automated Verification System (5 minutes)
```bash
# Already created: BATCH_CONVERT.sh
# Already created: DOWNLOAD_MANIFEST_DETAILED.json with all search URLs
# These files contain all download URLs and conversion settings
```

### STEP 2: Manual Download Phase (Optimized with PriceCharting URLs)
For each product in the table above:

**For Consoles (CON-003, CON-004):**
- Source: Official Nintendo product photos (amazon.eu or Nintendo store)
- Quality check: Official Nintendo photo, minimum 500x500px
- Expected file size: 15-25KB (smaller than game boxes)
- Expected outcome: Clean console images with transparent/white background

**For Games (all others):**
- Visit auto-generated search URL in DOWNLOAD_MANIFEST_DETAILED.json
- Search URL already filtered for PAL/EUR region
- Download the HIGHEST resolution image available
- Verify: Image shows "PAL" or "EUR" region label on spine/back
- Reject: Any NTSC (has "USA" or black stripe), damaged, graded
- Expected file size: 30-80KB (professional boxart quality)

### STEP 3: Batch Conversion (Automated)
```bash
# Place all downloaded PNG/JPG in a folder
# Run: bash BATCH_CONVERT.sh
# This converts all to WebP 500x500 quality 85 automatically
# Output: .webp files ready for deployment
```

### STEP 4: File Placement (Automated Naming)
```bash
# Expected file names from DOWNLOAD_MANIFEST_DETAILED.json:
con-003-nintendo-switch-lite-lichtblauw.webp
con-004-nintendo-switch-lite-lichtgeel.webp
sw-021-donkey-kong-country-tropical-freeze.webp
sw-028-final-fantasy-x-x-2-remaster.webp
# ... 20 total files

# Place all in: public/images/products/
```

### STEP 5: Build Validation (Automated)
```bash
npm run build
# Expected: Build PASSES
# Expected: Warnings reduce from 92 → 72
# Expected: Pages generated: 863 ✓
```

### STEP 6: Git Commit & Push (Automated)
```bash
git add public/images/products/
git commit -m "Voeg top 20 premium PAL cover arts toe - Phase 1 complete

- 20 nieuwe premium PAL/EUR boxarts gedownload en geconverteerd
- Consoles: 2 (Switch Lite varianten)
- Spellen: 18 (klassieke franchises)
- Alle covers: 500x500px, WebP quality 85, PAL/EUR verified
- Build: PASSING (863 pages, 774 images)
- Status: 72 producten nog nodig (Phases 2-4)

https://claude.ai/code/session_01CFY8GCddCymxHWJfaY7RyM"

git push -u origin claude/fix-cover-art-gTLvb
```

---

## Quality Checklist (MANDATORY)

Before moving files to public/images/products/:

- [ ] Image is PAL/EUR version (NOT NTSC with USA label)
- [ ] Resolution is minimum 500x500px
- [ ] File is professional boxart (NOT photo, fan art, or screenshot)
- [ ] File shows NO damage, grading, or watermarks
- [ ] File size is reasonable (25-70KB games, 15-25KB consoles)
- [ ] Filename matches expected format from manifest

---

## Success Metrics

After Phase 1 completion:
- Total images: 774/846 (91.5%)
- Remaining: 72 products (Phases 2-4)
- Build status: ✅ PASSING
- Premium coverage: Top 20 highest-value products covered
- Next batch ready: Phase 2 has automatic priority ranking ready

---

## Key Assumptions

1. **Manual downloading required** - PriceCharting/Amazon images can't be auto-fetched (copyright/terms)
2. **Batch conversion automated** - BATCH_CONVERT.sh handles all WebP conversion
3. **Build auto-updates** - Running `npm run build` auto-detects new images and updates products.json
4. **All URLs pre-generated** - DOWNLOAD_MANIFEST_DETAILED.json has complete search URLs
5. **Git tracking automatic** - `git add public/images/products/` captures all new files

---

## Fallback if Manual Download Fails

If PriceCharting images don't meet quality standards:
1. Try Amazon.eu product images (official)
2. Try local auction sites (vinted, marktplaats.nl with EUR focus)
3. Try Nintendo's official press releases/media kit
4. Skip to Phase 2 batch if time-constrained

---

## Phase 1 → Phase 2 Transition

After Phase 1 complete:
- Run PHASE_2_EXECUTION.md (next 30 games auto-prioritized)
- Reuse same workflow: download → batch convert → git add → build → commit
- DOWNLOAD_MANIFEST_DETAILED.json already has full Phase 2 list ready

---

**Ready to execute. All systems prepared. Zero friction workflow.**
