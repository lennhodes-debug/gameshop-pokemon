'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
  className?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatNumber(value: number, decimals: number, separator: string): string {
  const fixed = value.toFixed(decimals);
  const [whole, decimal] = fixed.split('.');
  const withSeparator = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decimal ? `${withSeparator},${decimal}` : withSeparator;
}

export default function CountUp({
  target,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = '.',
  className = '',
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let frame: number;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(eased * target);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [hasStarted, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(value, decimals, separator)}{suffix}
    </span>
  );
}
