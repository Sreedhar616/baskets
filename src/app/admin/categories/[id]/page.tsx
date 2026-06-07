import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories } from "@/lib/admin-queries";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  return (
    <div>
      <Link href="/admin/categories" className="text-sm text-clay hover:underline">← Categories</Link>
      <h1 className="mt-2 text-3xl">Edit category</h1>
      <div className="mt-6">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
