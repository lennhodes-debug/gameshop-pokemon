/**
 * Gesture Recognition Hook
 *
 * Detects mobile gestures for enhanced UX
 * Phase 4: Mobile Optimization
 */

import { useEffect, useRef, useState } from 'react';

export interface GesturePoint {
  x: number;
  y: number;
  time: number;
}

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

export function useSwipeGesture(
  onSwipe: (event: SwipeEvent) => void,
  options: { minDistance?: number; minVelocity?: number } = {}
) {
  const { minDistance = 30, minVelocity = 0.5 } = options;
  const startPoint = useRef<GesturePoint | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startPoint.current) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();

      const deltaX = endX - startPoint.current.x;
      const deltaY = endY - startPoint.current.y;
      const deltaTime = (endTime - startPoint.current.time) / 1000;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      if (distance < minDistance || velocity < minVelocity) {
        return;
      }

      let direction: 'left' | 'right' | 'up' | 'down';
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      onSwipe({ direction, distance, velocity });
    };

    const element = elementRef.current || document;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe, minDistance, minVelocity]);

  return elementRef;
}

/**
 * Tap detection hook
 */
export function useTapGesture(
  onTap: () => void,
  options: { maxDuration?: number } = {}
) {
  const { maxDuration = 300 } = options;
  const startTime = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleTouchStart = () => {
      startTime.current = Date.now();
    };

    const handleTouchEnd = () => {
      if (startTime.current && Date.now() - startTime.current < maxDuration) {
        onTap();
      }
      startTime.current = null;
    };

    const element = elementRef.current || document;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onTap, maxDuration]);

  return elementRef;
}

/**
 * Haptic feedback simulation
 */
export function useHapticFeedback() {
  const trigger = (pattern: 'light' | 'medium' | 'heavy' | 'success') => {
    if ('vibrate' in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 50,
        heavy: 100,
        success: [50, 30, 50]
      };
      navigator.vibrate(patterns[pattern] || 50);
    }
  };

  return { trigger };
}

/**
 * Double tap detection
 */
export function useDoubleTapGesture(
  onDoubleTap: () => void,
  options: { maxDelay?: number } = {}
) {
  const { maxDelay = 300 } = options;
  const lastTapTime = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleTap = () => {
      const now = Date.now();
      if (now - lastTapTime.current < maxDelay) {
        onDoubleTap();
      }
      lastTapTime.current = now;
    };

    const element = elementRef.current || document;
    element.addEventListener('click', handleTap);

    return () => {
      element.removeEventListener('click', handleTap);
    };
  }, [onDoubleTap, maxDelay]);

  return elementRef;
}
