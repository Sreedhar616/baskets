"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { buttonClasses } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { computeTotals, amountToFreeShipping } from "@/lib/pricing";
import type { SiteSettings } from "@/types/db";
import { useEffect, useState } from "react";

export function CartView({ settings }: { settings: SiteSettings }) {
  const { items, setQuantity, removeItem } = useCart();
  const subtotal = useCart((s) => s.subtotal());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="container-page py-20 text-center text-ink-soft">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <ShoppingBag className="mx-auto text-border" size={56} />
        <h1 className="mt-4 text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Add some handmade pieces to get started.</p>
        <Link href="/products" className={buttonClasses("primary", "lg", "mt-6")}>
          Shop the collection
        </Link>
      </div>
    );
  }

  const totals = computeTotals(subtotal, settings);
  const toFree = amountToFreeShipping(subtotal, settings);

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-3xl md:text-4xl">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-5">
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sand"
              >
                <Image
                  src={item.image ?? "/products/1.jpg"}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link href={`/products/${item.slug}`} className="font-display text-lg leading-snug hover:text-clay">
                    {item.name}
                    {item.size && (
                      <span className="ml-2 align-middle text-sm font-sans text-ink-soft">
                        ({item.size})
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label="Remove"
                    className="text-ink-soft hover:text-clay"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{formatINR(item.price)} each</p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-ink/20">
                    <button
                      aria-label="Decrease"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      aria-label="Increase"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-sand p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl">Order summary</h2>

          {toFree > 0 && (
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm text-ink-soft">
              Add <strong>{formatINR(toFree)}</strong> more for free shipping!
            </p>
          )}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd>{formatINR(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Shipping</dt>
              <dd>{totals.shippingFee === 0 ? "Free" : formatINR(totals.shippingFee)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(totals.total)}</dd>
            </div>
          </dl>

          <Link href="/checkout" className={buttonClasses("primary", "lg", "mt-6 w-full")}>
            Proceed to checkout
          </Link>
          <Link href="/products" className="mt-3 block text-center text-sm text-clay hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
