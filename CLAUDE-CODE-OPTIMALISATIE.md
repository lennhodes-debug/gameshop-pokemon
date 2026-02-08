# Claude Code Optimalisatie — Gameshop Enter
## UITGEBREIDE AI AGENT HANDLEIDING

> **Definitieve gids** voor AI-gestuurde development op Gameshop Enter project
> Covert: Autonome werkwijze, agent patterns, decision frameworks, error handling
> **Status:** MASTER GUIDE v3.0 — Operationeel voor alle toekomstige sessies
> **Bijgewerkt:** 2026-02-08 23:45 UTC (SESSION 3)
> **Geldigheidsduur:** Permanent (update na major learnings)

---

## 🎯 KRITIEKE PRINCIPES (LEES EERST)

### 1. AUTONOMIE = SNEL WERKEN
- **Zelf kiezen** wat nodig is (niet vragen)
- **Zelf prioriteren** taken (hoogste waarde eerst)
- **Zelf committen** na elke afgeronde wijziging
- **Zelf documenteren** wat je leert

### 2. WAARDE = SPAARZAME CONTEXT
- Lees ALTIJD bestand VOOR je bewerkt
- Commit KLEIN en FOKUST (niet batchen)
- Maak DIRECTE wijzigingen (geen "je zou kunnen...")
- Update MEMORY na insights (voor volgende sessie)

### 3. KWALITEIT = GEVALIDEERDE CODE
- `npm run build` na ELKE code-wijziging
- Geen TypeScript errors (solve immediately)
- Git clean (niets uncommitted)
- Tests passeren (of doc why skipped)

---

## Inhoudsopgave

