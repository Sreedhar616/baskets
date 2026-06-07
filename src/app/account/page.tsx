import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, MapPin, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { buttonClasses } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl">Accounts coming soon</h1>
        <p className="mt-2 text-ink-soft">
          Sign in will be available once Supabase is connected (see setup.md).
        </p>
        <Link href="/products" className={buttonClasses("primary", "lg", "mt-6")}>
          Continue shopping
        </Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl">My Account</h1>
          <p className="mt-1 text-ink-soft">
            {user.fullName ? `${user.fullName} · ` : ""}{user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <Link href="/admin" className={buttonClasses("secondary", "sm")}>
              <ShieldCheck size={16} /> Admin
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders" className="flex items-center gap-3 rounded-2xl border border-border bg-cream p-5 hover:bg-sand">
          <Package className="text-clay" /> <span className="font-medium">My Orders</span>
        </Link>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-cream p-5">
          <MapPin className="text-clay" /> <span className="font-medium">Addresses are saved with each order</span>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">Recent orders</h2>
        {!orders?.length ? (
          <p className="mt-3 text-ink-soft">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-sm capitalize text-ink-soft">{o.status}</p>
                </div>
                <span className="font-semibold">{formatINR(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
