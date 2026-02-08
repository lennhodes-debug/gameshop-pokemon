/**
 * Beschrijvingen generator voor Gameshop Enter
 * Genereert rijke Nederlandse productbeschrijvingen (50-80 woorden)
 *
 * Gebruik: node scripts/generate-descriptions.js
 *
 * - Leest src/data/products.json
 * - Genereert beschrijvingen op basis van platform, genre, conditie, compleetheid
 * - Behoudt bestaande beschrijvingen van 45+ woorden
 * - Slaat consoles en accessoires over (behoudt huidige beschrijving)
 * - Schrijft resultaat terug naar products.json
 */
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// ============================================================
// PLATFORM CONTEXT - era-specifieke beschrijvingen
// ============================================================
const PLATFORM_CONTEXT = {
  'NES': 'Deze NES-klassieker uit het 8-bit tijdperk',
  'Super Nintendo': 'Dit SNES-meesterwerk uit de gouden 16-bit era',
  'Nintendo 64': 'Dit N64-avontuur dat 3D-gaming revolutioneerde',
  'Game Boy': 'Dit Game Boy-pareltje voor onderweg',
  'Game Boy Color': 'Dit Game Boy Color-avontuur in kleur',
  'Game Boy Advance': 'Dit GBA-juweeltje met 32-bit graphics',
  'GameCube': 'Dit GameCube-hoogtepunt',
  'Nintendo DS': 'Dit Nintendo DS-spel met innovatief touchscreen',
  'Nintendo 3DS': 'Dit Nintendo 3DS-avontuur met stereoscopisch 3D',
  'Wii': 'Dit Wii-spel met innovatieve motion controls',
  'Wii U': 'Dit Wii U-spel met GamePad-integratie',
  'Nintendo Switch': 'Dit Nintendo Switch-spel voor thuis en onderweg',
};

// ============================================================
// CONDITION & COMPLETENESS
// ============================================================
const CONDITION_TEXT = {
  'Zo goed als nieuw': 'Dit exemplaar verkeert in zo goed als nieuwe staat',
  'Gebruikt': 'Dit exemplaar is in nette gebruikte staat',
  'Nieuw': 'Dit exemplaar is nieuw en onbespeeld',
};

const COMPLETENESS_TEXT = {
  'Compleet in doos (CIB)': 'en wordt compleet geleverd met originele doos en handleiding',
  'Compleet in doos': 'en wordt compleet geleverd in originele doos',
  'Losse cartridge': 'en wordt geleverd als losse cartridge',
  'Los': 'en wordt los geleverd',
  'Met oplader': 'en wordt geleverd inclusief oplader',
  'Met kabels + controller': 'en wordt geleverd inclusief kabels en controller',
  'Met kabels + sensor bar': 'en wordt geleverd inclusief kabels en sensor bar',
  'Met GamePad + kabels': 'en wordt geleverd inclusief GamePad en kabels',
};

