'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/products';
import { CartItem } from '@/lib/cart';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

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

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
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
    setItems((prev) =>
      prev.map((item) =>
        item.product.sku === sku ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const contextValue = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount }),
    [items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount]
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
