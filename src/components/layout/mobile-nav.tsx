"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/db";

/** Mobile slide-out navigation. */
export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal target is only available on the client.
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand md:hidden"
      >
        <Menu size={22} />
      </button>

      {/*
        Render the overlay + panel through a portal to <body>. The header is
        wrapped in a `backdrop-blur` element, whose backdrop-filter establishes
        a containing block for fixed-position descendants — leaving them trapped
        inside the header strip instead of covering the viewport.
      */}
      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className={cn(
                "fixed inset-0 z-[100] bg-ink/40 transition-opacity md:hidden",
                open ? "opacity-100" : "pointer-events-none opacity-0"
              )}
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-[101] flex w-80 max-w-[85%] flex-col overflow-y-auto bg-cream p-6 shadow-xl transition-transform md:hidden",
                open ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl">Menu</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-1" onClick={() => setOpen(false)}>
                <Link href="/products" className="rounded-lg px-3 py-3 text-base hover:bg-sand">
                  All Products
                </Link>
                <Link href="/happy-customers" className="rounded-lg px-3 py-3 text-base hover:bg-sand">
                  Happy Customers
                </Link>
                <Link href="/#reviews" className="rounded-lg px-3 py-3 text-base hover:bg-sand">
                  Reviews
                </Link>

                <p className="eyebrow mt-5 px-3">Categories</p>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-sand hover:text-ink"
                  >
                    {c.name}
                  </Link>
                ))}

                <Link href="/account" className="mt-5 rounded-lg px-3 py-3 text-base hover:bg-sand">
                  My Account
                </Link>
              </nav>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}