// ============================================================
// GENRE FALLBACK TEMPLATES (voor games zonder specifieke beschrijving)
// Meerdere varianten per genre om herhaling te voorkomen
// ============================================================
const GENRE_TEMPLATES = {
  'RPG': [
    'Duik in een episch rollenspel vol meeslepende verhalen, memorabele personages en strategische turn-based gevechten. Verken uitgestrekte werelden, level je team op en ontdek talloze geheimen in dit onvergetelijke avontuur.',
    'Een diepgaand rollenspel met een boeiend verhaal, uitgebreid personagesysteem en verslavende gameplay. Trek door gevaarlijke gebieden, versla machtige vijanden en ontdek de waarheid achter een episch mysterie.',
    'Beleef een klassiek Japans rollenspel met strategische gevechten, een rijke spelwereld en tientallen uren speelplezier. Verzamel bondgenoten, verbeter je uitrusting en schrijf je eigen heldenverhaal.',
    'Verlies jezelf in een grandioos rollenspel boordevol quests, karakterontwikkeling en tactische gevechten. Maak keuzes die het verhaal beinvloeden, smeed allianties en ontdek een levendige fantasiewereld.',
    'Een meeslepend rollenspel met een emotioneel verhaal, uitdagende baasgevechten en een wereld die vraagt om verkend te worden. Pas je team aan, ontdek verborgen vaardigheden en wordt sterker naarmate het avontuur vordert.',
  ],
  'Avontuur': [
    'Een meeslepend avontuur vol ontdekking, puzzels en onverwachte wendingen. Verken prachtige omgevingen, ontmoet kleurrijke personages en ontrafel een boeiend verhaal in dit onvergetelijke spel.',
    'Ga op een epische ontdekkingsreis door een wereld vol geheimen en uitdagingen. Los ingenieuze puzzels op, versla vijanden en beleef een verhaal dat je niet meer loslaat.',
    'Een avontuurlijk meesterwerk dat verkenning, actie en verhaal perfect combineert. Ontdek verborgen gebieden, verzamel items en ervaar een onvergetelijke reis door een betoverende spelwereld.',
    'Duik in een wereld vol mysteries en gevaren in dit boeiende avontuur. Doorzoek uitgestrekte landschappen, los slimme puzzels op en ontmoet personages die elk hun eigen verhaal hebben.',
    'Beleef een episch avontuur met een pakkend verhaal, gevarieerde omgevingen en talloze geheimen om te ontdekken. Elke stap brengt nieuwe verrassingen en onverwachte uitdagingen.',
  ],
  'Actie': [
    'Een intens actiespel dat je reflexen op de proef stelt met uitdagende levels, gevarieerde vijanden en spectaculaire gevechten. Beheers verschillende vaardigheden en vecht je een weg naar de overwinning.',
    'Actiegeladen gameplay met snelle gevechten, uitdagende platformsecties en epische baasgevechten. Verbeter je arsenaal, ontdek geheime routes en bewijs dat jij de ultieme held bent.',
    'Duik in de actie met dit spannende spel vol adrenaline, gevechten en avontuur. Versla golven vijanden, ontgrendel nieuwe vaardigheden en overwin steeds grotere uitdagingen.',
    'Non-stop actie met vloeiende besturing, explosieve gevechten en een onvergetelijk tempo. Neem het op tegen hordes vijanden, ontdek krachtige wapens en bewijs je moed in elk level.',
    'Spectaculaire actie van begin tot eind met intense gevechtssequenties, verrassende gameplay-elementen en adembenemende setpieces. Upgrade je vaardigheden en vecht je door een wereld vol gevaar.',
    'Een actiespel dat nooit verveelt dankzij gevarieerde missies, creatieve gevechten en een meeslepend avontuur. Combineer aanvallen, ontwijkingen en speciale krachten voor verbluffende combo\'s.',
  ],
  'Platformer': [
    'Een kleurrijk platformavontuur vol precisie-sprongen, verborgen geheimen en creatieve levelontwerpen. Spring, ren en ontdek je weg door gevarieerde werelden in dit tijdloze spel.',
    'Klassiek platformplezier met inventieve levels, verrassende power-ups en uitdagende obstakels. Verken elke hoek van de spelwereld en ontdek alle geheimen die verstopt liggen.',
    'Een vermakelijk platformspel met strakke besturing, kleurrijke graphics en levels die steeds uitdagender worden. Verzamel items, versla vijanden en bereik het einde van elk level.',
    'Spring je een weg door een fantasierijke wereld vol verrassingen, geheime passages en vindingrijke vijanden. Elk level biedt nieuwe mechanismen en uitdagingen die je vaardigheden testen.',
    'Platformactie op zijn best met pixelperfecte besturing, sierlijk leveldesign en belonende geheimen. Ontdek verborgen paden, verzamel bonussen en geniet van puur speelplezier.',
    'Een platformavontuur boordevol charme, met inventieve werelden, unieke power-ups en uitdagingen voor zowel beginners als ervaren spelers. Perfecte balans tussen toegankelijkheid en diepgang.',
  ],
  'Race': [
    'Scheur over spectaculaire circuits met hoge snelheden, scherpe bochten en intense concurrentie. Ontgrendel nieuwe voertuigen, beheers elke baan en claim de eerste plaats in dit geweldige racespel.',
    'Een adrenaline-pompend racespel met diverse tracks, snelle gameplay en competitieve multiplayer. Versla je tegenstanders met slimme racelijnen en perfect getimede drifts.',
    'Raceplezier voor het hele gezin met kleurrijke banen, grappige items en hectische multiplayer-actie. Kies je favoriete coureur, ontgrendel nieuwe circuits en ga voor goud.',
    'Haarspeldbochtactie en spectaculaire snelheden in dit meeslepende racespel. Versla rivalen, ontdek geheime afsnijdingen en bewijs dat jij de snelste bent op elke baan.',
  ],
  'Strategie': [
    'Een diepgaand strategiespel dat je tactisch inzicht op de proef stelt. Plan je zetten zorgvuldig, positioneer je eenheden slim en versla de vijand met superieure strategie in intense turn-based gevechten.',
    'Tactisch meesterwerk met complexe gevechten op een rasterkaart. Rekruteer eenheden, beheer je middelen en neem weloverwogen beslissingen die het verschil maken tussen overwinning en nederlaag.',
    'Scherp je tactisch brein in dit doorwrochte strategiespel vol diepgang. Bouw je leger op, ontwikkel je commandanten en voer briljante tactieken uit op het slagveld.',
    'Strategische diepgang gecombineerd met een boeiend verhaal en memorabele personages. Elke beslissing telt, elke zet heeft gevolgen en alleen de slimste tacticus overwint.',
  ],
  'Sport': [
    'Een dynamisch sportspel met intuïtieve besturing, realistische gameplay en spannende wedstrijden. Speel solo of met vrienden en beleef de spanning van echte competitie.',
    'Sportief plezier met toegankelijke maar diepe gameplay. Verbeter je vaardigheden, daag vrienden uit en word kampioen in dit vermakelijke sportspel.',
    'Beleef de spanning van de sport met vlotte gameplay, realistische bewegingen en competitieve modi. Perfect voor een snel potje of een volledig toernooi met vrienden.',
  ],
  'Party': [
    'Het ultieme partyspel voor gezellige avonden met vrienden en familie. Tientallen hilarische minigames, competitieve multiplayer en urenlang plezier voor iedereen.',
    'Verzamel je vrienden voor dit geweldige partyspel vol minigames, verrassingen en lachmomenten. Toegankelijk voor beginners maar met genoeg diepgang voor ervaren spelers.',
    'Feestelijk multiplayer-plezier met een enorme variatie aan minigames, leuke spelregels en chaotische momenten. Ideaal voor gameravonden en familieplezier van jong tot oud.',
    'Een bruisend partyspel dat iedereen aan het lachen maakt. Diverse minigames testen je reflexen, kennis en creativiteit in een gezellige competitie voor twee tot vier spelers.',
  ],
  'Vecht': [
    'Een intens vechtspel met een diverse roster aan personages, spectaculaire combo\'s en diepe gevechtsmechanismen. Beheers elke fighter, ontdek verborgen technieken en domineer het gevecht.',
    'Epische vechtactie met unieke personages, vloeiende animaties en strategische diepgang. Leer combo\'s, blokkeer aanvallen en word de ultieme kampioen in intense duels.',
    'Stap de arena in voor explosieve vechtpartijen met een breed scala aan personages. Elke fighter heeft unieke moves, speciale aanvallen en een eigen speelstijl om te ontdekken.',
    'Vechtactie op hoog niveau met snelle combo\'s, krachtige speciale aanvallen en tactische diepgang. Oefen je timing, leer je favoriete personage kennen en daag de sterkste tegenstanders uit.',
  ],
  'Shooter': [
    'Een spannende shooter met intense actie, gevarieerde wapens en tactische gameplay. Vecht je door vijandelijk gebied, voltooi missies en bewijs je schietkunst in dit meeslepende spel.',
    'Actiegeladen shooter met diverse wapens, uitdagende missies en meeslepende multiplayer. Scherp je reflexen, plan je aanval en schiet je weg naar de overwinning.',
    'Explosieve shooter-actie met strategische elementen, gevarieerde vijanden en intense vuurgevechten. Kies je bewapening, coördineer je aanpak en overleef gevaarlijke missies.',
  ],
  'Puzzel': [
    'Een briljant puzzelspel dat je hersenen uitdaagt met steeds complexere raadsels. Combineer logica, timing en creativiteit om alle uitdagingen te overwinnen in dit verslavende spel.',
    'Uitdagende puzzels die je denkvermogen testen met inventieve mechanismen en stijgende moeilijkheidsgraad. Perfecte balans tussen toegankelijkheid en diepgang voor urenlang puzzelplezier.',
    'Kraak ingenieuze puzzels in dit charmante spel dat je logisch denken op de proef stelt. Met elk nieuw level worden de raadsels complexer en bevredigender om op te lossen.',
  ],
  'Simulatie': [
    'Een charmante simulatie waarin je je eigen wereld opbouwt en beheert. Neem beslissingen, ontwikkel je omgeving en geniet van ontspannen maar verslavende gameplay met eindeloze mogelijkheden.',
    'Bouw, beheer en ontdek in deze gedetailleerde simulatie vol keuzes en mogelijkheden. Creëer je eigen verhaal in een levendige wereld die reageert op alles wat je doet.',
    'Ontspannen simulatiegameplay met een gezellige sfeer en verrassend veel diepgang. Personaliseer je wereld, ontmoet bijzondere personages en geniet van een spel dat je uren bezighoudt.',
  ],
  'Muziek': [
    'Een ritmisch muziekspel dat je laat bewegen op aanstekelijke beats. Volg het ritme, voer dansbewegingen uit en ontgrendel nieuwe nummers in dit energieke en vermakelijke spel.',
    'Muzikaal plezier met een geweldige soundtrack, uitdagende ritme-gameplay en een vrolijke sfeer. Tik, swipe en beweeg op de maat van de muziek in dit verslavende muziekspel.',
  ],
  'Fitness': [
    'Een interactief fitnessspel dat gaming en bewegen combineert. Train je lichaam met leuke oefeningen, volg je voortgang en word fitter terwijl je speelt. Perfecte combinatie van plezier en gezondheid.',
  ],
  'Sandbox': [
    'Een grenzeloos creatief sandbox-spel waarin je vrij bent om te bouwen, verkennen en overleven. Verzamel materialen, creëer constructies en ontdek een eindeloze wereld vol mogelijkheden.',
  ],
  'Pinball': [
    'Een vermakelijk flipperspel met thematische tafels, speciale bonussen en verslavende gameplay. Scoor punten, activeer speciale modi en jaag op de highscore in dit klassieke flipperspel.',
  ],
  'Kaartspel': [
    'Een strategisch kaartspel met verzamelbare kaarten, tactische diepgang en uitdagende tegenstanders. Bouw je deck, ontwikkel je strategie en word de ultieme kampioensspeler.',
  ],
  'Ritme': [
    'Een uniek ritmespel dat muziek en gameplay op inventieve wijze combineert. Volg de beat, reageer op het ritme en beleef een muzikaal avontuur vol verrassingen en uitdagingen.',
  ],
};

