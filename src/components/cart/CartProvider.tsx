'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Product, getEffectivePrice } from '@/lib/products';
import { CartItem } from '@/lib/cart';

interface DiscountCode {
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  description: string;
}

// Statische kortingscodes geobfusceerd — niet direct leesbaar in broncode
const _d = (s: string) => atob(s);
const STATIC_CODES: Record<string, DiscountCode> = {};
[
  { k: 'V0VMS09NMTA=', type: 'percentage' as const, value: 10, description: '10% korting' },
  { k: 'UkVUUk81', type: 'fixed' as const, value: 5, minOrder: 30, description: '€5 korting bij bestelling vanaf €30' },
  { k: 'TklOVEVORE8xNQ==', type: 'percentage' as const, value: 15, minOrder: 75, description: '15% korting bij bestelling vanaf €75' },
  { k: 'R0FNRVNIT1AyMA==', type: 'percentage' as const, value: 20, minOrder: 100, description: '20% korting bij bestelling vanaf €100' },
].forEach(({ k, ...rest }) => {
  try { STATIC_CODES[_d(k).trim()] = rest; } catch { /* ignore */ }
});

function cartKey(item: CartItem): string {
  return item.variant ? `${item.product.sku}:${item.variant}` : item.product.sku;
}

export function getCartItemPrice(item: CartItem): number {
  if (item.variant === 'cib' && item.product.cibPrice) {
    return item.product.cibPrice;
  }
  return getEffectivePrice(item.product);
}

export function getCartItemImage(item: CartItem): string | null | undefined {
  if (item.variant === 'cib' && item.product.cibImage) {
    return item.product.cibImage;
  }
  return item.product.image;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: 'cib') => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  discountCode: string | null;
  discountAmount: number;
  discountDescription: string | null;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
}

const MAX_QUANTITY = 10;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [dynamicDiscount, setDynamicDiscount] = useState<DiscountCode | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('gameshop-cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        // ignore invalid data
      }
    }
    const storedDiscount = localStorage.getItem('gameshop-discount');
    if (storedDiscount) {
      try {
        const saved = JSON.parse(storedDiscount);
        if (typeof saved === 'string') {
          // Statische code
          if (STATIC_CODES[saved.toUpperCase()]) {
            setDiscountCode(saved.toUpperCase());
          }
        } else if (saved && typeof saved === 'object' && saved.code) {
          // Dynamische nieuwsbriefcode
          setDiscountCode(saved.code);
          setDynamicDiscount(saved.discount);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('gameshop-cart', JSON.stringify(items));
      } catch {
        // localStorage vol of niet beschikbaar
      }
    }
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) {
      try {
        if (discountCode) {
          if (dynamicDiscount) {
            localStorage.setItem('gameshop-discount', JSON.stringify({ code: discountCode, discount: dynamicDiscount }));
          } else {
            localStorage.setItem('gameshop-discount', JSON.stringify(discountCode));
          }
        } else {
          localStorage.removeItem('gameshop-discount');
        }
      } catch {
        // ignore
      }
    }
  }, [discountCode, dynamicDiscount, mounted]);

  const addItem = useCallback((product: Product, variant?: 'cib') => {
    setItems((prev) => {
      const key = variant ? `${product.sku}:${variant}` : product.sku;
      const existing = prev.find((item) => cartKey(item) === key);
      if (existing) {
        if (existing.quantity >= MAX_QUANTITY) return prev;
        return prev.map((item) =>
          cartKey(item) === key
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item
        );
      }
      return [...prev, { product, quantity: 1, variant }];
    });
    window.dispatchEvent(new CustomEvent('gameshop:add-to-cart'));
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => cartKey(item) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => cartKey(item) !== key));
      return;
    }
    const clamped = Math.min(quantity, MAX_QUANTITY);
    setItems((prev) =>
      prev.map((item) =>
        cartKey(item) === key ? { ...item, quantity: clamped } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountCode(null);
    setDynamicDiscount(null);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0);
  }, [items]);

  // Haal de actieve discount op: statisch of dynamisch
  const activeDiscount = useMemo((): DiscountCode | null => {
    if (!discountCode) return null;
    if (dynamicDiscount) return dynamicDiscount;
    return STATIC_CODES[discountCode] || null;
  }, [discountCode, dynamicDiscount]);

  const discountAmount = useMemo(() => {
    if (!activeDiscount) return 0;
    const subtotal = getSubtotal();
    if (activeDiscount.minOrder && subtotal < activeDiscount.minOrder) return 0;
    if (activeDiscount.type === 'percentage') {
      return Math.round(subtotal * (activeDiscount.value / 100) * 100) / 100;
    }
    return Math.min(activeDiscount.value, subtotal);
  }, [activeDiscount, getSubtotal]);

  const discountDescription = useMemo(() => {
    return activeDiscount?.description || null;
  }, [activeDiscount]);

  const getTotal = useCallback(() => {
    return Math.max(0, getSubtotal() - discountAmount);
  }, [getSubtotal, discountAmount]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const applyDiscount = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    const normalized = code.trim().toUpperCase();

    // 1. Check statische codes (client-side, instant)
    const staticDiscount = STATIC_CODES[normalized];
    if (staticDiscount) {
      const subtotal = getSubtotal();
      if (staticDiscount.minOrder && subtotal < staticDiscount.minOrder) {
        return { success: false, message: `Minimale bestelling van €${staticDiscount.minOrder} vereist` };
      }
      setDiscountCode(normalized);
      setDynamicDiscount(null);
      return { success: true, message: `${staticDiscount.description} toegepast!` };
    }

    // 2. Check dynamische nieuwsbriefcodes (server-side)
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalized }),
      });
      const data = await res.json();

      if (data.valid) {
        setDiscountCode(normalized);
        setDynamicDiscount({
          type: data.type,
          value: data.value,
          description: data.description,
        });
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || 'Ongeldige kortingscode' };
    } catch {
      return { success: false, message: 'Kon code niet valideren, probeer het opnieuw' };
    }
  }, [getSubtotal]);

  const removeDiscount = useCallback(() => {
    setDiscountCode(null);
    setDynamicDiscount(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      items, addItem, removeItem, updateQuantity, clearCart,
      getTotal, getItemCount,
      discountCode, discountAmount, discountDescription,
      applyDiscount, removeDiscount,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart,
     getTotal, getItemCount,
     discountCode, discountAmount, discountDescription,
     applyDiscount, removeDiscount]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
