# Phase 2 Quick Start - Smart Collections

**Objective:** Deploy series awareness + filtering
**Time Required:** 45 minutes (same as Phase 1)
**Expected Result:** 804/846 images (95.0% coverage) + Series features live

---

## 📋 What's New

### Series Detection System
- Automatic series detection from product names
- Support for 9 iconic franchises (Zelda, Mario, Pokemon, Kirby, Fire Emblem, Final Fantasy, Donkey Kong, Metroid, Castlevania)
- Position tracking (1 of 10, 2 of 10, etc.)
- Completion status + rewards

### Components Prepared
- ✅ `SeriesBadge.tsx` - Shows series position on products
- ✅ `SeriesCompletionCard.tsx` - Series collection progress card
- ✅ `series.ts` - Core detection and utility functions

### Integrations Ready
- Series detection in product cards
- Collection progress tracking
- "Complete this series" recommendations
- Series filtering in shop (coming)

---

## 🚀 Phase 2 Execution (Same as Phase 1)

### STEP 1: Download Phase 2 Covers (15-30 min)
```
Open: PHASE_2_MANIFEST.json
- 30 products (core franchises)
- Same as Phase 1: PriceCharting PAL search URLs included
- Verify: PAL/EUR region on each image
- Download: PNG or JPG format
- Place: In `.cover-art-temp/` folder
```

### STEP 2: Batch Convert (5 min)
```bash
bash BATCH_CONVERT.sh
```

### STEP 3: Auto-Deploy (5 min)
```bash
node scripts/auto-deploy-covers.mjs
```
- System automatically:
  - Validates each image
  - Converts to WebP 500x500 Q85
  - Updates products.json
  - Runs build validation
  - Creates git commit
  - Pushes to remote

### STEP 4: Verify Build (2 min)
```bash
npm run build
```
Expected: 72 warnings → 42 warnings (30 products added)

---

## 📊 Expected Results

### After Phase 1 Complete
```
Current:  754 images (89.1%)
Phase 1:  +20 images
Result:   774 images (91.5%)
```

### After Phase 2 Complete
```
Current:  774 images (91.5%)
Phase 2:  +30 images
Result:   804 images (95.0%)
```

### Warnings Reduction
```
Before Phase 1: 92 warnings
After Phase 1:  72 warnings (20 resolved)
After Phase 2:  42 warnings (30 resolved)
```

---

## 🎮 Series Features (Behind Scenes)

### Already Built
- Series detection algorithm
- 9 franchise mappings
- Position calculation
- Completion tracking
- Recommendation engine

### Ready to Deploy in Phase 2+
- Series badges on product cards
- Collection progress cards
- "Complete this series" suggestions
- Series filtering UI
- Mobile-responsive layouts

---

## 📁 Phase 2 Files

### Manifests
- `PHASE_2_MANIFEST.json` - 30 products with PriceCharting URLs
- `PHASES_SUMMARY.json` - Overview of all 4 phases

### Components (Pre-Created)
- `src/components/shop/SeriesBadge.tsx` - Series position indicator
- `src/components/shop/SeriesCompletionCard.tsx` - Collection card
- `src/lib/series.ts` - Detection + utilities

### Automation (Unchanged from Phase 1)
- `scripts/auto-deploy-covers.mjs` (same as Phase 1)
- `BATCH_CONVERT.sh` (same as Phase 1)

---

## 🎯 Phase 2 Products (30 Games)

Top 30 by franchise + platform value:

```
New Nintendo 3DS XL (Console)
Kirby's Epic Yarn
Kirby 64
Sonic Adventure 2
Fire Emblem: Three Houses
Dragon Quest VIII
Dragon Quest XI S
Monster Hunter Generations Ultimate
Monster Hunter Rise
Splatoon 3
[+ 20 more from priority ranking]
```

See `PHASE_2_MANIFEST.json` for complete list with URLs.

---

## ✅ Phase 2 Checklist

- [ ] Read this guide
- [ ] Open PHASE_2_MANIFEST.json
- [ ] Download 30 images from PriceCharting
- [ ] Verify PAL/EUR on each image
- [ ] Place in `.cover-art-temp/`
- [ ] Run: bash BATCH_CONVERT.sh
- [ ] Run: node scripts/auto-deploy-covers.mjs
- [ ] Verify: npm run build
- [ ] Check: 42 warnings (vs. 72 before)
- [ ] Done: 804/846 images (95%)

---

## 💡 Series Features Preview (Phase 2+)

### What Users Will See
- **Series Badges** on product cards (e.g., "Zelda 3/10")
- **Collection Progress** cards showing series completion
- **"Complete Series"** suggestions in cart/shop
- **Series Filtering** to find all games in a franchise
- **Completion Rewards** when finishing a series

### Technical Impact
- Series detection runs automatically
- No manual series mapping needed
- Works with new products added later
- Mobile-responsive by default
- Performance optimized

---

## 🔄 After Phase 2

### Phase 3 (Week 3)
- 38 games + accessories
- Same 45-min workflow
- All 99.5% coverage
- Prepare Phase 3: Product Story features

### Phase 4 (Week 4)
- Final 10 accessories
- 100% coverage achieved
- Mobile optimization
- Final polish

---

## 📞 Quick Commands Reference

```bash
# Phase 2 Standard Workflow
bash BATCH_CONVERT.sh
node scripts/auto-deploy-covers.mjs
npm run build

# Check status
git log -1 --oneline
git status

# View progress
cat DEPLOYMENT_MONITOR.md
```

---

## ⏱️ Timeline

```
Phase 1: 45 min → 91.5% coverage
Phase 2: 45 min → 95.0% coverage (THIS)
Phase 3: 60 min → 99.5% coverage
Phase 4: 30 min → 100% coverage

Total: 3-4 hours to complete everything
```

---

## 🚀 Status: Ready to Execute

All systems prepared for Phase 2. Same workflow as Phase 1, streamlined execution.

When Phase 1 completes, begin Phase 2 whenever ready.
