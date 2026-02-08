# Cover Art Handleiding — Gameshop Enter

> Uitgebreide handleiding voor het vinden en downloaden van correcte game cover art.
> Specifiek gericht op PAL/EUR versies voor de Nederlandse markt.

---

## Huidige Status

| Metric | Waarde |
|---|---|
| Totaal producten | 846 |
| Met afbeelding | 846 (100%) |
| Bestanden op disk | 975 (incl. 129 wees-bestanden) |
| Verdacht klein (<15KB) | 73 stuks |
| Kapot (<5KB) | 1 (ACC-019) |
| Gemiddelde grootte | ~33KB per afbeelding |

### Kwaliteitsverdeling
- **Goed (50KB+):** 120 afbeeldingen - waarschijnlijk correct
- **Medium (15-50KB):** 652 afbeeldingen - meeste OK, sommige controleren
- **Klein (5-15KB):** 73 afbeeldingen - verdacht, vaak verkeerde/placeholder afbeeldingen
- **Tiny (<5KB):** 1 afbeelding - kapot

---

## Probleemdiagnose

### Waarom afbeeldingen verkeerd kunnen zijn

1. **Google Image Search geeft NTSC/JP versie** - Amerikaans of Japans box art i.p.v. PAL/EUR
2. **Verkeerde game** - Bij generieke zoekopdrachten kan een andere game gevonden worden
3. **Te klein/lage kwaliteit** - Thumbnail i.p.v. volledige cover
4. **Placeholder/error pages** - HTML error pagina's als image opgeslagen
5. **Accessoire foto's voor consoles** - Of andersom
6. **Fan art / mock-ups** - Niet de officiele cover

### Hoe herken je de juiste PAL/EUR versie?

- **PEGI rating** op de voorkant (3, 7, 12, 16, 18) - NIET ESRB (E, T, M)
- **Nintendo Seal of Quality** in de kleur passend bij het platform
- **Europese barcode** (begint met 45 of 87)
- **Geen "Only for" / "Not for Resale" stickers** (die zijn Amerikaans)
- **Taal op cover**: vaak Engels maar soms met meertalige achterkanttekst
- **SNES**: PAL versie heeft AFGEROND design met kleurrijke knoppen, NIET het vierkante Amerikaanse ontwerp

---

## Bronnen (Prioriteit)

### 1. PriceCharting (Primaire bron) - BESTE voor PAL covers
- **URL**: `https://www.pricecharting.com/game/{pal-platform}/{game-slug}`
- **Voordelen**: Specifiek PAL/EUR versies, hoge kwaliteit (1600px), betrouwbaar
- **Nadelen**: Niet alle games beschikbaar, slug moet exact matchen
- **Platforms**: `pal-nes`, `pal-super-nintendo`, `pal-nintendo-64`, `pal-gameboy`, `pal-gameboy-color`, `pal-gameboy-advance`, `pal-gamecube`, `pal-nintendo-ds`, `pal-nintendo-3ds`, `pal-wii`, `pal-wii-u`, `pal-nintendo-switch`
- **Regex voor images**: `https://storage.googleapis.com/images.pricecharting.com/.*/1600.jpg`

### 2. GameTDB (Uitstekend voor covers)
- **URL**: `https://art.gametdb.com/`
- **Voordelen**: Directe URL's per game ID, PAL/EUR specifiek, meerdere regio's
- **Cover URL patroon**:
  - Wii: `https://art.gametdb.com/wii/cover/NL/{game-id}.png`
  - DS: `https://art.gametdb.com/ds/cover/NL/{game-id}.png`
  - 3DS: `https://art.gametdb.com/3ds/cover/NL/{game-id}.png`
  - Wii U: `https://art.gametdb.com/wiiu/cover/NL/{game-id}.png`
  - Switch: `https://art.gametdb.com/switch/cover/NL/{game-id}.png`
  - GameCube: `https://art.gametdb.com/gc/cover/NL/{game-id}.png`
