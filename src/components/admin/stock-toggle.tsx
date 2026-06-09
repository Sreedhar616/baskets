"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Ban, Loader2, Pencil } from "lucide-react";
import { setProductStock } from "@/app/admin/actions";

/**
 * Stock control for the admin products list.
 * - In stock → one-click "Mark out of stock" (sets stock to 0).
 * - Sold out → "Restock" link to the Edit page, where the admin types the real
 *   count (we never guess a number for them).
 */
export function StockToggle({ id, stock }: { id: string; stock: number }) {
  const [pending, startTransition] = useTransition();

  if (stock <= 0) {
    return (
      <Link
        href={`/admin/products/${id}`}
        className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1.5 text-xs font-medium text-sage-dark hover:bg-sage/25"
      >
        <Pencil size={13} /> Restock
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => startTransition(async () => { await setProductStock(id, 0); })}
      disabled={pending}
      title="Set stock to 0"
      className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-linen disabled:opacity-50"
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
      {pending ? "Saving…" : "Mark out of stock"}
    </button>
  );
}
