import Image from "next/image";
import Link from "next/link";
import { formatINR, cn } from "@/lib/utils";
import type { Product } from "@/types/db";
import { AddToCartButton } from "./add-to-cart";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const image = product.images[0] ?? "/products/1.jpg";
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  return (
    <div className={cn("group flex flex-col", className)}>
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-sand"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {discount}% off
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-cream">
            Sold out
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {product.categoryName && (
          <p className="text-xs text-ink-soft">{product.categoryName}</p>
        )}
        <Link href={`/products/${product.slug}`} className="mt-0.5">
          <h3 className="font-display text-lg leading-snug hover:text-clay">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-semibold">{formatINR(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-ink-soft line-through">
              {formatINR(product.comparePrice)}
            </span>
          )}
        </div>

        <div className="mt-3">
          <AddToCartButton product={product} size="sm" className="w-full" />
        </div>
      </div>
    </div>
  );
}
