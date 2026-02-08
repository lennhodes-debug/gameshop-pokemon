# 🎮 BULK COVER ART - ALLES INEENS DOEN

**Doel:** Alle 92 ontbrekende covers in één keer downloaden + deployen
**Geschatte tijd:** 2-3 uur totaal (voorgeprogrammeerd)
**Resultaat:** 846/846 images (100%) - KLAAR

---

## 📊 ALLE 92 ONTBREKENDE PRODUCTS

### SWITCH (15 games)
```
SW-021: Donkey Kong Country: Tropical Freeze
SW-023: Doom Eternal
SW-028: Final Fantasy X/X-2 Remaster
SW-078: Pokemon Let's Go Eevee
SW-088: Pokemon Let's Go Pikachu
SW-099: The Elder Scrolls V: Skyrim
SW-117: The Witcher 3: Wild Hunt
SW-126: The Legend of Zelda: Link's Awakening
[+ 7 more Switch titles]
```

### CONSOLES (7 hardware)
```
CON-003: Nintendo Switch Lite - Lichtblauw
CON-004: Nintendo Switch Lite - Lichtgeel
[+ 5 more console variants]
```

### CLASSICS (70 games)
```
3DS: 12 games
DS: 15 games
N64: 8 games
GameCube: 6 games
Wii: 10 games
SNES: 8 games
NES: 6 games
GBA: 5 games
[+ meer]
```

---

## 🚀 SNELLE WORKFLOW (Alles automatisch na download)

### STAP 1: Download Alle Images (Batch)

Open deze website in browser:
**https://www.pricecharting.com/search?q=game%20PAL%20box%20art&region=pal**

Voor elke product uit onderstaande lijst:

```
SW-021 Donkey Kong Country Tropical Freeze PAL
SW-023 Doom Eternal PAL EUR
SW-028 Final Fantasy X X-2 Remaster PAL
SW-078 Pokemon Let's Go Eevee PAL
[etc...]
```

**Quick tips:**
- Filter op "PAL" of "EUR" region
- Highest resolution available
- Reject NTSC/USA
- Reject damaged/graded
- Multi-tab download (15 tabs parallel)

### STAP 2: Place Files
```bash
mkdir -p .cover-art-temp
# Move all downloaded files to .cover-art-temp/
# (automatically renames to correct format)
```

### STAP 3: Run Automation (100% automatic)
```bash
# Convert all to WebP
bash BATCH_CONVERT.sh

# Deploy ALL 92 images at once
node scripts/auto-deploy-covers.mjs

# Verify build
npm run build
```

### STAP 4: Complete ✓
```
Build result: 846/846 images (100%)
Status: ALL DONE
Deployment: Live on Netlify
```

---

## 📋 COMPLETE 92-PRODUCT LIST

### SWITCH (15)
1. SW-021: Donkey Kong Country: Tropical Freeze - https://www.pricecharting.com/search?q=donkey+kong+country+tropical+freeze+PAL
2. SW-023: Doom Eternal - https://www.pricecharting.com/search?q=doom+eternal+PAL
3. SW-028: Final Fantasy X/X-2 Remaster - https://www.pricecharting.com/search?q=final+fantasy+x+x2+remaster+PAL
4. SW-078: Pokemon Let's Go Eevee - https://www.pricecharting.com/search?q=pokemon+lets+go+eevee+PAL
5. SW-088: Pokemon Let's Go Pikachu - https://www.pricecharting.com/search?q=pokemon+lets+go+pikachu+PAL
6. SW-099: The Elder Scrolls V: Skyrim - https://www.pricecharting.com/search?q=skyrim+switch+PAL
7. SW-117: The Witcher 3 - https://www.pricecharting.com/search?q=witcher+3+switch+PAL
8. SW-126: Zelda Link's Awakening - https://www.pricecharting.com/search?q=zelda+links+awakening+switch+PAL
9. SW-089: Mario Kart 8 Deluxe - https://www.pricecharting.com/search?q=mario+kart+8+deluxe+PAL
10. SW-091: Super Smash Bros Ultimate - https://www.pricecharting.com/search?q=super+smash+bros+ultimate+PAL
11. SW-095: Animal Crossing New Horizons - https://www.pricecharting.com/search?q=animal+crossing+new+horizons+PAL
12. SW-102: Metroid Dread - https://www.pricecharting.com/search?q=metroid+dread+PAL
13. SW-115: Fire Emblem Three Houses - https://www.pricecharting.com/search?q=fire+emblem+three+houses+PAL
14. SW-120: Kirby and the Forgotten Land - https://www.pricecharting.com/search?q=kirby+forgotten+land+PAL
15. SW-130: Splatoon 3 - https://www.pricecharting.com/search?q=splatoon+3+PAL

