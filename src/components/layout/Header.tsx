'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import CartCounter from './CartCounter';
import Image from 'next/image';
import { cn, formatPrice, PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/inkoop', label: 'Inkoop' },
  { href: '/over-ons', label: 'Over ons' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const { items, getItemCount, getTotal } = useCart();
  const itemCount = getItemCount();
  const [cartHover, setCartHover] = useState(false);
  const cartHoverTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    const firstLink = mobileNavRef.current?.querySelector('a');
    firstLink?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass border-b border-white/[0.06] shadow-lg'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-9 w-9 lg:h-10 lg:w-10" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-tight tracking-tight">Gameshop</span>
                <span className="text-emerald-400 text-[11px] font-semibold tracking-widest uppercase -mt-0.5">Enter</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Hoofdnavigatie">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors duration-200',
                    isActive(link.href) ? 'text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              {/* Zoeken */}
              <Link href="/shop" className="hidden lg:flex">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span className="text-xs font-medium">Zoeken</span>
                </div>
              </Link>

              {/* Cart */}
              <div
                className="relative"
                onMouseEnter={() => { clearTimeout(cartHoverTimeout.current); setCartHover(true); }}
                onMouseLeave={() => { cartHoverTimeout.current = setTimeout(() => setCartHover(false), 200); }}
              >
                <Link href="/winkelwagen" aria-label="Winkelwagen">
                  <div className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <CartCounter />
                  </div>
                </Link>

                {/* Cart preview */}
                <AnimatePresence>
                  {cartHover && itemCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="hidden lg:block absolute right-0 top-full mt-2 w-80 rounded-2xl glass border border-white/[0.08] shadow-2xl p-4 z-50"
                    >
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Winkelwagen ({itemCount})
                      </p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {items.slice(0, 5).map((item) => {
                          const colors = PLATFORM_COLORS[item.product.platform] || { from: 'from-slate-500', to: 'to-slate-700' };
                          return (
                            <div key={item.product.sku} className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden ${item.product.image ? 'bg-white/10 border border-white/[0.08]' : `bg-gradient-to-br ${colors.from} ${colors.to}`} flex items-center justify-center`}>
                                {item.product.image ? (
                                  <Image src={item.product.image} alt={item.product.name} width={40} height={40} className="object-contain p-0.5" />
                                ) : (
                                  <span className="text-white/20 text-[7px] font-bold">{PLATFORM_LABELS[item.product.platform]}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{item.product.name}</p>
                                <p className="text-[10px] text-slate-400">{item.quantity}x {formatPrice(item.product.price)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white">{formatPrice(getTotal())}</span>
                          <span className="text-[10px] text-slate-400">excl. verzending</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href="/winkelwagen" className="flex-1 px-3 py-2 rounded-lg border border-white/[0.1] text-white text-xs font-bold text-center hover:bg-white/[0.06] transition-colors">
                            Bekijken
                          </Link>
                          <Link href="/afrekenen" className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold text-center shadow-lg shadow-emerald-500/20">
                            Afrekenen
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Menu sluiten' : 'Menu openen'}
                aria-expanded={mobileOpen}
                className="lg:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 top-16 bg-black/50 z-[-1]"
              />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden glass border-t border-white/[0.06]"
              >
                <nav ref={mobileNavRef} className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1" aria-label="Mobiele navigatie">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'block px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive(link.href) ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-white/[0.06] mt-2 pt-2">
                    <Link
                      href="/winkelwagen"
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        pathname === '/winkelwagen' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Winkelwagen
                      </span>
                      {itemCount > 0 && (
                        <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-1.5">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Mobiele bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-sm border-t border-slate-200" aria-label="Mobiele navigatie">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {[
            { href: '/', label: 'Home', icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            )},
            { href: '/shop', label: 'Shop', icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            )},
            { href: '/winkelwagen', label: 'Wagen', badge: itemCount, icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )},
          ].map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('?')[0]);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative',
                  active ? 'text-emerald-500' : 'text-slate-400'
                )}
              >
                <span className="relative">
                  {item.icon}
                  {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 h-4 min-w-4 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold px-1">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
