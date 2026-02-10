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

const DISCOUNT_CODES: Record<string, DiscountCode> = {
  'WELKOM10': { type: 'percentage', value: 10, description: '10% korting' },
  'RETRO5': { type: 'fixed', value: 5, minOrder: 30, description: '€5 korting bij bestelling vanaf €30' },
  'NINTENDO15': { type: 'percentage', value: 15, minOrder: 75, description: '15% korting bij bestelling vanaf €75' },
  'GAMESHOP20': { type: 'percentage', value: 20, minOrder: 100, description: '20% korting bij bestelling vanaf €100' },
};

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  discountCode: string | null;
  discountAmount: number;
  discountDescription: string | null;
  applyDiscount: (code: string) => { success: boolean; message: string };
  removeDiscount: () => void;
}

const MAX_QUANTITY = 10;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

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
        const code = JSON.parse(storedDiscount);
        if (typeof code === 'string' && DISCOUNT_CODES[code.toUpperCase()]) {
          setDiscountCode(code.toUpperCase());
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
          localStorage.setItem('gameshop-discount', JSON.stringify(discountCode));
        } else {
          localStorage.removeItem('gameshop-discount');
        }
      } catch {
        // ignore
      }
    }
  }, [discountCode, mounted]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        if (existing.quantity >= MAX_QUANTITY) return prev;
        return prev.map((item) =>
          item.product.sku === product.sku
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Combo Multiplier event
    window.dispatchEvent(new CustomEvent('gameshop:add-to-cart'));
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((item) => item.product.sku !== sku));
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.sku !== sku));
      return;
    }
    const clamped = Math.min(quantity, MAX_QUANTITY);
    setItems((prev) =>
      prev.map((item) =>
        item.product.sku === sku ? { ...item, quantity: clamped } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountCode(null);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + getEffectivePrice(item.product) * item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (!discountCode) return 0;
    const code = DISCOUNT_CODES[discountCode];
    if (!code) return 0;
    const subtotal = getSubtotal();
    if (code.minOrder && subtotal < code.minOrder) return 0;
    if (code.type === 'percentage') {
      return Math.round(subtotal * (code.value / 100) * 100) / 100;
    }
    return Math.min(code.value, subtotal);
  }, [discountCode, getSubtotal]);

  const discountDescription = useMemo(() => {
    if (!discountCode) return null;
    return DISCOUNT_CODES[discountCode]?.description || null;
  }, [discountCode]);

  const getTotal = useCallback(() => {
    return Math.max(0, getSubtotal() - discountAmount);
  }, [getSubtotal, discountAmount]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const applyDiscount = useCallback((code: string): { success: boolean; message: string } => {
    const normalized = code.trim().toUpperCase();
    const discount = DISCOUNT_CODES[normalized];
    if (!discount) {
      return { success: false, message: 'Ongeldige kortingscode' };
    }
    const subtotal = getSubtotal();
    if (discount.minOrder && subtotal < discount.minOrder) {
      return { success: false, message: `Minimale bestelling van €${discount.minOrder} vereist` };
    }
    setDiscountCode(normalized);
    return { success: true, message: `${discount.description} toegepast!` };
  }, [getSubtotal]);

  const removeDiscount = useCallback(() => {
    setDiscountCode(null);
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
