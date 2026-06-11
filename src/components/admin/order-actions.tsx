"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Loader2, Truck, XCircle, Trash2 } from "lucide-react";
import { updateOrderStatus, deleteOrder } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import { cn, whatsappLink } from "@/lib/utils";

/**
 * Order management buttons:
 * - Mark Delivered → status "delivered" + opens WhatsApp to tell the customer
 * - Cancel order   → status "cancelled" + opens WhatsApp to tell the customer
 * - Delete         → removes the order permanently from history
 */
export function OrderActions({
  orderId,
  status,
  orderNumber,
  customerName,
  customerPhone,
}: {
  orderId: string;
  status: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [action, setAction] = useState<string | null>(null);

  const delivered = status === "delivered";
  const cancelled = status === "cancelled";

  function notifyCustomer(message: string) {
    window.open(whatsappLink(customerPhone, message), "_blank", "noopener,noreferrer");
  }

  function markDelivered() {
    setAction("delivered");
    start(async () => {
      await updateOrderStatus(orderId, "delivered");
      notifyCustomer(
        `Hi ${customerName}, your D's Designs order ${orderNumber} has been delivered. Thank you for shopping with us!`
      );
      router.refresh();
    });
  }

  function cancelOrder() {
    if (!confirm("Cancel this order? The customer will be notified on WhatsApp.")) return;
    setAction("cancelled");
    start(async () => {
      await updateOrderStatus(orderId, "cancelled");
      notifyCustomer(
        `Hi ${customerName}, your D's Designs order ${orderNumber} has been cancelled. Please contact us if you have any questions.`
      );
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Delete this order permanently? This cannot be undone.")) return;
    setAction("delete");
    start(async () => {
      await deleteOrder(orderId);
      router.push("/admin/orders");
      router.refresh();
    });
  }

  const busy = (key: string) => pending && action === key;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending || delivered}
        onClick={markDelivered}
        className={cn(buttonClasses("primary", "sm"), "bg-sage-dark hover:bg-sage-dark/90")}
      >
        {busy("delivered") ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
        {delivered ? "Delivered" : "Mark delivered"}
      </button>

      <button
        type="button"
        disabled={pending || cancelled || delivered}
        onClick={cancelOrder}
        className={buttonClasses("outline", "sm")}
      >
        {busy("cancelled") ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
        {cancelled ? "Cancelled" : "Cancel order"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className={cn(buttonClasses("outline", "sm"), "border-red-200 text-red-600 hover:bg-red-50")}
      >
        {busy("delete") ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        Delete
      </button>
    </div>
  );
}
