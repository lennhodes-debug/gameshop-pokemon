'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProducts, Product } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

const NAMES = [
  'Kevin', 'Sanne', 'Tim', 'Lisa', 'Daan', 'Emma',
  'Lars', 'Sophie', 'Bas', 'Julia', 'Milan', 'Fleur',
  'Rick', 'Anna', 'Thijs', 'Lotte',
];

const CITIES = [
  'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag',
  'Eindhoven', 'Groningen', 'Tilburg', 'Breda',
  'Nijmegen', 'Arnhem', 'Almere', 'Haarlem',
];

const INITIAL_DELAY = 15_000;
const DISPLAY_DURATION = 5_000;
const MIN_INTERVAL = 30_000;
const MAX_INTERVAL = 60_000;
const SESSION_KEY = 'social-proof-init';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInterval(): number {
  return MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
}

interface SocialProofData {
  product: Product;
  name: string;
  city: string;
}

export default function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<SocialProofData | null>(null);
  const productsWithImage = useRef<Product[]>([]);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateData = useCallback((): SocialProofData => {
    const product = pickRandom(productsWithImage.current);
    return {
      product,
      name: pickRandom(NAMES),
      city: pickRandom(CITIES),
    };
  }, []);

  const scheduleNext = useCallback((delay: number) => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    showTimerRef.current = setTimeout(() => {
      setData(generateData());
      setVisible(true);

      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        scheduleNext(getRandomInterval());
      }, DISPLAY_DURATION);
    }, delay);
  }, [generateData]);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    scheduleNext(getRandomInterval());
  }, [scheduleNext]);

  useEffect(() => {
    const allProducts = getAllProducts();
    productsWithImage.current = allProducts.filter((p) => !!p.image);

    if (productsWithImage.current.length === 0) return;

    const initTimestamp = sessionStorage.getItem(SESSION_KEY);
    const now = Date.now();
    let firstDelay = INITIAL_DELAY;

    if (initTimestamp) {
      const elapsed = now - Number(initTimestamp);
      if (elapsed < INITIAL_DELAY) {
        firstDelay = INITIAL_DELAY - elapsed;
      } else {
        firstDelay = 0;
      }
    } else {
      sessionStorage.setItem(SESSION_KEY, String(now));
    }

    scheduleNext(firstDelay);

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [scheduleNext]);

  return (
    <div className="fixed bottom-4 left-4 z-50" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {visible && data && (
          <motion.div
            key={data.product.sku + data.name}
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center gap-3 p-3 pr-9 max-w-[320px] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl"
          >
            {data.product.image && (
              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                <Image
                  src={data.product.image}
                  alt={data.product.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {data.name} uit {data.city}
              </p>
              <p className="text-xs text-slate-500 truncate">
                kocht {data.product.name} voor {formatPrice(data.product.price)}
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Melding sluiten"
              className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
