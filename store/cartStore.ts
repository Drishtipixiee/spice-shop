'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  variant_id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  variant_label: string;
  price: number;
  mrp: number;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variant_id: number) => void;
  updateQuantity: (variant_id: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryCharge: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: Omit<CartItem, 'quantity'>) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.variant_id === item.variant_id
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const newQty = existing.quantity + 1;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty > existing.stock ? existing.stock : newQty,
            };
            return { items: updatedItems };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (variant_id: number) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variant_id),
        }));
      },

      updateQuantity: (variant_id: number, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.variant_id !== variant_id),
            };
          }

          return {
            items: state.items.map((i) =>
              i.variant_id === variant_id
                ? { ...i, quantity: quantity > i.stock ? i.stock : quantity }
                : i
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getDeliveryCharge: () => {
        const subtotal = get().getSubtotal();
        return subtotal < 499 ? 40 : 0;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryCharge();
      },
    }),
    {
      name: 'spice-shop-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
