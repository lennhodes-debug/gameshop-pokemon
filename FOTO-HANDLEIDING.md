# Foto Handleiding — Gameshop Enter

> Handleiding voor het vinden, downloaden en uploaden van hoge kwaliteit afbeeldingen.
> Volg deze stappen om altijd de juiste foto's te krijgen.

---

## Snelle Referentie

| Type | Formaat | Resolutie | Kwaliteit | Locatie |
|---|---|---|---|---|
| Product covers | WebP | 500x500 px | 85% | `public/images/products/` |
| Nintendo tijdlijn consoles | WebP | max 1920x1080 px | 85% | `public/images/nintendo/` |
| Nintendo tijdlijn games | WebP | max 1920x1080 px | 85% | `public/images/nintendo/` |
| Overige afbeeldingen | WebP | max 1920x1080 px | 85% | `public/images/` |

---

## 1. Product Cover Art (500x500)

### Bestandsnaam Conventie
```
{sku-lowercase}-{naam-slug}.webp
```
Voorbeelden:
- `sw-001-zelda-breath-of-the-wild.webp`
- `con-019-nes.webp`
- `gb-001-pokmon-red.webp`

### Waar te vinden (prioriteit)
1. **Amazon** (amazon.nl / amazon.de) — zoek op game naam + platform
   - Meestal de beste kwaliteit box art
   - Rechtermuisknop > "Afbeelding opslaan als..."
2. **eBay** (ebay.com) — zoek op "{game naam} {platform} PAL box art"
   - Goede kwaliteit, vaak PAL versies
3. **Nintendo.nl / Nintendo.com** — officieel materiaal
4. **MobyGames** (mobygames.com) — uitgebreide cover art database
5. **Cover Project** (thecoverproject.net) — hoge resolutie covers

### Zoektermen die werken
```
"{game naam}" "{platform}" PAL EUR box art cover high resolution
"{game naam}" "{platform}" game case cover art
```

### Vermijd
- Google Images thumbnails (te klein, lage kwaliteit)
- Fan art of custom covers
- NTSC/JP versies (tenzij geen PAL beschikbaar)
- Afbeeldingen kleiner dan 300x300 px
- Watermerken of logo's van andere sites

### Conversie naar WebP
```bash
# Met Sharp (Node.js) - aanbevolen
node -e "
const sharp = require('sharp');
sharp('input.jpg')
  .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile('public/images/products/sw-164-game-naam.webp');
"

# Met Python (PIL/Pillow)
python3 -c "
from PIL import Image
img = Image.open('input.jpg').convert('RGB')
img.thumbnail((500, 500), Image.LANCZOS)
img.save('public/images/products/sw-164-game-naam.webp', 'WEBP', quality=85)
"
```

---

## 2. Nintendo Tijdlijn Afbeeldingen (HQ, max 1920x1080)

### Console Foto's

| Console | Bestandsnaam | Bron |
|---|---|---|
| NES | `nes-console.webp` | Wikimedia Commons |
| Game Boy | `gameboy-console.webp` | Wikimedia Commons |
| SNES | `snes-console.webp` | Wikimedia Commons |
| N64 | `n64-console.webp` | Wikimedia Commons |
| GameCube | `gamecube-console.webp` | Wikimedia Commons |
| DS | `ds-console.webp` | Wikimedia Commons |
| Wii | `wii-console.webp` | Wikimedia Commons |
| 3DS | `3ds-console.webp` | Wikimedia Commons |
| Wii U | `wiiu-console.webp` | Wikimedia Commons |
| Switch | `switch-console.webp` | Wikimedia Commons |

### Waar te vinden (prioriteit)
1. **Wikimedia Commons** (commons.wikimedia.org) — Creative Commons licentie
   - Zoek: `Nintendo {console naam}`
   - Kies altijd de hoogste resolutie beschikbaar
   - Klik op de afbeelding > "Origineel bestand" of "Volledige resolutie"
   - URL patroon: `https://upload.wikimedia.org/wikipedia/commons/...`
2. **Nintendo Persmateriaal** — officieel
3. **Press kits** van Nintendo — hoge resolutie promo materiaal

