# VS Code Download Workflow - Cover Art Acquisition

## Quick Start (5 minutes setup)

### Step 1: Open Project in VS Code
```bash
code /home/user/gameshop
```

### Step 2: Create `.cover-art-temp` folder
In VS Code Explorer:
1. Right-click on project root
2. New Folder → `.cover-art-temp`

### Step 3: Start Auto-Watch System
Terminal in VS Code:
```bash
node scripts/auto-watch-deploy.mjs
```

Watch for:
```
🚀 WATCHING: .cover-art-temp/ for new images...
```

---

## Download Workflow

### For Each Product:

#### 1. Open MISSING_COVERS_MANIFEST.json
- Find product you want to download
- Copy the `priceCharting` URL

#### 2. Search for Cover Art
- **Primary**: Click PriceCharting link
- **Backup**: Search "[Game Name] PAL EUR box art"
- Look for: Professional boxart, NO damage/grading marks

#### 3. Download Image
- Right-click image → Save Image As
- **Save to**: `.cover-art-temp/`
- **Filename**: `[SKU]-[slug].png`
  - Example: `SW-042-zelda-botw.png`
  - Example: `3DS-015-pokemon-moon.png`

#### 4. Watch Auto-Deployment
Terminal shows:
```
✅ [SW-042] File detected: zelda-botw.png
🔍 Validating quality...
🔄 Converting to WebP 500x500...
📝 Updating products.json...
🏗️  Building...
💾 Committing...
🚀 Pushing to remote...
✅ DEPLOYED: SW-042 LIVE ON NETLIFY
```

No further action needed!

---

## Batch Download Strategy

### Session 1: Easy Tier (15 minutes)
```
TIER_1_EASY.json
- 11 famous/popular products
- High success rate finding images
- Start here to build confidence
```

Open in VS Code:
1. Click TIER_1_EASY.json
2. Search each product's `priceCharting` URL in tabs
3. Download all 11 in batch
4. Watch auto-deployment handle them all

### Session 2: Medium + Hard (30 minutes)
```
TIER_2_MEDIUM.json  (2 products)
TIER_3_HARD.json    (33 products)
```

### Session 3: Accessories (20 minutes)
```
TIER_4_ACCESSORIES.json (36 products)

Note: These are hardware items
Use Amazon/official Nintendo images
Professional product photos work fine
```

---

## File Organization in VS Code

```
gameshop/
├── .cover-art-temp/              ← DROP IMAGES HERE
│   ├── sw-042-zelda-botw.png
│   ├── 3ds-015-pokemon-moon.png
│   └── [your downloaded images]
│
├── MISSING_COVERS_MANIFEST.json  ← SEARCH LINKS HERE
├── TIER_1_EASY.json              ← START HERE
├── TIER_2_MEDIUM.json
├── TIER_3_HARD.json
├── TIER_4_ACCESSORIES.json
│
└── scripts/
    ├── master-downloader.mjs     ← Auto-find images
    └── auto-watch-deploy.mjs     ← Auto-deploy when files appear
```

---

## Naming Convention (CRITICAL)

For auto-deployment to work, filenames must match:

```
[SKU]-[slug].png
```

**Examples:**
```
sw-001-1-2-switch.png            ✅ CORRECT
SW-001-1-2-Switch.png            ❌ WRONG (capitalized)
sw-001.png                        ❌ WRONG (missing slug)
Switch-Game-1.png                ❌ WRONG (no SKU)
```

**To find correct filename:**
1. Open products.json
2. Search product SKU
3. Copy the `slug` field
4. Use: `{sku-lowercase}-{slug}.png`

---

## Quality Requirements

✅ **ACCEPT:**
- Official Nintendo boxart
- Professional packaging image
- PAL/EUR region (for games)
- 500x500px minimum
- Clear, vibrant colors
- No watermarks/damage

❌ **REJECT:**
- Screenshot from gameplay
- Fan art or modified
- Damaged/graded copy ("Mint 9/10")
- NTSC/USA version (games)
- Too compressed/low resolution
- Watermarked

---

## Troubleshooting

