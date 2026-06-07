"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import { slugify, cn } from "@/lib/utils";
import type { Category, Product } from "@/types/db";

const FIELD = "w-full rounded-xl border border-border bg-cream px-4 py-2.5 text-sm outline-none focus:border-clay";
const LABEL = "block text-sm font-medium mb-1.5";

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `products/${slugify(name) || "item"}-${images.length + 1}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        setImages((prev) => [...prev, data.publicUrl]);
      }
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
    const input: ProductInput = {
      id: product?.id,
      name: String(fd.get("name")),
      slug: slugify(String(fd.get("slug")) || String(fd.get("name"))),
      categoryId: (fd.get("categoryId") as string) || null,
      priceRupees: Number(fd.get("price")),
      comparePriceRupees: fd.get("comparePrice") ? Number(fd.get("comparePrice")) : null,
      description: String(fd.get("description") || ""),
      images,
      stock: Number(fd.get("stock")),
      isActive: fd.get("isActive") === "on",
      isFeatured: fd.get("isFeatured") === "on",
    };
    try {
      await saveProduct(input);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className={LABEL}>Name</label>
        <input
          name="name"
          required
          className={FIELD}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!product) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div>
        <label className={LABEL}>Slug (URL)</label>
        <input name="slug" className={FIELD} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>

      <div>
        <label className={LABEL}>Category</label>
        <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={FIELD}>
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Price (₹)</label>
          <input name="price" type="number" min="0" step="1" required className={FIELD} defaultValue={product ? product.price / 100 : ""} />
        </div>
        <div>
          <label className={LABEL}>Compare price (₹, optional)</label>
          <input name="comparePrice" type="number" min="0" step="1" className={FIELD} defaultValue={product?.comparePrice ? product.comparePrice / 100 : ""} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Stock</label>
        <input name="stock" type="number" min="0" step="1" required className={FIELD} defaultValue={product?.stock ?? 0} />
      </div>

      <div>
        <label className={LABEL}>Description</label>
        <textarea name="description" rows={4} className={FIELD} defaultValue={product?.description ?? ""} />
      </div>

      {/* Images */}
      <div>
        <label className={LABEL}>Images</label>
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={src} className="relative h-24 w-24 overflow-hidden rounded-xl bg-sand">
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-cream"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label className={cn("flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-ink-soft hover:bg-sand", uploading && "opacity-50")}>
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Upload
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={product ? product.isActive : true} className="accent-clay" /> Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="accent-clay" /> Featured
        </label>
      </div>

      {error && <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={buttonClasses("primary", "md")}>
          {saving && <Loader2 className="animate-spin" size={16} />} Save product
        </button>
        <button type="button" onClick={() => router.back()} className={buttonClasses("outline", "md")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
