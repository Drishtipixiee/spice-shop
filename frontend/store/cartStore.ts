import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/lib/api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  stock: number;
  image_url: string;
  category: string;
  description: string;
  is_featured: boolean;
  variant_id?: number;
  variant_label?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant | null, qty?: number) => void;
  addItem: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  removeItem: (id: string) => void;
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

      addToCart: (product, variant, qty = 1) => {
        const variantId = variant?.id;
        const key = variantId ? `${product.id}-${variantId}` : String(product.id);
        const price = variant?.price_inr ?? (product as any).price ?? 0;
        const stock = variant?.stock_qty ?? (product as any).stock ?? 99;

        set((state) => {
          const existing = state.items.find(i => i.id === key);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === key
                  ? { ...i, quantity: Math.min(i.quantity + qty, stock) }
                  : i
              )
            };
          }
          const newItem: CartItem = {
            id: key,
            name: product.name,
            price,
            mrp: variant?.mrp_inr,
            stock,
            image_url: product.image_url || '',
            category: product.category?.name || '',
            description: product.description || '',
            is_featured: product.is_featured,
            variant_id: variantId,
            variant_label: variant?.weight_label,
            quantity: qty,
          };
          return { items: [...state.items, newItem] };
        });
      },

      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return { items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
        }
        return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
      }),

      removeFromCart: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      removeItem: (id) => get().removeFromCart(id),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) return { items: state.items.filter(i => i.id !== id) };
        return { items: state.items.map(i => i.id === id ? { ...i, quantity } : i) };
      }),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => get().items.reduce((t, i) => t + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((c, i) => c + i.quantity, 0),
      getSubtotal: () => get().getTotalPrice(),
      getDeliveryCharge: () => get().getTotalPrice() >= 499 ? 0 : 40,
      getTotal: () => get().getTotalPrice() + get().getDeliveryCharge(),
    }),
    { name: 'masala-magic-cart' }
  )
);