// ============================================================
// GAME-SPECIFIEKE BESCHRIJVINGEN
// Placeholder: wordt later ingevuld door andere agents.
// Key format: 'gamenaam lowercase|platformcode'
// Voorbeeld: 'the legend of zelda: breath of the wild|sw'
// ============================================================
const GAME_DESC = {};

// ============================================================
// HULPFUNCTIES
// ============================================================

/**
 * Normaliseert een game-naam + platform tot een lookup key
 * voor het GAME_DESC object.
 */
function normalizeKey(name, platform) {
  const platMap = {
    'NES': 'nes',
    'Super Nintendo': 'snes',
    'Nintendo 64': 'n64',
    'Game Boy': 'gb',
    'Game Boy Color': 'gbc',
    'Game Boy Advance': 'gba',
    'GameCube': 'gc',
    'Nintendo DS': 'ds',
    'Nintendo 3DS': '3ds',
    'Wii': 'wii',
    'Wii U': 'wiiu',
    'Nintendo Switch': 'sw',
  };
  return name.toLowerCase() + '|' + (platMap[platform] || platform.toLowerCase());
}

/**
 * Kiest een genre-template op basis van index om afwisseling
 * te garanderen (round-robin per genre).
 */
function getGenreTemplate(genre, index) {
  const templates = GENRE_TEMPLATES[genre] || GENRE_TEMPLATES['Actie'];
  return templates[index % templates.length];
}

