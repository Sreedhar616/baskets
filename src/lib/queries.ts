import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import {
  sampleCategories,
  sampleProducts,
  sampleReviews,
  sampleInstagramPosts,
} from "@/lib/sample-data";
import type {
  Category,
  InstagramPost,
  Product,
  Review,
  SiteSettings,
} from "@/types/db";

/* ----------------------------- row mappers ----------------------------- */

type Row = Record<string, unknown>;

function mapCategory(r: Row): Category {
  return {
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    description: (r.description as string) ?? null,
    imageUrl: (r.image_url as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    isActive: Boolean(r.is_active),
  };
}

function mapProduct(r: Row): Product {
  const cat = (r.categories ?? null) as Row | null;
  return {
    id: String(r.id),
    categoryId: (r.category_id as string) ?? null,
    categorySlug: cat ? String(cat.slug) : null,
    categoryName: cat ? String(cat.name) : null,
    name: String(r.name),
    slug: String(r.slug),
    description: (r.description as string) ?? null,
    price: Number(r.price ?? 0),
    comparePrice: r.compare_price != null ? Number(r.compare_price) : null,
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    sizes: Array.isArray(r.sizes)
      ? (r.sizes as Array<Record<string, unknown>>)
          .filter((s) => s && s.label != null)
          .map((s) => ({ label: String(s.label), price: Number(s.price ?? 0) }))
      : [],
    stock: Number(r.stock ?? 0),
    isActive: Boolean(r.is_active),
    isFeatured: Boolean(r.is_featured),
  };
}

function mapReview(r: Row): Review {
  return {
    id: String(r.id),
    productId: (r.product_id as string) ?? null,
    authorName: String(r.author_name),
    rating: Number(r.rating ?? 5),
    body: String(r.body),
    photoUrl: (r.photo_url as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    isActive: Boolean(r.is_active),
  };
}

function mapInstagram(r: Row): InstagramPost {
  return {
    id: String(r.id),
    postUrl: String(r.post_url),
    embedHtml: (r.embed_html as string) ?? null,
    caption: (r.caption as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    isActive: Boolean(r.is_active),
  };
}

const PRODUCT_SELECT =
  "*, categories ( slug, name )";

/* ------------------------------ settings ------------------------------- */

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) return DEFAULT_SETTINGS;
    return {
      storeName: data.store_name ?? DEFAULT_SETTINGS.storeName,
      contactPhone: data.contact_phone ?? DEFAULT_SETTINGS.contactPhone,
      contactEmail: data.contact_email ?? null,
      instagramUrl: data.instagram_url ?? null,
      flatShippingFee: Number(data.flat_shipping_fee ?? 0),
      freeShippingThreshold:
        data.free_shipping_threshold != null
          ? Number(data.free_shipping_threshold)
          : null,
      codEnabled: Boolean(data.cod_enabled),
      onlinePaymentEnabled: Boolean(data.online_payment_enabled),
      announcementText: data.announcement_text ?? null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/* ----------------------------- categories ------------------------------ */

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return sampleCategories;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return sampleCategories;
    return data.map(mapCategory);
  } catch {
    return sampleCategories;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

/* ------------------------------ products ------------------------------- */

export async function getProducts(opts: {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
} = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let list = sampleProducts.filter((p) => p.isActive);
    if (opts.categorySlug)
      list = list.filter((p) => p.categorySlug === opts.categorySlug);
    if (opts.featured) list = list.filter((p) => p.isFeatured);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (opts.featured) query = query.eq("is_featured", true);
    if (opts.search) query = query.ilike("name", `%${opts.search}%`);

    const { data, error } = await query;
    if (error || !data) return [];
    let list = data.map(mapProduct);
    // Category filter applied here so we can match the joined slug.
    if (opts.categorySlug)
      list = list.filter((p) => p.categorySlug === opts.categorySlug);
    return list;
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const list = await getProducts({ featured: true });
  return list.length ? list : (await getProducts()).slice(0, 8);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return sampleProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error || !data) return null;
    return mapProduct(data);
  } catch {
    return null;
  }
}

/* ------------------------------- reviews ------------------------------- */

export async function getReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return sampleReviews;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return sampleReviews;
    return data.map(mapReview);
  } catch {
    return sampleReviews;
  }
}

/* ---------------------------- instagram -------------------------------- */

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  if (!isSupabaseConfigured()) return sampleInstagramPosts;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return sampleInstagramPosts;
    return data.map(mapInstagram);
  } catch {
    return sampleInstagramPosts;
  }
}
