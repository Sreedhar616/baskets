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
          className="group relative w-40 shrink-0 snap-start overflow-hidden rounded-2xl sm:w-48"
        >
          <div className="relative aspect-[3/4] bg-sand">
            <Image
              src={c.imageUrl ?? "/products/1.jpg"}
              alt={c.name}
              fill
              sizes="(min-width: 640px) 12rem, 10rem"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-3">
              <h3 className="font-display text-base leading-tight text-cream sm:text-lg">
                {c.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
