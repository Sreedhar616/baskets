"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { Button, buttonClasses } from "@/components/ui/button";
import type { Product } from "@/types/db";
import { cn } from "@/lib/utils";

/**
 * Add-to-cart control. With `withQuantity` it shows a quantity stepper
 * (used on the product page); otherwise a single button (used on cards).
 */
export function AddToCartButton({
  product,
  withQuantity = false,
  size = "md",
  className,
}: {
  product: Product;
  withQuantity?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (soldOut) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        Sold out
      </Button>
    );
  }

  if (!withQuantity) {
    return (
      <Button onClick={handleAdd} size={size} className={className}>
        {added ? <Check size={16} /> : <ShoppingBag size={16} />}
        {added ? "Added" : "Add to cart"}
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center rounded-full border border-ink/20">
        <button
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <button
          aria-label="Increase quantity"
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand"
        >
          <Plus size={16} />
        </button>
      </div>

      <button onClick={handleAdd} className={buttonClasses("primary", "lg", "flex-1 min-w-40")}>
        {added ? <Check size={18} /> : <ShoppingBag size={18} />}
        {added ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
