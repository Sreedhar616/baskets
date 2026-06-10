"use client";

import { useRef, useState } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  // Availability is a simple on/off switch. New products default to in stock.
  const [available, setAvailable] = useState<boolean>(
    product ? product.stock > 0 : true
  );
  // Size variants (label + online/cod price in rupees). Empty = no sizes.
  const initialSizes = (product?.sizes ?? []).map((s) => ({
    label: s.label,
    online: String(s.online / 100),
    cod: String(s.cod / 100),
  }));
  const [sizes, setSizes] = useState<{ label: string; online: string; cod: string }[]>(
    initialSizes
  );

  function addSize() {
    setSizes((prev) => [...prev, { label: "", online: "", cod: "" }]);
  }
  function updateSize(i: number, key: "label" | "online" | "cod", value: string) {
    setSizes((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  }
  function removeSize(i: number) {
    setSizes((prev) => prev.filter((_, idx) => idx !== i));
  }

  /** Reset every field back to the product's saved values (or blank for a new product). */
  function handleDiscard() {
    setName(product?.name ?? "");
    setSlug(product?.slug ?? "");
    setAvailable(product ? product.stock > 0 : true);
    setSizes(initialSizes);
    setImages(product?.images ?? []);
    setError(null);
    formRef.current?.reset();
  }

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
      codPriceRupees: Number(fd.get("codPrice")) || Number(fd.get("price")),
      comparePriceRupees: fd.get("comparePrice") ? Number(fd.get("comparePrice")) : null,
      description: String(fd.get("description") || ""),
      images,
      sizes: sizes
        .filter((s) => s.label.trim() !== "")
        .map((s) => ({
          label: s.label.trim(),
          onlineRupees: Number(s.online) || 0,
          codRupees: Number(s.cod) || Number(s.online) || 0,
        })),
      // In stock → a non-zero value; out of stock → 0. We no longer count units.
      stock: available ? 1 : 0,
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
    <form ref={formRef} onSubmit={onSubmit} className="max-w-2xl space-y-5">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL}>Online price (₹)</label>
          <input name="price" type="number" min="0" step="1" required className={FIELD} defaultValue={product ? product.price / 100 : ""} />
        </div>
        <div>
          <label className={LABEL}>COD price (₹)</label>
          <input name="codPrice" type="number" min="0" step="1" className={FIELD} defaultValue={product ? product.codPrice / 100 : ""} placeholder="same as online" />
        </div>
        <div>
          <label className={LABEL}>Compare price (₹, optional)</label>
          <input name="comparePrice" type="number" min="0" step="1" className={FIELD} defaultValue={product?.comparePrice ? product.comparePrice / 100 : ""} />
        </div>
      </div>

      {/* Sizes — optional. Leave empty for products sold without sizes. */}
      <div>
        <label className={LABEL}>Sizes (optional)</label>
        <p className="-mt-1 mb-2 text-xs text-ink-soft">
          Add sizes only if this product has them (e.g. bags). Each size has its own
          Online and COD price. Leave empty to sell at the prices above with no size choice.
        </p>
        <div className="space-y-2">
          {sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="Size (e.g. Small)"
                className={cn(FIELD, "flex-1")}
                value={s.label}
                onChange={(e) => updateSize(i, "label", e.target.value)}
              />
              <input
                placeholder="Online ₹"
                type="number"
                min="0"
                step="1"
                className={cn(FIELD, "w-24")}
                value={s.online}
                onChange={(e) => updateSize(i, "online", e.target.value)}
              />
              <input
                placeholder="COD ₹"
                type="number"
                min="0"
                step="1"
                className={cn(FIELD, "w-24")}
                value={s.cod}
                onChange={(e) => updateSize(i, "cod", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSize(i)}
                className="shrink-0 rounded-lg p-2 text-ink-soft hover:bg-sand hover:text-clay-dark"
                aria-label="Remove size"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSize}
            className={cn(buttonClasses("outline", "sm"), "mt-1")}
          >
            + Add size
          </button>
        </div>
      </div>

      <div>
        <label className={LABEL}>Availability</label>
        <label className="flex items-center gap-3 rounded-xl border border-border bg-cream px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="h-4 w-4 accent-clay"
          />
          <span>
            {available ? (
              <>In stock — customers can buy this</>
            ) : (
              <span className="text-red-600">Out of stock — shows “Sold out”, can’t be bought</span>
            )}
          </span>
        </label>
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

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={buttonClasses("primary", "md")}>
          {saving && <Loader2 className="animate-spin" size={16} />} Save product
        </button>
        <button type="button" onClick={handleDiscard} disabled={saving} className={buttonClasses("outline", "md")}>
          Discard changes
        </button>
        <button type="button" onClick={() => router.back()} className={buttonClasses("ghost", "md")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
