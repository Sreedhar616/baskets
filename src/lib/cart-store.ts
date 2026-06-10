"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductSize } from "@/types/db";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: ProductSize | null) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  /** total number of units in the cart */
  count: () => number;
  /** subtotal in paise (display only — re-priced server-side at checkout) */
  subtotal: () => number;
}

/** Cart line key: product id, plus the chosen size label when there is one. */
function lineKey(productId: string, size: string | null): string {
  return size ? `${productId}__${size}` : productId;
}

/**
 * Guest-friendly cart held entirely client-side and persisted to localStorage.
 * Prices here are for display only; the checkout API re-fetches authoritative
 * prices (including the per-size price) from the database before charging.
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, size = null) =>
        set((state) => {
          const sizeLabel = size?.label ?? null;
          const unitPrice = size ? size.price : product.price;
          const key = lineKey(product.id, sizeLabel);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          const item: CartItem = {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            size: sizeLabel,
            price: unitPrice,
            image: product.images[0] ?? null,
            quantity,
            stock: product.stock,
          };
          return { items: [...state.items, item] };
        }),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
        })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((n, i) => n + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "dsdesigns-cart-v2" }
  )
);
