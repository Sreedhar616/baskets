import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [orders, products, recent] = await Promise.all([
    supabase.from("orders").select("status, payment_status, total"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const allOrders = orders.data ?? [];
  const revenue = allOrders
    .filter((o) => o.payment_status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + Number(o.total), 0);
  const newCount = allOrders.filter((o) => o.status === "confirmed" || o.status === "pending").length;

  const stats = [
    { label: "Total orders", value: allOrders.length },
    { label: "Needs action", value: newCount },
    { label: "Products", value: products.count ?? 0 },
    { label: "Revenue (paid)", value: formatINR(revenue) },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-cream p-5">
            <p className="text-sm text-ink-soft">{s.label}</p>
            <p className="mt-1 font-display text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-2xl">Recent orders</h2>
        <Link href="/admin/orders" className="text-sm text-clay hover:underline">View all →</Link>
      </div>

      {!recent.data?.length ? (
        <p className="mt-4 text-ink-soft">No orders yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
          {recent.data.map((o) => (
            <li key={o.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-clay">
                  {o.order_number}
                </Link>
                <p className="text-sm capitalize text-ink-soft">{o.customer_name} · {o.status}</p>
              </div>
              <span className="font-semibold">{formatINR(Number(o.total))}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
