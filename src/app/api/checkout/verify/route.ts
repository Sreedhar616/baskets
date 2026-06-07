import { NextResponse } from "next/server";
import { hasServiceRole } from "@/lib/env";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrementStock } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/notifications";
import type { ShippingAddress } from "@/types/db";

export const runtime = "nodejs";

interface Body {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderNumber?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderNumber } =
    body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const valid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Demo mode (no DB): signature is valid, nothing to persist.
  if (!hasServiceRole()) {
    return NextResponse.json({ ok: true, orderNumber, demo: true });
  }

  try {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotent: only act on the first successful verification.
    if (order.payment_status !== "paid") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        })
        .eq("id", order.id);

      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, product_name, unit_price, quantity, line_total")
        .eq("order_id", order.id);

      await decrementStock(
        supabase,
        (items ?? []).map((i) => ({
          productId: String(i.product_id),
          quantity: Number(i.quantity),
        }))
      );

      await sendOrderEmails({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        paymentMethod: "razorpay",
        items: (items ?? []).map((i) => ({
          name: i.product_name,
          quantity: Number(i.quantity),
          lineTotal: Number(i.line_total),
        })),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shipping_fee),
        total: Number(order.total),
        address: order.shipping_address as ShippingAddress,
      });
    }

    return NextResponse.json({ ok: true, orderNumber: order.order_number });
  } catch (e) {
    console.error("verify failed", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
