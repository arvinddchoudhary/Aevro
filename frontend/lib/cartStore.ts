'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    color?: string,
    size?: string
  ) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  totalItems: () => number;
  totalInPaise: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === newItem.productId &&
              i.selectedColor === newItem.selectedColor &&
              i.selectedSize === newItem.selectedSize
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += newItem.quantity;
            return { items: updated };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (productId, color, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.selectedColor === color &&
                i.selectedSize === size
              )
          ),
        })),

      updateQuantity: (productId, quantity, color, size) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.selectedColor === color &&
            i.selectedSize === size
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalInPaise: () =>
        get().items.reduce((sum, i) => sum + i.priceInPaise * i.quantity, 0),
    }),
    { name: 'aevro-cart' }
  )
);
