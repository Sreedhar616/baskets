import Link from "next/link";
import { getAllCategories } from "@/lib/admin-queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-clay hover:underline">← Products</Link>
      <h1 className="mt-2 text-3xl">New product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