- **Regio codes**: NL (Nederlands), EN (Engels), DE (Duits), FR (Frans), EU (Europees)
- **Fallback regio volgorde**: NL -> EN -> EU -> DE -> FR

### 3. MobyGames (Breed en betrouwbaar)
- **URL**: `https://www.mobygames.com/game/{platform}/{game-slug}/cover-art/`
- **API**: `https://api.mobygames.com/v1/games/{id}/platforms/{platform_id}/covers`
- **Voordelen**: Zeer uitgebreid, meerdere regio's per game, gebruikers-geverifieerd
- **Nadelen**: API key nodig (gratis), rate limit 360 requests/uur
- **Platform IDs**: NES=22, SNES=15, N64=9, GB=10, GBC=11, GBA=12, GC=14, DS=44, 3DS=101, Wii=82, WiiU=132, Switch=203
- **Regio filter**: Gebruik `?region=EU` of `?region=Netherlands`

### 4. IGDB / Twitch API (Zeer breed)
- **URL**: `https://api.igdb.com/v4/covers`
- **Voordelen**: Covers voor vrijwel elke game, goede API
- **Nadelen**: Twitch Developer account nodig, GEEN regio-specifieke covers
- **Query**: `fields url,game; where game = {game_id};`
- **Image URL**: Verander `t_thumb` naar `t_cover_big` (264x374) of `t_1080p` (1080px)

### 5. LibRetro Thumbnails (Retro games)
- **GitHub**: `https://github.com/libretro-thumbnails/`
- **Raw URL**: `https://raw.githubusercontent.com/libretro-thumbnails/{system}/master/Named_Boxarts/{game-name}.png`
- **Systemen**: `Nintendo_-_Nintendo_Entertainment_System`, `Nintendo_-_Super_Nintendo_Entertainment_System`, `Nintendo_-_Nintendo_64`, `Nintendo_-_Game_Boy`, `Nintendo_-_Game_Boy_Color`, `Nintendo_-_Game_Boy_Advance`, `Nintendo_-_GameCube`, `Nintendo_-_Nintendo_DS`, `Nintendo_-_Nintendo_3DS`, `Nintendo_-_Wii`, `Nintendo_-_Wii_U`, `Nintendo_-_Switch`
- **Voordelen**: Gratis, geen API key, directe download
- **Nadelen**: Niet altijd PAL specifiek, bestandsnaam moet exact matchen

### 6. The Cover Project
- **URL**: `https://www.thecoverproject.net/`
- **Voordelen**: Community-driven, PAL covers beschikbaar
- **Nadelen**: Geen API, scraping nodig, minder actief onderhouden

### 7. Google Image Search (Laatste fallback)
- **URL**: `https://www.google.com/search?q={query}&tbm=isch&tbs=isz:m`
- **Query formaat**: `{game-naam} {platform} PAL Europe PEGI box art front cover`
- **Voordelen**: Vindt bijna altijd iets
- **Nadelen**: Vaak verkeerde regio, rate limiting, onbetrouwbare kwaliteit
- **Rate limit**: Max ~800 queries per sessie voordat Google blokkeert
- **Prioriteit bronnen**: amazon.de/nl > bol.com > nintendo.nl > ebayimg > mobygames > igdb

---

## Download Script (`download-cover.js`)

### Gebruik
```bash
# Status check
node scripts/download-cover.js --check

# Download ontbrekende covers
node scripts/download-cover.js --fix
node scripts/download-cover.js --fix SW-164

# Batch download
node scripts/download-cover.js --batch CON-019 CON-020

# Verifieer cover
node scripts/download-cover.js --verify SW-001

# Herdownload alles of per platform
node scripts/download-cover.js --redownload
node scripts/download-cover.js --redownload nes
```

### Workflow voor correcte covers

