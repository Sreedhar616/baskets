import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <Link href="/admin/categories" className="text-sm text-clay hover:underline">← Categories</Link>
      <h1 className="mt-2 text-3xl">New category</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
