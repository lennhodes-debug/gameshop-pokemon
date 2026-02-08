'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

interface GameImage {
  name: string;
  image: string;
}

interface EraImages {
  console: string;
  games: GameImage[];
}

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
// AFBEELDINGEN — Console + iconic games per tijdperk
// ============================================================================

const ERA_IMAGES: Record<string, EraImages> = {
  nes: {
    console: '/images/nintendo/nes-console.webp',
    games: [
      { name: 'Super Mario Bros.', image: '/images/products/nes-049-super-mario-bros.webp' },
      { name: 'The Legend of Zelda', image: '/images/products/nes-054-the-legend-of-zelda.webp' },
      { name: 'Metroid', image: '/images/products/nes-039-metroid.webp' },
      { name: 'Mega Man 2', image: '/images/products/nes-034-mega-man-2.webp' },
    ],
  },
  gameboy: {
    console: '/images/nintendo/gameboy-console.webp',
    games: [
      { name: 'Tetris', image: '/images/products/gb-051-tetris.webp' },
      { name: 'Pokemon Red', image: '/images/products/gb-001-pokmon-red.webp' },
      { name: 'Pokemon Blue', image: '/images/products/gb-002-pokmon-blue.webp' },
      { name: 'Pokemon Yellow', image: '/images/products/gb-003-pokmon-yellow.webp' },
    ],
  },
  snes: {
    console: '/images/nintendo/snes-console.webp',
    games: [
      { name: 'Super Mario World', image: '/images/products/snes-047-super-mario-world.webp' },
      { name: 'Zelda: A Link to the Past', image: '/images/products/snes-060-zelda-a-link-to-the-past.webp' },
      { name: 'Super Metroid', image: '/images/products/snes-048-super-metroid.webp' },
      { name: 'Donkey Kong Country', image: '/images/products/snes-003-donkey-kong-country.webp' },
    ],
  },
  n64: {
    console: '/images/nintendo/n64-console.webp',
    games: [
      { name: 'Super Mario 64', image: '/images/products/n64-051-super-mario-64.webp' },
      { name: 'Zelda: Ocarina of Time', image: '/images/products/n64-062-zelda-ocarina-of-time.webp' },
      { name: 'GoldenEye 007', image: '/images/products/n64-020-goldeneye-007.webp' },
      { name: 'Mario Kart 64', image: '/images/products/n64-026-mario-kart-64.webp' },
    ],
  },
  gamecube: {
    console: '/images/nintendo/gamecube-console.webp',
    games: [
      { name: 'Super Smash Bros. Melee', image: '/images/products/gc-052-super-smash-bros-melee.webp' },
      { name: 'Zelda: The Wind Waker', image: '/images/products/gc-060-zelda-the-wind-waker.webp' },
      { name: 'Metroid Prime', image: '/images/products/gc-028-metroid-prime.webp' },
      { name: 'Super Mario Sunshine', image: '/images/products/gc-051-super-mario-sunshine.webp' },
    ],
  },
  ds: {
    console: '/images/nintendo/ds-console.webp',
    games: [
      { name: 'Mario Kart DS', image: '/images/products/ds-024-mario-kart-ds.webp' },
      { name: 'Pokemon HeartGold', image: '/images/products/ds-006-pokmon-heartgold.webp' },
      { name: 'Brain Training', image: '/images/products/ds-004-brain-training.webp' },
      { name: 'New Super Mario Bros.', image: '/images/products/ds-027-new-super-mario-bros.webp' },
    ],
  },
  wii: {
    console: '/images/nintendo/wii-console.webp',
    games: [
      { name: 'Wii Sports', image: '/images/products/wii-056-wii-sports.webp' },
      { name: 'Super Mario Galaxy', image: '/images/products/wii-045-super-mario-galaxy.webp' },
      { name: 'Mario Kart Wii', image: '/images/products/wii-023-mario-kart-wii.webp' },
      { name: 'Zelda: Skyward Sword', image: '/images/products/wii-060-zelda-skyward-sword.webp' },
    ],
  },
  '3ds': {
    console: '/images/nintendo/3ds-console.webp',
    games: [
      { name: 'Pokemon X', image: '/images/products/3ds-004-pokmon-x.webp' },
      { name: 'Zelda: A Link Between Worlds', image: '/images/products/3ds-066-zelda-a-link-between-worlds.webp' },
      { name: 'Animal Crossing: New Leaf', image: '/images/products/3ds-002-animal-crossing-new-leaf.webp' },
      { name: 'Fire Emblem Awakening', image: '/images/products/3ds-015-fire-emblem-awakening.webp' },
    ],
  },
  wiiu: {
    console: '/images/nintendo/wiiu-console.webp',
    games: [
      { name: 'Splatoon', image: '/images/products/wiiu-041-splatoon.webp' },
      { name: 'Mario Kart 8', image: '/images/products/wiiu-022-mario-kart-8.webp' },
      { name: 'Super Smash Bros. for Wii U', image: '/images/products/wiiu-045-super-smash-bros-for-wii-u.webp' },
      { name: 'Super Mario 3D World', image: '/images/products/wiiu-043-super-mario-3d-world.webp' },
    ],
  },
  switch: {
    console: '/images/nintendo/switch-console.webp',
    games: [
      { name: 'Zelda: Breath of the Wild', image: '/images/products/sw-115-the-legend-of-zelda-breath-of-the-wild.webp' },
      { name: 'Super Mario Odyssey', image: '/images/products/sw-110-super-mario-odyssey.webp' },
      { name: 'Super Smash Bros. Ultimate', image: '/images/products/sw-113-super-smash-bros-ultimate.webp' },
      { name: 'Animal Crossing: New Horizons', image: '/images/products/sw-002-animal-crossing-new-horizons.webp' },
    ],
  },
};

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
      'Na de grote videogamecrash van 1983 leek de toekomst van console gaming onzeker. Nintendo bewees het tegendeel met de Famicom in Japan en de NES in de rest van de wereld. Met revolutionaire kwaliteitscontrole en legendarische titels als Super Mario Bros., The Legend of Zelda en Metroid werd een gouden tijdperk geboren.',
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
      'Ontwerper Gunpei Yokoi maakte een gedurfde keuze: een simpel, betrouwbaar apparaat met een onverslaanbare batterijduur van 30 uur. Gebundeld met het verslavende Tetris werd de Game Boy een wereldwijd cultureel fenomeen. Van schoolpleinen tot vliegtuigstoelen — overal ter wereld zag je dat herkenbare grijsgroene scherm oplichten.',
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
      'De Super Nintendo bracht gaming naar ongekende hoogten met adembenemende Mode 7 pseudo-3D graphics en de legendarische Sony SPC700 geluidschip. De spelbibliotheek wordt tot op de dag van vandaag beschouwd als een van de allerbeste ooit — van A Link to the Past tot Super Metroid en Super Mario World.',
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
      'Super Mario 64 herdefinieerde compleet wat een platformspel kon zijn. Ocarina of Time wordt nog steeds beschouwd als een van de beste games ooit. GoldenEye 007 bewees dat multiplayer shooters ook op consoles konden schitteren. En met vier controller-poorten als standaard maakte de N64 de woonkamer tot het ultieme gaming-slagveld.',
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
      'Een compacte, paarse kubus met een herkenbaar handvat. Hoewel de verkoopcijfers achterbleven bij de concurrentie, leverde het platform een ongelooflijke bibliotheek op die tot cult-status is uitgegroeid. Super Smash Bros. Melee werd een van de langstlevende competitieve games ooit.',
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
      'Met twee schermen en een touchscreen deed Nintendo iets wat niemand verwachtte. De DS werd hun bestverkochte console ooit met meer dan 154 miljoen exemplaren. Brain Age maakte gaming populair bij volwassenen, Nintendogs veroverde harten, en Pokemon Diamond & Pearl gaven hardcore gamers precies wat ze wilden.',
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
      'De Wii veranderde niet alleen gaming — het veranderde hoe de wereld naar gaming keek. Met de revolutionaire Wii Remote maakte Nintendo het spelen van games toegankelijk voor iedereen, van kleuters tot grootouders. Wii Sports werd een cultureel fenomeen dat families samenbracht.',
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
      'Stereoscopisch 3D zonder bril en StreetPass als sociaal verbindend element. De gamebibliotheek groeide uit tot een van de sterkste ooit, met meesterwerken als A Link Between Worlds, Pokemon X & Y, Fire Emblem Awakening en Animal Crossing: New Leaf.',
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
      'Het concept van een tablet-controller waarmee je kon doorspelen zonder televisie was revolutionair — een idee dat later de basis zou vormen voor de Switch. Splatoon introduceerde een verfrissend nieuw shooter-concept en Mario Kart 8 werd zo goed dat het later opnieuw werd uitgebracht.',
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
      'De Nintendo Switch combineerde het beste van twee werelden: een volwaardige thuisconsole die je moeiteloos meeneemt als handheld. Met de iconische Joy-Con controllers en een indrukwekkende line-up geleid door Breath of the Wild werd de Switch een van de bestverkopende consoles aller tijden.',
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

