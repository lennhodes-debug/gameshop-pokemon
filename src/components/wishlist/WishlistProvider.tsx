'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface WishlistContextType {
  items: string[];
  addItem: (sku: string) => void;
  removeItem: (sku: string) => void;
  toggleItem: (sku: string) => void;
  isInWishlist: (sku: string) => boolean;
  getShareUrl: () => string;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'gameshop-wishlist';

function parseSkuList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string' && item.length > 0 && item.length < 50);
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Check for shared wishlist in URL
      const params = new URLSearchParams(window.location.search);
      const shared = params.get('wishlist');
      if (shared) {
        try {
          const decoded = parseSkuList(JSON.parse(atob(shared)));
          if (decoded.length > 0) {
            setItems(decoded);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(decoded));
            // Clean URL without reload
            const url = new URL(window.location.href);
            url.searchParams.delete('wishlist');
            window.history.replaceState({}, '', url.pathname + url.search);
            return;
          }
        } catch { /* invalid share data */ }
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(parseSkuList(JSON.parse(stored)));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch { /* ignore */ }
    }
  }, [items, mounted]);

  const addItem = useCallback((sku: string) => {
    setItems((prev) => prev.includes(sku) ? prev : [...prev, sku]);
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((s) => s !== sku));
  }, []);

  const toggleItem = useCallback((sku: string) => {
    setItems((prev) => prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]);
  }, []);

  const isInWishlist = useCallback((sku: string) => items.includes(sku), [items]);

  const getShareUrl = useCallback(() => {
    const encoded = btoa(JSON.stringify(items));
    return `${window.location.origin}/shop?wishlist=${encoded}`;
  }, [items]);

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isInWishlist, getShareUrl, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist moet binnen WishlistProvider gebruikt worden');
  return ctx;
}
