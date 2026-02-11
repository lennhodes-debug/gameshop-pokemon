import { Product } from './products';

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: 'cib';
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
