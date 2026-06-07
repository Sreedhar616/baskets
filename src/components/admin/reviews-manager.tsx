"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus } from "lucide-react";
import { saveReview, deleteReview, type ReviewInput } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import type { Review } from "@/types/db";

const FIELD = "w-full rounded-xl border border-border bg-cream px-4 py-2.5 text-sm outline-none focus:border-clay";

export function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ authorName: "", rating: 5, body: "" });

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input: ReviewInput = {
      authorName: draft.authorName,
      rating: draft.rating,
      body: draft.body,
      sortOrder: reviews.length,
      isActive: true,
    };
    start(async () => {
      try {
        await saveReview(input);
        setDraft({ authorName: "", rating: 5, body: "" });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    start(async () => {
      await deleteReview(id);
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="text-3xl">Reviews</h1>
      <p className="mt-1 text-ink-soft">Post older customer reviews to show on the site.</p>

      <form onSubmit={add} className="mt-6 max-w-2xl space-y-3 rounded-2xl border border-border bg-cream p-5">
        <h2 className="font-display text-lg">Add a review</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={FIELD} placeholder="Customer name" value={draft.authorName} onChange={(e) => setDraft({ ...draft, authorName: e.target.value })} required />
          <select className={FIELD} value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
          </select>
        </div>
        <textarea className={FIELD} rows={3} placeholder="Review text" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} required />
        {error && <p className="text-sm text-clay-dark">{error}</p>}
        <button type="submit" disabled={pending} className={buttonClasses("primary", "sm")}>
          {pending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Add review
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-cream p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.authorName}</span>
                <Stars rating={r.rating} size={14} />
              </div>
              <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
            </div>
            <button onClick={() => remove(r.id)} className="text-ink-soft hover:text-clay" aria-label="Delete"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
