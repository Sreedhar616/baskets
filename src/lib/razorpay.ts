import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env, isRazorpayConfigured } from "@/lib/env";

export { isRazorpayConfigured };

/** Lazily construct the Razorpay SDK client (server only). */
export function getRazorpay(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured");
  }
  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
}

/** Create a Razorpay order for the given amount (paise). */
export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const rzp = getRazorpay();
  return rzp.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
  });
}

/**
 * Verify the checkout signature returned to the browser:
 * HMAC_SHA256(order_id|payment_id, key_secret) === signature.
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

/**
 * Verify a webhook payload against the raw request body:
 * HMAC_SHA256(rawBody, webhook_secret) === X-Razorpay-Signature.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature || !env.razorpayWebhookSecret) return false;
  const expected = crypto
    .createHmac("sha256", env.razorpayWebhookSecret)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
