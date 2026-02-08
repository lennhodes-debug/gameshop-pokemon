# Claude Code Optimalisatie — Gameshop Enter

> Handleiding voor maximale effectiviteit van Claude Code voor dit project.
> Gebaseerd op online research, community tips, en projectspecifieke ervaring.
> Bijgewerkt: 2026-02-08

---

## Inhoudsopgave

1. [CLAUDE.md Best Practices](#claudemd-best-practices)
2. [Memory Systeem](#memory-systeem)
3. [Parallel Agents](#parallel-agents)
4. [Effectieve Prompts](#effectieve-prompts)
5. [Workflow Optimalisaties](#workflow-optimalisaties)
6. [Git Integratie](#git-integratie)
7. [Foutafhandeling](#foutafhandeling)
8. [Project-specifieke Patronen](#project-specifieke-patronen)
9. [Veelgemaakte Fouten](#veelgemaakte-fouten)
10. [Geavanceerde Technieken](#geavanceerde-technieken)

---

## CLAUDE.md Best Practices

### Structuur
1. **Begin met gedragsregels** - Wat ALTIJD moet gelden, bovenaan
2. **Projectoverzicht kort en bondig** - Tech stack, commands, status
3. **Bestandsstructuur** - Zodat Claude weet waar alles staat
4. **Interfaces/types** - Exacte TypeScript types als referentie
5. **Business logica** - Prijzen, shipping, cart logica
6. **Veelvoorkomende taken** - Stap-voor-stap instructies
7. **Quick reference** - Kopieer-en-plak secties

### Tips
- **Houd het beknopt** - Claude leest dit bij ELKE sessie; hoe korter, hoe sneller
- **Gebruik tabellen** - Sneller te scannen dan proza
- **Wees prescriptief** - "Doe X" niet "Je zou X kunnen doen"
- **Update regelmatig** - Verwijder verouderde info, voeg nieuwe patronen toe
- **Geen duplicatie** - Verwijs naar andere bestanden voor details
- **Laat Claude het updaten** - "Update CLAUDE.md met wat je geleerd hebt"

### Anti-patronen
- Te lange CLAUDE.md (>500 regels wordt traag)
- Vage instructies ("wees voorzichtig met X")
- Tegenstrijdige regels
- Informatie die snel veroudert (versienummers die vaak wijzigen)

---

## Memory Systeem

### Hoe het werkt
- `/root/.claude/projects/-home-user-gameshop/memory/` — persistent directory
- `MEMORY.md` wordt ALTIJD geladen in system prompt (max 200 regels)
- Extra bestanden (bijv. `debugging.md`, `patterns.md`) alleen geladen als nodig

### Best Practices
1. **MEMORY.md = index** - Kort en bondig, verwijzingen naar detail-bestanden
2. **Semantisch organiseren** - Per onderwerp, niet chronologisch
3. **Actiegerichte notities** - "Doe X" niet "We hebben X geleerd"
4. **Verwijder verouderde info** - Regelmatig opschonen
5. **Projectspecifiek** - Alleen wat relevant is voor DIT project

### Ons Memory Systeem
```
memory/
├── MEMORY.md              ← Hoofdindex (altijd geladen, max 200 regels)
├── cover-art-tips.md      ← Tips voor cover art download
├── debugging.md           ← Debugging patronen en oplossingen
├── performance.md         ← Performance optimalisaties
└── shell-gotchas.md       ← Shell/Node.js valkuilen
```

---

## Parallel Agents

### Wanneer parallel
- **Onafhankelijke taken** - Meerdere bestanden lezen, meerdere zoekopdrachten
- **Research + implementatie** - Research in achtergrond, tegelijk beginnen met code
- **Meerdere platforms** - Downloads per platform parallel

### Wanneer NIET parallel
- **Afhankelijke stappen** - Bestand lezen -> bewerken -> opslaan
- **Dezelfde resource** - Twee agents die products.json willen schrijven
- **Rate-limited APIs** - Google Image Search, PriceCharting

### Patroon: Research + Werk
```
1. Launch research agent in achtergrond
2. Begin met werk op basis van bestaande kennis
3. Integreer research resultaten zodra beschikbaar
```

### Patroon: Parallel Platform Downloads
```
1. NES covers herdownloaden (agent 1)
2. SNES covers herdownloaden (agent 2)
3. N64 covers herdownloaden (agent 3)
4. Resultaten samenvoegen
```

---

## Effectieve Prompts

### Voor code-taken
- **Specifiek**: "Voeg GameTDB als bron toe aan download-cover.js, na PriceCharting maar voor Google"
- **Context**: "products.json heeft 846 producten, allemaal met image paths"
- **Verwachting**: "Commit en push na afronding"

### Voor research
- **Breed maar gericht**: "Zoek de beste gratis APIs voor PAL game cover art, focus op NES/SNES/N64"
- **Output format**: "Geef een tabel met: naam, URL, gratis/betaald, PAL support, rate limit"

### Anti-patronen
- "Verbeter de code" (te vaag)
- "Maak het beter" (geen richting)
- "Fix alle bugs" (geen scope)

---

## Workflow Optimalisaties

### 1. Lees voordat je schrijft
- ALTIJD het bestand openen voor bewerking
- Begrijp de bestaande code
- Voorkom duplicatie

### 2. Kleine commits
- Na ELKE afgeronde wijziging
- Beschrijvende commit messages (Nederlands)
- Specifiek bestanden stagen (`git add file1 file2`, niet `git add -A`)

### 3. Build verificatie
- `npm run build` na code-wijzigingen
- NOOIT `npm run prebuild` (overschrijft 846->346 producten)
- Bij build errors: direct fixen

### 4. Script bestanden voor shell commands
- Shell escapet `!==` naar `\!==` - GEBRUIK SCRIPT FILES
- Schrijf complexe Node.js logica als .js bestanden, niet inline
- `node scripts/mijn-script.js` in plaats van `node -e "..."`

### 5. curl voor externe requests
- Node.js DNS werkt NIET betrouwbaar voor externe sites
- ALTIJD `execSync('curl ...')` gebruiken
- User-Agent header meesturen
- Timeout instellen

---

## Git Integratie

### Branch Protocol
```bash
# Altijd werken op claude/ branch
git checkout claude/gameshop-local-access-hnbgR

# Na elke taak
git add specifiek-bestand.js
git commit -m "Beschrijvende Nederlandse message"
git push -u origin claude/gameshop-local-access-hnbgR
```

### Push Retry
```bash
# Bij network error: retry 4x met exponential backoff
# 2s -> 4s -> 8s -> 16s
```

### Commit Message Stijl
- Nederlands
- Beschrijvend (waarom, niet wat)
- Voorbeelden:
  - "Cover art handleiding en audit scripts toegevoegd"
  - "GameTDB als extra bron voor PAL covers"
  - "NES covers herdownload met betere bronnen"

---

## Foutafhandeling

### Bekende Shell Problemen
| Probleem | Oorzaak | Oplossing |
|---|---|---|
| `!==` wordt `\!==` | Bash history expansion | Gebruik script files |
| `${}` in strings | Bash variabele expansie | Gebruik single quotes of script files |
| Lange inline scripts | Onleesbaar, foutgevoelig | Schrijf naar bestand, run met node |

### Bekende Node.js Problemen
| Probleem | Oorzaak | Oplossing |
|---|---|---|
| DNS resolution faalt | Node.js DNS resolver | Gebruik `execSync('curl ...')` |
| Sharp `fit: 'inside'` | Verkeerde resize mode | ALTIJD `fit: 'contain'` voor covers |
| products.json overschreven | prebuild script | NOOIT `npm run prebuild` uitvoeren |

### Bekende Image Problemen
| Probleem | Oorzaak | Oplossing |
|---|---|---|
| NTSC/JP cover | Google vindt verkeerde regio | PriceCharting PAL als primaire bron |
| Te klein (<5KB) | Thumbnail gedownload | Minimumgrootte verhogen, andere bron |
| Verkeerde game | Generieke naam | Platformnaam toevoegen aan query |
| Rate limiting | Te veel Google queries | Max ~800/sessie, gebruik PC eerst |
| Framer Motion ease error | Array type inferentie | `as const` toevoegen |

---

## Project-specifieke Patronen

### Data Flow
```
products.json (bron van waarheid)
  -> getAllProducts() / getProductBySku()
    -> Component props / useMemo filtering
      -> Render
```

### Product Wijzigingen
1. **Altijd** via products.json
2. **Nooit** rechtstreeks in componenten
3. **isPremium** auto-update bij prijswijziging (>= 50)
4. **image** pad moet matchen met bestand op disk

### Image Paden
```
SKU:    SW-001
Naam:   1-2-Switch
Bestand: sw-001-1-2-switch.webp
Pad:    /images/products/sw-001-1-2-switch.webp
Disk:   public/images/products/sw-001-1-2-switch.webp
```

### Performance Patronen
- `Set/Map` voor O(1) lookups
- `useMemo` voor filters in shop/page.tsx
- Module-level caches in products.ts
- Pre-compute SKU sort

---

## Veelgemaakte Fouten

1. **`npm run prebuild` uitvoeren** - Overschrijft 846 naar 346 producten
2. **`fit: 'inside'` gebruiken** - Moet `fit: 'contain'` zijn voor covers
3. **Inline Node.js met `!==`** - Shell escapet dit, gebruik script files
4. **`ssr: false` op homepage** - Breekt SEO
5. **`git add -A`** - Kan secrets/grote bestanden includen
6. **Footer links met "Switch"** - Moet "Nintendo+Switch" zijn
7. **Node.js fetch/http voor externe sites** - DNS werkt niet, gebruik curl
8. **ERA_IMAGES paden die niet matchen** - Moeten overeenkomen met products.json SKUs
9. **Amazon.com/co.jp images** - Zijn NTSC/JP versies, blokkeren
10. **ESRB ratings accepteren** - Alleen PEGI voor PAL/EUR

---

## Geavanceerde Technieken

### 1. Multi-Source Image Download
```
Volgorde voor game covers:
1. PriceCharting PAL -> Beste kwaliteit, regio-specifiek
2. GameTDB -> Directe URLs, NL/EU regio
3. LibRetro Thumbnails -> GitHub raw, geen rate limit
4. MobyGames -> API met EU filter
5. Google Image Search -> Laatste fallback
```

### 2. Verificatie Pipeline
```
Download -> Sharp metadata check -> Size check (>5KB) ->
Dimensions check (>100px) -> Save als WebP 500x500
```

### 3. Bulk Operations
```bash
# Platform-specifiek herdownloaden
for platform in nes snes n64 gb gba gc ds 3ds wii wiiu switch; do
  node scripts/download-cover.js --redownload $platform
done
```

### 4. Context Window Management
- Grote bestanden (products.json = 846 items) niet volledig in context laden
- Gebruik scripts voor analyse (audit-images.js, image-quality-check.js)
- Subagents voor parallelle research om hoofdcontext te sparen

### 5. Autonome Werkwijze
- Zelf bepalen wat nodig is
- Niet vragen, gewoon doen
- Commit en push na elke taak
- Handleidingen/geheugen zelf bijwerken

---

## Online Resources

### Community Tips (Affaan Mustafa - 31 Tips)
1. **Maak CLAUDE.md je "Operating System"** - Levenddocument dat groeit
2. **Organiseer met `docs/` folder** - Context laden wanneer nodig
3. **Gebruik TodoWrite** - Structuur voor complexe taken
4. **Laat Claude screenshots analyseren** - Visuele feedback
5. **Test met draft PRs** - Verificatie via GitHub
6. **Claude Code als research tool** - Web search, GitHub analyse
7. **Kies het juiste abstractieniveau** - Balans tussen vertrouwen en controle
8. **Start met lege CLAUDE.md** - Voeg toe wat je herhaalt
9. **Containers voor risicovolle taken** - Docker sandboxing
10. **Gebruik `realpath` voor absolute paden** - Voorkom pad-fouten

### Officieel
- Claude Code docs: https://docs.anthropic.com/en/docs/claude-code
- Claude Code GitHub: https://github.com/anthropics/claude-code
- MCP Servers: https://github.com/modelcontextprotocol/servers

### Hooks
- `SessionStart` - Startup taken (dependencies check, env setup)
- `PostToolUse` - Na tool gebruik (auto-lint, auto-format)
- `PreToolUse` - Voor tool gebruik (bevestiging, validatie)

---

## Checklist Nieuwe Sessie

1. CLAUDE.md en MEMORY.md worden automatisch geladen
2. `git status` + `git log --oneline -5` - Check huidige staat
3. Check branch: `claude/gameshop-local-access-hnbgR`
4. Begin met gevraagde taak
5. Commit en push na elke wijziging
6. Update memory als er nieuwe inzichten zijn
