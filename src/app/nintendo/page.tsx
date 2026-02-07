'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface EraData {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  description: string;
  quote?: string;
  facts: { label: string; value: string }[];
  accentRgb: string;
  accentClass: string;
  shopLink?: string;
  shopLabel?: string;
}

// ============================================================================
// DATA — Volledige Nintendo tijdlijn
// ============================================================================

const eras: EraData[] = [
  {
    id: 'founding',
    year: 1889,
    title: 'Het Begin',
    subtitle: 'Van speelkaarten tot wereldmerk',
    description:
      'In het hart van Kyoto stichtte Fusajiro Yamauchi een klein bedrijf dat handgeschilderde hanafuda speelkaarten maakte. Deze prachtige bloemenkaarten, gebruikt voor traditionele Japanse spellen, werden al snel de populairste in heel Japan. Niemand kon toen vermoeden dat dit bescheiden begin zou uitgroeien tot het meest iconische entertainmentbedrijf ter wereld.',
    quote: 'Een reis van duizend mijl begint met een enkele stap.',
    facts: [
      { label: 'Opgericht in', value: 'Kyoto, Japan' },
      { label: 'Oprichter', value: 'Fusajiro Yamauchi' },
      { label: 'Eerste product', value: 'Hanafuda kaarten' },
    ],
    accentRgb: '217, 119, 6',
    accentClass: 'amber',
  },
  {
    id: 'nes',
    year: 1983,
    title: 'Nintendo Entertainment System',
    subtitle: 'De redding van de game-industrie',
    description:
      'Na de grote videogamecrash van 1983 leek de toekomst van console gaming onzeker. De markt was overspoeld met slechte spellen en het vertrouwen van consumenten was verdwenen. Nintendo bewees het tegendeel met de Famicom in Japan en de NES in de rest van de wereld. Met revolutionaire kwaliteitscontrole en legendarische titels als Super Mario Bros., The Legend of Zelda en Metroid werd een gouden tijdperk geboren dat de hele industrie nieuw leven inblies.',
    quote: 'De console die een industrie van de ondergang redde.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '61,91 miljoen' },
      { label: 'Iconisch spel', value: 'Super Mario Bros.' },
      { label: 'Impact', value: 'Redde de game-industrie' },
    ],
    accentRgb: '239, 68, 68',
    accentClass: 'red',
    shopLink: '/shop?platform=NES',
    shopLabel: 'Bekijk NES games',
  },
  {
    id: 'gameboy',
    year: 1989,
    title: 'Game Boy',
    subtitle: 'Gaming voor onderweg',
    description:
      'Terwijl concurrenten focusten op kleurenschermen en rekenkracht, maakte ontwerper Gunpei Yokoi een gedurfde keuze: een simpel, betrouwbaar apparaat met een onverslaanbare batterijduur van 30 uur. Gebundeld met het verslavende Tetris werd de Game Boy een wereldwijd cultureel fenomeen. Van schoolpleinen tot vliegtuigstoelen — overal ter wereld zag je dat herkenbare grijsgroene scherm oplichten. Met 118 miljoen verkochte exemplaren bewees Nintendo dat eenvoud de ultieme verfijning is.',
    quote: 'De kracht van eenvoud — 118 miljoen keer bewezen.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '118,69 miljoen' },
      { label: 'Legendarische bundel', value: 'Tetris' },
      { label: 'Batterijduur', value: 'Tot 30 uur' },
    ],
    accentRgb: '155, 188, 15',
    accentClass: 'lime',
    shopLink: '/shop?platform=Game+Boy+%2F+Color',
    shopLabel: 'Bekijk Game Boy games',
  },
  {
    id: 'snes',
    year: 1990,
    title: 'Super Nintendo',
    subtitle: '16-bit meesterwerken',
    description:
      'De Super Nintendo bracht gaming naar ongekende hoogten met adembenemende Mode 7 pseudo-3D graphics en de legendarische Sony SPC700 geluidschip die orkestkwaliteit muziek mogelijk maakte. De spelbibliotheek wordt tot op de dag van vandaag beschouwd als een van de allerbeste ooit. Van de epische avonturen in A Link to the Past, via de ruimteodyssee van Super Metroid, tot het platformmeesterwerk Super Mario World — elk spel was een kunstwerk. Dit was het hoogtepunt van het 2D-tijdperk.',
    quote: 'Het gouden tijdperk van 2D gaming.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '49,10 miljoen' },
      { label: 'Baanbrekend', value: 'Mode 7 graphics' },
      { label: 'Geluid', value: 'Sony SPC700 chip' },
    ],
    accentRgb: '168, 85, 247',
    accentClass: 'purple',
    shopLink: '/shop?platform=Super+Nintendo',
    shopLabel: 'Bekijk SNES games',
  },
  {
    id: 'n64',
    year: 1996,
    title: 'Nintendo 64',
    subtitle: 'De sprong naar 3D',
    description:
      'Met de Nintendo 64 waagde Nintendo een gedurfde sprong naar de derde dimensie. Super Mario 64 herdefinieerde compleet wat een platformspel kon zijn en creeerde het template voor alle 3D-games die zouden volgen. The Legend of Zelda: Ocarina of Time wordt nog steeds beschouwd als een van de beste games ooit gemaakt. GoldenEye 007 bewees dat multiplayer shooters ook op consoles konden schitteren. En met vier controller-poorten als standaard maakte de N64 de woonkamer tot het ultieme gaming-slagveld.',
    quote: 'Het begin van een nieuwe dimensie in gaming.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '32,93 miljoen' },
      { label: 'Innovatie', value: 'Eerste analoge stick' },
      { label: 'Multiplayer', value: '4 spelers standaard' },
    ],
    accentRgb: '34, 197, 94',
    accentClass: 'green',
    shopLink: '/shop?platform=Nintendo+64',
    shopLabel: 'Bekijk N64 games',
  },
  {
    id: 'gamecube',
    year: 2001,
    title: 'GameCube',
    subtitle: 'Compact en onvergetelijk',
    description:
      'De GameCube was Nintendo\'s krachtigste antwoord op de PlayStation 2 en Xbox — een compacte, paarse kubus met een herkenbaar handvat dat uitnodigde om hem overal mee naartoe te nemen. Hoewel de verkoopcijfers achterbleven bij de concurrentie, leverde het platform een ongelooflijke bibliotheek op die tot cult-status is uitgegroeid. Super Smash Bros. Melee werd een van de langstlevende competitieve games ooit. Metroid Prime bewees dat de franchise ook in 3D-perspectief kon schitteren. En The Wind Waker\'s cel-shaded kunststijl was zijn tijd ver vooruit.',
    quote: 'Klein maar onvergetelijk — de cult classic onder de consoles.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '21,74 miljoen' },
      { label: 'Formaat', value: 'Mini-DVD discs' },
      { label: 'Cult hit', value: 'Smash Bros. Melee' },
    ],
    accentRgb: '129, 140, 248',
    accentClass: 'indigo',
    shopLink: '/shop?platform=GameCube',
    shopLabel: 'Bekijk GameCube games',
  },
  {
    id: 'ds',
    year: 2004,
    title: 'Nintendo DS',
    subtitle: 'Dubbel scherm revolutie',
    description:
      'Met twee schermen en een touchscreen deed Nintendo iets wat niemand verwachtte — en het resultaat was niets minder dan een revolutie. De DS werd hun bestverkochte console ooit met meer dan 154 miljoen exemplaren. Het trok een geheel nieuw publiek aan: Brain Age maakte gaming populair bij volwassenen, Nintendogs veroverde de harten van jong en oud, en Professor Layton bewees dat puzzels en verhalen perfect samengaan. Tegelijkertijd kregen hardcore gamers Pokemon Diamond & Pearl en Mario Kart DS. De DS bewees dat innovatie niet draait om kracht, maar om verbeelding.',
    quote: 'De bestverkochte handheld ooit — 154 miljoen verhalen.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '154,02 miljoen' },
      { label: 'Innovatie', value: 'Touchscreen gaming' },
      { label: 'Doorbraak', value: 'Nieuw publiek bereikt' },
    ],
    accentRgb: '56, 189, 248',
    accentClass: 'sky',
    shopLink: '/shop?platform=Nintendo+DS',
    shopLabel: 'Bekijk DS games',
  },
  {
    id: 'wii',
    year: 2006,
    title: 'Wii',
    subtitle: 'Bewegen is spelen',
    description:
      'De Wii veranderde niet alleen gaming — het veranderde hoe de wereld naar gaming keek. Met de revolutionaire Wii Remote maakte Nintendo het spelen van games toegankelijk voor letterlijk iedereen, van kleuters tot grootouders. Wii Sports werd een cultureel fenomeen dat families en vrienden samenbracht voor de televisie. De console stond maandenlang in elke winkel uitverkocht. Met meer dan 101 miljoen verkochte exemplaren bewees Nintendo definitief dat innovatie altijd wint van pure rekenkracht. De Wii maakte gaming sociaal, fysiek en universeel.',
    quote: 'Het moment dat gaming van iedereen werd.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '101,63 miljoen' },
      { label: 'Fenomeen', value: 'Wii Sports' },
      { label: 'Revolutie', value: 'Motion controls' },
    ],
    accentRgb: '34, 211, 238',
    accentClass: 'cyan',
    shopLink: '/shop?platform=Wii',
    shopLabel: 'Bekijk Wii games',
  },
  {
    id: '3ds',
    year: 2011,
    title: 'Nintendo 3DS',
    subtitle: '3D zonder bril',
    description:
      'De Nintendo 3DS bood een ervaring die geen enkele andere console kon evenaren: stereoscopisch 3D zonder bril. Met StreetPass creeerde Nintendo een sociaal verbindend element dat spelers aanmoedigde hun console overal mee naartoe te nemen — je wist nooit wanneer je een andere speler tegenkwam. De gamebibliotheek groeide uit tot een van de sterkste ooit, met meesterwerken als A Link Between Worlds, Pokemon X & Y, Fire Emblem Awakening en Animal Crossing: New Leaf. De 3DS bewees dat de handheld markt springlevend was.',
    quote: 'Een nieuwe dimensie in de palm van je hand.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '75,94 miljoen' },
      { label: 'Technologie', value: '3D zonder bril' },
      { label: 'Sociaal', value: 'StreetPass functie' },
    ],
    accentRgb: '244, 63, 94',
    accentClass: 'rose',
    shopLink: '/shop?platform=Nintendo+3DS',
    shopLabel: 'Bekijk 3DS games',
  },
  {
    id: 'wiiu',
    year: 2012,
    title: 'Wii U',
    subtitle: 'Voorloper van hybride gaming',
    description:
      'De Wii U was zijn tijd vooruit. Het concept van een tablet-controller waarmee je kon doorspelen zonder televisie was revolutionair — een idee dat later de basis zou vormen voor de Switch. Hoewel verwarrende marketing en naamgeving de console commercieel tegenwerkten, leverden de exclusives onvergetelijke ervaringen. Splatoon introduceerde een verfrissend nieuw shooter-concept, Super Mario 3D World bracht co-op platforming naar perfectie, en Mario Kart 8 werd zo goed dat het later opnieuw werd uitgebracht voor de Switch. De Wii U was de onbezongen held die de toekomst vormgaf.',
    quote: 'De onbezongen held die de toekomst van Nintendo vormgaf.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '13,56 miljoen' },
      { label: 'Innovatie', value: 'Off-TV Play' },
      { label: 'Erfenis', value: 'Fundament voor Switch' },
    ],
    accentRgb: '59, 130, 246',
    accentClass: 'blue',
    shopLink: '/shop?platform=Wii+U',
    shopLabel: 'Bekijk Wii U games',
  },
  {
    id: 'switch',
    year: 2017,
    title: 'Nintendo Switch',
    subtitle: 'Thuis en onderweg — overal',
    description:
      'De Nintendo Switch combineerde eindelijk het beste van twee werelden in een elegant design: een volwaardige thuisconsole die je moeiteloos meeneemt als handheld. Met de iconische afneembare Joy-Con controllers, een indrukwekkende line-up geleid door het baanbrekende Breath of the Wild, en een explosieve indie-scene werd de Switch een van de bestverkopende consoles aller tijden. Van de trein naar de bank, van de lunch-pauze naar de woonkamer — de Switch paste zich aan jouw leven aan, niet andersom. Met meer dan 143 miljoen verkochte exemplaren is de Switch het levende bewijs dat Nintendo\'s filosofie van innovatie boven kracht tijdloos is.',
    quote: 'De console die zich aanpast aan jouw leven.',
    facts: [
      { label: 'Wereldwijd verkocht', value: '143+ miljoen' },
      { label: 'Concept', value: 'Hybride console' },
      { label: 'Lanceringstitel', value: 'Zelda: BotW' },
    ],
    accentRgb: '239, 68, 68',
    accentClass: 'red',
    shopLink: '/shop?platform=Nintendo+Switch',
    shopLabel: 'Bekijk Switch games',
  },
];

