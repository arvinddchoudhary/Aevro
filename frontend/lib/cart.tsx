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
  itemKey: string;
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  selectedColor?: string;
  selectedSize?: string;
  priceInPaise: number;
  imageUrl?: string;
  imageAltText?: string | null;
  categoryName?: string;
  stock: number;
  quantity: number;
};

export type AddToCartSelection = {
  variantId?: string;
  selectedColor?: string;
  selectedSize?: string;
  stock?: number;
  imageUrl?: string;
  imageAltText?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalInPaise: number;
  addProduct: (
    product: Product,
    selection?: AddToCartSelection,
    quantity?: number,
  ) => boolean;
  incrementItem: (itemKey: string) => void;
  decrementItem: (itemKey: string) => void;
  removeItem: (itemKey: string) => void;
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

    return parsed
      .filter((item) => item.productId && item.quantity > 0)
      .map((item) => ({
        ...item,
        itemKey: item.itemKey ?? item.productId,
      }));
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
    const addProduct = (
      product: Product,
      selection: AddToCartSelection = {},
      quantity = 1,
    ) => {
      const stock = selection.stock ?? product.stock;
      const itemKey = `${product.id}:${selection.variantId ?? 'default'}`;

      if (product.status !== 'ACTIVE' || stock <= 0) {
        return false;
      }

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.itemKey === itemKey);
        const requestedQuantity = normalizeQuantity(quantity, stock);

        if (existingItem) {
          return currentItems.map((item) =>
            item.itemKey === itemKey
              ? {
                  ...item,
                  stock,
                  quantity: normalizeQuantity(
                    item.quantity + requestedQuantity,
                    stock,
                  ),
                }
              : item,
          );
        }

        const primaryImage = product.primaryImage ?? product.images[0];

        return [
          ...currentItems,
          {
            itemKey,
            productId: product.id,
            variantId: selection.variantId,
            slug: product.slug,
            name: product.name,
            selectedColor: selection.selectedColor,
            selectedSize: selection.selectedSize,
            priceInPaise: product.priceInPaise,
            imageUrl: selection.imageUrl ?? primaryImage?.url,
            imageAltText: selection.imageAltText ?? primaryImage?.altText,
            categoryName: product.category?.name,
            stock,
            quantity: requestedQuantity,
          },
        ];
      });

      return true;
    };

    const incrementItem = (itemKey: string) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.itemKey === itemKey
            ? {
                ...item,
                quantity: normalizeQuantity(item.quantity + 1, item.stock),
              }
            : item,
        ),
      );
    };

    const decrementItem = (itemKey: string) => {
      setItems((currentItems) =>
        currentItems
          .map((item) =>
            item.itemKey === itemKey
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    };

    const removeItem = (itemKey: string) => {
      setItems((currentItems) =>
        currentItems.filter((item) => item.itemKey !== itemKey),
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
