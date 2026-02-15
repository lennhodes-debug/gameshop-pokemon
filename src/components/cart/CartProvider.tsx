'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import { Product, getEffectivePrice } from '@/lib/products';
import { CartItem } from '@/lib/cart';

function parseCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is CartItem =>
      typeof item === 'object' &&
      item !== null &&
      'product' in item &&
      typeof item.product === 'object' &&
      item.product !== null &&
      typeof (item.product as Record<string, unknown>).sku === 'string' &&
      typeof (item.product as Record<string, unknown>).name === 'string' &&
      typeof (item.product as Record<string, unknown>).price === 'number' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      item.quantity <= 10 &&
      (item.variant === undefined || item.variant === 'cib'),
  );
}

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

interface DiscountState {
  code: string;
  percentage: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: 'cib') => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  discount: DiscountState | null;
  discountAmount: number;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
}

const MAX_QUANTITY = 10;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [discount, setDiscount] = useState<DiscountState | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('gameshop-cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parseCartItems(parsed));
      } catch {
        localStorage.removeItem('gameshop-cart');
      }
    }
    const storedDiscount = localStorage.getItem('gameshop-discount');
    if (storedDiscount) {
      try {
        const parsed = JSON.parse(storedDiscount) as DiscountState;
        if (typeof parsed.code === 'string' && typeof parsed.percentage === 'number') {
          setDiscount(parsed);
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
        if (discount) {
          localStorage.setItem('gameshop-discount', JSON.stringify(discount));
        } else {
          localStorage.removeItem('gameshop-discount');
        }
      } catch {
        // ignore
      }
    }
  }, [discount, mounted]);

  const addItem = useCallback((product: Product, variant?: 'cib') => {
    setItems((prev) => {
      const key = variant ? `${product.sku}:${variant}` : product.sku;
      const existing = prev.find((item) => cartKey(item) === key);
      if (existing) {
        if (existing.quantity >= MAX_QUANTITY) return prev;
        return prev.map((item) =>
          cartKey(item) === key
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item,
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
      prev.map((item) => (cartKey(item) === key ? { ...item, quantity: clamped } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscount(null);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (!discount) return 0;
    const subtotal = getSubtotal();
    return Math.round(subtotal * (discount.percentage / 100) * 100) / 100;
  }, [discount, getSubtotal]);

  const getTotal = useCallback(() => {
    return Math.max(0, getSubtotal() - discountAmount);
  }, [getSubtotal, discountAmount]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const applyDiscount = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await fetch('/api/discount/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim() }),
        });

        const data = (await response.json()) as {
          success?: boolean;
          message?: string;
          discount?: number;
          code?: string;
        };

        if (data.success && data.discount !== undefined && data.code) {
          setDiscount({ code: data.code, percentage: data.discount });
          return { success: true, message: data.message || `${data.discount}% korting toegepast!` };
        }

        return { success: false, message: data.message || 'Ongeldige kortingscode' };
      } catch {
        return { success: false, message: 'Er ging iets mis. Probeer het opnieuw.' };
      }
    },
    [],
  );

  const removeDiscount = useCallback(() => {
    setDiscount(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getSubtotal,
      getTotal,
      getItemCount,
      discount,
      discountAmount,
      applyDiscount,
      removeDiscount,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getSubtotal,
      getTotal,
      getItemCount,
      discount,
      discountAmount,
      applyDiscount,
      removeDiscount,
    ],
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
