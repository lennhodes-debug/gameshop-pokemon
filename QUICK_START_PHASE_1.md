# Quick Start - Phase 1 Cover Art Deployment

**Objective:** Replace 20 top-priority game covers this session
**Time Required:** 30-45 minutes (mostly download + validation)
**Expected Result:** 774/846 images (91.5% coverage)

---

## 📋 Your Checklist (Follow in Order)

### ✅ STEP 1: Prepare Download Folder (2 min)
```bash
# Create temporary folder for downloads
mkdir -p .cover-art-temp
cd .cover-art-temp
```

### ✅ STEP 2: Download Top 20 Covers (15-30 min)

Open `DOWNLOAD_MANIFEST_DETAILED.json` file in the project root.

For **EACH** of the top 20 products:
1. Click the `searchUrl` link (it's a PriceCharting PAL-filtered search)
2. **Verify region:** Look for "PAL" or "EUR" label on spine/box
3. **Check quality:** Professional boxart (not photo, not damaged, not fan art)
4. **Download:** Right-click image → "Save image as" → **PNG or JPG format**
5. **Place:** Save to `.cover-art-temp/` folder

**Example download names** (will be auto-renamed):
- `donkey-kong-tropical.jpg`
- `final-fantasy-x.png`
- `zelda-link-awakening.jpg`
- etc.

> **⚠️ CRITICAL:** Verify each image shows "PAL/EUR" region, not "NTSC/USA"

### ✅ STEP 3: Batch Conversion (5 min)
```bash
# From the gameshop root directory
bash BATCH_CONVERT.sh
```

This automatically:
- Converts PNG/JPG → WebP
- Resizes to 500x500px
- Sets quality to 85
- Saves as `.webp` files
- **Removes original PNG/JPG files**

### ✅ STEP 4: Auto-Deployment (5 min)
```bash
# From the gameshop root directory
node scripts/auto-deploy-covers.mjs
```

This automatically:
- Validates each image in `.cover-art-temp/`
- Moves to `public/images/products/`
- Updates `src/data/products.json`
- Runs `npm run build` to validate
- Creates git commit with details
- Pushes to remote branch

**Watch for:** ✅ Success messages for each image

### ✅ STEP 5: Verify Build Passed
```bash
npm run build
```

Expected output:
```
✓ Build completed (863 pages)
✓ Warnings: 72 (reduced from 92) ← Confirms 20 images added
✓ Errors: 0
```

---

## 📊 Real-World Example

### Donkey Kong Country (SW-021)
1. **Search URL:** https://www.pricecharting.com/search?q=Donkey%20Kong%20Country:...
2. **What to verify:** Box shows "PAL" clearly, game cover is clean, no damage
3. **Reject if:** Shows "NTSC USA" OR tiny/blurry OR graded/damaged
4. **Download:** Save as `dk-tropical.jpg` to `.cover-art-temp/`
5. **Auto-conversion:** BATCH_CONVERT.sh converts to `dk-tropical.webp`
6. **Auto-deploy:** auto-deploy-covers.mjs:
   - Validates dimensions (✓ 500x500+)
   - Checks file size (✓ 35KB - perfect)
   - Updates products.json
   - Moves to `public/images/products/`
   - Commits: "Voeg Donkey Kong Country cover toe"

---

## ⚠️ Quality Standards (MANDATORY)

**ACCEPT:**
- PAL/EUR region (clear label visible)
- Professional boxart quality
- Minimum 500x500px
- Clean, undamaged, unmutilated
- File size 25-70KB (for games)

**REJECT:**
- NTSC/USA versions (wrong region)
- Photos of boxes (not professional scan)
- Fan art or reproductions
- Graded/damaged/watermarked copies
- File size <20KB (too compressed)
- File size >100KB (poor compression)

---

## 🎯 Top 20 Products (Rank by Download Priority)

| # | SKU | Product | Notes |
|---|---|---|---|
| 1-2 | CON-003/004 | Switch Lite Colors | Official Nintendo photos |
| 3-7 | SW-021/028/078/088/126 | Pokemon/Mario/Zelda Switch | Highest value games |
| 8-10 | SW-117/099/023 | Witcher/Skyrim/Doom Switch | Premium AAA titles |
| 11-13 | SNES-015/016 + NES-025 | Final Fantasy series | Classic RPGs |
| 14-20 | N64/GC/DS/GBA/3DS/GB/Wii | Classic platforms | One per platform |

---

## 🔧 Troubleshooting

### "Image is too small / blurry"
→ Find higher resolution version in search results
→ PriceCharting usually has multiple versions per game

### "File shows NTSC/USA region"
→ This is the WRONG version
→ Keep searching for PAL/EUR variant
→ Check Amazon.eu if PriceCharting doesn't have it

### "Build validation failed"
→ Check error message for which file is invalid
→ Size issue? Re-check original file size (<10KB = problem)
→ Format issue? Ensure PNG/JPG, not already WebP
→ Re-run: `node scripts/auto-deploy-covers.mjs`

### "Git push failed"
→ Check internet connection
→ Retry: `git push -u origin claude/fix-cover-art-gTLvb`
→ If still failing, manual push: `git push origin claude/fix-cover-art-gTLvb`

---

## 📈 Success Criteria

After completing Phase 1, you should see:

```
BEFORE:
- Total images: 754/846 (89.1%)
- Warnings on build: 92

AFTER Phase 1:
- Total images: 774/846 (91.5%)
- Warnings on build: 72
- Git commits: 2 (manifests + covers)
- Build: ✅ PASSING
```

---

## 🚀 Next Steps (Phases 2-4)

After Phase 1 completes, repeat the same workflow:

### Phase 2 (Next Session - 30 products)
1. Open `PHASE_2_MANIFEST.json`
2. Download images using provided URLs
3. Run: `bash BATCH_CONVERT.sh`
4. Run: `node scripts/auto-deploy-covers.mjs`
5. Done! Auto-committed

### Phase 3 & 4
Repeat same process for remaining 48 products

---

## ⏱️ Estimated Timeline

| Phase | Products | Time | Coverage |
|-------|----------|------|----------|
| 1 | 20 | ~45 min | 91.5% (774/846) |
| 2 | 30 | ~60 min | 95.0% (804/846) |
| 3 | 38 | ~80 min | 99.5% (842/846) |
| 4 | 10 | ~30 min | 100.0% (846/846) |

**Total Time:** ~4.5 hours across 4 sessions
**Result:** 100% premium PAL/EUR cover art coverage

---

## 💡 Pro Tips

1. **Speed up downloads:** Open 3-4 search URLs in tabs simultaneously
2. **Batch quality check:** Download 5 images, validate all 5, then move to download next batch
3. **File naming:** Auto-deploy handles naming, don't worry about file names
4. **Night mode:** PriceCharting works better in light mode (dark mode hides some details)
5. **Multiple sources:** If one product missing on PriceCharting, try Amazon.eu

---

**YOU'RE READY TO START. All systems prepared. Zero friction workflow.**

Begin with Step 1 above.
