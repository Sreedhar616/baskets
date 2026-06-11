"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Loader2, Truck, XCircle, Trash2 } from "lucide-react";
import { updateOrderStatus, deleteOrder } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Order management buttons:
 * - Mark Delivered → status "delivered" (the customer-facing completed state)
 * - Cancel order   → status "cancelled"
 * - Delete         → removes the order permanently from history
 */
export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [action, setAction] = useState<string | null>(null);

  const delivered = status === "delivered";
  const cancelled = status === "cancelled";

  function setStatus(next: string, key: string) {
    setAction(key);
    start(async () => {
      await updateOrderStatus(orderId, next);
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
        onClick={() => setStatus("delivered", "delivered")}
        className={cn(buttonClasses("primary", "sm"), "bg-sage-dark hover:bg-sage-dark/90")}
      >
        {busy("delivered") ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
        {delivered ? "Delivered" : "Mark delivered"}
      </button>

      <button
        type="button"
        disabled={pending || cancelled}
        onClick={() => setStatus("cancelled", "cancelled")}
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
