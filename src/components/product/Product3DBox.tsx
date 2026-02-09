'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
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

  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const hex = PLATFORM_HEX[product.platform] || { bg: '#64748b', accent: '#475569' };

  // Box dimensies
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

  // Drag handlers
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
      {/* 3D Box Container */}
      <div
        ref={containerRef}
        className="relative mx-auto cursor-grab active:cursor-grabbing"
        style={{
          perspective: 1200,
          width: WIDTH,
          height: HEIGHT,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            rotateY,
            rotateX,
          }}
        >
          {/* FRONT — Cover image */}
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
              {/* Platform header */}
              <div
                className="rounded-lg px-3 py-2 mb-3"
                style={{ background: `linear-gradient(135deg, ${hex.bg}, ${hex.accent})` }}
              >
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  {product.platform}
                </span>
              </div>

              {/* Screenshot placeholders */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[0.08, 0.12, 0.06].map((op, i) => (
                  <div
                    key={i}
                    className="aspect-video rounded"
                    style={{ background: `linear-gradient(135deg, ${hex.bg}${Math.round(op * 255).toString(16).padStart(2, '0')}, ${hex.accent}${Math.round(op * 0.7 * 255).toString(16).padStart(2, '0')})` }}
                  />
                ))}
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-4 flex-shrink-0">
                {product.description || `Ontdek ${product.name} voor ${product.platform}. Een onvergetelijke game-ervaring.`}
              </p>

              {/* Specs */}
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

              {/* Bottom bar */}
              <div
                className="rounded-lg px-3 py-2 flex items-center justify-between mt-auto"
                style={{ background: `linear-gradient(135deg, ${hex.bg}20, ${hex.accent}15)` }}
              >
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
              width: DEPTH,
              height: HEIGHT,
              left: (WIDTH - DEPTH) / 2,
              top: 0,
              background: `linear-gradient(180deg, ${hex.bg}, ${hex.accent})`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="h-full flex items-center justify-center">
              <span
                className="text-white text-[9px] font-bold tracking-widest uppercase whitespace-nowrap"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                {product.name.length > 30 ? product.name.slice(0, 28) + '…' : product.name}
              </span>
            </div>
          </div>

          {/* RIGHT SPINE */}
          <div
            className="absolute overflow-hidden"
            style={{
              transform: `rotateY(90deg) translateZ(${WIDTH / 2}px)`,
              width: DEPTH,
              height: HEIGHT,
              left: (WIDTH - DEPTH) / 2,
              top: 0,
              background: `linear-gradient(180deg, ${hex.accent}, ${hex.bg})`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="h-full flex items-center justify-center">
              <span
                className="text-white text-[9px] font-bold tracking-widest uppercase"
                style={{ writingMode: 'vertical-lr' }}
              >
                {platformLabel}
              </span>
            </div>
          </div>

          {/* TOP */}
          <div
            className="absolute"
            style={{
              transform: `rotateX(90deg) translateZ(${HEIGHT / 2}px)`,
              width: WIDTH,
              height: DEPTH,
              top: (HEIGHT - DEPTH) / 2,
              left: 0,
              background: `linear-gradient(90deg, ${hex.bg}, ${hex.accent})`,
              backfaceVisibility: 'hidden',
            }}
          />

          {/* BOTTOM */}
          <div
            className="absolute"
            style={{
              transform: `rotateX(-90deg) translateZ(${HEIGHT / 2}px)`,
              width: WIDTH,
              height: DEPTH,
              top: (HEIGHT - DEPTH) / 2,
              left: 0,
              background: `linear-gradient(90deg, ${hex.accent}, ${hex.bg})`,
              backfaceVisibility: 'hidden',
            }}
          />
        </motion.div>
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
        Sleep om te draaien
      </p>
    </div>
  );
}
