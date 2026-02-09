'use client';

import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, AnimatePresence, useInView } from 'framer-motion';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { formatPrice, PLATFORM_COLORS, PLATFORM_LABELS, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { useState, useRef, useCallback, useEffect } from 'react';

function AnimatedPrice({ price }: { price: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayPrice, setDisplayPrice] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frameId: number;
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPrice(eased * price);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, price]);

  return (
    <span ref={ref} className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
      {formatPrice(displayPrice)}
    </span>
  );
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const colors = PLATFORM_COLORS[product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
  const platformLabel = PLATFORM_LABELS[product.platform] || product.platform;
  const isCIB = product.completeness.toLowerCase().includes('compleet');
  const freeShipping = product.price >= FREE_SHIPPING_THRESHOLD;

  // Track eerder bekeken producten
  useEffect(() => {
    try {
      const key = 'gameshop-recent';
      const stored: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [product.sku, ...stored.filter(s => s !== product.sku)].slice(0, 12);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [product.sku]);

  const imageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 25 });
  const [imageHovered, setImageHovered] = useState(false);
  const [flyData, setFlyData] = useState<{ from: DOMRect; to: DOMRect; image: string } | null>(null);

  // Spotlight effect
  const spotlightX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotlightY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const spotlightBg = useMotionTemplate`
    radial-gradient(400px circle at ${spotlightX}% ${spotlightY}%,
      rgba(16,185,129,0.08) 0%,
      transparent 60%)
  `;

  const handleImageMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleImageMouseLeave = useCallback(() => {
    setImageHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    addToast(`${product.name} toegevoegd aan winkelwagen`, 'success', undefined, product.image || undefined);
    setTimeout(() => setAdded(false), 2000);

    const imgEl = imageRef.current?.querySelector('img');
    const cartEl = document.querySelector('[aria-label="Winkelwagen"]');
    if (imgEl && cartEl && product.image) {
      const from = imgEl.getBoundingClientRect();
      const to = cartEl.getBoundingClientRect();
      setFlyData({ from, to, image: product.image });
    }
  };

  const specs = [
    { label: 'Platform', value: product.platform },
    { label: 'Genre', value: product.genre },
    { label: 'Type', value: product.type },
    { label: 'Conditie', value: product.condition },
    { label: 'Compleetheid', value: isCIB ? 'Compleet in doos (CIB)' : product.completeness },
    { label: 'SKU', value: product.sku },
    { label: 'Gewicht', value: `${product.weight} kg` },
  ];

  return (
    <div>
      {/* Breadcrumbs */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8"
      >
        <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
        <svg className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <Link href="/shop" className="hover:text-emerald-600 transition-colors">Shop</Link>
        <svg className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <Link href={`/shop?platform=${encodeURIComponent(product.platform)}`} className="hover:text-emerald-600 transition-colors">
          {product.platform}
        </Link>
        <svg className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[200px]">{product.name}</span>
      </motion.nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image with 3D tilt and spotlight */}
        <motion.div
          ref={imageRef}
          onMouseMove={handleImageMouseMove}
          onMouseEnter={() => setImageHovered(true)}
          onMouseLeave={handleImageMouseLeave}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          style={{
            rotateX: imageHovered ? rotateX : 0,
            rotateY: imageHovered ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          className="relative group perspective-1000"
        >
          <div className={`aspect-square rounded-3xl ${product.image ? 'bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-slate-100 dark:border-slate-700' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center overflow-hidden relative shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50`}>
            {product.image ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/50 dark:via-slate-700/50 to-transparent animate-shimmer" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-slate-300 dark:text-slate-600 text-4xl font-black animate-pulse">{platformLabel}</span>
                    </div>
                  </div>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-contain p-10 transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} group-hover:scale-105`}
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
                {/* Spotlight overlay */}
                {imageHovered && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-3xl"
                    style={{ background: spotlightBg }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
                {/* Shimmer sweep */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/20 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full transition-all duration-1000 ease-in-out" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-8 border border-white/[0.06] rounded-full"
                />
                <span className="text-white/30 text-[120px] font-black select-none relative z-10">
                  {platformLabel}
                </span>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-5 left-5 flex gap-2">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`px-3 py-1.5 rounded-xl ${product.image ? 'bg-slate-900/70' : 'bg-black/20'} backdrop-blur-sm text-white text-xs font-semibold`}
              >
                {product.platform}
              </motion.span>
            </div>
            <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
              {product.isPremium && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Badge variant="premium">PREMIUM</Badge>
                </motion.div>
              )}
              {product.isConsole && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Badge variant="console">CONSOLE</Badge>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex flex-col"
        >
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <Badge variant="condition">{product.condition}</Badge>
            <Badge variant="completeness">{isCIB ? 'Compleet in doos (CIB)' : product.completeness}</Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3"
          >
            {product.name}
          </motion.h1>

          {/* Meta info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-6"
          >
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to}`} />
              {product.platform}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{product.genre}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="font-mono text-xs text-slate-400">{product.sku}</span>
          </motion.div>

          {/* Price block */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-baseline gap-3 mb-8"
          >
            <AnimatedPrice price={product.price} />
            {freeShipping && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Gratis verzending
              </motion.span>
            )}
          </motion.div>

          {/* Description */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mb-8 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 p-6"
            >
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Beschrijving
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                {product.description}
              </p>
            </motion.div>
          )}

          {/* Add to cart button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={handleAdd}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full sm:w-auto px-8 py-4 rounded-2xl text-white text-base font-bold overflow-hidden transition-all duration-300 ${
                added
                  ? 'bg-emerald-500 shadow-xl shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 animate-cta-attention'
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="relative flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Toegevoegd aan winkelwagen
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    In winkelwagen
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Order info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {[
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                ),
                title: 'Verzending via PostNL',
                desc: freeShipping ? 'Gratis verzending' : 'Standaard: \u20AC3,95',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: 'Veilig betalen',
                desc: 'iDEAL, creditcard, PayPal',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                ),
                title: '14 dagen retour',
                desc: 'Niet goed? Geld terug.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
                title: '100% origineel',
                desc: 'Persoonlijk getest op werking',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">{item.title}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{item.desc}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Product Specifications */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16"
      >
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">Specificaties</h2>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`flex items-center justify-between px-6 py-4 ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'} ${i < specs.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
            >
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{spec.label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{spec.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {flyData && typeof document !== 'undefined' && createPortal(
        <motion.div
          className="fixed z-[200] pointer-events-none rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/30"
          initial={{
            left: flyData.from.left,
            top: flyData.from.top,
            width: flyData.from.width,
            height: flyData.from.height,
            opacity: 1,
          }}
          animate={{
            left: flyData.to.left + flyData.to.width / 2 - 16,
            top: flyData.to.top + flyData.to.height / 2 - 16,
            width: 32,
            height: 32,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: [0.32, 0, 0.67, 0] }}
          onAnimationComplete={() => setFlyData(null)}
        >
          <img src={flyData.image} alt="" className="w-full h-full object-contain bg-white" />
        </motion.div>,
        document.body
      )}
    </div>
  );
}
