# Foto Handleiding — Gameshop Enter

> Handleiding voor het vinden, downloaden en uploaden van hoge kwaliteit afbeeldingen.
> Volg deze stappen om ALTIJD de juiste foto's te krijgen.

---

## GOUDEN REGELS (ALTIJD OPVOLGEN)

1. **ALLEEN PAL/EUR versies** — Nooit Amerikaanse (NTSC-U) of Japanse (NTSC-J) versies
2. **Witte of transparante achtergrond** — Vooral voor consoles en hardware
3. **Console = LOS apparaat** — Zonder doos, zonder verpakking, alleen het apparaat zelf
4. **Games = PAL box art** — De Europese voorkant van de doos (herkenbaar aan PEGI rating)
5. **Minimaal 4K-kwaliteit zoeken** — Download altijd de hoogste resolutie die beschikbaar is
6. **Controleer VOOR je opslaat** — Kijk of het echt de juiste foto is

### Hoe herken je PAL vs NTSC?

| Kenmerk | PAL (Europa) | NTSC (Amerika) | NTSC-J (Japan) |
|---|---|---|---|
| Rating label | **PEGI** (3, 7, 12, 16, 18) | **ESRB** (E, T, M) | **CERO** (A, B, C, D, Z) |
| Taal op cover | Engels/Nederlands/Meertalig | Engels | Japans |
| Nintendo Seal | "Official Nintendo Seal" (rond) | "Official Nintendo Seal of Quality" | Japanse tekst |
| Barcode positie | Vaak onderkant | Vaak onderkant | Vaak zijkant |
| DS/3DS kleur strip | Blauw (DS), wit/rood (3DS) | Grijs/zwart | Varieert |

**Vuistregel:** Zie je een PEGI logo? Dan is het PAL. Zie je ESRB? Fout, zoek opnieuw.

---

## Snelle Referentie

| Type | Formaat | Resolutie | Kwaliteit | Achtergrond | Locatie |
|---|---|---|---|---|---|
| Product covers (games) | WebP | 500x500 px | 85% | N.v.t. (box art) | `public/images/products/` |
| Product covers (consoles) | WebP | 500x500 px | 85% | Wit/transparant | `public/images/products/` |
| Nintendo tijdlijn consoles | WebP | max 1920x1080 px | 85% | Wit/transparant | `public/images/nintendo/` |
| Nintendo tijdlijn games | WebP | max 1920x1080 px | 85% | N.v.t. | `public/images/nintendo/` |
| Overige afbeeldingen | WebP | max 1920x1080 px | 85% | Wit bij voorkeur | `public/images/` |

---

## 1. Product Cover Art — Games (500x500)

### Wat je zoekt
- **Voorkant van de PAL/EUR doos** (niet achterkant, niet zijkant)
- **PEGI rating zichtbaar** = bewijs dat het de Europese versie is
- **Hoge resolutie** — minimaal 500x500, bij voorkeur groter
- **Geen hoeken afgesneden**, complete box art

### Bestandsnaam Conventie
```
{sku-lowercase}-{naam-slug}.webp
```
Voorbeelden:
- `sw-001-zelda-breath-of-the-wild.webp`
- `gb-001-pokmon-red.webp`
- `n64-002-zelda-ocarina-of-time.webp`

### Waar te vinden (prioriteit)
1. **Amazon.nl / Amazon.de** — zoek op game naam + platform
   - Meestal de beste kwaliteit PAL box art
   - Let op: Amazon.com toont vaak NTSC versies!
2. **MobyGames** (mobygames.com) — kies "PAL" of "Europe" cover
   - Heeft aparte covers per regio, kies altijd PAL
3. **Cover Project** (thecoverproject.net) — hoge resolutie covers
4. **eBay.nl / eBay.co.uk** — zoek op "{game naam} {platform} PAL"
5. **Nintendo.nl** — officieel materiaal (alleen recent)

### Zoektermen die werken
```
"{game naam}" "{platform}" PAL EUR box art cover high resolution
"{game naam}" "{platform}" European cover PEGI
"{game naam}" "{platform}" PAL front cover
```

### Vermijd ALTIJD
- ESRB-rated covers (dat is Amerikaans!)
- Japanse covers met Japanse tekst
- Google Images thumbnails (te klein)
- Fan art of custom covers
- Afbeeldingen kleiner dan 300x300 px
- Watermerken of logo's van andere sites
- Foto's van dozen (slechte kwaliteit, scheef, schaduwen)
- Achterkant van de doos

---

