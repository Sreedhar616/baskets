import Link from "next/link";
import { getAllOrders } from "@/lib/admin-queries";
import { formatINR } from "@/lib/utils";
import type { Order } from "@/types/db";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gold/20 text-ink",
  confirmed: "bg-sage/20 text-sage-dark",
  processing: "bg-sage/20 text-sage-dark",
  shipped: "bg-clay/15 text-clay-dark",
  delivered: "bg-sage/25 text-sage-dark",
  cancelled: "bg-ink/10 text-ink-soft",
  refunded: "bg-ink/10 text-ink-soft",
};

function shortAddress(o: Order): string {
  const a = o.shippingAddress;
  if (!a?.line1) return "—";
  return [a.line1, a.city, a.pincode].filter(Boolean).join(", ");
}

function OrderList({ orders }: { orders: Order[] }) {
  return (
    <>
      {/* Mobile: cards */}
      <ul className="mt-4 space-y-3 md:hidden">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={`/admin/orders/${o.id}`}
              className="block rounded-xl border border-border bg-cream p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{o.orderNumber}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${STATUS_COLORS[o.status] ?? ""}`}>{o.status}</span>
              </div>
              <p className="mt-1 text-sm">{o.customerName}</p>
              <p className="text-sm text-ink-soft">{o.customerPhone}</p>
              <p className="mt-1 text-sm text-ink-soft">{shortAddress(o)}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="capitalize text-ink-soft">{o.paymentMethod === "cod" ? "COD" : "Online"} · {o.paymentStatus}</span>
                <span className="font-semibold">{formatINR(o.total)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-sand/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-clay">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.customerName}<br /><span className="text-ink-soft">{o.customerPhone}</span></td>
                <td className="max-w-[220px] px-4 py-3 text-ink-soft">{shortAddress(o)}</td>
                <td className="px-4 py-3 capitalize">
                  {o.paymentMethod === "cod" ? "COD" : "Online"} · {o.paymentStatus}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${STATUS_COLORS[o.status] ?? ""}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatINR(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  const active = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const completed = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  return (
    <div>
      <h1 className="text-2xl md:text-3xl">Orders</h1>
      {!orders.length ? (
        <p className="mt-6 text-ink-soft">No orders yet.</p>
      ) : (
        <>
          <h2 className="mt-6 font-display text-lg">Active orders</h2>
          {!active.length ? (
            <p className="mt-3 text-sm text-ink-soft">No active orders — all caught up.</p>
          ) : (
            <OrderList orders={active} />
          )}

          {completed.length > 0 && (
            <details className="mt-10">
              <summary className="cursor-pointer font-display text-lg text-ink-soft hover:text-ink">
                Delivered &amp; cancelled ({completed.length})
              </summary>
              <OrderList orders={completed} />
            </details>
          )}
        </>
      )}
    </div>
  );
}
