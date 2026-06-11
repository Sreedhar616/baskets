import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "My Orders" };

export default async function MyOrdersPage() {
  if (!isSupabaseConfigured()) redirect("/account");
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_method, payment_status, total, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-12 md:py-16">
      <Link href="/account" className="text-sm text-clay hover:underline">← Account</Link>
      <h1 className="mt-2 text-3xl md:text-4xl">My Orders</h1>

      {!orders?.length ? (
        <p className="mt-6 text-ink-soft">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-border bg-cream p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-lg">{o.order_number}</p>
                  <p className="text-sm capitalize text-ink-soft">
                    {o.status} · {o.payment_method === "cod" ? "Cash on Delivery" : "Online"} · {o.payment_status}
                  </p>
                </div>
                <span className="text-lg font-semibold">{formatINR(Number(o.total))}</span>
              </div>
              {o.status === "delivered" && (
                <p className="mt-3 rounded-lg bg-sage/15 px-3 py-2 text-sm text-sage-dark">
                  Your order has been delivered. Thank you for shopping with us!
                </p>
              )}
              {o.status === "cancelled" && (
                <p className="mt-3 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink-soft">
                  This order was cancelled. Contact us on WhatsApp if you have any questions.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