// ============================================================
// HOOFDFUNCTIE - beschrijving genereren per product
// ============================================================
function generateDescription(product, index) {
  const { name, platform, genre, condition, completeness, isConsole, sku } = product;

  // Consoles en accessoires: behoud bestaande beschrijving
  if (isConsole || sku.startsWith('ACC-')) {
    return product.description;
  }

  // Behoud bestaande beschrijvingen van 45+ woorden
  const currentWordCount = product.description.split(/\s+/).length;
  if (currentWordCount >= 45) {
    return product.description;
  }

  // 1. Probeer game-specifieke beschrijving
  const key = normalizeKey(name, platform);
  let gameplayDesc = GAME_DESC[key];

  // 2. Probeer zonder accenten (Pokemon vs Pokémon)
  if (!gameplayDesc) {
    const keyNoAccent = key
      .replace(/[éèëê]/g, 'e')
      .replace(/[öòô]/g, 'o')
      .replace(/[üùû]/g, 'u')
      .replace(/[áàâä]/g, 'a')
      .replace(/[íìîï]/g, 'i');
    gameplayDesc = GAME_DESC[keyNoAccent];
  }

  // 3. Fallback naar genre template
  if (!gameplayDesc) {
    gameplayDesc = getGenreTemplate(genre, index);
  }

  // Bouw de volledige beschrijving op
  const platformCtx = PLATFORM_CONTEXT[platform] || 'Dit spel';
  const condText = CONDITION_TEXT[condition] || 'Dit exemplaar is in goede staat';
  const compText = COMPLETENESS_TEXT[completeness] || '';

  // Samenstelling: [Platform context] + [Gameplay] + [Conditie + Compleetheid] + [PAL/EUR]
  let desc = `${platformCtx} biedt ${gameplayDesc.charAt(0).toLowerCase()}${gameplayDesc.slice(1)}`;

  // Verwijder punt aan einde voor vloeiende overgang naar conditie
  if (desc.endsWith('.')) desc = desc.slice(0, -1);

  desc += '. ' + condText;
  if (compText) desc += ' ' + compText;
  desc += '. 100% origineel en getest op werking. Europese versie (PAL/EUR).';

  return desc;
}

