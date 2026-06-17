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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand transition-colors"
      >
        <Search size={18} />
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-1">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search…"
        className="h-9 px-4 rounded-full border border-linen bg-cream text-sm outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-all w-32 md:w-48"
      />
      <button
        type="button"
        aria-label="Close search"
        onClick={() => { setOpen(false); setQ(""); }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand transition-colors"
      >
        <X size={16} />
      </button>
    </form>
  );
}
