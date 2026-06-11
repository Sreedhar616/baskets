import Image from "next/image";
import Link from "next/link";
import { formatINR, cn, displayPrice } from "@/lib/utils";
import type { Product } from "@/types/db";
import { AddToCartButton } from "./add-to-cart";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const image = product.images[0] ?? "/products/1.jpg";
  const price = displayPrice(product);
  const discount =
    product.comparePrice && product.comparePrice > price.amount
      ? Math.round(((product.comparePrice - price.amount) / product.comparePrice) * 100)
      : 0;

  return (
    <div
      className={cn(
        "group flex flex-col border border-border bg-sand transition-shadow hover:shadow-md",
        className
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-sand"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 bg-sale px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute right-2 top-2 bg-ink/85 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-cream">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {product.categoryName && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            {product.categoryName}
          </p>
        )}
        <Link href={`/products/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug hover:underline">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-bold">
            {price.from && <span className="text-[11px] font-normal text-ink-soft">From </span>}
            {formatINR(price.amount)}
          </span>
          {product.comparePrice && product.comparePrice > price.amount && (
            <span className="text-xs text-ink-soft line-through">
              {formatINR(product.comparePrice)}
            </span>
          )}
        </div>

        <div className="mt-3 pt-1">
          <AddToCartButton product={product} size="sm" className="w-full" />
        </div>
      </div>
    </div>
  );
}