// ============================================================
// VERWERK ALLE PRODUCTEN
// ============================================================
let updated = 0;
let kept = 0;
const updatedProducts = products.map((product, index) => {
  const newDescription = generateDescription(product, index);
  if (newDescription !== product.description) {
    updated++;
  } else {
    kept++;
  }
  return { ...product, description: newDescription };
});

fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8');

// ============================================================
// STATISTIEKEN
// ============================================================
const byPlatform = {};
updatedProducts.forEach(p => {
  if (!byPlatform[p.platform]) byPlatform[p.platform] = { total: 0, words: 0 };
  byPlatform[p.platform].total++;
  byPlatform[p.platform].words += p.description.split(/\s+/).length;
});

console.log(`\nBeschrijvingen bijgewerkt: ${updated} van ${products.length} producten`);
console.log(`Behouden (al goed): ${kept} producten\n`);

console.log('Per platform:');
Object.keys(byPlatform).sort().forEach(p => {
  const avg = Math.round(byPlatform[p].words / byPlatform[p].total);
  console.log(`  ${p}: ${byPlatform[p].total} producten, gem. ${avg} woorden`);
});

// Korte beschrijvingen detecteren
const shortDescs = updatedProducts
  .filter(p => !p.isConsole && !p.sku.startsWith('ACC-'))
  .filter(p => p.description.split(/\s+/).length < 30);
if (shortDescs.length > 0) {
  console.log(`\nWaarschuwing: ${shortDescs.length} games met minder dan 30 woorden:`);
  shortDescs.slice(0, 10).forEach(p => {
    console.log(`  [${p.sku}] ${p.name} (${p.description.split(/\s+/).length}w)`);
  });
}

console.log('\nVoorbeelden:');
updatedProducts
  .filter(p => !p.isConsole && !p.sku.startsWith('ACC-'))
  .slice(0, 8)
  .forEach(p => {
    console.log(`\n  [${p.sku}] ${p.name} (${p.description.split(/\s+/).length}w)`);
    console.log(`  ${p.description}`);
  });
