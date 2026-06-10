"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

/** Header search: expands an input, submits to /products?q=... */
export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) {
      router.push(`/products?q=${encodeURIComponent(term)}`);
      setOpen(false);
      setQ("");
    }
  }

  if (!open) {
    return (
      <button
        aria-label="Search products"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand"
      >
        <Search size={20} />
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-1">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        className="h-10 w-40 rounded-full border border-border bg-cream px-4 text-sm outline-none focus:border-clay md:w-56"
      />
      <button
        type="button"
        aria-label="Close search"
        onClick={() => { setOpen(false); setQ(""); }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand"
      >
        <X size={18} />
      </button>
    </form>
  );
}
