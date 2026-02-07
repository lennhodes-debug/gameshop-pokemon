'use client';

import { useCallback, useRef } from 'react';

type SoundType = 'coin' | 'select' | 'powerUp' | 'navigate' | 'error' | 'success';

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playOscillator(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  startTime = ctx.currentTime,
  volume = 0.08
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

const sounds: Record<SoundType, (ctx: AudioContext) => void> = {
  // Mario-achtig coin geluid: twee korte oplopende tonen
  coin(ctx) {
    playOscillator(ctx, 988, 0.08, 'square', ctx.currentTime, 0.06);
    playOscillator(ctx, 1319, 0.15, 'square', ctx.currentTime + 0.08, 0.06);
  },
  // Menu selectie blip
  select(ctx) {
    playOscillator(ctx, 660, 0.06, 'square', ctx.currentTime, 0.05);
  },
  // Oplopende toonladder (add-to-cart)
  powerUp(ctx) {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playOscillator(ctx, freq, 0.08, 'square', ctx.currentTime + i * 0.06, 0.05);
    });
  },
  // Kort whoosh
  navigate(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },
  // Dalende toon (error)
  error(ctx) {
    playOscillator(ctx, 440, 0.1, 'square', ctx.currentTime, 0.06);
    playOscillator(ctx, 330, 0.15, 'square', ctx.currentTime + 0.1, 0.06);
  },
  // Overwinnings-fanfare
  success(ctx) {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((freq, i) => {
      playOscillator(ctx, freq, 0.12, 'square', ctx.currentTime + i * 0.1, 0.05);
    });
  },
};

export function useRetroSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((sound: SoundType) => {
    // Respecteer reduced motion voorkeur
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Check mute voorkeur
    try {
      if (localStorage.getItem('gameshop-sound-muted') === 'true') return;
    } catch {
      // localStorage niet beschikbaar
    }

    if (!ctxRef.current) {
      ctxRef.current = getAudioContext();
    }

    const ctx = ctxRef.current;
    if (!ctx) return;

    // Resume context als het suspended is (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    sounds[sound](ctx);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    try {
      localStorage.setItem('gameshop-sound-muted', String(muted));
    } catch {
      // localStorage niet beschikbaar
    }
  }, []);

  const isMuted = useCallback((): boolean => {
    try {
      return localStorage.getItem('gameshop-sound-muted') === 'true';
    } catch {
      return false;
    }
  }, []);

  return { play, setMuted, isMuted };
}
