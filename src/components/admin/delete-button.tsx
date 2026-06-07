"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

/** Confirm-then-delete button. `action` is a server action bound to delete by id. */
export function DeleteButton({
  id,
  action,
  message = "Delete this item? This cannot be undone.",
}: {
  id: string;
  action: (id: string) => Promise<void>;
  message?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(message)) return;
        start(async () => {
          try {
            await action(id);
            router.refresh();
          } catch {
            setErr(true);
          }
        });
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-clay/10 hover:text-clay-dark"
      aria-label="Delete"
      title={err ? "Delete failed" : "Delete"}
    >
      {pending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
    </button>
  );
}
