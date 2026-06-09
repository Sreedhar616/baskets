"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveCategory, type CategoryInput } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/db";

const FIELD = "w-full rounded-xl border border-border bg-cream px-4 py-2.5 text-sm outline-none focus:border-clay";
const LABEL = "block text-sm font-medium mb-1.5";

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(category?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Reset every field back to the category's saved values (or blank for a new category). */
  function handleDiscard() {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setImageUrl(category?.imageUrl ?? null);
    setError(null);
    formRef.current?.reset();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `categories/${slugify(name) || "category"}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      setImageUrl(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input: CategoryInput = {
      id: category?.id,
      name: String(fd.get("name")),
      slug: slugify(String(fd.get("slug")) || String(fd.get("name"))),
      description: String(fd.get("description") || ""),
      imageUrl,
      sortOrder: Number(fd.get("sortOrder") || 0),
      isActive: fd.get("isActive") === "on",
    };
    try {
      await saveCategory(input);
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className={LABEL}>Name</label>
        <input name="name" required className={FIELD} value={name} onChange={(e) => { setName(e.target.value); if (!category) setSlug(slugify(e.target.value)); }} />
      </div>
      <div>
        <label className={LABEL}>Slug (URL)</label>
        <input name="slug" className={FIELD} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>
      <div>
        <label className={LABEL}>Description</label>
        <textarea name="description" rows={3} className={FIELD} defaultValue={category?.description ?? ""} />
      </div>
      <div>
        <label className={LABEL}>Image</label>
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative h-24 w-32 overflow-hidden rounded-xl bg-sand">
              <Image src={imageUrl} alt="" fill sizes="128px" className="object-cover" />
              <button type="button" onClick={() => setImageUrl(null)} className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-cream" aria-label="Remove">
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-ink-soft hover:bg-sand">
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Upload
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Sort order</label>
          <input name="sortOrder" type="number" className={FIELD} defaultValue={category?.sortOrder ?? 0} />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={category ? category.isActive : true} className="accent-clay" /> Active
        </label>
      </div>

      {error && <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={buttonClasses("primary", "md")}>
          {saving && <Loader2 className="animate-spin" size={16} />} Save category
        </button>
        <button type="button" onClick={handleDiscard} disabled={saving} className={buttonClasses("outline", "md")}>Discard changes</button>
        <button type="button" onClick={() => router.back()} className={buttonClasses("ghost", "md")}>Cancel</button>
      </div>
    </form>
  );
}
