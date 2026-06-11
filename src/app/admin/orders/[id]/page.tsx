import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin-queries";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderActions } from "@/components/admin/order-actions";
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

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl">{order.orderNumber}</h1>
          <p className="text-sm text-ink-soft">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} current={order.status} />
      </div>

      {/* Quick actions */}
      <div className="mt-4">
        <OrderActions
          orderId={order.id}
          status={order.status}
          orderNumber={order.orderNumber}
          customerName={order.customerName}
          customerPhone={order.customerPhone}
        />
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

        {/* Shipping / location */}
        <section className="rounded-2xl border border-border bg-cream p-5">
          <h2 className="font-display text-lg">Delivery location</h2>
          <p className="mt-2">{addr.line1}</p>
          {addr.line2 && <p>{addr.line2}</p>}
          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${addr.line1}, ${addr.line2 ? addr.line2 + ", " : ""}${addr.city}, ${addr.state} ${addr.pincode}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("outline", "sm", "mt-4")}
          >
            View on map
          </a>
        </section>
      </div>

      {/* Items */}
      <section className="mt-6 rounded-2xl border border-border bg-cream p-5">
        <h2 className="font-display text-lg">Items ordered</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3 text-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                {i.productImage && (
                  <Image src={i.productImage} alt="" fill sizes="56px" className="object-contain p-1" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{i.productName}</p>
                <p className="text-ink-soft">Qty {i.quantity} · {formatINR(i.unitPrice)} each</p>
              </div>
              <span className="font-semibold">{formatINR(i.lineTotal)}</span>
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
