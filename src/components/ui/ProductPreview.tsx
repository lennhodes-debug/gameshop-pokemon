'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

interface ProductPreviewProps {
  product: Product;
  children: React.ReactNode;
}

export default function ProductPreview({ product, children }: ProductPreviewProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; above: boolean }>({
    top: 0,
    left: 0,
    above: false,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleEnter = useCallback(() => {
    if (isTouchDevice) return;
    timeoutRef.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const above = rect.top > window.innerHeight / 2;
      setPosition({
        top: above ? rect.top - 8 : rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 280),
        above,
      });
      setShow(true);
    }, 500);
  }, [isTouchDevice]);

  const handleLeave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setShow(false);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="inline-block"
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position.above ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[100] pointer-events-none"
            style={{
              top: position.above ? 'auto' : position.top,
              bottom: position.above ? `calc(100vh - ${position.top}px)` : 'auto',
              left: position.left,
            }}
          >
            <div className="w-64 bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
              {product.image && (
                <div className="relative h-32 bg-gradient-to-b from-slate-50 to-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="256px"
                    className="object-contain p-3"
                  />
                </div>
              )}
              <div className="p-3">
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 mb-1.5">
                  {product.platform}
                </span>
                <p className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                  {product.name}
                </p>
                <p className="text-lg font-extrabold text-emerald-600">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
