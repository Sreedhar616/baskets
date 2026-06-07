"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";

/** Header cart icon with a live item-count badge. */
export function CartButton() {
  const count = useCart((s) => s.count());
  // Avoid hydration mismatch: render the badge only after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand transition-colors"
    >
      <ShoppingBag size={20} />
      {mounted && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[11px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
