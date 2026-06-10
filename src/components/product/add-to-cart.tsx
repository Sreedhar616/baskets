"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { Button, buttonClasses } from "@/components/ui/button";
import type { Product, ProductSize } from "@/types/db";
import { cn, formatINR } from "@/lib/utils";

/**
 * Add-to-cart control. With `withQuantity` it shows a size picker (if the
 * product has sizes) plus a quantity stepper — used on the product page.
 * Without it, a single button is used on cards (adds the first size by default).
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
  const hasSizes = product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(
    hasSizes ? product.sizes[0] : null
  );
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(product, qty, selectedSize);
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

  // Card mode: single button. Adds the default (first) size when the product has them.
  if (!withQuantity) {
    return (
      <Button onClick={handleAdd} size={size} className={className}>
        {added ? <Check size={16} /> : <ShoppingBag size={16} />}
        {added ? "Added" : "Add to cart"}
      </Button>
    );
  }

  // Product page mode: optional size picker + quantity + add.
  return (
    <div className={cn("space-y-4", className)}>
      {hasSizes && (
        <div>
          <p className="mb-2 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  selectedSize?.label === s.label
                    ? "border-clay bg-clay/10 text-clay-dark"
                    : "border-ink/20 hover:bg-sand"
                )}
              >
                {s.label} · {formatINR(s.online)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => setQty((q) => q + 1)}
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
    </div>
  );
}
