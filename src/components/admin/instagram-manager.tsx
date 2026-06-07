"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus } from "lucide-react";
import { saveInstagramPost, deleteInstagramPost, type InstagramInput } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import type { InstagramPost } from "@/types/db";

const FIELD = "w-full rounded-xl border border-border bg-cream px-4 py-2.5 text-sm outline-none focus:border-clay";

export function InstagramManager({ posts }: { posts: InstagramPost[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ postUrl: "", caption: "" });

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/instagram\.com\/(p|reel|tv)\//.test(draft.postUrl)) {
      setError("Enter a full Instagram post URL, e.g. https://www.instagram.com/p/XXXX/");
      return;
    }
    const input: InstagramInput = {
      postUrl: draft.postUrl.trim(),
      caption: draft.caption,
      sortOrder: posts.length,
      isActive: true,
    };
    start(async () => {
      try {
        await saveInstagramPost(input);
        setDraft({ postUrl: "", caption: "" });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Remove this post?")) return;
    start(async () => {
      await deleteInstagramPost(id);
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="text-3xl">Instagram posts</h1>
      <p className="mt-1 text-ink-soft">
        Paste links to your Instagram posts to feature on the Happy Customers page.
      </p>

      <form onSubmit={add} className="mt-6 max-w-2xl space-y-3 rounded-2xl border border-border bg-cream p-5">
        <h2 className="font-display text-lg">Add a post</h2>
        <input className={FIELD} placeholder="https://www.instagram.com/p/XXXXXXXXX/" value={draft.postUrl} onChange={(e) => setDraft({ ...draft, postUrl: e.target.value })} required />
        <input className={FIELD} placeholder="Caption (optional)" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
        {error && <p className="text-sm text-clay-dark">{error}</p>}
        <button type="submit" disabled={pending} className={buttonClasses("primary", "sm")}>
          {pending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Add post
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-cream p-4">
            <div className="min-w-0">
              <a href={p.postUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium text-clay hover:underline">
                {p.postUrl}
              </a>
              {p.caption && <p className="truncate text-sm text-ink-soft">{p.caption}</p>}
            </div>
            <button onClick={() => remove(p.id)} className="text-ink-soft hover:text-clay" aria-label="Delete"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