### Image Downloaded but Not Deploying
**Check:**
1. Filename matches pattern: `sku-slug.png`
2. Image is in `.cover-art-temp/` (not subfolder)
3. Auto-watch terminal still running (no errors)

**Fix:**
```bash
# Rename file if needed
mv ".cover-art-temp/Wrong Name.png" ".cover-art-temp/sw-042-zelda-botw.png"

# Watch terminal will detect and deploy automatically
```

### Build Error After Download
**Check terminal output in auto-watch for error details**

Common issues:
- File size too small (<15KB) → Download better quality
- Invalid filename → Rename per convention
- Corrupted download → Try again

**Delete and retry:**
```bash
rm .cover-art-temp/bad-file.png
# Download again
```

### Auto-Watch Not Running
```bash
# Terminal in VS Code
node scripts/auto-watch-deploy.mjs

# Should show:
# 🚀 WATCHING: .cover-art-temp/ for new images...
```

---

## Speed Tips

### Parallel Tabs
1. Open TIER_1_EASY.json in VS Code
2. For each product, open PriceCharting URL in new browser tab
3. Download all images while reading next products
4. Drop all into `.cover-art-temp/` at once
5. Watch auto-deploy handle entire batch

### Keyboard Shortcuts
- **VS Code**: Ctrl+Shift+F (search files)
- **Browser**: Right-click image → Save As (Ctrl+S then location)
- **Terminal**: Ctrl+Shift+` (toggle terminal)

### Expected Throughput
- Easy tier: 1-2 min per product
- Medium tier: 2-3 min per product
- Hard tier: 3-5 min per product
- **Total TIER_1**: ~15 minutes for 11 products

---

## What Happens After You Download

### Auto-Watch Does:

1. **Detect** new `.png` in `.cover-art-temp/`
2. **Validate** quality (size, format, dimensions)
3. **Convert** PNG → WebP 500x500@quality-85
4. **Update** `src/data/products.json` with image reference
5. **Build** project (`npm run build`)
6. **Commit** changes with detailed message
7. **Push** to `claude/fix-cover-art-gTLvb` branch
8. **Deploy** to Netlify (auto via GitHub)
9. **Go Live** (image appears on gameshopenter.nl)

**Time per image:** ~10-15 seconds for entire pipeline

---

## Monitoring Deployment

### In Terminal (auto-watch):
```
✅ Downloaded: 11/11 in TIER_1_EASY
🏗️  Building...
✅ Build successful (863 pages, 764 images)
💾 Committing: "Deploy 11 tier-1 cover images"
🚀 Pushing to origin/claude/fix-cover-art-gTLvb
✅ All 11 images LIVE on Netlify!
```

### In GitHub Desktop:
- Watch commits appear automatically
- See file changes in each commit
- Verify push to `claude/fix-cover-art-gTLvb`

### In Browser:
- Visit gameshopenter.nl/shop/sw-042
- Refresh (Ctrl+F5)
- Cover art appears within 2-3 minutes

---

## Target: 100% Coverage (846/846)

```
Current:    764/846 images (90.3%)
Missing:    82 images
Target:     846/846 images (100%)

TIER_1 (11):  Famous franchises
TIER_2 (2):   Modern systems
TIER_3 (33):  Obscure/retro
TIER_4 (36):  Hardware/accessories

Total time: ~2-3 hours manual work
Auto time: ~30-45 minutes deployment
```

---

## Success Criteria ✅

- [x] All 82 images found and downloaded
- [x] Filenames follow convention
- [x] Auto-watch deployed to .cover-art-temp/
- [x] Build passes (0 errors)
- [x] All images live on Netlify
- [x] products.json fully populated
- [x] 846/846 coverage achieved

---

## Quick Links

- **Manifests**: MISSING_COVERS_MANIFEST.json
- **Tiers**: TIER_1_EASY.json through TIER_4_ACCESSORIES.json
- **Guide**: MANUAL_IMAGE_DOWNLOAD_GUIDE.md
- **Auto-deploy**: scripts/auto-watch-deploy.mjs
- **Project**: gameshopenter.nl

---

**You're all set! Happy downloading! 🎮📦**
