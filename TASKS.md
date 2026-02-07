# TASKS.md — Gameshop Enter Verbeterlijst

> **Branch:** `claude/gameshop-local-access-hnbgR`
> **Status:** Werk 1 taak per chat. Commit + push na elke taak.
> **Regel:** Markeer je taak als `[x]` VOORDAT je commit zodat andere chats zien dat het bezet is.

---

## Hoe te gebruiken

1. Open dit bestand, kies een taak die nog `[ ]` is
2. Markeer het als `[x]` en commit TASKS.md eerst
3. Voer de verbetering uit
4. Test met `npx next build` (moet slagen)
5. Commit alle gewijzigde bestanden + push

**BELANGRIJK:** Elke taak vermeldt welke bestanden het raakt. Werk NOOIT aan 2 taken die dezelfde bestanden raken tegelijk.

---

## TAKEN

### A. Data fixes (snel, hoge prioriteit)

#### [x] Taak 1 — Over Ons pagina: "346" → "846" en timeline updaten
**Bestanden:** `src/app/over-ons/page.tsx`
**Wat:** Alle 346-referenties → 846, nieuw 2025 timeline item toegevoegd.

---

### B. Homepage componenten

#### [x] Taak 2 — Hero: subtitel en CTA tekst verbeteren
**Bestanden:** `src/components/home/Hero.tsx`
**Wat:** Subtitel specifieker gemaakt, secondary CTA → "Games verkopen" (→/inkoop).

#### [x] Taak 3 — TrustStrip: meer overtuigende teksten
**Bestanden:** `src/components/home/TrustStrip.tsx`
**Wat:** Alle 4 trust items concreter en overtuigender gemaakt.

#### [x] Taak 4 — ReviewsStrip: meer en betere reviews toevoegen
**Bestanden:** `src/components/home/ReviewsStrip.tsx`
**Wat:** 6 nieuwe reviews, Marktplaats link, 2 rijen van 6.

#### [x] Taak 5 — FeaturedProducts: sectie header verbeteren
**Bestanden:** `src/components/home/FeaturedProducts.tsx`
**Wat:** Badge → "Populair", titel → "Toppers uit de collectie", subtitel toegevoegd.

#### [x] Taak 6 — GameMarquee: meer rijen + titel
**Bestanden:** `src/components/home/GameMarquee.tsx`
**Wat:** 18→24 producten per rij, titel → "Ontdek de collectie".

#### [x] Taak 7 — PlatformGrid: dynamisch platform aantal
**Bestanden:** `src/components/home/PlatformGrid.tsx`
**Wat:** Badge toont nu `{platforms.length} Platforms` ipv hardcoded.

#### [x] Taak 8 — AboutPreview: tekst en CTA verbeteren
**Bestanden:** `src/components/home/AboutPreview.tsx`
**Wat:** Inkoop vermelding + twee CTAs: "Lees ons verhaal" + "Games verkopen".

#### [x] Taak 9 — FaqPreview: vragen updaten
**Bestanden:** `src/components/home/FaqPreview.tsx`
**Wat:** Inkoop FAQ toegevoegd, 846+ aantallen, specifiekere antwoorden.

#### [x] Taak 10 — NewsletterCTA: tekst en design polish
**Bestanden:** `src/components/home/NewsletterCTA.tsx`
**Wat:** Titel → "Mis geen enkele aanwinst", exclusieve kortingscodes, early access.

---

### C. Shop & Product pagina's

#### [x] Taak 11 — Shop pagina: "Nieuw binnen" sorteeroptie toevoegen
**Bestanden:** `src/app/shop/page.tsx`
**Wat:** Sorteeroptie "Nieuw binnen" toegevoegd (sort op SKU nummer aflopend).

#### [x] Taak 12 — Product detail: beschrijving sectie verbeteren
**Bestanden:** `src/components/product/ProductDetail.tsx`
**Wat:**
- De product beschrijving sectie visueel aantrekkelijker maken.
- Voeg een "Beschrijving" heading toe boven de beschrijving tekst als die er nog niet is.
- Zorg dat de specificatietabel goed werkt (recent toegevoegd).
- Check of de badges (conditie, compleetheid, CIB) goed leesbaar zijn.

#### [x] Taak 13 — Shop filters: Game Boy varianten groeperen
**Bestanden:** `src/components/shop/Filters.tsx`
**Wat:**
- Check of alle platform filters correct werken.
- Er zijn mogelijk veel platforms (12 stuks). Check of het filter dropdown goed werkt op mobiel.
- Overweeg om "Game Boy" varianten (Game Boy, Game Boy Color, Game Boy Advance) te groeperen in het UI.

---

### D. Overige pagina's

#### [x] Taak 14 — Winkelwagen: upsell sectie toevoegen
**Bestanden:** `src/app/winkelwagen/page.tsx`
**Wat:**
- Onder de winkelwagen items een "Misschien ook interessant" sectie toevoegen.
- Toon 2-4 producten met afbeeldingen die gerelateerd zijn aan wat er in de wagen zit.
- Gebruik `getRelatedProducts` uit `@/lib/products` of filter op platform.
- Alleen tonen als er items in de wagen zitten.

#### [x] Taak 15 — Afrekenen: formulier validatie verbeteren
**Bestanden:** `src/app/afrekenen/page.tsx`
**Wat:**
- Check de formulier validatie: postcode format (4 cijfers + 2 letters), e-mail, verplichte velden.
- Voeg inline validatie toe (rode rand + foutmelding bij incorrect formaat).
- Nederlandse postcode regex: `/^\d{4}\s?[A-Za-z]{2}$/`
- Check of de betaalmethoden goed worden getoond.

#### [x] Taak 16 — Inkoop pagina: uitleg verbeteren
**Bestanden:** `src/app/inkoop/page.tsx`
**Wat:**
- De uitleg bovenaan de pagina verbeteren: leg duidelijker uit hoe het inkoopproces werkt.
- Stappen toevoegen: 1. Zoek je game 2. Bekijk de inkoopprijs 3. Stuur ons een e-mail 4. Verzend het product 5. Ontvang je geld.
- Voeg het e-mailadres (gameshopenter@gmail.com) prominent toe.

