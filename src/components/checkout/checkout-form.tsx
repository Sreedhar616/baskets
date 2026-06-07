"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { buttonClasses } from "@/components/ui/button";
import { formatINR, cn } from "@/lib/utils";
import { computeTotals } from "@/lib/pricing";
import { SITE } from "@/lib/constants";
import type { PaymentMethod, SiteSettings } from "@/types/db";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (r: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const FIELD =
  "w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none focus:border-clay";

export function CheckoutForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const subtotal = useCart((s) => s.subtotal());
  const totals = computeTotals(subtotal, settings);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const onlineAvailable = settings.onlinePaymentEnabled;
  const [method, setMethod] = useState<PaymentMethod>(
    settings.codEnabled ? "cod" : "razorpay"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl">Your cart is empty</h1>
        <Link href="/products" className={buttonClasses("primary", "lg", "mt-6")}>
          Shop the collection
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer: { name: form.name, email: form.email, phone: form.phone },
        address: {
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        paymentMethod: method,
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      // COD — straight to confirmation.
      if (method === "cod") {
        clear();
        router.push(
          `/checkout/success?order=${encodeURIComponent(data.orderNumber)}&total=${data.total}`
        );
        return;
      }

      // Online — open Razorpay Checkout.
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        setError("Could not load the payment window. Please try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: SITE.name,
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpay.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#a85a3c" },
        handler: async (resp) => {
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
              orderNumber: data.orderNumber,
            }),
          });
          if (verify.ok) {
            clear();
            router.push(
              `/checkout/success?order=${encodeURIComponent(data.orderNumber)}&total=${data.razorpay.amount}&paid=1`
            );
          } else {
            setError("Payment could not be verified. Please contact us.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-3xl md:text-4xl">Checkout</h1>

      <form
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]"
        onSubmit={(e) => {
          e.preventDefault();
          placeOrder();
        }}
      >
        <div className="space-y-8">
          {/* Contact */}
          <section>
            <h2 className="font-display text-xl">Contact details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={FIELD} placeholder="Full name *" required value={form.name} onChange={(e) => update("name", e.target.value)} />
              <input className={FIELD} placeholder="Phone number *" required inputMode="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              <input className={cn(FIELD, "sm:col-span-2")} placeholder="Email (for order confirmation)" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="font-display text-xl">Shipping address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={cn(FIELD, "sm:col-span-2")} placeholder="Address line 1 *" required value={form.line1} onChange={(e) => update("line1", e.target.value)} />
              <input className={cn(FIELD, "sm:col-span-2")} placeholder="Address line 2 (optional)" value={form.line2} onChange={(e) => update("line2", e.target.value)} />
              <input className={FIELD} placeholder="City *" required value={form.city} onChange={(e) => update("city", e.target.value)} />
              <input className={FIELD} placeholder="State *" required value={form.state} onChange={(e) => update("state", e.target.value)} />
              <input className={FIELD} placeholder="Pincode *" required inputMode="numeric" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-display text-xl">Payment method</h2>
            <div className="mt-4 space-y-3">
              {settings.codEnabled && (
                <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4", method === "cod" ? "border-clay bg-clay/5" : "border-border")}>
                  <input type="radio" name="pay" checked={method === "cod"} onChange={() => setMethod("cod")} className="mt-1 accent-clay" />
                  <span>
                    <span className="font-medium">Cash on Delivery</span>
                    <span className="block text-sm text-ink-soft">Pay in cash when your order arrives.</span>
                  </span>
                </label>
              )}
              {onlineAvailable && (
                <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4", method === "razorpay" ? "border-clay bg-clay/5" : "border-border")}>
                  <input type="radio" name="pay" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} className="mt-1 accent-clay" />
                  <span>
                    <span className="font-medium">Pay online (UPI / Card)</span>
                    <span className="block text-sm text-ink-soft">Secure payment via Razorpay.</span>
                  </span>
                </label>
              )}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-sand p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl">Your order</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 text-sm">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <Image src={i.image ?? "/products/1.jpg"} alt={i.name} fill sizes="48px" className="object-cover" />
                </div>
                <span className="flex-1">{i.name} × {i.quantity}</span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{totals.shippingFee === 0 ? "Free" : formatINR(totals.shippingFee)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatINR(totals.total)}</dd></div>
          </dl>

          {error && <p className="mt-4 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>}

          <button type="submit" disabled={loading} className={buttonClasses("primary", "lg", "mt-5 w-full")}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {method === "cod" ? "Place order" : `Pay ${formatINR(totals.total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">
            By placing this order you agree to be contacted about it.
          </p>
        </aside>
      </form>
    </div>
  );
}
