import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin-queries";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/button";
import { formatINR, whatsappLink } from "@/lib/utils";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const addr = order.shippingAddress;
  const wa = whatsappLink(
    order.customerPhone,
    `Hi ${order.customerName}, this is D's Designs about your order ${order.orderNumber}.`
  );

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-clay hover:underline">← Orders</Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">{order.orderNumber}</h1>
          <p className="text-ink-soft">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} current={order.status} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Customer */}
        <section className="rounded-2xl border border-border bg-cream p-5">
          <h2 className="font-display text-lg">Customer</h2>
          <p className="mt-2">{order.customerName}</p>
          <p className="text-ink-soft">{order.customerPhone}</p>
          {order.customerEmail && <p className="text-ink-soft">{order.customerEmail}</p>}
          <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "sm", "mt-4")}>
            <WhatsAppIcon size={16} /> WhatsApp customer
          </a>
        </section>

        {/* Shipping */}
        <section className="rounded-2xl border border-border bg-cream p-5">
          <h2 className="font-display text-lg">Shipping address</h2>
          <p className="mt-2">{addr.line1}</p>
          {addr.line2 && <p>{addr.line2}</p>}
          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
        </section>
      </div>

      {/* Items */}
      <section className="mt-6 rounded-2xl border border-border bg-cream p-5">
        <h2 className="font-display text-lg">Items</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between py-2.5 text-sm">
              <span>{i.productName} × {i.quantity}</span>
              <span>{formatINR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}</dd></div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
        </dl>
        <p className="mt-3 text-sm capitalize text-ink-soft">
          Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"} · {order.paymentStatus}
        </p>
      </section>
    </div>
  );
}
