"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { updateOrderStatus } from "@/app/admin/actions";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [value, setValue] = useState(current);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function onChange(next: string) {
    setValue(next);
    setSaved(false);
    start(async () => {
      await updateOrderStatus(orderId, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-cream px-3 py-2 text-sm capitalize outline-none focus:border-clay"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">{s}</option>
        ))}
      </select>
      {pending && <Loader2 className="animate-spin text-ink-soft" size={16} />}
      {saved && <Check className="text-sage" size={16} />}
    </div>
  );
}
