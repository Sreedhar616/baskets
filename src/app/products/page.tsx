import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse all handmade baskets and bags by D's Designs.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category, search: q }),
  ]);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">The collection</p>
        <h1 className="mt-2 text-3xl md:text-4xl">All Products</h1>
        <p className="mt-2 text-ink-soft">
          Handwoven baskets and bags, crafted to order across nine signature styles.
        </p>
      </header>

      {/* Category filter chips */}
      <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/products"
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
            !category
              ? "border-ink bg-ink text-cream"
              : "border-border hover:bg-sand"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
              category === c.slug
                ? "border-ink bg-ink text-cream"
                : "border-border hover:bg-sand"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-ink-soft">
          No products found{q ? ` for “${q}”` : ""}. Try another category.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
