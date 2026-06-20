'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Product } from '../types/catalog';

const CART_STORAGE_KEY = 'aevro.cart.v1';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceInPaise: number;
  imageUrl?: string;
  imageAltText?: string | null;
  categoryName?: string;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalInPaise: number;
  addProduct: (product: Product, quantity?: number) => boolean;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function normalizeQuantity(quantity: number, stock: number) {
  return Math.max(1, Math.min(quantity, Math.max(stock, 0)));
}

function readStoredCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      return [];
    }

    const parsed = JSON.parse(rawCart) as CartItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => item.productId && item.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [hasLoaded, items]);

  const value = useMemo<CartContextValue>(() => {
    const addProduct = (product: Product, quantity = 1) => {
      if (product.status !== 'ACTIVE' || product.stock <= 0) {
        return false;
      }

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.productId === product.id);
        const requestedQuantity = normalizeQuantity(quantity, product.stock);

        if (existingItem) {
          return currentItems.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  stock: product.stock,
                  quantity: normalizeQuantity(
                    item.quantity + requestedQuantity,
                    product.stock,
                  ),
                }
              : item,
          );
        }

        const primaryImage = product.images[0];

        return [
          ...currentItems,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceInPaise: product.priceInPaise,
            imageUrl: primaryImage?.url,
            imageAltText: primaryImage?.altText,
            categoryName: product.category?.name,
            stock: product.stock,
            quantity: requestedQuantity,
          },
        ];
      });

      return true;
    };

    const incrementItem = (productId: string) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: normalizeQuantity(item.quantity + 1, item.stock),
              }
            : item,
        ),
      );
    };

    const decrementItem = (productId: string) => {
      setItems((currentItems) =>
        currentItems
          .map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    };

    const removeItem = (productId: string) => {
      setItems((currentItems) =>
        currentItems.filter((item) => item.productId !== productId),
      );
    };

    const clearCart = () => {
      setItems([]);
    };

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotalInPaise = items.reduce(
      (total, item) => total + item.priceInPaise * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotalInPaise,
      addProduct,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
