"use client";

import { useTransition } from "react";
import { Ban, RotateCcw, Loader2 } from "lucide-react";
import { setProductStock } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/** Stock applied when an admin marks a sold-out product "back in stock". */
const RESTOCK_DEFAULT = 10;

/**
 * One-click stock control for the admin products list.
 * - In stock  → "Mark out of stock" (sets stock to 0)
 * - Sold out  → "Back in stock"     (sets stock to RESTOCK_DEFAULT)
 * For an exact count, the admin still uses the product's Edit page.
 */
export function StockToggle({ id, stock }: { id: string; stock: number }) {
  const [pending, startTransition] = useTransition();
  const soldOut = stock <= 0;

  function toggle() {
    startTransition(async () => {
      await setProductStock(id, soldOut ? RESTOCK_DEFAULT : 0);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={soldOut ? `Set stock to ${RESTOCK_DEFAULT}` : "Set stock to 0"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
        soldOut
          ? "bg-sage/15 text-sage-dark hover:bg-sage/25"
          : "bg-sand text-ink-soft hover:bg-linen"
      )}
    >
      {pending ? (
        <Loader2 size={13} className="animate-spin" />
      ) : soldOut ? (
        <RotateCcw size={13} />
      ) : (
        <Ban size={13} />
      )}
      {pending ? "Saving…" : soldOut ? "Back in stock" : "Mark out of stock"}
    </button>
  );
}
