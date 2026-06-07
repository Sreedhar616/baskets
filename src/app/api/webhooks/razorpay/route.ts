import { NextResponse } from "next/server";
import { hasServiceRole } from "@/lib/env";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

// Must run on Node (uses node:crypto) and read the RAW body for signature check.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event?: string; payload?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Without the service role we can't update orders; acknowledge so Razorpay
  // stops retrying.
  if (!hasServiceRole()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const supabase = createAdminClient();
    const payment = (
      event.payload as { payment?: { entity?: Record<string, unknown> } }
    )?.payment?.entity;
    const razorpayOrderId = payment?.order_id as string | undefined;
    const razorpayPaymentId = payment?.id as string | undefined;
    if (!razorpayOrderId) return NextResponse.json({ ok: true });

    const { data: order } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();
    if (!order) return NextResponse.json({ ok: true });

    if (event.event === "payment.captured" || event.event === "order.paid") {
      if (order.payment_status !== "paid") {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            razorpay_payment_id: razorpayPaymentId ?? null,
          })
          .eq("id", order.id);
      }
    } else if (event.event === "payment.failed") {
      if (order.payment_status === "pending") {
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", order.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("razorpay webhook failed", e);
    // Return 200 so Razorpay doesn't hammer retries on transient errors.
    return NextResponse.json({ ok: false });
  }
}
