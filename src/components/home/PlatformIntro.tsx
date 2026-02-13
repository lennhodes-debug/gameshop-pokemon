'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const PLATFORMS = [
  { name: 'Game Boy', year: '1989', tagline: 'Waar het allemaal begon', accent: '#9BBC0F', cover: '/images/products/gb-001-pokemon-trading-card-game.webp' },
  { name: 'Game Boy Advance', year: '2001', tagline: 'De volgende generatie', accent: '#7B68EE', cover: '/images/products/gba-001-pokemon-emerald.webp' },
  { name: 'Nintendo DS', year: '2004', tagline: 'Twee schermen, dubbel plezier', accent: '#94A3B8', cover: '/images/products/ds-001-pokemon-platinum.webp' },
  { name: 'Nintendo 3DS', year: '2011', tagline: 'Een nieuwe dimensie', accent: '#EF4444', cover: '/images/products/3ds-001-pokemon-x.webp' },
];

export default function PlatformIntro() {
  const [show, setShow] = useState(false);
  const [scene, setScene] = useState(-1);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const key = 'gi-v5';
    try { if (sessionStorage.getItem(key)) return; } catch (e) { return; }

    setShow(true);
    document.body.style.overflow = 'hidden';

    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      if (scene < PLATFORMS.length) {
        setFade(true);
        setTimeout(() => {
          setScene(s => s + 1);
          setFade(false);
        }, 400);
      } else {
        handleClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, scene]);

  function handleClose() {
    setFade(true);
    document.body.style.overflow = '';
    try { sessionStorage.setItem('gi-v5', '1'); } catch (e) { /* noop */ }
    setTimeout(() => setShow(false), 600);
  }

  if (!show) return null;

  const isPlatform = scene >= 0 && scene < PLATFORMS.length;
  const isFinale = scene >= PLATFORMS.length;
  const p = isPlatform ? PLATFORMS[scene] : null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#030306',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fade && isFinale ? 0 : 1,
      transition: 'opacity 600ms ease',
    }}>
      {/* Letterbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6%', background: '#000', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6%', background: '#000', zIndex: 2 }} />

      {/* Content */}
      <div style={{
        textAlign: 'center',
        width: '100%',
        maxWidth: 900,
        padding: '0 24px',
        opacity: fade ? 0 : 1,
        transition: 'opacity 350ms ease',
        zIndex: 1,
      }}>
        {/* OPENING */}
        {scene === -1 && (
          <div>
            <p style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
              Gameshop Enter
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 300, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              Een reis door
            </h1>
            <h1 style={{
              fontSize: 'clamp(36px, 7vw, 72px)',
              fontWeight: 900,
              background: 'linear-gradient(to right, #34d399, #2dd4bf, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '8px 0 0',
            }}>
              Nintendo geschiedenis
            </h1>
            <div style={{ width: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(16,185,129,0.5), transparent)', margin: '32px auto 0' }} />
          </div>
        )}

        {/* PLATFORM */}
        {isPlatform && p && (
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900, color: p.accent, opacity: 0.2, margin: '0 0 16px' }}>
              {p.year}
            </p>
            <h2 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, color: '#fff', lineHeight: 0.95, margin: '0 0 12px' }}>
              {p.name}
            </h2>
            <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(255,255,255,0.3)', margin: '0 0 48px' }}>
              {p.tagline}
            </p>
            <div style={{
              position: 'relative',
              width: 'clamp(176px, 30vw, 256px)',
              height: 'clamp(176px, 30vw, 256px)',
              margin: '0 auto',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: `0 30px 80px -15px rgba(0,0,0,0.8), 0 0 50px -10px ${p.accent}30`,
            }}>
              <Image src={p.cover} alt={p.name} fill sizes="256px" style={{ objectFit: 'cover' }} />
            </div>
          </div>
        )}

        {/* FINALE */}
        {isFinale && (
          <div>
            <h2 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, color: '#fff', lineHeight: 1, margin: 0 }}>
              Gameshop
            </h2>
            <h2 style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 900,
              lineHeight: 1,
              margin: 0,
              background: 'linear-gradient(to right, #34d399, #2dd4bf, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Enter
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 24 }}>
              De Pokemon specialist van Nederland
            </p>
          </div>
        )}
      </div>

      {/* Progress */}
      {isPlatform && (
        <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, zIndex: 3 }}>
          {PLATFORMS.map((pl, i) => (
            <div key={pl.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                height: 4,
                borderRadius: 2,
                width: i === scene ? 40 : 12,
                backgroundColor: i === scene ? pl.accent : i < scene ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                transition: 'all 500ms',
              }} />
              <span style={{ fontSize: 9, fontFamily: 'monospace', color: i === scene ? pl.accent : 'rgba(255,255,255,0.15)' }}>
                {pl.year}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skip */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: 24,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          background: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        Overslaan ▸▸
      </button>
    </div>
  );
}