1. **Check huidige status**: `node scripts/download-cover.js --check`
2. **Identificeer verdachte covers**: `node scripts/image-quality-check.js`
3. **Download ontbrekende**: `node scripts/download-cover.js --fix`
4. **Herdownload per platform**: `node scripts/download-cover.js --redownload nes`
5. **Verifieer resultaten**: `node scripts/download-cover.js --verify NES-001`

### Hoe het script werkt

```
Stap 1: PriceCharting (PAL)
├── Vertaal NL naam naar Engels (NAME_MAP)
├── Genereer PriceCharting slug
├── Haal pagina op en extract 1600px images
└── Download eerste werkende image

Stap 2: Google Image Search (fallback)
├── Bouw zoekopdracht: "{naam} {platform} PAL Europe PEGI box art"
├── Filter geblokkeerde domeinen (amazon.com, amazon.co.jp, etc.)
├── Sorteer op prioriteit (amazon.de/nl, bol.com, nintendo.nl eerst)
└── Download eerste > 5KB image

Stap 3: Verwerking
├── Resize naar 500x500 (fit: 'contain', witte achtergrond)
├── Flatten (verwijder transparantie)
├── Converteer naar WebP (quality 82, effort 6)
└── Controleer: > 2KB = OK, anders verwijderen
```

### Naam Vertalingen (NAME_MAP)

Het script bevat vertalingen voor Nederlandse/afgekorte namen naar Engelse PriceCharting slugs:
- `Kirby en de Vergeten Wereld` -> `Kirby and the Forgotten Land`
- `Zelda: Breath of the Wild` -> `Legend of Zelda Breath of the Wild`
- `DK Country Returns` -> `Donkey Kong Country Returns`
- etc.

**Nieuwe vertalingen toevoegen**: Bewerk de `NAME_MAP` in `download-cover.js`.

---

## Image Specificaties

