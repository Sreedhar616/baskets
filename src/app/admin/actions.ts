"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { rupeesToPaise } from "@/lib/utils";

async function adminClient() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");
  return createClient();
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin", "layout");
}

/* ------------------------------ Products ------------------------------- */

export interface ProductInput {
  id?: string;
  name: string;
  slug: string;
  categoryId: string | null;
  priceRupees: number;
  comparePriceRupees?: number | null;
  description?: string | null;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}

export async function saveProduct(input: ProductInput) {
  const supabase = await adminClient();
  const row = {
    name: input.name,
    slug: input.slug,
    category_id: input.categoryId,
    price: rupeesToPaise(input.priceRupees),
    compare_price:
      input.comparePriceRupees != null && input.comparePriceRupees > 0
        ? rupeesToPaise(input.comparePriceRupees)
        : null,
    description: input.description ?? null,
    images: input.images,
    stock: Math.max(0, Math.floor(input.stock)),
    is_active: input.isActive,
    is_featured: input.isFeatured,
  };

  const { error } = input.id
    ? await supabase.from("products").update(row).eq("id", input.id)
    : await supabase.from("products").insert(row);
  if (error) throw new Error(error.message);
  revalidateStore();
}

export async function deleteProduct(id: string) {
  const supabase = await adminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStore();
}

/* ----------------------------- Categories ------------------------------ */

export interface CategoryInput {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export async function saveCategory(input: CategoryInput) {
  const supabase = await adminClient();
  const row = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    sort_order: Math.floor(input.sortOrder),
    is_active: input.isActive,
  };
  const { error } = input.id
    ? await supabase.from("categories").update(row).eq("id", input.id)
    : await supabase.from("categories").insert(row);
  if (error) throw new Error(error.message);
  revalidateStore();
}

export async function deleteCategory(id: string) {
  const supabase = await adminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStore();
}

/* ------------------------------- Orders -------------------------------- */

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await adminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

/* ------------------------------- Reviews ------------------------------- */

export interface ReviewInput {
  id?: string;
  authorName: string;
  rating: number;
  body: string;
  photoUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export async function saveReview(input: ReviewInput) {
  const supabase = await adminClient();
  const row = {
    author_name: input.authorName,
    rating: Math.min(5, Math.max(1, Math.floor(input.rating))),
    body: input.body,
    photo_url: input.photoUrl ?? null,
    sort_order: Math.floor(input.sortOrder),
    is_active: input.isActive,
  };
  const { error } = input.id
    ? await supabase.from("reviews").update(row).eq("id", input.id)
    : await supabase.from("reviews").insert(row);
  if (error) throw new Error(error.message);
  revalidateStore();
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  const supabase = await adminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
}

/* ----------------------------- Instagram ------------------------------- */

export interface InstagramInput {
  id?: string;
  postUrl: string;
  caption?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export async function saveInstagramPost(input: InstagramInput) {
  const supabase = await adminClient();
  const row = {
    post_url: input.postUrl,
    caption: input.caption ?? null,
    sort_order: Math.floor(input.sortOrder),
    is_active: input.isActive,
  };
  const { error } = input.id
    ? await supabase.from("instagram_posts").update(row).eq("id", input.id)
    : await supabase.from("instagram_posts").insert(row);
  if (error) throw new Error(error.message);
  revalidatePath("/happy-customers");
  revalidatePath("/admin/instagram");
}

export async function deleteInstagramPost(id: string) {
  const supabase = await adminClient();
  const { error } = await supabase.from("instagram_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/happy-customers");
  revalidatePath("/admin/instagram");
}

/* ------------------------------ Settings ------------------------------- */

export interface SettingsInput {
  storeName: string;
  contactPhone: string;
  contactEmail?: string | null;
  instagramUrl?: string | null;
  flatShippingRupees: number;
  freeShippingThresholdRupees?: number | null;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  announcementText?: string | null;
}

export async function saveSettings(input: SettingsInput) {
  const supabase = await adminClient();
  const row = {
    store_name: input.storeName,
    contact_phone: input.contactPhone,
    contact_email: input.contactEmail ?? null,
    instagram_url: input.instagramUrl ?? null,
    flat_shipping_fee: rupeesToPaise(input.flatShippingRupees),
    free_shipping_threshold:
      input.freeShippingThresholdRupees != null && input.freeShippingThresholdRupees > 0
        ? rupeesToPaise(input.freeShippingThresholdRupees)
        : null,
    cod_enabled: input.codEnabled,
    online_payment_enabled: input.onlinePaymentEnabled,
    announcement_text: input.announcementText ?? null,
  };
  const { error } = await supabase.from("site_settings").update(row).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