1. [Autonome Werkwijze](#autonome-werkwijze)
2. [Session Workflow](#session-workflow)
3. [CLAUDE.md Best Practices](#claudemd-best-practices)
4. [Memory Systeem](#memory-systeem)
5. [Parallel Agents](#parallel-agents)
6. [Effectieve Prompts](#effectieve-prompts)
7. [Workflow Optimalisaties](#workflow-optimalisaties)
8. [Git Integratie](#git-integratie)
9. [Foutafhandeling](#foutafhandeling)
10. [Project-specifieke Patronen](#project-specifieke-patronen)
11. [Component Deployment](#component-deployment)
12. [Veelgemaakte Fouten](#veelgemaakte-fouten)
13. [Geavanceerde Technieken](#geavanceerde-technieken)
14. [Testing & Validatie](#testing--validatie)
15. [Performance Monitoring](#performance-monitoring)

---

## Autonome Werkwijze

### Wat mag ik zelf doen (ZONDER VRAGEN)?

**Code Wijzigingen:**
- ✅ Bestaande bestanden bewerken (na lezen)
- ✅ TypeScript errors fixen
- ✅ Features toevoegen uit EXPERIENCE_OPTIMIZATION_PLAN
- ✅ Tests schrijven + runnen
- ✅ Componenten refactoren
- ✅ Performance optimalisaties

**Build & Testing:**
- ✅ `npm run build` draait (validatie)
- ✅ `npm run lint` runnen
- ✅ TypeScript strict checks

**Git Operations:**
- ✅ Commits maken (na elke taak)
- ✅ Push naar `claude/fix-cover-art-gTLvb`
- ✅ Branches aanmaken voor features
- ✅ Commits rewriting (amend) voor unfixed fouten

**Documentation:**
- ✅ MEMORY.md bijwerken
- ✅ README's schrijven
- ✅ Inline comments toevoegen waar logic onduidelijk
- ✅ Deployment guides maken

**Parallellisering:**
- ✅ Meerdere files parallel lezen
- ✅ Onafhankelijke tasks parallel uitvoeren
- ✅ Agents starten voor research

### Wat vraag ik altijd eerst?

**Destructieve operaties:**
- ❌ `git reset --hard` of `git rebase -i`
- ❌ Bestanden verwijderen (tenzij zeker ongebruikt)
- ❌ Database/data transformaties
- ❌ Breaking changes in API

**Strategie:**
- ❌ "Zal ik X doen?" → Zeg "Ik ga X doen" in output
- ❌ "Mag ik Y?" → Doe Y en doc why in commit

### Decision Framework

| Situatie | Handeling |
|---|---|
| TypeScript error | Fix direct, test, commit |
| Build warning | Investigate, fix or document |
| Feature request | Check EXPERIENCE_OPTIMIZATION_PLAN |
| Git merge conflict | Resolve, commit |
| Code smell | Refactor als tijd permits |
| Unknown pattern | Check CLAUDE.md + MEMORY.md first |
| Context limit near | Start new session, summarize learnings |

---

## Session Workflow

### Start van sessie

```bash
# 1. Check status
git status
git log --oneline -5

# 2. Lees instructies
cat CLAUDE.md  # Project rules
cat MEMORY.md  # Session state + learnings

# 3. Verify build
npm run build

# 4. Begin taak
# Kijk naar user request, map naar:
# - Feature? → EXPERIENCE_OPTIMIZATION_PLAN
# - Bug? → MEMORY.md debugging section
# - Unknown? → Ask for clarification
```

### Tijdens sessie

**Elke taak:**
1. Lees relevant bestand (voor edit)
2. Begrijp context + dependencies
3. Maak wijziging (KLEIN en FOKUST)
4. Test: `npm run build`
5. Commit met beschrijving
6. Push

**Tussen taken:**
- Check build status
- Update MEMORY.md als iets geleerd
- Plan volgende taak

### Einde sessie

**Checklist:**
- [ ] Git clean (alles committed)
- [ ] Build passing
- [ ] MEMORY.md bijgewerkt
- [ ] Relevante documentatie updated

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

## Component Deployment

### Deploy Process (GAMESHOP SPECIFIEK)

**Phase 1-4 Roadmap:**
```
Homepage Storytelling (Phase 1) ✅ DEPLOYED
  ├─ GamingEraTimeline.tsx
  ├─ GameSeriesShowcase.tsx
  └─ CollectibleShowcase.tsx

Series Detection (Phase 2) ✅ READY
  ├─ src/lib/series.ts
  ├─ SeriesBadge.tsx
  └─ SeriesCompletionCard.tsx

Product Stories (Phase 3) ✅ READY
  ├─ src/lib/gameStories.ts
  └─ GameStoryPanel.tsx

Mobile Optimization (Phase 4) ✅ DEPLOYED
  ├─ useGestureRecognition.ts
  └─ SeriesCarousel.tsx
```

### Component Checklist

Bij nieuw component:
1. **Create component file** - `src/components/...`
2. **TypeScript types** - Interfaces, props type
3. **Framer Motion** - Animations (if needed)
4. **Tailwind styling** - Mobile-first
5. **Import in parent** - page.tsx of parent component
6. **Test build** - `npm run build`
7. **Responsive check** - Mobile (sm:), tablet (md:), desktop (lg:)
8. **Commit** - "Voeg {ComponentName} toe - {beschrijving}"

### Homepage Component Order (page.tsx)

**Above fold (direct visible):**
- Hero
- TrustStrip
- FeaturedProducts
- GamingEraTimeline
- GameSeriesShowcase
- CollectibleShowcase

**Below fold (lazy loaded):**
- GameMarquee
- PlatformGrid
- AboutPreview
- ReviewsStrip
- FaqPreview
- NewsletterCTA

**Rule:** Zware animaties/large images = `dynamic()` import

---

## Testing & Validatie

### Build Validation

```bash
# ALTIJD na code wijzigingen
npm run build

# Check output:
# ✅ "Compiled successfully" = OK
# ❌ Errors = FIX direct
# ⚠️ Warnings = Document if acceptable
```

### Component Testing (Local)

```bash
npm run dev
# Open http://localhost:3000
# Test:
# - Visual appearance
# - Responsive (drag window)
# - Animations smooth
# - No console errors
```

### Build Output Checks

| Output | Meaning | Action |
|---|---|---|
| `✓ Compiled successfully` | All good | Proceed |
| `Failed to compile` | Error exists | Fix immediately |
| `Type error:` | TypeScript issue | Add types/cast as needed |
| `+XX warnings` | Non-critical issues | Document in commit if acceptable |

### SSG Validation

```bash
# Verify all 863 pages generated
npm run build | grep "SSG\|●\|○" | wc -l

# Should show 863+ routes
# If <863 = missing SKUs or broken links
```

---

## Performance Monitoring

### Key Metrics

**Build Time:**
- Normal: 60-90s
- With images: 90-120s
- Target: <120s

**Bundle Size:**
- Current: ~87KB first load JS
- Monitor: Growth per commit
- Alert if: +50KB unexpected

**Image Coverage:**
- Target: 846/846 (100%)
- Current: 754/846 (89.1%)
- Missing: 92 (being deployed)

### Performance Optimization Strategies

**Component Level:**
```typescript
// ✅ DO: Memoize expensive render
const MyComponent = memo(({ data }) => {
  const filtered = useMemo(() => data.filter(...), [data]);
  return <div>{filtered.map(...)}</div>;
});

// ❌ DON'T: Inline calculations
const MyComponent = ({ data }) => {
  const filtered = data.filter(...); // Recalc every render!
  return <div>{filtered.map(...)}</div>;
};
```

**List Rendering:**
```typescript
// ✅ DO: Separate component
const Item = memo(({ item }) => <div>{item.name}</div>);

// ❌ DON'T: Inline JSX in map
{items.map(item => <div>{item.name}</div>)}
```

**Animation:**
```typescript
// ✅ DO: Use CSS transforms (fast)
<motion.div style={{ x: 0, y: 0 }} />

// ❌ DON'T: Animate width/height (slow)
<motion.div animate={{ width: 100, height: 100 }} />
```

### Monitoring Commands

```bash
# Check bundle size
npm run build | grep "Size"

# Find slow components (via NextJS)
npm run build | grep "\.webp\|slow"

# Verify all images loaded
ls public/images/products/*.webp | wc -l
```

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

## Agent-Specifieke Optimalisaties

### 1. Context Management

**Bestandsgrootte:**
- products.json = 846 items (~500KB) - NOOIT fully lezen tenzij nodig
- Gebruik: `jq '.[] | select(.sku=="SW-001")' src/data/products.json`
- Scripts voor: filtering, mapping, analysis

**Memory usage:**
- Eerste call: Lees CLAUDE.md + MEMORY.md (~5% context)
- Werk: Blijft ~60-70% voor code/output
- Einde: Update MEMORY.md met insights

### 2. Parallel Processing

**Onafhankelijke taken paralleliseren:**
```javascript
// ✅ GOED: 3 platforms parallel lezen
const sw = JSON.parse(fs.readFileSync('switch-games.json'));
const nes = JSON.parse(fs.readFileSync('nes-games.json'));
const snes = JSON.parse(fs.readFileSync('snes-games.json'));
// Allemaal tegelijk beschikbaar

// ❌ SLECHT: Sequentieel
const sw = JSON.parse(fs.readFileSync('switch-games.json'));
await processSwitch(sw);
const nes = JSON.parse(fs.readFileSync('nes-games.json'));
await processNes(nes); // Wacht tot switch klaar
```

### 3. Error Recovery

**Bij TypeScript error:**
1. Lees error message
2. Identify root cause
3. Apply minimal fix
4. Rebuild
5. Commit fix

**Bij build failure:**
1. `npm run build` opnieuw
2. Check error, find file
3. Read relevant file
4. Fix issue
5. Rebuild

**Bij Git conflict:**
1. `git status` show conflicts
2. Open file, resolve manually
3. `git add` resolved file
4. `git commit` resolution

### 4. Output Optimization

**Voor user:**
- Toon status in blocks (niet inline)
- Gebruik emoji's voor status (✅ ❌ ⚠️ 🔄)
- Bold kritieke informatie
- Code blocks voor commands

**Voor commit messages:**
- Nederlands
- Imperative mood: "Voeg X toe" niet "Voegde toe"
- Why-focused: waarom nodig, niet wat gedaan
- Include session link

**Voor MEMORY.md:**
- Kort en bondig
- Actionable items
- Links naar detail docs
- Remove outdated info regularly

### 5. Autonomy Patterns

**Pattern 1: Self-Directed Feature**
```
1. Check EXPERIENCE_OPTIMIZATION_PLAN
2. Pick next incomplete feature
3. Implement + test
4. Commit + push
5. Update MEMORY with status
```

**Pattern 2: Incremental Improvement**
```
1. Identify bottleneck (slow component, large bundle)
2. Apply optimization
3. Measure improvement (bundle size, load time)
4. Commit with metrics
5. Document in MEMORY
```

**Pattern 3: Error Prevention**
```
1. Encounter error/bug
2. Fix immediate issue
3. Identify root cause
4. Add prevention (comment, type, validation)
5. Document in MEMORY for next time
```

### 6. Quality Gates

**ALTIJD passen voor commit:**
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] No `git add -A` (specific files only)
- [ ] Descriptive commit message (Nederlands)
- [ ] Code change is focused (one feature/fix)
- [ ] No console errors/warnings (if preventable)

**ALTIJD passen voor end-of-session:**
- [ ] Git clean (no uncommitted changes)
- [ ] Build passing
- [ ] MEMORY.md updated
- [ ] Next session context provided

---

## Session-to-Session Continuity

### Passing Knowledge

**What to record in MEMORY.md:**
1. **Learnings** - "Image quality <20KB = reject"
2. **Patterns** - "PriceCharting PAL first, then GameTDB"
3. **Workarounds** - "Use curl not Node.js fetch for external"
4. **Metrics** - "Build time ~90s", "Bundle 87KB"
5. **Status** - Current phase, what's next

**What to skip:**
- Commit history (git log shows this)
- Code snippets (in repo already)
- Timestamps (session-specific)
- Generic tips (covered in this guide)

### Context Compression

When approaching token limit:
1. Save comprehensive session summary
2. Update MEMORY.md with key findings
3. Document any WIP (work-in-progress) state
4. Create new session with fresh context
5. Previous session summary becomes reference

---

## Debugging Playbook

### "Build Failed" → Fix It

```bash
npm run build 2>&1 | grep -A5 "error\|Error"
# Find line number, file path
# Read that file
# Identify issue
# Apply fix
# Rebuild
```

### "TypeScript Error" → Solve It

| Error Pattern | Fix |
|---|---|
| `Argument of type X not assignable to Y` | Add explicit type or `as Type` cast |
| `Property Z does not exist` | Check interface, add property or import |
| `Could not find a declaration` | Import missing module or add `@types/` |
| `JSX element expects Z children` | Check component prop types |

### "Image Not Loading" → Diagnose

```bash
# Check file exists
ls public/images/products/{sku}-*.webp

# Check products.json reference
jq '.[] | select(.sku=="SW-001") | .image' src/data/products.json

# Paths must match:
# SKU: SW-001
# File: public/images/products/sw-001-{name}.webp
# JSON: "/images/products/sw-001-{name}.webp"
```

### "Build Too Slow" → Optimize

```bash
# Measure time
time npm run build

# Common culprits:
# 1. Image processing: Check public/images size
# 2. Type checking: TypeScript strict mode
# 3. Next.js: Too many SSG pages

# Optimization:
# - Lazy load components via dynamic()
# - Use webp instead of jpg/png
# - Cache type checks
```

---

## Checklist Nieuwe Sessie

1. ✅ CLAUDE.md en MEMORY.md werden automatisch geladen
2. ✅ Lees "KRITIEKE PRINCIPES" bovenaan dit bestand
3. ✅ `git status` + `git log --oneline -5` - Check huidige staat
4. ✅ Check branch: `claude/fix-cover-art-gTLvb`
5. ✅ `npm run build` - Verify alles werkt
6. ✅ Begin met user request
7. ✅ Zelf committen + pushen na elke taak
8. ✅ Update MEMORY.md met inzichten
9. ✅ End-of-session: git clean, build passing, doc updated