#### [x] Taak 17 — Contact pagina: openingstijden toevoegen
**Bestanden:** `src/app/contact/page.tsx`
**Wat:**
- Voeg reactietijden/beschikbaarheid informatie toe.
- Bijv. "We reageren doorgaans binnen 24 uur, maandag t/m vrijdag."
- Voeg een klein FAQ sectietje toe met 2-3 snelle vragen.
- Check of het formulier alle velden juist heeft.

#### [x] Taak 18 — FAQ pagina: meer vragen toevoegen
**Bestanden:** `src/app/faq/page.tsx`
**Wat:**
- Voeg 4-6 extra FAQ items toe, bijv.:
  - "Bieden jullie garantie op producten?"
  - "Kan ik games bij jullie inruilen?"
  - "Hoeveel platforms bieden jullie aan?"
  - "Verkopen jullie ook accessoires?"
  - "Hoe weet ik of een product compleet is?"
  - "Worden producten ook naar Belgie verzonden?"
- Update het FAQPage schema (faqJsonLd) zodat de nieuwe vragen ook in Google verschijnen.

#### [x] Taak 19 — 404 pagina: suggesties toevoegen
**Bestanden:** `src/app/not-found.tsx`
**Wat:**
- Voeg 3-4 populaire productcategorieen toe als suggesties.
- Bijv. snelle links: "Nintendo Switch games", "GameCube games", "Retro consoles", "Alle producten".
- Maak het speelser/gamified — het "Game Over" thema is al goed.

#### [x] Taak 20 — Juridische pagina's: inhoud uitbreiden
**Bestanden:** `src/app/privacybeleid/page.tsx`, `src/app/retourbeleid/page.tsx`, `src/app/algemene-voorwaarden/page.tsx`
**Wat:**
- Check of deze pagina's voldoende inhoud hebben.
- Privacybeleid: moet vermelden welke gegevens worden verzameld, cookies, Mollie betalingen.
- Retourbeleid: 14 dagen bedenktijd, voorwaarden, hoe te retourneren, contactgegevens.
- Algemene voorwaarden: bedrijfsgegevens, levering, betaling, aansprakelijkheid.

---

### E. Layout & navigatie

#### [x] Taak 21 — Footer: inkoop link + social links toevoegen
**Bestanden:** `src/components/layout/Footer.tsx`
**Wat:**
- Voeg "Games verkopen" (inkoop) link toe onder "Shop" sectie.
- Voeg Marktplaats profiel link toe bij contact.
- Check of alle bestaande links correct zijn.

#### [x] Taak 22 — Header: actieve staat mobiel menu verbeteren
**Bestanden:** `src/components/layout/Header.tsx`
**Wat:**
- Check of het mobiele menu goed werkt.
- Overweeg een "Winkelwagen" link in het mobiele menu.
- Check of de zoekbalk shortcut (Cmd+K) goed werkt.
- Cart count badge ook in het mobiele menu tonen.

---

### F. SEO & Performance

#### [x] Taak 23 — Sitemap: meer pagina's toevoegen
**Bestanden:** `src/app/sitemap.ts`
**Wat:**
- Check of alle pagina's in de sitemap staan (inclusief /inkoop, /contact, /faq, /over-ons).
- Voeg `lastModified` dates toe.
- Voeg priority en changefreq toe aan belangrijke pagina's.

#### [x] Taak 24 — Robots.txt: optimaliseren
**Bestanden:** `src/app/robots.ts`
**Wat:**
- Check of robots.txt correct geconfigureerd is.
- Zorg dat de sitemap URL correct is: `https://gameshopenter.nl/sitemap.xml`

#### [x] Taak 25 — Layout metadata: uitbreiden
**Bestanden:** `src/app/layout.tsx`
**Wat:**
- Check of alle OpenGraph tags correct zijn.
- Check Schema.org Store markup: voeg `priceRange`, `openingHours`, `areaServed` toe.

---

### G. UI Componenten

#### [x] Taak 26 — Badge component: nieuwe varianten
**Bestanden:** `src/components/ui/Badge.tsx`
**Wat:**
- Voeg een "new" variant toe voor nieuwe producten.
- Voeg een "sale" variant toe (rood/oranje) voor toekomstige aanbiedingen.
- Zorg dat alle kleuren leesbaar zijn op lichte en donkere achtergronden.

#### [x] Taak 27 — ProductCard: prijsweergave verbeteren
**Bestanden:** `src/components/shop/ProductCard.tsx`
**Wat:**
- Als een product premium is (>= €100), toon dan "Gratis verzending" als label bij de prijs.
- Check of het "+Winkelmand" knopje goed werkt op mobiel.

---

### H. 🎮 Interactieve 3D Console Showcase

