'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';

interface Product3DBoxProps {
  product: Product;
}

// Platform-specifieke hex kleuren voor inline styles
const PLATFORM_HEX: Record<string, { bg: string; accent: string; glow: string }> = {
  'Nintendo Switch': { bg: '#ef4444', accent: '#dc2626', glow: '239,68,68' },
  'GameCube': { bg: '#6366f1', accent: '#4f46e5', glow: '99,102,241' },
  'Nintendo 64': { bg: '#22c55e', accent: '#16a34a', glow: '34,197,94' },
  'Game Boy Advance': { bg: '#3b82f6', accent: '#4338ca', glow: '59,130,246' },
  'Super Nintendo': { bg: '#6b7280', accent: '#4b5563', glow: '107,114,128' },
  'Nintendo 3DS': { bg: '#0ea5e9', accent: '#2563eb', glow: '14,165,233' },
  'NES': { bg: '#4b5563', accent: '#374151', glow: '75,85,99' },
  'Nintendo DS': { bg: '#64748b', accent: '#475569', glow: '100,116,139' },
  'Game Boy': { bg: '#84cc16', accent: '#22c55e', glow: '132,204,22' },
  'Game Boy / Color': { bg: '#84cc16', accent: '#22c55e', glow: '132,204,22' },
  'Wii': { bg: '#22d3ee', accent: '#0284c7', glow: '34,211,238' },
  'Wii U': { bg: '#3b82f6', accent: '#2563eb', glow: '59,130,246' },
};

// Pokemon sprite IDs per game (iconic legendaries/starters)
const POKEMON_SPRITES: Record<string, number[]> = {
  'Emerald': [384, 383, 382],
  'Ruby': [383, 384],
  'Sapphire': [382, 384],
  'FireRed': [6, 150],
  'LeafGreen': [3, 9],
  'Red': [6, 25],
  'Blue': [9, 25],
  'Yellow': [25, 6],
  'Gold': [250, 249],
  'Silver': [249, 250],
  'Crystal': [245, 249],
  'Diamond': [483, 484],
  'Pearl': [484, 483],
  'Platinum': [487, 483],
  'HeartGold': [250, 249],
  'SoulSilver': [249, 250],
  'Black': [644, 643],
  'White': [643, 644],
  'Black 2': [646, 644],
  'White 2': [646, 643],
  'X': [716, 717],
  'Y': [717, 716],
  'Sun': [791, 792],
  'Moon': [792, 791],
  'Ultra Sun': [791, 800],
  'Ultra Moon': [792, 800],
  'Sword': [888, 889],
  'Shield': [889, 888],
  'Scarlet': [1007, 1008],
  'Violet': [1008, 1007],
  'Brilliant Diamond': [483, 484],
  'Shining Pearl': [484, 483],
  'Legends: Arceus': [493, 487],
  'Snap': [25, 151],
  'Stadium': [150, 25],
  'Stadium 2': [249, 250],
  'Colosseum': [250, 197],
  'Alpha Sapphire': [382, 384],
  'Omega Ruby': [383, 384],
  "Let's Go Pikachu": [25, 150],
  "Let's Go Eevee": [133, 150],
};

