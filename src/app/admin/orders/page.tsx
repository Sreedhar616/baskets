import Link from "next/link";
import { getAllOrders } from "@/lib/admin-queries";
import { formatINR } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gold/20 text-ink",
  confirmed: "bg-sage/20 text-sage-dark",
  processing: "bg-sage/20 text-sage-dark",
  shipped: "bg-clay/15 text-clay-dark",
  delivered: "bg-sage/25 text-sage-dark",
  cancelled: "bg-ink/10 text-ink-soft",
  refunded: "bg-ink/10 text-ink-soft",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="text-3xl">Orders</h1>
      {!orders.length ? (
        <p className="mt-6 text-ink-soft">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-sand text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
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
      )}
    </div>
  );
}
