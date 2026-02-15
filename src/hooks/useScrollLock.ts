import { useEffect } from 'react';

/**
 * Vergrendelt body scroll wanneer `locked` true is.
 * Herstelt automatisch bij unmount of wanneer `locked` false wordt.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
