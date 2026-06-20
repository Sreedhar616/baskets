"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Header search: always shows full input on mobile, compact on desktop */
export function SearchBox() {
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input") as HTMLInputElement;
    const term = input?.value.trim();
    if (term) {
      router.push(`/products?q=${encodeURIComponent(term)}`);
      input.value = "";
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-3 text-ink-soft pointer-events-none" />
        <input
          placeholder="Search products…"
          className="w-full h-10 rounded-full border border-border bg-cream pl-10 pr-4 text-sm outline-none focus:border-clay"
        />
      </div>
    </form>
  );
}
