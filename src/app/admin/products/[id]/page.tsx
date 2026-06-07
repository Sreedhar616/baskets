import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getProductById } from "@/lib/admin-queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getAllCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-clay hover:underline">← Products</Link>
      <h1 className="mt-2 text-3xl">Edit product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