### Games
| Eigenschap | Waarde |
|---|---|
| Formaat | WebP |
| Afmetingen | 500x500 |
| Fit | `contain` (nooit `inside`) |
| Achtergrond | Wit (#FFFFFF) |
| Kwaliteit | 82 |
| Effort | 6 |
| SmartSubsample | true |
| Min. grootte | 2KB (anders verwijderd) |

### Consoles
| Eigenschap | Waarde |
|---|---|
| Formaat | WebP |
| Max afmetingen | 800x600 |
| Achtergrond | Transparant |
| Kwaliteit | 85 |
| Effort | 6 |

### Accessoires
| Eigenschap | Waarde |
|---|---|
| Formaat | WebP |
| Afmetingen | 500x500 |
| Achtergrond | Wit |
| Query | `{naam} Nintendo accessory product photo white background` |

---

## Veelvoorkomende Problemen

### "Geen geldige afbeelding (PC+Google)"
- Game naam matcht niet met PriceCharting slug
- Voeg vertaling toe aan `NAME_MAP`
- Probeer alternatieve naam/spelling

### NTSC/JP versie i.p.v. PAL
- Voeg `PAL` en `PEGI` toe aan Google query
- Blokkeer `amazon.com` en `amazon.co.jp` (al gedaan)
- Prioriteer `amazon.de`, `amazon.nl`, `bol.com`

### Te kleine bestanden
- Thumbnail i.p.v. volledige afbeelding
- Controleer of Sharp correct verwerkt
- Min. grootte verhogen naar 5KB

### Verkeerde game
- Naam te generiek (bijv. "Tetris")
- Voeg platform toe aan zoekopdracht
- Gebruik exacte PriceCharting URL

### Google rate limiting
- Max ~800 queries per sessie
- Wacht 30-60 minuten en probeer opnieuw
- Gebruik PriceCharting als primaire bron

---

## Handmatige Verificatie

### Stappen voor handmatige controle
1. Open de afbeelding in een browser: `file:///home/user/gameshop/public/images/products/{bestand}.webp`
2. Controleer:
   - Is dit de juiste game?
   - Is dit de PAL/EUR versie? (PEGI rating zichtbaar?)
   - Is de kwaliteit acceptabel?
   - Is het de voorkant van de doos?
3. Bij problemen: herdownload met `node scripts/download-cover.js --fix {SKU}`

### Bulk verificatie per platform
```bash
# Bekijk alle NES covers
ls -la public/images/products/nes-*.webp | sort -k5 -n

# Vind de kleinste covers (waarschijnlijk problemen)
ls -la public/images/products/*.webp | sort -k5 -n | head -20
```

---

## Verbetermogelijkheden

### Meer bronnen toevoegen
1. **GameTDB** - Directe URL's, PAL specifiek, geen API key nodig
2. **LibRetro Thumbnails** - GitHub raw URLs, geen rate limit
3. **MobyGames API** - Gratis API key, EU regio filter
4. **ScreenScraper** - Retro game specialiteit

### Betere naammatching
1. Fuzzy matching toevoegen (Levenshtein distance)
2. Meer NL->EN vertalingen in NAME_MAP
3. Alternatieve titels proberen (bijv. "Super Mario Bros." en "Super Mario Brothers")

### Kwaliteitscontrole
1. Automatische PEGI detectie (OCR of pattern matching)
2. Vergelijking met bekende juiste covers (hash matching)
3. Aspect ratio check (covers zijn meestal 2:3 of 3:4)

---

## Platform-specifieke Tips

### NES
- PAL versies hebben vaak "Nintendo Entertainment System" op de bovenkant
- Veelal grijze cartridge artwork
- PriceCharting: `pal-nes`

### SNES
- **PAL model = AFGEROND met kleurrijke knoppen** (rood, groen, geel, blauw)
- Amerikaanse versie is VIERKANT met paars/grijs - **NIET GEBRUIKEN**
- PriceCharting: `pal-super-nintendo`

### N64
- PAL covers zijn vaak identiek aan NTSC, alleen PEGI rating verschilt
- PriceCharting: `pal-nintendo-64`

### Game Boy / Color
- Kleine covers, moeilijk te onderscheiden per regio
- PriceCharting: `pal-gameboy`, `pal-gameboy-color`

### GBA
- PAL covers hebben "Game Boy Advance" balk bovenaan
- PriceCharting: `pal-gameboy-advance`

### GameCube
- PAL covers hebben witte/gele balk links met logo
- PriceCharting: `pal-gamecube`

### DS / 3DS
- PAL covers herkenbaar aan PEGI rating
- PriceCharting: `pal-nintendo-ds`, `pal-nintendo-3ds`

### Wii / Wii U
- PAL covers altijd met PEGI logo
- Wii covers hebben witte rand bovenaan
- PriceCharting: `pal-wii`, `pal-wii-u`

### Switch
- Meeste covers zijn wereldwijd identiek
- PAL versie heeft PEGI i.p.v. ESRB
- PriceCharting: `pal-nintendo-switch`

### Consoles
- Zoek op `{console-naam} {kleur} console product photo white background`
- Geen box art maar product foto's
- Wikimedia Commons is goede bron voor officiële foto's

### Accessoires
- Zoek op `{accessoire-naam} Nintendo accessory product photo white background`
- Product foto's, niet box art

---

## Audit Scripts

### `scripts/audit-images.js`
```bash
node scripts/audit-images.js
```
Controleert:
- Producten zonder image
- Image pad maar bestand mist
- Te kleine bestanden (<5KB)
- Wees-bestanden (op disk maar niet in products.json)
- Statistieken per platform

### `scripts/image-quality-check.js`
```bash
node scripts/image-quality-check.js
```
Controleert:
- Kwaliteitsverdeling (tiny/small/medium/good)
- Mogelijke duplicaten (zelfde bestandsgrootte)
- Gemiddelde grootte per platform

### `scripts/manage-products.js`
```bash
node scripts/manage-products.js images    # Overzicht van image status
node scripts/manage-products.js mismatches # Vind mismatches
node scripts/manage-products.js normalize  # Normaliseer image paden
node scripts/manage-products.js optimize   # Optimaliseer afbeeldingen
```
