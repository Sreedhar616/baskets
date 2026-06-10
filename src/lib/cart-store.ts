"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, PaymentMethod, Product, ProductSize } from "@/types/db";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: ProductSize | null) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  /** total number of units in the cart */
  count: () => number;
  /** subtotal in paise for a payment method (display only — re-priced server-side) */
  subtotalFor: (method: PaymentMethod) => number;
}

/** Cart line key: product id, plus the chosen size label when there is one. */
function lineKey(productId: string, size: string | null): string {
  return size ? `${productId}__${size}` : productId;
}

/** Unit price (paise) for an item under a given payment method. */
export function unitPriceFor(item: CartItem, method: PaymentMethod): number {
  return method === "cod" ? item.cod : item.online;
}

/**
 * Guest-friendly cart held entirely client-side and persisted to localStorage.
 * Stores both the online and COD price per line; the displayed total depends on
 * the payment method chosen at checkout. The checkout API re-fetches the
 * authoritative price (per size + method) from the database before charging.
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, size = null) =>
        set((state) => {
          const sizeLabel = size?.label ?? null;
          const online = size ? size.online : product.price;
          const cod = size ? size.cod : product.codPrice;
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
            online,
            cod,
            image: product.images[0] ?? null,
            quantity,
          };
          return { items: [...state.items, item] };
        }),

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i))
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((n, i) => n + i.quantity, 0),

      subtotalFor: (method) =>
        get().items.reduce((sum, i) => sum + unitPriceFor(i, method) * i.quantity, 0),
    }),
    { name: "dsdesigns-cart-v3" }
  )
);
