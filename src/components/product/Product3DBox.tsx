'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';

interface Product3DBoxProps {
  product: Product;
}

// Platform-specifieke hex kleuren voor inline styles
const PLATFORM_HEX: Record<string, { bg: string; accent: string }> = {
  'Nintendo Switch': { bg: '#ef4444', accent: '#dc2626' },
  'GameCube': { bg: '#6366f1', accent: '#4f46e5' },
  'Nintendo 64': { bg: '#22c55e', accent: '#16a34a' },
  'Game Boy Advance': { bg: '#3b82f6', accent: '#4338ca' },
  'Super Nintendo': { bg: '#6b7280', accent: '#4b5563' },
  'Nintendo 3DS': { bg: '#0ea5e9', accent: '#2563eb' },
  'NES': { bg: '#4b5563', accent: '#374151' },
  'Nintendo DS': { bg: '#64748b', accent: '#475569' },
  'Game Boy': { bg: '#84cc16', accent: '#22c55e' },
  'Game Boy / Color': { bg: '#84cc16', accent: '#22c55e' },
  'Wii': { bg: '#22d3ee', accent: '#0284c7' },
  'Wii U': { bg: '#3b82f6', accent: '#2563eb' },
};

// Pokemon sprite IDs per game (iconic legendaries/starters)
const POKEMON_SPRITES: Record<string, number[]> = {
  'Emerald': [384, 383, 382],       // Rayquaza, Groudon, Kyogre
  'Ruby': [383, 384],                // Groudon, Rayquaza
  'Sapphire': [382, 384],            // Kyogre, Rayquaza
  'FireRed': [6, 150],               // Charizard, Mewtwo
  'LeafGreen': [3, 9],               // Venusaur, Blastoise
  'Red': [6, 25],                    // Charizard, Pikachu
  'Blue': [9, 25],                   // Blastoise, Pikachu
  'Yellow': [25, 6],                 // Pikachu, Charizard
  'Gold': [250, 249],                // Ho-Oh, Lugia
  'Silver': [249, 250],              // Lugia, Ho-Oh
  'Crystal': [245, 249],             // Suicune, Lugia
  'Diamond': [483, 484],             // Dialga, Palkia
  'Pearl': [484, 483],               // Palkia, Dialga
  'Platinum': [487, 483],            // Giratina, Dialga
  'HeartGold': [250, 249],           // Ho-Oh, Lugia
  'SoulSilver': [249, 250],          // Lugia, Ho-Oh
  'Black': [644, 643],               // Zekrom, Reshiram
  'White': [643, 644],               // Reshiram, Zekrom
  'Black 2': [646, 644],             // Kyurem, Zekrom
  'White 2': [646, 643],             // Kyurem, Reshiram
  'X': [716, 717],                   // Xerneas, Yveltal
  'Y': [717, 716],                   // Yveltal, Xerneas
  'Sun': [791, 792],                 // Solgaleo, Lunala
  'Moon': [792, 791],                // Lunala, Solgaleo
  'Ultra Sun': [791, 800],           // Solgaleo, Necrozma
  'Ultra Moon': [792, 800],          // Lunala, Necrozma
  'Sword': [888, 889],               // Zacian, Zamazenta
  'Shield': [889, 888],              // Zamazenta, Zacian
  'Scarlet': [1007, 1008],           // Koraidon, Miraidon
  'Violet': [1008, 1007],            // Miraidon, Koraidon
  'Brilliant Diamond': [483, 484],   // Dialga, Palkia
  'Shining Pearl': [484, 483],       // Palkia, Dialga
  'Legends: Arceus': [493, 487],     // Arceus, Giratina
  'Snap': [25, 151],                 // Pikachu, Mew
  'Stadium': [150, 25],              // Mewtwo, Pikachu
  'Stadium 2': [249, 250],           // Lugia, Ho-Oh
  'Colosseum': [250, 197],           // Ho-Oh, Umbreon
  'Alpha Sapphire': [382, 384],      // Kyogre, Rayquaza
  'Omega Ruby': [383, 384],          // Groudon, Rayquaza
  "Let's Go Pikachu": [25, 150],     // Pikachu, Mewtwo
  "Let's Go Eevee": [133, 150],      // Eevee, Mewtwo
};