#### [ ] Taak 28 — CSS 3D Console modellen: Game Boy
**Bestanden:** `src/components/showcase/ConsoleGameBoy.tsx` (nieuw)
**Wat:**
- Maak een Game Boy model volledig in CSS 3D (geen externe 3D library nodig).
- Gebruik `transform-style: preserve-3d`, `perspective`, en nested divs voor diepte.
- Het scherm van de Game Boy toont een geanimeerde "game" (simpele pixel art animatie met CSS).
- D-pad en knoppen zijn interactief: hover = indruk-animatie.
- Kleur: klassiek grijs (#8B956D scherm, #C4CFA1 behuizing).
- Voeg subtiele schaduw en highlight toe voor realisme.
- Export als React component met `rotateX` en `rotateY` props voor externe besturing.

#### [ ] Taak 29 — CSS 3D Console modellen: N64
**Bestanden:** `src/components/showcase/ConsoleN64.tsx` (nieuw)
**Wat:**
- N64 console in CSS 3D met kenmerkende ronde vormen.
- Controller ernaast met joystick die meebeweegt met de muis.
- Gebruik border-radius trucs voor de organische N64 vorm.
- Cartridge slot bovenop met "insert" animatie.
- Kleur: charcoal grijs met gekleurde knop-accenten (groen A, blauw B, geel C-knoppen).

#### [ ] Taak 30 — CSS 3D Console modellen: GameCube & Switch
**Bestanden:** `src/components/showcase/ConsoleGameCube.tsx` (nieuw), `src/components/showcase/ConsoleSwitch.tsx` (nieuw)
**Wat:**
- **GameCube:** Kubusvorm met draaiende disc-animatie zichtbaar door bovenklep. Handle bovenop. Mini-disc in paars.
- **Switch:** Joy-Cons die detachen/attachen met animatie. Scherm toont game covers uit de collectie (carrousel). Kickstand die uitklapt. Neon rood/blauw Joy-Con kleuren.
- Beide met `rotateX`/`rotateY` props.

#### [ ] Taak 31 — Console Showcase scrollytelling container
**Bestanden:** `src/components/showcase/ConsoleShowcase.tsx` (nieuw)
**Wat:**
- Full-viewport scrollytelling sectie die alle console modellen verbindt.
- Gebruik Framer Motion `useScroll` + `useTransform` voor scroll-linked animations.
- Scroll-flow: Game Boy (1989) → N64 (1996) → GameCube (2001) → Switch (2017).
- Elke console fades/morphs in met een tijdlijn-indicator aan de zijkant.
- Bij elke console: platformnaam, jaar, en aantal producten in de shop (dynamisch uit data).
- De actieve console draait langzaam (auto-rotate) en reageert op muisbewegingen.
- Achtergrond verandert van kleur per era (sepia → kleurrijk → modern).
- Sticky positioning zodat de console in het midden blijft terwijl content scrollt.
- CTA bij elke console: "Bekijk {count} {platform} producten →".

#### [ ] Taak 32 — Console Showcase: muis-tracking 3D rotatie
**Bestanden:** `src/components/showcase/useMouseRotation.ts` (nieuw)
**Wat:**
- Custom hook `useMouseRotation` die muispositie omzet naar rotateX/rotateY waarden.
- Smooth interpolatie met `useSpring` van Framer Motion.
- Begrenzing: max ±15° rotatie zodat het subtiel blijft.
- Op mobiel: gebruik deviceOrientation (gyroscoop) als fallback.
- Optionele "auto-rotate" modus als de muis niet beweegt (langzaam 360° draaien).

#### [ ] Taak 33 — Console Showcase: particle effects en glow
**Bestanden:** `src/components/showcase/ConsoleParticles.tsx` (nieuw)
**Wat:**
- Floating particles rondom de actieve console (kleine lichtpuntjes).
- Gebruik CSS animations (geen canvas) voor performance.
- Particles bewegen in een orbitale baan rond de console.
- Glow effect onder de console (spotlight op een "tafel").
- Kleur van particles en glow matcht het platform-thema (groen voor Game Boy, paars voor GameCube, rood/blauw voor Switch).
- Particles reageren op scroll: meer particles = dichter bij de console sectie.

#### [ ] Taak 34 — Console Showcase: floating game cartridges
**Bestanden:** `src/components/showcase/FloatingCartridges.tsx` (nieuw)
**Wat:**
- Rondom elke console zweven 3-5 "cartridges" of game hoesjes.
- Gebruik echte cover art uit de product data (producten met afbeeldingen van dat platform).
- Cartridges hebben een 3D kaart-effect (perspective + rotateY).
- Hover op een cartridge: flip-animatie die de achterkant toont met prijs + "Bekijk" link.
- Cartridges bewegen in een zachte figure-8 patroon (Lissajous curve met CSS).
- Op scroll veranderen de cartridges mee met het actieve platform.

#### [ ] Taak 35 — Console Showcase integreren in homepage
**Bestanden:** `src/app/page.tsx`
**Wat:**
- Voeg de ConsoleShowcase toe aan de homepage, tussen Hero en PlatformGrid.
- Lazy load de showcase component (dynamic import met `next/dynamic`, ssr: false).
- Voeg een "skip" knop toe voor gebruikers die snel willen scrollen.
- Op mobiel: simplificeer tot een horizontale carrousel ipv scrollytelling.
- Zorg dat de showcase GEEN impact heeft op de initiële laadtijd (intersection observer + lazy load).

---

### I. 🕹️ Retro Arcade Navigatie & Effecten

#### [x] Taak 36 — Retro geluidseffecten systeem
**Bestanden:** `src/hooks/useRetroSound.ts` (nieuw), `src/components/providers/SoundProvider.tsx` (nieuw)
**Wat:**
- Custom hook `useRetroSound` met Web Audio API (geen externe library).
- Genereer 8-bit geluiden programmatisch met oscillators:
  - `coin`: Mario-achtig coin-geluid (twee korte tonen oplopend)
  - `select`: Menu selectie blip
  - `powerUp`: Oplopende toonladder (bij add-to-cart)
  - `navigate`: Kort "whoosh" geluid
  - `error`: Dalende toon (bij form error)
  - `success`: Overwinnings-fanfare (bij checkout)
- SoundProvider context met volume control en mute toggle.
- Respecteer `prefers-reduced-motion` — dan geen geluid.
- Geluiden zijn SUBTIEL en kort (max 300ms), niet irritant.
- Sla mute-voorkeur op in localStorage.

#### [x] Taak 37 — Coin-insert pagina transitie animatie
**Bestanden:** `src/components/ui/PageTransition.tsx` (nieuw)
**Wat:**
- Wrapper component voor page transitions in layout.tsx.
- Bij navigatie: kort "coin insert" effect:
  1. Scherm dimmed licht (overlay 0.3 opacity)
  2. Een pixelart munt valt van boven het scherm naar het midden (300ms)
  3. Flash van licht bij "insert" (100ms)
  4. Nieuwe pagina fades in vanuit het midden (300ms)
- Totale transitie: ~700ms, voelt snappy.
- Gebruik Framer Motion `AnimatePresence` + `layoutId`.
- Op mobiel: vereenvoudigd tot een snelle fade (geen coin voor snelheid).

#### [ ] Taak 38 — Pixel art platform selector (Smash Bros stijl)
**Bestanden:** `src/components/shop/ArcadePlatformSelector.tsx` (nieuw)
**Wat:**
- Alternatieve platformselector voor de shop pagina in "arcade" stijl.
- Grid van platform "poorten" — elk platform is een arcade-achtige deur/poort.
- Bij hover: de poort "opent" met een lichtstraal die naar buiten schijnt.
- Geselecteerd platform: neon glow rand + "Player 1" label erboven.
- Tussen de platforms: pixelart decoraties (sterren, munten, paddenstoelen).
- Keyboard navigatie: pijltjestoetsen + Enter om platform te kiezen.
- Toont producttelling per platform in een "high score" lettertype.
- Pixel-art font voor labels (gebruik Google Font "Press Start 2P" of CSS pixel font).

#### [x] Taak 39 — Retro loading states
**Bestanden:** `src/components/ui/RetroLoader.tsx` (nieuw)
**Wat:**
- Vervang standaard loading spinners met retro game-stijl loaders:
  1. **Health bar loader:** Groene balk die vult van links naar rechts met hartjes.
  2. **Mario brick loader:** Vraagtekenboks die bounced met coins die eruit komen.
  3. **Pac-Man loader:** Pac-Man die dots eet langs een lijn.
- Kies random welke loader verschijnt (of roteer).
- Pixel-art stijl met CSS (geen images nodig).
- Smooth animatie, ~2s loop.
- Gebruik op: product images loading, shop filters, pagina navigatie.

#### [x] Taak 40 — Retro breadcrumb navigatie
**Bestanden:** `src/components/ui/RetroBreadcrumb.tsx` (nieuw)
**Wat:**
- Breadcrumb component in retro-stijl:
  - Gebruik `»` of pixel pipe `|` als separator.
  - Huidige pagina heeft een knipperende cursor erachter `_`.
  - Breadcrumb items zijn "power-ups" visueel (kleine iconen).
  - Hover: item licht op met 8-bit glow.
- Toon op: shop, product detail, FAQ, contact, over-ons, inkoop.
- Automatische breadcrumb generatie uit de URL path.
- Schema.org BreadcrumbList markup voor SEO.

#### [x] Taak 41 — Arcade achievement toasts
**Bestanden:** `src/components/ui/AchievementToast.tsx` (nieuw), `src/hooks/useAchievements.ts` (nieuw)
**Wat:**
- "Achievement unlocked!" notificaties in retro game stijl:
  - **"Eerste bezoek"** — bij eerste pageview (check localStorage)
  - **"Verzamelaar"** — bij 3+ items in winkelwagen
  - **"Ontdekker"** — bij bezoek aan 5+ verschillende pagina's
  - **"Retro Gamer"** — bij bekijken van een Game Boy of NES product
  - **"Big Spender"** — bij winkelwagen totaal > €100 (gratis verzending!)
  - **"Nachtbraker"** — bij bezoek tussen 00:00 en 05:00
- Toast verschijnt vanaf de bovenkant met pixel-art badge.
- Coin geluid bij unlock (via useRetroSound).
- Achievements worden opgeslagen in localStorage.
- Niet opdringerig: max 1 achievement per 30 seconden.

#### [x] Taak 42 — Interactieve winkelwagen teller animatie
**Bestanden:** `src/components/layout/CartCounter.tsx` (nieuw)
**Wat:**
- De winkelwagen teller in de header krijgt speciale animaties:
  - Bij toevoegen: teller "explodeert" kort (scale 1→1.5→1) met particles.
  - Bij verwijderen: teller "shrinks" met een treurig wobble.
  - Bij hover over cart: teller pulseert zachtjes.
  - Overgang van 0→1: speciale "first item!" animatie.
  - Bij 5+ items: teller krijgt een gouden glow.
  - Bij 10+ items: teller wordt regenboog-animated.
- Coin sound bij elke toevoeging.
- Integreer in bestaande Header.tsx cart icon.

---

### J. ✨ Micro-Interacties & Visual Polish

#### [x] Taak 43 — Product card 3D tilt effect
**Bestanden:** `src/components/shop/ProductCard.tsx`
**Wat:** Al geimplementeerd — perspective-1000, rotateX/Y met useSpring, holographic glow, shine overlay.

#### [x] Taak 44 — Add-to-cart confetti burst
**Bestanden:** `src/components/ui/ConfettiBurst.tsx` (nieuw)
**Wat:**
- Bij "Toevoegen aan winkelmand" klik: explosie van confetti/particles vanuit de knop.
- 15-20 particles in Nintendo-kleuren (rood, blauw, groen, geel).
- Particles hebben physics: gravity pull, random velocity, fade out.
- Particle vormen: mix van cirkels, sterren, en kleine pixel-harten.
- Animatie duurt 800ms, dan cleanup.
- Gebruik CSS animations (geen canvas) voor battery-friendliness.
- De confetti vertrekt vanuit de exacte positie van de klik.

#### [x] Taak 45 — Magnetische CTA knoppen
**Bestanden:** `src/components/ui/MagneticButton.tsx`
**Wat:**
- Verbeter het bestaande MagneticButton component:
  - Voeg een "ripple" effect toe bij klik (Material Design stijl maar in brand kleuren).
  - Magnetisch effect wordt sterker naarmate de muis dichterbij komt.
  - Voeg een subtiele "breathing" animatie toe als de knop in view is (scale pulse).
  - Bij focus (keyboard nav): glow ring animatie.
  - De tekst in de knop beweegt net iets MINDER dan de knop zelf (parallax binnen de knop).

#### [x] Taak 46 — Image reveal animatie op product afbeeldingen
**Bestanden:** `src/components/ui/ImageReveal.tsx` (nieuw)
**Wat:**
- Wanneer een product afbeelding in viewport scrollt:
  1. Eerst: grijze placeholder met shimmer effect (skeleton).
  2. Dan: een "wipe" animatie van links naar rechts onthult de afbeelding.
  3. De wipe-lijn heeft een glow/blur effect.
- Gebruik Intersection Observer + CSS clip-path animatie.
- Werkt op: ProductCard afbeeldingen, product detail hero afbeelding, GameMarquee.
- Lazy load de afbeelding pas als de reveal start (performance).
- Fallback voor browsers zonder clip-path support: gewone fade-in.

#### [x] Taak 47 — Scroll progress indicator in header
**Bestanden:** `src/components/layout/ScrollProgress.tsx`
**Wat:** Al geimplementeerd — 3px balk, emerald→teal→cyan gradient, useScroll + useSpring, fixed top z-60.

#### [x] Taak 48 — Hover preview tooltips op productlinks
**Bestanden:** `src/components/ui/ProductPreview.tsx` (nieuw)
**Wat:**
- Bij hover op een productlink (in gerelateerde producten, upsell, etc.):
  - Toon een floating preview card met: afbeelding, naam, prijs, platform badge.
  - Card verschijnt na 500ms hover delay (voorkom flicker).
  - Smooth scale + opacity animatie bij verschijnen.
  - Card volgt de muis niet, maar positioneert zich intelligent (boven of onder de link, afhankelijk van viewport ruimte).
- Gebruik React Portal voor correcte z-index stacking.
- Niet tonen op mobiel (touch devices).
- Pre-fetch de product data bij hover voor snelle navigatie.

#### [x] Taak 49 — Animated price display
**Bestanden:** `src/components/ui/AnimatedPrice.tsx` (nieuw)
**Wat:**
- Wanneer een prijs in view scrollt: cijfers "rollen" naar de juiste waarde (slot machine effect).
- Elk cijfer draait individueel van 0 naar het juiste getal.
- Het euro-teken (€) verschijnt eerst, dan rollen de cijfers.
- Bij prijzen boven €100: korte "gratis verzending" badge animatie ernaast.
- Gebruik op: ProductCard, ProductDetail, winkelwagen totaal.
- Decimalen (,99) draaien sneller dan hele getallen.

#### [x] Taak 50 — Floating action buttons op mobiel
**Bestanden:** `src/components/ui/FloatingActions.tsx` (nieuw)
**Wat:**
- Op mobiel: floating action button (FAB) rechtsonder met:
  - Primair: winkelwagen icoon met teller (altijd zichtbaar als items in cart).
  - Bij tappen: expandeert naar 2-3 opties:
    - 🛒 Naar winkelwagen
    - 🔍 Zoeken
    - ⬆️ Scroll naar boven
- De FAB heeft een subtle "bounce" bij eerste render.
- Verdwijnt als je aan het scrollen bent (komt terug als je stopt).
- Gebruik Framer Motion voor de expand/collapse animatie.
- Badge op winkelwagen toont aantal items.

#### [x] Taak 51 — Skeleton loading states voor alle pagina's
**Bestanden:** `src/components/ui/Skeleton.tsx` (nieuw)
**Wat:**
- Herbruikbaar Skeleton component met shimmer animatie.
- Varianten: `text`, `image`, `card`, `button`, `badge`.
- Shimmer effect: gradient die van links naar rechts beweegt (CSS animation).
- Kleur: slate-200 base, slate-100 shimmer highlight.
- Specifieke skeleton layouts:
  - `ProductCardSkeleton`: image + title + price layout
  - `ProductDetailSkeleton`: hero + specs + description
  - `ShopGridSkeleton`: 8 ProductCardSkeletons in grid
- Rounded corners matchen de echte componenten.

#### [x] Taak 52 — Smooth number counting animaties
**Bestanden:** `src/components/ui/CountUp.tsx` (nieuw)
**Wat:**
- Herbruikbaar CountUp component dat van 0 naar target telt.
- Ondersteunt: `target`, `duration`, `prefix` (€), `suffix` (+), `decimals`.
- Easing: ease-out voor een naturlijk gevoel (snel begin, langzaam einde).
- Intersection Observer: begint pas te tellen als het element in view is.
- Optionele `separator` voor duizendtallen (bijv. 3.000).
- Gebruik op: AboutPreview stats (vervang huidige AnimatedCounter), TrustStrip, product counts.
- Lichter en beter dan de huidige AnimatedCounter in AboutPreview.

---

### K. 🌙 Dark Mode met Neon Retro Thema

#### [x] Taak 53 — ThemeProvider context opzetten
**Bestanden:** `src/components/providers/ThemeProvider.tsx` (nieuw), `src/app/layout.tsx`
**Wat:**
- React Context voor theme state: `'light' | 'dark' | 'retro'`.
- `light`: huidige stijl (ongewijzigd).
- `dark`: donker thema met emerald accenten.
- `retro`: neon arcade thema (bonus).
- Sla voorkeur op in localStorage (key: `gameshop-theme`).
- Respecteer `prefers-color-scheme` als default (geen localStorage waarde).
- Provider in layout.tsx wrappen rond de children.
- Voeg `className` toe aan `<html>` element: `dark` of `retro`.
- Geen FOUC (flash of unstyled content): gebruik een inline script in `<head>` die de class zet VOOR React hydration.

#### [ ] Taak 54 — Theme toggle switch component
**Bestanden:** `src/components/ui/ThemeToggle.tsx` (nieuw)
**Wat:**
- Animated toggle knop met 3 standen: ☀️ Light → 🌙 Dark → 🕹️ Retro.
- De toggle is een "track" met een sliding "thumb":
  - Light: gele zon met draaiende stralen.
  - Dark: paarse maan met sterren die verschijnen.
  - Retro: groene pixel-controller met knipperende LED.
- Klik cycled door de 3 themes.
- Smooth Framer Motion transities tussen standen.
- Kleine "click" geluid (via useRetroSound) bij theme switch.
- Toegankelijk: aria-label, keyboard support (Space/Enter).

#### [x] Taak 55 — Tailwind dark mode kleurenpalet definiëren
**Bestanden:** `tailwind.config.ts`, `src/app/globals.css`
**Wat:**
- Configureer Tailwind voor class-based dark mode: `darkMode: 'class'`.
- Definieer dark mode CSS custom properties in globals.css:
  ```
  .dark {
    --bg-primary: #0a0e1a;
    --bg-secondary: #111827;
    --bg-card: #1a1f35;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --accent: #10b981;       /* emerald-500 */
    --accent-glow: rgba(16, 185, 129, 0.3);
    --border: rgba(255, 255, 255, 0.06);
  }
  ```
- Definieer retro neon CSS properties:
  ```
  .retro {
    --bg-primary: #0d0208;
    --neon-green: #39ff14;
    --neon-pink: #ff6ec7;
    --neon-blue: #04d9ff;
    --neon-yellow: #fff01f;
    --crt-scanline: rgba(0, 0, 0, 0.15);
  }
  ```
- Utility classes: `.neon-text`, `.neon-border`, `.neon-glow`, `.crt-overlay`.

#### [ ] Taak 56 — Dark mode: Header en Footer converteren
**Bestanden:** `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
**Wat:**
- Header dark mode:
  - Achtergrond: transparent → `dark:bg-[#0a0e1a]/90 dark:backdrop-blur-xl`.
  - Logo tekst: `dark:text-white`.
  - Nav links: `dark:text-slate-300 dark:hover:text-emerald-400`.
  - Cart icon: `dark:text-slate-300`.
  - Zoekbalk: `dark:bg-white/5 dark:border-white/10 dark:text-white`.
  - Mobiel menu: `dark:bg-[#0a0e1a]`.
- Footer dark mode:
  - Achtergrond: `dark:bg-[#050810]`.
  - Tekst: `dark:text-slate-400`.
  - Links: `dark:text-slate-300 dark:hover:text-emerald-400`.
  - Border: `dark:border-white/5`.
- Retro mode: neon groene tekst, flickering effect op logo.

#### [ ] Taak 57 — Dark mode: Hero sectie converteren
**Bestanden:** `src/components/home/Hero.tsx`
**Wat:**
- Hero achtergrond al donker (mesh-gradient) — check of het goed werkt in dark mode.
- In retro mode:
  - CRT scanlines overlay (horizontale lijnen met 50% opacity).
  - Tekst krijgt neon glow: `text-shadow: 0 0 10px var(--neon-green), 0 0 40px var(--neon-green)`.
  - Stats badges krijgen neon borders.
  - De mesh-gradient wordt vervangen door een zwarte achtergrond met neon grid.
  - CTA knoppen krijgen neon glow bij hover.
- Voeg een retro "PRESS START" knipperende tekst toe onder de CTAs in retro mode.

#### [ ] Taak 58 — Dark mode: Shop pagina en ProductCard converteren
**Bestanden:** `src/app/shop/page.tsx`, `src/components/shop/ProductCard.tsx`
**Wat:**
- Shop pagina dark mode:
  - Achtergrond: `dark:bg-[#0a0e1a]`.
  - Filters sidebar: `dark:bg-[#111827] dark:border-white/5`.
  - Filter labels: `dark:text-slate-300`.
  - Sort dropdown: `dark:bg-[#1a1f35] dark:text-white`.
- ProductCard dark mode:
  - Card achtergrond: `dark:bg-[#1a1f35] dark:border-white/5`.
  - Hover: `dark:hover:border-emerald-500/30`.
  - Tekst: `dark:text-white` (titel), `dark:text-slate-400` (platform).
  - Prijs: `dark:text-emerald-400`.
  - "Winkelmand" knop: `dark:bg-emerald-600 dark:hover:bg-emerald-500`.
  - Badges: aangepaste kleuren voor dark backgrounds.
- Retro mode: neon borders op cards, pixel-art hoekjes.

#### [ ] Taak 59 — Dark mode: Product detail pagina converteren
**Bestanden:** `src/components/product/ProductDetail.tsx`, `src/app/shop/[sku]/page.tsx`
**Wat:**
- ProductDetail dark mode:
  - Achtergrond: `dark:bg-[#0a0e1a]`.
  - Afbeelding container: `dark:bg-[#111827]`.
  - Titel: `dark:text-white`.
  - Beschrijving: `dark:text-slate-300`.
  - Specs tabel: `dark:bg-[#1a1f35]` rijen, `dark:text-slate-300` tekst.
  - "Toevoegen" knop: behoud emerald, maar met neon glow in retro mode.
  - Breadcrumbs: `dark:text-slate-400`.
- Retro mode: product afbeelding krijgt een CRT-monitor frame eromheen (CSS border met afronde hoeken en "bezel").

#### [ ] Taak 60 — Dark mode: overige homepage secties converteren
**Bestanden:** `src/components/home/TrustStrip.tsx`, `src/components/home/ReviewsStrip.tsx`, `src/components/home/FeaturedProducts.tsx`, `src/components/home/PlatformGrid.tsx`, `src/components/home/GameMarquee.tsx`, `src/components/home/NewsletterCTA.tsx`
**Wat:**
- TrustStrip: `dark:bg-[#111827]`, iconen krijgen glow.
- ReviewsStrip: `dark:bg-[#0a0e1a]`, review cards `dark:bg-[#1a1f35]`, sterren `dark:text-amber-400`.
- FeaturedProducts: `dark:bg-[#0a0e1a]`, subtitel `dark:text-slate-400`.
- PlatformGrid: `dark:bg-[#0a0e1a]`, cards behouden hun gradient headers, body `dark:bg-[#1a1f35]`.
- GameMarquee: `dark:bg-[#050810]`.
- NewsletterCTA: al donker, check voor retro mode neon glow op het formulier.

#### [ ] Taak 61 — Dark mode: overige pagina's converteren
**Bestanden:** `src/app/winkelwagen/page.tsx`, `src/app/afrekenen/page.tsx`, `src/app/inkoop/page.tsx`, `src/app/contact/page.tsx`, `src/app/faq/page.tsx`, `src/app/over-ons/page.tsx`
**Wat:**
- Winkelwagen: tabel `dark:bg-[#1a1f35]`, totaal sectie `dark:bg-[#111827]`.
- Afrekenen: formulier `dark:bg-[#1a1f35]`, inputs `dark:bg-[#0a0e1a] dark:border-white/10 dark:text-white`.
- Inkoop: zoekbalk en tabel dark mode, inkoopprijzen `dark:text-emerald-400`.
- Contact: formulier dark mode, vergelijkbaar met afrekenen.
- FAQ: accordion items `dark:bg-[#1a1f35]`, tekst `dark:text-slate-300`.
- Over Ons: timeline dark mode, stat cards `dark:bg-[#1a1f35]`.

#### [ ] Taak 62 — CRT scanline en neon glow effecten
**Bestanden:** `src/components/ui/CRTEffect.tsx` (nieuw), `src/app/globals.css`
**Wat:**
- CRT scanline overlay component (alleen in retro mode):
  - Dunne horizontale lijnen (1px every 3px) met lage opacity.
  - Subtiele "flicker" animatie (opacity wisselt 0.97↔1.0).
  - Vignette effect (donkerdere hoeken).
  - Optioneel: zeer subtiele RGB shift op tekst (chromatic aberration, 0.5px).
- CSS utility classes in globals.css:
  - `.neon-text`: text-shadow met dubbele glow laag.
  - `.neon-border`: box-shadow met gekleurde glow.
  - `.neon-flicker`: animatie die neon "flikkert" (korte brightness dips).
  - `.retro-grid`: achtergrond met neon gridlijnen (perspectief, verdwijnpunt).
- De CRT overlay zit op `<body>` level, boven alle content maar `pointer-events: none`.

#### [ ] Taak 63 — Retro mode: neon grid achtergrond
**Bestanden:** `src/components/ui/RetroGrid.tsx` (nieuw)
**Wat:**
- Synthwave/retrowave grid achtergrond voor retro mode:
  - Perspectief grid dat naar een verdwijnpunt loopt (jaren 80 stijl).
  - Neon groene of paarse gridlijnen op zwarte achtergrond.
  - Gridlijnen bewegen langzaam naar de kijker (oneindige scroll animatie).
  - "Zon" aan de horizon: neon gradient cirkel (oranje → paars).
  - Sterren/stippen in de "lucht" boven de horizon.
- Gebruik alleen CSS: linear-gradients + perspective transform + CSS animation.
- Component accepteert `color` prop ('green' | 'pink' | 'blue') voor de gridlijn kleur.
- Gebruik als achtergrond voor Hero en About sectie in retro mode.

---

### L. 🔧 Infrastructuur & Afronding

#### [x] Taak 64 — Performance audit en lazy loading
**Bestanden:** `src/app/page.tsx`, `src/app/layout.tsx`
**Wat:**
- Audit alle homepage componenten op bundle size impact.
- Dynamic import (lazy load) voor:
  - ConsoleShowcase (zwaar, 3D)
  - GameMarquee (veel afbeeldingen)
  - ReviewsStrip (niet above the fold)
  - NewsletterCTA (onderaan de pagina)
- Voeg `loading="lazy"` toe aan alle afbeeldingen die niet above the fold zijn.
- Check of Framer Motion tree-shaking correct werkt.
- Target: First Contentful Paint < 1.5s op 4G.

#### [x] Taak 65 — Accessibility (a11y) check
**Bestanden:** Meerdere (alle interactieve componenten)
**Wat:**
- Check alle interactieve elementen op keyboard navigatie.
- Alle knoppen hebben `aria-label` waar nodig.
- Focus indicators zijn zichtbaar (niet verborgen door outline: none).
- Dark mode contrast ratios: minimaal WCAG AA (4.5:1 voor tekst).
- Retro mode: extra check — neon kleuren kunnen slecht leesbaar zijn.
- Alle afbeeldingen hebben alt-tekst.
- Animaties respecteren `prefers-reduced-motion`.
- Screen reader test: navigatie, product selectie, winkelwagen flow.

#### [x] Taak 66 — Sound en animatie settings pagina
**Bestanden:** `src/components/ui/SettingsPanel.tsx` (nieuw)
**Wat:**
- Klein settings paneel (toegankelijk via tandwiel-icoon in footer of header).
- Instellingen:
  - 🎵 Geluidseffecten: aan/uit + volume slider.
  - 🎬 Animaties: volledig / verminderd / uit.
  - 🌙 Thema: Light / Dark / Retro.
  - 🎮 Arcade mode: aan/uit (combineert geluid + retro thema + effecten).
- Paneel schuift in als een drawer van rechts.
- Alle instellingen opgeslagen in localStorage.
- "Arcade mode" toggle: zet alles tegelijk aan voor de volle ervaring.

#### [x] Taak 67 — Easter eggs
**Bestanden:** `src/hooks/useEasterEggs.ts` (nieuw)
**Wat:**
- Verborgen Easter eggs voor gamers:
  - **Konami Code** (↑↑↓↓←→←→BA): activeert "Arcade Mode" met confetti explosie.
  - **"GAMESHOP"** typen op keyboard: regenboog mode voor 5 seconden.
  - **10x klikken op het logo**: logo verandert in een draaiende 3D kubus.
  - **Shaken op mobiel** (deviceMotion): confetti burst.
- Elk Easter egg toont een achievement toast.
- Easter eggs zijn puur leuk, geen functionaliteit erachter.
- Subtiel genoeg dat ze niet per ongeluk triggeren.

---

## Statusoverzicht

| Taak | Status | Beschrijving | Bestanden |
|------|--------|--------------|-----------|
| 1 | ✅ | Over Ons 346→846 | over-ons/page.tsx |
| 2 | ✅ | Hero subtitel & CTA | Hero.tsx |
| 3 | ✅ | TrustStrip teksten | TrustStrip.tsx |
| 4 | ✅ | ReviewsStrip reviews | ReviewsStrip.tsx |
| 5 | ✅ | FeaturedProducts header | FeaturedProducts.tsx |
| 6 | ✅ | GameMarquee 24 producten | GameMarquee.tsx |
| 7 | ✅ | PlatformGrid dynamisch | PlatformGrid.tsx |
| 8 | ✅ | AboutPreview inkoop CTA | AboutPreview.tsx |
| 9 | ✅ | FaqPreview vragen | FaqPreview.tsx |
| 10 | ✅ | NewsletterCTA tekst | NewsletterCTA.tsx |
| 11 | ✅ | Shop sorteeroptie | shop/page.tsx |
| 12 | ✅ | ProductDetail beschrijving | ProductDetail.tsx |
| 13 | ✅ | Shop filters groeperen | Filters.tsx |
| 14 | ✅ | Winkelwagen upsell | winkelwagen/page.tsx |
| 15 | ✅ | Afrekenen validatie | afrekenen/page.tsx |
| 16 | ✅ | Inkoop uitleg | inkoop/page.tsx |
| 17 | ✅ | Contact openingstijden | contact/page.tsx |
| 18 | ✅ | FAQ meer vragen | faq/page.tsx |
| 19 | ✅ | 404 suggesties | not-found.tsx |
| 20 | ✅ | Juridische pagina's | privacybeleid + retourbeleid + voorwaarden |
| 21 | ✅ | Footer links | Footer.tsx |
| 22 | ✅ | Header mobiel menu | Header.tsx |
| 23 | ✅ | Sitemap uitbreiden | sitemap.ts |
| 24 | ✅ | Robots.txt | robots.ts |
| 25 | ✅ | Layout metadata | layout.tsx |
| 26 | ✅ | Badge varianten | Badge.tsx |
| 27 | ✅ | ProductCard prijs | ProductCard.tsx |
| 28 | `[ ]` | 🎮 3D Game Boy model | showcase/ConsoleGameBoy.tsx |
| 29 | `[ ]` | 🎮 3D N64 model | showcase/ConsoleN64.tsx |
| 30 | `[ ]` | 🎮 3D GameCube & Switch | showcase/ConsoleGameCube.tsx + Switch |
| 31 | `[ ]` | 🎮 Showcase scrollytelling | showcase/ConsoleShowcase.tsx |
| 32 | `[ ]` | 🎮 Muis-tracking rotatie | showcase/useMouseRotation.ts |
| 33 | `[ ]` | 🎮 Particles & glow | showcase/ConsoleParticles.tsx |
| 34 | `[ ]` | 🎮 Floating cartridges | showcase/FloatingCartridges.tsx |
| 35 | `[ ]` | 🎮 Showcase → homepage | page.tsx |
| 36 | ✅ | 🕹️ Retro geluiden | useRetroSound.ts + SoundProvider.tsx |
| 37 | ✅ | 🕹️ Coin pagina transitie | PageTransition.tsx |
| 38 | `[ ]` | 🕹️ Arcade platform selector | ArcadePlatformSelector.tsx |
| 39 | ✅ | 🕹️ Retro loaders | RetroLoader.tsx |
| 40 | ✅ | 🕹️ Retro breadcrumbs | RetroBreadcrumb.tsx |
| 41 | ✅ | 🕹️ Achievement toasts | AchievementToast.tsx + useAchievements.ts |
| 42 | ✅ | 🕹️ Cart teller animatie | CartCounter.tsx |
| 43 | ✅ | ✨ ProductCard 3D tilt | ProductCard.tsx |
| 44 | ✅ | ✨ Add-to-cart confetti | ConfettiBurst.tsx |
| 45 | ✅ | ✨ Magnetische knoppen | MagneticButton.tsx |
| 46 | ✅ | ✨ Image reveal animatie | ImageReveal.tsx |
| 47 | ✅ | ✨ Scroll progress bar | ScrollProgress.tsx |
| 48 | ✅ | ✨ Hover preview tooltips | ProductPreview.tsx |
| 49 | ✅ | ✨ Animated price display | AnimatedPrice.tsx |
| 50 | ✅ | ✨ Floating actions mobiel | FloatingActions.tsx |
| 51 | ✅ | ✨ Skeleton loading states | Skeleton.tsx |
| 52 | ✅ | ✨ CountUp animaties | CountUp.tsx |
| 53 | ✅ | 🌙 ThemeProvider context | ThemeProvider.tsx + layout.tsx |
| 54 | `[ ]` | 🌙 Theme toggle switch | ThemeToggle.tsx |
| 55 | ✅ | 🌙 Dark mode kleurenpalet | tailwind.config.ts + globals.css |
| 56 | `[ ]` | 🌙 Header & Footer dark | Header.tsx + Footer.tsx |
| 57 | `[ ]` | 🌙 Hero dark mode | Hero.tsx |
| 58 | `[ ]` | 🌙 Shop & ProductCard dark | shop/page.tsx + ProductCard.tsx |
| 59 | `[ ]` | 🌙 ProductDetail dark | ProductDetail.tsx + [sku]/page.tsx |
| 60 | `[ ]` | 🌙 Homepage secties dark | TrustStrip + Reviews + Featured + etc. |
| 61 | `[ ]` | 🌙 Overige pagina's dark | winkelwagen + afrekenen + inkoop + etc. |
| 62 | `[ ]` | 🌙 CRT scanline effecten | CRTEffect.tsx + globals.css |
| 63 | `[ ]` | 🌙 Retro neon grid | RetroGrid.tsx |
| 64 | ✅ | 🔧 Performance & lazy load | page.tsx + layout.tsx |
| 65 | ✅ | 🔧 Accessibility check | meerdere bestanden |
| 66 | ✅ | 🔧 Settings paneel | SettingsPanel.tsx |
| 67 | ✅ | 🔧 Easter eggs | useEasterEggs.ts |

---

## Afhankelijkheden tussen taken

Sommige taken moeten in een bepaalde volgorde:

1. **ThemeProvider eerst** → Taak 53 moet klaar zijn vóór taken 54-63
2. **Dark kleuren eerst** → Taak 55 moet klaar zijn vóór taken 56-63
3. **Sound systeem eerst** → Taak 36 moet klaar zijn vóór taken 37, 41, 42
4. **Console modellen eerst** → Taken 28-30 moeten klaar zijn vóór taken 31, 33, 34
5. **Showcase container eerst** → Taak 31 moet klaar zijn vóór taak 35

Aanbevolen volgorde voor parallel werk:
- **Chat A:** Taken 12-27 (bestaande verbeteringen, geen afhankelijkheden)
- **Chat B:** Taken 28-35 (3D Console Showcase, sequentieel)
- **Chat C:** Taken 36-42 (Retro Arcade, sequentieel)
- **Chat D:** Taken 43-52 (Micro-interacties, grotendeels onafhankelijk)
- **Chat E:** Taken 53-63 (Dark Mode, sequentieel na ThemeProvider)
- **Chat F:** Taken 64-67 (Afronding, als laatste)

---

## Technische context

- **Framework:** Next.js 14 (App Router, SSG)
- **Styling:** Tailwind CSS 3 + Framer Motion 12
- **Data:** `src/data/products.json` (846 producten, NIET wijzigen tenzij noodzakelijk)
- **Build test:** `npx next build` (moet slagen, 862 pagina's)
- **Branch:** `claude/gameshop-local-access-hnbgR`
- **Push:** `git push -u origin claude/gameshop-local-access-hnbgR`
- **Taal:** Website is in het Nederlands. Code/comments mogen Engels.
- **NOOIT** `prebuild` script terugzetten in package.json (overschrijft 846 producten met oude 346)
- **Geluiden:** Web Audio API, GEEN externe sound libraries
- **3D:** CSS 3D transforms, GEEN react-three-fiber (te zwaar voor dit project)
- **Thema's:** CSS custom properties + Tailwind dark: classes
