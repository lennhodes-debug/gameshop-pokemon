'use client';

import { useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useRetroSound } from './useRetroSound';

interface Achievement {
  id: string;
  title: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-visit', title: 'Eerste bezoek', description: 'Welkom bij Gameshop Enter!' },
  { id: 'collector', title: 'Verzamelaar', description: '3+ items in je winkelwagen' },
  { id: 'explorer', title: 'Ontdekker', description: '5+ pagina\'s bezocht' },
  { id: 'retro-gamer', title: 'Retro Gamer', description: 'Een klassiek product bekeken' },
  { id: 'big-spender', title: 'Big Spender', description: 'Gratis verzending verdiend!' },
  { id: 'night-owl', title: 'Nachtbraker', description: 'Games shoppen na middernacht' },
];

function getUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem('gameshop-achievements');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveUnlocked(ids: Set<string>) {
  try {
    localStorage.setItem('gameshop-achievements', JSON.stringify(Array.from(ids)));
  } catch {
    // localStorage niet beschikbaar
  }
}

export function useAchievements() {
  const { addToast } = useToast();
  const { play } = useRetroSound();
  const lastUnlockTime = useRef(0);

  const unlock = useCallback(
    (achievementId: string) => {
      const now = Date.now();
      // Max 1 per 30 seconden
      if (now - lastUnlockTime.current < 30000) return;

      const unlocked = getUnlocked();
      if (unlocked.has(achievementId)) return;

      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return;

      unlocked.add(achievementId);
      saveUnlocked(unlocked);
      lastUnlockTime.current = now;

      play('coin');
      addToast(`Achievement: ${achievement.title} — ${achievement.description}`);
    },
    [addToast, play]
  );

  const checkFirstVisit = useCallback(() => {
    unlock('first-visit');
  }, [unlock]);

  const checkCartCount = useCallback(
    (count: number) => {
      if (count >= 3) unlock('collector');
    },
    [unlock]
  );

  const checkPagesVisited = useCallback(() => {
    try {
      const pages = JSON.parse(localStorage.getItem('gameshop-visited-pages') || '[]') as string[];
      if (pages.length >= 5) unlock('explorer');
    } catch {
      // ignore
    }
  }, [unlock]);

  const checkRetroProduct = useCallback(
    (platform: string) => {
      const retro = ['Game Boy', 'Game Boy Color', 'NES', 'Super Nintendo', 'Game Boy Advance'];
      if (retro.some((r) => platform.includes(r))) {
        unlock('retro-gamer');
      }
    },
    [unlock]
  );

  const checkCartTotal = useCallback(
    (total: number) => {
      if (total >= 100) unlock('big-spender');
    },
    [unlock]
  );

  const checkNightOwl = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) unlock('night-owl');
  }, [unlock]);

  const trackPageVisit = useCallback(
    (path: string) => {
      try {
        const pages = JSON.parse(localStorage.getItem('gameshop-visited-pages') || '[]') as string[];
        if (!pages.includes(path)) {
          pages.push(path);
          localStorage.setItem('gameshop-visited-pages', JSON.stringify(pages));
        }
      } catch {
        // ignore
      }
      checkPagesVisited();
      checkNightOwl();
    },
    [checkPagesVisited, checkNightOwl]
  );

  return {
    checkFirstVisit,
    checkCartCount,
    checkRetroProduct,
    checkCartTotal,
    trackPageVisit,
  };
}
