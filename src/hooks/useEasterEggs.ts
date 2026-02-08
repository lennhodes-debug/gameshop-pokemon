'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRetroSound } from './useRetroSound';
import { useToast } from '@/components/ui/Toast';

// Konami code: Up Up Down Down Left Right Left Right B A
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

const GAMESHOP_WORD = ['KeyG', 'KeyA', 'KeyM', 'KeyE', 'KeyS', 'KeyH', 'KeyO', 'KeyP'];

export function useEasterEggs() {
  const { play } = useRetroSound();
  const { addToast } = useToast();
  const keysRef = useRef<string[]>([]);
  const logoClicksRef = useRef(0);
  const logoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const triggerRainbow = useCallback(() => {
    document.documentElement.style.filter = 'hue-rotate(0deg)';
    document.documentElement.style.transition = 'filter 0.5s';

    let deg = 0;
    const interval = setInterval(() => {
      deg += 72;
      document.documentElement.style.filter = `hue-rotate(${deg}deg)`;
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      document.documentElement.style.filter = '';
      document.documentElement.style.transition = '';
    }, 5000);
  }, []);

  const triggerConfettiExplosion = useCallback(() => {
    // Maak 30 confetti elementen met CSS
    const colors = ['#E60012', '#0070F3', '#00A651', '#FFD700', '#FF6B35', '#7B2FF7'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(container);

    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = 40 + Math.random() * 20;
      const endX = Math.random() * 100;
      const endY = 100 + Math.random() * 20;
      const size = 4 + Math.random() * 6;
      const rotation = Math.random() * 720;
      const duration = 800 + Math.random() * 400;

      el.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;background:${color};
        border-radius:${Math.random() > 0.5 ? '50%' : '0'};
        left:${x}%;top:40%;
        animation:confetti-fly ${duration}ms ease-out forwards;
      `;

      // Inline keyframe per element
      const style = document.createElement('style');
      style.textContent = `
        @keyframes confetti-fly {
          to { left:${endX}%; top:${endY}%; opacity:0; transform:rotate(${rotation}deg); }
        }
      `;
      container.appendChild(style);
      container.appendChild(el);
    }

    setTimeout(() => container.remove(), 1500);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.push(e.code);

      // Check Konami code
      if (keysRef.current.length > KONAMI_CODE.length) {
        keysRef.current = keysRef.current.slice(-KONAMI_CODE.length);
      }

      if (
        keysRef.current.length === KONAMI_CODE.length &&
        keysRef.current.every((k, i) => k === KONAMI_CODE[i])
      ) {
        play('success');
        triggerConfettiExplosion();
        addToast('Konami Code geactiveerd!');
        keysRef.current = [];
        return;
      }

      // Check GAMESHOP word
      const lastN = keysRef.current.slice(-GAMESHOP_WORD.length);
      if (
        lastN.length === GAMESHOP_WORD.length &&
        lastN.every((k, i) => k === GAMESHOP_WORD[i])
      ) {
        play('powerUp');
        triggerRainbow();
        addToast('Regenboog modus!');
        keysRef.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [play, addToast, triggerConfettiExplosion, triggerRainbow]);

  // Logo click handler — call this from the logo component
  const handleLogoClick = useCallback(() => {
    logoClicksRef.current++;
    clearTimeout(logoTimerRef.current);

    if (logoClicksRef.current >= 10) {
      play('coin');
      addToast('Easter egg gevonden!');
      // Draai het logo element
      const logo = document.querySelector('[data-logo]');
      if (logo) {
        (logo as HTMLElement).style.transition = 'transform 1s';
        (logo as HTMLElement).style.transform = 'rotateY(360deg)';
        setTimeout(() => {
          (logo as HTMLElement).style.transform = '';
        }, 1000);
      }
      logoClicksRef.current = 0;
    } else {
      logoTimerRef.current = setTimeout(() => {
        logoClicksRef.current = 0;
      }, 2000);
    }
  }, [play, addToast]);

  return { handleLogoClick };
}
