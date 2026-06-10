import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, env } from "@/lib/env";
import { buildOrderDraft, persistOrder } from "@/lib/orders";
import { getSettings } from "@/lib/queries";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { sendOrderEmails } from "@/lib/notifications";
import type { PaymentMethod, ShippingAddress } from "@/types/db";

export const runtime = "nodejs";

interface Body {
  items?: { productId: string; quantity: number; size?: string | null }[];
  customer?: { name?: string; email?: string; phone?: string };
  address?: Partial<ShippingAddress>;
  paymentMethod?: PaymentMethod;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return bad("Invalid request body");
  }

  const items = (body.items ?? []).filter((i) => i?.productId && i.quantity > 0);
  if (!items.length) return bad("Your cart is empty");

  const c = body.customer ?? {};
  if (!c.name?.trim()) return bad("Name is required");
  if (!c.phone?.trim() || c.phone.replace(/\D/g, "").length < 10)
    return bad("A valid phone number is required");

  const a = body.address ?? {};
  for (const field of ["line1", "city", "state", "pincode"] as const) {
    if (!a[field]?.toString().trim()) return bad(`Address ${field} is required`);
  }

  const settings = await getSettings();
  const paymentMethod: PaymentMethod =
    body.paymentMethod === "razorpay" ? "razorpay" : "cod";

  if (paymentMethod === "cod" && !settings.codEnabled)
    return bad("Cash on Delivery is currently unavailable");
  if (paymentMethod === "razorpay" && !settings.onlinePaymentEnabled)
    return bad("Online payment is currently unavailable");

  // Server-authoritative pricing (priced for the chosen payment method).
  const draft = await buildOrderDraft(items, paymentMethod);
  if (!draft.items.length) return bad("None of the items are available");

  // Attach the logged-in user, if any.
  let userId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }
  }

  const address: ShippingAddress = {
    line1: a.line1!.toString().trim(),
    line2: a.line2?.toString().trim() || null,
    city: a.city!.toString().trim(),
    state: a.state!.toString().trim(),
    pincode: a.pincode!.toString().trim(),
  };
  const customer = {
    name: c.name!.trim(),
    email: c.email?.trim() || null,
    phone: c.phone!.trim(),
  };

  /* ------------------------- Online (Razorpay) ------------------------- */
  if (paymentMethod === "razorpay") {
    if (!isRazorpayConfigured()) {
      return bad(
        "Online payment isn't set up yet. Please choose Cash on Delivery.",
        503
      );
    }
    try {
      const persisted = await persistOrder({
        draft,
        customer,
        address,
        paymentMethod,
        userId,
      });
      const rzpOrder = await createRazorpayOrder(draft.total, persisted.orderNumber);

      // Store the Razorpay order id against our order (when persisted).
      if (persisted.persisted && persisted.id) {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        await createAdminClient()
          .from("orders")
          .update({ razorpay_order_id: rzpOrder.id })
          .eq("id", persisted.id);
      }

      return NextResponse.json({
        orderNumber: persisted.orderNumber,
        razorpay: {
          orderId: rzpOrder.id,
          amount: draft.total,
          currency: "INR",
          keyId: env.razorpayPublicKeyId || env.razorpayKeyId,
        },
        customer,
      });
    } catch (e) {
      console.error("create-order (razorpay) failed", e);
      return bad("Could not start payment. Please try again.", 500);
    }
  }

  /* ------------------------------- COD --------------------------------- */
  try {
    const persisted = await persistOrder({
      draft,
      customer,
      address,
      paymentMethod: "cod",
      userId,
    });

    await sendOrderEmails({
      orderNumber: persisted.orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      paymentMethod: "cod",
      items: draft.items.map((i) => ({
        name: i.size ? `${i.name} (${i.size})` : i.name,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
      subtotal: draft.subtotal,
      shippingFee: draft.shippingFee,
      total: draft.total,
      address,
    });

    return NextResponse.json({
      orderNumber: persisted.orderNumber,
      method: "cod",
      total: draft.total,
    });
  } catch (e) {
    console.error("create-order (cod) failed", e);
    return bad("Could not place your order. Please try again.", 500);
  }
}