function getPokemonSprites(name: string): number[] {
  const lower = name.toLowerCase();
  if (!lower.includes('pok')) return [];
  for (const [key, ids] of Object.entries(POKEMON_SPRITES)) {
    if (lower.includes(key.toLowerCase())) return ids;
  }
  // Fallback voor onbekende Pokemon games
  if (lower.includes('pok')) return [25]; // Pikachu
  return [];
}

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// Floating Pokemon sprite
function FloatingSprite({ id, index, total }: { id: number; index: number; total: number }) {
  const angle = (360 / total) * index;
  const delay = index * 2;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 80,
        height: 80,
        left: '50%',
        top: '50%',
        marginLeft: -40,
        marginTop: -40,
        filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.4))',
        zIndex: 10,
      }}
      animate={{
        x: [
          Math.cos((angle * Math.PI) / 180) * 170,
          Math.cos(((angle + 120) * Math.PI) / 180) * 190,
          Math.cos(((angle + 240) * Math.PI) / 180) * 160,
          Math.cos((angle * Math.PI) / 180) * 170,
        ],
        y: [
          Math.sin((angle * Math.PI) / 180) * 120 - 30,
          Math.sin(((angle + 120) * Math.PI) / 180) * 140 - 20,
          Math.sin(((angle + 240) * Math.PI) / 180) * 110 - 40,
          Math.sin((angle * Math.PI) / 180) * 120 - 30,
        ],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 12 + index * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${SPRITE_BASE}/${id}.png`}
        alt=""
        width={80}
        height={80}
        style={{ objectFit: 'contain' }}
        loading="lazy"
      />
    </motion.div>
  );
}

export default function Product3DBox({ product }: Product3DBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoAngle = useRef(0);
  const frameRef = useRef<number>(0);

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const startRotateY = useRef(0);
  const startRotateX = useRef(0);

  const rawRotateY = useMotionValue(0);
  const rawRotateX = useMotionValue(0);
  const rotateY = useSpring(rawRotateY, { stiffness: 80, damping: 20 });
  const rotateX = useSpring(rawRotateX, { stiffness: 80, damping: 20 });

  // Holographic shimmer position based on rotation
  const shimmerX = useTransform(rotateY, [-180, 180], [-100, 200]);

  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const hex = PLATFORM_HEX[product.platform] || { bg: '#64748b', accent: '#475569' };

  const pokemonIds = useMemo(() => getPokemonSprites(product.name), [product.name]);
  const isPokemon = pokemonIds.length > 0;

  const WIDTH = 280;
  const HEIGHT = 380;
  const DEPTH = 30;

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const animate = () => {
      autoAngle.current += 0.3;
      rawRotateY.set(autoAngle.current);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [autoRotate, isDragging, rawRotateY]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    startRotateY.current = rawRotateY.get();
    startRotateX.current = rawRotateX.get();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rawRotateY, rawRotateX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;
    rawRotateY.set(startRotateY.current + dx * 0.5);
    rawRotateX.set(Math.max(-30, Math.min(30, startRotateX.current - dy * 0.3)));
  }, [isDragging, rawRotateY, rawRotateX]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    rawRotateY.set(0);
    rawRotateX.set(0);
    autoAngle.current = 0;
    setAutoRotate(false);
  }, [rawRotateY, rawRotateX]);

  return (
    <div className="relative select-none">
      {/* Ambient glow achtergrond */}
      <div
        className="absolute inset-0 -inset-x-12 -inset-y-8 rounded-3xl opacity-30 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${hex.bg}40 0%, transparent 70%)`,
        }}
      />

      {/* Pokemon sprites achtergrond */}
      {isPokemon && (
        <div className="absolute inset-0 -inset-x-16 -inset-y-12 overflow-hidden pointer-events-none">
          {pokemonIds.map((id, i) => (
            <FloatingSprite key={id} id={id} index={i} total={pokemonIds.length} />
          ))}
        </div>
      )}

      {/* 3D Box Container */}
      <div
        ref={containerRef}
        className="relative mx-auto cursor-grab active:cursor-grabbing"
        style={{ perspective: 1200, width: WIDTH, height: HEIGHT }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d', rotateY, rotateX }}
        >
          {/* FRONT — Cover image + holographic shimmer */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl"
            style={{
              transform: `translateZ(${DEPTH / 2}px)`,
              backfaceVisibility: 'hidden',
              width: WIDTH,
              height: HEIGHT,
            }}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="280px"
                className="object-contain p-6"
                priority
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center`}>
                <span className="text-white/20 text-6xl font-black">{platformLabel}</span>
              </div>
            )}
            {/* Holographic shimmer overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 55%, transparent 65%)`,
                backgroundSize: '300% 100%',
                backgroundPositionX: shimmerX,
              }}
            />
          </div>

          {/* BACK — Generated back-of-box */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            style={{
              transform: `rotateY(180deg) translateZ(${DEPTH / 2}px)`,
              backfaceVisibility: 'hidden',
              width: WIDTH,
              height: HEIGHT,
              background: `linear-gradient(135deg, ${hex.bg}15, ${hex.accent}10, #f8fafc)`,
            }}
          >
            <div className="h-full flex flex-col p-5">
              <div className="rounded-lg px-3 py-2 mb-3" style={{ background: `linear-gradient(135deg, ${hex.bg}, ${hex.accent})` }}>
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">{product.platform}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[0.08, 0.12, 0.06].map((op, i) => (
                  <div key={i} className="aspect-video rounded" style={{ background: `linear-gradient(135deg, ${hex.bg}${Math.round(op * 255).toString(16).padStart(2, '0')}, ${hex.accent}${Math.round(op * 0.7 * 255).toString(16).padStart(2, '0')})` }} />
                ))}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-4 flex-shrink-0">
                {product.description || `Ontdek ${product.name} voor ${product.platform}. Een onvergetelijke game-ervaring.`}
              </p>
              <div className="space-y-1.5 mb-3 flex-1">
                {[
                  { l: 'Genre', v: product.genre },
                  { l: 'Conditie', v: product.condition },
                  { l: 'Compleetheid', v: product.completeness },
                ].map((s) => (
                  <div key={s.l} className="flex justify-between text-[9px]">
                    <span className="text-slate-400">{s.l}</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{s.v}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg px-3 py-2 flex items-center justify-between mt-auto" style={{ background: `linear-gradient(135deg, ${hex.bg}20, ${hex.accent}15)` }}>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nintendo</span>
                <span className="text-[9px] font-bold text-slate-500">{product.sku}</span>
              </div>
            </div>
          </div>

          {/* LEFT SPINE */}
          <div
            className="absolute overflow-hidden"
            style={{
              transform: `rotateY(-90deg) translateZ(${WIDTH / 2}px)`,
              width: DEPTH, height: HEIGHT, left: (WIDTH - DEPTH) / 2, top: 0,
              background: `linear-gradient(180deg, ${hex.bg}, ${hex.accent})`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-white text-[9px] font-bold tracking-widest uppercase whitespace-nowrap" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
                {product.name.length > 30 ? product.name.slice(0, 28) + '…' : product.name}
              </span>
            </div>
          </div>

          {/* RIGHT SPINE */}
          <div
            className="absolute overflow-hidden"
            style={{
              transform: `rotateY(90deg) translateZ(${WIDTH / 2}px)`,
              width: DEPTH, height: HEIGHT, left: (WIDTH - DEPTH) / 2, top: 0,
              background: `linear-gradient(180deg, ${hex.accent}, ${hex.bg})`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-white text-[9px] font-bold tracking-widest uppercase" style={{ writingMode: 'vertical-lr' }}>{platformLabel}</span>
            </div>
          </div>

          {/* TOP */}
          <div className="absolute" style={{
            transform: `rotateX(90deg) translateZ(${HEIGHT / 2}px)`,
            width: WIDTH, height: DEPTH, top: (HEIGHT - DEPTH) / 2, left: 0,
            background: `linear-gradient(90deg, ${hex.bg}, ${hex.accent})`,
            backfaceVisibility: 'hidden',
          }} />

          {/* BOTTOM */}
          <div className="absolute" style={{
            transform: `rotateX(-90deg) translateZ(${HEIGHT / 2}px)`,
            width: WIDTH, height: DEPTH, top: (HEIGHT - DEPTH) / 2, left: 0,
            background: `linear-gradient(90deg, ${hex.accent}, ${hex.bg})`,
            backfaceVisibility: 'hidden',
          }} />
        </motion.div>

        {/* Dynamic floor shadow */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] pointer-events-none"
          style={{
            width: WIDTH * 0.7,
            height: 20,
            background: `radial-gradient(ellipse, ${hex.bg}30 0%, transparent 70%)`,
            translateY: 24,
            scaleX: useTransform(rotateY, [-180, 0, 180], [1.2, 0.8, 1.2]),
            opacity: useTransform(rotateX, [-30, 0, 30], [0.2, 0.5, 0.2]),
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={resetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Voorkant
        </button>
        <button
          onClick={() => { setAutoRotate(!autoRotate); autoAngle.current = rawRotateY.get(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            autoRotate
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {autoRotate ? 'Stoppen' : 'Draaien'}
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
        {isPokemon ? 'Sleep om te draaien · Pokémon vliegen mee!' : 'Sleep om te draaien'}
      </p>
    </div>
  );
}
