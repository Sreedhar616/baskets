import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getAllProducts } from "@/lib/admin-queries";
import { deleteProduct } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { StockToggle } from "@/components/admin/stock-toggle";
import { buttonClasses } from "@/components/ui/button";
import { formatINR, cn } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl">Products</h1>
        <Link href="/admin/products/new" className={buttonClasses("primary", "sm")}>
          <Plus size={16} /> New product
        </Link>
      </div>

      {!products.length ? (
        <p className="mt-6 text-ink-soft">No products yet. Add your first one.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {products.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-contain p-1" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-clay">
                  {p.name}
                </Link>
                <p className="text-sm text-ink-soft">
                  {p.categoryName ?? "Uncategorised"} · {formatINR(p.price)} ·{" "}
                  {p.stock > 0 ? "In stock" : "Out of stock"}
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                {p.stock <= 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Sold out
                  </span>
                )}
                {!p.isActive && <span className="rounded-full bg-sand px-2 py-0.5 text-xs">Hidden</span>}
                {p.isFeatured && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs">Featured</span>}
                <StockToggle id={p.id} stock={p.stock} />
                <Link href={`/admin/products/${p.id}`} className={cn(buttonClasses("ghost", "sm"), "px-3")}>Edit</Link>
                <DeleteButton id={p.id} action={deleteProduct} message="Delete this product?" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