/** Zwevende console afbeelding in de hero */
function FloatingConsole({
  src,
  alt,
  className,
  delay = 0,
  duration = 12,
  size = 80,
}: {
  src: string;
  alt: string;
  className: string;
  delay?: number;
  duration?: number;
  size?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: delay + 1.5 }}
      className={`absolute pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: size, height: size }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain p-1"
            sizes={`${size}px`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// GAME COVER GALERIJ — Visueel paneel per tijdperk
// ============================================================================

function EraGallery({
  eraId,
  accentRgb,
  isEven,
  isInView,
}: {
  eraId: string;
  accentRgb: string;
  isEven: boolean;
  isInView: boolean;
}) {
  const images = ERA_IMAGES[eraId];
  if (!images) return null;

  return (
    <div className="space-y-6">
      {/* Console afbeelding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: 'blur(15px)' }}
        animate={isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto"
      >
        <div
          className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl overflow-hidden border"
          style={{
            borderColor: `rgba(${accentRgb}, 0.15)`,
            backgroundColor: `rgba(${accentRgb}, 0.03)`,
          }}
        >
          {/* Glow achter console */}
          <div
            className="absolute inset-0 blur-[40px] opacity-30"
            style={{ backgroundColor: `rgba(${accentRgb}, 0.2)` }}
          />
          <Image
            src={images.console}
            alt="Console"
            fill
            className="object-contain p-4 relative z-10"
            sizes="224px"
          />
          {/* Shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 -translate-x-full hover:translate-x-full transition-all duration-1000 ease-in-out z-20" />
        </div>
      </motion.div>

      {/* Iconic games grid */}
      <div className="grid grid-cols-2 gap-3">
        {images.games.map((game, gi) => (
          <motion.div
            key={game.name}
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.5 + gi * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group relative"
          >
            <div
              className="relative aspect-square rounded-xl overflow-hidden border transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-current/10 card-3d-tilt"
              style={{
                borderColor: `rgba(${accentRgb}, 0.1)`,
                backgroundColor: `rgba(${accentRgb}, 0.02)`,
              }}
            >
              <Image
                src={game.image}
                alt={game.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 120px, 140px"
              />
              {/* Hover overlay met naam */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                <span className="text-white text-[10px] sm:text-xs font-bold leading-tight">
                  {game.name}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Label onder galerij */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-center text-[10px] uppercase tracking-[0.2em] font-bold"
        style={{ color: `rgba(${accentRgb}, 0.35)` }}
      >
        Iconische titels
      </motion.p>
    </div>
  );
}

// ============================================================================
// INTRO SECTIE — Cinematisch openingsscherm met zwevende consoles
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

      {/* Zwevende console afbeeldingen */}
      <FloatingConsole
        src="/images/nintendo/nes-console.webp"
        alt="NES"
        className="top-[12%] left-[5%] sm:left-[8%] opacity-60 hidden sm:block"
        delay={0}
        size={72}
      />
      <FloatingConsole
        src="/images/nintendo/gameboy-console.webp"
        alt="Game Boy"
        className="top-[18%] right-[6%] sm:right-[12%] opacity-50 hidden sm:block"
        delay={1.5}
        size={64}
      />
      <FloatingConsole
        src="/images/nintendo/snes-console.webp"
        alt="SNES"
        className="bottom-[22%] left-[6%] sm:left-[12%] opacity-50 hidden md:block"
        delay={3}
        size={80}
      />
      <FloatingConsole
        src="/images/nintendo/n64-console.webp"
        alt="N64"
        className="bottom-[28%] right-[4%] sm:right-[8%] opacity-50 hidden md:block"
        delay={2}
        size={72}
      />
      <FloatingConsole
        src="/images/nintendo/gamecube-console.webp"
        alt="GameCube"
        className="top-[40%] left-[2%] sm:left-[4%] opacity-40 hidden lg:block"
        delay={4}
        size={60}
      />
      <FloatingConsole
        src="/images/nintendo/switch-console.webp"
        alt="Switch"
        className="top-[35%] right-[3%] sm:right-[5%] opacity-40 hidden lg:block"
        delay={2.5}
        size={88}
      />

      {/* Horizontale lichtstraal */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-y-1/2"
      />

      <motion.div style={{ y }} className="relative text-center px-4 max-w-4xl mx-auto z-10">
        {/* Decoratieve lijn boven */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
          transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
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

        {/* Console miniaturen rij */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-12"
        >
          {[
            { src: '/images/nintendo/nes-console.webp', label: '1983' },
            { src: '/images/nintendo/gameboy-console.webp', label: '1989' },
            { src: '/images/nintendo/snes-console.webp', label: '1990' },
            { src: '/images/nintendo/n64-console.webp', label: '1996' },
            { src: '/images/nintendo/gamecube-console.webp', label: '2001' },
            { src: '/images/nintendo/wii-console.webp', label: '2006' },
            { src: '/images/nintendo/switch-console.webp', label: '2017' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.4 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden relative group-hover:border-white/20 transition-colors">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-contain p-1.5"
                  sizes="48px"
                />
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/0 group-hover:text-white/50 transition-colors font-mono">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1.2 }}
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
// ERA SECTIE — Met console afbeelding + game galerij
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
  const hasImages = !!ERA_IMAGES[era.id];

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
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${era.accentRgb}, 0.03), transparent 40%)`,
        }}
      />

      {/* Zwevende vormen met parallax */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 pointer-events-none">
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
        {/* Glow orb */}
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
          {/* Tekst content — 7 kolommen (of 12 als geen afbeeldingen) */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={`${hasImages ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'} ${!isEven ? 'lg:[direction:ltr]' : ''}`}
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
              <motion.div variants={fadeUp} className="mb-8">
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

            {/* Feiten als inline badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
              {era.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="px-4 py-2.5 rounded-xl border"
                  style={{
                    borderColor: `rgba(${era.accentRgb}, 0.1)`,
                    backgroundColor: `rgba(${era.accentRgb}, 0.03)`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ color: `rgba(${era.accentRgb}, 0.5)` }}>
                    {fact.label}
                  </div>
                  <div className="text-sm font-bold text-white">{fact.value}</div>
                </div>
              ))}
            </motion.div>

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

          {/* Visueel paneel — 5 kolommen */}
          {hasImages && (
            <div className={`lg:col-span-5 ${!isEven ? 'lg:[direction:ltr]' : ''}`}>
              <EraGallery
                eraId={era.id}
                accentRgb={era.accentRgb}
                isEven={isEven}
                isInView={isInView}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sectie scheider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </section>
  );
}

// ============================================================================
// GAME COVER MARQUEE — Oneindige scrollende covers
// ============================================================================

function GameCoverMarquee() {
  const allCovers = useMemo(() => {
    const covers: { name: string; image: string }[] = [];
    Object.values(ERA_IMAGES).forEach((era) => {
      era.games.forEach((g) => covers.push(g));
    });
    return covers;
  }, []);

  return (
    <section className="relative bg-[#050810] overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-transparent to-[#050810] z-10 pointer-events-none" />

      {/* Rij 1 — naar links */}
      <div className="flex gap-4 mb-4 animate-marquee">
        {[...allCovers, ...allCovers].map((cover, i) => (
          <div
            key={`r1-${i}`}
            className="group flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden relative card-3d-tilt"
          >
            <Image
              src={cover.image}
              alt={cover.name}
              fill
              className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
              sizes="96px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-1.5">
              <span className="text-[8px] text-white font-bold leading-tight line-clamp-2">{cover.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rij 2 — naar rechts */}
      <div className="flex gap-4 animate-marquee-reverse">
        {[...allCovers.reverse(), ...allCovers].map((cover, i) => (
          <div
            key={`r2-${i}`}
            className="group flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden relative card-3d-tilt"
          >
            <Image
              src={cover.image}
              alt={cover.name}
              fill
              className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
              sizes="96px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-1.5">
              <span className="text-[8px] text-white font-bold leading-tight line-clamp-2">{cover.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// TOTAAL STATISTIEKEN SECTIE
// ============================================================================

function TotalStatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20%' });

  const stats = [
    { value: 882, suffix: ' mln+', label: 'Consoles verkocht', icon: '🎮' },
    { value: 137, suffix: ' jaar', label: 'Innovatie', icon: '💡' },
    { value: 11, suffix: '', label: 'Generaties', icon: '🏆' },
    { value: 846, suffix: '+', label: 'In onze collectie', icon: '📦' },
  ];

  return (
    <section ref={ref} className="relative bg-[#050810] overflow-hidden py-32 lg:py-40">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.03),transparent_50%)]" />

      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[100px] pointer-events-none"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mx-auto max-w-sm"
        />
      </div>
    </section>
  );
}

// ============================================================================
// CONSOLE VERGELIJKING — Visuele showcase van alle consoles
// ============================================================================

function ConsoleShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const consoles = [
    { name: 'NES', year: 1983, image: '/images/nintendo/nes-console.webp', sold: '61,91 mln', rgb: '239, 68, 68' },
    { name: 'Game Boy', year: 1989, image: '/images/nintendo/gameboy-console.webp', sold: '118,69 mln', rgb: '155, 188, 15' },
    { name: 'SNES', year: 1990, image: '/images/nintendo/snes-console.webp', sold: '49,10 mln', rgb: '168, 85, 247' },
    { name: 'N64', year: 1996, image: '/images/nintendo/n64-console.webp', sold: '32,93 mln', rgb: '34, 197, 94' },
    { name: 'GameCube', year: 2001, image: '/images/nintendo/gamecube-console.webp', sold: '21,74 mln', rgb: '129, 140, 248' },
    { name: 'DS', year: 2004, image: '/images/nintendo/ds-console.webp', sold: '154,02 mln', rgb: '56, 189, 248' },
    { name: 'Wii', year: 2006, image: '/images/nintendo/wii-console.webp', sold: '101,63 mln', rgb: '34, 211, 238' },
    { name: '3DS', year: 2011, image: '/images/nintendo/3ds-console.webp', sold: '75,94 mln', rgb: '244, 63, 94' },
    { name: 'Wii U', year: 2012, image: '/images/nintendo/wiiu-console.webp', sold: '13,56 mln', rgb: '59, 130, 246' },
    { name: 'Switch', year: 2017, image: '/images/nintendo/switch-console.webp', sold: '143+ mln', rgb: '239, 68, 68' },
  ];

  return (
    <section ref={ref} className="relative bg-[#050810] overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-500/50 mb-4 block">
            De complete collectie
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Elke console, elk tijdperk
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {consoles.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <div
                className="relative rounded-2xl border overflow-hidden p-4 card-3d-tilt"
                style={{
                  borderColor: `rgba(${c.rgb}, 0.08)`,
                  backgroundColor: `rgba(${c.rgb}, 0.02)`,
                }}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[30px]"
                  style={{ backgroundColor: `rgba(${c.rgb}, 0.08)` }}
                />

                <div className="relative w-full aspect-square mb-3">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 150px, 200px"
                  />
                </div>

                <div className="relative text-center">
                  <div className="text-white font-bold text-sm mb-0.5">{c.name}</div>
                  <div className="text-[10px] font-mono tracking-wider mb-1" style={{ color: `rgba(${c.rgb}, 0.6)` }}>
                    {c.year}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {c.sold} verkocht
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.06),transparent_50%)]" />

      <ParticleField count={25} color="rgba(16, 185, 129, 0.2)" />

      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-emerald-500/[0.04] blur-[80px]"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-24 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mx-auto mb-10"
        />

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

        <motion.h2
          initial={{ opacity: 0, y: 45, filter: 'blur(15px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed"
        >
          Van hanafuda kaarten tot hybride consoles — Nintendo blijft al 137 jaar innoveren.
          Ontdek onze complete collectie van 846+ originele Nintendo producten.
        </motion.p>

        {/* Drie console highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-6 sm:gap-10 mb-14"
        >
          {[
            { src: '/images/nintendo/n64-console.webp', label: 'N64' },
            { src: '/images/nintendo/switch-console.webp', label: 'Switch' },
            { src: '/images/nintendo/gameboy-console.webp', label: 'Game Boy' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden relative mx-auto mb-2">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-contain p-3"
                  sizes="96px"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-14"
        >
          {platformChips.map((p, i) => (
            <Link key={p.href} href={p.href}>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.3 + i * 0.04 }}
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
          transition={{ duration: 0.8, delay: 1.6 }}
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-20 text-slate-600 text-xs font-medium tracking-[0.15em] uppercase"
        >
          Gameshop Enter — De Nintendo specialist van Nederland
        </motion.p>
      </div>
    </section>
  );
}

// ============================================================================
// TIJDLIJN NAVIGATIE — Vaste zijbalk met console iconen
// ============================================================================

function TimelineNav() {
  const [activeEra, setActiveEra] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveEra(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    eras.forEach((era) => {
      const el = document.getElementById(era.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="fixed right-5 xl:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-1"
      aria-label="Tijdlijn navigatie"
    >
      <div className="absolute top-0 bottom-0 w-[1px] bg-white/[0.06] left-1/2 -translate-x-1/2" />

      {eras.map((era) => {
        const isActive = activeEra === era.id;
        return (
          <a
            key={era.id}
            href={`#${era.id}`}
            className="group relative flex items-center py-1 z-10"
            title={`${era.year} — ${era.title}`}
          >
            {/* Label bij hover of active */}
            <span
              className={`absolute right-8 text-[10px] font-bold whitespace-nowrap tracking-wide pointer-events-none transition-all duration-300 ${
                isActive ? 'text-white/70' : 'text-white/0 group-hover:text-white/50'
              }`}
            >
              {era.year}
            </span>
            {/* Dot */}
            <div
              className={`rounded-full transition-all duration-300 ${
                isActive ? 'w-3 h-3 scale-125' : 'w-2 h-2 group-hover:scale-150'
              }`}
              style={{
                backgroundColor: `rgba(${era.accentRgb}, ${isActive ? '0.8' : '0.25'})`,
                boxShadow: isActive ? `0 0 12px rgba(${era.accentRgb}, 0.4)` : 'none',
              }}
            />
          </a>
        );
      })}
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
      <GameCoverMarquee />
      <TotalStatsSection />
      <ConsoleShowcase />
      <OutroSection />
    </div>
  );
}