### Zoektermen voor Wikimedia
```
Nintendo {console} console photo
Nintendo {console} hardware
{console} PAL version
```

### Conversie naar WebP (HQ)
```bash
# Met Sharp (Node.js) - aanbevolen
node -e "
const sharp = require('sharp');
sharp('input.jpg')
  .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile('public/images/nintendo/console-naam.webp');
"
```

---

## 3. Stap-voor-Stap: Nieuwe Afbeelding Toevoegen

### Product Cover Art
1. Zoek de juiste afbeelding (zie bronnen hierboven)
2. Download de hoogste resolutie beschikbaar
3. Controleer:
   - Is het de PAL/EUR versie? (niet NTSC/JP)
   - Is het officieel box art? (geen fan art)
   - Is de resolutie minimaal 300x300?
   - Geen watermerken?
4. Converteer naar WebP 500x500 (zie commando's hierboven)
5. Sla op als `public/images/products/{sku-lower}-{naam-slug}.webp`
6. Update `image` veld in `src/data/products.json`

### Nintendo Tijdlijn Afbeelding
1. Ga naar Wikimedia Commons
2. Zoek op de console/game naam
3. Download de hoogste resolutie (origineel bestand)
4. Controleer:
   - Minimaal 1920x1080 of hoger
   - Duidelijke, scherpe foto
   - Witte of transparante achtergrond voor consoles
   - Geen watermerken
5. Converteer naar WebP max 1920x1080 (zie commando's hierboven)
6. Sla op in `public/images/nintendo/`
7. Update de referentie in `src/app/nintendo/page.tsx`

---

## 4. Kwaliteitscontrole Checklist

Controleer ALTIJD voor je commit:

- [ ] Bestand is WebP formaat
- [ ] Bestandsgrootte < 200KB (producten < 50KB)
- [ ] Geen watermerken of logo's van derden
- [ ] Juiste resolutie (500x500 producten, max 1920x1080 overig)
- [ ] Bestandsnaam volgt de conventie
- [ ] Afbeelding is scherp en duidelijk
- [ ] PAL/EUR versie voor box art
- [ ] Referentie in code is correct bijgewerkt

---

## 5. Hulp Commando's

### Controleer bestandsgrootte
```bash
ls -lh public/images/products/*.webp | sort -k5 -h
```

### Controleer afbeelding dimensies
```bash
node -e "
const sharp = require('sharp');
sharp('public/images/products/sw-001.webp').metadata().then(m =>
  console.log(m.width + 'x' + m.height, m.format, m.size + ' bytes')
);
"
```

### Batch conversie (map vol JPEGs)
```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const dir = './downloads';
fs.readdirSync(dir)
  .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  .forEach(async f => {
    const out = f.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    await sharp(path.join(dir, f))
      .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join('public/images/products', out));
    console.log('Geconverteerd:', out);
  });
"
```

### Controleer of alle producten een afbeelding hebben
```bash
node -e "
const products = require('./src/data/products.json');
const fs = require('fs');
let missing = 0;
products.forEach(p => {
  if (!p.image || !fs.existsSync('public' + p.image)) {
    console.log('MISSING:', p.sku, p.name, p.image);
    missing++;
  }
});
console.log('Totaal ontbrekend:', missing, '/', products.length);
"
```

---

## 6. Veelgemaakte Fouten

| Fout | Oplossing |
|---|---|
| Te kleine afbeelding (<300px) | Zoek altijd originele resolutie, niet thumbnails |
| NTSC/JP box art | Zoek specifiek op "PAL" of "EUR" versie |
| JPG/PNG niet geconverteerd | Altijd converteren naar WebP met Sharp |
| Verkeerde bestandsnaam | Gebruik altijd `{sku-lower}-{naam-slug}.webp` |
| Wikimedia HTML ipv afbeelding | Download via "Origineel bestand" link, niet de pagina URL |
| Bestand te groot (>500KB) | Verklein met Sharp resize + quality 85 |
| Fan art ipv officieel | Gebruik alleen officieel materiaal of Wikimedia Commons |
