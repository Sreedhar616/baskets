import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} by D's Designs.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: slug }),
    getCategories(),
  ]);

  return (
    <div className="container-page py-10 md:py-14">
      <nav className="text-sm text-ink-soft">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-ink">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{category.name}</span>
      </nav>

      <header className="mt-4 max-w-2xl">
        <h1 className="text-3xl md:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-ink-soft">{category.description}</p>
        )}
      </header>

      {products.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border bg-sand p-10 text-center">
          <p className="text-ink-soft">No products in this category yet.</p>
          <Link href="/products" className="mt-3 inline-block text-clay hover:underline">
            Browse all products →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Other categories */}
      <div className="mt-16">
        <p className="eyebrow">Explore more</p>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="shrink-0 rounded-full border border-border px-4 py-2 text-sm hover:bg-sand"
              >
                {c.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
