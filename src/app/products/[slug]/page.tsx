import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { getProductBySlug, getProducts, getSettings } from "@/lib/queries";
import { Gallery } from "@/components/product/gallery";
import { AddToCartButton } from "@/components/product/add-to-cart";
import { ProductCard } from "@/components/product/product-card";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatINR, whatsappLink } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([
    getSettings(),
    product.categorySlug
      ? getProducts({ categorySlug: product.categorySlug })
      : getProducts(),
  ]);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const waMsg = `Hi! I'm interested in "${product.name}" (${formatINR(product.price)}). Is it available?`;

  return (
    <div className="container-page py-8 md:py-12">
      <nav className="text-sm text-ink-soft">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-ink">Products</Link>
        {product.categorySlug && product.categoryName && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${product.categorySlug}`} className="hover:text-ink">
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <Gallery images={product.images} alt={product.name} />

        <div>
          {product.categoryName && <p className="eyebrow">{product.categoryName}</p>}
          <h1 className="mt-2 text-3xl md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold">{formatINR(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-ink-soft line-through">
                {formatINR(product.comparePrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-clay/10 px-2.5 py-1 text-sm font-medium text-clay">
                Save {discount}%
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-soft">Inclusive of all taxes</p>

          {product.description && (
            <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>
          )}

          <div className="mt-4 text-sm">
            {product.stock > 0 ? (
              <span className="text-sage-dark">
                {product.stock > 10 ? "In stock" : `Only ${product.stock} left`}
              </span>
            ) : (
              <span className="text-clay">Currently sold out</span>
            )}
          </div>

          <div className="mt-7">
            <AddToCartButton product={product} withQuantity />
          </div>

          <a
            href={whatsappLink(settings.contactPhone, waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sage-dark hover:underline"
          >
            <WhatsAppIcon size={16} /> Ask about this on WhatsApp
          </a>

          {/* Assurances */}
          <ul className="mt-8 grid gap-3 border-t border-border pt-6 text-sm text-ink-soft">
            <li className="flex items-center gap-3">
              <Truck size={18} className="text-clay" /> Free shipping on orders over ₹999
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-clay" /> Secure UPI, card & Cash on Delivery
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw size={18} className="text-clay" /> Handmade to order — slight variations are natural
            </li>
          </ul>
        </div>
      </div>

      {/* Related products */}
      {related.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {related
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