## 2. Product Cover Art — Consoles & Hardware (500x500)

### Wat je zoekt
- **Los apparaat** — ZONDER doos, ZONDER verpakking
- **Witte of transparante achtergrond** — clean product foto
- **Europees/PAL model** — kan subtiel verschillen van US/JP model
- **Alle onderdelen zichtbaar** — console + standaard controllers indien van toepassing
- **Hoge resolutie** — minimaal 500x500

### Bestandsnaam Conventie
```
con-{NNN}-{console-naam-slug}.webp
```
Voorbeelden:
- `con-001-nintendo-switch-oled-wit.webp`
- `con-019-nes.webp`
- `con-016-gamecube-paars.webp`

### Waar te vinden (prioriteit)
1. **Wikimedia Commons** — zoek op "Nintendo {console}"
   - Beste bron voor clean product foto's op witte achtergrond
   - Let op: kies foto's MET controller(s) erbij waar relevant
2. **Amazon.nl / Amazon.de** — product foto's zijn clean
3. **Nintendo.nl persmateriaal** — officieel
4. **iFixit** — heeft goede hardware foto's

### Zoektermen
```
Nintendo {console} PAL console white background
Nintendo {console} product photo transparent
"Nintendo {console}" site:commons.wikimedia.org
```

### Console foto checklist
- [ ] Los apparaat, GEEN doos eromheen
- [ ] Witte of transparante achtergrond
- [ ] PAL/EUR model (niet US/JP)
- [ ] Controller(s) erbij indien relevant (bijv. Wii Remote bij Wii)
- [ ] Scherp, goed belicht, geen schaduwen

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

## 3. Nintendo Tijdlijn Afbeeldingen (HQ, max 1920x1080)

### Console Foto's — HUIDIGE BESTANDEN

| Console | Bestandsnaam | Bron | Status |
|---|---|---|---|
| NES | `nes-console.webp` | Wikimedia Commons | OK — los apparaat, witte achtergrond |
| Game Boy | `gameboy-console.webp` | Wikimedia Commons | OK — los apparaat |
| SNES | `snes-console.webp` | Wikimedia Commons | OK — PAL model |
| N64 | `n64-console.webp` | Wikimedia Commons | OK — met controller |
| GameCube | `gamecube-console.webp` | Wikimedia Commons | OK — paars PAL model |
| DS | `ds-console.webp` | Wikimedia Commons | OK — open, twee schermen |
| Wii | `wii-console.webp` | Wikimedia Commons | OK — met Wii Remote |
| 3DS | `3ds-console.webp` | Wikimedia Commons | OK — open |
| Wii U | `wiiu-console.webp` | Wikimedia Commons | OK — met GamePad |
| Switch | `switch-console.webp` | Wikimedia Commons | OK — met Joy-Cons |

### Vereisten voor tijdlijn console foto's
- **ALLEEN het losse apparaat** — geen doos, geen verpakking, geen handleiding
- **Witte of transparante achtergrond** — geen drukke achtergrond
- **PAL/EUR model** — subtiele verschillen met US/JP (bijv. SNES heeft ander design in JP)
- **Met standaard controller** waar relevant (N64 + controller, Wii + Wii Remote)
- **Hoge resolutie** — minimaal 1920x1080, bij voorkeur 4K+
- **Scherp en goed belicht** — studiokwaliteit

### Waar te vinden (prioriteit)
1. **Wikimedia Commons** (commons.wikimedia.org) — Creative Commons licentie
   - Zoek: `Nintendo {console naam} console`
   - Klik op afbeelding > kies "Origineel bestand" of hoogste resolutie
   - **LET OP:** Download het bestand zelf, niet de HTML pagina!
   - URL moet eindigen op `.jpg`, `.jpeg`, `.png` of `.webp`
   - URL patroon: `https://upload.wikimedia.org/wikipedia/commons/...`
2. **Nintendo Persmateriaal** — officieel promo materiaal
3. **iFixit teardowns** — goede hardwarefoto's

### Zoektermen voor Wikimedia
```
Nintendo {console} console white background
Nintendo {console} hardware photo
"Nintendo {console}" PAL European
{console} product shot
```

### Game promo afbeeldingen voor de tijdlijn
- Zoek: `{game naam} cover art` of `{game naam} key art`
- **Key art** (promotiemateriaal) heeft de voorkeur boven box art voor de tijdlijn
- Key art is altijd regio-onafhankelijk (geen PAL/NTSC verschil)
- Bronnen: Nintendo perssite, Wikimedia, officieel promotiemateriaal

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