// Platform links voor de outro sectie
const platformChips = [
  { href: '/shop?platform=Nintendo+Switch', label: 'Switch', gradient: 'from-red-500 to-red-600' },
  { href: '/shop?platform=Nintendo+3DS', label: '3DS', gradient: 'from-rose-500 to-rose-600' },
  { href: '/shop?platform=Nintendo+DS', label: 'DS', gradient: 'from-sky-500 to-sky-600' },
  { href: '/shop?platform=Game+Boy+Advance', label: 'GBA', gradient: 'from-blue-500 to-indigo-600' },
  { href: '/shop?platform=Game+Boy+%2F+Color', label: 'Game Boy', gradient: 'from-lime-500 to-green-600' },
  { href: '/shop?platform=GameCube', label: 'GameCube', gradient: 'from-indigo-500 to-indigo-600' },
  { href: '/shop?platform=Nintendo+64', label: 'N64', gradient: 'from-green-500 to-emerald-600' },
  { href: '/shop?platform=Super+Nintendo', label: 'SNES', gradient: 'from-purple-500 to-purple-600' },
  { href: '/shop?platform=NES', label: 'NES', gradient: 'from-red-600 to-red-700' },
  { href: '/shop?platform=Wii', label: 'Wii', gradient: 'from-cyan-400 to-cyan-500' },
  { href: '/shop?platform=Wii+U', label: 'Wii U', gradient: 'from-blue-500 to-blue-600' },
];

