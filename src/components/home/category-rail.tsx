import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/db";

/**
 * Horizontal side-scrolling category rail for the homepage.
 * Scroll-snaps on touch; hides its scrollbar via the global `.no-scrollbar`.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <div className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.slug}`}
          className="group relative w-40 shrink-0 snap-start overflow-hidden rounded-md sm:w-48"
        >
          <div className="relative aspect-[3/4] border border-border bg-white">
            <Image
              src={c.imageUrl ?? "/products/1.jpg"}
              alt={c.name}
              fill
              sizes="(min-width: 640px) 12rem, 10rem"
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-cream/95 px-3 py-2 text-center">
              <h3 className="text-sm font-medium leading-tight text-ink">
                {c.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
