# Foto Handleiding — Gameshop Enter

> Handleiding voor afbeeldingen. Volg STRIKT.

---

## GOUDEN REGELS

1. **PAL/EUR versies** — PEGI rating, nooit ESRB of CERO
2. **Witte achtergrond** — Product covers altijd wit
3. **Consoles = LOS** — Zonder doos, alleen apparaat
4. **Games = PAL box art** — Europese voorkant met PEGI
5. **Controleer VOOR opslaan** — MIME type, grootte, dimensies

### PAL vs NTSC herkenning

| Kenmerk | PAL (Europa) | NTSC (Amerika) | NTSC-J (Japan) |
|---|---|---|---|
| Rating | **PEGI** (3,7,12,16,18) | **ESRB** (E,T,M) | **CERO** (A-D,Z) |
| Taal | Engels/Meertalig | Engels | Japans |

---

## Specificaties

| Type | Formaat | Resolutie | Kwaliteit | Achtergrond | Map |
|---|---|---|---|---|---|
| Product covers | WebP | 500x500 | q82, effort 6 | Wit (contain) | `public/images/products/` |
| PlatformGrid | WebP | max 800x600 | q85, effort 6 | Transparant | `public/images/nintendo/` |

### Bestandsnaam
```
{sku-lowercase}-{naam-slug}.webp
```
Voorbeeld: `sw-001-zelda-breath-of-the-wild.webp`

---

## Bronnen (prioriteit)

### Games
1. Amazon.nl/de — PAL box art
2. MobyGames — kies "PAL/Europe"
3. Cover Project / eBay.nl

### Consoles
1. Wikimedia Commons — clean product foto's
2. Amazon.nl/de
3. Nintendo.nl persmateriaal

---

## Scripts

| Commando | Doel |
|---|---|
| `node scripts/manage-products.js images` | Check alle afbeeldingen |
| `node scripts/manage-products.js normalize` | Normaliseer naar 500x500 |
| `node scripts/manage-products.js optimize` | Compressie optimalisatie |
| `node scripts/manage-products.js mismatches` | Foto-product mismatches |
| `node scripts/download-cover.js --check` | Ontbrekende covers vinden |
| `node scripts/download-cover.js --fix` | Alle ontbrekende downloaden (parallel) |
| `node scripts/download-cover.js --fix SKU` | 1 cover downloaden |
| `node scripts/download-cover.js --batch SKU1 SKU2` | Meerdere downloaden |

### Workflow
```
1. node scripts/download-cover.js --check     # Wat ontbreekt?
2. node scripts/download-cover.js --fix        # Download ontbrekende
3. node scripts/manage-products.js normalize   # 500x500 wit
4. node scripts/manage-products.js optimize    # Compressie
5. npm run build                               # Test
```

### Sharp instellingen

**Product covers:**
```javascript
sharp(input)
  .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .webp({ quality: 82, effort: 6, smartSubsample: true })
```

**Console/PlatformGrid:**
```javascript
sharp(input)
  .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 85, effort: 6, smartSubsample: true })
```

---

## PAL Model Verschillen

| Console | PAL vs NTSC |
|---|---|
| **SNES** | GROOT: PAL = afgerond + kleurrijke knoppen, US = hoekig + paars |
| Overige | Minimaal tot geen verschil |

---

## Veelgemaakte Fouten

| Fout | Herkenning | Oplossing |
|---|---|---|
| NTSC box art | ESRB rating | Zoek "PAL EUR" |
| Japanse versie | Japanse tekst | Zoek "European" |
| Console in doos | Verpakking zichtbaar | Zoek "console only" |
| US SNES model | Hoekig, paarse knoppen | PAL = afgerond |
| HTML i.p.v. afbeelding | `file -b --mime-type` = text/html | Directe image URL gebruiken |
| Te klein bestand | < 5KB | Opnieuw zoeken |

---

## AI Agent Checklist

```
1. Download afbeelding
2. file -b --mime-type → moet image/* zijn
3. Grootte > 5KB
4. sharp metadata → check dimensies
5. Converteer naar WebP 500x500
6. Update products.json
7. npm run build
8. Commit + push
```

**ALTIJD `fit: 'contain'`** — NOOIT `fit: 'inside'` voor product covers.