function getPokemonSprites(name: string): number[] {
  const lower = name.toLowerCase();
  if (!lower.includes('pok')) return [];
  for (const [key, ids] of Object.entries(POKEMON_SPRITES)) {
    if (lower.includes(key.toLowerCase())) return ids;
  }
  if (lower.includes('pok')) return [25];
  return [];
}

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// Twinkelende ster
function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: 'white',
      }}
      animate={{
        opacity: [0.1, 0.8, 0.1],
        scale: [0.8, 1.3, 0.8],
      }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

// Zwevende Pokemon sprite — groter, met glow
function FloatingSprite({ id, index, total, glowColor }: { id: number; index: number; total: number; glowColor: string }) {
  const angle = (360 / total) * index;
  const delay = index * 1.5;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 120,
        height: 120,
        left: '50%',
        top: '50%',
        marginLeft: -60,
        marginTop: -60,
        filter: `drop-shadow(0 0 20px rgba(${glowColor},0.6)) drop-shadow(0 0 40px rgba(${glowColor},0.3))`,
        zIndex: 10,
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{
        opacity: 1,
        scale: [1, 1.12, 0.95, 1.05, 1],
        x: [
          Math.cos((angle * Math.PI) / 180) * 210,
          Math.cos(((angle + 90) * Math.PI) / 180) * 230,
          Math.cos(((angle + 180) * Math.PI) / 180) * 200,
          Math.cos(((angle + 270) * Math.PI) / 180) * 220,
          Math.cos((angle * Math.PI) / 180) * 210,
        ],
        y: [
          Math.sin((angle * Math.PI) / 180) * 150 - 20,
          Math.sin(((angle + 90) * Math.PI) / 180) * 170 - 30,
          Math.sin(((angle + 180) * Math.PI) / 180) * 140 - 10,
          Math.sin(((angle + 270) * Math.PI) / 180) * 160 - 25,
          Math.sin((angle * Math.PI) / 180) * 150 - 20,
        ],
        rotate: [0, 8, -8, 4, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay: delay },
        scale: { duration: 10 + index * 3, repeat: Infinity, ease: 'easeInOut', delay },
        x: { duration: 14 + index * 3, repeat: Infinity, ease: 'easeInOut', delay },
        y: { duration: 14 + index * 3, repeat: Infinity, ease: 'easeInOut', delay },
        rotate: { duration: 14 + index * 3, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${SPRITE_BASE}/${id}.png`}
        alt=""
        width={120}
        height={120}
        style={{ objectFit: 'contain' }}
        loading="lazy"
      />
    </motion.div>
  );
}

// Genereer sterren eenmalig
function useStars(count: number) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
    })),
  [count]);
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

  // Holographic shimmer gekoppeld aan rotatie
  const shimmerX = useTransform(rotateY, [-180, 180], [-100, 200]);
  // Edge light glow positie
  const edgeLightX = useTransform(rotateY, [-180, 0, 180], ['100%', '50%', '0%']);

  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const hex = PLATFORM_HEX[product.platform] || { bg: '#64748b', accent: '#475569', glow: '100,116,139' };

  const pokemonIds = useMemo(() => getPokemonSprites(product.name), [product.name]);
  const isPokemon = pokemonIds.length > 0;
  const stars = useStars(35);

  const WIDTH = 340;
  const HEIGHT = 460;
  const DEPTH = 36;

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
    <div className="relative select-none" style={{ minHeight: HEIGHT + 80 }}>

      {/* ===== ACHTERGROND LAAG: Donker veld met sterren + aurora ===== */}
      <div
        className="absolute -inset-8 rounded-3xl overflow-hidden pointer-events-none"
        style={{ background: '#0a0e1a' }}
      >
        {/* Dot grid textuur */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Twinkelende sterren */}
        {stars.map((s) => (
          <Star key={s.id} x={s.x} y={s.y} size={s.size} delay={s.delay} />
        ))}

        {/* Aurora orb 1 — platform kleur */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 400,
            height: 400,
            top: '-10%',
            right: '-10%',
            background: `radial-gradient(circle, rgba(${hex.glow},0.15) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />

        {/* Aurora orb 2 — complementair */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 350,
            height: 350,
            bottom: '-5%',
            left: '-10%',
            background: `radial-gradient(circle, rgba(${hex.glow},0.1) 0%, rgba(20,184,166,0.08) 50%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
          animate={{
            x: [0, -40, 50, 0],
            y: [0, 30, -40, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />

        {/* Aurora orb 3 — subtiele kern */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 250,
            height: 250,
            top: '30%',
            left: '30%',
            background: `radial-gradient(circle, rgba(${hex.glow},0.08) 0%, transparent 60%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />

        {/* Vignet voor diepte */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,8,16,0.6) 100%)',
          }}
        />
      </div>

      {/* ===== AMBIENT GLOW rond de box ===== */}
      <motion.div
        className="absolute inset-0 -inset-x-16 -inset-y-12 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${hex.glow},0.25) 0%, transparent 60%)`,
          filter: 'blur(30px)',
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ===== POKEMON SPRITES ===== */}
      <AnimatePresence>
        {isPokemon && (
          <div className="absolute inset-0 -inset-x-20 -inset-y-16 overflow-visible pointer-events-none" style={{ zIndex: 5 }}>
            {pokemonIds.map((id, i) => (
              <FloatingSprite key={id} id={id} index={i} total={pokemonIds.length} glowColor={hex.glow} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ===== 3D BOX CONTAINER ===== */}
      <div
        ref={containerRef}
        className="relative mx-auto cursor-grab active:cursor-grabbing"
        style={{ perspective: 1400, width: WIDTH, height: HEIGHT, zIndex: 2 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d', rotateY, rotateX }}
        >
          {/* FRONT — Cover image + multi-layer holographic shimmer */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
            style={{
              transform: `translateZ(${DEPTH / 2}px)`,
              backfaceVisibility: 'hidden',
              width: WIDTH,
              height: HEIGHT,
              border: `1px solid rgba(${hex.glow},0.2)`,
              background: '#111827',
            }}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="340px"
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center`}>
                <span className="text-white/20 text-7xl font-black">{platformLabel}</span>
              </div>
            )}

            {/* Holo foil textuur */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,1) 4px, rgba(255,255,255,1) 5px), repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,1) 4px, rgba(255,255,255,1) 5px)`,
              }}
            />

            {/* Holographic shimmer sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.2) 52%, rgba(255,255,255,0.08) 60%, transparent 70%)`,
                backgroundSize: '300% 100%',
                backgroundPositionX: shimmerX,
              }}
            />

            {/* Edge light glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(200px circle at ${edgeLightX} 50%, rgba(${hex.glow},0.12) 0%, transparent 70%)`,
              }}
            />

            {/* Platform badge overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span
                className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em] text-white/90"
                style={{ background: `linear-gradient(135deg, ${hex.bg}, ${hex.accent})` }}
              >
                {platformLabel}
              </span>
              {product.isPremium && (
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-amber-200 bg-amber-900/60 backdrop-blur-sm">
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* BACK — Echte achterkant-foto of gegenereerde info */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
            style={{
              transform: `rotateY(180deg) translateZ(${DEPTH / 2}px)`,
              backfaceVisibility: 'hidden',
              width: WIDTH,
              height: HEIGHT,
              background: product.backImage ? '#111827' : `linear-gradient(160deg, ${hex.bg}25, #111827 40%, #111827 60%, ${hex.accent}20)`,
              border: `1px solid rgba(${hex.glow},0.15)`,
            }}
          >
            {product.backImage ? (
              /* Echte achterkant-foto */
              <>
                <Image
                  src={product.backImage}
                  alt={`${product.name} achterkant`}
                  fill
                  sizes="340px"
                  className="object-contain p-8"
                />
                {/* Subtiele shimmer ook op achterkant */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 70%)`,
                    backgroundSize: '300% 100%',
                    backgroundPositionX: shimmerX,
                  }}
                />
              </>
            ) : (
              /* Gegenereerde achterkant */
              <div className="h-full flex flex-col p-6">
                <div className="rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${hex.bg}, ${hex.accent})` }}>
                  <span className="text-white text-xs font-black uppercase tracking-[0.15em] flex-1">{product.platform}</span>
                  <span className="text-white/60 text-[9px] font-bold">{product.sku}</span>
                </div>

                {product.image && (
                  <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 border border-white/10">
                    <Image src={product.image} alt="" fill sizes="300px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}

                <p className="text-[11px] text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {product.description || `Ontdek ${product.name} voor ${product.platform}.`}
                </p>

                <div className="space-y-2 mb-4 flex-1">
                  {[
                    { l: 'Genre', v: product.genre },
                    { l: 'Conditie', v: product.condition },
                    { l: 'Compleetheid', v: product.completeness },
                  ].map((s) => (
                    <div key={s.l} className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 uppercase tracking-wider font-medium">{s.l}</span>
                      <span className="font-bold text-slate-200">{s.v}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl px-4 py-3 mt-auto flex items-center justify-between" style={{ background: `linear-gradient(135deg, rgba(${hex.glow},0.15), rgba(${hex.glow},0.05))` }}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nintendo</span>
                  <span className="text-lg font-black text-white">€{product.salePrice ?? product.price}</span>
                </div>
              </div>
            )}
          </div>

          {/* LEFT SPINE */}
          <div
            className="absolute overflow-hidden"
            style={{
              transform: `rotateY(-90deg) translateZ(${WIDTH / 2}px)`,
              width: DEPTH, height: HEIGHT, left: (WIDTH - DEPTH) / 2, top: 0,
              background: `linear-gradient(180deg, ${hex.bg}, ${hex.accent}, ${hex.bg}80)`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-white/90 text-[9px] font-black tracking-[0.15em] uppercase whitespace-nowrap" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
                {product.name.length > 35 ? product.name.slice(0, 33) + '…' : product.name}
              </span>
            </div>
          </div>

          {/* RIGHT SPINE */}
          <div
            className="absolute overflow-hidden"
            style={{
              transform: `rotateY(90deg) translateZ(${WIDTH / 2}px)`,
              width: DEPTH, height: HEIGHT, left: (WIDTH - DEPTH) / 2, top: 0,
              background: `linear-gradient(180deg, ${hex.accent}, ${hex.bg}, ${hex.accent}80)`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-white/90 text-[9px] font-black tracking-[0.15em] uppercase" style={{ writingMode: 'vertical-lr' }}>{platformLabel}</span>
            </div>
          </div>

          {/* TOP */}
          <div className="absolute rounded-t-sm" style={{
            transform: `rotateX(90deg) translateZ(${HEIGHT / 2}px)`,
            width: WIDTH, height: DEPTH, top: (HEIGHT - DEPTH) / 2, left: 0,
            background: `linear-gradient(90deg, ${hex.bg}, ${hex.accent})`,
            backfaceVisibility: 'hidden',
          }} />

          {/* BOTTOM */}
          <div className="absolute rounded-b-sm" style={{
            transform: `rotateX(-90deg) translateZ(${HEIGHT / 2}px)`,
            width: WIDTH, height: DEPTH, top: (HEIGHT - DEPTH) / 2, left: 0,
            background: `linear-gradient(90deg, ${hex.accent}, ${hex.bg})`,
            backfaceVisibility: 'hidden',
          }} />
        </motion.div>

        {/* Dynamische vloerschaduw */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] pointer-events-none"
          style={{
            width: WIDTH * 0.8,
            height: 30,
            background: `radial-gradient(ellipse, rgba(${hex.glow},0.3) 0%, rgba(${hex.glow},0.1) 40%, transparent 70%)`,
            translateY: 30,
            scaleX: useTransform(rotateY, [-180, 0, 180], [1.3, 0.7, 1.3]),
            opacity: useTransform(rotateX, [-30, 0, 30], [0.15, 0.6, 0.15]),
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* ===== CONTROLS ===== */}
      <div className="relative flex items-center justify-center gap-3 mt-6" style={{ zIndex: 3 }}>
        <button
          onClick={resetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Voorkant
        </button>
        <button
          onClick={() => { setAutoRotate(!autoRotate); autoAngle.current = rawRotateY.get(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors backdrop-blur-sm ${
            autoRotate
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {autoRotate ? 'Stoppen' : 'Draaien'}
        </button>
      </div>
      <p className="relative text-center text-[10px] text-slate-400 mt-2" style={{ zIndex: 3 }}>
        {isPokemon ? 'Sleep om te draaien · Pokémon vliegen mee!' : 'Sleep om te draaien'}
      </p>
    </div>
  );
}
