"use client";

import { useTransition } from "react";
import { Check, Ban, Loader2 } from "lucide-react";
import { setProductStock } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/**
 * One-click availability switch for the admin products list.
 * In stock ↔ Out of stock. No unit counting — it's a simple on/off.
 */
export function StockToggle({ id, stock }: { id: string; stock: number }) {
  const [pending, startTransition] = useTransition();
  const inStock = stock > 0;

  function toggle() {
    startTransition(async () => {
      await setProductStock(id, inStock ? 0 : 1);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={inStock ? "Mark as out of stock" : "Mark as in stock"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
        inStock
          ? "bg-sand text-ink-soft hover:bg-linen"
          : "bg-sage/15 text-sage-dark hover:bg-sage/25"
      )}
    >
      {pending ? (
        <Loader2 size={13} className="animate-spin" />
      ) : inStock ? (
        <Ban size={13} />
      ) : (
        <Check size={13} />
      )}
      {pending ? "Saving…" : inStock ? "Mark out of stock" : "Mark in stock"}
    </button>
  );
}
