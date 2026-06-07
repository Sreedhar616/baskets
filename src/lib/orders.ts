import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, hasServiceRole } from "@/lib/env";
import { sampleProducts } from "@/lib/sample-data";
import { computeTotals } from "@/lib/pricing";
import { getSettings } from "@/lib/queries";
import type {
  PaymentMethod,
  ShippingAddress,
} from "@/types/db";

export interface CartInput {
  productId: string;
  quantity: number;
}

export interface CustomerInput {
  name: string;
  email?: string | null;
  phone: string;
}

interface ResolvedItem {
  productId: string;
  name: string;
  image: string | null;
  unitPrice: number; // paise, authoritative
  quantity: number;
  lineTotal: number;
  stock: number;
}

/**
 * Resolve cart items against authoritative product data (DB when configured,
 * otherwise local sample data). Never trusts client-supplied prices.
 */
async function resolveItems(items: CartInput[]): Promise<ResolvedItem[]> {
  const wanted = items
    .filter((i) => i.productId && i.quantity > 0)
    .map((i) => ({ productId: i.productId, quantity: Math.floor(i.quantity) }));

  if (!wanted.length) return [];

  const out: ResolvedItem[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, price, images, stock, is_active")
      .in(
        "id",
        wanted.map((w) => w.productId)
      );
    const byId = new Map((data ?? []).map((p) => [String(p.id), p]));
    for (const w of wanted) {
      const p = byId.get(w.productId);
      if (!p || !p.is_active) continue;
      const qty = Math.min(w.quantity, Math.max(Number(p.stock), 0));
      if (qty <= 0) continue;
      const unitPrice = Number(p.price);
      out.push({
        productId: String(p.id),
        name: String(p.name),
        image: Array.isArray(p.images) ? (p.images[0] ?? null) : null,
        unitPrice,
        quantity: qty,
        lineTotal: unitPrice * qty,
        stock: Number(p.stock),
      });
    }
    return out;
  }

  // Demo mode: price against local sample data.
  for (const w of wanted) {
    const p = sampleProducts.find((sp) => sp.id === w.productId);
    if (!p) continue;
    const qty = Math.min(w.quantity, Math.max(p.stock, 1));
    out.push({
      productId: p.id,
      name: p.name,
      image: p.images[0] ?? null,
      unitPrice: p.price,
      quantity: qty,
      lineTotal: p.price * qty,
      stock: p.stock,
    });
  }
  return out;
}

export interface OrderDraft {
  items: ResolvedItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
}

/** Build a priced order draft from cart input using current shipping rules. */
export async function buildOrderDraft(items: CartInput[]): Promise<OrderDraft> {
  const resolved = await resolveItems(items);
  const subtotal = resolved.reduce((s, i) => s + i.lineTotal, 0);
  const settings = await getSettings();
  const totals = computeTotals(subtotal, settings);
  return {
    items: resolved,
    subtotal: totals.subtotal,
    shippingFee: totals.shippingFee,
    taxAmount: totals.taxAmount,
    total: totals.total,
  };
}

function generateOrderNumber(): string {
  // Mirrors the DB default format DD-XXXXXXXX.
  const id = (globalThis.crypto?.randomUUID?.() ?? `${Math.random()}`)
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();
  return `DD-${id}`;
}

export interface PersistOrderArgs {
  draft: OrderDraft;
  customer: CustomerInput;
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  userId?: string | null;
  razorpayOrderId?: string | null;
}

export interface PersistedOrder {
  id: string | null;
  orderNumber: string;
  persisted: boolean;
}

/**
 * Persist the order to Supabase using the service role (bypasses RLS so pricing
 * stays server-authoritative). When the service key isn't configured yet, runs
 * in DEMO mode: returns a generated order number without writing to a DB.
 */
export async function persistOrder({
  draft,
  customer,
  address,
  paymentMethod,
  userId = null,
  razorpayOrderId = null,
}: PersistOrderArgs): Promise<PersistedOrder> {
  if (!hasServiceRole()) {
    return { id: null, orderNumber: generateOrderNumber(), persisted: false };
  }

  const supabase = createAdminClient();
  const status = paymentMethod === "cod" ? "confirmed" : "pending";

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status,
      payment_method: paymentMethod,
      payment_status: "pending",
      customer_name: customer.name,
      customer_email: customer.email ?? null,
      customer_phone: customer.phone,
      shipping_address: address,
      subtotal: draft.subtotal,
      shipping_fee: draft.shippingFee,
      tax_amount: draft.taxAmount,
      total: draft.total,
      razorpay_order_id: razorpayOrderId,
    })
    .select("id, order_number")
    .single();

  if (error || !order) {
    throw new Error(`Failed to create order: ${error?.message ?? "unknown"}`);
  }

  const itemsPayload = draft.items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.name,
    product_image: i.image,
    unit_price: i.unitPrice,
    quantity: i.quantity,
    line_total: i.lineTotal,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);
  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  // Best-effort stock decrement (COD confirms immediately).
  if (paymentMethod === "cod") {
    await decrementStock(supabase, draft.items);
  }

  return {
    id: String(order.id),
    orderNumber: String(order.order_number),
    persisted: true,
  };
}

type AdminClient = ReturnType<typeof createAdminClient>;

export async function decrementStock(
  supabase: AdminClient,
  items: { productId: string; quantity: number }[]
) {
  await Promise.all(
    items.map(async ({ productId, quantity }) => {
      const { data } = await supabase
        .from("products")
        .select("stock")
        .eq("id", productId)
        .single();
      if (data) {
        const next = Math.max(0, Number(data.stock) - quantity);
        await supabase.from("products").update({ stock: next }).eq("id", productId);
      }
    })
  );
}
