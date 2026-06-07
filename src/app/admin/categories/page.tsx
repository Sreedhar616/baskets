import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getAllCategories } from "@/lib/admin-queries";
import { deleteCategory } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { buttonClasses, } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Categories</h1>
        <Link href="/admin/categories/new" className={buttonClasses("primary", "sm")}>
          <Plus size={16} /> New category
        </Link>
      </div>

      {!categories.length ? (
        <p className="mt-6 text-ink-soft">No categories yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-4 py-3">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                {c.imageUrl && <Image src={c.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/categories/${c.id}`} className="font-medium hover:text-clay">{c.name}</Link>
                <p className="text-sm text-ink-soft">/{c.slug}</p>
              </div>
              {!c.isActive && <span className="rounded-full bg-sand px-2 py-0.5 text-xs">Hidden</span>}
              <Link href={`/admin/categories/${c.id}`} className={cn(buttonClasses("ghost", "sm"), "px-3")}>Edit</Link>
              <DeleteButton id={c.id} action={deleteCategory} message="Delete this category?" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
