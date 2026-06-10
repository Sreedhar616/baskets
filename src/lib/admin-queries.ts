import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  InstagramPost,
  Order,
  OrderItem,
  Product,
  Review,
  ShippingAddress,
} from "@/types/db";

/* These run inside the admin layout (already gated to admins). RLS admin
   policies return all rows including inactive ones. */

type Row = Record<string, unknown>;

function product(r: Row): Product {
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

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories ( slug, name )")
    .order("created_at", { ascending: false });
  return (data ?? []).map(product);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories ( slug, name )")
    .eq("id", id)
    .single();
  return data ? product(data) : null;
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    description: (r.description as string) ?? null,
    imageUrl: (r.image_url as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    isActive: Boolean(r.is_active),
  }));
}

export async function getAllReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []).map((r) => ({
    id: String(r.id),
    productId: (r.product_id as string) ?? null,
    authorName: String(r.author_name),
    rating: Number(r.rating ?? 5),
    body: String(r.body),
    photoUrl: (r.photo_url as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    isActive: Boolean(r.is_active),
  }));
}

export async function getAllInstagram(): Promise<InstagramPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("instagram_posts")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []).map((r) => ({
    id: String(r.id),
    postUrl: String(r.post_url),
    embedHtml: (r.embed_html as string) ?? null,
    caption: (r.caption as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    isActive: Boolean(r.is_active),
  }));
}

function order(r: Row): Order {
  return {
    id: String(r.id),
    orderNumber: String(r.order_number),
    userId: (r.user_id as string) ?? null,
    status: r.status as Order["status"],
    paymentMethod: r.payment_method as Order["paymentMethod"],
    paymentStatus: r.payment_status as Order["paymentStatus"],
    customerName: String(r.customer_name),
    customerEmail: (r.customer_email as string) ?? null,
    customerPhone: String(r.customer_phone),
    shippingAddress: (r.shipping_address ?? {}) as ShippingAddress,
    subtotal: Number(r.subtotal ?? 0),
    shippingFee: Number(r.shipping_fee ?? 0),
    taxAmount: Number(r.tax_amount ?? 0),
    total: Number(r.total ?? 0),
    razorpayOrderId: (r.razorpay_order_id as string) ?? null,
    razorpayPaymentId: (r.razorpay_payment_id as string) ?? null,
    notes: (r.notes as string) ?? null,
    createdAt: String(r.created_at),
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(order);
}

export async function getOrderById(
  id: string
): Promise<(Order & { items: OrderItem[] }) | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!data) return null;
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);
  return {
    ...order(data),
    items: (items ?? []).map((i) => ({
      id: String(i.id),
      productId: (i.product_id as string) ?? null,
      productName: String(i.product_name),
      productImage: (i.product_image as string) ?? null,
      unitPrice: Number(i.unit_price),
      quantity: Number(i.quantity),
      lineTotal: Number(i.line_total),
    })),
  };
}