// ============================================================================
// SUB-COMPONENTEN
// ============================================================================

/** Geanimeerde nummerteller */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const duration = 2000;
    const steps = duration / 16;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString('nl-NL')}
      {suffix}
    </span>
  );
}

/** Zwevende achtergrond deeltjes */
function ParticleField({ count, color }: { count: number; color: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: 1 + (i % 3),
        duration: 4 + (i % 5) * 1.2,
        delay: (i % 7) * 0.8,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -20 - p.size * 5, 0],
            opacity: [0.05, 0.3, 0.05],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// INTRO SECTIE — Cinematisch openingsscherm
// ============================================================================

function IntroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <motion.section
      ref={ref}
      style={{ opacity, scale }}
      className="relative h-screen flex items-center justify-center bg-[#050810] overflow-hidden"
    >
      {/* Achtergrond gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.03),transparent_50%)]" />
      </div>

      {/* Deeltjes veld */}
      <ParticleField count={40} color="rgba(255,255,255,0.15)" />

      {/* Zwevende geometrische vormen */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[18%] right-[15%] w-20 h-20 rounded-2xl border border-white/[0.04] bg-white/[0.01] rotate-12"
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-[22%] left-[10%] w-14 h-14 rounded-full border border-emerald-500/[0.06] bg-emerald-500/[0.02]"
      />
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute top-[35%] left-[20%] w-8 h-8 rounded-lg border border-purple-500/[0.05] bg-purple-500/[0.01] rotate-45"
      />
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[30%] right-[18%] w-10 h-10 rounded-xl border border-cyan-500/[0.05] bg-cyan-500/[0.01]"
      />

      {/* Horizontale lichtstralen */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-y-1/2"
      />

      <motion.div style={{ y }} className="relative text-center px-4 max-w-4xl mx-auto">
        {/* Decoratieve lijn boven */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-20 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto mb-10"
        />

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-emerald-400/80 text-[11px] font-bold uppercase tracking-[0.25em]">
            Een interactief verhaal
          </span>
        </motion.div>

        {/* Hoofdtitel */}
        <motion.h1
          initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-5xl sm:text-7xl lg:text-[120px] font-extrabold tracking-tighter text-white mb-6 leading-[0.9]"
        >
          <span className="block">Het Verhaal</span>
          <span className="block mt-1 sm:mt-2">
            van{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-emerald-400 to-blue-400">
              Nintendo
            </span>
          </span>
        </motion.h1>

        {/* Ondertitel */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.5 }}
          className="text-base sm:text-lg lg:text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto mb-6"
        >
          Een reis door 137 jaar innovatie, verbeelding en onvergetelijk plezier.
          <br className="hidden sm:block" />
          Van handgeschilderde speelkaarten tot de meest iconische consoles ter wereld.
        </motion.p>

        {/* Jaartal bereik */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="flex items-center justify-center gap-4 text-sm font-mono tracking-[0.15em] mb-16"
        >
          <span className="text-amber-400/60">1889</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-[1px] bg-white/20" />
            <div className="w-3 h-[1px] bg-white/30" />
            <div className="w-8 h-[1px] bg-gradient-to-r from-amber-500/40 via-emerald-500/40 to-red-500/40" />
            <div className="w-3 h-[1px] bg-white/30" />
            <div className="w-2 h-[1px] bg-white/20" />
          </div>
          <span className="text-red-400/60">HEDEN</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1.2 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            Scroll om te beginnen
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bodem gradient overgang */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050810] to-transparent pointer-events-none" />
    </motion.section>
  );
}

// ============================================================================
// ERA SECTIE — Individuele tijdperk weergave
// ============================================================================

function EraSection({ era, index }: { era: EraData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, margin: '-15%' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const yearY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const yearScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const isEven = index % 2 === 0;

  const stagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const slideIn = {
    hidden: { opacity: 0, x: isEven ? 60 : -60, filter: 'blur(15px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      ref={ref}
      id={era.id}
      className="relative min-h-screen flex items-center bg-[#050810] overflow-hidden py-24 lg:py-0"
    >
      {/* Gradient achtergronden */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${isEven ? '25% 20%' : '75% 20%'}, rgba(${era.accentRgb}, 0.12), transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${isEven ? '75% 85%' : '25% 85%'}, rgba(${era.accentRgb}, 0.06), transparent 50%)`,
        }}
      />
      {/* Subtiele glow in het midden */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${era.accentRgb}, 0.03), transparent 40%)`,
        }}
      />

      {/* Zwevende vormen met parallax */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 pointer-events-none">
        {/* Vorm 1 — groot afgerond vierkant */}
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 10 + index, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-3xl border"
          style={{
            width: 80 + index * 4,
            height: 80 + index * 4,
            top: `${12 + (index * 7) % 25}%`,
            right: `${8 + (index * 11) % 20}%`,
            borderColor: `rgba(${era.accentRgb}, 0.07)`,
            backgroundColor: `rgba(${era.accentRgb}, 0.02)`,
            transform: `rotate(${15 + index * 7}deg)`,
          }}
        />
        {/* Vorm 2 — cirkel */}
        <motion.div
          animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 13 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute rounded-full border"
          style={{
            width: 50 + index * 3,
            height: 50 + index * 3,
            bottom: `${18 + (index * 13) % 25}%`,
            left: `${5 + (index * 9) % 18}%`,
            borderColor: `rgba(${era.accentRgb}, 0.06)`,
            backgroundColor: `rgba(${era.accentRgb}, 0.015)`,
          }}
        />
        {/* Vorm 3 — klein element */}
        <motion.div
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute rounded-xl border"
          style={{
            width: 28,
            height: 28,
            top: `${55 + (index * 11) % 20}%`,
            left: `${35 + (index * 13) % 25}%`,
            borderColor: `rgba(${era.accentRgb}, 0.05)`,
            backgroundColor: `rgba(${era.accentRgb}, 0.02)`,
            transform: 'rotate(45deg)',
          }}
        />
        {/* Vorm 4 — langwerpig accent */}
        <motion.div
          animate={{ y: [0, 14, 0], x: [0, -6, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 2,
            top: `${30 + (index * 17) % 35}%`,
            right: `${25 + (index * 7) % 15}%`,
            backgroundColor: `rgba(${era.accentRgb}, 0.06)`,
            transform: `rotate(${-20 + index * 12}deg)`,
          }}
        />
        {/* Vorm 5 — glow orb */}
        <div
          className="absolute rounded-full blur-[60px]"
          style={{
            width: 200,
            height: 200,
            top: `${20 + (index * 19) % 40}%`,
            left: isEven ? '5%' : '65%',
            backgroundColor: `rgba(${era.accentRgb}, 0.04)`,
          }}
        />
      </motion.div>

      {/* Groot achtergrond jaartal */}
      <motion.div
        style={{ y: yearY, scale: yearScale }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="text-[140px] sm:text-[200px] lg:text-[320px] xl:text-[380px] font-extrabold tracking-tighter leading-none"
          style={{ color: `rgba(${era.accentRgb}, 0.035)` }}
        >
          {era.year}
        </span>
      </motion.div>

      {/* Content grid */}
      <div ref={contentRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${!isEven ? 'lg:[direction:rtl]' : ''}`}
        >
          {/* Tekst content — 7 kolommen */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={`lg:col-span-7 ${!isEven ? 'lg:[direction:ltr]' : ''}`}
          >
            {/* Era nummer badge */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10" style={{ backgroundColor: `rgba(${era.accentRgb}, 0.3)` }} />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: `rgba(${era.accentRgb}, 0.6)` }}
              >
                Hoofdstuk {String(index + 1).padStart(2, '0')} / {eras.length}
              </span>
            </motion.div>

            {/* Jaartal */}
            <motion.div variants={fadeUp} className="mb-1">
              <span
                className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tighter"
                style={{ color: `rgba(${era.accentRgb}, 0.85)` }}
              >
                {era.year}
              </span>
            </motion.div>

            {/* Titel */}
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2"
            >
              {era.title}
            </motion.h2>

            {/* Ondertitel */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl font-medium mb-8"
              style={{ color: `rgba(${era.accentRgb}, 0.65)` }}
            >
              {era.subtitle}
            </motion.p>

            {/* Beschrijving */}
            <motion.p variants={fadeUp} className="text-slate-400 text-[15px] sm:text-base leading-[1.8] mb-8 max-w-2xl">
              {era.description}
            </motion.p>

            {/* Citaat */}
            {era.quote && (
              <motion.div variants={fadeUp} className="mb-10">
                <div
                  className="flex items-start gap-3 pl-4 border-l-2"
                  style={{ borderColor: `rgba(${era.accentRgb}, 0.25)` }}
                >
                  <p className="text-sm sm:text-base italic text-slate-500 leading-relaxed">
                    &ldquo;{era.quote}&rdquo;
                  </p>
                </div>
              </motion.div>
            )}

            {/* Shop link */}
            {era.shopLink && (
              <motion.div variants={fadeUp}>
                <Link href={era.shopLink}>
                  <motion.span
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border"
                    style={{
                      color: `rgba(${era.accentRgb}, 0.9)`,
                      borderColor: `rgba(${era.accentRgb}, 0.15)`,
                      backgroundColor: `rgba(${era.accentRgb}, 0.05)`,
                    }}
                  >
                    {era.shopLabel}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Feiten paneel — 5 kolommen */}
          <motion.div
            variants={slideIn}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={`lg:col-span-5 ${!isEven ? 'lg:[direction:ltr]' : ''}`}
          >
            <div
              className="rounded-3xl p-8 lg:p-10 border relative overflow-hidden"
              style={{
                backgroundColor: `rgba(${era.accentRgb}, 0.025)`,
                borderColor: `rgba(${era.accentRgb}, 0.08)`,
              }}
            >
              {/* Decoratieve glow in paneel */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
                style={{ backgroundColor: `rgba(${era.accentRgb}, 0.06)` }}
              />

              <h3
                className="relative text-[11px] font-bold uppercase tracking-[0.2em] mb-10"
                style={{ color: `rgba(${era.accentRgb}, 0.5)` }}
              >
                Belangrijke feiten
              </h3>

              <div className="relative space-y-8">
                {era.facts.map((fact, fi) => (
                  <motion.div
                    key={fact.label}
                    initial={{ opacity: 0, x: isEven ? 25 : -25 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.5 + fi * 0.12, ease: [0.16, 1, 0.3, 1] as const }}
                  >
                    <div className="text-[11px] text-slate-500 uppercase tracking-[0.15em] mb-1.5">{fact.label}</div>
                    <div className="text-xl sm:text-2xl font-bold text-white leading-tight">{fact.value}</div>
                    {fi < era.facts.length - 1 && (
                      <div
                        className="mt-6 h-[1px]"
                        style={{ backgroundColor: `rgba(${era.accentRgb}, 0.06)` }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtiele sectie scheider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </section>
  );
}

// ============================================================================
// TOTAAL STATISTIEKEN SECTIE — Tussenliggende impact visualisatie
// ============================================================================

function TotalStatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20%' });

  const stats = [
    { value: 882, suffix: ' mln+', label: 'Consoles verkocht' },
    { value: 137, suffix: ' jaar', label: 'Innovatie' },
    { value: 11, suffix: '', label: 'Generaties' },
    { value: 846, suffix: '+', label: 'In onze collectie' },
  ];

  return (
    <section ref={ref} className="relative bg-[#050810] overflow-hidden py-32 lg:py-40">
      {/* Achtergrond */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(239,68,68,0.03),transparent_50%)]" />

      {/* Glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[100px] pointer-events-none"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-500/50">
            De impact in cijfers
          </span>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Decoratieve lijn */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-16 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mx-auto max-w-sm"
        />
      </div>
    </section>
  );
}

// ============================================================================
// OUTRO SECTIE — Finale met CTA naar de shop
// ============================================================================

function OutroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center bg-[#050810] overflow-hidden py-24 lg:py-0">
      {/* Achtergrond effecten */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.04),transparent_50%)]" />

      {/* Deeltjes */}
      <ParticleField count={25} color="rgba(16, 185, 129, 0.2)" />

      {/* Zwevende glow orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-emerald-500/[0.04] blur-[80px]"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-1/3 left-1/4 w-40 h-40 rounded-full bg-cyan-500/[0.04] blur-[60px]"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        {/* Decoratieve lijn */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-24 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mx-auto mb-10"
        />

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-emerald-400/80 text-[11px] font-bold uppercase tracking-[0.25em]">
            Het avontuur gaat verder
          </span>
        </motion.div>

        {/* Titel */}
        <motion.h2
          initial={{ opacity: 0, y: 45, filter: 'blur(15px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]"
        >
          <span className="block">Het verhaal</span>
          <span className="block">
            gaat{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              verder
            </span>
          </span>
        </motion.h2>

        {/* Beschrijving */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed"
        >
          Van hanafuda kaarten tot hybride consoles — Nintendo blijft al 137 jaar innoveren
          en verrassen. Ontdek onze complete collectie van 846+ originele Nintendo producten,
          persoonlijk getest en klaar voor jouw volgende avontuur.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-3 gap-6 sm:gap-10 max-w-md mx-auto mb-14"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              <AnimatedCounter target={846} suffix="+" />
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mt-1">Producten</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              <AnimatedCounter target={11} />
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mt-1">Platforms</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">5.0</div>
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mt-1">Beoordeling</div>
          </div>
        </motion.div>

        {/* Platform chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-14"
        >
          {platformChips.map((p, i) => (
            <Link key={p.href} href={p.href}>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.1 + i * 0.04 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${p.gradient} text-white text-xs sm:text-sm font-bold shadow-lg cursor-pointer`}
              >
                {p.label}
              </motion.span>
            </Link>
          ))}
        </motion.div>

        {/* Hoofd CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/shop">
            <motion.span
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 transition-shadow"
            >
              Bekijk de complete collectie
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.span>
          </Link>
          <Link href="/inkoop">
            <motion.span
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white font-bold text-base sm:text-lg hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
            >
              Games verkopen
            </motion.span>
          </Link>
        </motion.div>

        {/* Credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2, duration: 1 }}
          className="mt-20 text-slate-600 text-xs font-medium tracking-[0.15em] uppercase"
        >
          Gameshop Enter — De Nintendo specialist van Nederland
        </motion.p>
      </div>
    </section>
  );
}

// ============================================================================
// TIJDLIJN NAVIGATIE — Vaste zijbalk (alleen desktop)
// ============================================================================

function TimelineNav() {
  return (
    <nav
      className="fixed right-5 xl:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-1.5"
      aria-label="Tijdlijn navigatie"
    >
      {/* Verticale lijn achtergrond */}
      <div className="absolute top-0 bottom-0 w-[1px] bg-white/[0.06] left-1/2 -translate-x-1/2" />

      {eras.map((era) => (
        <a
          key={era.id}
          href={`#${era.id}`}
          className="group relative flex items-center py-1 z-10"
          title={`${era.year} — ${era.title}`}
        >
          {/* Label bij hover */}
          <span className="absolute right-8 text-[10px] font-bold text-white/0 group-hover:text-white/60 transition-all duration-300 whitespace-nowrap tracking-wide pointer-events-none">
            {era.year}
          </span>
          {/* Dot */}
          <div
            className="w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-150"
            style={{
              backgroundColor: `rgba(${era.accentRgb}, 0.25)`,
            }}
          />
        </a>
      ))}
    </nav>
  );
}

// ============================================================================
// HOOFD PAGINA COMPONENT
// ============================================================================

export default function NintendoPage() {
  return (
    <div className="pt-16 lg:pt-20">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Het Verhaal van Nintendo — 137 Jaar Innovatie',
            description:
              'De volledige geschiedenis van Nintendo: van hanafuda kaarten in 1889 tot de Nintendo Switch.',
            publisher: {
              '@type': 'Organization',
              name: 'Gameshop Enter',
              url: 'https://gameshopenter.nl',
            },
          }),
        }}
      />

      <TimelineNav />
      <IntroSection />
      {eras.map((era, index) => (
        <EraSection key={era.id} era={era} index={index} />
      ))}
      <TotalStatsSection />
      <OutroSection />
    </div>
  );
}
