import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/api';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product) => void;
  addItem: (product: any) => void; // Alias for legacy code
  removeFromCart: (id: string) => void;
  removeItem: (id: string) => void; // Alias
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryCharge: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => set((state) => {
        const existingItem = state.items.find(item => item.id === product.id);
        if (existingItem) {
          return { items: state.items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
        }
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }),
      addItem: (product) => get().addToCart(product),
      removeFromCart: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      removeItem: (id) => get().removeFromCart(id),
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) return { items: state.items.filter(item => item.id !== id) };
        return { items: state.items.map(item => item.id === id ? { ...item, quantity } : item) };
      }),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
      getSubtotal: () => get().getTotalPrice(),
      getDeliveryCharge: () => get().getTotalPrice() > 499 ? 0 : 40,
      getTotal: () => get().getTotalPrice() + get().getDeliveryCharge(),
    }),
    {
      name: 'masala-magic-cart',
    }
  )
);