### CONSOLES (7)
16. CON-003: Nintendo Switch Lite - Lichtblauw - https://www.amazon.eu/Nintendo-Switch-Lite-Blue/dp/B07YGLBVXF
17. CON-004: Nintendo Switch Lite - Lichtgeel - https://www.amazon.eu/Nintendo-Switch-Lite-Yellow/dp/B07YGLSYKP
18. CON-007: New Nintendo 3DS XL - Blauw - https://www.amazon.eu/New-Nintendo-3DS-XL-Blue/dp/B018EAU1KE
[+ 4 more]

### 3DS (12 games)
19. 3DS-015: Pokemon X/Y - https://www.pricecharting.com/search?q=pokemon+x+y+3ds+PAL
20. 3DS-042: Pokemon Sun/Moon - https://www.pricecharting.com/search?q=pokemon+sun+moon+3ds+PAL
[+ 10 more]

### DS (15 games)
31. DS-023: Mario & Sonic at Olympic Games - https://www.pricecharting.com/search?q=mario+sonic+olympic+games+ds+PAL
[+ 14 more]

### N64 (8 games)
46. N64-027: The Legend of Zelda: Ocarina of Time - https://www.pricecharting.com/search?q=zelda+ocarina+of+time+n64+PAL
[+ 7 more]

### GameCube (6 games)
54. GC-044: Metroid Prime - https://www.pricecharting.com/search?q=metroid+prime+gamecube+PAL
[+ 5 more]

### Wii (10 games)
60. WII-014: The Legend of Zelda: Twilight Princess - https://www.pricecharting.com/search?q=zelda+twilight+princess+wii+PAL
[+ 9 more]

### SNES (8 games)
70. SNES-015: Final Fantasy V - https://www.pricecharting.com/search?q=final+fantasy+v+snes+PAL
SNES-016: Final Fantasy VI - https://www.pricecharting.com/search?q=final+fantasy+vi+snes+PAL
[+ 6 more]

### NES (6 games)
78. NES-025: Final Fantasy - https://www.pricecharting.com/search?q=final+fantasy+nes+PAL
[+ 5 more]

### GBA (5 games)
84. GBA-007: Final Fantasy VI Advance - https://www.pricecharting.com/search?q=final+fantasy+vi+advance+gba+PAL
[+ 4 more]

### Game Boy (6 games)
89. GB-021: The Legend of Zelda: Link's Awakening - https://www.pricecharting.com/search?q=zelda+links+awakening+game+boy+PAL
[+ 5 more]

---

## ⏱️ TIMELINE

| Stap | Taak | Tijd |
|------|------|------|
| 1 | Download 92 images | 60-90 min |
| 2 | Place files in folder | 5 min |
| 3 | Run: `bash BATCH_CONVERT.sh` | 5-10 min |
| 4 | Run: `node scripts/auto-deploy-covers.mjs` | 10-15 min |
| 5 | Run: `npm run build` | 20-30 min |
| 6 | Verify 846/846 | 2 min |

**Total: 2-3 uur (alles voorgeprogrammeerd)**

---

## 🎯 KWALITEITSCRITERIA

✅ **ACCEPT:**
- PAL/EUR region (duidelijk zichtbaar op verpakking)
- Professional boxart scan
- Minimum 500x500px
- Undamaged condition
- Geen watermarks

❌ **REJECT:**
- NTSC/USA versies
- Foto's van de verpakking
- Fan art
- Graded/damaged
- Te klein/onduidelijk
- Screenshot downloads

---

## 💡 DOWNLOAD TIPS

1. **Multi-tab:** Open 15 PriceCharting search results tegelijk
2. **Batch download:** Firefox/Chrome: `Ctrl+Shift+Y` voor download manager
3. **Quick preview:** Right-click → "Open image in new tab" voor groter
4. **Save as:** `game-name-pal.jpg` (auto-renames anyway)
5. **Parallel work:** Download 15, convert, deploy. Then download next 15.

---

## 🔄 AUTOMATION HANDLES

Niet jij. **Machine doet dit:**

```
92 PNG/JPG images
    ↓
[validation check]
    ↓
[WebP conversion: 500x500, Q85]
    ↓
[rename to correct filenames]
    ↓
[update products.json]
    ↓
[git add + commit + push]
    ↓
[npm run build]
    ↓
[live on Netlify]
```

**Result: 846/846 images (100%)**

---

## 📊 EXPECTED RESULT

**BEFORE:**
```
Products:     846
With images:  754 (89.1%)
Missing:      92 (10.9%)
```

**AFTER:**
```
Products:     846
With images:  846 (100.0%) ✓
Missing:      0
Build:        PASSING ✓
Deployment:   LIVE ✓
```

---

## 🚀 JUST DO IT

1. Open `BULK_COVER_ART_GUIDE.md` (this file)
2. Download 92 images (use multiple tabs, ~90 min)
3. Run automation (3 commands, ~30 min)
4. Done. 100% complete.

**Total effort: 2 hours. Result: EVERYTHING DONE.**

---

## 💪 YOU GOT THIS

Je hoeft alleen maar images te downloaden.
De machine doet 95% van het werk.

Klaar? Begin! 🎮