## 4. Stap-voor-Stap: Nieuwe Game Cover Toevoegen

1. **Bepaal de regio**: we verkopen PAL/EUR, dus zoek ALTIJD de Europese versie
2. **Zoek de afbeelding** op Amazon.nl/de, MobyGames (kies "PAL" tab), of Cover Project
3. **Controleer VOOR download**:
   - [ ] PEGI rating zichtbaar? (niet ESRB = fout!)
   - [ ] Voorkant van de doos? (niet achterkant)
   - [ ] Geen Japanse tekst op de cover?
   - [ ] Resolutie minimaal 500x500?
   - [ ] Geen watermerken, stickers, of prijslabels?
   - [ ] Geen foto van een echte doos (scheef, schaduwen)?
4. **Download** de hoogste resolutie beschikbaar
5. **Converteer** naar WebP 500x500 (zie commando's hierboven)
6. **Bestandsnaam**: `{sku-lower}-{naam-slug}.webp`
7. **Sla op** in `public/images/products/`
8. **Update** het `image` veld in `src/data/products.json`
9. **Verifieer** met `npm run build` dat alles werkt

### Stap-voor-Stap: Nieuwe Console Foto Toevoegen

1. **Zoek op Wikimedia Commons**: `Nintendo {console} console`
2. **Controleer VOOR download**:
   - [ ] Is het een los apparaat? (GEEN doos eromheen!)
   - [ ] Witte of transparante achtergrond?
   - [ ] PAL/EUR model? (SNES: afgerond design, niet hoekig US model)
   - [ ] Scherpe, goed belichte foto?
   - [ ] Resolutie minimaal 1920x1080?
   - [ ] Geen watermerken?
   - [ ] Controller erbij waar relevant?
3. **Download** het originele bestand (hoogste resolutie)
4. **Converteer** naar WebP max 1920x1080
5. **Sla op** in juiste map (`public/images/products/` of `public/images/nintendo/`)
6. **Update** referenties in de code
7. **Verifieer** met `npm run build`

### PAL vs NTSC Model Verschillen (BELANGRIJK!)

| Console | PAL model | NTSC (VS) model | Verschil |
|---|---|---|---|
| **SNES** | Afgerond design, kleurrijke knoppen | Hoekig "boxy" design, paarse knoppen | GROOT verschil! |
| **NES** | Zelfde als VS ("toaster" design) | Idem | Geen verschil |
| **N64** | Identiek aan VS model | Idem | Geen verschil |
| **GameCube** | Identiek, soms andere kleuren | Idem | Minimaal |
| **Game Boy** | Iets andere tekst op behuizing | Idem | Minimaal |
| **DS/3DS** | Andere kleuropties beschikbaar | Idem | Minimaal |
| **Wii** | Identiek | Idem | Geen verschil |
| **Switch** | Identiek | Idem | Geen verschil |

**LET OP: SNES is het meest kritisch!** Het PAL/EUR model (afgerond, kleurrijke knoppen) ziet er compleet anders uit dan het US model (hoekig, paars). Gebruik ALTIJD het PAL model.

---

## 5. Kwaliteitscontrole Checklist (VERPLICHT)

### Voor ELKE afbeelding, controleer ALLES:

**Regio & Inhoud:**
- [ ] PAL/EUR versie (PEGI rating, geen ESRB, geen Japanse tekst)
- [ ] Juiste product (naam + platform komen overeen met products.json)
- [ ] Officieel materiaal (geen fan art, geen mockups)

**Technisch:**
- [ ] Bestand is WebP formaat
- [ ] Bestandsgrootte < 200KB (producten < 50KB idealiter)
- [ ] Juiste resolutie (500x500 producten, max 1920x1080 overig)
- [ ] Afbeelding is scherp en duidelijk (niet wazig, niet gepixeld)
- [ ] Bestandsnaam volgt de conventie exact

**Visueel:**
- [ ] Geen watermerken, stickers, of prijslabels
- [ ] Geen schaduwen of scheef gefotografeerd (clean scan/render)
- [ ] Consoles: witte/transparante achtergrond, los apparaat, GEEN doos
- [ ] Games: volledige voorkant box art, niets afgesneden

**Code:**
- [ ] Referentie in code/JSON is correct bijgewerkt
- [ ] `npm run build` slaagt zonder fouten

### Snelle visuele test
Open de afbeelding en stel jezelf deze vragen:
1. Zou ik dit op een professionele webshop verwachten? Ja = goed.
2. Zie ik een PEGI logo (games)? Ja = PAL, goed. Nee = controleer regio.
3. Is de achtergrond clean (consoles)? Ja = goed. Nee = zoek opnieuw.
4. Is het product scherp en goed belicht? Ja = goed. Nee = zoek opnieuw.

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

## 7. Veelgemaakte Fouten en Oplossingen

| # | Fout | Hoe herken je het? | Oplossing |
|---|---|---|---|
| 1 | **Amerikaanse box art (NTSC)** | ESRB rating (E, T, M) ipv PEGI | Zoek specifiek op "PAL" of "EUR" + kijk naar rating |
| 2 | **Japanse versie** | Japanse tekst, CERO rating | Zoek op "PAL" of "European" |
| 3 | **Console IN doos** | Verpakking zichtbaar | Zoek "console only", "loose", "without box" |
| 4 | **US SNES model** | Hoekig/boxy design, paarse knoppen | PAL SNES = afgerond, kleurrijke A/B/X/Y knoppen |
| 5 | **Te kleine afbeelding** | Wazig, gepixeld | Zoek altijd "high resolution" of origineel bestand |
| 6 | **Foto van echte doos** | Scheef, schaduwen, reflecties | Zoek clean scan of officieel render |
| 7 | **Fan art / custom cover** | Ziet er "anders" uit | Gebruik alleen officieel materiaal |
| 8 | **JPG/PNG niet geconverteerd** | Verkeerde extensie | Altijd converteren naar WebP met Sharp |
| 9 | **Wikimedia HTML ipv afbeelding** | Bestand < 5KB, is HTML | Download via "Origineel bestand" link, check MIME type |
| 10 | **Bestand te groot** | > 500KB | Resize + quality 85 met Sharp |
| 11 | **Verkeerde bestandsnaam** | Past niet bij SKU | Gebruik altijd `{sku-lower}-{naam-slug}.webp` |
| 12 | **Achterkant box art** | Screenshots, beschrijving zichtbaar | Zoek specifiek "front cover" |

### Automatische controle na download
```bash
# Check of het bestand echt een afbeelding is (geen HTML)
file -b --mime-type /path/to/downloaded/file
# Moet zijn: image/jpeg, image/png, image/webp
# Als het "text/html" is: je hebt de webpagina gedownload, niet de afbeelding!

# Check bestandsgrootte (moet > 5KB zijn)
ls -lh /path/to/downloaded/file
# < 5KB = waarschijnlijk een foutpagina of thumbnail

# Check dimensies
node -e "require('sharp')('bestand.jpg').metadata().then(m => console.log(m.width+'x'+m.height))"
# Product covers: minimaal 300x300
# Tijdlijn: minimaal 1920x1080
```

---

## 8. AI Agent Instructies (voor Claude / AI assistenten)

### Bij het downloaden van afbeeldingen ALTIJD:

1. **Controleer het gedownloade bestand**:
   ```bash
   file -b --mime-type /pad/naar/bestand  # Moet image/* zijn, NIET text/html
   ls -l /pad/naar/bestand                # Moet > 5KB zijn
   ```

2. **Bij Wikimedia Commons**:
   - Gebruik ALTIJD de directe bestandslink (`https://upload.wikimedia.org/...`)
   - NOOIT de pagina-link (`https://commons.wikimedia.org/wiki/File:...`)
   - Voeg een User-Agent header toe: `User-Agent: GameshopEnter/1.0`

3. **Verifieer na conversie**:
   ```bash
   node -e "require('sharp')('output.webp').metadata().then(m => console.log(JSON.stringify(m, null, 2)))"
   ```

4. **Bij twijfel over PAL/NTSC**:
   - Zoek de afbeelding op MobyGames met regio-filter
   - Controleer op PEGI vs ESRB rating
   - Bij consoles: controleer het SNES design (afgerond = PAL)

5. **Fallback strategie als geen PAL gevonden**:
   - Gebruik key art / promotiemateriaal (regio-onafhankelijk)
   - Als absolute noodoplossing: NTSC versie MET opmerking in commit message

### Kwaliteitsgarantie workflow voor agents
```
1. Download afbeelding
2. Check MIME type (file -b --mime-type)
3. Check bestandsgrootte (> 5KB)
4. Check dimensies (sharp metadata)
5. Visuele check: is het de juiste content?
6. Converteer naar WebP
7. Verifieer WebP output
8. Pas referentie aan in code/JSON
9. npm run build
10. Commit met beschrijving wat er gewijzigd is
```
